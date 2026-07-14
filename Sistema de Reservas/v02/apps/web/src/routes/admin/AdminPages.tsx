import { useState, useEffect, type FormEvent } from "react";
import { api } from "../../lib/api";
import { t } from "../../styles/tokens";

// ─── TYPES ────────────────────────────────────────────
interface Motel {
  id: string; nome: string; slug: string; cor: string; icone: string; ativo: boolean;
}
interface Suite {
  id: string; motelId: string; nome: string; descricao: string;
  preco3: string; preco12: string; preco24: string; fracao: string; qtde: number; tags: string[]; ativo: boolean;
}
interface Reservation {
  id: string; motelId: string; suiteId: string; clienteNome: string; clienteCpf: string;
  duracao: string; preco: string; precoOriginal: string; promocao: string;
  dataReserva: string; horaChegada: string; protocolo: string; status: string;
  paymentId: string; origem: string; criadoEm: string; suiteNome?: string; motelNome?: string;
}
interface User {
  id: string; nome: string; email: string; role: string; motelId: string;
}
interface LinktreeItem {
  id: string; motelId: string; title: string; url: string; icon: string; ordem: number; ativo: boolean;
}
interface NpsResponse {
  id: string; motelId: string; nota: number; comentario: string; createdAt: string;
}

const fmt = (v: string | number) => Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2 });
const fmtDate = (d: string) => new Date(d).toLocaleDateString("pt-BR");
const statusColor: Record<string, string> = {
  confirmado: "#4caf50", check_in: "#2196f3", aguardando_pagamento: "#9c27b0",
  pendente_cartao: "#ff9800", pendente_recepcao: "#ffc107", cancelado: "#f44336",
};

// ─── DASHBOARD ────────────────────────────────────────
export function DashboardPage() {
  const [reservas, setReservas] = useState<Reservation[]>([]);
  useEffect(() => { api.get<Reservation[]>("/reservations").then(setReservas).catch(console.error); }, []);
  const hoje = new Date().toISOString().split("T")[0];
  const hojeReservas = reservas.filter((r) => r.dataReserva === hoje);
  const confirmados = reservas.filter((r) => r.status === "confirmado" || r.status === "check_in");
  const receita = confirmados.reduce((sum, r) => sum + Number(r.preco), 0);

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: t.textPrimary }}>Dashboard</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginTop: 20 }}>
        <Kpi label="Reservas Hoje" value={hojeReservas.length} />
        <Kpi label="Confirmados" value={confirmados.length} />
        <Kpi label="Receita" value={`R$ ${fmt(receita)}`} />
        <Kpi label="Total Reservas" value={reservas.length} />
      </div>
      <div style={{ marginTop: 24, background: t.bgCard, borderRadius: 12, border: `1px solid ${t.border}`, padding: 16 }}>
        <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 600, color: t.textSecondary }}>Últimas Reservas</h3>
        <table style={{ width: "100%", fontSize: 13 }}>
          <thead>
            <tr style={{ color: t.textSecondary, textAlign: "left" }}>
              <th style={th}>Cliente</th><th style={th}>Motel</th><th style={th}>Suíte</th><th style={th}>Data</th><th style={th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {reservas.slice(0, 10).map((r) => (
              <tr key={r.id} style={{ borderBottom: `1px solid ${t.border}` }}>
                <td style={td}>{r.clienteNome}</td>
                <td style={td}>{r.motelNome || "—"}</td>
                <td style={td}>{r.suiteNome || "—"}</td>
                <td style={td}>{r.dataReserva} {r.horaChegada}</td>
                <td style={td}><StatusBadge status={r.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── CALENDARIO ───────────────────────────────────────
export function CalendarioPage() {
  const [reservas, setReservas] = useState<Reservation[]>([]);
  const [mes, setMes] = useState(new Date().getMonth());
  const [ano, setAno] = useState(new Date().getFullYear());

  useEffect(() => {
    api.get<Reservation[]>(`/reservations?limit=500`).then(setReservas).catch(console.error);
  }, []);

  const diasMes = new Date(ano, mes + 1, 0).getDate();
  const primeiro = new Date(ano, mes, 1).getDay();
  const hoje = new Date().toISOString().split("T")[0];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: t.textPrimary }}>Calendário</h2>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={() => { if (mes === 0) { setMes(11); setAno(ano - 1); } else setMes(mes - 1); }} style={btnSm}>←</button>
          <span style={{ fontWeight: 600, color: t.textPrimary }}>
            {new Date(ano, mes).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
          </span>
          <button onClick={() => { if (mes === 11) { setMes(0); setAno(ano + 1); } else setMes(mes + 1); }} style={btnSm}>→</button>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, fontSize: 12 }}>
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
          <div key={d} style={{ textAlign: "center", fontWeight: 600, color: t.textSecondary, padding: 4 }}>{d}</div>
        ))}
        {Array.from({ length: primeiro }).map((_, i) => (
          <div key={`e${i}`} />
        ))}
        {Array.from({ length: diasMes }).map((_, i) => {
          const dia = i + 1;
          const dataStr = `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
          const diaReservas = reservas.filter((r) => r.dataReserva === dataStr);
          return (
            <div
              key={dia}
              style={{
                background: dataStr === hoje ? t.accentL : t.bgCard,
                borderRadius: 8,
                padding: 6,
                minHeight: 60,
                border: `1px solid ${t.border}`,
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 13, color: t.textPrimary }}>{dia}</div>
              {diaReservas.slice(0, 3).map((r) => (
                <div key={r.id} style={{ fontSize: 10, color: statusColor[r.status] || t.textSecondary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {r.clienteNome.split(" ")[0]}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── TABELA ───────────────────────────────────────────
export function TabelaPage() {
  const [reservas, setReservas] = useState<Reservation[]>([]);
  const [filtro, setFiltro] = useState({ data: "", status: "", busca: "" });

  useEffect(() => {
    const qs = new URLSearchParams();
    if (filtro.data) qs.set("data_reserva", filtro.data);
    if (filtro.status) qs.set("status", filtro.status);
    api.get<Reservation[]>(`/reservations?limit=500&${qs}`).then(setReservas).catch(console.error);
  }, [filtro]);

  const filtered = reservas.filter((r) =>
    !filtro.busca || r.clienteNome.toLowerCase().includes(filtro.busca.toLowerCase()) || r.clienteCpf.includes(filtro.busca)
  );

  const handleStatusChange = async (id: string, status: string) => {
    await api.patch(`/reservations/${id}`, { status, status_origem: "dashboard_manual" });
    setReservas((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ margin: "0 0 16px", fontSize: 20, fontWeight: 700, color: t.textPrimary }}>Tabela</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <input type="date" value={filtro.data} onChange={(e) => setFiltro((f) => ({ ...f, data: e.target.value }))} style={inputSm} />
        <select value={filtro.status} onChange={(e) => setFiltro((f) => ({ ...f, status: e.target.value }))} style={selectSm}>
          <option value="">Todos status</option>
          <option value="confirmado">Confirmado</option>
          <option value="check_in">Check-in</option>
          <option value="aguardando_pagamento">Aguardando PIX</option>
          <option value="pendente_cartao">Pendente Cartão</option>
          <option value="cancelado">Cancelado</option>
        </select>
        <input type="text" placeholder="Buscar cliente ou CPF..." value={filtro.busca} onChange={(e) => setFiltro((f) => ({ ...f, busca: e.target.value }))} style={{ ...inputSm, width: 200 }} />
      </div>
      <div style={{ overflow: "auto" }}>
        <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ color: t.textSecondary, textAlign: "left" }}>
              <th style={th}>Cliente</th><th style={th}>Motel</th><th style={th}>Suíte</th>
              <th style={th}>Data</th><th style={th}>Hora</th><th style={th}>Dur.</th>
              <th style={th}>Valor</th><th style={th}>Status</th><th style={th}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} style={{ borderBottom: `1px solid ${t.border}` }}>
                <td style={td}>{r.clienteNome}</td>
                <td style={td}>{r.motelNome || "—"}</td>
                <td style={td}>{r.suiteNome || "—"}</td>
                <td style={td}>{r.dataReserva}</td>
                <td style={td}>{r.horaChegada}</td>
                <td style={td}>{r.duracao}</td>
                <td style={td}>R$ {fmt(r.preco)}</td>
                <td style={td}><StatusBadge status={r.status} /></td>
                <td style={td}>
                  <select
                    value={r.status}
                    onChange={(e) => handleStatusChange(r.id, e.target.value)}
                    style={{ fontSize: 11, padding: "2px 4px", borderRadius: 4, border: `1px solid ${t.border}` }}
                  >
                    <option value="aguardando_pagamento">Aguardando</option>
                    <option value="confirmado">Confirmado</option>
                    <option value="check_in">Check-in</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── RELATORIOS ───────────────────────────────────────
export function RelatoriosPage() {
  const [reservas, setReservas] = useState<Reservation[]>([]);
  useEffect(() => { api.get<Reservation[]>("/reservations?limit=500").then(setReservas).catch(console.error); }, []);

  const confirmados = reservas.filter((r) => r.status === "confirmado" || r.status === "check_in");
  const receita = confirmados.reduce((sum, r) => sum + Number(r.preco), 0);
  const cancelados = reservas.filter((r) => r.status === "cancelado");
  const porMotel = new Map<string, { nome: string; total: number }>();
  confirmados.forEach((r) => {
    const k = r.motelNome || r.motelId;
    const e = porMotel.get(k) || { nome: k, total: 0 };
    e.total += Number(r.preco);
    porMotel.set(k, e);
  });

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ margin: "0 0 16px", fontSize: 20, fontWeight: 700, color: t.textPrimary }}>Relatórios</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 24 }}>
        <Kpi label="Total Confirmados" value={confirmados.length} />
        <Kpi label="Receita Total" value={`R$ ${fmt(receita)}`} />
        <Kpi label="Ticket Médio" value={confirmados.length ? `R$ ${fmt(receita / confirmados.length)}` : "—"} />
        <Kpi label="Cancelados" value={cancelados.length} />
      </div>
      <div style={{ background: t.bgCard, borderRadius: 12, border: `1px solid ${t.border}`, padding: 16 }}>
        <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 600, color: t.textSecondary }}>Receita por Motel</h3>
        {[...porMotel.values()].map((m) => (
          <div key={m.nome} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${t.border}`, fontSize: 13 }}>
            <span style={{ color: t.textPrimary }}>{m.nome}</span>
            <span style={{ fontWeight: 700, color: t.accent }}>R$ {fmt(m.total)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── RECEPCAO ─────────────────────────────────────────
export function RecepcaoPage() {
  const [suites, setSuites] = useState<Suite[]>([]);
  const [motels, setMotels] = useState<Motel[]>([]);
  const [reservasHoje, setReservasHoje] = useState<Reservation[]>([]);
  const hoje = new Date().toISOString().split("T")[0];

  useEffect(() => {
    api.get<Motel[]>("/motels").then(setMotels).catch(console.error);
    api.get<Reservation[]>(`/reservations?data_reserva=${hoje}&limit=500`).then(setReservasHoje).catch(console.error);
  }, []);

  useEffect(() => {
    motels.forEach((m) => {
      api.get<Suite[]>(`/motels/${m.id}/suites`).then((s) => setSuites((prev) => [...prev, ...s])).catch(console.error);
    });
  }, [motels]);

  const suiteStatus = (s: Suite) => {
    const ativa = reservasHoje.find((r) => r.suiteId === s.id && (r.status === "check_in" || r.status === "confirmado"));
    if (ativa) return "ocupado";
    const reservada = reservasHoje.find((r) => r.suiteId === s.id);
    if (reservada) return "reservado";
    return "livre";
  };

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ margin: "0 0 16px", fontSize: 20, fontWeight: 700, color: t.textPrimary }}>Mapa de Ocupação — {fmtDate(hoje)}</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
        {suites.map((s) => {
          const st = suiteStatus(s);
          const motel = motels.find((m) => m.id === s.motelId);
          return (
            <div
              key={s.id}
              style={{
                padding: 14, borderRadius: 12, border: `1px solid ${t.border}`,
                background: st === "ocupado" ? "#ffebee" : st === "reservado" ? "#fff3e0" : "#e8f5e9",
                borderLeft: `4px solid ${motel?.cor || t.accent}`,
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 14, color: t.textPrimary }}>{s.nome}</div>
              <div style={{ fontSize: 11, color: t.textSecondary }}>{motel?.nome}</div>
              <StatusBadge status={st === "ocupado" ? "check_in" : st === "reservado" ? "pendente_cartao" : "confirmado"} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── PRODUTOS ─────────────────────────────────────────
export function ProdutosPage() {
  return <Placeholder title="Produtos" />;
}

// ─── ESTOQUE ──────────────────────────────────────────
export function EstoquePage() {
  return <Placeholder title="Estoque & Frigobar" />;
}

// ─── CADASTRO ─────────────────────────────────────────
export function CadastroPage() {
  const [motels, setMotels] = useState<Motel[]>([]);
  const [activeTab, setActiveTab] = useState<"motels" | "suites">("motels");
  const [suites, setSuites] = useState<Suite[]>([]);

  useEffect(() => { api.get<Motel[]>("/motels").then(setMotels).catch(console.error); }, []);
  useEffect(() => {
    motels.forEach((m) => {
      api.get<Suite[]>(`/motels/${m.id}/suites`).then((s) => setSuites((prev) => [...prev, ...s])).catch(console.error);
    });
  }, [motels]);

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ margin: "0 0 16px", fontSize: 20, fontWeight: 700, color: t.textPrimary }}>Configurações</h2>
      <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
        <button onClick={() => setActiveTab("motels")} style={activeTab === "motels" ? tabActive : tabInactive}>Motéis</button>
        <button onClick={() => setActiveTab("suites")} style={activeTab === "suites" ? tabActive : tabInactive}>Suítes</button>
      </div>

      {activeTab === "motels" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {motels.map((m) => (
            <div key={m.id} style={{ padding: 14, borderRadius: 10, border: `1px solid ${t.border}`, background: t.bgCard, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: 16, marginRight: 8 }}>{m.icone || "🏨"}</span>
                <span style={{ fontWeight: 600, color: t.textPrimary }}>{m.nome}</span>
                <span style={{ fontSize: 11, color: t.textSecondary, marginLeft: 8 }}>{m.slug}</span>
              </div>
              <span style={{ color: m.ativo ? "#4caf50" : "#f44336", fontSize: 12, fontWeight: 600 }}>
                {m.ativo ? "Ativo" : "Inativo"}
              </span>
            </div>
          ))}
        </div>
      )}

      {activeTab === "suites" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {suites.map((s) => {
            const motel = motels.find((m) => m.id === s.motelId);
            return (
              <div key={s.id} style={{ padding: 14, borderRadius: 10, border: `1px solid ${t.border}`, background: t.bgCard }}>
                <div style={{ fontWeight: 600, color: t.textPrimary }}>{s.nome}</div>
                <div style={{ fontSize: 12, color: t.textSecondary }}>
                  {motel?.nome} · {s.descricao}
                </div>
                <div style={{ fontSize: 12, color: t.accent, marginTop: 4, fontWeight: 600 }}>
                  3h R${fmt(s.preco3)} · 12h R${fmt(s.preco12)} · 24h R${fmt(s.preco24)}
                </div>
                <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                  {s.tags?.map((tag) => (
                    <span key={tag} style={{ background: t.accentL, color: t.accent, padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 600 }}>{tag}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── CONTROLE DE ACESSO ───────────────────────────────
export function ControleAcessoPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nome: "", email: "", role: "funcionario", motelId: "" });
  const [motels, setMotels] = useState<Motel[]>([]);

  useEffect(() => {
    api.get<User[]>("/admin/users").then(setUsers).catch(console.error);
    api.get<Motel[]>("/motels").then(setMotels).catch(console.error);
  }, []);

  const createUser = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const novo = await api.post<User>("/admin/users", { nome: form.nome, email: form.email, role: form.role, motel_id: form.motelId || null });
      setUsers((prev) => [novo, ...prev]);
      setShowForm(false);
      setForm({ nome: "", email: "", role: "funcionario", motelId: "" });
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Remover usuário?")) return;
    await api.delete(`/admin/users/${id}`);
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: t.textPrimary }}>Controle de Acesso</h2>
        <button onClick={() => setShowForm(!showForm)} style={btnPrimarySm}>{showForm ? "Cancelar" : "+ Novo Usuário"}</button>
      </div>

      {showForm && (
        <form onSubmit={createUser} style={{ marginBottom: 16, padding: 16, background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <input placeholder="Nome" value={form.nome} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} style={inputSm} required />
            <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} style={inputSm} required />
            <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} style={selectSm}>
              <option value="funcionario">Funcionário</option>
              <option value="admin">Admin</option>
            </select>
            <select value={form.motelId} onChange={(e) => setForm((f) => ({ ...f, motelId: e.target.value }))} style={selectSm}>
              <option value="">Todos os motéis</option>
              {motels.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
            </select>
          </div>
          <button type="submit" style={{ ...btnPrimarySm, marginTop: 8 }}>Criar</button>
        </form>
      )}

      <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ color: t.textSecondary, textAlign: "left" }}>
            <th style={th}>Nome</th><th style={th}>Email</th><th style={th}>Cargo</th><th style={th}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} style={{ borderBottom: `1px solid ${t.border}` }}>
              <td style={td}>{u.nome}</td>
              <td style={td}>{u.email}</td>
              <td style={td}>
                <span style={{ background: u.role === "admin" ? "#e8eaf6" : "#f3e5f5", color: u.role === "admin" ? "#3f51b5" : "#9c27b0", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600 }}>{u.role}</span>
              </td>
              <td style={td}>
                <button onClick={() => deleteUser(u.id)} style={{ ...btnSm, color: "#f44336", borderColor: "#f44336" }}>Remover</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── NPS ADMIN ────────────────────────────────────────
export function NpsAdminPage() {
  const [motels, setMotels] = useState<Motel[]>([]);
  const [selectedMotel, setSelectedMotel] = useState("");
  const [responses, setResponses] = useState<NpsResponse[]>([]);

  useEffect(() => { api.get<Motel[]>("/motels").then(setMotels).catch(console.error); }, []);

  useEffect(() => {
    if (!selectedMotel) return;
    api.get<NpsResponse[]>(`/nps/${selectedMotel}`).then(setResponses).catch(() => setResponses([]));
  }, [selectedMotel]);

  const nps = responses.length
    ? ((responses.filter((r) => r.nota >= 9).length - responses.filter((r) => r.nota <= 6).length) / responses.length * 100)
    : null;

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ margin: "0 0 16px", fontSize: 20, fontWeight: 700, color: t.textPrimary }}>Pesquisa NPS</h2>
      <select value={selectedMotel} onChange={(e) => setSelectedMotel(e.target.value)} style={{ ...selectSm, marginBottom: 16, width: 250 }}>
        <option value="">Selecione um motel</option>
        {motels.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
      </select>

      {nps !== null && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 16, marginBottom: 24 }}>
          <Kpi label="NPS" value={nps.toFixed(0)} />
          <Kpi label="Promotores (9-10)" value={responses.filter((r) => r.nota >= 9).length} />
          <Kpi label="Neutros (7-8)" value={responses.filter((r) => r.nota >= 7 && r.nota <= 8).length} />
          <Kpi label="Detratores (0-6)" value={responses.filter((r) => r.nota <= 6).length} />
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {responses.map((r) => (
          <div key={r.id} style={{ padding: 12, borderRadius: 10, border: `1px solid ${t.border}`, background: t.bgCard }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700, fontSize: 18, color: r.nota >= 9 ? "#4caf50" : r.nota >= 7 ? "#ff9800" : "#f44336" }}>{r.nota}</span>
              <span style={{ fontSize: 11, color: t.textSecondary }}>{new Date(r.createdAt).toLocaleDateString("pt-BR")}</span>
            </div>
            {r.comentario && <div style={{ fontSize: 13, color: t.textPrimary, marginTop: 4 }}>{r.comentario}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ENCURTADOR ───────────────────────────────────────
export function EncurtadorPage() {
  const [motels, setMotels] = useState<Motel[]>([]);
  const [selectedMotel, setSelectedMotel] = useState("");
  const [links, setLinks] = useState<LinktreeItem[]>([]);
  const [form, setForm] = useState({ title: "", url: "", icon: "🔗" });

  useEffect(() => { api.get<Motel[]>("/motels").then(setMotels).catch(console.error); }, []);

  useEffect(() => {
    if (!selectedMotel) return;
    api.get<LinktreeItem[]>(`/linktree/${selectedMotel}`).then(setLinks).catch(() => setLinks([]));
  }, [selectedMotel]);

  const addLink = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedMotel) return;
    // POST via generic API would need linktree POST route
    setLinks((prev) => [...prev, { id: crypto.randomUUID(), motelId: selectedMotel, ...form, ordem: prev.length, ativo: true }]);
    setForm({ title: "", url: "", icon: "🔗" });
  };

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ margin: "0 0 16px", fontSize: 20, fontWeight: 700, color: t.textPrimary }}>Encurtador de Links</h2>
      <select value={selectedMotel} onChange={(e) => setSelectedMotel(e.target.value)} style={{ ...selectSm, marginBottom: 16, width: 250 }}>
        <option value="">Selecione um motel</option>
        {motels.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
      </select>

      {selectedMotel && (
        <form onSubmit={addLink} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <select value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} style={{ ...selectSm, width: 60 }}>
            {["🔗", "📸", "📞", "📍", "🌐", "📱", "⭐"].map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
          <input placeholder="Título" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} style={inputSm} required />
          <input placeholder="URL" value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))} style={inputSm} required />
          <button type="submit" style={btnPrimarySm}>+</button>
        </form>
      )}

      {links.map((l) => (
        <div key={l.id} style={{ display: "flex", gap: 12, alignItems: "center", padding: 10, borderBottom: `1px solid ${t.border}` }}>
          <span style={{ fontSize: 18 }}>{l.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: t.textPrimary }}>{l.title}</div>
            <div style={{ fontSize: 11, color: t.textSecondary }}>{l.url}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── GOVERNANCA ───────────────────────────────────────
export function GovernancaPage() {
  return <Placeholder title="Governança" />;
}

// ─── SHARED COMPONENTS ────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const labels: Record<string, string> = {
    confirmado: "Confirmado", check_in: "Check-in", aguardando_pagamento: "Aguardando PIX",
    pendente_cartao: "Pendente Cartão", pendente_recepcao: "Pendente Recepção", cancelado: "Cancelado",
    ocupado: "Ocupado", reservado: "Reservado", livre: "Livre",
  };
  return (
    <span style={{
      background: `${statusColor[status] || "#999"}22`, color: statusColor[status] || "#999",
      padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600,
    }}>
      {labels[status] || status}
    </span>
  );
}

function Kpi({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ padding: 16, background: t.bgCard, borderRadius: 12, border: `1px solid ${t.border}` }}>
      <div style={{ fontSize: 12, color: t.textSecondary, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: t.textPrimary }}>{value}</div>
    </div>
  );
}

function Placeholder({ title }: { title: string }) {
  return (
    <div style={{ padding: 40, textAlign: "center", color: t.textSecondary }}>
      <p style={{ fontSize: 16 }}>{title}</p>
      <p style={{ fontSize: 13 }}>Disponível em breve</p>
    </div>
  );
}

// ─── STYLES ───────────────────────────────────────────
const th: React.CSSProperties = { padding: "8px 10px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", borderBottom: `2px solid ${t.border}` };
const td: React.CSSProperties = { padding: "8px 10px", fontSize: 13 };
const inputSm: React.CSSProperties = { padding: "6px 10px", borderRadius: 8, border: `1px solid ${t.border}`, background: t.bgItem, color: t.textPrimary, fontSize: 13, outline: "none" };
const selectSm: React.CSSProperties = { ...inputSm, cursor: "pointer" };
const btnSm: React.CSSProperties = { padding: "6px 14px", borderRadius: 8, border: `1px solid ${t.border}`, background: "transparent", color: t.textPrimary, fontSize: 12, fontWeight: 600, cursor: "pointer" };
const btnPrimarySm: React.CSSProperties = { padding: "8px 16px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #d20150, #a0013d)", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" };
const tabActive: React.CSSProperties = { padding: "8px 16px", borderRadius: 8, border: "none", background: t.accent, color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" };
const tabInactive: React.CSSProperties = { ...tabActive, background: t.bgItem, color: t.textSecondary };
