import { Hono } from "hono";
import { processarUpdate } from "../lib/telegram";

export const telegramRouter = new Hono();

telegramRouter.post("/webhook", async (c) => {
  const body = await c.req.json();
  await processarUpdate(body);
  return c.json({ ok: true });
});
