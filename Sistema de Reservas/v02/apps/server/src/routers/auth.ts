import { Hono } from "hono";
import { getSession, requireRole } from "../middleware/auth";

export const authRouter = new Hono();

authRouter.get("/me", getSession, (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Não autenticado" }, 401);
  return c.json({ user });
});

authRouter.get("/admin-check", getSession, requireRole("admin", "superadmin"), (c) => {
  return c.json({ ok: true });
});
