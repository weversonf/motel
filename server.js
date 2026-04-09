const express = require('express');
const app = express();
app.use(express.json());

// NUNCA coloque a chave direto no código. Use variáveis de ambiente.
// Exemplo: const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
const ASAAS_API_KEY = 'COLE_SUA_NOVA_CHAVE_AQUI_APENAS_NO_SERVIDOR'; 
const ASAAS_URL = 'https://api.asaas.com/v3';

// 1. Rota para gerar a cobrança PIX (O seu chat.html vai chamar essa rota)
app.post('/api/gerar-pix', async (req, res) => {
    const { nome, cpf, valor } = req.body;

    try {
        // Passo A: Criar o cliente no Asaas
        const customerReq = await fetch(`${ASAAS_URL}/customers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'access_token': ASAAS_API_KEY },
            body: JSON.stringify({ name: nome, cpfCnpj: cpf })
        });
        const customer = await customerReq.json();

        if (!customer.id) {
            return res.status(400).json({ error: 'Erro ao criar cliente no Asaas. Verifique o CPF.' });
        }

        // Passo B: Criar a cobrança no formato PIX
        const paymentReq = await fetch(`${ASAAS_URL}/payments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'access_token': ASAAS_API_KEY },
            body: JSON.stringify({
                customer: customer.id,
                billingType: 'PIX',
                value: valor,
                dueDate: new Date().toISOString().split('T')[0], // Vence na data atual
                description: 'Pré-agendamento - Motel Dreams'
            })
        });
        const payment = await paymentReq.json();

        // Passo C: Obter o código "Pix Copia e Cola" e o QR Code
        const pixReq = await fetch(`${ASAAS_URL}/payments/${payment.id}/pixQrCode`, {
            headers: { 'access_token': ASAAS_API_KEY }
        });
        const pixData = await pixReq.json();

        // Devolve os dados para o Chatbot exibir para o cliente
        res.json({
            pagamentoId: payment.id,
            copiaECola: pixData.payload,
            qrCodeBase64: pixData.encodedImage
        });

    } catch (error) {
        console.error("Erro na integração com Asaas:", error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});

// 2. Rota Webhook (Onde o Asaas avisa o seu servidor que o cliente pagou)
// Você deve cadastrar esta URL lá no painel do Asaas (Minha Conta > Integrações > Webhooks)
app.post('/api/webhook/asaas', (req, res) => {
    const evento = req.body.event;
    const pagamento = req.body.payment;

    if (evento === 'PAYMENT_RECEIVED') {
        console.log(`✅ Sucesso! Pagamento ${pagamento.id} recebido no valor de R$ ${pagamento.value}.`);
        
        // AQUI ENTRARÁ A LÓGICA DO SISMOTEL:
        // enviarParaSismotel(pagamento.customer, 'confirmado_pago_asaas');
    } else if (evento === 'PAYMENT_OVERDUE') {
        console.log(`❌ Pagamento ${pagamento.id} expirou.`);
    }

    // É obrigatório responder status 200 para o Asaas saber que você recebeu a notificação
    res.sendStatus(200); 
});

app.listen(3000, () => console.log('Servidor de Integração Asaas rodando na porta 3000'));
