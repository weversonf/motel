export { authRouter } from "./auth";
export { motelsRouter } from "./motels";
export { reservationsRouter } from "./reservations";
export { asaasRouter } from "./asaas";
export { adminRouter } from "./admin";

// Placeholders — serão implementados nas próximas etapas
import { Hono } from "hono";

export const npsRouter = new Hono()
  .get("/:motelId", (c) => c.json({}))
  .post("/:motelId", (c) => c.json({ message: "coming soon" }));

export const linktreeRouter = new Hono()
  .get("/:motelId", (c) => c.json([]));
