import { useState } from "react";
import { t } from "../../styles/tokens";
import { Btn } from "../ui/Btn";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Card } from "../ui/Card";
import { Header } from "../layout/Header";
import { MOTEIS_DATA, SUITES_DATA } from "../../data/mock";

export function PageCadastro() {
  const [tab, setTab] = useState("moteis");
  const [moteis, setMoteis] = useState(MOTEIS_DATA);
  const [suites, setSuites] = useState(SUITES_DATA);
  const [editMotel, setEditMotel] = useState(null);
  const [motelForm, setMotelForm] = useState({ name:"", slug:"" });
  const [suiteForm, setSuiteForm] = useState({
    motelId:"", number:"", name:"", category:"standard",
    priceRotativo:"", pricePernoite:"", floor:"1", capacity:"2", amenities:[]
  });
  const [saved, setSaved] = useState(false);
  const ams = ["Smart TV","Hidro","Sauna","Piscina Privativa","Alexa","Frigobar","Lareira","Bar Privativo","Ar-Condicionado","Home Theater"];

  const show = msg => { setSaved(msg); setTimeout(()=>setSaved(false),3000); };

  const saveMotel = () => {
    if (!motelForm.name) return;
    if (editMotel) {
      setMoteis(prev=>prev.map(m=>m.id===editMotel?{...m,...motelForm}:m));
      show("Motel atualizado!");
    } else {
      const id = `motel${Date.now()}`;
      setMoteis(prev=>[...prev,{id,...motelForm,suites:[]}]);
      show("Motel cadastrado!");
    }
    setEditMotel(null); setMotelForm({ name:"", slug:"" });
  };

  const editM = m => { setEditMotel(m.id); setMotelForm({ name:m.name, slug:m.slug }); };
  const delM = id => { setMoteis(prev=>prev.filter(m=>m.id!==id)); show("Motel removido"); };

  const saveSuite = () => {
    if (!suiteForm.name||!suiteForm.motelId) return;
    const s = {
      ...suiteForm,
      id:`s${Date.now()}`,
      priceRotativo:+suiteForm.priceRotativo,
      pricePernoite:+suiteForm.pricePernoite,
      capacity:+suiteForm.capacity,
      floor:+suiteForm.floor,
      status:"disponivel"
    };
    setSuites(prev=>[...prev,s]);
    show("Suíte cadastrada!");
    setSuiteForm({ motelId:"", number:"", name:"", category:"standard", priceRotativo:"", pricePernoite:"", floor:"1", capacity:"2", amenities:[] });
  };

  const toggleA = a => setSuiteForm(f=>({...f,amenities:f.amenities.includes(a)?f.amenities.filter(x=>x!==a):[...f.amenities,a]}));

  return (
    <div className="fade-in" style={{ display:"flex",flexDirection:"column",height:"100%" }}>
      <Header title="⚙️ Configurações" sub="Cadastro de motéis e suítes"/>
      <div style={{ flex:1,overflowY:"auto",padding:20 }}>
        {saved&&<div style={{ background:`${t.green}18`,border:`1px solid ${t.green}44`,borderRadius:5,padding:"10px 14px",marginBottom:16,color:t.green,fontSize:13 }}>✓ {saved}</div>}

        <div style={{ display:"flex",gap:6,marginBottom:16 }}>
          {[["moteis","🏨 Motéis"],["suites","🛏️ Suítes"]].map(([v,l])=>(
            <button key={v} onClick={()=>setTab(v)}
              style={{ padding:"6px 16px",borderRadius:4,border:`1px solid ${tab===v?t.accent:t.border}`,
                background:tab===v?`${t.accent}22`:"transparent",color:tab===v?t.accent:t.textSecondary,
                fontSize:12,fontWeight:tab===v?600:400,cursor:"pointer" }}>{l}</button>
          ))}
        </div>

        {tab==="moteis"&&(
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:18,alignItems:"start" }}>
            <Card style={{ padding:20 }}>
              <h4 style={{ fontSize:14,fontWeight:600,color:t.textPrimary,margin:"0 0 14px" }}>
                {editMotel?"✏️ Editar Motel":"+ Novo Motel"}
              </h4>
              <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                <div>
                  <label style={{ color:t.textSecondary,fontSize:12,display:"block",marginBottom:4 }}>Nome do Motel</label>
                  <Input value={motelForm.name} onChange={e=>setMotelForm(f=>({...f,name:e.target.value}))} placeholder="Ex: Dragon Motel"/>
                </div>
                <div>
                  <label style={{ color:t.textSecondary,fontSize:12,display:"block",marginBottom:4 }}>Slug (URL)</label>
                  <Input value={motelForm.slug} onChange={e=>setMotelForm(f=>({...f,slug:e.target.value}))} placeholder="Ex: dragon"/>
                </div>
                <div style={{ display:"flex",gap:6,marginTop:4 }}>
                  {editMotel&&<Btn small variant="ghost" onClick={()=>{setEditMotel(null);setMotelForm({name:"",slug:""});}}>Cancelar</Btn>}
                  <Btn small onClick={saveMotel}>{editMotel?"Salvar":"Cadastrar"}</Btn>
                </div>
              </div>
            </Card>

            <Card style={{ padding:20 }}>
              <h4 style={{ fontSize:14,fontWeight:600,color:t.textPrimary,margin:"0 0 10px" }}>Motéis cadastrados</h4>
              <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
                {moteis.map(m=>(
                  <div key={m.id} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",
                    padding:"8px 12px",borderRadius:5,border:`1px solid ${t.border}` }}>
                    <div>
                      <p style={{ margin:0,fontSize:13,fontWeight:600,color:t.textPrimary }}>{m.name}</p>
                      <p style={{ margin:0,fontSize:11,color:t.textSecondary }}>{m.suites.length} suítes · /{m.slug}</p>
                    </div>
                    <div style={{ display:"flex",gap:4 }}>
                      <Btn small variant="ghost" onClick={()=>editM(m)}>✏️</Btn>
                      <Btn small variant="ghost" onClick={()=>delM(m.id)}>🗑️</Btn>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {tab==="suites"&&(
          <Card style={{ padding:24,maxWidth:540 }}>
            <h4 style={{ fontSize:14,fontWeight:600,color:t.textPrimary,margin:"0 0 14px" }}>+ Nova Suíte</h4>
            <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
              <div>
                <label style={{ color:t.textSecondary,fontSize:12,display:"block",marginBottom:5 }}>Motel</label>
                <Select value={suiteForm.motelId} onChange={e=>setSuiteForm(f=>({...f,motelId:e.target.value}))}>
                  <option value="">Selecione um motel</option>
                  {moteis.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
                </Select>
              </div>
              {[["Nome","text","name","Ex: Suíte Imperial"],["Número","text","number","101"],["Preço Rotativo (R$)","number","priceRotativo","120"],["Preço Pernoite (R$)","number","pricePernoite","200"],["Andar","number","floor","1"],["Capacidade","number","capacity","2"]].map(([lbl,type,key,ph])=>(
                <div key={key}>
                  <label style={{ color:t.textSecondary,fontSize:12,display:"block",marginBottom:5 }}>{lbl}</label>
                  <Input type={type} value={suiteForm[key]} onChange={e=>setSuiteForm(f=>({...f,[key]:e.target.value}))} placeholder={ph}/>
                </div>
              ))}
              <div>
                <label style={{ color:t.textSecondary,fontSize:12,display:"block",marginBottom:5 }}>Categoria</label>
                <Select value={suiteForm.category} onChange={e=>setSuiteForm(f=>({...f,category:e.target.value}))}>
                  {["standard","luxo","master","presidential"].map(c=><option key={c} value={c}>{c}</option>)}
                </Select>
              </div>
              <div>
                <label style={{ color:t.textSecondary,fontSize:12,display:"block",marginBottom:8 }}>Infraestrutura</label>
                <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>
                  {ams.map(a=>{
                    const on=suiteForm.amenities.includes(a);
                    return (
                      <button key={a} onClick={()=>toggleA(a)}
                        style={{ padding:"5px 12px",borderRadius:4,border:`1px solid ${on?t.accent:t.border}`,
                          background:on?`${t.accent}22`:"transparent",color:on?t.accent:t.textSecondary,
                          fontSize:12,cursor:"pointer" }}>{a}</button>
                    );
                  })}
                </div>
              </div>
              <Btn onClick={saveSuite} style={{ marginTop:6 }}>💾 Salvar Suíte</Btn>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
