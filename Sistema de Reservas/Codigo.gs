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
      try {
        MailApp.sendEmail(EMAIL_NOTIFICAR, '✅ Pagamento Recebido - ' + (payment.id || ''),
          'Pagamento recebido no Asaas:\n\nCliente: ' + nomeCliente + '\nValor: R$ ' + valor + '\nID: ' + (payment.id || '') + '\nEvento: ' + evento);
      } catch(e) { console.warn('[WEBHOOK] Email fail:', e); }
      if (payment.externalReference) {
        const cpf = payment.externalReference.split('_')[0];
        const reserva = buscarReservaPorCPF(cpf, 'aguardando_pagamento');
        if (reserva) {
          console.log('[WEBHOOK] Atualizando reserva para confirmado | doc:', reserva.id);
          atualizarStatusReserva(reserva.id, 'confirmado', 'webhook_PAYMENT_RECEIVED');
        } else {
          console.warn('[WEBHOOK] Reserva não encontrada para CPF:', cpf, '| pode já ter sido confirmada ou cancelada');
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
