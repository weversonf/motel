import { useState } from "react";
import { t } from "../../styles/tokens";
import { RES_STATUS, StatusChip } from "../ui/StatusChip";
import { Chip } from "../ui/Chip";
import { Btn } from "../ui/Btn";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Card } from "../ui/Card";
import { Header } from "../layout/Header";

export function PageTabela({ reservations }) {
  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState("todos");
  const [fMotel, setFMotel]   = useState("todos");
  const motels = [...new Set(reservations.map(r=>r.motel))];

  const data = reservations.filter(r=>
    (filter==="todos"||r.status===filter) &&
    (fMotel==="todos"||r.motel===fMotel) &&
    (r.guestName.toLowerCase().includes(search.toLowerCase())||r.suiteName.toLowerCase().includes(search.toLowerCase()))
  );

  const fmtValor = v => `R$ ${v.toFixed(2)}`;

  return (
    <div className="fade-in" style={{ display:"flex",flexDirection:"column",height:"100%" }}>
      <Header title="📋 Reservas" sub="Lista completa de agendamentos"/>
      <div style={{ flex:1,overflowY:"auto",padding:20 }}>
        <div style={{ display:"flex",gap:8,marginBottom:14,flexWrap:"wrap",alignItems:"center" }}>
          <Input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar hóspede ou suíte..." style={{ width:220 }}/>
          <Select value={fMotel} onChange={e=>setFMotel(e.target.value)} style={{ width:"auto",fontSize:12,padding:"6px 10px" }}>
            <option value="todos">Todos os Motéis</option>
            {motels.map(m=><option key={m}>{m}</option>)}
          </Select>
          <div style={{ display:"flex",gap:4,flexWrap:"wrap" }}>
            {["todos",...Object.keys(RES_STATUS)].map(s=>{
              const cfg=RES_STATUS[s];
              const active=filter===s;
              return (
                <button key={s} onClick={()=>setFilter(s)}
                  style={{ padding:"5px 11px",borderRadius:4,border:`1px solid ${active?(cfg?.color||t.accent):t.border}`,
                    background:active?`${cfg?.color||t.accent}22`:"transparent",
                    color:active?(cfg?.color||t.accent):t.textSecondary,fontSize:11,fontWeight:active?600:400,cursor:"pointer" }}>
                  {s==="todos"?"Todos":cfg?.label}
                </button>
              );
            })}
          </div>
        </div>
        <Card style={{ overflow:"hidden" }}>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%",borderCollapse:"collapse",minWidth:900 }}>
              <thead>
                <tr style={{ background:t.bgItem }}>
                  {["Status","Pagto","Data Reserva","Motel","Suíte","Cliente","CPF","Check-in","Check-out","Valor","Protocolo","Ações"].map(h=>(
                    <th key={h} style={{ padding:"10px 12px",textAlign:"left",color:t.textSecondary,
                      fontSize:11,fontWeight:600,letterSpacing:.8,textTransform:"uppercase",whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map(r=>(
                  <tr key={r.id} className="row-hover" style={{ borderTop:`1px solid ${t.border}22` }}>
                    <td style={{ padding:"9px 12px" }}><StatusChip status={r.status}/></td>
                    <td style={{ padding:"9px 12px" }}><Chip>{r.paymentMethod}</Chip></td>
                    <td style={{ padding:"9px 12px",color:t.textSecondary,fontSize:12,fontFamily:"monospace",whiteSpace:"nowrap" }}>
                      {new Date(r.reservationDate).toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",year:"2-digit"})}</td>
                    <td style={{ padding:"9px 12px",color:t.textSecondary,fontSize:12 }}>{r.motel}</td>
                    <td style={{ padding:"9px 12px",color:t.textPrimary,fontWeight:600,fontSize:12 }}>{r.suiteName}</td>
                    <td style={{ padding:"9px 12px",color:t.textPrimary,fontSize:12 }}>{r.guestName}</td>
                    <td style={{ padding:"9px 12px",color:t.textSecondary,fontSize:12,fontFamily:"monospace" }}>{r.cpf}</td>
                    <td style={{ padding:"9px 12px",color:t.textSecondary,fontSize:12,fontFamily:"monospace",whiteSpace:"nowrap" }}>
                      {new Date(r.checkIn).toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"})}</td>
                    <td style={{ padding:"9px 12px",color:r.checkOut?t.textSecondary:t.textMuted,fontSize:12,fontFamily:"monospace",whiteSpace:"nowrap" }}>
                      {r.checkOut?new Date(r.checkOut).toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}):"-"}</td>
                    <td style={{ padding:"9px 12px",color:t.accent,fontWeight:700,fontSize:12,whiteSpace:"nowrap" }}>{fmtValor(r.totalValue)}</td>
                    <td style={{ padding:"9px 12px",color:t.textMuted,fontSize:11,fontFamily:"monospace" }}>{r.protocolo}</td>
                    <td style={{ padding:"9px 12px" }}>
                      <div style={{ display:"flex",gap:4 }}>
                        <button title="Editar" style={{ background:"none",border:`1px solid ${t.border}`,borderRadius:4,width:28,height:28,
                          cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:t.textSecondary,fontSize:12,
                          transition:".15s" }}
                          onMouseEnter={e=>{e.currentTarget.style.background=t.accent;e.currentTarget.style.color=t.white;e.currentTarget.style.borderColor=t.accent}}
                          onMouseLeave={e=>{e.currentTarget.style.background="none";e.currentTarget.style.color=t.textSecondary;e.currentTarget.style.borderColor=t.border}}>✎</button>
                        <button title="Cancelar" style={{ background:"none",border:`1px solid ${t.border}`,borderRadius:4,width:28,height:28,
                          cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:t.textSecondary,fontSize:12,
                          transition:".15s" }}
                          onMouseEnter={e=>{e.currentTarget.style.background=t.red;e.currentTarget.style.color=t.white;e.currentTarget.style.borderColor=t.red}}
                          onMouseLeave={e=>{e.currentTarget.style.background="none";e.currentTarget.style.color=t.textSecondary;e.currentTarget.style.borderColor=t.border}}>✕</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {data.length===0&&(
                  <tr><td colSpan={12} style={{ padding:32,textAlign:"center",color:t.textMuted,fontSize:13 }}>
                    Nenhuma reserva encontrada.
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
