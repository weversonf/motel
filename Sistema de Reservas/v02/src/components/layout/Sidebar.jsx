import { useContext, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import { AppCtx } from "../../context/AppContext";

const NAV = [
  { id:"calendario",  label:"Calendário",        icon:"📅" },
  { id:"tabela",      label:"Tabela",             icon:"📋" },
  { id:"relatorios",  label:"Relatórios",         icon:"📊" },
  { id:"__sep1",      sep:true },
  { id:"recepcao",    label:"Mapa de Ocupação",   icon:"🏨" },
  { id:"estoque",     label:"Estoque & Frigobar", icon:"🛒" },
  { id:"produtos",    label:"Produtos",           icon:"🍺" },
  { id:"financeiro",  label:"Financeiro",         icon:"💰" },
  { id:"__sep2",      sep:true },
  { id:"gerenciar",   label:"Gerenciar Motéis/Suítes", icon:"🏢" },
  { id:"api",         label:"API & Integração",   icon:"🔌" },
  { id:"acesso",      label:"Controle de Acesso", icon:"🔐" },
  { id:"__sep3",      sep:true },
  { id:"encurtador",  label:"Encurtador de Links",icon:"🔗" },
  { id:"nps",         label:"Pesquisa NPS",       icon:"📝" },
  { id:"__sep4",      sep:true },
  { id:"governanca",  label:"Governança",         icon:"🧹" },
];

export function Sidebar({ active, setActive, open, setOpen }) {
  const { t, theme, toggleTheme } = useTheme();
  const { setPage } = useContext(AppCtx);
  const W = open ? 220 : 52;

  useEffect(() => {
    const handleKey = (e) => {
      if (e.ctrlKey && e.key === "b") {
        e.preventDefault();
        setOpen(o => !o);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [setOpen]);

  return (
    <aside style={{ width:W, minWidth:W, background:t.bgCard, borderRight:`1px solid ${t.border}`,
      display:"flex", flexDirection:"column", height:"100vh", position:"sticky", top:0,
      transition:"width .2s", overflow:"hidden", flexShrink:0 }}>

      <div style={{ padding: open ? "18px 16px" : "18px 10px", borderBottom:`1px solid ${t.border}`,
        display:"flex", alignItems:"center", gap:10, minWidth:220 }}>
        <div onClick={toggleTheme} style={{ width:32, height:32, borderRadius:6, display:"flex",
          alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0, cursor:"pointer",
          transition:".15s", overflow:"hidden", background:"transparent" }} title="Alternar tema">
          <img src="logo.png" alt="Logo" style={{ width:"100%", height:"100%", objectFit:"contain" }} />
        </div>
        {open && (
          <div>
            <p style={{ color:t.textPrimary, fontWeight:700, fontSize:13, margin:0, lineHeight:1.2 }}>Motéis Fortaleza</p>
            <p style={{ color:t.textSecondary, fontSize:10, margin:0 }}>Painel de reservas</p>
          </div>
        )}
      </div>

      <nav style={{ flex:1, overflowY:"auto", padding:"8px 6px" }}>
        {NAV.map((item, i) => {
          if (item.sep) return (
            <div key={i} style={{ height:1, background:t.border, margin:"6px 4px" }}/>
          );
          const isActive = active === item.id;
          return (
            <button key={item.id} onClick={() => setActive(item.id)} title={item.label}
              style={{ display:"flex", alignItems:"center", gap:9, width:"100%", padding: open ? "7px 10px" : "8px 10px",
                borderRadius:5, border:"none", background:isActive ? `${t.accent}22` : "transparent",
                color: isActive ? t.accent : t.textSecondary, textAlign:"left",
                fontSize:13, fontWeight:isActive?600:400, transition:"background .15s",
                justifyContent: open ? "flex-start" : "center" }}
              onMouseEnter={e=>!isActive&&(e.currentTarget.style.background=t.bgHover)}
              onMouseLeave={e=>!isActive&&(e.currentTarget.style.background="transparent")}>
              <span style={{ fontSize:15, flexShrink:0 }}>{item.icon}</span>
              {open && (
                <>
                  <span style={{ whiteSpace:"nowrap", flex:1 }}>{item.label}</span>
                  {item.badge && (
                    <span style={{ background:t.accent, color:t.white,
                      borderRadius:3, padding:"1px 5px", fontSize:9, fontWeight:700 }}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
              {isActive && <div style={{ position:"absolute", right:0, width:3, height:20, background:t.accent, borderRadius:"2px 0 0 2px" }}/>}
            </button>
          );
        })}
      </nav>

      <div style={{ borderTop:`1px solid ${t.border}`, padding:"8px 6px" }}>
        <button onClick={() => toggleTheme()}
          style={{ display:"flex", alignItems:"center", gap:9, width:"100%", padding:"7px 10px",
            borderRadius:5, border:"none", background:"transparent", color:t.textSecondary,
            fontSize:12, cursor:"pointer", justifyContent:open?"flex-start":"center" }}>
          <span>{theme === "noir" ? "☀️" : "🌙"}</span>
          {open && (theme === "noir" ? "Modo Claro" : "Modo Noturno")}
        </button>
        <button onClick={() => setOpen(o=>!o)}
          style={{ display:"flex", alignItems:"center", gap:9, width:"100%", padding:"7px 10px",
            borderRadius:5, border:"none", background:"transparent", color:t.textSecondary,
            fontSize:12, cursor:"pointer", justifyContent:open?"flex-start":"center" }}>
          <span>{open ? "◀" : "▶"}</span>
          {open && "Recolher"}
        </button>
        {open && (
          <div style={{ color:t.textMuted, fontSize:9, padding:"4px 10px", textAlign:"center" }}>
            Ctrl+B
          </div>
        )}
        <div style={{ display:"flex", alignItems:"center", gap:9, padding:"8px 10px", marginTop:2,
          borderTop:`1px solid ${t.border}` }}>
          <div style={{ width:28, height:28, background:t.accent, borderRadius:"50%", display:"flex",
            alignItems:"center", justifyContent:"center", color:t.white, fontWeight:700, fontSize:13, flexShrink:0 }}>U</div>
          {open && (
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ color:t.textPrimary, fontSize:12, fontWeight:600, margin:0 }}>Operador</p>
              <p style={{ color:t.textSecondary, fontSize:10, margin:0 }}>Acesso limitado</p>
            </div>
          )}
          {open && (
            <button onClick={() => setPage("login")}
              style={{ background:"transparent", border:"none", color:t.textMuted, fontSize:11, cursor:"pointer" }}>
              Sair
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
