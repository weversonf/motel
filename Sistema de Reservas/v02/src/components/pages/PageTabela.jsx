import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { RES_STATUS, StatusChip } from "../ui/StatusChip";
import { Chip } from "../ui/Chip";
import { Btn } from "../ui/Btn";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Card } from "../ui/Card";
import { Header } from "../layout/Header";

export function PageTabela({ reservations, setReservations, suites, setSuites, moteis }) {
  const { t } = useTheme();
  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState("todos");
  const [fMotel, setFMotel]   = useState("todos");
  const [cpfFilter, setCpf]   = useState("");
  const [dateFilter, setDate] = useState("");
  const [msg, setMsg]         = useState("");

  const motelList = moteis ? moteis.map(m=>m.name) : [...new Set(reservations.map(r=>r.motel))];

  const data = reservations.filter(r=>{
    if (filter !== "todos" && r.status !== filter) return false;
    if (fMotel !== "todos" && r.motel !== fMotel) return false;
    if (search && !r.guestName.toLowerCase().includes(search.toLowerCase()) && !r.suiteName.toLowerCase().includes(search.toLowerCase())) return false;
    if (cpfFilter && !r.cpf.includes(cpfFilter)) return false;
    if (dateFilter) {
      const d = new Date(dateFilter + "T00:00:00");
      const ci = new Date(r.checkIn);
      const co = r.checkOut ? new Date(r.checkOut) : null;
      if (!(ci <= d && (!co || co >= d))) return false;
    }
    return true;
  });

  const showMsg = (m) => { setMsg(m); setTimeout(()=>setMsg(""),3000); };

  const handleCheckin = (r) => {
    if (!r.asaasPaid) {
      showMsg(`⚠️ Reserva ${r.protocolo}: pagamento pendente no Asaas. Confirme o pagamento antes do check-in.`);
      return;
    }
    setReservations(prev => prev.map(x => x.id === r.id ? {...x, status:"check-in"} : x));
    const suite = suites?.find(s => s.id === r.suiteId);
    if (suite && setSuites) {
      setSuites(prev => prev.map(s => s.id === r.suiteId ? {...s, status:"ocupada", currentGuest:r.guestName, occupiedSince:new Date()} : s));
    }
    showMsg(`✅ Check-in realizado: ${r.guestName} → ${r.suiteName}`);
  };

  const handleConfirm = (r) => {
    setReservations(prev => prev.map(x => x.id === r.id ? {...x, status:"confirmado", asaasPaid:true} : x));
    showMsg(`✅ Reserva ${r.protocolo} confirmada`);
  };

  const handleCancel = (r) => {
    setReservations(prev => prev.map(x => x.id === r.id ? {...x, status:"cancelado"} : x));
    showMsg(`❌ Reserva ${r.protocolo} cancelada`);
  };

  const handleDelete = (r) => {
    setReservations(prev => prev.filter(x => x.id !== r.id));
    showMsg(`🗑️ Reserva ${r.protocolo} removida`);
  };

  const handleAsaasPay = (r) => {
    setReservations(prev => prev.map(x => x.id === r.id ? {...x, asaasPaid:true} : x));
    showMsg(`💳 Pagamento Asaas confirmado: ${r.protocolo}`);
  };

  const fmtValor = v => `R$ ${v.toFixed(2)}`;

  const canCheckin = (r) => r.status === "confirmado" || r.status === "pagar-motel";
  const canConfirm = (r) => r.status === "pendente" || r.status === "aguardando";
  const canCancel = (r) => r.status !== "cancelado" && r.status !== "check-in";

  return (
    <div className="fade-in" style={{ display:"flex",flexDirection:"column",height:"100%" }}>
      <Header title="📋 Reservas" sub="Lista completa de agendamentos"/>
      <div style={{ flex:1,overflowY:"auto",padding:20 }}>
        {msg && (
          <div style={{ background:msg.startsWith("✅")||msg.startsWith("💳")?`${t.green}18`:msg.startsWith("❌")||msg.startsWith("🗑️")?`${t.red}22`:msg.startsWith("⚠️")?`${t.yellow}18`:`${t.blue}18`,
            border:`1px solid ${msg.startsWith("✅")||msg.startsWith("💳")?t.green:msg.startsWith("❌")||msg.startsWith("🗑️")?t.red:msg.startsWith("⚠️")?t.yellow:t.blue}44`,
            borderRadius:5,padding:"10px 14px",marginBottom:14,fontSize:13,
            color:msg.startsWith("✅")||msg.startsWith("💳")?t.green:msg.startsWith("❌")||msg.startsWith("🗑️")?t.red:msg.startsWith("⚠️")?t.yellow:t.blue }}>
            {msg}
          </div>
        )}

        <div style={{ display:"flex",gap:8,marginBottom:14,flexWrap:"wrap",alignItems:"center" }}>
          <Input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar hóspede ou suíte..." style={{ width:200 }}/>
          <Input value={cpfFilter} onChange={e=>setCpf(e.target.value)} placeholder="CPF" style={{ width:120,fontSize:12 }}/>
          <Input type="date" value={dateFilter} onChange={e=>setDate(e.target.value)} style={{ width:140,fontSize:12 }}
            title="Filtrar por data (check-in ≤ data ≤ check-out)"/>
          <Select value={fMotel} onChange={e=>setFMotel(e.target.value)} style={{ width:"auto",fontSize:12,padding:"6px 10px" }}>
            <option value="todos">Todos os Motéis</option>
            {motelList.map(m=><option key={m}>{m}</option>)}
          </Select>
          <div style={{ display:"flex",gap:4,flexWrap:"wrap" }}>
            {["todos",...Object.keys(RES_STATUS)].map(s=>{
              const cfg=RES_STATUS[s];
              const active=filter===s;
              const c = cfg ? t[cfg.color] : t.accent;
              const b = cfg ? t[cfg.bg] : "transparent";
              return (
                <button key={s} onClick={()=>setFilter(s)}
                  style={{ padding:"5px 11px",borderRadius:4,border:`1px solid ${active? c : t.border}`,
                    background:active? b :"transparent",
                    color:active? c : t.textSecondary,fontSize:11,fontWeight:active?600:400,cursor:"pointer" }}>
                  {s==="todos"?"Todos":cfg.label}
                </button>
              );
            })}
          </div>
        </div>

        <Card style={{ overflow:"hidden" }}>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%",borderCollapse:"collapse",minWidth:1100 }}>
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
                    <td style={{ padding:"9px 12px" }}>
                      <Chip color={r.asaasPaid?t.green:t.yellow} bg={r.asaasPaid?t.confirmedBg:t.pendingBg}>
                        {r.asaasPaid?"Pago":"Pendente"}
                      </Chip>
                    </td>
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
                    <td style={{ padding:"9px 8px" }}>
                      <div style={{ display:"flex",gap:3 }}>
                        {canCheckin(r) && (
                          <button title="Check-in" onClick={()=>handleCheckin(r)}
                            style={{ background:`${t.checkin}18`,color:t.checkin,border:"none",borderRadius:4,width:28,height:28,cursor:"pointer",fontSize:13,transition:".15s" }}
                            onMouseEnter={e=>{e.currentTarget.style.background=t.checkin;e.currentTarget.style.color="#fff"}}
                            onMouseLeave={e=>{e.currentTarget.style.background=`${t.checkin}18`;e.currentTarget.style.color=t.checkin}}>
                            ▶</button>
                        )}
                        {canConfirm(r) && (
                          <button title="Confirmar" onClick={()=>handleConfirm(r)}
                            style={{ background:`${t.confirmed}18`,color:t.confirmed,border:"none",borderRadius:4,width:28,height:28,cursor:"pointer",fontSize:13 }}
                            onMouseEnter={e=>{e.currentTarget.style.background=t.confirmed;e.currentTarget.style.color="#fff"}}
                            onMouseLeave={e=>{e.currentTarget.style.background=`${t.confirmed}18`;e.currentTarget.style.color=t.confirmed}}>
                            ✓</button>
                        )}
                        {!r.asaasPaid && r.status !== "cancelado" && (
                          <button title="Confirmar pagamento Asaas" onClick={()=>handleAsaasPay(r)}
                            style={{ background:`${t.blue}18`,color:t.blue,border:"none",borderRadius:4,width:28,height:28,cursor:"pointer",fontSize:13 }}
                            onMouseEnter={e=>{e.currentTarget.style.background=t.blue;e.currentTarget.style.color="#fff"}}
                            onMouseLeave={e=>{e.currentTarget.style.background=`${t.blue}18`;e.currentTarget.style.color=t.blue}}>
                            💳</button>
                        )}
                        {canCancel(r) && (
                          <button title="Cancelar" onClick={()=>handleCancel(r)}
                            style={{ background:`${t.red}18`,color:t.red,border:"none",borderRadius:4,width:28,height:28,cursor:"pointer",fontSize:13 }}
                            onMouseEnter={e=>{e.currentTarget.style.background=t.red;e.currentTarget.style.color="#fff"}}
                            onMouseLeave={e=>{e.currentTarget.style.background=`${t.red}18`;e.currentTarget.style.color=t.red}}>
                            ✕</button>
                        )}
                        <button title="Remover" onClick={()=>handleDelete(r)}
                          style={{ background:"transparent",color:t.textMuted,border:"none",borderRadius:4,width:28,height:28,cursor:"pointer",fontSize:12 }}
                          onMouseEnter={e=>{e.currentTarget.style.background=`${t.red}12`;e.currentTarget.style.color=t.red}}
                          onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color=t.textMuted}}>
                          🗑</button>
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
