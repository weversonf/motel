import { useState } from "react";
import { t } from "../../styles/tokens";
import { NPS_DATA, SUITES_DATA } from "../../data/mock";
import { Btn } from "../ui/Btn";
import { Card } from "../ui/Card";
import { Header } from "../layout/Header";

export function PageNPS() {
  const [nps, setNps]     = useState(NPS_DATA);
  const [tab, setTab]     = useState("painel");
  const [score, setScore] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setCom] = useState("");
  const [done, setDone]   = useState(false);
  const avg  = nps.length?(nps.reduce((a,b)=>a+b.score,0)/nps.length).toFixed(1):0;
  const dist = [5,4,3,2,1].map(s=>({s,c:nps.filter(n=>n.score===s).length}));

  const submit = () => {
    if (!score) return;
    setNps(prev=>[{id:`n${Date.now()}`,suiteId:"s1",score,comment,date:new Date()},...prev]);
    setDone(true);
  };

  return (
    <div className="fade-in" style={{ display:"flex",flexDirection:"column",height:"100%" }}>
      <Header title="📝 Pesquisa NPS" sub="Satisfação pós-checkout"
        right={
          <div style={{ display:"flex",gap:6 }}>
            {[["painel","📊 Painel"],["preview","👁️ Formulário"]].map(([v,l])=>(
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
            <div style={{ display:"grid",gridTemplateColumns:"auto 1fr",gap:16,marginBottom:20 }}>
              <Card style={{ padding:24,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minWidth:140 }}>
                <span style={{ fontSize:48,fontWeight:800,color:t.accent,lineHeight:1 }}>{avg}</span>
                <div style={{ display:"flex",gap:2,margin:"8px 0 4px" }}>
                  {[1,2,3,4,5].map(s=><span key={s} style={{ fontSize:18,color:s<=Math.round(avg)?"#facc15":t.textMuted }}>★</span>)}
                </div>
                <span style={{ color:t.textSecondary,fontSize:11 }}>{nps.length} avaliações</span>
              </Card>
              <Card style={{ padding:20 }}>
                <p style={{ color:t.textSecondary,fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:1,margin:"0 0 14px" }}>Distribuição</p>
                {dist.map(({s,c})=>(
                  <div key={s} style={{ display:"flex",alignItems:"center",gap:10,marginBottom:10 }}>
                    <div style={{ display:"flex",gap:1,width:70,flexShrink:0 }}>
                      {[1,2,3,4,5].map(x=><span key={x} style={{ fontSize:12,color:x<=s?"#facc15":t.textMuted }}>★</span>)}
                    </div>
                    <div style={{ flex:1,height:8,background:t.bgItem,borderRadius:99,overflow:"hidden" }}>
                      <div style={{ width:`${nps.length?c/nps.length*100:0}%`,height:"100%",
                        background:s>=4?t.green:s===3?t.yellow:t.red,borderRadius:99,transition:"width .5s" }}/>
                    </div>
                    <span style={{ color:t.textSecondary,fontSize:12,width:16,textAlign:"right" }}>{c}</span>
                  </div>
                ))}
              </Card>
            </div>
            <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
              {nps.map(n=>{
                const suite=SUITES_DATA.find(s=>s.id===n.suiteId);
                return (
                  <Card key={n.id} style={{ padding:14,borderLeft:`3px solid ${n.score>=4?t.green:n.score===3?t.yellow:t.red}` }}>
                    <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}>
                      <span style={{ color:t.textPrimary,fontWeight:600,fontSize:13 }}>{suite?.name}</span>
                      <span style={{ color:t.textSecondary,fontSize:11 }}>{new Date(n.date).toLocaleDateString("pt-BR")}</span>
                    </div>
                    <div style={{ display:"flex",gap:2,marginBottom:6 }}>
                      {[1,2,3,4,5].map(s=><span key={s} style={{ fontSize:14,color:s<=n.score?"#facc15":t.textMuted }}>★</span>)}
                    </div>
                    {n.comment&&<p style={{ color:t.textSecondary,fontSize:12,margin:0,fontStyle:"italic" }}>"{n.comment}"</p>}
                  </Card>
                );
              })}
            </div>
          </>
        )}
        {tab==="preview"&&(
          <div style={{ display:"flex",justifyContent:"center" }}>
            <div style={{ width:"100%",maxWidth:400 }}>
              <Card style={{ overflow:"hidden" }}>
                <div style={{ background:t.accent,padding:"28px 24px 36px",textAlign:"center" }}>
                  <p style={{ color:"#ffffff99",fontSize:11,margin:"0 0 6px" }}>Motéis Fortaleza</p>
                  <h2 style={{ color:t.white,fontSize:20,fontWeight:800,margin:"0 0 6px" }}>Como foi sua estadia?</h2>
                  <p style={{ color:"#ffffff99",fontSize:12,margin:0 }}>Suíte Rubi · hoje</p>
                </div>
                {!done?(
                  <div style={{ padding:24 }}>
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
                        {score===5?"Perfeito! 🎉":score===4?"Muito bom! 😊":score===3?"Regular 😐":score===2?"Ruim 😕":"Péssimo 😞"}
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
                  </div>
                ):(
                  <div style={{ padding:40,textAlign:"center" }}>
                    <p style={{ fontSize:48,marginBottom:12 }}>🙏</p>
                    <h3 style={{ color:t.textPrimary,fontWeight:800,fontSize:18,marginBottom:8 }}>Obrigado!</h3>
                    <p style={{ color:t.textSecondary,fontSize:13,marginBottom:20 }}>Sua avaliação nos ajuda a melhorar.</p>
                    <Btn variant="ghost" small onClick={()=>{setDone(false);setScore(0);setCom("");}}>Avaliar novamente</Btn>
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
