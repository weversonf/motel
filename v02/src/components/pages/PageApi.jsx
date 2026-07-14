import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { Btn } from "../ui/Btn";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import { Header } from "../layout/Header";

export function PageApi({ moteis, setMoteis }) {
  const { t } = useTheme();

  const regenToken = (id) => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    const rand = (len) => Array.from({length:len},()=>chars[Math.floor(Math.random()*chars.length)]).join("");
    const prefix = id === "motel1" ? "mfn_sk_live_" : id === "motel2" ? "mfs_sk_live_" : "mt_sk_";
    setMoteis(prev => prev.map(m => m.id === id ? { ...m, token: prefix + rand(12) } : m));
  };

  return (
    <div className="fade-in" style={{ display:"flex",flexDirection:"column",height:"100%" }}>
      <Header title="🔌 API & Integração" sub="Gerencie tokens de acesso e endpoints"/>
      <div style={{ flex:1,overflowY:"auto",padding:20 }}>
        <Card style={{ padding:24,marginBottom:20 }}>
          <h3 style={{ color:t.textPrimary,fontWeight:700,fontSize:15,margin:"0 0 8px" }}>Endpoints disponíveis</h3>
          <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
            {[
              { method:"GET",    path:"/api/v1/reservas",        desc:"Lista todas as reservas" },
              { method:"POST",   path:"/api/v1/reservas",        desc:"Cria nova reserva" },
              { method:"GET",    path:"/api/v1/reservas/:id",    desc:"Detalhes de uma reserva" },
              { method:"PUT",    path:"/api/v1/reservas/:id",    desc:"Atualiza status da reserva" },
              { method:"GET",    path:"/api/v1/suites",          desc:"Lista todas as suítes" },
              { method:"GET",    path:"/api/v1/suites/:id",      desc:"Detalhes de uma suíte" },
              { method:"GET",    path:"/api/v1/financeiro",      desc:"Resumo financeiro" },
              { method:"POST",   path:"/api/v1/webhooks/asaas",  desc:"Webhook de pagamento Asaas" },
            ].map(e => (
              <div key={e.path} style={{ display:"flex",alignItems:"center",gap:12,padding:"8px 12px",
                background:t.bgItem,borderRadius:4 }}>
                <span style={{ fontWeight:700,fontSize:11,color:e.method==="GET" ? t.green : e.method==="POST" ? t.blue : t.yellow,
                  background:`${e.method==="GET"?t.green:e.method==="POST"?t.blue:t.yellow}18`,
                  padding:"3px 8px",borderRadius:3,minWidth:48,textAlign:"center" }}>
                  {e.method}
                </span>
                <code style={{ fontSize:12,color:t.textPrimary,fontFamily:"monospace" }}>{e.path}</code>
                <span style={{ fontSize:11,color:t.textSecondary,marginLeft:"auto" }}>{e.desc}</span>
              </div>
            ))}
          </div>
        </Card>

        <h3 style={{ color:t.textPrimary,fontWeight:700,fontSize:15,margin:"0 0 14px" }}>Tokens por Motel</h3>
        {moteis.map(motel => (
          <Card key={motel.id} style={{ padding:20,marginBottom:16,borderLeft:`4px solid ${motel.cor}` }}>
            <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:12 }}>
              <span style={{ fontSize:20 }}>{motel.icon}</span>
              <span style={{ fontWeight:700,color:t.textPrimary,fontSize:14 }}>{motel.name}</span>
            </div>
            <div style={{ display:"flex",alignItems:"center",gap:10 }}>
              <div style={{ flex:1,background:t.bgItem,border:`1px solid ${t.border}`,borderRadius:6,
                padding:"10px 14px",display:"flex",alignItems:"center",gap:10 }}>
                <code style={{ flex:1,fontSize:12,color:t.textPrimary,fontFamily:"monospace",wordBreak:"break-all" }}>
                  {motel.token}
                </code>
                <button onClick={()=>navigator.clipboard?.writeText(motel.token)}
                  style={{ background:"transparent",border:"none",color:t.textSecondary,cursor:"pointer",fontSize:14 }}
                  title="Copiar">📋</button>
              </div>
            </div>
            <div style={{ display:"flex",gap:8,marginTop:10,alignItems:"center" }}>
              <Btn small variant="ghost" onClick={()=>regenToken(motel.id)}>🔄 Regenerar Token</Btn>
              <span style={{ fontSize:10,color:t.textMuted }}>Autenticação: Bearer Token no header</span>
              <span style={{ marginLeft:"auto",padding:"4px 10px",borderRadius:12,fontSize:10,fontWeight:600,
                background:`${t.green}22`,color:t.green }}>
                ✓ Ativo
              </span>
            </div>
          </Card>
        ))}

        <Card style={{ padding:20,marginTop:20 }}>
          <h3 style={{ color:t.textPrimary,fontWeight:700,fontSize:15,margin:"0 0 12px" }}>Exemplo de requisição</h3>
          <pre style={{ background:t.bgItem,border:`1px solid ${t.border}`,borderRadius:6,padding:16,
            fontSize:12,color:t.textPrimary,fontFamily:"monospace",overflow:"auto",lineHeight:1.6 }}>
{`curl -X GET "https://api.moteis.com.br/api/v1/reservas" \\
  -H "Authorization: Bearer ${moteis[0]?.token || 'SEU_TOKEN'}" \\
  -H "Content-Type: application/json"`}
          </pre>
        </Card>
      </div>
    </div>
  );
}
