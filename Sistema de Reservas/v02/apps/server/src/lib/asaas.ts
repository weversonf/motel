const ASAAS_SANDBOX = "https://api-sandbox.asaas.com/v3";
const ASAAS_PROD = "https://api.asaas.com/v3";

function getBaseUrl(token: string): string {
  return token.startsWith("$aact_hmlg_") ? ASAAS_SANDBOX : ASAAS_PROD;
}

async function asaasRequest<T = unknown>(
  token: string,
  method: string,
  path: string,
  body?: Record<string, unknown>
): Promise<T> {
  const baseUrl = getBaseUrl(token);
  const url = `${baseUrl}${path}`;

  const res = await fetch(url, {
    method,
    headers: {
      "access_token": token,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  return res.json() as T;
}

export function createOrFindCustomer(
  token: string,
  nome: string,
  cpf: string
): Promise<string> {
  const cpfNumeros = cpf.replace(/\D/g, "");

  return asaasRequest<{ data?: { id: string }[]; id?: string }>(
    token,
    "GET",
    `/customers?cpfCnpj=${cpfNumeros}`
  ).then((busca) => {
    if (busca.data && busca.data.length > 0) {
      return busca.data[0].id;
    }
    return asaasRequest<{ id: string }>(token, "POST", "/customers", {
      name: nome,
      cpfCnpj: cpfNumeros,
      notificationDisabled: false,
    }).then((novo) => {
      if (!novo.id) throw new Error("Falha ao criar cliente ASAAS");
      return novo.id;
    });
  });
}

export interface CreateChargeInput {
  token: string;
  clienteNome: string;
  clienteCpf: string;
  motel: string;
  suite: string;
  duracao: string;
  preco: number;
}

export interface CreateChargeOutput {
  sucesso: boolean;
  payment_id?: string;
  pagamento_url?: string;
  external_reference?: string;
  erro?: string;
}

export async function createPixCharge(
  input: CreateChargeInput
): Promise<CreateChargeOutput> {
  const { token, clienteNome, clienteCpf, motel, suite, duracao, preco } = input;

  try {
    const customerId = await createOrFindCustomer(token, clienteNome, clienteCpf);

    const agora = new Date();
    const cpfNumeros = clienteCpf.replace(/\D/g, "");
    const externalRef = `${cpfNumeros}_${agora.getTime()}`;

    const dataExpiracao = new Date(agora.getTime() + 15 * 60 * 1000);
    const dueDate = dataExpiracao.toISOString();

    const cobranca = await asaasRequest<{
      id?: string;
      invoiceUrl?: string;
      pixQrCodeUrl?: string;
    }>(token, "POST", "/payments", {
      customer: customerId,
      billingType: "PIX",
      value: preco,
      dueDate,
      description: `${motel} - ${suite} (${duracao})`,
      externalReference: externalRef,
      notificationDisabled: false,
    });

    if (!cobranca.id) {
      return { sucesso: false, erro: JSON.stringify(cobranca) };
    }

    return {
      sucesso: true,
      payment_id: cobranca.id,
      pagamento_url: cobranca.invoiceUrl || cobranca.pixQrCodeUrl || "",
      external_reference: externalRef,
    };
  } catch (e) {
    return { sucesso: false, erro: (e as Error).message };
  }
}

export interface PaymentStatus {
  id: string;
  status: string;
  value?: number;
  customer?: string;
  externalReference?: string;
}

export async function getPaymentStatus(
  token: string,
  paymentId: string
): Promise<PaymentStatus> {
  return asaasRequest<PaymentStatus>(token, "GET", `/payments/${paymentId}`);
}

export function isSandboxToken(token: string): boolean {
  return token.startsWith("$aact_hmlg_");
}
