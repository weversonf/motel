import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { Btn } from "../ui/Btn";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import { Header } from "../layout/Header";

export function PageEncurtador() {
  const { t } = useTheme();
  const [links, setLinks] = useState([
    { id:"l1", original:"https://moteis.com.br/reserva/suite-imperial", short:"mts.lk/imp", clicks:142, date:"12/06/2025" },
    { id:"l2", original:"https://moteis.com.br/reserva/suite-rubi",    short:"mts.lk/rub", clicks:87,  date:"10/06/2025" },
  ]);
  const [url, setUrl] = useState("");
  const add = () => {
    if (!url) return;
    setLinks(prev=>[...prev,{ id:`l${Date.now()}`,original:url,short:`mts.lk/${Math.random().toString(36).slice(2,6)}`,clicks:0,date:new Date().toLocaleDateString("pt-BR") }]);
    setUrl("");
  };
  return (
    <div className="fade-in" style={{ display:"flex",flexDirection:"column",height:"100%" }}>
      <Header title="🔗 Encurtador de Links" sub="Rastreie cliques em links de reserva"
        right={<Btn small onClick={add}>➕ Novo Link</Btn>}/>
      <div style={{ flex:1,overflowY:"auto",padding:20 }}>
        <div style={{ display:"flex",gap:8,marginBottom:16 }}>
          <Input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://... cole a URL longa aqui" style={{ flex:1 }}/>
          <Btn onClick={add}>Encurtar</Btn>
        </div>
        <Card style={{ overflow:"hidden" }}>
          <table style={{ width:"100%",borderCollapse:"collapse" }}>
            <thead><tr style={{ background:t.bgItem }}>
              {["Link Curto","URL Original","Cliques","Criado em",""].map(h=>(
                <th key={h} style={{ padding:"10px 14px",textAlign:"left",color:t.textSecondary,fontSize:11,fontWeight:600,letterSpacing:.8,textTransform:"uppercase" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {links.map((l,i)=>(
                <tr key={l.id} className="row-hover" style={{ borderTop:`1px solid ${t.border}22` }}>
                  <td style={{ padding:"11px 14px",color:t.accent,fontWeight:600,fontSize:13 }}>{l.short}</td>
                  <td style={{ padding:"11px 14px",color:t.textSecondary,fontSize:12,maxWidth:260,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{l.original}</td>
                  <td style={{ padding:"11px 14px",color:t.textPrimary,fontWeight:700,fontSize:14 }}>{l.clicks}</td>
                  <td style={{ padding:"11px 14px",color:t.textSecondary,fontSize:12 }}>{l.date}</td>
                  <td style={{ padding:"11px 14px" }}>
                    <Btn small variant="ghost" onClick={()=>alert(`Link copiado: ${l.short}`)}>📋 Copiar</Btn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
