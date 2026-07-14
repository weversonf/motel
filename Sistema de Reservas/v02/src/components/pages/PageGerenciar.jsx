import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { Btn } from "../ui/Btn";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import { Header } from "../layout/Header";

export function PageGerenciar({ moteis, setMoteis, suites, setSuites }) {
  const { t } = useTheme();
  const [editando, setEditando] = useState(null);

  const updateMotel = (id, field, value) => {
    setMoteis(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const addSuite = (motelId) => {
    const maxNum = Math.max(0, ...suites.filter(s => s.motelId === motelId).map(s => parseInt(s.number) || 0));
    setSuites(prev => [...prev, {
      id: `s${Date.now()}`, motelId, number: String(maxNum + 1), name: "Nova Suíte",
      category: "standard", status: "disponivel", floor: 1,
      priceRotativo: 120, pricePernoite: 200, amenities: [], capacity: 2
    }]);
  };

  const updateSuite = (id, field, value) => {
    setSuites(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const removeSuite = (id) => {
    setSuites(prev => prev.filter(s => s.id !== id));
    if (editando === id) setEditando(null);
  };

  return (
    <div className="fade-in" style={{ display:"flex",flexDirection:"column",height:"100%" }}>
      <Header title="🏢 Gerenciar Motéis & Suítes" sub="Cadastro, edição e tokens de API"/>
      <div style={{ flex:1,overflowY:"auto",padding:20 }}>
        {moteis.map(motel => {
          const motelSuites = suites.filter(s => s.motelId === motel.id);
          return (
            <Card key={motel.id} style={{ padding:20, marginBottom:20, borderLeft:`4px solid ${motel.cor}` }}>
              <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:20,paddingBottom:16,borderBottom:`1px solid ${t.border}` }}>
                <span style={{ fontSize:22 }}>{motel.icon}</span>
                <Input
                  value={motel.name}
                  onChange={e => updateMotel(motel.id, "name", e.target.value)}
                  style={{ fontWeight:700,fontSize:15,flex:1,maxWidth:300 }}
                />
                <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                  <label style={{ color:t.textSecondary,fontSize:11,whiteSpace:"nowrap" }}>Cor:</label>
                  <input type="color" value={motel.cor}
                    onChange={e => updateMotel(motel.id, "cor", e.target.value)}
                    style={{ width:32,height:32,border:"none",cursor:"pointer",borderRadius:4 }}/>
                </div>
              </div>

              {motelSuites.map(suite => (
                <div key={suite.id}
                  style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 12px",marginBottom:8,
                    background:t.bgItem,borderRadius:6,flexWrap:"wrap" }}>
                  <Input value={suite.number} onChange={e=>updateSuite(suite.id,"number",e.target.value)}
                    style={{ width:50,textAlign:"center",fontSize:12 }}/>
                  <Input value={suite.name} onChange={e=>updateSuite(suite.id,"name",e.target.value)}
                    style={{ flex:1,minWidth:120,fontSize:12 }}/>
                  <div style={{ display:"flex",alignItems:"center",gap:4 }}>
                    <span style={{ color:t.textMuted,fontSize:10 }}>Rotativo R$</span>
                    <Input type="number" value={suite.priceRotativo} onChange={e=>updateSuite(suite.id,"priceRotativo",e.target.value)}
                      style={{ width:60,textAlign:"center",fontSize:11 }}/>
                  </div>
                  <div style={{ display:"flex",alignItems:"center",gap:4 }}>
                    <span style={{ color:t.textMuted,fontSize:10 }}>Pernoite R$</span>
                    <Input type="number" value={suite.pricePernoite} onChange={e=>updateSuite(suite.id,"pricePernoite",e.target.value)}
                      style={{ width:60,textAlign:"center",fontSize:11 }}/>
                  </div>
                  <Btn small variant="ghost" onClick={()=>removeSuite(suite.id)}>🗑️</Btn>
                </div>
              ))}

              <div style={{ display:"flex",gap:8,marginTop:8 }}>
                <Btn small variant="ghost" onClick={()=>addSuite(motel.id)}>+ Adicionar Suíte</Btn>
              </div>

              <div style={{ marginTop:16,padding:"10px 14px",background:t.orangeSoft,borderRadius:6 }}>
                <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                  <label style={{ fontSize:11,fontWeight:600,color:t.textSecondary,whiteSpace:"nowrap" }}>Token API:</label>
                  <Input value={motel.token} onChange={e=>updateMotel(motel.id,"token",e.target.value)}
                    style={{ flex:1,fontSize:11,fontFamily:"monospace",background:t.bgCard }}/>
                  <span style={{ padding:"4px 10px",borderRadius:12,fontSize:10,fontWeight:600,
                    background:`${t.green}22`,color:t.green,whiteSpace:"nowrap" }}>
                    ✓ Ativo
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
