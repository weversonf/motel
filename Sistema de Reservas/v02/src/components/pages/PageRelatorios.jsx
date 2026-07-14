import { useTheme } from "../../context/ThemeContext";
import { FINANCIAL_DATA, REVENUE_DATA } from "../../data/mock";
import { Card } from "../ui/Card";
import { KPI } from "../ui/KPI";
import { BarChart } from "../ui/BarChart";
import { Header } from "../layout/Header";

export function PageRelatorios() {
  const { t } = useTheme();
  const totalIn  = FINANCIAL_DATA.filter(f=>f.type==="entrada").reduce((a,b)=>a+b.value,0);
  const totalOut = FINANCIAL_DATA.filter(f=>f.type==="saida").reduce((a,b)=>a+b.value,0);
  return (
    <div className="fade-in" style={{ display:"flex",flexDirection:"column",height:"100%" }}>
      <Header title="📊 Relatórios" sub="Desempenho financeiro e operacional"/>
      <div style={{ flex:1,overflowY:"auto",padding:20 }}>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:12,marginBottom:20 }}>
          <KPI icon="⬆️" label="Entradas hoje" value={`R$ ${totalIn}`} color={t.green}/>
          <KPI icon="⬇️" label="Saídas hoje"   value={`R$ ${totalOut}`} color={t.red}/>
          <KPI icon="💰" label="Saldo"          value={`R$ ${totalIn-totalOut}`} color={t.accent}/>
          <KPI icon="🏨" label="Taxa ocupação"  value="58%" color={t.textPrimary}/>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:16 }}>
          <Card style={{ padding:20 }}>
            <p style={{ color:t.textSecondary,fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:1,margin:"0 0 14px" }}>Receita — Últimos 7 dias</p>
            <BarChart data={REVENUE_DATA}/>
            <p style={{ color:t.textMuted,fontSize:10,textAlign:"center",marginTop:6 }}>
              Total: R$ {REVENUE_DATA.reduce((a,b)=>a+b.v,0).toLocaleString("pt-BR")}
            </p>
          </Card>
          <Card style={{ padding:20 }}>
            <p style={{ color:t.textSecondary,fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:1,margin:"0 0 14px" }}>Lançamentos do dia</p>
            {FINANCIAL_DATA.map(f=>(
              <div key={f.id} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",
                padding:"9px 0",borderBottom:`1px solid ${t.border}22` }}>
                <div>
                  <p style={{ color:t.textPrimary,fontSize:12,margin:0 }}>{f.description}</p>
                  <p style={{ color:t.textSecondary,fontSize:11,margin:0 }}>{f.operator} · {f.paymentMethod}</p>
                </div>
                <span style={{ color:f.type==="entrada"?t.green:t.red,fontWeight:700,fontSize:13,whiteSpace:"nowrap",marginLeft:12 }}>
                  {f.type==="entrada"?"+":"-"} R$ {f.value}
                </span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
