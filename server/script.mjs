import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "data");
const LOG_FILE = join(DATA_DIR, "log.json");

const SITE_URL = "https://moteisfortaleza.com/";
const PALAVRAS_SUSPENSAS = ["suspended", "cgi-sys", "account has been suspended", "hosting provider"];

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_IDS = (process.env.TELEGRAM_AUTHORIZED_IDS || "").split(",").map((s) => s.trim()).filter(Boolean);
const TELEGRAM_BASE = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

function loadState() {
  try {
    if (existsSync(LOG_FILE)) {
      return JSON.parse(readFileSync(LOG_FILE, "utf-8"));
    }
  } catch {}
  return {
    checks: [],
    uptimeCount: 0,
    downCount: 0,
    lastStatus: null,
    lastChanged: null,
    startTime: new Date().toISOString(),
  };
}

function saveState(state) {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(LOG_FILE, JSON.stringify(state, null, 2), "utf-8");
}

async function sendTelegram(text) {
  if (!TELEGRAM_TOKEN || TELEGRAM_IDS.length === 0) return;
  for (const chatId of TELEGRAM_IDS) {
    try {
      await fetch(`${TELEGRAM_BASE}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
      });
    } catch {}
  }
}

async function checkSite() {
  const state = loadState();
  const start = Date.now();
  let statusCode = 0;
  let error = null;
  let ok = false;
  let finalUrl = "";

  try {
    const res = await fetch(SITE_URL, {
      method: "GET",
      redirect: "manual",
      signal: AbortSignal.timeout(30000),
    });
    statusCode = res.status;
    finalUrl = res.headers.get("location") || SITE_URL;

    if (statusCode >= 300 && statusCode < 400) {
      const location = res.headers.get("location") || "";
      if (location.includes("suspended") || location.includes("cgi-sys")) {
        error = "Redirecionado para página de suspensão: " + location;
        ok = false;
      } else {
        ok = true;
      }
    } else if (statusCode === 200) {
      const body = await res.text();
      const bodyLower = body.toLowerCase();
      const suspensa = PALAVRAS_SUSPENSAS.some((p) => bodyLower.includes(p));
      if (suspensa) {
        error = "Site retornou página de suspensão da hospedagem";
        ok = false;
      } else {
        ok = true;
      }
    } else {
      ok = res.ok || (statusCode >= 200 && statusCode < 500);
    }
  } catch (err) {
    error = err.message || "Erro de conexão";
    ok = false;
  }

  const responseTime = Date.now() - start;
  const status = ok ? "up" : "down";
  const now = new Date().toISOString();
  const check = { timestamp: now, status, statusCode, responseTime, error, finalUrl: finalUrl || undefined };

  state.checks.push(check);
  if (ok) state.uptimeCount++;
  else state.downCount++;

  if (state.lastStatus !== null && state.lastStatus !== status) {
    state.lastChanged = now;
    const emoji = status === "up" ? "✅" : "🔴";
    const title = status === "up" ? "RECUPERADO" : "FORA DO AR";
    const icon = status === "up" ? "🟢" : "🚨";
    await sendTelegram(
      `${icon} <b>${title} — ${SITE_URL}</b>\n` +
      `Status: ${emoji} <b>${status.toUpperCase()}</b>\n` +
      `Tempo de resposta: ${responseTime}ms\n` +
      (statusCode ? `HTTP: ${statusCode}\n` : "") +
      (error ? `Erro: ${error}\n` : "") +
      `📅 ${new Date(now).toLocaleString("pt-BR")}`
    );
  }

  state.lastStatus = status;

  if (state.checks.length > 20000) {
    state.checks = state.checks.slice(state.checks.length - 20000);
  }

  saveState(state);
  console.log(`[${status.toUpperCase()}] ${statusCode} | ${responseTime}ms${error ? " | " + error : ""}`);
}

checkSite().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
