import { serve } from "@hono/node-server";
import "dotenv/config";
import app from "./index";

const port = parseInt(process.env.PORT || "3001");

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Server running at http://localhost:${info.port}`);
});
