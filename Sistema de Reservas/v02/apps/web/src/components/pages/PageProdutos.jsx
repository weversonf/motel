import { useState } from "react";
import { t } from "../../styles/tokens";
import { PRODUCTS_DATA as MOCK_PRODUCTS } from "../../data/mock";
import { Chip } from "../ui/Chip";
import { Btn } from "../ui/Btn";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Card } from "../ui/Card";
import { Header } from "../layout/Header";

export function PageProdutos() {
  const [products, setProducts] = useState(MOCK_PRODUCTS.map(p=>({...p})));
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState("");
  const [cat, setCat]     = useState("todos");
  const [saved, setSaved] = useState(false);
  const empty = { name:"", category:"Bebidas", costPrice:"", sellPrice:"", currentStock:"", minStock:"", unit:"un", active:true };
  const [form, setForm]   = useState(empty);

  const cats = ["todos","Bebidas","Higiene","Snacks","Enxoval"];
  const shown = products.filter(p=>(cat==="todos"||p.category===cat)&&p.name.toLowerCase().includes(search.toLowerCase()));
  const margin = p => p.sellPrice>0?Math.round(((p.sellPrice-p.costPrice)/p.sellPrice)*100):0;

  const openNew = () => { setForm(empty); setModal("new"); };
  const openEdit = p => { setForm({...p,costPrice:String(p.costPrice),sellPrice:String(p.sellPrice),currentStock:String(p.currentStock),minStock:String(p.minStock)}); setModal("edit"); };
  const close = () => setModal(null);

  const save = () => {
    if (!form.name||!form.sellPrice) return;
    const row = {...form,costPrice:+form.costPrice,sellPrice:+form.sellPrice,currentStock:+form.currentStock,minStock:+form.minStock};
    if (modal==="edit") setProducts(prev=>prev.map(p=>p.id===form.id?{...p,...row}:p));
    else                setProducts(prev=>[...prev,{...row,id:`p${Date.now()}`}]);
    setSaved(true); setTimeout(()=>setSaved(false),2500);
    close();
  };

  const toggle = id => setProducts(prev=>prev.map(p=>p.id===id?{...p,active:!p.active}:p));

  return (
    <div className="fade-in" style={{ display:"flex",flexDirection:"column",height:"100%" }}>
      <Header title="🍺 Produtos & Frigobar" sub="Catálogo com preços e margens"
        right={
          <>
            {saved&&<span style={{color:t.green,fontSize:12}}>✓ Salvo</span>}
            <Btn small onClick={openNew}>+ Novo Produto</Btn>
          </>
        }/>
      <div style={{ flex:1,overflowY:"auto",padding:20 }}>
        <div style={{ display:"flex",gap:8,marginBottom:14,flexWrap:"wrap",alignItems:"center" }}>
          <Input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar..." style={{ width:180 }}/>
          <div style={{ display:"flex",gap:4 }}>
            {cats.map(c=>(
              <button key={c} onClick={()=>setCat(c)}
                style={{ padding:"5px 11px",borderRadius:4,border:`1px solid ${cat===c?t.accent:t.border}`,
                  background:cat===c?`${t.accent}22`:"transparent",color:cat===c?t.accent:t.textSecondary,
                  fontSize:11,fontWeight:cat===c?600:400,cursor:"pointer" }}>{c}</button>
            ))}
          </div>
        </div>
        <Card style={{ overflow:"hidden" }}>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%",borderCollapse:"collapse" }}>
              <thead><tr style={{ background:t.bgItem }}>
                {["Produto","Categoria","Custo","Venda","Margem","Estoque","Status",""].map(h=>(
                  <th key={h} style={{ padding:"10px 14px",textAlign:"left",color:t.textSecondary,fontSize:11,fontWeight:600,letterSpacing:.8,textTransform:"uppercase",whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {shown.map((p,i)=>{
                  const low=p.currentStock<=p.minStock;
                  const m=margin(p);
                  return (
                    <tr key={p.id} className="row-hover" style={{ borderTop:`1px solid ${t.border}22`,opacity:p.active?1:.45 }}>
                      <td style={{ padding:"10px 14px",color:t.textPrimary,fontWeight:500,fontSize:13 }}>{p.name}</td>
                      <td style={{ padding:"10px 14px" }}><Chip>{p.category}</Chip></td>
                      <td style={{ padding:"10px 14px",color:t.textSecondary,fontSize:12 }}>R$ {p.costPrice.toFixed(2)}</td>
                      <td style={{ padding:"10px 14px",color:t.textPrimary,fontWeight:600,fontSize:13 }}>R$ {p.sellPrice.toFixed(2)}</td>
                      <td style={{ padding:"10px 14px",fontWeight:600,fontSize:12,color:m>=50?t.green:m>=30?t.yellow:t.red }}>{m}%</td>
                      <td style={{ padding:"10px 14px",fontWeight:700,fontSize:13,color:low?t.red:t.textPrimary }}>{p.currentStock} {p.unit}</td>
                      <td style={{ padding:"10px 14px" }}>
                        {!p.active?<Chip color={t.textMuted}>Inativo</Chip>:low?<Chip color={t.red}>⚠️ Baixo</Chip>:<Chip color={t.green}>OK</Chip>}
                      </td>
                      <td style={{ padding:"10px 14px" }}>
                        <div style={{ display:"flex",gap:4 }}>
                          <Btn small variant="ghost" onClick={()=>openEdit(p)}>✏️</Btn>
                          <Btn small variant="ghost" onClick={()=>toggle(p.id)}>{p.active?"🚫":"✅"}</Btn>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {modal&&(
        <div onClick={close} style={{ position:"fixed",inset:0,zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",
          background:"rgba(0,0,0,.55)",animation:"fadeIn .15s" }}>
          <Card onClick={e=>e.stopPropagation()} style={{ padding:24,width:"100%",maxWidth:480,margin:16,maxHeight:"90vh",overflowY:"auto" }}>
            <h3 style={{ color:t.textPrimary,fontWeight:700,fontSize:15,marginBottom:20 }}>{modal==="edit"?"✏️ Editar Produto":"+ Novo Produto"}</h3>
            <div style={{ display:"flex",flexDirection:"column",gap:13 }}>
              <div><label style={{ color:t.textSecondary,fontSize:12,display:"block",marginBottom:5 }}>Nome</label>
                <Input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="Ex: Cerveja Long Neck"/></div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
                <div><label style={{ color:t.textSecondary,fontSize:12,display:"block",marginBottom:5 }}>Categoria</label>
                  <Select value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}>
                    {["Bebidas","Higiene","Snacks","Enxoval"].map(c=><option key={c}>{c}</option>)}
                  </Select></div>
                <div><label style={{ color:t.textSecondary,fontSize:12,display:"block",marginBottom:5 }}>Unidade</label>
                  <Select value={form.unit} onChange={e=>setForm(p=>({...p,unit:e.target.value}))}>
                    {["un","cx","kg","g","ml","l"].map(u=><option key={u}>{u}</option>)}
                  </Select></div>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
                <div><label style={{ color:t.textSecondary,fontSize:12,display:"block",marginBottom:5 }}>Preço Custo</label>
                  <Input type="number" value={form.costPrice} onChange={e=>setForm(p=>({...p,costPrice:e.target.value}))} placeholder="0.00"/></div>
                <div><label style={{ color:t.textSecondary,fontSize:12,display:"block",marginBottom:5 }}>Preço Venda</label>
                  <Input type="number" value={form.sellPrice} onChange={e=>setForm(p=>({...p,sellPrice:e.target.value}))} placeholder="0.00"/></div>
              </div>
              {form.costPrice&&form.sellPrice&&(
                <div style={{ background:t.bgItem,borderRadius:5,padding:"8px 12px",display:"flex",gap:10,alignItems:"center" }}>
                  <span style={{ color:t.textSecondary,fontSize:12 }}>Margem:</span>
                  <span style={{ color:t.green,fontWeight:700,fontSize:13 }}>
                    {Math.round(((+form.sellPrice-+form.costPrice)/+form.sellPrice)*100)}%
                  </span>
                </div>
              )}
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
                <div><label style={{ color:t.textSecondary,fontSize:12,display:"block",marginBottom:5 }}>Estoque Atual</label>
                  <Input type="number" value={form.currentStock} onChange={e=>setForm(p=>({...p,currentStock:e.target.value}))} placeholder="0"/></div>
                <div><label style={{ color:t.textSecondary,fontSize:12,display:"block",marginBottom:5 }}>Estoque Mínimo</label>
                  <Input type="number" value={form.minStock} onChange={e=>setForm(p=>({...p,minStock:e.target.value}))} placeholder="0"/></div>
              </div>
              <div style={{ display:"flex",gap:8,marginTop:4 }}>
                <Btn variant="ghost" onClick={close} style={{ flex:1 }}>Cancelar</Btn>
                <Btn onClick={save} style={{ flex:2 }}>{modal==="edit"?"Salvar Alterações":"Cadastrar"}</Btn>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
