import { Hono } from "hono";
import { eq, and, sql } from "drizzle-orm";
import { db } from "../db";
import { motels, suites, reservations } from "../db/schema";

export const motelsRouter = new Hono();

motelsRouter.get("/", async (c) => {
  const result = await db
    .select({
      id: motels.id,
      nome: motels.nome,
      slug: motels.slug,
      cor: motels.cor,
      icone: motels.icone,
      ativo: motels.ativo,
      totalSuites: sql<number>`count(${suites.id})::int`,
    })
    .from(motels)
    .leftJoin(suites, and(eq(suites.motelId, motels.id), eq(suites.ativo, true)))
    .where(eq(motels.ativo, true))
    .groupBy(motels.id)
    .orderBy(motels.nome);

  return c.json(result);
});

motelsRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  const motel = await db.query.motels.findFirst({
    where: eq(motels.id, id),
    with: {
      suites: {
        where: eq(suites.ativo, true),
        orderBy: suites.nome,
      },
    },
  });

  if (!motel) return c.json({ error: "Motel não encontrado" }, 404);
  return c.json(motel);
});

motelsRouter.get("/:id/suites", async (c) => {
  const id = c.req.param("id");
  const result = await db
    .select()
    .from(suites)
    .where(and(eq(suites.motelId, id), eq(suites.ativo, true)))
    .orderBy(suites.nome);

  return c.json(result);
});
