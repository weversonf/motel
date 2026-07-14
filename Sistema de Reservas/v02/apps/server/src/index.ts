import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { auth } from "./lib/auth";
import { authRouter } from "./routers/auth";
import { motelsRouter } from "./routers";
import { reservationsRouter } from "./routers";
import { asaasRouter } from "./routers";
import { npsRouter } from "./routers";
import { linktreeRouter } from "./routers";
import { adminRouter } from "./routers";
import { telegramRouter } from "./routers/telegram";

const app = new Hono();

app.use("*", cors());
app.use("*", logger());

app.get("/api/health", (c) => c.json({ status: "ok" }));

app.all("/api/auth/*", (c) => auth.handler(c.req.raw as unknown as Request));

app.route("/api/auth", authRouter);
app.route("/api/motels", motelsRouter);
app.route("/api/reservations", reservationsRouter);
app.route("/api/asaas", asaasRouter);
app.route("/api/nps", npsRouter);
app.route("/api/linktree", linktreeRouter);
app.route("/api/admin", adminRouter);
app.route("/api/telegram", telegramRouter);

export default app;
