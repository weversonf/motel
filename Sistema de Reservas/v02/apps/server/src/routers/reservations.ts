import { Hono } from "hono";
import { eq, and, gte, lte, ne, or, sql, desc, asc } from "drizzle-orm";
import { db } from "../db";
import { reservations, suites, motels, reservationStatusEnum } from "../db/schema";
import { getSession, requireAuth, requireRole } from "../middleware/auth";
import { notificarNovaReserva } from "../lib/telegram";
import { enviarEmailNotificacao } from "../lib/email";

export const reservationsRouter = new Hono();

// ── LIST ──────────────────────────────────────────────
reservationsRouter.get("/", getSession, async (c) => {
  const { data_reserva, motel_id, status, cpf, limit = "100" } = c.req.query();

  const conditions = [];

  if (data_reserva) conditions.push(eq(reservations.dataReserva, data_reserva));
  if (motel_id) conditions.push(eq(reservations.motelId, motel_id));
  if (status) conditions.push(eq(reservations.status, status as typeof reservationStatusEnum.enumValues[number]));
  if (cpf) conditions.push(eq(reservations.clienteCpf, cpf));

  const result = await db
    .select({
      id: reservations.id,
      motelId: reservations.motelId,
      suiteId: reservations.suiteId,
      clienteNome: reservations.clienteNome,
      clienteCpf: reservations.clienteCpf,
      duracao: reservations.duracao,
      preco: reservations.preco,
      precoOriginal: reservations.precoOriginal,
      promocao: reservations.promocao,
      dataReserva: reservations.dataReserva,
      horaChegada: reservations.horaChegada,
      protocolo: reservations.protocolo,
      status: reservations.status,
      paymentId: reservations.paymentId,
      origem: reservations.origem,
      criadoEm: reservations.criadoEm,
      statusAtualizadoEm: reservations.statusAtualizadoEm,
      statusOrigem: reservations.statusOrigem,
      suiteNome: suites.nome,
      motelNome: motels.nome,
    })
    .from(reservations)
    .leftJoin(suites, eq(reservations.suiteId, suites.id))
    .leftJoin(motels, eq(reservations.motelId, motels.id))
    .where(and(...conditions))
    .orderBy(desc(reservations.criadoEm))
    .limit(parseInt(limit));

  return c.json(result);
});

// ── GET BY ID ─────────────────────────────────────────
reservationsRouter.get("/:id", getSession, async (c) => {
  const id = c.req.param("id");
  const result = await db.query.reservations.findFirst({
    where: eq(reservations.id, id),
    with: {
      suite: true,
      motel: true,
    },
  });

  if (!result) return c.json({ error: "Reserva não encontrada" }, 404);
  return c.json(result);
});

// ── CREATE ────────────────────────────────────────────
reservationsRouter.post("/", async (c) => {
  const body = await c.req.json();
  const {
    id,
    motel_id,
    suite_id,
    cliente_nome,
    cliente_cpf,
    duracao,
    preco,
    preco_original,
    promocao,
    data_reserva,
    hora_chegada,
    protocolo,
    status,
    origem,
    token_asaas,
    modo_teste,
  } = body;

  if (!motel_id || !suite_id || !cliente_nome || !cliente_cpf || !duracao || !preco || !data_reserva || !hora_chegada) {
    return c.json({ error: "Campos obrigatórios faltando" }, 400);
  }

  // ── disponibilidade ──
  const conflitantes = await db
    .select({ id: reservations.id })
    .from(reservations)
    .where(
      and(
        eq(reservations.suiteId, suite_id),
        eq(reservations.dataReserva, data_reserva),
        eq(reservations.status, "confirmado")
      )
    )
    .limit(999);

  const suiteData = await db.query.suites.findFirst({
    where: eq(suites.id, suite_id),
  });

  if (suiteData && conflitantes.length >= (suiteData.qtde ?? 1)) {
    return c.json({ error: "Suíte indisponível neste horário" }, 409);
  }

  const [nova] = await db
    .insert(reservations)
    .values({
      id: id || crypto.randomUUID(),
      motelId: motel_id,
      suiteId: suite_id,
      clienteNome: cliente_nome,
      clienteCpf: cliente_cpf,
      duracao,
      preco: preco.toString(),
      precoOriginal: preco_original?.toString(),
      promocao: promocao || "nenhuma",
      dataReserva: data_reserva,
      horaChegada: hora_chegada,
      protocolo,
      status: status || "aguardando_pagamento",
      origem: origem || "chat_web",
      tokenAsaas: token_asaas || null,
      modoTeste: modo_teste || false,
      criadoEm: new Date(),
    })
    .returning();

  // Notificações assíncronas (fire-and-forget)
  if (nova) {
    const motelData = await db.query.motels.findFirst({ where: eq(motels.id, motel_id) });
    notificarNovaReserva({
      cliente_nome,
      cliente_cpf,
      motel: motelData?.nome || motel_id,
      suite: suiteData?.nome || suite_id,
      data_reserva,
      hora_chegada,
      duracao,
      preco,
      status: nova.status,
      protocolo: protocolo || undefined,
    }).catch((e) => console.warn("[RESERVA] Telegram fail:", e));

    enviarEmailNotificacao({
      cliente_nome,
      cliente_cpf,
      motel: motelData?.nome || motel_id,
      suite: suiteData?.nome || suite_id,
      data_reserva,
      hora_chegada,
      duracao,
      preco,
      status: nova.status,
      protocolo: protocolo || undefined,
    }).catch((e) => console.warn("[RESERVA] Email fail:", e));
  }

  return c.json(nova, 201);
});

// ── UPDATE STATUS ─────────────────────────────────────
reservationsRouter.patch("/:id", getSession, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const { status, payment_id, status_origem, status_operador_uid } = body;
  const user = c.get("user");

  const existente = await db.query.reservations.findFirst({
    where: eq(reservations.id, id),
  });

  if (!existente) return c.json({ error: "Reserva não encontrada" }, 404);

  const updateData: Record<string, unknown> = {
    statusAtualizadoEm: new Date(),
    statusOrigem: status_origem || "api",
    statusOperadorUid: status_operador_uid || (user as { id?: string })?.id || null,
  };

  if (status) updateData.status = status;
  if (payment_id) updateData.paymentId = payment_id;

  const [updated] = await db
    .update(reservations)
    .set(updateData)
    .where(eq(reservations.id, id))
    .returning();

  return c.json(updated);
});

// ── DELETE ────────────────────────────────────────────
reservationsRouter.delete("/:id", getSession, requireRole("admin", "superadmin"), async (c) => {
  const id = c.req.param("id");

  const existente = await db.query.reservations.findFirst({
    where: eq(reservations.id, id),
  });

  if (!existente) return c.json({ error: "Reserva não encontrada" }, 404);

  await db.delete(reservations).where(eq(reservations.id, id));

  return c.json({ ok: true });
});

// ── DISPONIBILIDADE ──────────────────────────────────
reservationsRouter.get("/check-availability/:suiteId", async (c) => {
  const suiteId = c.req.param("suiteId");
  const data = c.req.query("data");

  if (!data) return c.json({ error: "Parâmetro 'data' obrigatório" }, 400);

  const suiteData = await db.query.suites.findFirst({
    where: eq(suites.id, suiteId),
  });

  if (!suiteData) return c.json({ error: "Suíte não encontrada" }, 404);

  const ocupadas = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(reservations)
    .where(
      and(
        eq(reservations.suiteId, suiteId),
        eq(reservations.dataReserva, data),
        or(
          eq(reservations.status, "confirmado"),
          eq(reservations.status, "check_in"),
          eq(reservations.status, "aguardando_pagamento")
        )
      )
    );

  const disponiveis = Math.max(0, (suiteData.qtde ?? 1) - (ocupadas[0]?.count || 0));

  return c.json({
    suite_id: suiteId,
    data,
    capacidade: suiteData.qtde ?? 1,
    ocupadas: ocupadas[0]?.count || 0,
    disponiveis,
  });
});
