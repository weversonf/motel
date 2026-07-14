import { t } from "../../styles/tokens";
import { Card } from "../ui/Card";
import { useEffect, useState } from "react";

export function PageDashboard() {
  const [greeting, setGreeting] = useState("Bom dia");

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting("Bom dia");
    else if (h < 18) setGreeting("Boa tarde");
    else setGreeting("Boa noite");
  }, []);

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", background:t.bg }}>
      <div style={{ padding:"20px 28px", borderBottom:`1px solid ${t.border}`, background:t.bgCard }}>
        <h4 style={{ margin:0, fontSize:18, fontWeight:700, color:t.textPrimary }}>
          {greeting}, Administrador
        </h4>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"20px 28px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:18, marginBottom:20 }}>
          {[
            { label:"Check-ins Hoje", value:"8", change:"+3", up:true, color:"#00d99f" },
            { label:"Reservas Hoje", value:"12", change:"+2", up:true, color:t.accent },
            { label:"Tx Ocupação", value:"73%", change:"-1.2%", up:false, color:"#2563eb" },
          ].map((kpi, i) => (
            <Card key={i} style={{ padding:"16px 18px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <h6 style={{ margin:0, fontSize:12, fontWeight:500, color:t.textSecondary, textTransform:"uppercase" }}>{kpi.label}</h6>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginTop:12 }}>
                <h3 style={{ margin:0, fontSize:26, fontWeight:800, color:t.textPrimary }}>{kpi.value}</h3>
                <span style={{ color:kpi.up ? "#00d99f" : "#ff6b6b", fontSize:12, fontWeight:600 }}>
                  {kpi.up ? "↑ " : "↓ "}{kpi.change}
                </span>
              </div>
            </Card>
          ))}
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"7fr 5fr", gap:18, marginBottom:20 }}>
          <Card style={{ padding:"18px 20px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <h6 style={{ margin:0, fontSize:14, fontWeight:600, color:t.textPrimary }}>Receita dos Últimos 7 Dias</h6>
              <div style={{ display:"flex", gap:6 }}>
                {["Dia","Sem","Mês"].map((p,i) => (
                  <button key={p} style={{ padding:"3px 14px", borderRadius:4, border:`1px solid ${t.border}`,
                    background:i===2 ? t.accent : "transparent", color:i===2 ? "#fff" : t.textSecondary,
                    fontSize:11, fontWeight:500, cursor:"pointer" }}>{p}</button>
                ))}
              </div>
            </div>
            <div style={{ height:200, display:"flex", alignItems:"flex-end", gap:12 }}>
              {[2840,3200,2100,3800,5200,7100,4900].map((v,i) => {
                const days = ["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"];
                const max = 7100;
                return <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                  <span style={{ fontSize:9, color:t.textMuted }}>{v >= 1000 ? `${(v/1000).toFixed(1)}k` : v}</span>
                  <div style={{ width:"100%", height:`${(v/max)*100}%`, minHeight:8,
                    background:`linear-gradient(to top, ${t.accent}, ${t.accent}cc)`, borderRadius:"3px 3px 0 0", opacity:0.85 }} />
                  <span style={{ fontSize:10, color:t.textSecondary, fontWeight:500 }}>{days[i]}</span>
                </div>;
              })}
            </div>
          </Card>

          <Card style={{ padding:"18px 20px" }}>
            <h6 style={{ margin:"0 0 2px", fontSize:14, fontWeight:600, color:t.textPrimary }}>Taxa de Ocupação dos Motéis</h6>
            <p style={{ margin:"0 0 16px", fontSize:11, color:t.textSecondary }}>Percentual por motel</p>
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {[
                { label:"Spa Urbano", value:82, color:"#00d99f" },
                { label:"Assahi Motel", value:71, color:"#2563eb" },
                { label:"Dragon Motel", value:65, color:t.accent },
                { label:"Dreams Motel", value:58, color:"#f59e0b" },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <span style={{ fontSize:12, color:t.textSecondary }}>{s.label}</span>
                    <span style={{ fontSize:12, fontWeight:700, color:s.color }}>{s.value}%</span>
                  </div>
                  <div style={{ height:6, background:t.border, borderRadius:3, overflow:"hidden" }}>
                    <div style={{ width:`${s.value}%`, height:"100%",
                      background:`linear-gradient(90deg, ${s.color}, ${s.color}88)`, borderRadius:3, transition:"width .3s" }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card style={{ padding:"18px 20px" }}>
          <h6 style={{ margin:"0 0 14px", fontSize:14, fontWeight:600, color:t.textPrimary }}>Reservas Recentes</h6>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
              <thead>
                <tr style={{ borderBottom:`1px solid ${t.border}` }}>
                  {["#","Hóspede","Suíte","Status","Valor"].map(h => (
                    <th key={h} style={{ textAlign:"left", padding:"6px 8px", color:t.textSecondary, fontWeight:600, fontSize:11, textTransform:"uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { id:1, guest:"Carlos M.", suite:"Rubi (102)", status:"Confirmado", statusColor:t.confirmed, value:"R$ 300" },
                  { id:2, guest:"Fernanda L.", suite:"Âmbar (203)", status:"Check-in", statusColor:t.accent, value:"R$ 130" },
                  { id:3, guest:"Ricardo P.", suite:"Imperial (302)", status:"PIX Pend.", statusColor:t.yellow, value:"R$ 700" },
                  { id:4, guest:"Marcos T.", suite:"Ônix (201)", status:"Cartão Pend.", statusColor:t.blue, value:"R$ 300" },
                  { id:5, guest:"Roberta K.", suite:"Pérola (204)", status:"Confirmado", statusColor:t.confirmed, value:"R$ 300" },
                  { id:6, guest:"Felipe N.", suite:"Aurora (304)", status:"Check-in", statusColor:t.accent, value:"R$ 130" },
                ].map(r => (
                  <tr key={r.id} style={{ borderBottom:`1px solid ${t.border}` }}>
                    <td style={{ padding:"8px", color:t.textMuted }}>{r.id}</td>
                    <td style={{ padding:"8px", fontWeight:600, color:t.textPrimary }}>{r.guest}</td>
                    <td style={{ padding:"8px", color:t.textSecondary }}>{r.suite}</td>
                    <td style={{ padding:"8px" }}>
                      <span style={{ background:`${r.statusColor}22`, color:r.statusColor, padding:"2px 8px", borderRadius:3, fontSize:10, fontWeight:600 }}>{r.status}</span>
                    </td>
                    <td style={{ padding:"8px", fontWeight:700, color:t.textPrimary }}>{r.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
