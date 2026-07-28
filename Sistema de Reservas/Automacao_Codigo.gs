/**
 * Apps Script — Ponte ASAAS + Planilha
 * 
 * Como usar:
 * 1. Acesse script.google.com
 * 2. Crie um novo projeto
 * 3. Cole este código
 * 4. Publique > Implantar > Nova implantação > Web App
 * 5. Copie a URL gerada e substitua no index.html
 */

function doPost(e) {
  try {
    var contents = JSON.parse(e.postData.contents);

    // ===== TELEGRAM (webhook do bot) =====
    if (contents.message && contents.message.chat && contents.message.from) {
      processarMensagemTelegram(contents.message);
      return ContentService.createTextOutput(JSON.stringify({ status: 'ok' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    if (contents.callback_query && contents.callback_query.from && contents.callback_query.message) {
      processarCallback(contents.callback_query);
      return ContentService.createTextOutput(JSON.stringify({ status: 'ok' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    if (contents.acao === 'notificar_telegram') {
      enviarParaAutorizados(formatarMensagemTelegram(contents));
      return ContentService.createTextOutput(JSON.stringify({ status: 'ok' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // ===== DASHBOARD / CHAT =====
    const dados = contents;
    const resposta = { sucesso: false, pagamento_url: '', payment_id: '', external_reference: '', erro: '' };

    // Webhook do ASAAS
    if (dados.event && dados.payment) {
      return processarWebhook(dados);
    }

    // Verificar status de pagamento
    if (dados.acao === 'verificar_pagamento' && dados.payment_id) {
      return verificarPagamento(dados);
    }

    // [SEGURANÇA] Validar pagamento antes do check-in (chamado pelo dashboard)
    if (dados.acao === 'checkin_validar' && dados.payment_id && dados.token_asaas) {
      return validarCheckin(dados);
    }

    // Limpar reservas expiradas (chamado por trigger ou manualmente)
    if (dados.acao === 'limpar_expiradas') {
      return ContentService.createTextOutput(JSON.stringify(limparReservasExpiradas()))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Resetar senha (Admin)
    if (dados.acao === 'resetar_senha') {
      return ContentService.createTextOutput(JSON.stringify(resetarSenhaFirebase(dados)))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Notificar (email + telegram)
    if (dados.acao === 'notificar') {
      enviarEmailNotificacao(dados);
      try {
        enviarParaAutorizados(formatarMensagemTelegram(dados));
      } catch(e) {
        console.warn('[TELEGRAM] Falha ao notificar reserva:', e);
      }
      return ContentService.createTextOutput(JSON.stringify({ sucesso: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Criar nova cobrança
    if (dados.token_asaas && dados.token_asaas.startsWith('$')) {
      const resultado = criarCobrancaASAAS(dados);
      if (resultado.sucesso) {
        resposta.pagamento_url = resultado.pagamento_url;
        resposta.payment_id = resultado.payment_id;
        resposta.external_reference = resultado.external_reference;
        resposta.sucesso = true;
        enviarEmailNotificacao(dados);
        try {
          enviarParaAutorizados(formatarMensagemTelegram(dados));
        } catch(e) {
          console.warn('[TELEGRAM] Falha ao notificar nova reserva:', e);
        }
      } else {
        resposta.erro = 'ERRO_ASAAS: ' + resultado.erro;
        resposta.sucesso = false;
      }
    }

    return ContentService
      .createTextOutput(JSON.stringify(resposta))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ sucesso: false, erro: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function salvarNaPlanilha(dados) {
  const planilhaId = PropertiesService.getScriptProperties().getProperty('PLANILHA_ID');
  if (!planilhaId) return;

  try {
    const sheet = SpreadsheetApp.openById(planilhaId).getActiveSheet();
    // Cabeçalho se vazio
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Data', 'Motel', 'Suíte', 'Período', 'Preço', 'Cliente', 'CPF', 'Data Reserva', 'Horário', 'Status']);
    }
    sheet.appendRow([
      new Date().toLocaleString('pt-BR'),
      dados.motel || '',
      dados.suite || '',
      dados.duracao || '',
      dados.preco || '',
      dados.cliente_nome || '',
      dados.cliente_cpf || '',
      dados.data_reserva || '',
      dados.hora_chegada || '',
      dados.status || 'pendente'
    ]);
  } catch (e) {
    console.warn('Erro ao salvar na planilha:', e);
  }
}
function apiAsaas(token, method, path, body) {
  const isSandbox = token.startsWith('$aact_hmlg_');
  const urlBase = isSandbox ? 'https://api-sandbox.asaas.com/v3' : 'https://api.asaas.com/v3';
  const opts = {
    method: method,
    headers: { 'access_token': token, 'Content-Type': 'application/json' },
    muteHttpExceptions: true
  };
  if (body) opts.payload = JSON.stringify(body);
  const resp = UrlFetchApp.fetch(urlBase + path, opts);
  return JSON.parse(resp.getContentText());
}

// ===== NOTIFICAÇÃO POR EMAIL =====
var EMAIL_NOTIFICAR = 'weversonf@gmail.com';
var LINK_PAINEL_ADMIN = 'https://moteisfortaleza-9dadd.web.app/admin/';

function montarHtmlReserva(dados, confirmado) {
  var isConfirmado = confirmado || false;

  // Badge do status
  var badgeTexto = isConfirmado ? 'Pagamento Confirmado' : 'Aguardando Pagamento';
  var badgeStyle = 'display:inline-block;background:rgba(255,255,255,0.15);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);color:#fff;padding:6px 18px;border-radius:20px;font-size:12px;font-weight:600;letter-spacing:0.5px;margin-top:12px;border:1px solid rgba(255,255,255,0.2)';

  // Status badge na tabela
  var statusStyle = isConfirmado
    ? 'display:inline-flex;align-items:center;gap:6px;background:linear-gradient(135deg,#00d99f,#00b894);color:#fff;padding:4px 14px;border-radius:20px;font-size:13px;font-weight:700'
    : 'display:inline-flex;align-items:center;gap:6px;background:linear-gradient(135deg,#ffc107,#ff9800);color:#fff;padding:4px 14px;border-radius:20px;font-size:13px;font-weight:700';
  var statusTexto = isConfirmado ? 'Confirmado' : (dados.status === 'pendente_recepcao' ? 'Pendente' : 'Aguardando');

  // Calcular check-out aproximado (hora_chegada + duracao)
  var checkin = (dados.data_reserva || '?');
  var horachegada = (dados.hora_chegada || '?');
  var checkout = (dados.data_reserva || '?');
  var horasaida = (dados.hora_saida || '?');
  if (dados.duracao && dados.hora_chegada) {
    var parts = dados.hora_chegada.split(':');
    var hh = parseInt(parts[0]) || 0;
    var mm = parseInt(parts[1]) || 0;
    var durMatch = dados.duracao.match(/(\d+)h/);
    if (durMatch) {
      var addH = parseInt(durMatch[1]);
      hh += addH;
      if (hh >= 24) { hh -= 24; }
      horasaida = String(hh).padStart(2,'0') + ':' + String(mm).padStart(2,'0');
    }
  }

  var html = ''
    + '<!DOCTYPE html>'
    + '<html lang="pt-BR">'
    + '<head>'
    + '<meta charset="UTF-8">'
    + '<meta name="viewport" content="width=device-width,initial-scale=1.0">'
    + '<title>' + (isConfirmado ? 'Nova Reserva Confirmada' : 'Nova Reserva') + ' - Motéis Fortaleza</title>'
    + '<style>'
    + 'body{margin:0;padding:0;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;background:linear-gradient(135deg,#f9f0f5 0%,#f0e6f6 100%);-webkit-text-size-adjust:none;-ms-text-size-adjust:none}'
    + 'table{border-spacing:0;border-collapse:collapse}'
    + 'td{padding:0}'
    + 'img{border:0;display:block}'
    + '.wrapper{width:100%;table-layout:fixed;background:linear-gradient(135deg,#f9f0f5 0%,#f0e6f6 100%);padding:40px 0 60px}'
    + '.main{background:#fff;margin:0 auto;width:100%;max-width:600px;border-spacing:0;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;color:#2d1b3d;border-radius:24px;overflow:hidden;box-shadow:0 20px 60px rgba(210,1,80,0.15),0 8px 20px rgba(0,0,0,0.05)}'
    + '.header{background:linear-gradient(135deg,#d20150 0%,#a0013d 50%,#7a002e 100%);padding:32px 0 28px;text-align:center;position:relative}'
    + '.header::after{content:"";position:absolute;bottom:0;left:0;right:0;height:4px;background:linear-gradient(90deg,#ff6b9d,#ffd700,#00d99f,#6c63ff,#ff6b9d);background-size:200% 100%}'
    + '.header-icon{font-size:48px;display:block;margin-bottom:12px}'
    + '.logo-text{font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.5px;display:block}'
    + '.logo-sub{font-size:12px;color:rgba(255,255,255,0.7);letter-spacing:3px;text-transform:uppercase;margin-top:4px;display:block}'
    + '.content{padding:36px 32px 32px}'
    + '.content h1{font-size:26px;font-weight:800;color:#1a0a2e;margin:0 0 8px;letter-spacing:-0.3px;line-height:1.2}'
    + '.content .subtitle{font-size:15px;color:#7a5a8a;line-height:1.6;margin:0 0 28px}'
    + '.content .subtitle strong{color:#d20150}'
    + '.info-grid{background:#faf7fc;border-radius:16px;padding:4px 0;margin:20px 0;border:1px solid #f0e8f4}'
    + '.info-row{padding:14px 20px;border-bottom:1px solid #f0e8f4}'
    + '.info-row:last-child{border-bottom:none}'
    + '.info-label{font-size:12px;font-weight:600;color:#a080b0;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:2px}'
    + '.info-value{font-size:16px;font-weight:600;color:#1a0a2e}'
    + '.info-value .muted{color:#7a5a8a;font-weight:400}'
    + '.button-container{text-align:center;margin:32px 0 8px}'
    + '.button{background:linear-gradient(135deg,#d20150 0%,#a0013d 100%);color:#fff;padding:15px 36px;border-radius:12px;text-decoration:none;font-weight:700;font-size:15px;display:inline-block;box-shadow:0 4px 16px rgba(210,1,80,0.3);transition:all .2s;letter-spacing:.3px}'
    + '.button-secondary{background:#f5f0f8;color:#d20150;padding:12px 28px;border-radius:12px;text-decoration:none;font-weight:600;font-size:13px;display:inline-block;margin-top:10px}'
    + '.footer{background:#1a0a2e;padding:32px 32px 28px;text-align:center}'
    + '.footer-logo{font-size:18px;font-weight:800;color:#fff;letter-spacing:-0.3px}'
    + '.footer p{margin:12px 0 0;padding:0;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.6}'
    + '.footer a{color:#ff6b9d;text-decoration:none;font-weight:600}'
    + '.footer .social-links{margin:16px 0 0}'
    + '.footer .social-links a{display:inline-block;width:32px;height:32px;line-height:32px;background:rgba(255,255,255,0.08);border-radius:50%;margin:0 4px;font-size:14px;color:rgba(255,255,255,0.6);text-decoration:none}'
    + '@media only screen and (max-width:480px){.content{padding:28px 20px 24px}.content h1{font-size:22px}.info-row{padding:12px 16px}.footer{padding:24px 20px 20px}.header{padding:24px 0 20px}}'
    + '</style>'
    + '</head>'
    + '<body>'
    + '<center class="wrapper">'
    + '<table class="main" width="100%">'
    + '<tr>'
    + '<td class="header">'
    + '<span class="header-icon">' + (isConfirmado ? '&#9989;' : '&#128276;') + '</span>'
    + '<span class="logo-text">Motéis Fortaleza</span>'
    + '<span class="logo-sub">Sistema de Reservas</span>'
    + '<span class="badge" style="' + badgeStyle + '">' + badgeTexto + '</span>'
    + '</td>'
    + '</tr>'
    + '<tr>'
    + '<td class="content">'
    + '<h1>' + (isConfirmado ? 'Nova Reserva Confirmada' : 'Nova Reserva Recebida') + '</h1>'
    + '<p class="subtitle">'
    + 'Prezado(a) <strong>Administrador(a)</strong>,<br>'
    + (isConfirmado
      ? 'Uma nova reserva foi realizada e o pagamento foi <strong>confirmado com sucesso</strong>. Abaixo estão os detalhes completos:'
      : 'Uma nova reserva foi realizada e est\u00e1 aguardando pagamento. Abaixo est\u00e3o os detalhes:')
    + '</p>'
    + '<div class="info-grid">'
    + '<div class="info-row"><div class="info-label">&#128279; Protocolo</div><div class="info-value">#' + (dados.reserva_id || dados.payment_id || '...') + '</div></div>'
    + '<div class="info-row"><div class="info-label">&#127968; Motel / Suíte</div><div class="info-value">' + (dados.motel || '?') + ' &#8212; <span class="muted">' + (dados.suite || '?') + '</span></div></div>'
    + '<div class="info-row"><div class="info-label">&#128197; Check-in</div><div class="info-value">' + checkin + ' &#8212; <span class="muted">' + horachegada + '</span></div></div>'
    + '<div class="info-row"><div class="info-label">&#128197; Check-out</div><div class="info-value">' + checkout + ' &#8212; <span class="muted">' + horasaida + '</span></div></div>'
    + '<div class="info-row"><div class="info-label">&#128101; H\u00f3spedes</div><div class="info-value">' + (dados.hospedes || '1') + '</div></div>'
    + '<div class="info-row"><div class="info-label">&#128176; Valor Total</div><div class="info-value">R$ <strong>' + (dados.preco || '0') + '</strong></div></div>'
    + '<div class="info-row"><div class="info-label">&#128994; Status do Pagamento</div><div class="info-value"><span style="' + statusStyle + '">' + (isConfirmado ? '&#10003;' : '&#9203;') + ' ' + statusTexto + '</span></div></div>'
    + '</div>'
    + '<p class="subtitle" style="margin-bottom:0;font-size:14px;">Para gerenciar esta reserva ou visualizar mais detalhes, acesse o painel administrativo:</p>'
    + '<div class="button-container">'
    + '<a href="' + LINK_PAINEL_ADMIN + '" class="button">&#128279; Acessar Painel Administrativo</a><br>'
    + '<a href="' + LINK_PAINEL_ADMIN + '" class="button-secondary">&#128196; Ver Detalhes da Reserva</a>'
    + '</div>'
    + '</td>'
    + '</tr>'
    + '<tr>'
    + '<td class="footer">'
    + '<div class="footer-logo">Motéis Fortaleza</div>'
    + '<p>Este e-mail foi enviado automaticamente pelo nosso sistema de gest\u00e3o de reservas.<br>Para suporte, entre em contato com a equipe de TI.</p>'
    + '<div class="social-links">'
    + '<a href="#">&#120143;</a>'
    + '<a href="#">&#120156;</a>'
    + '<a href="#">&#120157;</a>'
    + '</div>'
    + '<p style="margin-top:16px;font-size:11px;color:rgba(255,255,255,0.3);">&copy; 2026 Motéis Fortaleza. Todos os direitos reservados.</p>'
    + '</td>'
    + '</tr>'
    + '</table>'
    + '</center>'
    + '</body>'
    + '</html>';

  return html;
}

// ===== TELEGRAM (comandos do bot) =====
var TELEGRAM_TOKEN = '8775507409:AAE_ELsc4wzurqdnQ9wZtC_cnAhTXknIlj8';
var IDS_AUTORIZADOS = ['6802504310'];

function processarMensagemTelegram(msg) {
  var chatId = msg.chat.id;
  var userId = msg.from.id.toString();
  var texto = msg.text || '';

  if (IDS_AUTORIZADOS.indexOf(userId) === -1) {
    enviarMensagem(chatId, "Acesso negado.");
    return;
  }

  if (texto === '/start') {
    enviarMensagem(chatId, 'Bot Rose Online\n\nComandos disponíveis:\n'
      + '/conferirdia — Relatório financeiro\n'
      + '/resumo — Resumo do dia\n'
      + '/test — Testar bot');
  } else if (texto === '/conferirdia') {
    enviarRelatorioComBotoes(chatId);
  } else if (texto === '/resumo') {
    enviarResumoDoDia(chatId);
  } else if (texto === '/test') {
    testarTelegram(chatId);
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
    enviarMensagem(chatId, "Conferindo pagamentos no Asaas... (em breve)");
  } else if (data === 'conferir_recepcao') {
    enviarMensagem(chatId, "Buscando pendentes da recepção... (em breve)");
  }
}

function enviarRelatorioComBotoes(chatId) {
  var url = 'https://api.telegram.org/bot' + TELEGRAM_TOKEN + '/sendMessage';
  var payload = {
    chat_id: chatId,
    text: 'Relatório Financeiro:',
    reply_markup: {
      inline_keyboard: [
        [{ text: "Conferir Pagamentos Asaas", callback_data: 'conferir_asaas' }],
        [{ text: "Pendentes Recepção", callback_data: 'conferir_recepcao' }]
      ]
    }
  };
  UrlFetchApp.fetch(url, {
    method: 'post',
    payload: JSON.stringify(payload),
    contentType: 'application/json'
  });
}

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

function enviarResumoDoDia(chatId) {
  var hoje = new Date();
  var dataStr = hoje.getFullYear() + '-'
    + ('0' + (hoje.getMonth() + 1)).slice(-2) + '-'
    + ('0' + hoje.getDate()).slice(-2);

  try {
    var resultado = firebaseApi('post', ':runQuery', {
      structuredQuery: {
        from: [{ collectionId: 'reservas' }],
        where: {
          fieldFilter: {
            field: { fieldPath: 'data_reserva' },
            op: 'EQUAL',
            value: { stringValue: dataStr }
          }
        },
        limit: 200
      }
    });

    if (!resultado || resultado.error) {
      enviarMensagem(chatId, 'Erro ao buscar dados.');
      return;
    }

    var total = 0, receita = 0;
    var p = {}, m = {};

    for (var i = 0; i < resultado.length; i++) {
      if (!resultado[i].document) continue;
      var f = resultado[i].document.fields;
      var st = f.status ? f.status.stringValue : 'desconhecido';
      var ml = f.motel ? f.motel.stringValue : 'Desconhecido';
      var pr = f.preco ? parseFloat(f.preco.stringValue || f.preco.integerValue || 0) : 0;

      p[st] = (p[st] || 0) + 1;
      m[ml] = (m[ml] || 0) + 1;
      if (st === 'confirmado' || st === 'check_in') receita += pr;
      total++;
    }

    var msg = '<b>Resumo do Dia</b>';
    msg += '\n' + dataStr.split('-').reverse().join('/');
    msg += '\n━━━━━━━━━━━━━━━';
    msg += '\n\n<b>Total:</b> ' + total;
    msg += '\n\n<b>Por status:</b>';
    if (p['confirmado'])           msg += '\nConfirmado: ' + p['confirmado'];
    if (p['check_in'])             msg += '\nCheck-in: ' + p['check_in'];
    if (p['aguardando_pagamento']) msg += '\nAguardando PIX: ' + p['aguardando_pagamento'];
    if (p['pendente_cartao'])      msg += '\nPendente Cartão: ' + p['pendente_cartao'];
    if (p['pendente_recepcao'])    msg += '\nPendente Recepção: ' + p['pendente_recepcao'];
    if (p['cancelado'])            msg += '\nCancelado: ' + p['cancelado'];

    msg += '\n\n<b>Por motel:</b>';
    var mk = Object.keys(m).sort();
    for (var j = 0; j < mk.length; j++)
      msg += '\n' + mk[j] + ': ' + m[mk[j]];

    msg += '\n\n<b>Receita:</b> R$ ' + receita.toFixed(2).replace('.', ',');

    var url = 'https://api.telegram.org/bot' + TELEGRAM_TOKEN + '/sendMessage';
    UrlFetchApp.fetch(url, {
      method: 'post',
      payload: { chat_id: chatId, text: msg, parse_mode: 'HTML' },
      muteHttpExceptions: true
    });
  } catch(e) {
    enviarMensagem(chatId, 'Erro ao gerar resumo: ' + e.message);
  }
}

function testarTelegram(chatId) {
  var url = 'https://api.telegram.org/bot' + TELEGRAM_TOKEN + '/sendMessage';
  try {
    var resp = UrlFetchApp.fetch(url, {
      method: 'post',
      payload: { chat_id: chatId, text: 'TESTE OK - Bot funcionando!' },
      muteHttpExceptions: true
    });
    console.log('[TEST] Resposta Telegram:', resp.getContentText());
  } catch(e) {
    console.error('[TEST] Erro ao chamar Telegram:', e.message);
  }
}

function formatarMensagemTelegram(dados) {
  var statusTexto = '';
  switch (dados.status) {
    case 'confirmado': statusTexto = 'Confirmado'; break;
    case 'pendente_cartao': statusTexto = 'Pendente (Cartão)'; break;
    case 'pendente_recepcao': statusTexto = 'Pendente (Recepção)'; break;
    case 'aguardando_pagamento': statusTexto = 'Aguardando PIX'; break;
    default: statusTexto = dados.status || 'Desconhecido';
  }

  return '<b>Nova Reserva</b>'
    + '\nNome: ' + (dados.cliente_nome || '?')
    + '\nCPF: ' + (dados.cliente_cpf || '?')
    + '\nMotel: ' + (dados.motel || '?')
    + '\nSuite: ' + (dados.suite || '?')
    + '\nData: ' + (dados.data_reserva || '?')
    + '\nHorario: ' + (dados.hora_chegada || '?')
    + '\nPeriodo: ' + (dados.duracao || '?')
    + '\nValor: R$ ' + (dados.preco || '0') + ',00'
    + '\nProtocolo: ' + (dados.payment_id || '?')
    + '\nStatus: ' + statusTexto;
}

function enviarEmailNotificacao(dados) {
  try {
    var assunto = 'Nova Reserva - ' + (dados.motel || 'Motel') + ' (' + (dados.suite || '?') + ')';
    var htmlBody = montarHtmlReserva(dados, false);
    MailApp.sendEmail(EMAIL_NOTIFICAR, assunto, 'Para visualizar esta mensagem, use um cliente de e-mail com suporte a HTML.', {htmlBody: htmlBody});
  } catch(e) {
    console.warn('Email fail:', e);
  }
}

function enviarEmailConfirmacao(dados) {
  try {
    var assunto = '✅ Pagamento Confirmado - ' + (dados.motel || 'Motel') + ' (' + (dados.suite || '?') + ')';
    var htmlBody = montarHtmlReserva(dados, true);
    MailApp.sendEmail(EMAIL_NOTIFICAR, assunto, 'Para visualizar esta mensagem, use um cliente de e-mail com suporte a HTML.', {htmlBody: htmlBody});
  } catch(e) {
    console.warn('Email confirmacao fail:', e);
  }
}

function criarOuBuscarCliente(token, nome, cpf) {
  // Busca cliente pelo CPF
  const busca = apiAsaas(token, 'get', '/customers?cpfCnpj=' + cpf.replace(/\D/g, ''));
  if (busca.data && busca.data.length > 0) return busca.data[0].id;

  // Cria novo cliente
  const novo = apiAsaas(token, 'post', '/customers', {
    name: nome,
    cpfCnpj: cpf.replace(/\D/g, ''),
    notificationDisabled: false
  });
  if (novo.id) return novo.id;
  throw new Error('Falha ao criar cliente: ' + JSON.stringify(novo));
}

function criarCobrancaASAAS(dados) {
  const token = dados.token_asaas;

  try {
    const customerId = criarOuBuscarCliente(token, dados.cliente_nome, dados.cliente_cpf);

    const agora = new Date();
    const externalRef = dados.cliente_cpf.replace(/\D/g, '') + '_' + agora.getTime();

    // [FIX 1] dueDate = agora + 15 minutos para que o link PIX expire rapidamente
    // Isso evita que links de pagamento fiquem válidos por dias
    const dataExpiracao = new Date(agora.getTime() + 15 * 60 * 1000);
    const dueDateISO = dataExpiracao.toISOString(); // formato YYYY-MM-DDTHH:mm:ss.sssZ

    console.log('[ASAAS] Criando cobrança | cliente:', dados.cliente_nome, '| valor: R$', dados.preco, '| expira em:', dueDateISO);

    const cobranca = apiAsaas(token, 'post', '/payments', {
      customer: customerId,
      billingType: 'PIX',
      value: Number(dados.preco),
      dueDate: dueDateISO,
      description: dados.motel + ' - ' + dados.suite + ' (' + dados.duracao + ')',
      externalReference: externalRef,
      notificationDisabled: false
    });

    if (cobranca.id) {
      const url = cobranca.invoiceUrl || cobranca.pixQrCodeUrl || '';
      console.log('[ASAAS] Cobrança criada com sucesso | payment_id:', cobranca.id, '| url:', url ? 'OK' : 'VAZIA');
      return { sucesso: true, payment_id: cobranca.id, pagamento_url: url, external_reference: externalRef };
    }

    console.warn('[ASAAS] Falha ao criar cobrança:', JSON.stringify(cobranca));
    return { sucesso: false, erro: JSON.stringify(cobranca) };
  } catch (e) {
    console.error('[ASAAS] Exceção ao criar cobrança:', e.message);
    return { sucesso: false, erro: e.message };
  }
}

// ===== FIREBASE (via REST API) =====
function firebaseApi(method, path, body) {
  const projectId = 'moteisfortaleza-9dadd';
  const apiKey = 'AIzaSyCln4mcb1j46UcmG-sTVb3bUudTQCpdfvY';
  const url = 'https://firestore.googleapis.com/v1/projects/' + projectId + '/databases/(default)/documents' + path + '?key=' + apiKey;
  const opts = {
    method: method,
    headers: { 'Content-Type': 'application/json' },
    payload: body ? JSON.stringify(body) : '',
    muteHttpExceptions: true
  };
  const resp = UrlFetchApp.fetch(url, opts);
  return JSON.parse(resp.getContentText());
}

function buscarReservaPorCPF(cpf, statusAlvo) {
  const nums = cpf.replace(/\D/g, '');
  const cpfMascarado = nums.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  // Se statusAlvo for 'check_in', retorna null (nunca cancela check-in)
  if (statusAlvo === 'check_in') return null;
  const query = {
    structuredQuery: {
      where: {
        compositeFilter: {
          op: 'AND',
          filters: [
            { fieldFilter: { field: { fieldPath: 'cliente_cpf' }, op: 'EQUAL', value: { stringValue: cpfMascarado } } },
            { fieldFilter: { field: { fieldPath: 'status' }, op: 'EQUAL', value: { stringValue: statusAlvo } } }
          ]
        }
      },
      limit: 1
    }
  };
  const result = firebaseApi('post', ':runQuery', query);
  if (result && result.length > 0 && result[0].document) {
    return {
      id: result[0].document.name.split('/').pop(),
      data: result[0].document.fields
    };
  }
  if (result && result.error) {
    console.error('[FIREBASE] Erro na query buscarReservaPorCPF:', JSON.stringify(result.error));
  }
  return null;
}

// [FIX 3 + 4] atualizarStatusReserva agora registra logs de auditoria e aceita 'origem'
function atualizarStatusReserva(docId, novoStatus, origem) {
  const origemFinal = origem || 'desconhecido';
  const agora = new Date().toISOString();

  // Log de auditoria — visível no Stackdriver (Apps Script > Execuções)
  console.log('[AUDIT] Mudança de status | doc:', docId, '| novo status:', novoStatus, '| origem:', origemFinal, '| timestamp:', agora);

  const path = '/reservas/' + docId
    + '?updateMask.fieldPaths=status'
    + '&updateMask.fieldPaths=status_atualizado_em'
    + '&updateMask.fieldPaths=status_origem';

  const fields = {
    status:               { stringValue: novoStatus },
    status_atualizado_em: { stringValue: agora },
    status_origem:        { stringValue: origemFinal }
  };

  return firebaseApi('patch', path, { fields: fields });
}

// ===== WEBHOOK ASAAS =====
function processarWebhook(dados) {
  try {
    const evento = dados.event;
    const payment = dados.payment;

    if (!payment || !payment.id) {
      return ContentService.createTextOutput(JSON.stringify({ sucesso: false, erro: 'Dados inválidos' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    console.log('[WEBHOOK] Evento recebido:', evento, '| payment_id:', payment.id, '| status:', payment.status);

    // [FIX 2] Somente PAYMENT_RECEIVED confirma que o dinheiro foi RECEBIDO.
    // PAYMENT_CONFIRMED = cobrança registrada no Asaas, NÃO significa crédito real.
    // Aceitar PAYMENT_CONFIRMED causou o bug do cliente 'David'.
    if (evento === 'PAYMENT_RECEIVED') {
      var nomeCliente = payment.customer ? (payment.customer.name || '') : '';
      var valor = payment.value || '';
      console.log('[WEBHOOK] Pagamento RECEBIDO | cliente:', nomeCliente, '| valor: R$', valor, '| ref:', payment.externalReference);
      if (payment.externalReference) {
        const cpf = payment.externalReference.split('_')[0];
        const reserva = buscarReservaPorCPF(cpf, 'aguardando_pagamento');
        if (reserva) {
          console.log('[WEBHOOK] Atualizando reserva para confirmado | doc:', reserva.id);
          atualizarStatusReserva(reserva.id, 'confirmado', 'webhook_PAYMENT_RECEIVED');
          try {
            var f = reserva.data;
            var dadosReserva = {
              reserva_id:    reserva.id,
              cliente_nome:  f.cliente_nome   ? f.cliente_nome.stringValue   : '',
              cliente_cpf:   f.cliente_cpf    ? f.cliente_cpf.stringValue    : '',
              motel:         f.motel          ? f.motel.stringValue          : '',
              suite:         f.suite          ? f.suite.stringValue          : '',
              data_reserva:  f.data_reserva   ? f.data_reserva.stringValue   : '',
              hora_chegada:  f.hora_chegada   ? f.hora_chegada.stringValue   : '',
              duracao:       f.duracao        ? f.duracao.stringValue        : '',
              preco:         f.preco          ? f.preco.stringValue          : '',
              payment_id:    f.payment_id     ? (f.payment_id.stringValue || f.payment_id.integerValue) : '',
              status:        'confirmado'
            };
            enviarEmailConfirmacao(dadosReserva);
            enviarParaAutorizados(formatarMensagemTelegram(dadosReserva));
          } catch(e) {
            console.warn('[WEBHOOK] Falha ao notificar confirmacao:', e);
          }
        } else {
          console.warn('[WEBHOOK] Reserva não encontrada para CPF:', cpf, '| pode já ter sido confirmada ou cancelada');
          try {
            enviarEmailConfirmacao({
              payment_id: payment.id || '',
              cliente_nome: nomeCliente || '',
              preco: valor || '',
              status: 'confirmado'
            });
          } catch(e) { console.warn('[WEBHOOK] Email fallback fail:', e); }
        }
      }
    } else if (evento === 'PAYMENT_OVERDUE' || evento === 'PAYMENT_DELETED') {
      console.log('[WEBHOOK] Pagamento vencido/excluído | evento:', evento, '| payment_id:', payment.id, '| ref:', payment.externalReference);
      if (payment.externalReference) {
        const cpf = payment.externalReference.split('_')[0];
        const reserva = buscarReservaPorCPF(cpf, 'aguardando_pagamento');
        if (reserva) {
          console.log('[WEBHOOK] Cancelando reserva por vencimento | doc:', reserva.id);
          atualizarStatusReserva(reserva.id, 'cancelado', 'webhook_' + evento);
        } else {
          console.warn('[WEBHOOK] Reserva não encontrada para cancelamento CPF:', cpf);
        }
      }
    } else {
      // Logar eventos ignorados para rastreabilidade
      console.log('[WEBHOOK] Evento ignorado (não altera status):', evento, '| Apenas PAYMENT_RECEIVED confirma reserva.');
    }

    return ContentService.createTextOutput(JSON.stringify({ sucesso: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (e) {
    console.error('[WEBHOOK] Erro ao processar:', e.message);
    return ContentService.createTextOutput(JSON.stringify({ sucesso: false, erro: e.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// [FIX 3] Validação síncrona de pagamento antes do check-in
// Chamado pelo dashboard ANTES de liberar a entrada do hóspede
function validarCheckin(dados) {
  const token = dados.token_asaas;
  const paymentId = dados.payment_id;
  const reservaId = dados.reserva_id || '';

  console.log('[CHECKIN] Iniciando validação | payment_id:', paymentId, '| reserva_id:', reservaId);

  try {
    const pagamento = apiAsaas(token, 'get', '/payments/' + paymentId);
    const statusReal = pagamento.status;

    // Somente RECEIVED = dinheiro em conta. CONFIRMED pode ser falso positivo.
    const aprovado = statusReal === 'RECEIVED';

    console.log('[CHECKIN] Resultado | status Asaas:', statusReal, '| aprovado:', aprovado);

    if (!aprovado) {
      console.warn('[CHECKIN] BLOQUEADO | status:', statusReal, '| payment_id:', paymentId, '| reserva_id:', reservaId);
    }

    return ContentService.createTextOutput(JSON.stringify({
      sucesso:     true,
      aprovado:    aprovado,
      status_asaas: statusReal,
      motivo:      aprovado ? 'Pagamento confirmado pelo Asaas' : 'Status no Asaas: ' + statusReal + '. Apenas RECEIVED libera check-in.'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (e) {
    console.error('[CHECKIN] Erro ao consultar Asaas:', e.message);
    return ContentService.createTextOutput(JSON.stringify({
      sucesso:  false,
      aprovado: false,
      motivo:   'Erro ao consultar Asaas: ' + e.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ===== VERIFICAR PAGAMENTO (chamado pelo chat) =====
function verificarPagamento(dados) {
  const token = dados.token_asaas;
  if (!token || !token.startsWith('$')) {
    return ContentService.createTextOutput(JSON.stringify({ sucesso: true, pago: false, erro: 'Token inválido' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  try {
    const pagamento = apiAsaas(token, 'get', '/payments/' + dados.payment_id);
    const pago = pagamento.status === 'RECEIVED';

    return ContentService.createTextOutput(JSON.stringify({ sucesso: true, pago: pago, status: pagamento.status }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (e) {
    return ContentService.createTextOutput(JSON.stringify({ sucesso: false, erro: e.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function buscarTokenPorReferencia(ref) {
  // TODO: buscar o token correto do motel na configuração
  return null;
}

// ===== ADMIN: RESETAR SENHA (via Firebase Admin REST API) =====
function resetarSenhaFirebase(dados) {
  const keyJson = PropertiesService.getScriptProperties().getProperty('SERVICE_ACCOUNT_KEY');
  if (!keyJson) return { sucesso: false, erro: 'SERVICE_ACCOUNT_KEY nao configurada. Va em Propriedades do Script > SERVICE_ACCOUNT_KEY e cole o JSON da conta de servico.' };
  try {
    var key = JSON.parse(keyJson);
    var header = { alg: 'RS256', typ: 'JWT' };
    var now = Math.floor(Date.now() / 1000);
    var claim = {
      iss: key.client_email,
      scope: 'https://www.googleapis.com/auth/identitytoolkit https://www.googleapis.com/auth/firebase',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600, iat: now
    };
    var headB64 = Utilities.base64EncodeWebSafe(JSON.stringify(header));
    var claimB64 = Utilities.base64EncodeWebSafe(JSON.stringify(claim));
    var jwtInput = headB64 + '.' + claimB64;
    var signature = Utilities.computeRsaSha256(jwtInput, key.private_key);
    var jwt = jwtInput + '.' + Utilities.base64EncodeWebSafe(signature);

    var tokResp = UrlFetchApp.fetch('https://oauth2.googleapis.com/token', {
      method: 'post',
      payload: { grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt },
      muteHttpExceptions: true
    });
    var tokData = JSON.parse(tokResp.getContentText());
    if (!tokData.access_token) return { sucesso: false, erro: 'Falha ao obter token: ' + (tokData.error || JSON.stringify(tokData)) };
    var accessToken = tokData.access_token;

    // Busca usuario pelo email
    var lookupResp = UrlFetchApp.fetch('https://identitytoolkit.googleapis.com/v1/projects/moteisfortaleza-9dadd/accounts:lookup', {
      method: 'post',
      headers: { 'Authorization': 'Bearer ' + accessToken, 'Content-Type': 'application/json' },
      payload: JSON.stringify({ email: [dados.email] }),
      muteHttpExceptions: true
    });
    var lookupData = JSON.parse(lookupResp.getContentText());
    if (!lookupData.users || !lookupData.users[0]) return { sucesso: false, erro: 'Usuario nao encontrado no Firebase Auth.' };
    var localId = lookupData.users[0].localId;

    // Atualiza senha
    var updateResp = UrlFetchApp.fetch('https://identitytoolkit.googleapis.com/v1/projects/moteisfortaleza-9dadd/accounts:update', {
      method: 'post',
      headers: { 'Authorization': 'Bearer ' + accessToken, 'Content-Type': 'application/json' },
      payload: JSON.stringify({ localId: localId, password: dados.nova_senha }),
      muteHttpExceptions: true
    });
    var updateData = JSON.parse(updateResp.getContentText());
    if (updateData.error) return { sucesso: false, erro: updateData.error.message };
    if (!updateData.localId) return { sucesso: false, erro: 'Falha ao atualizar senha.' };
    return { sucesso: true };
  } catch (e) {
    return { sucesso: false, erro: e.message };
  }
}

function deletarDocumentoFirestore(path) {
  return firebaseApi('delete', path, null);
}

// ===== LIMPEZA DE RESERVAS EXPIRADAS E ANTIGAS =====
// Esta função pode ser chamada manualmente (via doPost com acao='limpar_expiradas')
// ou agendada como trigger no Apps Script (Editar > Triggers do projeto > + Adicionar Trigger)
// Configure para executar a cada 15 minutos (limpa expiradas) ou 1x ao dia (deleta canceladas antigas).
function limparReservasExpiradas() {
  console.log('[LIMPEZA] Iniciando verificação...');
  try {
    const agora = new Date().getTime();
    const TEMPO_EXPIRACAO = 20 * 60 * 1000;      // 20 min para cancelar PIX não pago
    const TEMPO_DELECAO = 7 * 24 * 60 * 60 * 1000; // 7 dias para deletar canceladas
    var canceladas = 0;
    var deletadas = 0;

    // 1) Busca reservas aguardando pagamento para verificar no Asaas
    var queryPendentes = {
      structuredQuery: {
        where: {
          compositeFilter: {
            op: 'AND',
            filters: [
              { fieldFilter: { field: { fieldPath: 'status' }, op: 'EQUAL', value: { stringValue: 'aguardando_pagamento' } } }
            ]
          }
        },
        limit: 50
      }
    };
    var pendentes = firebaseApi('post', ':runQuery', queryPendentes);
    if (pendentes && pendentes.length) {
      // Carrega tokens dos motéis para consultar Asaas
      var configSnap = firebaseApi('get', '/config/motels', null);
      var tokensPorMotel = {};
      if (configSnap && configSnap.fields && configSnap.fields.motels && configSnap.fields.motels.mapValue) {
        var motelsMap = configSnap.fields.motels.mapValue.fields;
        Object.keys(motelsMap).forEach(function(nome) {
          if (motelsMap[nome].mapValue && motelsMap[nome].mapValue.fields && motelsMap[nome].mapValue.fields.token_asaas) {
            tokensPorMotel[nome] = motelsMap[nome].mapValue.fields.token_asaas.stringValue || '';
          }
        });
      }

      for (var i = 0; i < pendentes.length; i++) {
        if (!pendentes[i].document) continue;
        var fields = pendentes[i].document.fields;
        var docId = pendentes[i].document.name.split('/').pop();
        if (!fields.payment_id) continue;
        var paymentId = fields.payment_id.stringValue || fields.payment_id.integerValue || '';
        var motelNome = fields.motel ? (fields.motel.stringValue || '') : '';
        var tokenAsaas = tokensPorMotel[motelNome] || (fields.token_asaas ? fields.token_asaas.stringValue : '');
        var criadoEm = fields.criado_em ? new Date(fields.criado_em.stringValue).getTime() : 0;

        // Se tem token, consulta status real no Asaas
        if (paymentId && tokenAsaas && tokenAsaas.startsWith('$')) {
          try {
            var pagInfo = apiAsaas(tokenAsaas, 'get', '/payments/' + paymentId);
            if (pagInfo && pagInfo.status) {
              if (pagInfo.status === 'RECEIVED') {
                // Pagamento foi recebido! Atualiza para confirmado
                console.log('[LIMPEZA] Pagamento RECEBIDO detectado via consulta Asaas | doc:', docId, '| payment:', paymentId);
                atualizarStatusReserva(docId, 'confirmado', 'limpeza_consulta_asaas');
                continue; // não cancela
              }
              if (pagInfo.status === 'PENDING' || pagInfo.status === 'CONFIRMED') {
                // Ainda não expirou ou está pendente, não faz nada
                continue;
              }
            }
          } catch(e) {
            console.warn('[LIMPEZA] Erro ao consultar Asaas | doc:', docId, '| payment:', paymentId, '| erro:', e.message);
          }
        }

        // Sem token ou sem payment_id: verifica apenas por tempo
        if (criadoEm && (agora - criadoEm > TEMPO_EXPIRACAO)) {
          console.log('[LIMPEZA] Cancelando reserva expirada | doc:', docId, '| criado_em:', fields.criado_em ? fields.criado_em.stringValue : '?');
          atualizarStatusReserva(docId, 'cancelado', 'limpeza_automatica_expirada');
          canceladas++;
        }
      }
    }

    // 2) Deleta reservas canceladas com mais de 7 dias (para não acumular no painel)
    var queryCanceladas = {
      structuredQuery: {
        where: {
          compositeFilter: {
            op: 'AND',
            filters: [
              { fieldFilter: { field: { fieldPath: 'status' }, op: 'EQUAL', value: { stringValue: 'cancelado' } } }
            ]
          }
        },
        limit: 50
      }
    };
    var canceladasLista = firebaseApi('post', ':runQuery', queryCanceladas);
    if (canceladasLista && canceladasLista.length) {
      for (var j = 0; j < canceladasLista.length; j++) {
        if (!canceladasLista[j].document) continue;
        var f2 = canceladasLista[j].document.fields;
        var docId2 = canceladasLista[j].document.name.split('/').pop();
        if (!f2.criado_em) continue;
        var criadoEm2 = new Date(f2.criado_em.stringValue).getTime();
        if (agora - criadoEm2 > TEMPO_DELECAO) {
          console.log('[LIMPEZA] Deletando reserva cancelada antiga | doc:', docId2, '| criado_em:', f2.criado_em.stringValue);
          deletarDocumentoFirestore('/reservas/' + docId2);
          deletadas++;
        }
      }
    }

    console.log('[LIMPEZA] Concluído | canceladas:', canceladas, '| deletadas:', deletadas);
    return { sucesso: true, canceladas: canceladas, deletadas: deletadas };
  } catch (e) {
    console.error('[LIMPEZA] Erro:', e.message);
    return { sucesso: false, erro: e.message };
  }
}
