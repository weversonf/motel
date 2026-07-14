import { useState, useEffect, useCallback } from "react";
import { api } from "../../lib/api";
import { t } from "../../styles/tokens";

interface Motel {
  id: string;
  nome: string;
  slug: string;
  cor: string;
  icone: string;
}

interface Suite {
  id: string;
  motelId: string;
  nome: string;
  descricao: string;
  preco3: string;
  preco12: string;
  preco24: string;
  fracao: string;
  qtde: number;
  tags: string[];
}

interface ReservationData {
  nome: string;
  cpf: string;
  motel: Motel | null;
  suite: Suite | null;
  duracao: string;
  preco: number;
  precoOriginal: number;
  dataReserva: string;
  horaChegada: string;
  promocao: string;
}

type Step =
  | "inicio"
  | "nome"
  | "motel"
  | "tags"
  | "suite"
  | "duracao"
  | "cpf"
  | "data"
  | "hora"
  | "resumo"
  | "pagamento"
  | "concluido";

export function ReservaPage() {
  const [step, setStep] = useState<Step>("inicio");
  const [motels, setMotels] = useState<Motel[]>([]);
  const [suites, setSuites] = useState<Suite[]>([]);
  const [tagFilter, setTagFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const [dados, setDados] = useState<ReservationData>({
    nome: "",
    cpf: "",
    motel: null,
    suite: null,
    duracao: "",
    preco: 0,
    precoOriginal: 0,
    dataReserva: "",
    horaChegada: "",
    promocao: "nenhuma",
  });

  const [payment, setPayment] = useState<{
    payment_id: string;
    pagamento_url: string;
  } | null>(null);

  const [protocolo, setProtocolo] = useState("");
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    api.get<Motel[]>("/motels").then(setMotels).catch(console.error);
  }, []);

  const loadSuites = useCallback(async (motelId: string) => {
    const data = await api.get<Suite[]>(`/motels/${motelId}/suites`);
    setSuites(data);
  }, []);

  const selectMotel = async (motel: Motel) => {
    setDados((d) => ({ ...d, motel }));
    await loadSuites(motel.id);
    setTagFilter("");
    setStep("tags");
  };

  const selectTag = (tag: string) => {
    setTagFilter(tag);
    setStep("suite");
  };

  const selectSuite = (suite: Suite) => {
    setDados((d) => ({ ...d, suite }));
    setStep("duracao");
  };

  const selectDuracao = (duracao: string) => {
    const suite = dados.suite!;
    const precoOriginal =
      duracao === "3h"
        ? Number(suite.preco3)
        : duracao === "12h"
          ? Number(suite.preco12)
          : Number(suite.preco24);

    setDados((d) => ({
      ...d,
      duracao,
      preco: precoOriginal,
      precoOriginal,
    }));
    setStep("cpf");
  };

  const setCpf = (cpf: string) => {
    setDados((d) => ({ ...d, cpf }));
    setStep("data");
  };

  const setData = async (data: string) => {
    setDados((d) => ({ ...d, dataReserva: data }));
    if (dados.suite) {
      const avail = await api
        .get<{ disponiveis: number }>(
          `/reservations/check-availability/${dados.suite.id}?data=${data}`
        )
        .catch(() => ({ disponiveis: 1 }));
      if (avail.disponiveis === 0) {
        setErro("Sem disponibilidade nessa data. Escolha outra.");
        return;
      }
    }
    setErro("");
    setStep("hora");
  };

  const setHora = (hora: string) => {
    setDados((d) => ({ ...d, horaChegada: hora }));
    setStep("resumo");
  };

  const gerarProtocolo = () =>
    Math.random().toString(36).substring(2, 10).toUpperCase();

  const criarReserva = async (promocao: string, precoFinal: number) => {
    setLoading(true);
    setErro("");

    const payload = {
      motel_id: dados.motel!.id,
      suite_id: dados.suite!.id,
      cliente_nome: dados.nome,
      cliente_cpf: dados.cpf,
      duracao: promocao === "3h+3h" ? "6h" : dados.duracao,
      preco: precoFinal,
      preco_original: dados.precoOriginal,
      promocao,
      data_reserva: dados.dataReserva,
      hora_chegada: dados.horaChegada,
      protocolo: gerarProtocolo(),
      origem: "chat_web",
      status: promocao === "cartao" ? "pendente_cartao" : "aguardando_pagamento",
      token_asaas: dados.motel!.id,
    };

    try {
      const reserva = await api.post<{
        id: string;
        preco: string;
        protocolo: string;
      }>("/reservations", payload);

      setDados((d) => ({
        ...d,
        promocao,
        preco: precoFinal,
        duracao: promocao === "3h+3h" ? "6h" : d.duracao,
      }));
      setProtocolo(reserva.protocolo || payload.protocolo);

      if (promocao === "cartao") {
        setStep("concluido");
      } else {
        // Criar cobrança PIX
        const charge = await api.post<{
          sucesso: boolean;
          payment_id: string;
          pagamento_url: string;
          erro?: string;
        }>("/asaas/charge", {
          token: process.env.ASAAS_TOKEN || "$aact_hmlg_test",
          cliente_nome: dados.nome,
          cliente_cpf: dados.cpf,
          motel: dados.motel!.nome,
          suite: dados.suite!.nome,
          duracao: dados.duracao,
          preco: precoFinal,
        });

        if (charge.sucesso && charge.payment_id) {
          setPayment({
            payment_id: charge.payment_id,
            pagamento_url: charge.pagamento_url,
          });
          setStep("pagamento");
        } else {
          setErro(charge.erro || "Erro ao gerar cobrança");
        }
      }
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const verificarPagamento = async () => {
    if (!payment) return;
    setPolling(true);

    const check = async () => {
      try {
        const result = await api.get<{ sucesso: boolean; pago: boolean }>(
          `/asaas/payment/${payment.payment_id}?token=$aact_hmlg_test`
        );
        if (result.pago) {
          setStep("concluido");
          setPolling(false);
          return;
        }
      } catch { /* continua polling */ }
      setTimeout(check, 5000);
    };

    check();
  };

  useEffect(() => {
    if (step === "pagamento" && payment) {
      verificarPagamento();
    }
  }, [step, payment]);

  const filteredSuites = tagFilter
    ? suites.filter((s) => s.tags?.includes(tagFilter))
    : suites;

  const todosTags = [...new Set(suites.flatMap((s) => s.tags || []))];

  const formatPreco = (v: number | string) =>
    Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2 });

  // ─── RENDER ──────────────────────────────────────────
  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${t.bg} 0%, #fce4ec 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          maxWidth: 500,
          width: "100%",
          background: t.bgCard,
          borderRadius: 20,
          boxShadow: "0 4px 24px rgba(210,1,80,0.08)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #d20150, #a0013d)",
            padding: "20px 24px",
            color: "#fff",
            textAlign: "center",
          }}
        >
          <img
            src="/ICONE.png"
            alt=""
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              marginBottom: 8,
              objectFit: "contain",
            }}
          />
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>
            Motéis Fortaleza
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: 12, opacity: 0.8 }}>
            Reserva online
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: "24px 20px" }}>
          {erro && (
            <div
              style={{
                background: "#fff0f0",
                color: "#d20150",
                padding: "10px 14px",
                borderRadius: 10,
                fontSize: 13,
                marginBottom: 16,
              }}
            >
              {erro}
            </div>
          )}

          {/* STEP: inicio */}
          {step === "inicio" && (
            <div>
              <p style={{ textAlign: "center", color: t.textSecondary, marginBottom: 16 }}>
                Bem-vindo! O que deseja fazer?
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button
                  onClick={() => setStep("nome")}
                  style={btnPrimary}
                >
                  🛏 Fazer Reserva
                </button>
                <button
                  onClick={() => setStep("motel")}
                  style={btnOutline}
                >
                  📋 Ver Suítes
                </button>
              </div>
            </div>
          )}

          {/* STEP: nome */}
          {step === "nome" && (
            <div>
              <p style={{ fontWeight: 600, color: t.textPrimary, marginBottom: 12 }}>
                Qual seu nome?
              </p>
              <input
                type="text"
                value={dados.nome}
                onChange={(e) => setDados((d) => ({ ...d, nome: e.target.value }))}
                placeholder="Seu nome completo"
                style={inputStyle}
                autoFocus
              />
              <button
                disabled={!dados.nome.trim()}
                onClick={() => setStep("motel")}
                style={{ ...btnPrimary, marginTop: 12, opacity: dados.nome.trim() ? 1 : 0.5 }}
              >
                Continuar
              </button>
            </div>
          )}

          {/* STEP: motel */}
          {step === "motel" && (
            <div>
              <p style={{ fontWeight: 600, color: t.textPrimary, marginBottom: 12 }}>
                Escolha o motel:
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {motels.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => selectMotel(m)}
                    style={{
                      ...cardStyle,
                      borderLeft: `4px solid ${m.cor || t.accent}`,
                    }}
                  >
                    <span style={{ fontSize: 20 }}>{m.icone || "🏨"}</span>
                    <span style={{ fontWeight: 600 }}>{m.nome}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setStep("nome")}
                style={{ ...btnOutline, marginTop: 12 }}
              >
                ← Voltar
              </button>
            </div>
          )}

          {/* STEP: tags */}
          {step === "tags" && (
            <div>
              <p style={{ fontWeight: 600, color: t.textPrimary, marginBottom: 12 }}>
                Filtrar por:
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                <button
                  onClick={() => selectTag("")}
                  style={{
                    ...tagBtn,
                    background: !tagFilter ? t.accent : t.bgItem,
                    color: !tagFilter ? "#fff" : t.textSecondary,
                  }}
                >
                  Todas
                </button>
                {todosTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => selectTag(tag)}
                    style={{
                      ...tagBtn,
                      background: tagFilter === tag ? t.accent : t.bgItem,
                      color: tagFilter === tag ? "#fff" : t.textSecondary,
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setStep("motel")}
                style={{ ...btnOutline, marginTop: 8 }}
              >
                ← Voltar
              </button>
            </div>
          )}

          {/* STEP: suite */}
          {step === "suite" && (
            <div>
              <p style={{ fontWeight: 600, color: t.textPrimary, marginBottom: 12 }}>
                Escolha a suíte{tagFilter ? ` (${tagFilter})` : ""}:
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {filteredSuites.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => selectSuite(s)}
                    style={cardStyle}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{s.nome}</div>
                      <div style={{ fontSize: 12, color: t.textSecondary }}>
                        {s.descricao} · 3h R${formatPreco(s.preco3)} 12h R$
                        {formatPreco(s.preco12)}
                      </div>
                      <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                        {s.tags?.map((tag) => (
                          <span
                            key={tag}
                            style={{
                              background: t.accentL,
                              color: t.accent,
                              padding: "2px 8px",
                              borderRadius: 4,
                              fontSize: 10,
                              fontWeight: 600,
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span style={{ color: t.textSecondary }}>→</span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setStep(dados.motel ? "tags" : "inicio")}
                style={{ ...btnOutline, marginTop: 12 }}
              >
                ← Voltar
              </button>
            </div>
          )}

          {/* STEP: duracao */}
          {step === "duracao" && dados.suite && (
            <div>
              <p style={{ fontWeight: 600, color: t.textPrimary, marginBottom: 4 }}>
                {dados.suite.nome}
              </p>
              <p style={{ fontSize: 13, color: t.textSecondary, marginBottom: 16 }}>
                Escolha a duração:
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {dados.suite.preco3 && (
                  <button
                    onClick={() => selectDuracao("3h")}
                    style={{
                      ...cardStyle,
                      background:
                        dados.duracao === "3h" ? t.accentL : t.bgItem,
                    }}
                  >
                    <span>⏱</span>
                    <span style={{ fontWeight: 600 }}>3 horas</span>
                    <span style={{ color: t.accent, fontWeight: 700 }}>
                      R$ {formatPreco(dados.suite.preco3)}
                    </span>
                  </button>
                )}
                {dados.suite.preco12 && (
                  <button
                    onClick={() => selectDuracao("12h")}
                    style={{
                      ...cardStyle,
                      background:
                        dados.duracao === "12h" ? t.accentL : t.bgItem,
                    }}
                  >
                    <span>🌙</span>
                    <span style={{ fontWeight: 600 }}>12 horas</span>
                    <span style={{ color: t.accent, fontWeight: 700 }}>
                      R$ {formatPreco(dados.suite.preco12)}
                    </span>
                  </button>
                )}
                {dados.suite.preco24 && (
                  <button
                    onClick={() => selectDuracao("24h")}
                    style={{
                      ...cardStyle,
                      background:
                        dados.duracao === "24h" ? t.accentL : t.bgItem,
                    }}
                  >
                    <span>🏨</span>
                    <span style={{ fontWeight: 600 }}>24 horas</span>
                    <span style={{ color: t.accent, fontWeight: 700 }}>
                      R$ {formatPreco(dados.suite.preco24)}
                    </span>
                  </button>
                )}
              </div>
              <button
                onClick={() => setStep("suite")}
                style={{ ...btnOutline, marginTop: 12 }}
              >
                ← Voltar
              </button>
            </div>
          )}

          {/* STEP: cpf */}
          {step === "cpf" && (
            <div>
              <p style={{ fontWeight: 600, color: t.textPrimary, marginBottom: 12 }}>
                CPF do responsável:
              </p>
              <input
                type="text"
                value={dados.cpf}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 11);
                  const masked = v
                    .replace(/(\d{3})(\d)/, "$1.$2")
                    .replace(/(\d{3})(\d)/, "$1.$2")
                    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
                  e.target.value = masked;
                  setCpf(masked);
                }}
                placeholder="000.000.000-00"
                maxLength={14}
                style={inputStyle}
                autoFocus
              />
              <button
                disabled={dados.cpf.length < 14}
                onClick={() => setStep("data")}
                style={{
                  ...btnPrimary,
                  marginTop: 12,
                  opacity: dados.cpf.length >= 14 ? 1 : 0.5,
                }}
              >
                Continuar
              </button>
              <button
                onClick={() => setStep("duracao")}
                style={{ ...btnOutline, marginTop: 8 }}
              >
                ← Voltar
              </button>
            </div>
          )}

          {/* STEP: data */}
          {step === "data" && (
            <div>
              <p style={{ fontWeight: 600, color: t.textPrimary, marginBottom: 12 }}>
                Data da reserva:
              </p>
              <input
                type="date"
                value={dados.dataReserva}
                onChange={(e) => setData(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                style={inputStyle}
                autoFocus
              />
              <button
                disabled={!dados.dataReserva}
                onClick={() => setStep("hora")}
                style={{
                  ...btnPrimary,
                  marginTop: 12,
                  opacity: dados.dataReserva ? 1 : 0.5,
                }}
              >
                Continuar
              </button>
              <button
                onClick={() => setStep("cpf")}
                style={{ ...btnOutline, marginTop: 8 }}
              >
                ← Voltar
              </button>
            </div>
          )}

          {/* STEP: hora */}
          {step === "hora" && (
            <div>
              <p style={{ fontWeight: 600, color: t.textPrimary, marginBottom: 12 }}>
                Horário de chegada:
              </p>
              <input
                type="time"
                value={dados.horaChegada}
                onChange={(e) => setHora(e.target.value)}
                style={inputStyle}
                autoFocus
              />
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                {["08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"].map(
                  (h) => (
                    <button
                      key={h}
                      onClick={() => setHora(h)}
                      style={{
                        ...tagBtn,
                        background:
                          dados.horaChegada === h ? t.accent : t.bgItem,
                        color:
                          dados.horaChegada === h ? "#fff" : t.textSecondary,
                      }}
                    >
                      {h}
                    </button>
                  )
                )}
              </div>
              <button
                onClick={() => setStep("data")}
                style={{ ...btnOutline, marginTop: 12 }}
              >
                ← Voltar
              </button>
            </div>
          )}

          {/* STEP: resumo */}
          {step === "resumo" && (
            <div>
              <p style={{ fontWeight: 700, color: t.textPrimary, marginBottom: 16, textAlign: "center" }}>
                Confirme sua reserva
              </p>
              <div
                style={{
                  background: t.bgItem,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 16,
                }}
              >
                <Linha label="Motel" value={`${dados.motel?.icone || ""} ${dados.motel?.nome}`} />
                <Linha label="Suíte" value={dados.suite?.nome} />
                <Linha label="Duração" value={dados.duracao} />
                <Linha label="Check-in" value={`${dados.dataReserva} às ${dados.horaChegada}`} />
                <Linha label="Cliente" value={dados.nome} />
                <Linha label="CPF" value={dados.cpf} />
                <Linha
                  label="Valor"
                  value={`R$ ${formatPreco(dados.preco)}`}
                  destaque
                />
              </div>

              <p style={{ fontWeight: 600, fontSize: 13, color: t.textSecondary, marginBottom: 12 }}>
                Forma de pagamento:
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button
                  onClick={() =>
                    criarReserva("30%_OFF", Number((dados.precoOriginal * 0.7).toFixed(2)))
                  }
                  disabled={loading}
                  style={{
                    ...cardStyle,
                    background: "#e8f5e9",
                    border: "1px solid #4caf50",
                  }}
                >
                  <span style={{ fontSize: 18 }}>⚡</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: "#2e7d32" }}>
                      PIX com 30% OFF
                    </div>
                    <div style={{ fontSize: 12, color: "#4caf50" }}>
                      R$ {formatPreco(Number((dados.precoOriginal * 0.7).toFixed(2)))}
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => criarReserva("3h+3h", dados.precoOriginal)}
                  disabled={loading}
                  style={{
                    ...cardStyle,
                    background: "#e3f2fd",
                    border: "1px solid #2196f3",
                  }}
                >
                  <span style={{ fontSize: 18 }}>⏱</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: "#1565c0" }}>
                      PIX com +3h grátis
                    </div>
                    <div style={{ fontSize: 12, color: "#2196f3" }}>
                      Total de 6h por R$ {formatPreco(dados.precoOriginal)}
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => criarReserva("cartao", dados.precoOriginal)}
                  disabled={loading}
                  style={{
                    ...cardStyle,
                    background: "#fff3e0",
                    border: "1px solid #ff9800",
                  }}
                >
                  <span style={{ fontSize: 18 }}>💳</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: "#e65100" }}>
                      Pagar no Motel
                    </div>
                    <div style={{ fontSize: 12, color: "#ff9800" }}>
                      Cartão na recepção
                    </div>
                  </div>
                </button>
              </div>

              <button
                onClick={() => setStep("hora")}
                disabled={loading}
                style={{ ...btnOutline, marginTop: 12 }}
              >
                ← Voltar
              </button>
            </div>
          )}

          {/* STEP: pagamento */}
          {step === "pagamento" && payment && (
            <div style={{ textAlign: "center" }}>
              <p style={{ fontWeight: 700, color: t.textPrimary, marginBottom: 8 }}>
                Pague via PIX
              </p>
              <p style={{ fontSize: 13, color: t.textSecondary, marginBottom: 16 }}>
                Escaneie o QR code ou copie o código PIX
              </p>

              {payment.pagamento_url && (
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(payment.pagamento_url)}`}
                  alt="QR Code PIX"
                  style={{ width: 200, height: 200, marginBottom: 16, borderRadius: 12 }}
                />
              )}

              <a
                href={payment.pagamento_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ ...btnPrimary, textDecoration: "none", display: "inline-block" }}
              >
                Pagar Agora
              </a>

              {polling && (
                <p style={{ fontSize: 12, color: t.textSecondary, marginTop: 12 }}>
                  Aguardando pagamento...
                </p>
              )}
            </div>
          )}

          {/* STEP: concluido */}
          {step === "concluido" && (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
              <p style={{ fontWeight: 700, color: t.textPrimary, fontSize: 18, marginBottom: 8 }}>
                Reserva realizada!
              </p>
              <p style={{ fontSize: 13, color: t.textSecondary, marginBottom: 16 }}>
                {dados.promocao === "cartao"
                  ? "Apresente-se na recepção no horário agendado."
                  : "Pagamento confirmado. Seu quarto estará disponível no horário."}
              </p>
              <div
                style={{
                  background: t.bgItem,
                  borderRadius: 12,
                  padding: 16,
                  textAlign: "left",
                }}
              >
                <Linha label="Protocolo" value={`#${protocolo}`} destaque />
                <Linha label="Motel" value={dados.motel?.nome} />
                <Linha label="Suíte" value={dados.suite?.nome} />
                <Linha
                  label="Check-in"
                  value={`${dados.dataReserva} às ${dados.horaChegada}`}
                />
                <Linha label="Duração" value={dados.duracao} />
                <Linha label="Valor" value={`R$ ${formatPreco(dados.preco)}`} destaque />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Helper ────────────────────────────────────────────
function Linha({
  label,
  value,
  destaque,
}: {
  label: string;
  value?: string;
  destaque?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "6px 0",
        borderBottom: `1px solid ${t.border}`,
      }}
    >
      <span style={{ fontSize: 12, color: t.textSecondary }}>{label}</span>
      <span
        style={{
          fontSize: 13,
          fontWeight: destaque ? 700 : 500,
          color: destaque ? t.accent : t.textPrimary,
        }}
      >
        {value || "—"}
      </span>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────
const btnPrimary: React.CSSProperties = {
  width: "100%",
  padding: "14px",
  borderRadius: 12,
  border: "none",
  background: "linear-gradient(135deg, #d20150, #a0013d)",
  color: "#fff",
  fontWeight: 700,
  fontSize: 15,
  cursor: "pointer",
};

const btnOutline: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  borderRadius: 12,
  border: `1px solid ${t.border}`,
  background: "transparent",
  color: t.textSecondary,
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
};

const cardStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  width: "100%",
  padding: "14px 16px",
  borderRadius: 12,
  border: `1px solid ${t.border}`,
  background: t.bgItem,
  cursor: "pointer",
  textAlign: "left",
  fontSize: 14,
  transition: "background .15s",
};

const tagBtn: React.CSSProperties = {
  padding: "6px 14px",
  borderRadius: 20,
  border: "none",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  transition: "all .15s",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: `1px solid ${t.border}`,
  background: t.bgItem,
  color: t.textPrimary,
  fontSize: 15,
  outline: "none",
  boxSizing: "border-box",
};
