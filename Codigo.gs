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
      return verificarPagamento(dados);
    }

    // Resetar senha (Admin)
    if (dados.acao === 'resetar_senha') {
      return ContentService.createTextOutput(JSON.stringify(resetarSenhaFirebase(dados)))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Notificar (email apenas)
    if (dados.acao === 'notificar') {
      enviarEmailNotificacao(dados);
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
      } else {
        resposta.erro = 'ERRO_ASAAS: ' + resultado.erro;
        resposta.sucesso = true;
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

function enviarEmailNotificacao(dados) {
  try {
    var statusTexto = dados.status === 'pendente_recepcao' ? 'Pendente (Cartão)' : 'Aguardando PIX';
    var assunto = 'Nova Reserva do Motel';
    var corpo = ''
      + 'NOVA RESERVA\n'
      + '━━━━━━━━━━━━━━\n\n'
      + 'Motel: ' + (dados.motel || '?') + '\n'
      + 'Suíte: ' + (dados.suite || '?') + '\n'
      + 'Período: ' + (dados.duracao || '?') + '\n'
      + 'Valor: R$ ' + (dados.preco || '0') + ',00\n\n'
      + 'Cliente: ' + (dados.cliente_nome || '?') + '\n'
      + 'CPF: ' + (dados.cliente_cpf || '?') + '\n'
      + 'Data: ' + (dados.data_reserva || '?') + ' às ' + (dados.hora_chegada || '?') + '\n\n'
      + 'Status: ' + statusTexto;
    MailApp.sendEmail(EMAIL_NOTIFICAR, assunto, corpo);
  } catch(e) {
    console.warn('Email fail:', e);
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

    const cobranca = apiAsaas(token, 'post', '/payments', {
      customer: customerId,
      billingType: 'PIX',
      value: Number(dados.preco),
      dueDate: dados.data_reserva || agora.toISOString().split('T')[0],
      description: `${dados.motel} - ${dados.suite} (${dados.duracao})`,
      externalReference: externalRef,
      notificationDisabled: false
    });

    if (cobranca.id) {
      const url = cobranca.invoiceUrl || cobranca.pixQrCodeUrl || '';
      return { sucesso: true, payment_id: cobranca.id, pagamento_url: url, external_reference: externalRef };
    }

    return { sucesso: false, erro: JSON.stringify(cobranca) };
  } catch (e) {
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
      limit: 1,
      orderBy: [{ field: { fieldPath: 'criado_em' }, direction: 'DESCENDING' }]
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

function atualizarStatusReserva(docId, novoStatus) {
  const path = '/reservas/' + docId + '?updateMask.fieldPaths=status';
  const fields = { status: { stringValue: novoStatus } };
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

        if (evento === 'PAYMENT_RECEIVED' || evento === 'PAYMENT_CONFIRMED') {
          var nomeCliente = payment.customer ? (payment.customer.name || '') : '';
          var valor = payment.value || '';
          try {
            MailApp.sendEmail(EMAIL_NOTIFICAR, 'Pagamento Confirmado - ' + (payment.id || ''),
              'Pagamento confirmado:\n\nCliente: ' + nomeCliente + '\nValor: R$ ' + valor + '\nID: ' + (payment.id || ''));
          } catch(e) { console.warn('Email webhook fail:', e); }
          if (payment.externalReference) {
            const cpf = payment.externalReference.split('_')[0];
            const reserva = buscarReservaPorCPF(cpf, 'aguardando_pagamento');
            if (reserva) {
              atualizarStatusReserva(reserva.id, 'confirmado');
            }
          }
        }

    return ContentService.createTextOutput(JSON.stringify({ sucesso: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (e) {
    return ContentService.createTextOutput(JSON.stringify({ sucesso: false, erro: e.message }))
      .setMimeType(ContentService.MimeType.JSON);
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
    const pago = pagamento.status === 'RECEIVED' || pagamento.status === 'CONFIRMED';

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
