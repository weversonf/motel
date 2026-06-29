import { useState } from "react";
import { t } from "../../styles/tokens";
import { Btn } from "../ui/Btn";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Card } from "../ui/Card";
import { Header } from "../layout/Header";

export function PageCadastro() {
  const [form, setForm] = useState({ name:"", category:"standard", priceRotativo:"", pricePernoite:"", floor:"1", capacity:"2", amenities:[] });
  const [saved, setSaved] = useState(false);
  const ams = ["Smart TV","Hidro","Sauna","Piscina Privativa","Alexa","Frigobar","Lareira","Bar Privativo","Ar-Condicionado","Home Theater"];
  const toggle = a => setForm(f=>({...f,amenities:f.amenities.includes(a)?f.amenities.filter(x=>x!==a):[...f.amenities,a]}));
  const save = () => { setSaved(true); setTimeout(()=>setSaved(false),3000); };

  return (
    <div className="fade-in" style={{ display:"flex",flexDirection:"column",height:"100%" }}>
      <Header title="⚙️ Configurações" sub="Cadastro de suítes"/>
      <div style={{ flex:1,overflowY:"auto",padding:20 }}>
        {saved&&<div style={{ background:`${t.green}18`,border:`1px solid ${t.green}44`,borderRadius:5,padding:"10px 14px",marginBottom:16,color:t.green,fontSize:13 }}>✓ Suíte cadastrada com sucesso!</div>}
        <Card style={{ padding:24,maxWidth:540 }}>
          <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
            {[["Nome","text","name","Ex: Suíte Imperial"],["Preço Rotativo (R$)","number","priceRotativo","120"],["Preço Pernoite (R$)","number","pricePernoite","200"],["Andar","number","floor","1"],["Capacidade","number","capacity","2"]].map(([lbl,type,key,ph])=>(
              <div key={key}>
                <label style={{ color:t.textSecondary,fontSize:12,display:"block",marginBottom:5 }}>{lbl}</label>
                <Input type={type} value={form[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))} placeholder={ph}/>
              </div>
            ))}
            <div>
              <label style={{ color:t.textSecondary,fontSize:12,display:"block",marginBottom:5 }}>Categoria</label>
              <Select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>
                {["standard","luxo","master","presidential"].map(c=><option key={c} value={c}>{c}</option>)}
              </Select>
            </div>
            <div>
              <label style={{ color:t.textSecondary,fontSize:12,display:"block",marginBottom:8 }}>Infraestrutura</label>
              <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>
                {ams.map(a=>{
                  const on=form.amenities.includes(a);
                  return (
                    <button key={a} onClick={()=>toggle(a)}
                      style={{ padding:"5px 12px",borderRadius:4,border:`1px solid ${on?t.accent:t.border}`,
                        background:on?`${t.accent}22`:"transparent",color:on?t.accent:t.textSecondary,
                        fontSize:12,cursor:"pointer" }}>{a}</button>
                  );
                })}
              </div>
            </div>
            <Btn onClick={save} style={{ marginTop:6 }}>💾 Salvar Suíte</Btn>
          </div>
        </Card>
      </div>
    </div>
  );
}
