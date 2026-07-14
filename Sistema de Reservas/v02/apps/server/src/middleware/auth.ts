import { createMiddleware } from "hono/factory";
import { auth } from "../lib/auth";
import type { User, Session } from "better-auth";

interface AuthContext {
  user: User | null;
  session: Session | null;
}

export const getSession = createMiddleware<{
  Variables: AuthContext;
}>(async (c, next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  c.set("user", session?.user ?? null);
  c.set("session", session?.session ?? null);

  await next();
});

export function requireAuth() {
  return createMiddleware<{
    Variables: AuthContext;
  }>(async (c, next) => {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Não autorizado" }, 401);
    }
    await next();
  });
}

export function requireRole(...roles: string[]) {
  return createMiddleware<{
    Variables: AuthContext;
  }>(async (c, next) => {
    const user = c.get("user") as Record<string, unknown> | null;
    if (!user) {
      return c.json({ error: "Não autorizado" }, 401);
    }
    const userRole = user.role as string | undefined;
    if (!userRole || !roles.includes(userRole)) {
      return c.json({ error: "Acesso negado" }, 403);
    }
    await next();
  });
}

export { auth };
