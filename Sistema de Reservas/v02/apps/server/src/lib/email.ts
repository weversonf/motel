const EMAIL_TO = process.env.EMAIL_NOTIFICAR || "admin@moteisfortaleza.com";
const RESEND_KEY = process.env.RESEND_API_KEY || "";

interface EmailDados {
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

function montarHtml(dados: EmailDados, confirmado: boolean): string {
  const badgeTexto = confirmado ? "Pagamento Confirmado" : "Aguardando Pagamento";
  const badgeCor = confirmado ? "#00d99f" : "#ffc107";
  const titulo = confirmado ? "Reserva Confirmada" : "Nova Reserva Recebida";
  const emoji = confirmado ? "✅" : "🔔";

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
    <body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background:#f5f5f5">
      <table width="100%" style="padding:40px 0">
        <tr><td align="center">
          <table width="600" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08)">
            <tr>
              <td style="background:linear-gradient(135deg,#d20150,#a0013d);padding:32px;text-align:center">
                <div style="font-size:40px;margin-bottom:8px">${emoji}</div>
                <div style="color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.5px">Motéis Fortaleza</div>
                <div style="color:rgba(255,255,255,0.7);font-size:12px;letter-spacing:2px;text-transform:uppercase;margin-top:4px">Sistema de Reservas</div>
                <div style="display:inline-block;background:rgba(255,255,255,0.15);color:#fff;padding:6px 20px;border-radius:20px;font-size:12px;font-weight:600;margin-top:12px;border:1px solid rgba(255,255,255,0.2)">
                  ${badgeTexto}
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:36px 32px">
                <h1 style="font-size:22px;font-weight:800;color:#1a0a2e;margin:0 0 8px">${titulo}</h1>
                <p style="font-size:14px;color:#7a5a8a;line-height:1.6;margin:0 0 24px">
                  ${confirmado
                    ? "O pagamento foi <strong style=\"color:#00b894\">confirmado com sucesso</strong>."
                    : "Nova reserva recebida. Abaixo os detalhes:"}
                </p>
                <div style="background:#faf7fc;border-radius:12px;padding:4px 0;border:1px solid #f0e8f4">
                  ${dados.protocolo ? `<div style="padding:12px 20px;border-bottom:1px solid #f0e8f4"><div style="font-size:11px;font-weight:600;color:#a080b0;text-transform:uppercase">Protocolo</div><div style="font-size:15px;font-weight:600;color:#1a0a2e">#${dados.protocolo}</div></div>` : ""}
                  <div style="padding:12px 20px;border-bottom:1px solid #f0e8f4"><div style="font-size:11px;font-weight:600;color:#a080b0;text-transform:uppercase">Motel / Suíte</div><div style="font-size:15px;font-weight:600;color:#1a0a2e">${dados.motel} — ${dados.suite}</div></div>
                  <div style="padding:12px 20px;border-bottom:1px solid #f0e8f4"><div style="font-size:11px;font-weight:600;color:#a080b0;text-transform:uppercase">Cliente</div><div style="font-size:15px;font-weight:600;color:#1a0a2e">${dados.cliente_nome} · ${dados.cliente_cpf}</div></div>
                  <div style="padding:12px 20px;border-bottom:1px solid #f0e8f4"><div style="font-size:11px;font-weight:600;color:#a080b0;text-transform:uppercase">Check-in</div><div style="font-size:15px;font-weight:600;color:#1a0a2e">${dados.data_reserva} às ${dados.hora_chegada} · ${dados.duracao}</div></div>
                  <div style="padding:12px 20px"><div style="font-size:11px;font-weight:600;color:#a080b0;text-transform:uppercase">Valor</div><div style="font-size:18px;font-weight:800;color:#d20150">R$ ${dados.preco}</div></div>
                </div>
              </td>
            </tr>
            <tr>
              <td style="background:#1a0a2e;padding:24px 32px;text-align:center">
                <div style="color:#fff;font-size:14px;font-weight:700">Motéis Fortaleza</div>
                <div style="color:rgba(255,255,255,0.4);font-size:11px;margin-top:8px">&copy; 2026 Motéis Fortaleza. Email automático do sistema de reservas.</div>
              </td>
            </tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>`;
}

export async function enviarEmailNotificacao(
  dados: EmailDados,
  confirmado = false
): Promise<void> {
  const assunto = confirmado
    ? `✅ Reserva Confirmada — ${dados.motel}`
    : `🔔 Nova Reserva — ${dados.motel}`;
  const html = montarHtml(dados, confirmado);

  if (RESEND_KEY) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Motéis Fortaleza <no-reply@moteisfortaleza.com>",
          to: [EMAIL_TO],
          subject: assunto,
          html,
        }),
      });
    } catch (e) {
      console.warn("[EMAIL] Resend fail:", (e as Error).message);
    }
  } else {
    console.log(`[EMAIL DEV] Para: ${EMAIL_TO} | ${assunto}`);
    console.log(`[EMAIL DEV] HTML: ${html.substring(0, 200)}...`);
  }
}
