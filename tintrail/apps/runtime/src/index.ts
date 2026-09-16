import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { serve } from "@hono/node-server";
import { createRuntime } from "./boot.ts";

const repoVar = join(dirname(fileURLToPath(import.meta.url)), "../../../var");
const dataDir = process.env.TINTRAIL_DATA_DIR ?? repoVar;
const port = Number(process.env.TINTRAIL_PORT ?? 8787);
const { app } = createRuntime(dataDir);

serve({ fetch: app.fetch, hostname: "127.0.0.1", port }, (info) => {
  console.log(`TintRail runtime http://127.0.0.1:${info.port}`);
});
