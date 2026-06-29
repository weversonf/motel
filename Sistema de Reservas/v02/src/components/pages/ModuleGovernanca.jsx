import { useState } from "react";
import { t } from "../../styles/tokens";
import { Btn } from "../ui/Btn";
import { Card } from "../ui/Card";
import { Chip } from "../ui/Chip";
import GlobalStyles from "../../styles/GlobalStyles";

const items = ["Cerveja Long Neck","Água Mineral","Refrigerante Lata","Amendoim","Batata Chips","Preservativo CX12","Gel Íntimo","Chocolate"];

export function ModuleGovernanca({ suites, setSuites }) {
  const dirty = suites.filter(s=>s.status==="suja"||s.status==="em_limpeza");
  const [active, setActive] = useState(null);
  const [modal, setModal]   = useState(false);
  const [consumed, setConsumed] = useState({});

  const start = suite => {
    setSuites(prev=>prev.map(s=>s.id===suite.id?{...s,status:"em_limpeza",camareira:"Você"}:s));
    setActive({...suite,startedAt:new Date()});
  };
  const finish = () => {
    setSuites(prev=>prev.map(s=>s.id===active.id?{...s,status:"disponivel",camareira:undefined}:s));
    setActive(null); setModal(false); setConsumed({});
  };

  return (
    <div style={{ minHeight:"100vh",background:t.bg }}>
      <GlobalStyles/>
      <div style={{ background:t.bgCard,padding:"14px 16px",borderBottom:`1px solid ${t.border}`,
        position:"sticky",top:0,zIndex:10,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
        <div>
          <p style={{ color:t.textPrimary,fontWeight:700,fontSize:16,margin:0 }}>🧹 Governança</p>
          <p style={{ color:t.textSecondary,fontSize:11,margin:0 }}>Painel da Camareira</p>
        </div>
        <div style={{ textAlign:"right" }}>
          <p style={{ color:t.accent,fontWeight:700,fontSize:18,margin:0 }}>{dirty.length}</p>
          <p style={{ color:t.textSecondary,fontSize:10,margin:0 }}>pendentes</p>
        </div>
      </div>

      {active&&(
        <div style={{ background:`${t.blue}18`,borderBottom:`2px solid ${t.blue}`,padding:"10px 16px" }}>
          <p style={{ color:t.blue,fontWeight:600,fontSize:13,margin:0 }}>⏳ Em andamento: {active.name} #{active.number}</p>
          <p style={{ color:t.textSecondary,fontSize:11,margin:0 }}>Início: {active.startedAt.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}</p>
        </div>
      )}

      <div style={{ padding:14,display:"flex",flexDirection:"column",gap:10 }}>
        {dirty.length===0?(
          <div style={{ textAlign:"center",padding:"60px 20px" }}>
            <p style={{ fontSize:40,marginBottom:10 }}>✨</p>
            <p style={{ color:t.textPrimary,fontWeight:700,fontSize:17 }}>Tudo limpo!</p>
            <p style={{ color:t.textSecondary,fontSize:13 }}>Nenhuma suíte pendente.</p>
          </div>
        ):dirty.map(suite=>{
          const inProg=suite.status==="em_limpeza";
          const isMe=active?.id===suite.id;
          return (
            <Card key={suite.id} style={{ padding:16,borderLeft:`3px solid ${inProg?t.blue:t.yellow}` }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8 }}>
                <div>
                  <p style={{ color:t.textPrimary,fontWeight:700,fontSize:15,margin:0 }}>{suite.name}</p>
                  <p style={{ color:t.textSecondary,fontSize:12,margin:"2px 0 0" }}>#{suite.number} · {suite.floor}º andar</p>
                </div>
                <Chip color={inProg?t.blue:t.yellow}>{inProg?"Em Limpeza":"Aguardando"}</Chip>
              </div>
              {!inProg&&!active&&(
                <Btn onClick={()=>start(suite)} style={{ width:"100%",padding:"12px 0",fontSize:14 }}>🧹 Iniciar Limpeza</Btn>
              )}
              {isMe&&(
                <Btn variant="success" onClick={()=>setModal(true)} style={{ width:"100%",padding:"12px 0",fontSize:14 }}>✅ Finalizar Limpeza</Btn>
              )}
              {inProg&&!isMe&&(
                <p style={{ color:t.blue,fontSize:12,margin:0 }}>👤 {suite.camareira}</p>
              )}
            </Card>
          );
        })}
      </div>

      {modal&&(
        <div style={{ position:"fixed",inset:0,background:"#000000CC",display:"flex",alignItems:"flex-end",zIndex:100 }}>
          <div style={{ width:"100%",background:t.bgCard,borderRadius:"16px 16px 0 0",padding:20,maxHeight:"80vh",overflowY:"auto",borderTop:`1px solid ${t.border}` }}>
            <h3 style={{ color:t.textPrimary,fontWeight:700,fontSize:16,marginBottom:4 }}>Registrar Consumo</h3>
            <p style={{ color:t.textSecondary,fontSize:12,marginBottom:16 }}>Marque os itens consumidos antes de liberar a suíte.</p>
            <div style={{ display:"flex",flexDirection:"column",gap:8,marginBottom:20 }}>
              {items.map(item=>(
                <div key={item} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",
                  background:t.bgItem,borderRadius:6,padding:"11px 14px" }}>
                  <span style={{ color:t.textPrimary,fontSize:13 }}>{item}</span>
                  <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                    {consumed[item]>0&&<span style={{ color:t.accent,fontWeight:700 }}>×{consumed[item]}</span>}
                    <button onClick={()=>setConsumed(c=>({...c,[item]:(c[item]||0)+1}))}
                      style={{ width:30,height:30,borderRadius:"50%",
                        background:consumed[item]>0?t.accent:"transparent",
                        border:`1px solid ${consumed[item]>0?t.accent:t.border2}`,
                        color:consumed[item]>0?t.white:t.textSecondary,
                        fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700 }}>+</button>
                  </div>
                </div>
              ))}
            </div>
            <Btn variant="success" onClick={finish} style={{ width:"100%",padding:"14px 0",fontSize:15,marginBottom:8 }}>✅ Liberar como Disponível</Btn>
            <Btn variant="ghost" onClick={()=>setModal(false)} style={{ width:"100%",padding:"12px 0" }}>Cancelar</Btn>
          </div>
        </div>
      )}
    </div>
  );
}
