import { Hono } from "hono";
import { eq, and } from "drizzle-orm";
import { db } from "../db";
import { reservations, suites, motels } from "../db/schema";
import { createPixCharge, getPaymentStatus } from "../lib/asaas";
import { notificarNovaReserva } from "../lib/telegram";
import { enviarEmailNotificacao } from "../lib/email";
import { getSession } from "../middleware/auth";

export const asaasRouter = new Hono();

// ── CRIAR COBRANÇA PIX ───────────────────────────────
asaasRouter.post("/charge", async (c) => {
  const body = await c.req.json();
  const { token, cliente_nome, cliente_cpf, motel, suite, duracao, preco } = body;

  if (!token || !cliente_nome || !cliente_cpf || !motel || !suite || !duracao || !preco) {
    return c.json({ sucesso: false, erro: "Campos obrigatórios faltando" }, 400);
  }

  const result = await createPixCharge({
    token,
    clienteNome: cliente_nome,
    clienteCpf: cliente_cpf,
    motel,
    suite,
    duracao,
    preco: Number(preco),
  });

  return c.json(result);
});

// ── VERIFICAR STATUS PAGAMENTO ────────────────────────
asaasRouter.get("/payment/:id", async (c) => {
  const paymentId = c.req.param("id");
  const token = c.req.query("token");

  if (!token) {
    return c.json({ sucesso: false, erro: "Token ASAAS obrigatório" }, 400);
  }

  try {
    const pagamento = await getPaymentStatus(token, paymentId);
    const pago = pagamento.status === "RECEIVED";

    return c.json({
      sucesso: true,
      pago,
      status: pagamento.status,
    });
  } catch (e) {
    return c.json({ sucesso: false, erro: (e as Error).message }, 500);
  }
});

// ── VALIDAR CHECK-IN ──────────────────────────────────
asaasRouter.post("/checkin-validate", getSession, async (c) => {
  const body = await c.req.json();
  const { token, payment_id, reserva_id } = body;

  if (!token || !payment_id) {
    return c.json({ sucesso: false, aprovado: false, motivo: "Token e payment_id obrigatórios" }, 400);
  }

  try {
    const pagamento = await getPaymentStatus(token, payment_id);
    const aprovado = pagamento.status === "RECEIVED";

    if (!aprovado) {
      console.warn(
        `[CHECKIN] BLOQUEADO | status: ${pagamento.status} | payment: ${payment_id} | reserva: ${reserva_id}`
      );
    }

    return c.json({
      sucesso: true,
      aprovado,
      status_asaas: pagamento.status,
      motivo: aprovado
        ? "Pagamento confirmado pelo ASAAS"
        : `Status no ASAAS: ${pagamento.status}. Apenas RECEIVED libera check-in.`,
    });
  } catch (e) {
    console.error(`[CHECKIN] Erro ao consultar ASAAS:`, (e as Error).message);
    return c.json({
      sucesso: false,
      aprovado: false,
      motivo: `Erro ao consultar ASAAS: ${(e as Error).message}`,
    });
  }
});

// ── WEBHOOK ASAAS ─────────────────────────────────────
asaasRouter.post("/webhook", async (c) => {
  const body = await c.req.json();
  const { event: evento, payment } = body;

  if (!payment?.id) {
    return c.json({ sucesso: false, erro: "Dados inválidos" }, 400);
  }

  console.log(
    `[WEBHOOK] Evento: ${evento} | payment_id: ${payment.id} | status: ${payment.status}`
  );

  if (!payment.externalReference) {
    return c.json({ sucesso: true, mensagem: "Sem externalReference, ignorado" });
  }

  const cpfNumeros = payment.externalReference.split("_")[0];
  const cpfMascarado = cpfNumeros.replace(
    /(\d{3})(\d{3})(\d{3})(\d{2})/,
    "$1.$2.$3-$4"
  );

  if (evento === "PAYMENT_RECEIVED") {
    const reserva = await db.query.reservations.findFirst({
      where: and(
        eq(reservations.clienteCpf, cpfMascarado),
        eq(reservations.status, "aguardando_pagamento")
      ),
      with: { suite: true, motel: true },
    });

    if (reserva) {
      await db
        .update(reservations)
        .set({
          status: "confirmado",
          statusAtualizadoEm: new Date(),
          statusOrigem: "webhook_PAYMENT_RECEIVED",
          statusAsaasConfirmado: payment.status,
        })
        .where(eq(reservations.id, reserva.id));

      notificarNovaReserva({
        cliente_nome: reserva.clienteNome,
        cliente_cpf: reserva.clienteCpf,
        motel: reserva.motel?.nome || "",
        suite: reserva.suite?.nome || "",
        data_reserva: reserva.dataReserva,
        hora_chegada: reserva.horaChegada,
        duracao: reserva.duracao,
        preco: reserva.preco,
        status: "confirmado",
        payment_id: payment.id,
        protocolo: reserva.protocolo || undefined,
      }).catch((e) => console.warn("[WEBHOOK] Telegram fail:", e));

      enviarEmailNotificacao({
        cliente_nome: reserva.clienteNome,
        cliente_cpf: reserva.clienteCpf,
        motel: reserva.motel?.nome || "",
        suite: reserva.suite?.nome || "",
        data_reserva: reserva.dataReserva,
        hora_chegada: reserva.horaChegada,
        duracao: reserva.duracao,
        preco: reserva.preco,
        status: "confirmado",
        payment_id: payment.id,
        protocolo: reserva.protocolo || undefined,
      }, true).catch((e) => console.warn("[WEBHOOK] Email fail:", e));

      console.log(`[WEBHOOK] Reserva confirmada: ${reserva.id}`);
    } else {
      console.warn(`[WEBHOOK] Reserva não encontrada para CPF: ${cpfNumeros}`);
    }

    return c.json({ sucesso: true, status: "confirmado" });

  } else if (evento === "PAYMENT_OVERDUE" || evento === "PAYMENT_DELETED") {
    const reserva = await db.query.reservations.findFirst({
      where: and(
        eq(reservations.clienteCpf, cpfMascarado),
        eq(reservations.status, "aguardando_pagamento")
      ),
    });

    if (reserva) {
      await db
        .update(reservations)
        .set({
          status: "cancelado",
          statusAtualizadoEm: new Date(),
          statusOrigem: `webhook_${evento}`,
        })
        .where(eq(reservations.id, reserva.id));

      console.log(`[WEBHOOK] Reserva cancelada: ${reserva.id} | evento: ${evento}`);
    }

    return c.json({ sucesso: true, status: "cancelado" });
  }

  console.log(`[WEBHOOK] Evento ignorado: ${evento}`);
  return c.json({ sucesso: true, mensagem: `Evento ${evento} ignorado` });
});
