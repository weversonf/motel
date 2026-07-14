import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { USUARIOS_DATA, PERFIS_DATA, MOTEIS_DATA } from "../../data/mock";
import { Btn } from "../ui/Btn";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Card } from "../ui/Card";
import { Header } from "../layout/Header";

export function PageControleAcesso() {
  const { t } = useTheme();
  const [usuarios, setUsuarios] = useState(USUARIOS_DATA);
  const [tab, setTab] = useState("usuarios");
  const [form, setForm] = useState({ name:"", email:"", perfil:"perfil_atendente", motelId:"motel1", avatar:"" });
  const [editId, setEditId] = useState(null);
  const [saved, setSaved] = useState(false);

  const show = msg => { setSaved(msg); setTimeout(()=>setSaved(false),3000); };

  const save = () => {
    if (!form.name||!form.email) return;
    if (editId) {
      setUsuarios(prev=>prev.map(u=>u.id===editId?{...u,...form}:u));
      show("Usuário atualizado!");
    } else {
      setUsuarios(prev=>[...prev,{...form,id:`u${Date.now()}`}]);
      show("Usuário cadastrado!");
    }
    setEditId(null); setForm({ name:"", email:"", perfil:"perfil_atendente", motelId:"motel1", avatar:"" });
  };

  const edit = u => { setEditId(u.id); setForm({ name:u.name, email:u.email, perfil:u.perfil, motelId:u.motelId, avatar:u.avatar }); };
  const del = id => { setUsuarios(prev=>prev.filter(u=>u.id!==id)); show("Usuário removido"); };

  return (
    <div className="fade-in" style={{ display:"flex",flexDirection:"column",height:"100%" }}>
      <Header title="🔐 Controle de Acesso" sub="Usuários, perfis e permissões por motel"/>
      <div style={{ flex:1,overflowY:"auto",padding:20 }}>
        {saved&&<div style={{ background:`${t.green}18`,border:`1px solid ${t.green}44`,borderRadius:5,padding:"10px 14px",marginBottom:16,color:t.green,fontSize:13 }}>✓ {saved}</div>}

        <div style={{ display:"flex",gap:6,marginBottom:16 }}>
          {[["usuarios","👤 Usuários"],["perfis","🔑 Perfis"]].map(([v,l])=>(
            <button key={v} onClick={()=>setTab(v)}
              style={{ padding:"6px 16px",borderRadius:4,border:`1px solid ${tab===v?t.accent:t.border}`,
                background:tab===v?`${t.accent}22`:"transparent",color:tab===v?t.accent:t.textSecondary,
                fontSize:12,fontWeight:tab===v?600:400,cursor:"pointer" }}>{l}</button>
          ))}
        </div>

        {tab==="perfis"&&(
          <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
            {PERFIS_DATA.map(p=>(
              <Card key={p.id} style={{ padding:16 }}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8 }}>
                  <div>
                    <span style={{ fontWeight:700,fontSize:14,color:t.textPrimary }}>{p.label}</span>
                    <span style={{ color:t.textMuted,fontSize:11,marginLeft:8 }}>Nível {p.level}</span>
                  </div>
                </div>
                <div style={{ display:"flex",flexWrap:"wrap",gap:4 }}>
                  <ChipSmall cor={t.textMuted}>Visão {p.canSeeAll?"geral":"restrita ao motel"}</ChipSmall>
                  {p.canManage.map(m=><ChipSmall key={m} cor={t.accent}>{m}</ChipSmall>)}
                </div>
              </Card>
            ))}
          </div>
        )}

        {tab==="usuarios"&&(
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:18,alignItems:"start" }}>
            <Card style={{ padding:20 }}>
              <h4 style={{ fontSize:14,fontWeight:600,color:t.textPrimary,margin:"0 0 14px" }}>
                {editId?"✏️ Editar Usuário":"+ Novo Usuário"}
              </h4>
              <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                <div>
                  <label style={{ color:t.textSecondary,fontSize:12,display:"block",marginBottom:4 }}>Nome</label>
                  <Input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Ex: Maria Silva"/>
                </div>
                <div>
                  <label style={{ color:t.textSecondary,fontSize:12,display:"block",marginBottom:4 }}>Email</label>
                  <Input value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="maria@email.com"/>
                </div>
                <div>
                  <label style={{ color:t.textSecondary,fontSize:12,display:"block",marginBottom:4 }}>Perfil</label>
                  <Select value={form.perfil} onChange={e=>setForm(f=>({...f,perfil:e.target.value}))}>
                    {PERFIS_DATA.map(p=><option key={p.id} value={p.id}>{p.label}</option>)}
                  </Select>
                </div>
                <div>
                  <label style={{ color:t.textSecondary,fontSize:12,display:"block",marginBottom:4 }}>Motel</label>
                  <Select value={form.motelId} onChange={e=>setForm(f=>({...f,motelId:e.target.value}))}>
                    <option value="todos">Todos (visão geral)</option>
                    {MOTEIS_DATA.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
                  </Select>
                </div>
                <div style={{ display:"flex",gap:6,marginTop:4 }}>
                  {editId&&<Btn small variant="ghost" onClick={()=>{setEditId(null);setForm({name:"",email:"",perfil:"perfil_atendente",motelId:"motel1",avatar:""});}}>Cancelar</Btn>}
                  <Btn small onClick={save}>{editId?"Salvar":"Cadastrar"}</Btn>
                </div>
              </div>
            </Card>

            <Card style={{ padding:20 }}>
              <h4 style={{ fontSize:14,fontWeight:600,color:t.textPrimary,margin:"0 0 10px" }}>Usuários cadastrados</h4>
              <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
                {usuarios.map(u=>{
                  const perfil = PERFIS_DATA.find(p=>p.id===u.perfil);
                  const motel = u.motelId==="todos" ? "Geral" : MOTEIS_DATA.find(m=>m.id===u.motelId)?.name;
                  return (
                    <div key={u.id} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",
                      padding:"8px 12px",borderRadius:5,border:`1px solid ${t.border}` }}>
                      <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                        <div style={{ width:30,height:30,borderRadius:"50%",background:t.accent,
                          display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:12,flexShrink:0 }}>
                          {u.avatar||u.name.charAt(0)}</div>
                        <div>
                          <p style={{ margin:0,fontSize:13,fontWeight:600,color:t.textPrimary }}>{u.name}</p>
                          <p style={{ margin:0,fontSize:10,color:t.textSecondary }}>{perfil?.label} · {motel}</p>
                        </div>
                      </div>
                      <div style={{ display:"flex",gap:4 }}>
                        <Btn small variant="ghost" onClick={()=>edit(u)}>✏️</Btn>
                        <Btn small variant="ghost" onClick={()=>del(u.id)}>🗑️</Btn>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

function ChipSmall({ cor, children }) {
  return <span style={{ background:`${cor}18`,color:cor,padding:"2px 8px",borderRadius:3,fontSize:10,fontWeight:600 }}>{children}</span>;
}
