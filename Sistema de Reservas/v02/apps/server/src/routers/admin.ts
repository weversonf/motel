import { Hono } from "hono";
import { eq, desc, or } from "drizzle-orm";
import { db } from "../db";
import { users, deletedUsers, userRoleEnum } from "../db/schema";
import { getSession, requireRole } from "../middleware/auth";

export const adminRouter = new Hono();

// ── LIST USERS ────────────────────────────────────────
adminRouter.get("/users", getSession, requireRole("admin", "superadmin"), async (c) => {
  const all = await db
    .select({
      id: users.id,
      nome: users.nome,
      email: users.email,
      role: users.role,
      motelId: users.motelId,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(or(eq(users.role, "funcionario"), eq(users.role, "admin")))
    .orderBy(desc(users.createdAt));

  return c.json(all);
});

// ── CREATE USER ───────────────────────────────────────
adminRouter.post("/users", getSession, requireRole("admin", "superadmin"), async (c) => {
  const body = await c.req.json();
  const { id, nome, email, role, motel_id } = body;

  if (!nome || !email) {
    return c.json({ error: "Nome e email são obrigatórios" }, 400);
  }

  const exists = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (exists) return c.json({ error: "Email já cadastrado" }, 409);

  const [novo] = await db
    .insert(users)
    .values({
      id: id || crypto.randomUUID(),
      nome,
      email,
      role: (role as typeof userRoleEnum.enumValues[number]) || "funcionario",
      motelId: motel_id || null,
    })
    .returning();

  return c.json(novo, 201);
});

// ── UPDATE USER ───────────────────────────────────────
adminRouter.patch("/users/:id", getSession, requireRole("admin", "superadmin"), async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const { nome, email, role, motel_id } = body;

  const existente = await db.query.users.findFirst({
    where: eq(users.id, id),
  });

  if (!existente) return c.json({ error: "Usuário não encontrado" }, 404);

  const updateData: Record<string, unknown> = {};
  if (nome !== undefined) updateData.nome = nome;
  if (email !== undefined) updateData.email = email;
  if (role !== undefined) updateData.role = role;
  if (motel_id !== undefined) updateData.motelId = motel_id;

  const [updated] = await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, id))
    .returning();

  return c.json(updated);
});

// ── SOFT DELETE USER ──────────────────────────────────
adminRouter.delete("/users/:id", getSession, requireRole("admin", "superadmin"), async (c) => {
  const id = c.req.param("id");

  const existente = await db.query.users.findFirst({
    where: eq(users.id, id),
  });

  if (!existente) return c.json({ error: "Usuário não encontrado" }, 404);

  await db.transaction(async (tx) => {
    await tx.insert(deletedUsers).values({
      uid: id,
      removidoEm: new Date(),
    });

    await tx
      .update(users)
      .set({ role: "removido" })
      .where(eq(users.id, id));
  });

  return c.json({ ok: true });
});
