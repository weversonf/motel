import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { authClient } from "../../lib/auth-client";
import { t } from "../../styles/tokens";

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "📊", path: "/admin" },
  { id: "calendario", label: "Calendário", icon: "📅", path: "/admin/calendario" },
  { id: "tabela", label: "Tabela", icon: "📋", path: "/admin/tabela" },
  { id: "relatorios", label: "Relatórios", icon: "📊", path: "/admin/relatorios" },
  { sep: true },
  { id: "recepcao", label: "Mapa de Ocupação", icon: "🏨", path: "/admin/recepcao" },
  { id: "estoque", label: "Estoque & Frigobar", icon: "🛒", path: "/admin/estoque" },
  { id: "produtos", label: "Produtos", icon: "🍺", path: "/admin/produtos" },
  { id: "cadastro", label: "Configurações", icon: "⚙️", path: "/admin/cadastro" },
  { sep: true },
  { id: "encurtador", label: "Encurtador de Links", icon: "🔗", path: "/admin/encurtador" },
  { id: "nps", label: "Pesquisa NPS", icon: "📝", path: "/admin/nps" },
  { sep: true },
  { id: "acesso", label: "Controle de Acesso", icon: "🔐", path: "/admin/acesso" },
  { id: "governanca", label: "Governança", icon: "🧹", path: "/admin/governanca" },
];

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<{ name: string; email: string; role?: string } | null>(null);
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authClient.getSession().then(({ data }) => {
      if (!data?.user) {
        navigate("/admin/login");
        return;
      }
      setUser(data.user as unknown as { name: string; email: string; role?: string });
      setLoading(false);
    }).catch(() => {
      navigate("/admin/login");
    });
  }, [navigate]);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: t.textSecondary }}>
        Carregando...
      </div>
    );
  }

  const W = open ? 220 : 52;
  const activeId = NAV.find((item) => !("sep" in item) && item.path === location.pathname)?.id || "dashboard";

  return (
    <div style={{ display: "flex", height: "100vh", background: t.bg, overflow: "hidden" }}>
      <aside
        style={{
          width: W,
          minWidth: W,
          background: t.bgCard,
          borderRight: `1px solid ${t.border}`,
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          transition: "width .2s",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            padding: open ? "18px 16px" : "18px 10px",
            borderBottom: `1px solid ${t.border}`,
            display: "flex",
            alignItems: "center",
            gap: 10,
            minWidth: 220,
          }}
        >
          <img
            src="/ICONE.png"
            alt="Logo"
            style={{ width: 32, height: 32, borderRadius: 6, objectFit: "contain", flexShrink: 0 }}
          />
          {open && (
            <div>
              <p style={{ color: t.textPrimary, fontWeight: 700, fontSize: 13, margin: 0, lineHeight: 1.2 }}>
                Motéis Fortaleza
              </p>
              <p style={{ color: t.textSecondary, fontSize: 10, margin: 0 }}>Painel de reservas</p>
            </div>
          )}
        </div>

        <nav style={{ flex: 1, overflowY: "auto", padding: "8px 6px" }}>
          {NAV.map((item, i) => {
            if ("sep" in item) {
              return <div key={i} style={{ height: 1, background: t.border, margin: "6px 4px" }} />;
            }
            const isActive = activeId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  width: "100%",
                  padding: open ? "7px 10px" : "8px 10px",
                  borderRadius: 5,
                  border: "none",
                  background: isActive ? `${t.accent}22` : "transparent",
                  color: isActive ? t.accent : t.textSecondary,
                  textAlign: "left",
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  transition: "background .15s",
                  justifyContent: open ? "flex-start" : "center",
                  cursor: "pointer",
                  position: "relative",
                }}
              >
                <span style={{ fontSize: 15, flexShrink: 0 }}>{item.icon}</span>
                {open && <span style={{ whiteSpace: "nowrap", flex: 1 }}>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div style={{ borderTop: `1px solid ${t.border}`, padding: "8px 6px" }}>
          <button
            onClick={() => setOpen((o) => !o)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              width: "100%",
              padding: "7px 10px",
              borderRadius: 5,
              border: "none",
              background: "transparent",
              color: t.textSecondary,
              fontSize: 12,
              cursor: "pointer",
              justifyContent: open ? "flex-start" : "center",
            }}
          >
            <span>{open ? "◀" : "▶"}</span>
            {open && "Recolher"}
          </button>
          {user && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                padding: "8px 10px",
                marginTop: 2,
                borderTop: `1px solid ${t.border}`,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  background: t.accent,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 13,
                  flexShrink: 0,
                }}
              >
                {user.name?.charAt(0).toUpperCase() || "U"}
              </div>
              {open && (
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: t.textPrimary, fontSize: 12, fontWeight: 600, margin: 0 }}>
                    {user.name}
                  </p>
                  <p style={{ color: t.textSecondary, fontSize: 10, margin: 0 }}>
                    {user.role || "funcionario"}
                  </p>
                </div>
              )}
              {open && (
                <button
                  onClick={async () => {
                    await authClient.signOut();
                    navigate("/admin/login");
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: t.textSecondary,
                    fontSize: 11,
                    cursor: "pointer",
                  }}
                >
                  Sair
                </button>
              )}
            </div>
          )}
        </div>
      </aside>

      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto" }}>
        <Outlet />
      </main>
    </div>
  );
}
