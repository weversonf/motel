const TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const IDS_AUTORIZADOS = (process.env.TELEGRAM_AUTHORIZED_IDS || "")
  .split(",")
  .map((id) => id.trim())
  .filter(Boolean);

const BASE = `https://api.telegram.org/bot${TOKEN}`;

async function telegramPost(method: string, body: Record<string, unknown>) {
  if (!TOKEN) {
    console.warn("[TELEGRAM] TOKEN não configurado");
    return null;
  }
  const res = await fetch(`${BASE}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

export function enviarMensagem(chatId: string | number, texto: string) {
  return telegramPost("sendMessage", {
    chat_id: String(chatId),
    text: texto,
    parse_mode: "HTML",
  });
}

export function enviarParaAutorizados(mensagem: string) {
  return Promise.all(
    IDS_AUTORIZADOS.map((id) => enviarMensagem(id, mensagem))
  );
}

export interface ReservationNotification {
  cliente_nome: string;
  cliente_cpf: string;
  motel: string;
  suite: string;
  data_reserva: string;
  hora_chegada: string;
  duracao: string;
  preco: string | number;
  status: string;
  payment_id?: string;
  protocolo?: string;
}

export function formatarMensagemTelegram(
  dados: ReservationNotification,
  confirmado = false
): string {
  const emoji = confirmado ? "✅" : "🔔";
  const statusTexto = confirmado ? "CONFIRMADO" : dados.status;

  return [
    `${emoji} <b>${confirmado ? "Reserva Confirmada" : "Nova Reserva"}</b> ${emoji}`,
    ``,
    `🏨 <b>Motel:</b> ${dados.motel}`,
    `🛏 <b>Suíte:</b> ${dados.suite}`,
    `👤 <b>Cliente:</b> ${dados.cliente_nome}`,
    `📄 <b>CPF:</b> ${dados.cliente_cpf}`,
    `📅 <b>Data:</b> ${dados.data_reserva}`,
    `⏰ <b>Check-in:</b> ${dados.hora_chegada}`,
    `⏳ <b>Duração:</b> ${dados.duracao}`,
    `💰 <b>Valor:</b> R$ ${dados.preco}`,
    dados.protocolo ? `🔑 <b>Protocolo:</b> #${dados.protocolo}` : "",
    ``,
    `<b>Status:</b> ${statusTexto}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export async function notificarNovaReserva(dados: ReservationNotification) {
  const msg = formatarMensagemTelegram(dados);
  return enviarParaAutorizados(msg);
}

// ─── COMANDOS DO BOT ──────────────────────────────────
interface TelegramMessage {
  message_id: number;
  chat: { id: number };
  from: { id: number; username?: string };
  text?: string;
}

interface TelegramCallback {
  id: string;
  message: { chat: { id: number } };
  from: { id: number };
  data: string;
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: TelegramCallback;
}

export function isAuthorized(userId: string | number): boolean {
  return IDS_AUTORIZADOS.includes(String(userId));
}

export async function processarComando(texto: string, chatId: number): Promise<void> {
  if (texto === "/start") {
    await enviarMensagem(
      chatId,
      "🤖 <b>Bot Motéis Fortaleza</b>\n\n" +
        "Comandos disponíveis:\n" +
        "/conferirdia — Relatório financeiro\n" +
        "/resumo — Resumo do dia\n" +
        "/test — Testar bot"
    );
  } else if (texto === "/conferirdia") {
    await enviarRelatorioComBotoes(chatId);
  } else if (texto === "/resumo") {
    await enviarResumoDoDia(chatId);
  } else if (texto === "/test") {
    await enviarMensagem(chatId, "✅ Bot operacional!");
  }
}

export async function processarCallback(
  callback: TelegramCallback
): Promise<void> {
  const { data, message } = callback;

  if (data === "conferir_asaas") {
    await enviarMensagem(
      message.chat.id,
      "🔍 Conferir pagamentos no ASAAS — acesse o painel admin para verificar."
    );
  } else if (data === "conferir_recepcao") {
    await enviarMensagem(
      message.chat.id,
      "📋 Pendentes na recepção — acesse o painel admin para verificar."
    );
  }

  await telegramPost("answerCallbackQuery", {
    callback_query_id: callback.id,
  });
}

async function enviarRelatorioComBotoes(chatId: number) {
  await telegramPost("sendMessage", {
    chat_id: String(chatId),
    text: "📊 <b>Relatório Financeiro</b>",
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [{ text: "🔍 Conferir Pagamentos ASAAS", callback_data: "conferir_asaas" }],
        [{ text: "📋 Pendentes Recepção", callback_data: "conferir_recepcao" }],
      ],
    },
  });
}

// ─── RESUMO DO DIA ────────────────────────────────────
export async function enviarResumoDoDia(
  chatId: number,
  resumo?: { total: number; porStatus: Record<string, number>; receita: number }
) {
  if (!resumo) {
    await enviarMensagem(chatId, "📊 <b>Resumo do dia</b>\n\nCarregando...");
    return;
  }

  const statusLinhas = Object.entries(resumo.porStatus)
    .map(([status, count]) => `  • ${status}: ${count}`)
    .join("\n");

  await enviarMensagem(
    chatId,
    [
      "📊 <b>Resumo do Dia</b>",
      "",
      `📅 <b>Total de reservas:</b> ${resumo.total}`,
      `💰 <b>Receita:</b> R$ ${resumo.receita.toFixed(2)}`,
      "",
      "<b>Por status:</b>",
      statusLinhas || "  • Nenhuma",
    ].join("\n")
  );
}

// ─── PROCESSAR UPDATE (webhook) ───────────────────────
export async function processarUpdate(update: TelegramUpdate) {
  const { message, callback_query } = update;

  if (callback_query) {
    if (!isAuthorized(callback_query.from.id)) return;
    return processarCallback(callback_query);
  }

  if (message?.text) {
    if (!isAuthorized(message.from.id)) {
      await enviarMensagem(message.chat.id, "⛔ Acesso negado.");
      return;
    }
    return processarComando(message.text, message.chat.id);
  }
}
