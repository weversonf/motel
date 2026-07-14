import { useState } from "react";
import { t } from "../../styles/tokens";
import { SUITES_DATA } from "../../data/mock";
import { RES_STATUS, StatusChip } from "../ui/StatusChip";
import { Btn } from "../ui/Btn";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Card } from "../ui/Card";
import { KPI } from "../ui/KPI";
import { Header } from "../layout/Header";

const MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const WDAYS  = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

export function PageCalendario({ reservations, setReservations }) {
  const now = new Date();
  const [cur, setCur]           = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [selected, setSelected] = useState(null);
  const [showNew, setShowNew]   = useState(false);
  const [filterStatus, setFS]   = useState("todos");
  const [filterMotel, setFM]    = useState("todos");
  const [viewMode, setVM]       = useState("month");
  const [newR, setNewR]         = useState({ guestName:"", suiteId:"s1", type:"pernoite", checkIn:"", checkOut:"", paymentMethod:"pix", motel:"Motel Fortaleza Norte" });

  const year  = cur.getFullYear();
  const month = cur.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const cells = Array.from({length:firstDay+daysInMonth}, (_,i) => i<firstDay ? null : i-firstDay+1);

  const resOnDay = (day) => {
    const target = new Date(year, month, day);
    return reservations.filter(r => {
      const ci = new Date(r.checkIn); ci.setHours(0,0,0,0);
      const co = r.checkOut ? new Date(r.checkOut) : null; if(co) co.setHours(0,0,0,0);
      return ci <= target && (!co || co >= target);
    }).filter(r => (filterStatus === "todos" || r.status === filterStatus) && (filterMotel === "todos" || r.motel === filterMotel));
  };

  const handleSave = () => {
    if (!newR.guestName || !newR.checkIn) return;
    const suite = SUITES_DATA.find(s=>s.id===newR.suiteId);
    setReservations(prev=>[...prev, {
      id:`r${Date.now()}`, suiteId:newR.suiteId,
      suiteName:`${suite?.name} (${suite?.number})`,
      motel:newR.motel, guestName:newR.guestName,
      checkIn:new Date(newR.checkIn), checkOut:newR.checkOut?new Date(newR.checkOut):null,
      type:newR.type, status:"pendente", totalValue:newR.type==="pernoite"?(suite?.pricePernoite||200):(suite?.priceRotativo||120),
      paymentMethod:newR.paymentMethod, paymentStatus:"pendente",
    }]);
    setShowNew(false);
    setNewR({ guestName:"", suiteId:"s1", type:"pernoite", checkIn:"", checkOut:"", paymentMethod:"pix", motel:"Motel Fortaleza Norte" });
  };

  const motels = [...new Set(reservations.map(r=>r.motel))];
  const today = now.getDate();

  const kpis = [
    { icon:"📊", label:"Total", value:reservations.length, color:t.textPrimary },
    { icon:"📅", label:"Reservas hoje", value:resOnDay(today).length, color:t.textPrimary },
    { icon:"⏳", label:"PIX Pendente",   value:reservations.filter(r=>r.status==="pix_pendente").length, color:t.yellow },
    { icon:"💳", label:"Cartão Pendente",value:reservations.filter(r=>r.status==="cartao_pendente").length, color:t.blue },
    { icon:"✅", label:"Confirmados",    value:reservations.filter(r=>r.status==="confirmado").length, color:t.green },
  ];

  return (
    <div className="fade-in" style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      <Header
        title="📅 Calendário"
        sub="Gerencie suas reservas com facilidade"
        right={
          <>
            <Btn variant="ghost" small onClick={()=>setVM(v=>v==="month"?"agenda":"month")}>
              {viewMode==="month"?"📋 Agenda":"📅 Mês"}
            </Btn>
            <Btn small onClick={()=>setShowNew(true)}>+ Nova Reserva</Btn>
          </>
        }
      />

      <div style={{ flex:1, overflowY:"auto", padding:20 }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:10, marginBottom:16 }}>
          {kpis.map(k=><KPI key={k.label} {...k}/>)}
        </div>

        <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap", alignItems:"center" }}>
          <Select value={filterMotel} onChange={e=>setFM(e.target.value)} style={{ width:"auto", fontSize:12, padding:"6px 10px" }}>
            <option value="todos">Todos os Motéis</option>
            {motels.map(m=><option key={m} value={m}>{m}</option>)}
          </Select>
          <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
            {["todos",...Object.keys(RES_STATUS)].map(s=>{
              const cfg = RES_STATUS[s];
              const active = filterStatus === s;
              return (
                <button key={s} onClick={()=>setFS(s)}
                  style={{ padding:"5px 12px", borderRadius:4, border:`1px solid ${active?(cfg?.color||t.accent):t.border}`,
                    background:active?`${cfg?.color||t.accent}22`:"transparent",
                    color:active?(cfg?.color||t.accent):t.textSecondary, fontSize:11, fontWeight:active?600:400, cursor:"pointer" }}>
                  {s==="todos"?"Todos":cfg?.label}
                </button>
              );
            })}
          </div>
        </div>

        {viewMode==="month" && (
          <Card>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
              padding:"12px 16px", borderBottom:`1px solid ${t.border}` }}>
              <button onClick={()=>setCur(new Date(year,month-1,1))}
                style={{ background:"transparent", border:"none", color:t.textSecondary, cursor:"pointer", fontSize:18, padding:"2px 8px" }}>←</button>
              <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                <span style={{ color:t.textPrimary, fontWeight:700, fontSize:15 }}>{MONTHS[month]} {year}</span>
                <button onClick={()=>setCur(new Date(now.getFullYear(),now.getMonth(),1))}
                  style={{ background:t.bgItem, border:`1px solid ${t.border}`, borderRadius:4,
                    color:t.textSecondary, fontSize:11, padding:"3px 8px", cursor:"pointer" }}>Hoje</button>
              </div>
              <button onClick={()=>setCur(new Date(year,month+1,1))}
                style={{ background:"transparent", border:"none", color:t.textSecondary, cursor:"pointer", fontSize:18, padding:"2px 8px" }}>→</button>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", borderBottom:`1px solid ${t.border}` }}>
              {WDAYS.map(w=>(
                <div key={w} style={{ padding:"8px 0", textAlign:"center", color:t.textSecondary, fontSize:11, fontWeight:600 }}>{w}</div>
              ))}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)" }}>
              {cells.map((day,i)=>{
                if (!day) return <div key={i} style={{ minHeight:72, borderRight:`1px solid ${t.border}22`, borderBottom:`1px solid ${t.border}22` }}/>;
                const dayRes = resOnDay(day);
                const isToday = now.getDate()===day && now.getMonth()===month && now.getFullYear()===year;
                return (
                  <div key={i} onClick={()=>dayRes.length&&setSelected({day,res:dayRes})}
                    className={dayRes.length?"row-hover":""}
                    style={{ minHeight:72, padding:"6px 5px",
                      borderRight:`1px solid ${t.border}22`, borderBottom:`1px solid ${t.border}22`,
                      cursor:dayRes.length?"pointer":"default" }}>
                    <span style={{ fontSize:12, fontWeight:isToday?700:400,
                      color:isToday?t.accent:t.textSecondary, display:"block", marginBottom:3 }}>
                      {isToday?<span style={{background:t.accent,color:"#fff",borderRadius:"50%",padding:"1px 5px"}}>{day}</span>:day}
                    </span>
                    {dayRes.slice(0,2).map(r=>{
                      const cfg=RES_STATUS[r.status]||RES_STATUS.pendente;
                      return (
                        <div key={r.id} style={{ background:cfg.bg, borderLeft:`2px solid ${cfg.color}`,
                          borderRadius:"0 3px 3px 0", padding:"2px 5px", marginBottom:2 }}>
                          <span style={{ color:t.textPrimary, fontSize:10, display:"block",
                            whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                            {r.guestName}
                          </span>
                        </div>
                      );
                    })}
                    {dayRes.length>2&&<span style={{color:t.textMuted,fontSize:9}}>+{dayRes.length-2}</span>}
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {viewMode==="agenda" && (
          <Card>
            <div style={{ padding:"12px 16px", borderBottom:`1px solid ${t.border}` }}>
              <span style={{ color:t.textSecondary, fontSize:12 }}>Próximas reservas</span>
            </div>
            {reservations.filter(r=>new Date(r.checkIn)>=new Date()).slice(0,20).map((r,i)=>{
              const cfg=RES_STATUS[r.status]||RES_STATUS.pendente;
              return (
                <div key={r.id} className="row-hover" style={{ display:"flex", justifyContent:"space-between",
                  alignItems:"center", padding:"12px 16px", borderBottom:`1px solid ${t.border}22`,
                  gap:10, flexWrap:"wrap" }}>
                  <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                    <div style={{ width:3, height:36, background:cfg.color, borderRadius:2, flexShrink:0 }}/>
                    <div>
                      <p style={{ color:t.textPrimary, fontWeight:600, fontSize:13, margin:0 }}>{r.guestName}</p>
                      <p style={{ color:t.textSecondary, fontSize:11, margin:0 }}>{r.suiteName} · {r.motel}</p>
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                    <span style={{ color:t.textSecondary, fontSize:11, fontFamily:"monospace" }}>
                      {new Date(r.checkIn).toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit"})}
                    </span>
                    <StatusChip status={r.status}/>
                    <span style={{ color:t.textSecondary, fontSize:12 }}>R$ {r.totalValue}</span>
                  </div>
                </div>
              );
            })}
          </Card>
        )}
      </div>

      {selected && (
        <div style={{ position:"fixed",inset:0,background:"#000000bb",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200 }}>
          <Card style={{ width:400, maxHeight:"80vh", overflow:"auto" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 18px",borderBottom:`1px solid ${t.border}` }}>
              <span style={{ color:t.textPrimary,fontWeight:700,fontSize:15 }}>
                {selected.day}/{month+1}/{year}
              </span>
              <button onClick={()=>setSelected(null)} style={{ background:"transparent",border:"none",color:t.textSecondary,cursor:"pointer",fontSize:18 }}>✕</button>
            </div>
            <div style={{ padding:16 }}>
              {selected.res.map(r=>{
                const cfg=RES_STATUS[r.status]||RES_STATUS.pendente;
                return (
                  <div key={r.id} style={{ background:t.bgItem,borderRadius:6,padding:14,marginBottom:10,borderLeft:`3px solid ${cfg.color}` }}>
                    <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}>
                      <span style={{ color:t.textPrimary,fontWeight:700,fontSize:14 }}>{r.guestName}</span>
                      <StatusChip status={r.status}/>
                    </div>
                    <p style={{ color:t.textSecondary,fontSize:12,margin:"0 0 4px" }}>{r.suiteName} · {r.motel}</p>
                    <p style={{ color:t.textSecondary,fontSize:12,margin:0 }}>R$ {r.totalValue} · {r.paymentMethod} · {r.type}</p>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {showNew && (
        <div style={{ position:"fixed",inset:0,background:"#000000bb",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200 }}>
          <Card style={{ width:420 }}>
            <div style={{ padding:"14px 18px",borderBottom:`1px solid ${t.border}`,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <span style={{ color:t.textPrimary,fontWeight:700 }}>+ Nova Reserva</span>
              <button onClick={()=>setShowNew(false)} style={{ background:"transparent",border:"none",color:t.textSecondary,cursor:"pointer",fontSize:18 }}>✕</button>
            </div>
            <div style={{ padding:18, display:"flex",flexDirection:"column",gap:12 }}>
              {[["Hóspede","guestName","text","Nome completo"],["Check-in","checkIn","datetime-local",""],["Check-out","checkOut","datetime-local",""]].map(([lbl,key,type,ph])=>(
                <div key={key}>
                  <label style={{ color:t.textSecondary,fontSize:12,display:"block",marginBottom:5 }}>{lbl}</label>
                  <Input type={type} value={newR[key]} onChange={e=>setNewR(p=>({...p,[key]:e.target.value}))} placeholder={ph}/>
                </div>
              ))}
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
                <div>
                  <label style={{ color:t.textSecondary,fontSize:12,display:"block",marginBottom:5 }}>Suíte</label>
                  <Select value={newR.suiteId} onChange={e=>setNewR(p=>({...p,suiteId:e.target.value}))}>
                    {SUITES_DATA.map(s=><option key={s.id} value={s.id}>{s.name} #{s.number}</option>)}
                  </Select>
                </div>
                <div>
                  <label style={{ color:t.textSecondary,fontSize:12,display:"block",marginBottom:5 }}>Tipo</label>
                  <Select value={newR.type} onChange={e=>setNewR(p=>({...p,type:e.target.value}))}>
                    <option value="rotativo">Rotativo</option>
                    <option value="pernoite">Pernoite</option>
                  </Select>
                </div>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
                <div>
                  <label style={{ color:t.textSecondary,fontSize:12,display:"block",marginBottom:5 }}>Pagamento</label>
                  <Select value={newR.paymentMethod} onChange={e=>setNewR(p=>({...p,paymentMethod:e.target.value}))}>
                    <option value="pix">PIX</option>
                    <option value="cartao">Cartão</option>
                    <option value="dinheiro">Dinheiro</option>
                  </Select>
                </div>
                <div>
                  <label style={{ color:t.textSecondary,fontSize:12,display:"block",marginBottom:5 }}>Motel</label>
                  <Select value={newR.motel} onChange={e=>setNewR(p=>({...p,motel:e.target.value}))}>
                    <option>Motel Fortaleza Norte</option>
                    <option>Motel Fortaleza Sul</option>
                  </Select>
                </div>
              </div>
              <div style={{ display:"flex",gap:8,marginTop:4 }}>
                <Btn variant="ghost" onClick={()=>setShowNew(false)} style={{ flex:1 }}>Cancelar</Btn>
                <Btn onClick={handleSave} style={{ flex:2 }}>Salvar Reserva</Btn>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
