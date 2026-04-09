const express = require('express');
const cors = require('cors'); // Biblioteca necessária para liberar o HTML

const app = express();

// Habilita o CORS para permitir que o chat.html se comunique com o servidor
app.use(cors());
app.use(express.json());

// =====================================================================
// ATENÇÃO: COLE SUA NOVA CHAVE DE PRODUÇÃO ABAIXO
// A que você gerou após ter apagado a anterior por segurança!
// =====================================================================
const ASAAS_API_KEY = '$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OmNiOWMxMzQwLWE4YTctNDM0Yi04MGMyLThkMDRjMDk2YWQ2ZDo6JGFhY2hfNmYyYjgyZDAtMjYwMy00ZjQ4LTk4MDgtMjFjNmUwZmYxOTlj'; 
const ASAAS_URL = 'https://api.asaas.com/v3';

// 1. Rota para gerar a cobrança PIX
app.post('/api/gerar-pix', async (req, res) => {
    const { nome, cpf, valor } = req.body;

    try {
        // Passo A: Criar o cliente no Asaas
        const customerReq = await fetch(`${ASAAS_URL}/customers`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'access_token': ASAAS_API_KEY 
            },
            body: JSON.stringify({ 
                name: nome, 
                cpfCnpj: cpf 
            })
        });
        const customer = await customerReq.json();

        // Se o Asaas recusar a criação (ex: CPF inválido), ele devolve um array "errors"
        if (customer.errors) {
            console.error("Erro Asaas (Cliente):", customer.errors);
            return res.status(400).json({ error: 'Erro ao criar cliente. Verifique o CPF.' });
        }

        // Passo B: Criar a cobrança no formato PIX
        const paymentReq = await fetch(`${ASAAS_URL}/payments`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'access_token': ASAAS_API_KEY 
            },
            body: JSON.stringify({
                customer: customer.id,
                billingType: 'PIX',
                value: valor,
                dueDate: new Date().toISOString().split('T')[0], // Vence hoje
                description: 'Pré-agendamento - Motel Dreams'
            })
        });
        const payment = await paymentReq.json();

        if (payment.errors) {
            console.error("Erro Asaas (Pagamento):", payment.errors);
            return res.status(400).json({ error: 'Erro ao gerar cobrança.' });
        }

        // Passo C: Obter o código "Pix Copia e Cola"
        const pixReq = await fetch(`${ASAAS_URL}/payments/${payment.id}/pixQrCode`, {
            method: 'GET',
            headers: { 
                'access_token': ASAAS_API_KEY 
            }
        });
        const pixData = await pixReq.json();

        if (pixData.errors) {
            console.error("Erro Asaas (PIX):", pixData.errors);
            return res.status(400).json({ error: 'Erro ao extrair o código PIX.' });
        }

        // Devolve os dados com sucesso para o Chatbot HTML
        res.json({
            pagamentoId: payment.id,
            copiaECola: pixData.payload,
            qrCodeBase64: pixData.encodedImage
        });

    } catch (error) {
        console.error("Erro geral na integração com Asaas:", error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});

// 2. Rota Webhook (Onde o Asaas avisa que o cliente pagou)
app.post('/api/webhook/asaas', (req, res) => {
    const evento = req.body.event;
    const pagamento = req.body.payment;

    if (evento === 'PAYMENT_RECEIVED') {
        console.log(`✅ Sucesso! Pagamento ${pagamento.id} recebido no valor de R$ ${pagamento.value}.`);
        // No futuro, chamaremos a função enviarParaSismotel() aqui.
    } else if (evento === 'PAYMENT_OVERDUE') {
        console.log(`❌ Pagamento ${pagamento.id} expirou.`);
    }

    // É obrigatório responder status 200 para o Asaas saber que você recebeu a notificação
    res.sendStatus(200); 
});

app.listen(3000, () => {
    console.log('🚀 Servidor de Integração Asaas rodando na porta 3000');
    console.log('Aguardando requisições do Chatbot...');
});
