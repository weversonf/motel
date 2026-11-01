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
    const dados = JSON.parse(e.postData.contents);
    const resposta = { sucesso: false, pagamento_url: '', payment_id: '', external_reference: '', erro: '' };

    // Webhook do ASAAS
    if (dados.event && dados.payment) {
      return processarWebhook(dados);
    }

    // Verificar status de pagamento
    if (dados.acao === 'verificar_pagamento' && dados.payment_id) {
      if (!dados.token_asaas || !dados.token_asaas.startsWith('$')) {
        dados.token_asaas = obterTokenMotel(dados.motel, dados.token_asaas);
      }
      return verificarPagamento(dados);
    }

    // [SEGURANÇA] Validar pagamento antes do check-in (chamado pelo dashboard)
    if (dados.acao === 'checkin_validar' && dados.payment_id) {
      if (!dados.token_asaas || !dados.token_asaas.startsWith('$')) {
        dados.token_asaas = obterTokenMotel(dados.motel, dados.token_asaas);
      }
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

    // Enviar comprovante por e-mail para o cliente (opcional / LGPD)
    if (dados.acao === 'enviar_comprovante_cliente' && dados.email_destino) {
      enviarComprovanteParaCliente(dados);
      return ContentService.createTextOutput(JSON.stringify({ sucesso: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Notificar (Telegram + email)
    if (dados.acao === 'notificar' || dados.acao === 'notificar_telegram') {
      enviarEmailNotificacao(dados);
      return ContentService.createTextOutput(JSON.stringify({ sucesso: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Criar nova cobrança
    const tokenAsaas = obterTokenMotel(dados.motel, dados.token_asaas);
    if (tokenAsaas && tokenAsaas.startsWith('$')) {
      dados.token_asaas = tokenAsaas;
      const resultado = criarCobrancaASAAS(dados);
      if (resultado.sucesso) {
        resposta.pagamento_url = resultado.pagamento_url;
        resposta.payment_id = resultado.payment_id;
        resposta.external_reference = resultado.external_reference;
        resposta.sucesso = true;
        dados.payment_id = resultado.payment_id;
        dados.status = dados.status || 'aguardando_pagamento';
        enviarEmailNotificacao(dados);
      } else {
        resposta.erro = 'ERRO_ASAAS: ' + resultado.erro;
        resposta.sucesso = false;
      }
    } else {
      resposta.erro = 'Chave do Asaas não configurada para o motel "' + (dados.motel || 'não informado') + '". Configure no painel ou avise a recepção.';
      resposta.sucesso = false;
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

function obterTokenMotel(motelNome, tokenInformado) {
  if (tokenInformado && tokenInformado.startsWith('$')) {
    return tokenInformado;
  }
  // 1. Lê exclusivamente das ScriptProperties. Os aliases mantêm
  // compatibilidade entre o nome exibido no Chat e as chaves já existentes.
  try {
    const props = PropertiesService.getScriptProperties();
    if (props) {
      const nomeNorm = (motelNome || '').toUpperCase().replace(/[^A-Z0-9]/g, '_');
      const aliases = {
        'MOTEL_DRAGON': ['TOKEN_MOTEL_DRAGON', 'TOKEN_DRAGON'],
        'DRAGON_MOTEL': ['TOKEN_MOTEL_DRAGON', 'TOKEN_DRAGON'],
        'DRAGON': ['TOKEN_MOTEL_DRAGON', 'TOKEN_DRAGON'],
        'DREAMS': ['TOKEN_DREAMS'],
        'ASSAHI': ['TOKEN_ASSAHI'],
        'SPA_URBANO': ['TOKEN_SPA_URBANO']
      };
      const chaves = ['TOKEN_' + nomeNorm].concat(aliases[nomeNorm] || [], [motelNome]);
      for (var i = 0; i < chaves.length; i++) {
        const tokenProp = props.getProperty(chaves[i]);
        if (tokenProp && tokenProp.startsWith('$')) return tokenProp;
      }
    }
  } catch(e) {
    console.warn('Erro ao ler ScriptProperties:', e);
  }
  // 2. Tenta buscar do Firestore config/motels (com cache em memória por execução)
  try {
    if (!globalThis._cacheConfigMotels) {
      globalThis._cacheConfigMotels = firebaseApi('get', '/config/motels', null);
    }
    const configSnap = globalThis._cacheConfigMotels;
    if (configSnap && configSnap.fields && configSnap.fields.motels && configSnap.fields.motels.mapValue) {
      const motelsMap = configSnap.fields.motels.mapValue.fields;
      if (motelsMap[motelNome] && motelsMap[motelNome].mapValue && motelsMap[motelNome].mapValue.fields) {
        const t = motelsMap[motelNome].mapValue.fields.token_asaas ? motelsMap[motelNome].mapValue.fields.token_asaas.stringValue : '';
        if (t && t.startsWith('$')) return t;
      }
    }
  } catch(e) {}

  return '';
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

// ===== NOTIFICAÇÃO TELEGRAM + EMAIL =====
var EMAIL_NOTIFICAR = 'weversonf@gmail.com';
var IDS_AUTORIZADOS_PADRAO = ['8649472512', '6802504310'];

function obterTokenTelegram() {
  try {
    return (PropertiesService.getScriptProperties().getProperty('TELEGRAM_BOT_TOKEN') || '').trim();
  } catch (e) {
    return '';
  }
}

function obterIdsAutorizados() {
  var lista = IDS_AUTORIZADOS_PADRAO.slice();
  try {
    var extra = (PropertiesService.getScriptProperties().getProperty('TELEGRAM_CHAT_ID') || '').trim();
    if (extra) {
      extra.split(',').forEach(function(id) {
        var limpo = id.trim();
        if (limpo && lista.indexOf(limpo) === -1) lista.push(limpo);
      });
    }
  } catch (e) {}
  return lista;
}

function enviarParaAutorizados(mensagem) {
  var token = obterTokenTelegram();
  if (!token) {
    console.warn('[TELEGRAM] TELEGRAM_BOT_TOKEN não configurado nas ScriptProperties.');
    return;
  }
  var url = 'https://api.telegram.org/bot' + token + '/sendMessage';
  obterIdsAutorizados().forEach(function(chatId) {
    try {
      UrlFetchApp.fetch(url, {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify({ chat_id: String(chatId).trim(), text: mensagem, parse_mode: 'HTML' }),
        muteHttpExceptions: true
      });
    } catch (e) {
      console.warn('[TELEGRAM] Falha ao enviar para ' + chatId + ':', e.message);
    }
  });
}

function formatarMensagemTelegram(dados, tituloPersonalizado) {
  var statusTexto = '';
  switch (dados.status) {
    case 'confirmado': statusTexto = '✅ Confirmado (Pago)'; break;
    case 'pendente_cartao': statusTexto = '⏳ A pagar no motel (Cartão)'; break;
    case 'pendente_recepcao': statusTexto = '⏳ Pendente (Recepção)'; break;
    case 'aguardando_pagamento': statusTexto = '⏳ Aguardando PIX'; break;
    default: statusTexto = dados.status || 'Aguardando PIX';
  }
  var titulo = tituloPersonalizado || dados.titulo_telegram || (dados.status === 'confirmado' ? '✅ <b>Reserva Confirmada (Pagamento Recebido)</b>' : '🔔 <b>Nova Reserva Iniciada</b>');
  return titulo
    + '\n🏨 Motel: <b>' + (dados.motel || '?') + '</b>'
    + '\n🛏 Suíte: ' + (dados.suite || '?')
    + '\n👤 Cliente: ' + (dados.cliente_nome || '?')
    + (dados.cliente_cpf ? '\n🆔 CPF: ' + dados.cliente_cpf : '')
    + (dados.data_reserva ? '\n📅 Data: ' + dados.data_reserva + (dados.hora_chegada ? ' às ' + dados.hora_chegada : '') : '')
    + (dados.duracao ? '\n⏳ Período: ' + dados.duracao : '')
    + '\n💰 Valor: R$ ' + (dados.preco || '0')
    + (dados.payment_id ? '\n📋 Pagamento: ' + dados.payment_id : '')
    + '\n📌 Status: ' + statusTexto;
}

function enviarEmailNotificacao(dados) {
  try {
    enviarParaAutorizados(formatarMensagemTelegram(dados));
  } catch (e) {
    console.warn('[TELEGRAM] Erro ao notificar reserva:', e);
  }
  try {
    var enviarEmail = PropertiesService.getScriptProperties().getProperty('ENVIAR_EMAIL');
    if (enviarEmail === 'false') return;
    var statusTexto = dados.status === 'pendente_recepcao' ? 'Pendente (Recepção)' : (dados.status === 'pendente_cartao' ? 'A pagar no motel (Cartão)' : 'Aguardando PIX');
    var assunto = 'Nova Reserva - ' + (dados.motel || 'Motel') + ' (' + (dados.suite || '?') + ')';
    var corpo = 'NOVA RESERVA\n━━━━━━━━━━━━━━\n\n'
      + 'Motel: ' + (dados.motel || '?') + '\n'
      + 'Suíte: ' + (dados.suite || '?') + '\n'
      + 'Período: ' + (dados.duracao || '?') + '\n'
      + 'Valor: R$ ' + (dados.preco || '0') + '\n\n'
      + 'Cliente: ' + (dados.cliente_nome || '?') + '\n'
      + 'CPF: ' + (dados.cliente_cpf || '?') + '\n'
      + 'Data: ' + (dados.data_reserva || '?') + ' às ' + (dados.hora_chegada || '?') + '\n\n'
      + 'Status: ' + statusTexto;
    MailApp.sendEmail(EMAIL_NOTIFICAR, assunto, corpo);
  } catch(e) {
    console.warn('Email fail:', e.message);
  }
}

function enviarComprovanteParaCliente(dados) {
  try {
    const assunto = '✅ Comprovante da sua Pré-Reserva - ' + (dados.motel || 'Motéis Fortaleza') + ' (' + (dados.suite || '') + ')';
    const htmlBody = '<div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;border:1px solid #e0d0e8;border-radius:14px;padding:20px;background:#fff">'
      + '<h2 style="color:#d20150;text-align:center;margin-top:0">Pré-Reserva Confirmada</h2>'
      + '<p style="text-align:center;font-size:14px;color:#555">Olá <b>' + (dados.cliente_nome || 'Cliente') + '</b>, aqui está a via de comprovação da sua reserva.</p>'
      + '<div style="background:#fdf2f8;border-radius:10px;padding:15px;margin:15px 0">'
      + '<p style="margin:5px 0"><b>Motel:</b> ' + (dados.motel || '') + '</p>'
      + '<p style="margin:5px 0"><b>Suíte:</b> ' + (dados.suite || '') + '</p>'
      + '<p style="margin:5px 0"><b>Período:</b> ' + (dados.duracao || '') + '</p>'
      + '<p style="margin:5px 0"><b>Data:</b> ' + (dados.data_reserva || '') + '</p>'
      + '<p style="margin:5px 0"><b>Horário:</b> ' + (dados.hora_chegada || '') + '</p>'
      + '<p style="margin:5px 0"><b>Valor:</b> R$ ' + (dados.preco || '0') + ',00</p>'
      + '<p style="margin:5px 0"><b>Protocolo:</b> ' + (dados.protocolo || '') + '</p>'
      + '</div>'
      + '<p style="text-align:center;font-size:13px;color:#888">Apresente seu CPF e este protocolo na recepção ao chegar.</p>'
      + '</div>';
    MailApp.sendEmail(dados.email_destino, assunto, 'Sua pré-reserva foi confirmada com sucesso.', { htmlBody: htmlBody });
  } catch(e) {
    console.warn('Erro ao enviar e-mail para cliente:', e);
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
    const externalRef = dados.reserva_id ? String(dados.reserva_id) : (dados.cliente_cpf.replace(/\D/g, '') + '_' + agora.getTime());

    // [FIX] O Asaas aceita apenas a data (YYYY-MM-DD) em dueDate
    // Isso evita que links de pagamento fiquem válidos por dias
    const dueDateStr = agora.toISOString().slice(0, 10);

    console.log('[ASAAS] Criando cobrança | cliente:', dados.cliente_nome, '| valor: R$', dados.preco, '| expira em:', dueDateStr);

    const cobranca = apiAsaas(token, 'post', '/payments', {
      customer: customerId,
      billingType: 'PIX',
      value: Number(dados.preco),
      dueDate: dueDateStr,
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

function buscarReservaPorPaymentId(paymentId) {
  if (!paymentId) return null;
  const query = {
    structuredQuery: {
      where: {
        fieldFilter: { field: { fieldPath: 'payment_id' }, op: 'EQUAL', value: { stringValue: String(paymentId) } }
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
  return null;
}

function buscarReservaPorDocId(docId) {
  if (!docId) return null;
  const result = firebaseApi('get', '/reservas/' + docId, null);
  if (result && result.fields) {
    return {
      id: docId,
      data: result.fields
    };
  }
  return null;
}

function buscarReservaPorCPF(cpf, statusAlvo) {
  const nums = cpf.replace(/\D/g, '');
  const cpfMascarado = nums.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  if (statusAlvo === 'check_in') return null;
  
  var filter;
  if (statusAlvo) {
    filter = {
      compositeFilter: {
        op: 'AND',
        filters: [
          { fieldFilter: { field: { fieldPath: 'cliente_cpf' }, op: 'EQUAL', value: { stringValue: cpfMascarado } } },
          { fieldFilter: { field: { fieldPath: 'status' }, op: 'EQUAL', value: { stringValue: statusAlvo } } }
        ]
      }
    };
  } else {
    filter = {
      fieldFilter: { field: { fieldPath: 'cliente_cpf' }, op: 'EQUAL', value: { stringValue: cpfMascarado } }
    };
  }

  const query = {
    structuredQuery: {
      where: filter,
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

// [ATUALIZAÇÃO DE STATUS ROBUSTA] Registra logs de auditoria e garante sincronização Asaas
function atualizarStatusReserva(docId, novoStatus, origem, statusAsaas, paymentId) {
  const origemFinal = origem || 'desconhecido';
  const agora = new Date().toISOString();

  console.log('[AUDIT] Mudança de status | doc:', docId, '| novo status:', novoStatus, '| origem:', origemFinal, '| timestamp:', agora);

  var path = '/reservas/' + docId
    + '?updateMask.fieldPaths=status'
    + '&updateMask.fieldPaths=status_atualizado_em'
    + '&updateMask.fieldPaths=status_origem';

  var isPago = (novoStatus === 'confirmado');
  var fields = {
    status:               { stringValue: novoStatus },
    status_atualizado_em: { stringValue: agora },
    status_origem:        { stringValue: origemFinal }
  };

  if (isPago) {
    // Confirmacao: marca explicitamente o pagamento.
    path += '&updateMask.fieldPaths=status_pagamento'
      + '&updateMask.fieldPaths=asaas_paid';
    fields.status_pagamento = { stringValue: 'pago' };
    fields.asaas_paid       = { booleanValue: true };
  } else {
    // Cancelamento: NAO apaga as marcas de pagamento; registra o status anterior.
    var statusAnterior = '';
    try {
      var atual = firebaseApi('get', '/reservas/' + docId, null);
      if (atual && atual.fields && atual.fields.status && atual.fields.status.stringValue) {
        statusAnterior = atual.fields.status.stringValue;
      }
    } catch (e) {
      console.warn('[AUDIT] Nao foi possivel ler o status anterior:', e.message);
    }
    path += '&updateMask.fieldPaths=status_anterior';
    fields.status_anterior = { stringValue: statusAnterior };
  }

  if (statusAsaas) {
    path += '&updateMask.fieldPaths=status_asaas_confirmado';
    fields.status_asaas_confirmado = { stringValue: String(statusAsaas) };
  }
  if (paymentId) {
    path += '&updateMask.fieldPaths=payment_id';
    fields.payment_id = { stringValue: String(paymentId) };
  }

  return firebaseApi('patch', path, { fields: fields });
}

// ===== REGRA CENTRAL DE CANCELAMENTO =====
// Uma reserva jamais pode ser cancelada por cronômetro local. Antes de aceitar
// um evento terminal, consultamos todas as cobranças ligadas à reserva no Asaas.
// Caso a consulta falhe ou fique ambígua, preservamos a reserva para auditoria.
var STATUS_ASAAS_PAGO = ['RECEIVED', 'CONFIRMED', 'RECEIVED_IN_CASH'];
var STATUS_ASAAS_CANCELAVEL = ['OVERDUE', 'DELETED'];

function valorCampo(fields, nome) {
  if (!fields || !fields[nome]) return '';
  var valor = fields[nome];
  return valor.stringValue || valor.integerValue || valor.doubleValue || '';
}

function reservaJaEstaPaga(fields) {
  var status = String(valorCampo(fields, 'status')).toLowerCase();
  var pagamento = String(valorCampo(fields, 'status_pagamento')).toLowerCase();
  var asaas = String(valorCampo(fields, 'status_asaas_confirmado')).toUpperCase();
  return status === 'confirmado' || pagamento === 'pago'
    || (fields && fields.asaas_paid && fields.asaas_paid.booleanValue === true)
    || STATUS_ASAAS_PAGO.indexOf(asaas) >= 0;
}

function avaliarCancelamentoNoAsaas(reserva, payment) {
  var fields = reserva && reserva.data ? reserva.data : {};
  if (!reserva || !reserva.id) return { seguroParaCancelar: false, motivo: 'reserva_nao_encontrada' };
  if (reservaJaEstaPaga(fields)) return { seguroParaCancelar: false, pago: true, motivo: 'pagamento_local' };

  var motel = valorCampo(fields, 'motel');
  var token = obterTokenMotel(motel, valorCampo(fields, 'token_asaas'));
  if (!token || !token.startsWith('$')) return { seguroParaCancelar: false, motivo: 'token_indisponivel' };

  var cobrancas = [];
  var referencia = (payment && payment.externalReference) || reserva.id;
  try {
    var lista = apiAsaas(token, 'get', '/payments?externalReference=' + encodeURIComponent(referencia) + '&limit=50');
    cobrancas = (lista && Array.isArray(lista.data)) ? lista.data : [];

    // Reservas antigas podem não ter externalReference igual ao docId.
    if (!cobrancas.length && payment && payment.id) {
      var individual = apiAsaas(token, 'get', '/payments/' + payment.id);
      if (individual && individual.id) cobrancas = [individual];
    }
  } catch (e) {
    console.warn('[ASAAS] Falha ao validar cancelamento; reserva preservada | doc:', reserva.id, '| erro:', e.message);
    return { seguroParaCancelar: false, motivo: 'consulta_asaas_falhou' };
  }

  if (!cobrancas.length) return { seguroParaCancelar: false, motivo: 'cobranca_nao_localizada' };

  var paga = null;
  for (var i = 0; i < cobrancas.length; i++) {
    if (STATUS_ASAAS_PAGO.indexOf(String(cobrancas[i].status || '').toUpperCase()) >= 0) {
      paga = cobrancas[i];
      break;
    }
  }
  if (paga) {
    atualizarStatusReserva(reserva.id, 'confirmado', 'reconciliacao_asaas_pagamento_tardio', paga.status, paga.id);
    return { seguroParaCancelar: false, pago: true, motivo: 'pagamento_asaas', payment: paga };
  }

  var cobrancaDoEvento = null;
  for (var j = 0; j < cobrancas.length; j++) {
    if (payment && cobrancas[j].id === payment.id) { cobrancaDoEvento = cobrancas[j]; break; }
  }
  if (!cobrancaDoEvento) return { seguroParaCancelar: false, motivo: 'evento_nao_corresponde_a_cobranca' };

  var statusAtual = String(cobrancaDoEvento.status || '').toUpperCase();
  return {
    seguroParaCancelar: STATUS_ASAAS_CANCELAVEL.indexOf(statusAtual) >= 0,
    motivo: statusAtual || 'status_indefinido'
  };
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

    // Eventos que confirmam pagamento: PAYMENT_RECEIVED ou PAYMENT_CONFIRMED
    if (evento === 'PAYMENT_RECEIVED' || evento === 'PAYMENT_CONFIRMED') {
      var nomeCliente = payment.customer ? (payment.customer.name || '') : '';
      var valor = payment.value || '';
      console.log('[WEBHOOK] Pagamento APROVADO | evento:', evento, '| cliente:', nomeCliente, '| valor: R$', valor, '| ref:', payment.externalReference);

      var reserva = null;

      // 1. Se externalReference for o próprio ID do documento Firestore (sem underline), atualiza direto (imune a cotas de leitura)
      if (payment.externalReference && !payment.externalReference.includes('_')) {
        console.log('[WEBHOOK] externalReference é docId direto:', payment.externalReference);
        atualizarStatusReserva(payment.externalReference, 'confirmado', 'webhook_' + evento, evento, payment.id);
        reserva = { id: payment.externalReference };
      }

      // 2. Busca prioritária direta por payment_id
      if (!reserva) {
        reserva = buscarReservaPorPaymentId(payment.id);
      }

      // Sem payment_id ou docId, não alteramos automaticamente. CPF não é
      // vínculo único: o mesmo cliente pode gerar mais de uma reserva.

      if (reserva) {
        console.log('[WEBHOOK] Reserva confirmada com sucesso | doc:', reserva.id);
        if (payment.externalReference && payment.externalReference.includes('_')) {
          atualizarStatusReserva(reserva.id, 'confirmado', 'webhook_' + evento, evento, payment.id);
        }
        try {
          var fConf = reserva.data || {};
          enviarParaAutorizados(formatarMensagemTelegram({
            motel: valorCampo(fConf, 'motel') || (payment.description ? payment.description.split(' - ')[0] : '?'),
            suite: valorCampo(fConf, 'suite') || (payment.description || '?'),
            duracao: valorCampo(fConf, 'duracao') || '',
            preco: valor || valorCampo(fConf, 'preco') || '0',
            cliente_nome: valorCampo(fConf, 'cliente_nome') || nomeCliente || '?',
            cliente_cpf: valorCampo(fConf, 'cliente_cpf') || '',
            data_reserva: valorCampo(fConf, 'data_reserva') || '',
            hora_chegada: valorCampo(fConf, 'hora_chegada') || '',
            payment_id: payment.id || '',
            status: 'confirmado'
          }, '✅ <b>Pagamento Confirmado no Asaas</b>'));
        } catch(e) { console.warn('[WEBHOOK] Telegram fail:', e); }
        try {
          MailApp.sendEmail(EMAIL_NOTIFICAR, '✅ Pagamento Recebido - ' + (payment.id || ''),
            'Pagamento recebido no Asaas e reserva confirmada:\n\nCliente: ' + nomeCliente + '\nValor: R$ ' + valor + '\nID Asaas: ' + (payment.id || '') + '\nDoc Reserva: ' + reserva.id + '\nEvento: ' + evento);
        } catch(e) { console.warn('[WEBHOOK] Email fail:', e); }
      } else {
        console.warn('[WEBHOOK] Reserva não encontrada por vínculo único | payment_id:', payment.id, '| ref:', payment.externalReference);
        try {
          enviarParaAutorizados('⚠️ <b>Pagamento Recebido Sem Reserva Vinculada</b>\n👤 Cliente: ' + (nomeCliente || '?') + '\n💰 Valor: R$ ' + valor + '\n📋 ID Asaas: ' + (payment.id || '') + '\n🔗 Ref: ' + (payment.externalReference || ''));
        } catch(e) {}
        try {
          MailApp.sendEmail(EMAIL_NOTIFICAR, '⚠️ Pagamento Recebido Sem Reserva Vinculada',
            'Pagamento recebido no Asaas, mas reserva não foi encontrada no banco:\n\nCliente: ' + nomeCliente + '\nValor: R$ ' + valor + '\nID Asaas: ' + (payment.id || '') + '\nRef: ' + (payment.externalReference || '') + '\nEvento: ' + evento);
        } catch(e) { console.warn('[WEBHOOK] Email fallback fail:', e); }
      }
    } else if (evento === 'PAYMENT_OVERDUE' || evento === 'PAYMENT_DELETED') {
      console.log('[WEBHOOK] Pagamento vencido/excluído | evento:', evento, '| payment_id:', payment.id, '| ref:', payment.externalReference);
      var reservaCanc = buscarReservaPorPaymentId(payment.id);
      if (!reservaCanc && payment.externalReference && !payment.externalReference.includes('_')) {
        reservaCanc = buscarReservaPorDocId(payment.externalReference);
      }
      if (reservaCanc) {
        var decisao = avaliarCancelamentoNoAsaas(reservaCanc, payment);
        if (decisao.seguroParaCancelar) {
          console.log('[WEBHOOK] Cancelando reserva validada pelo Asaas | doc:', reservaCanc.id);
          atualizarStatusReserva(reservaCanc.id, 'cancelado', 'webhook_' + evento, evento, payment.id);
        } else {
          console.warn('[WEBHOOK] Cancelamento bloqueado para preservar reserva | doc:', reservaCanc.id, '| motivo:', decisao.motivo);
        }
      } else {
        console.warn('[WEBHOOK] Reserva não encontrada com vínculo inequívoco para cancelamento payment_id:', payment.id);
      }
    } else {
      console.log('[WEBHOOK] Evento informativo ignorado:', evento, '| payment_id:', payment.id);
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
  const STATUS_PAGO = ['RECEIVED', 'CONFIRMED', 'RECEIVED_IN_CASH'];

  // Token indisponivel: NAO afirmamos que nao foi pago (isso faria o chat cancelar).
  if (!token || !token.startsWith('$')) {
    return ContentService.createTextOutput(JSON.stringify({ sucesso: false, pago: null, erro: 'Token invalido' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  try {
    // 1) Uma reserva pode ter mais de uma cobranca (ex.: PIX abandonado).
    //    Se QUALQUER uma estiver paga, consideramos pago.
    const extRef = dados.external_reference || dados.reserva_id || '';
    if (extRef) {
      const lista = apiAsaas(token, 'get', '/payments?externalReference=' + encodeURIComponent(extRef) + '&limit=50');
      const arr = (lista && lista.data) ? lista.data : [];
      var pagoItem = null;
      for (var i = 0; i < arr.length; i++) {
        if (STATUS_PAGO.indexOf(arr[i].status) >= 0) { pagoItem = arr[i]; break; }
      }
      if (pagoItem) {
        return ContentService.createTextOutput(JSON.stringify({ sucesso: true, pago: true, status: pagoItem.status, payment_id: pagoItem.id }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      if (arr.length) {
        var statusNaoPago = arr[0].status;
        for (var j = 0; j < arr.length; j++) {
          if (arr[j].status === 'OVERDUE') { statusNaoPago = 'OVERDUE'; }
        }
        return ContentService.createTextOutput(JSON.stringify({ sucesso: true, pago: false, status: statusNaoPago }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }

    // 2) Fallback: consulta a cobranca especifica pelo payment_id
    if (dados.payment_id) {
      const pagamento = apiAsaas(token, 'get', '/payments/' + dados.payment_id);
      const pago = STATUS_PAGO.indexOf(pagamento.status) >= 0;
      return ContentService.createTextOutput(JSON.stringify({ sucesso: true, pago: pago, status: pagamento.status || 'UNKNOWN' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 3) Nada consultado: resposta nao autoritativa (o chat nao deve cancelar)
    return ContentService.createTextOutput(JSON.stringify({ sucesso: false, pago: null, erro: 'Sem referencia de pagamento' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (e) {
    // Erro ao consultar o Asaas: resposta nao autoritativa.
    return ContentService.createTextOutput(JSON.stringify({ sucesso: false, pago: null, erro: e.message }))
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
    var docsPendentes = (pendentes || []).filter(function(item) { return item && item.document; });
    if (docsPendentes.length > 0) {
      // Carrega tokens dos motéis apenas se houver reservas pendentes
      if (!globalThis._cacheConfigMotels) {
        globalThis._cacheConfigMotels = firebaseApi('get', '/config/motels', null);
      }
      var configSnap = globalThis._cacheConfigMotels;
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

        // Regra de ouro: se qualquer cobranca estiver paga, confirma; se NAO
        // conseguirmos confirmar no Asaas, NAO cancela por tempo.
        var STATUS_PAGO_LIMPEZA = ['RECEIVED', 'CONFIRMED', 'RECEIVED_IN_CASH'];
        var indeterminado = true;
        if (tokenAsaas && tokenAsaas.startsWith('$')) {
          try {
            var listaExp = apiAsaas(tokenAsaas, 'get', '/payments?externalReference=' + encodeURIComponent(docId) + '&limit=50');
            var arrExp = (listaExp && listaExp.data) ? listaExp.data : [];
            if (!arrExp.length && paymentId) {
              var pagInfo = apiAsaas(tokenAsaas, 'get', '/payments/' + paymentId);
              if (pagInfo && pagInfo.status) arrExp = [pagInfo];
            }
            if (arrExp.length) {
              var pagoExp = null;
              for (var p = 0; p < arrExp.length; p++) {
                if (STATUS_PAGO_LIMPEZA.indexOf(arrExp[p].status) >= 0) { pagoExp = arrExp[p]; break; }
              }
              if (pagoExp) {
                console.log('[LIMPEZA] Pagamento ja recebido; confirmando | doc:', docId, '| payment:', pagoExp.id);
                atualizarStatusReserva(docId, 'confirmado', 'limpeza_consulta_asaas');
                continue;
              }
              var statusExp = arrExp[0].status;
              for (var q = 0; q < arrExp.length; q++) {
                if (arrExp[q].status === 'OVERDUE') { statusExp = 'OVERDUE'; }
              }
              if (statusExp === 'PENDING' || statusExp === 'AWAITING_RISK_ANALYSIS') {
                continue;
              }
              indeterminado = false;
            }
          } catch(e) {
            console.warn('[LIMPEZA] Erro ao consultar Asaas (nao cancelando) | doc:', docId, '| erro:', e.message);
            indeterminado = true;
          }
        }

        if (indeterminado) {
          console.log('[LIMPEZA] Sem confirmacao do Asaas; reserva NAO cancelada | doc:', docId);
          continue;
        }

        if (criadoEm && (agora - criadoEm > TEMPO_EXPIRACAO)) {
          // O cron apenas reconcilia pagamentos. Não cancela por tempo, pois o
          // Asaas pode registrar um PIX após esse prazo visual.
          console.log('[LIMPEZA] Reserva pendente fora do prazo visual preservada | doc:', docId);
        }
      }
    }

    // 2) Deleta reservas canceladas com mais de 7 dias (roda apenas 1x por dia para não esgotar a cota do Firestore)
    var propsLimpeza = PropertiesService.getScriptProperties();
    var hojeDia = new Date().toISOString().slice(0, 10);
    if (propsLimpeza.getProperty('ULTIMA_LIMPEZA_7DIAS') !== hojeDia) {
      var dataCorteISO = new Date(agora - TEMPO_DELECAO).toISOString();
      var queryCanceladas = {
        structuredQuery: {
          where: {
            compositeFilter: {
              op: 'AND',
              filters: [
                { fieldFilter: { field: { fieldPath: 'status' }, op: 'EQUAL', value: { stringValue: 'cancelado' } } },
                { fieldFilter: { field: { fieldPath: 'criado_em' }, op: 'LESS_THAN', value: { stringValue: dataCorteISO } } }
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
          if (f2.payment_id) {
            var resultadoReconciliacao = avaliarCancelamentoNoAsaas(
              { id: docId2, data: f2 },
              { id: valorCampo(f2, 'payment_id'), externalReference: valorCampo(f2, 'external_reference') || docId2 }
            );
            if (resultadoReconciliacao.pago) {
              console.log('[LIMPEZA] Reserva cancelada recuperada após pagamento Asaas | doc:', docId2);
              continue;
            }
          }
          console.log('[LIMPEZA] Deletando reserva cancelada antiga | doc:', docId2);
          deletarDocumentoFirestore('/reservas/' + docId2);
          deletadas++;
        }
      }
      propsLimpeza.setProperty('ULTIMA_LIMPEZA_7DIAS', hojeDia);
    }

    console.log('[LIMPEZA] Concluído | canceladas:', canceladas, '| deletadas:', deletadas);
    return { sucesso: true, canceladas: canceladas, deletadas: deletadas };
  } catch (e) {
    console.error('[LIMPEZA] Erro:', e.message);
    return { sucesso: false, erro: e.message };
  }
}

// ===== PROTEÇÃO DE TOKENS DOS MOTÉIS =====
// Os tokens são gerenciados exclusivamente em Propriedades do script.
// Esta função existe apenas para bloquear execuções acidentais de versões
// antigas que tentavam gravar tokens a partir do código-fonte.
function salvarTokensAsaas() {
  console.warn('[TOKENS] Operação bloqueada. Nenhum token foi criado, alterado ou excluído. Use Configurações do projeto > Propriedades do script somente quando uma rotação for autorizada.');
}
