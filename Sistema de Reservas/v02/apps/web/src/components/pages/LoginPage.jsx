import { useContext } from "react";
import { t } from "../../styles/tokens";
import { AppCtx } from "../../context/AppContext";
import { USUARIOS_DATA, PERFIS_DATA, MOTEIS_DATA } from "../../data/mock";
import GlobalStyles from "../../styles/GlobalStyles";

export function LoginPage() {
  const { login } = useContext(AppCtx);

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg, #fce4ec 0%, #ffcdd9 100%)",
      display:"flex", alignItems:"center", justifyContent:"center" }}>
      <GlobalStyles/>
      <div style={{ width:400, padding:"40px 36px", background:t.bgCard, border:`1px solid ${t.border}`,
        borderRadius:24, boxShadow:`0 8px 24px rgba(210,1,80,0.12)`, textAlign:"center" }}>
        <img src="/ICONE.png" alt="" style={{ width:56, height:56, marginBottom:12, objectFit:"contain" }} />
        <h1 style={{ fontSize:22, fontWeight:800, margin:"0 0 4px", background:"linear-gradient(135deg, #d20150, #a0013d)",
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Motéis Fortaleza</h1>
        <p style={{ color:t.textSecondary, fontSize:13, margin:"0 0 24px" }}>Painel de gerenciamento</p>

        <p style={{ color:t.textSecondary, fontSize:11, margin:"0 0 12px", fontWeight:600 }}>Selecione o usuário</p>
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          {USUARIOS_DATA.map(u => {
            const perfil = PERFIS_DATA.find(p=>p.id===u.perfil);
            const motel = u.motelId==="todos" ? "Visão geral" : MOTEIS_DATA.find(m=>m.id===u.motelId)?.name;
            return (
              <button key={u.id} onClick={()=>login(u)}
                style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 14px", borderRadius:10,
                  border:`1px solid ${t.border}`, background:t.bgItem, cursor:"pointer", textAlign:"left",
                  transition:"all .15s", width:"100%" }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=t.accent;e.currentTarget.style.background=t.accentL}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=t.border;e.currentTarget.style.background=t.bgItem}}>
                <div style={{ width:36, height:36, borderRadius:"50%", background:t.accent,
                  display:"flex", alignItems:"center", justifyContent:"center", color:"#fff",
                  fontWeight:700, fontSize:14, flexShrink:0 }}>{u.avatar}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ margin:0, fontSize:13, fontWeight:600, color:t.textPrimary }}>{u.name}</p>
                  <p style={{ margin:0, fontSize:11, color:t.textSecondary }}>
                    {perfil?.label} · {motel}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
