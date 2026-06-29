import { useState, useContext } from "react";
import { t } from "../../styles/tokens";
import { AppCtx } from "../../context/AppContext";
import { delay } from "../../data/mock";
import GlobalStyles from "../../styles/GlobalStyles";
import { Input } from "../ui/Input";
import { Btn } from "../ui/Btn";

export function LoginPage() {
  const { setPage } = useContext(AppCtx);
  const [email, setEmail] = useState("");
  const [pass, setPass]   = useState("");
  const [err, setErr]     = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    if (!email || !pass) { setErr("Preencha email e senha."); return; }
    setLoading(true); await delay(800); setLoading(false); setPage("admin");
  };

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg, #fce4ec 0%, #ffcdd9 100%)", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <GlobalStyles/>
      <div style={{ width:380, padding:"56px 48px", background:t.bgCard, border:`1px solid ${t.border}`, borderRadius:24, boxShadow:`0 8px 24px rgba(210,1,80,0.12)`, textAlign:"center" }}>
        <div style={{ fontSize:48, marginBottom:16 }}>🏨</div>
        <h1 style={{ fontSize:24, fontWeight:800, letterSpacing:"-0.5px", margin:"0 0 8px", background:"linear-gradient(135deg, #d20150, #a0013d)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Motéis Fortaleza</h1>
        <p style={{ color:t.textSecondary, fontSize:14, margin:"0 0 32px", lineHeight:1.5 }}>Painel de gerenciamento de reservas</p>

        {err && <p style={{ color:t.red, fontSize:12, marginBottom:14, textAlign:"center" }}>{err}</p>}

        <Input value={email} onChange={e=>setEmail(e.target.value)} placeholder="operador@moteis.com.br" style={{ textAlign:"center", marginBottom:12 }}/>
        <Input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••" style={{ textAlign:"center", marginBottom:24 }}/>
        <Btn onClick={handle} disabled={loading} style={{ width:"100%", padding:"14px 24px", fontSize:15, background:"linear-gradient(135deg, #d20150, #a0013d)", boxShadow:"0 2px 8px rgba(210,1,80,0.2)" }}>
          {loading ? "⏳ Verificando..." : "Entrar"}
        </Btn>
        <p style={{ color:t.textMuted, fontSize:11, textAlign:"center", marginTop:24 }}>Demo: qualquer email + senha</p>
      </div>
    </div>
  );
}
