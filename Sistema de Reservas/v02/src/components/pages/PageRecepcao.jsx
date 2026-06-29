import { useState } from "react";
import { t } from "../../styles/tokens";
import { useTimer } from "../../hooks/useTimer";
import { Btn } from "../ui/Btn";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Card } from "../ui/Card";
import { Chip } from "../ui/Chip";
import { Header } from "../layout/Header";

const SUITE_STATUS = {
  disponivel:  { label:"Disponível",      color:t.avail,    border:`${t.avail}44`   },
  ocupada:     { label:"Ocupada",         color:t.occupied, border:`${t.occupied}44`},
  suja:        { label:"Aguard. Limpeza", color:t.yellow,   border:`${t.yellow}44`  },
  em_limpeza:  { label:"Em Limpeza",      color:t.cleaning, border:`${t.cleaning}44`},
  manutencao:  { label:"Manutenção",      color:t.maint,    border:`${t.maint}44`   },
};

function OccTimer({ since }) {
  const t2 = useTimer(since);
  return <span style={{fontFamily:"monospace",color:t.red,fontSize:12,fontWeight:700}}>{t2}</span>;
}

export function PageRecepcao({ suites, setSuites }) {
  const [checkinT, setCI] = useState(null);
  const [checkoutT, setCO] = useState(null);
  const [filter, setFilter] = useState("todos");
  const [guest, setGuest] = useState("");
  const [type, setType]   = useState("rotativo");
  const [method, setMethod] = useState("pix");

  const doCheckin = () => {
    if (!guest) return;
    setSuites(prev=>prev.map(s=>s.id===checkinT.id?{...s,status:"ocupada",currentGuest:guest,occupiedSince:new Date()}:s));
    setCI(null); setGuest("");
  };
  const doCheckout = () => {
    setSuites(prev=>prev.map(s=>s.id===checkoutT.id?{...s,status:"suja",currentGuest:undefined,occupiedSince:undefined}:s));
    setCO(null);
  };

  const counts = Object.keys(SUITE_STATUS).reduce((a,k)=>({...a,[k]:suites.filter(s=>s.status===k).length}),{});
  const shown  = filter==="todos"?suites:suites.filter(s=>s.status===filter);

  return (
    <div className="fade-in" style={{ display:"flex",flexDirection:"column",height:"100%" }}>
      <Header title="🏨 Mapa de Ocupação" sub="Status em tempo real"
        right={
          <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
            {[["todos","Todos",t.accent],...Object.entries(SUITE_STATUS).map(([k,v])=>[k,v.label,v.color])].flat(1).filter(x=>Array.isArray(x)).map(([val,lbl,col])=>(
              <button key={val} onClick={()=>setFilter(val)}
                style={{ padding:"4px 10px",borderRadius:4,border:`1px solid ${filter===val?col:t.border}`,
                  background:filter===val?`${col}22`:"transparent",color:filter===val?col:t.textSecondary,
                  cursor:"pointer",fontSize:11,fontWeight:filter===val?600:400 }}>
                {lbl}
                {val!=="todos"&&<span style={{marginLeft:4,opacity:.7}}>({counts[val]||0})</span>}
              </button>
            ))}
          </div>
        }
      />
      <div style={{ flex:1,overflowY:"auto",padding:20 }}>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))",gap:12 }}>
          {shown.map(suite=>{
            const cfg = SUITE_STATUS[suite.status];
            return (
              <div key={suite.id} style={{ background:t.bgCard,border:`1px solid ${cfg.border}`,borderRadius:8,padding:14 }}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8 }}>
                  <div>
                    <span style={{ color:t.textPrimary,fontWeight:700,fontSize:15 }}>#{suite.number}</span>
                    <p style={{ color:t.textSecondary,fontSize:11,margin:"2px 0 0" }}>{suite.name}</p>
                  </div>
                  <span style={{ color:cfg.color,fontSize:10,fontWeight:600,textTransform:"uppercase" }}>{cfg.label}</span>
                </div>
                <Chip>{suite.category}</Chip>
                <div style={{ marginTop:10 }}>
                  {suite.status==="disponivel" && (
                    <Btn small onClick={()=>setCI(suite)} style={{ width:"100%" }} variant="success">+ Check-in</Btn>
                  )}
                  {suite.status==="ocupada" && (
                    <>
                      <p style={{ color:t.textSecondary,fontSize:11,margin:"0 0 4px" }}>👤 {suite.currentGuest}</p>
                      <OccTimer since={suite.occupiedSince}/>
                      <Btn small onClick={()=>setCO(suite)} style={{ width:"100%",marginTop:6 }} variant="danger">Checkout</Btn>
                    </>
                  )}
                  {suite.status==="suja"       && <p style={{ color:t.yellow,fontSize:11,margin:0 }}>⚠️ Aguardando limpeza</p>}
                  {suite.status==="em_limpeza" && <p style={{ color:t.cleaning,fontSize:11,margin:0 }}>🧹 {suite.camareira}</p>}
                  {suite.status==="manutencao" && <p style={{ color:t.maint,fontSize:11,margin:0 }}>🔧 Em manutenção</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {checkinT && (
        <div style={{ position:"fixed",inset:0,background:"#000000bb",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200 }}>
          <Card style={{ width:380 }}>
            <div style={{ padding:"14px 18px",borderBottom:`1px solid ${t.border}` }}>
              <p style={{ color:t.textPrimary,fontWeight:700,margin:0 }}>Check-in — {checkinT.name}</p>
            </div>
            <div style={{ padding:18,display:"flex",flexDirection:"column",gap:12 }}>
              <div><label style={{ color:t.textSecondary,fontSize:12,display:"block",marginBottom:5 }}>Hóspede</label>
                <Input value={guest} onChange={e=>setGuest(e.target.value)} placeholder="Nome completo"/></div>
              <div><label style={{ color:t.textSecondary,fontSize:12,display:"block",marginBottom:5 }}>Tipo</label>
                <Select value={type} onChange={e=>setType(e.target.value)}>
                  <option value="rotativo">Rotativo — R$ {checkinT.priceRotativo}</option>
                  <option value="pernoite">Pernoite — R$ {checkinT.pricePernoite}</option>
                </Select></div>
              <div style={{ display:"flex",gap:8 }}>
                <Btn variant="ghost" onClick={()=>setCI(null)} style={{ flex:1 }}>Cancelar</Btn>
                <Btn onClick={doCheckin} disabled={!guest} style={{ flex:2 }}>Confirmar</Btn>
              </div>
            </div>
          </Card>
        </div>
      )}

      {checkoutT && (
        <div style={{ position:"fixed",inset:0,background:"#000000bb",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200 }}>
          <Card style={{ width:380 }}>
            <div style={{ padding:"14px 18px",borderBottom:`1px solid ${t.border}` }}>
              <p style={{ color:t.textPrimary,fontWeight:700,margin:0 }}>Checkout — {checkoutT.name}</p>
            </div>
            <div style={{ padding:18,display:"flex",flexDirection:"column",gap:12 }}>
              <div style={{ background:t.bgItem,borderRadius:6,padding:12 }}>
                <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}>
                  <span style={{ color:t.textSecondary,fontSize:12 }}>Hóspede</span>
                  <span style={{ color:t.textPrimary,fontWeight:600,fontSize:12 }}>{checkoutT.currentGuest}</span>
                </div>
                <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}>
                  <span style={{ color:t.textSecondary,fontSize:12 }}>Permanência</span>
                  <OccTimer since={checkoutT.occupiedSince}/>
                </div>
                <div style={{ display:"flex",justifyContent:"space-between" }}>
                  <span style={{ color:t.textSecondary,fontSize:12 }}>Valor</span>
                  <span style={{ color:t.green,fontWeight:700,fontSize:13 }}>R$ {checkoutT.priceRotativo}</span>
                </div>
              </div>
              <div><label style={{ color:t.textSecondary,fontSize:12,display:"block",marginBottom:5 }}>Forma de Pagamento</label>
                <Select value={method} onChange={e=>setMethod(e.target.value)}>
                  <option value="pix">PIX</option><option value="cartao">Cartão</option><option value="dinheiro">Dinheiro</option>
                </Select></div>
              <div style={{ display:"flex",gap:8 }}>
                <Btn variant="ghost" onClick={()=>setCO(null)} style={{ flex:1 }}>Cancelar</Btn>
                <Btn variant="success" onClick={doCheckout} style={{ flex:2 }}>Finalizar</Btn>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
