import { t } from "../../styles/tokens";
import { PRODUCTS_DATA } from "../../data/mock";
import { Chip } from "../ui/Chip";
import { Card } from "../ui/Card";
import { Header } from "../layout/Header";

export function PageEstoque() {
  const low = PRODUCTS_DATA.filter(p=>p.currentStock<=p.minStock&&p.active);
  return (
    <div className="fade-in" style={{ display:"flex",flexDirection:"column",height:"100%" }}>
      <Header title="🛒 Estoque & Frigobar" sub="Almoxarifado central"/>
      <div style={{ flex:1,overflowY:"auto",padding:20 }}>
        {low.length>0&&(
          <div style={{ background:t.waitingBg,border:`1px solid ${t.red}44`,borderRadius:6,padding:"10px 14px",marginBottom:16,display:"flex",gap:8,alignItems:"center" }}>
            <span>⚠️</span>
            <span style={{ color:t.red,fontSize:13 }}>{low.length} iten(s) com estoque abaixo do mínimo: {low.map(p=>p.name).join(", ")}</span>
          </div>
        )}
        <Card style={{ overflow:"hidden" }}>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%",borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ background:t.bgItem }}>
                  {["Produto","Categoria","Custo","Venda","Margem","Estoque","Mín","Status"].map(h=>(
                    <th key={h} style={{ padding:"10px 14px",textAlign:"left",color:t.textSecondary,fontSize:11,fontWeight:600,letterSpacing:.8,textTransform:"uppercase",whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PRODUCTS_DATA.map((p,i)=>{
                  const low2=p.currentStock<=p.minStock;
                  const m=p.sellPrice>0?Math.round(((p.sellPrice-p.costPrice)/p.sellPrice)*100):0;
                  return (
                    <tr key={p.id} className="row-hover" style={{ borderTop:`1px solid ${t.border}22`,opacity:p.active?1:.45 }}>
                      <td style={{ padding:"10px 14px",color:t.textPrimary,fontWeight:500,fontSize:13 }}>{p.name}</td>
                      <td style={{ padding:"10px 14px" }}><Chip>{p.category}</Chip></td>
                      <td style={{ padding:"10px 14px",color:t.textSecondary,fontSize:12 }}>R$ {p.costPrice.toFixed(2)}</td>
                      <td style={{ padding:"10px 14px",color:t.textPrimary,fontWeight:600,fontSize:13 }}>R$ {p.sellPrice.toFixed(2)}</td>
                      <td style={{ padding:"10px 14px",fontSize:12,fontWeight:600,
                        color:m>=50?t.green:m>=30?t.yellow:t.red }}>{m}%</td>
                      <td style={{ padding:"10px 14px",fontWeight:700,fontSize:13,
                        color:low2?t.red:t.textPrimary }}>{p.currentStock} {p.unit}</td>
                      <td style={{ padding:"10px 14px",color:t.textSecondary,fontSize:12 }}>{p.minStock}</td>
                      <td style={{ padding:"10px 14px" }}>
                        {!p.active?<Chip color={t.textMuted}>Inativo</Chip>:low2?<Chip color={t.red}>⚠️ Baixo</Chip>:<Chip color={t.green}>OK</Chip>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
