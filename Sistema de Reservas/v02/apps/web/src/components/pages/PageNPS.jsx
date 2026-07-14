import { useState } from "react";
import { t } from "../../styles/tokens";
import { NPS_DATA, MOTEIS_DATA } from "../../data/mock";
import { Btn } from "../ui/Btn";
import { Card } from "../ui/Card";
import { Header } from "../layout/Header";

const ROTULO = { 5:"Perfeito! 🎉", 4:"Muito bom! 😊", 3:"Regular 😐", 2:"Ruim 😕", 1:"Péssimo 😞" };

export function PageNPS() {
  const [nps, setNps]     = useState(NPS_DATA);
  const [tab, setTab]     = useState("painel");
  const [filtroMotel, setFiltroMotel] = useState("todos");

  const lista = filtroMotel==="todos" ? nps : nps.filter(n=>n.motelId===filtroMotel);
  const avg  = lista.length?(lista.reduce((a,b)=>a+b.score,0)/lista.length).toFixed(1):0;
  const dist = [5,4,3,2,1].map(s=>({s,c:lista.filter(n=>n.score===s).length}));

  const getMotelName = id => MOTEIS_DATA.find(m=>m.id===id)?.name || id;

  return (
    <div className="fade-in" style={{ display:"flex",flexDirection:"column",height:"100%" }}>
      <Header title="📝 Pesquisa NPS" sub="Satisfação pós-checkout"
        right={
          <div style={{ display:"flex",gap:6 }}>
            {[["painel","📊 Painel"],["form","✏️ Formulário"],["links","🔗 Links"]].map(([v,l])=>(
              <button key={v} onClick={()=>setTab(v)}
                style={{ padding:"5px 12px",borderRadius:4,border:`1px solid ${tab===v?t.accent:t.border}`,
                  background:tab===v?`${t.accent}22`:"transparent",color:tab===v?t.accent:t.textSecondary,
                  fontSize:12,fontWeight:tab===v?600:400,cursor:"pointer" }}>{l}</button>
            ))}
          </div>
        }/>
      <div style={{ flex:1,overflowY:"auto",padding:20 }}>
        {tab==="painel"&&(
          <>
            <div style={{ display:"flex",gap:8,alignItems:"center",marginBottom:16 }}>
              <span style={{ fontSize:12,color:t.textSecondary,fontWeight:600 }}>Filtrar por motel:</span>
              <div style={{ display:"flex",gap:4,flexWrap:"wrap" }}>
                {[{id:"todos",name:"Geral"},...MOTEIS_DATA].map(m=>(
                  <button key={m.id} onClick={()=>setFiltroMotel(m.id)}
                    style={{ padding:"4px 12px",borderRadius:4,border:`1px solid ${filtroMotel===m.id?t.accent:t.border}`,
                      background:filtroMotel===m.id?`${t.accent}22`:"transparent",
                      color:filtroMotel===m.id?t.accent:t.textSecondary,
                      fontSize:11,fontWeight:filtroMotel===m.id?600:400,cursor:"pointer" }}>{m.name}</button>
                ))}
              </div>
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"auto 1fr",gap:16,marginBottom:20 }}>
              <Card style={{ padding:24,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minWidth:140 }}>
                <span style={{ fontSize:48,fontWeight:800,color:t.accent,lineHeight:1 }}>{avg}</span>
                <div style={{ display:"flex",gap:2,margin:"8px 0 4px" }}>
                  {[1,2,3,4,5].map(s=><span key={s} style={{ fontSize:18,color:s<=Math.round(avg)?"#facc15":t.textMuted }}>★</span>)}
                </div>
                <span style={{ color:t.textSecondary,fontSize:11 }}>{lista.length} avaliações</span>
              </Card>
              <Card style={{ padding:20 }}>
                <p style={{ color:t.textSecondary,fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:1,margin:"0 0 14px" }}>Distribuição</p>
                {dist.map(({s,c})=>(
                  <div key={s} style={{ display:"flex",alignItems:"center",gap:10,marginBottom:10 }}>
                    <div style={{ display:"flex",gap:1,width:70,flexShrink:0 }}>
                      {[1,2,3,4,5].map(x=><span key={x} style={{ fontSize:12,color:x<=s?"#facc15":t.textMuted }}>★</span>)}
                    </div>
                    <div style={{ flex:1,height:8,background:t.bgItem,borderRadius:99,overflow:"hidden" }}>
                      <div style={{ width:`${lista.length?c/lista.length*100:0}%`,height:"100%",
                        background:s>=4?t.green:s===3?t.yellow:t.red,borderRadius:99,transition:"width .5s" }}/>
                    </div>
                    <span style={{ color:t.textSecondary,fontSize:12,width:16,textAlign:"right" }}>{c}</span>
                  </div>
                ))}
              </Card>
            </div>
            <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
              {lista.map(n=>(
                <Card key={n.id} style={{ padding:14,borderLeft:`3px solid ${n.score>=4?t.green:n.score===3?t.yellow:t.red}` }}>
                  <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}>
                    <div>
                      <span style={{ color:t.textPrimary,fontWeight:600,fontSize:13 }}>{getMotelName(n.motelId)}</span>
                      <span style={{ color:t.textMuted,fontSize:11,marginLeft:6 }}>· Suíte {n.suiteId}</span>
                    </div>
                    <span style={{ color:t.textSecondary,fontSize:11 }}>{new Date(n.date).toLocaleDateString("pt-BR")}</span>
                  </div>
                  <div style={{ display:"flex",gap:2,marginBottom:6 }}>
                    {[1,2,3,4,5].map(s=><span key={s} style={{ fontSize:14,color:s<=n.score?"#facc15":t.textMuted }}>★</span>)}
                  </div>
                  {n.comment&&<p style={{ color:t.textSecondary,fontSize:12,margin:0,fontStyle:"italic" }}>"{n.comment}"</p>}
                </Card>
              ))}
            </div>
          </>
        )}

        {tab==="form"&&(
          <NPSSurvey onSend={r=>setNps(prev=>[r,...prev])} />
        )}

        {tab==="links"&&(
          <div style={{ maxWidth:500,margin:"0 auto" }}>
            <h3 style={{ fontSize:14,fontWeight:600,color:t.textPrimary,margin:"0 0 16px" }}>🔗 Links de avaliação por motel</h3>
            <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
              {MOTEIS_DATA.map(m=>(
                <Card key={m.id} style={{ padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                  <span style={{ fontSize:13,fontWeight:600,color:t.textPrimary }}>{m.name}</span>
                  <Btn small onClick={()=>{navigator.clipboard?.writeText(`${window.location.origin}/nps?motel=${m.id}`);}}>Copiar link</Btn>
                </Card>
              ))}
            </div>
            <p style={{ color:t.textMuted,fontSize:11,marginTop:12 }}>
              O link abre o formulário já vinculado ao motel. Envie para os clientes via WhatsApp.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function NPSSurvey({ motelId:forced, onSend }) {
  const [step, setStep] = useState(forced?"nota":"motel");
  const [selMotel, setSelMotel] = useState(forced||"");
  const [score, setScore] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setCom] = useState("");
  const [done, setDone] = useState(false);

  const submit = () => {
    if (!score) return;
    onSend({ id:`n${Date.now()}`, motelId:selMotel, suiteId:"-", score, comment, date:new Date() });
    setDone(true);
  };

  if (done) return (
    <div style={{ display:"flex",justifyContent:"center" }}>
      <div style={{ width:"100%",maxWidth:400 }}>
        <Card style={{ overflow:"hidden" }}>
          <div style={{ background:t.accent,padding:"28px 24px 36px",textAlign:"center" }}>
            <h2 style={{ color:t.white,fontSize:20,fontWeight:800,margin:"0 0 6px" }}>Motéis Fortaleza</h2>
            <p style={{ color:"#ffffff99",fontSize:12,margin:0 }}>Sua opinião é importante</p>
          </div>
          <div style={{ padding:40,textAlign:"center" }}>
            <p style={{ fontSize:48,marginBottom:12 }}>🙏</p>
            <h3 style={{ color:t.textPrimary,fontWeight:800,fontSize:18,marginBottom:8 }}>Obrigado!</h3>
            <p style={{ color:t.textSecondary,fontSize:13 }}>Sua avaliação nos ajuda a melhorar.</p>
          </div>
        </Card>
      </div>
    </div>
  );

  return (
    <div style={{ display:"flex",justifyContent:"center" }}>
      <div style={{ width:"100%",maxWidth:400 }}>
        <Card style={{ overflow:"hidden" }}>
          <div style={{ background:t.accent,padding:"28px 24px 36px",textAlign:"center" }}>
            <p style={{ color:"#ffffff99",fontSize:11,margin:"0 0 6px" }}>Motéis Fortaleza</p>
            <h2 style={{ color:t.white,fontSize:20,fontWeight:800,margin:"0 0 6px" }}>Como foi sua estadia?</h2>
            <p style={{ color:"#ffffff99",fontSize:12,margin:0 }}>
              {forced?getMotelName(forced):step==="nota"?getMotelName(selMotel):""}
            </p>
          </div>
          <div style={{ padding:24 }}>
            {step==="motel"&&(
              <>
                <p style={{ color:t.textPrimary,fontWeight:600,fontSize:14,textAlign:"center",marginBottom:16 }}>
                  Qual motel você visitou?
                </p>
                <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
                  {MOTEIS_DATA.map(m=>(
                    <button key={m.id} onClick={()=>{setSelMotel(m.id);setStep("nota");}}
                      style={{ padding:"10px 14px",borderRadius:8,border:`1px solid ${t.border}`,
                        background:t.bgItem,cursor:"pointer",textAlign:"left",fontSize:13,
                        color:t.textPrimary,fontWeight:500 }}
                      onMouseEnter={e=>e.currentTarget.style.borderColor=t.accent}
                      onMouseLeave={e=>e.currentTarget.style.borderColor=t.border}>{m.name}</button>
                  ))}
                </div>
              </>
            )}
            {step==="nota"&&(
              <>
                <p style={{ color:t.textPrimary,fontWeight:600,fontSize:14,textAlign:"center",marginBottom:20 }}>
                  Qual nota você dá?
                </p>
                <div style={{ display:"flex",justifyContent:"center",gap:10,marginBottom:20 }}>
                  {[1,2,3,4,5].map(s=>(
                    <button key={s} onClick={()=>setScore(s)} onMouseEnter={()=>setHover(s)} onMouseLeave={()=>setHover(0)}
                      style={{ background:"transparent",border:"none",cursor:"pointer",fontSize:36,
                        color:(hover||score)>=s?"#facc15":t.textMuted,
                        transform:(hover||score)>=s?"scale(1.2)":"scale(1)",transition:"all .1s" }}>★</button>
                  ))}
                </div>
                {score>0&&(
                  <p style={{ color:t.accent,textAlign:"center",fontWeight:600,fontSize:13,marginBottom:14 }}>
                    {ROTULO[score]}
                  </p>
                )}
                <div style={{ marginBottom:16 }}>
                  <label style={{ color:t.textSecondary,fontSize:12,display:"block",marginBottom:6 }}>Comentário (opcional)</label>
                  <textarea value={comment} onChange={e=>setCom(e.target.value)} rows={3}
                    placeholder="O que você mais gostou? O que podemos melhorar?"
                    style={{ width:"100%",background:t.bgItem,border:`1px solid ${t.border2}`,borderRadius:5,
                      padding:"10px 12px",color:t.textPrimary,fontSize:13,outline:"none",resize:"vertical",
                      fontFamily:"inherit",boxSizing:"border-box" }}/>
                </div>
                <Btn onClick={submit} disabled={!score} style={{ width:"100%" }}>Enviar Avaliação</Btn>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function getMotelName(id) {
  return MOTEIS_DATA.find(m=>m.id===id)?.name||id;
}
