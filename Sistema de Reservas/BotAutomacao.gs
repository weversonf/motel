/**
 * BotAutomacao.gs — Módulo separado de automação
 * 
 * Funções:
 *   1. Notificar reservas confirmadas via Telegram
 *   2. Receber comandos do Telegram (/conferirdia)
 *   3. Controle de acesso (apenas IDs autorizados)
 */

// ===== CONFIGURAÇÕES =====
var TELEGRAM_TOKEN = '8775507409:AAE_ELsc4wzurqdnQ9wZtC_cnAhTXknIlj8';
var IDS_AUTORIZADOS = ['6802504310']; // Adicione o ID da Rose aqui

// ===== FUNÇÃO PRINCIPAL =====
function doPost(e) {
  var contents = JSON.parse(e.postData.contents);

  // 1. Webhook do Telegram (comandos / interação)
  if (contents.message) {
    processarMensagemTelegram(contents.message);
  }
  // 2. Callback de botão inline
  else if (contents.callback_query) {
    processarCallback(contents.callback_query);
  }
  // 3. Notificação de reserva (chamado pelo dashboard)
  else if (contents.acao === 'notificar_telegram') {
    enviarParaAutorizados(formatarMensagemTelegram(contents));
  }

  return ContentService.createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ===== COMANDOS DO TELEGRAM =====
function processarMensagemTelegram(msg) {
  var chatId = msg.chat.id;
  var userId = msg.from.id.toString();
  var texto = msg.text || '';

  if (IDS_AUTORIZADOS.indexOf(userId) === -1) {
    enviarMensagem(chatId, "Acesso negado.");
    return;
  }

  if (texto === '/conferirdia') {
    enviarRelatorioComBotoes(chatId);
  }
}

function processarCallback(callback) {
  var chatId = callback.message.chat.id;
  var userId = callback.from.id.toString();
  var data = callback.data;

  if (IDS_AUTORIZADOS.indexOf(userId) === -1) {
    enviarMensagem(chatId, "Acesso negado.");
    return;
  }

  if (data === 'conferir_asaas') {
    enviarMensagem(chatId, "🔄 Conferindo pagamentos no Asaas... (em breve)");
  } else if (data === 'conferir_recepcao') {
    enviarMensagem(chatId, "💰 Buscando pendentes da recepção... (em breve)");
  }
}

function enviarRelatorioComBotoes(chatId) {
  var url = 'https://api.telegram.org/bot' + TELEGRAM_TOKEN + '/sendMessage';
  var payload = {
    chat_id: chatId,
    text: '📊 Relatório Financeiro:',
    reply_markup: {
      inline_keyboard: [
        [{ text: "🔄 Conferir Pagamentos Asaas", callback_data: 'conferir_asaas' }],
        [{ text: "💰 Pendentes Recepção", callback_data: 'conferir_recepcao' }]
      ]
    }
  };
  UrlFetchApp.fetch(url, {
    method: 'post',
    payload: JSON.stringify(payload),
    contentType: 'application/json'
  });
}

// ===== NOTIFICAÇÃO DE RESERVA =====
function enviarParaAutorizados(mensagem) {
  var url = 'https://api.telegram.org/bot' + TELEGRAM_TOKEN + '/sendMessage';
  IDS_AUTORIZADOS.forEach(function(chatId) {
    UrlFetchApp.fetch(url, {
      method: 'post',
      payload: { chat_id: chatId, text: mensagem, parse_mode: 'HTML' },
      muteHttpExceptions: true
    });
  });
}

function enviarMensagem(chatId, texto) {
  var url = 'https://api.telegram.org/bot' + TELEGRAM_TOKEN + '/sendMessage';
  UrlFetchApp.fetch(url, {
    method: 'post',
    payload: { chat_id: chatId, text: texto },
    muteHttpExceptions: true
  });
}

function formatarMensagemTelegram(dados) {
  var statusTexto = '';
  switch (dados.status) {
    case 'confirmado': statusTexto = '✅ Confirmado'; break;
    case 'pendente_cartao': statusTexto = '⏳ Pendente (Cartão)'; break;
    case 'aguardando_pagamento': statusTexto = '⏳ Aguardando PIX'; break;
    default: statusTexto = dados.status || 'Desconhecido';
  }

  return '<b>Nova Reserva</b>'
    + '\n👤 Nome: ' + (dados.cliente_nome || '?')
    + '\n🆔 CPF: ' + (dados.cliente_cpf || '?')
    + '\n🏨 Motel: ' + (dados.motel || '?')
    + '\n🛏 Suíte: ' + (dados.suite || '?')
    + '\n📅 Data: ' + (dados.data_reserva || '?')
    + '\n⏰ Horário: ' + (dados.hora_chegada || '?')
    + '\n⏳ Período: ' + (dados.duracao || '?')
    + '\n💰 Valor: R$ ' + (dados.preco || '0') + ',00'
    + '\n📋 Protocolo: ' + (dados.payment_id || '?')
    + '\n📌 Status: ' + statusTexto;
}
