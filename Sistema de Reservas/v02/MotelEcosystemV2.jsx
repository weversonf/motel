// ============================================================
// ECOSSISTEMA MOTELEIRO V2 — Identidade visual fiel ao original
// weversonf.github.io/motel/admin — Dark puro, sidebar compacta
// ============================================================
import { useState, useEffect, useCallback, createContext, useContext } from "react";

// ============================================================
// DESIGN TOKENS — Extraídos do painel original
// Preto profundo · Cinza escuro · Branco puro · Acentos status
// ============================================================
const t = {
  // Backgrounds
  bg:       "#0d0d0d",   // fundo geral — quase preto
  bgCard:   "#161616",   // cards e sidebar
  bgItem:   "#1e1e1e",   // itens de lista, linhas pares
  bgHover:  "#252525",   // hover de itens
  border:   "#2a2a2a",   // bordas sutis
  border2:  "#333333",   // bordas um pouco mais visíveis

  // Texto
  textPrimary:   "#f0f0f0",  // texto principal
  textSecondary: "#888888",  // texto secundário / labels
  textMuted:     "#555555",  // texto desativado

  // Acentos — fiel ao original
  accent:    "#7c3aed",   // roxo — cor primária de ação (botões, links ativos)
  accentL:   "#8b5cf6",
  accentGlow:"#7c3aed33",

  // Status de reserva — igual ao original
  confirmed: "#16a34a",   // verde — Confirmado
  confirmedBg:"#16a34a18",
  pixPend:   "#ca8a04",   // amarelo — PIX Pendente
  pixPendBg: "#ca8a0418",
  cardPend:  "#2563eb",   // azul — Cartão Pendente
  cardPendBg:"#2563eb18",
  waiting:   "#dc2626",   // vermelho — Aguardando
  waitingBg: "#dc262618",
  cancelled: "#555555",   // cinza — Cancelado
  cancelledBg:"#55555518",
  pending:   "#f97316",   // laranja — Pendente genérico
  pendingBg: "#f9731618",

  // Suite status
  avail:   "#16a34a",
  occupied:"#dc2626",
  dirty:   "#ca8a04",
  cleaning:"#2563eb",
  maint:   "#7c3aed",

  white:  "#ffffff",
  green:  "#16a34a",
  red:    "#dc2626",
  yellow: "#ca8a04",
  blue:   "#2563eb",
};

// ============================================================
// GLOBAL STYLES
// ============================================================
const G = () => (
  <style>{`
    *{box-sizing:border-box;margin:0;padding:0}
    body{background:${t.bg};color:${t.textPrimary};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
    ::-webkit-scrollbar{width:4px;height:4px}
    ::-webkit-scrollbar-track{background:transparent}
    ::-webkit-scrollbar-thumb{background:${t.border2};border-radius:2px}
    input,select,textarea{font-family:inherit}
    button{font-family:inherit;cursor:pointer}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
    .fade-in{animation:fadeIn .25s ease}
    .row-hover:hover{background:${t.bgHover}!important}
  `}</style>
);

// ============================================================
// CONTEXTS
// ============================================================
const AppCtx = createContext({ page:"login", setPage:()=>{} });

// ============================================================
// MOCK DATA
// ============================================================
const delay = (ms=200) => new Promise(r=>setTimeout(r,ms));
const d = (offset,h=22,m=0) => { const x=new Date(); x.setDate(x.getDate()+offset); x.setHours(h,m,0,0); return x; };

const SUITES_DATA = [
  { id:"s1",  number:"101", name:"Suíte Esmeralda",   category:"standard",     status:"disponivel", floor:1, priceRotativo:120, pricePernoite:200, amenities:["Smart TV","Hidro","Ar-Condicionado","Frigobar"], capacity:2 },
  { id:"s2",  number:"102", name:"Suíte Rubi",        category:"luxo",         status:"ocupada",    floor:1, priceRotativo:180, pricePernoite:300, amenities:["Smart TV","Hidro","Sauna","Alexa","Frigobar"], capacity:2, currentGuest:"Carlos M.", occupiedSince:new Date(Date.now()-5400000) },
  { id:"s3",  number:"103", name:"Suíte Safira",      category:"standard",     status:"suja",       floor:1, priceRotativo:120, pricePernoite:200, amenities:["Smart TV","Ar-Condicionado","Frigobar"], capacity:2 },
  { id:"s4",  number:"201", name:"Suíte Ônix",        category:"luxo",         status:"disponivel", floor:2, priceRotativo:180, pricePernoite:300, amenities:["Smart TV","Hidro","Piscina Privativa","Alexa","Frigobar"], capacity:2 },
  { id:"s5",  number:"202", name:"Suíte Diamante",    category:"master",       status:"em_limpeza", floor:2, priceRotativo:250, pricePernoite:450, amenities:["Smart TV","Hidro","Sauna","Piscina Privativa","Alexa","Frigobar","Lareira"], capacity:2, camareira:"Ana Lima" },
  { id:"s6",  number:"203", name:"Suíte Âmbar",       category:"standard",     status:"ocupada",    floor:2, priceRotativo:130, pricePernoite:220, amenities:["Smart TV","Ar-Condicionado","Frigobar"], capacity:2, currentGuest:"Fernanda L.", occupiedSince:new Date(Date.now()-2700000) },
  { id:"s7",  number:"204", name:"Suíte Pérola",      category:"luxo",         status:"disponivel", floor:2, priceRotativo:180, pricePernoite:300, amenities:["Smart TV","Hidro","Sauna","Frigobar"], capacity:2 },
  { id:"s8",  number:"301", name:"Suíte Opala",       category:"master",       status:"disponivel", floor:3, priceRotativo:250, pricePernoite:450, amenities:["Smart TV","Hidro","Piscina Privativa","Alexa","Frigobar"], capacity:2 },
  { id:"s9",  number:"302", name:"Suíte Imperial",    category:"presidential", status:"ocupada",    floor:3, priceRotativo:400, pricePernoite:700, amenities:["Smart TV","Hidro","Sauna","Piscina Privativa","Alexa","Frigobar","Lareira","Bar Privativo"], capacity:4, currentGuest:"Ricardo P.", occupiedSince:new Date(Date.now()-900000) },
  { id:"s10", number:"303", name:"Suíte Granada",     category:"luxo",         status:"suja",       floor:3, priceRotativo:180, pricePernoite:300, amenities:["Smart TV","Hidro","Sauna","Frigobar"], capacity:2 },
  { id:"s11", number:"304", name:"Suíte Aurora",      category:"standard",     status:"disponivel", floor:3, priceRotativo:130, pricePernoite:220, amenities:["Smart TV","Ar-Condicionado","Frigobar"], capacity:2 },
  { id:"s12", number:"305", name:"Suíte Noir",        category:"master",       status:"em_limpeza", floor:3, priceRotativo:250, pricePernoite:450, amenities:["Smart TV","Hidro","Sauna","Piscina Privativa","Alexa","Frigobar"], capacity:2, camareira:"Maria S." },
];

const RESERVATIONS_DATA = [
  { id:"r1",  suiteId:"s2",  suiteName:"Suíte Rubi (102)",      motel:"Motel Fortaleza Norte", guestName:"Carlos M.",    checkIn:d(-1,22), checkOut:d(0,6),  type:"pernoite", status:"confirmado", totalValue:300, paymentMethod:"pix",     paymentStatus:"pago"    },
  { id:"r2",  suiteId:"s6",  suiteName:"Suíte Âmbar (203)",     motel:"Motel Fortaleza Norte", guestName:"Fernanda L.",  checkIn:d(0,14),  checkOut:null,    type:"rotativo", status:"confirmado", totalValue:130, paymentMethod:"dinheiro",paymentStatus:"pago"    },
  { id:"r3",  suiteId:"s9",  suiteName:"Suíte Imperial (302)",  motel:"Motel Fortaleza Sul",   guestName:"Ricardo P.",   checkIn:d(0,16),  checkOut:null,    type:"pernoite", status:"pix_pendente",totalValue:700, paymentMethod:"pix",    paymentStatus:"pendente"},
  { id:"r4",  suiteId:"s1",  suiteName:"Suíte Esmeralda (101)", motel:"Motel Fortaleza Norte", guestName:"Paulo & Ana",  checkIn:d(1,20),  checkOut:d(2,8),  type:"pernoite", status:"pix_pendente",totalValue:200, paymentMethod:"pix",    paymentStatus:"pendente"},
  { id:"r5",  suiteId:"s4",  suiteName:"Suíte Ônix (201)",      motel:"Motel Fortaleza Sul",   guestName:"Marcos T.",    checkIn:d(1,22),  checkOut:d(2,6),  type:"pernoite", status:"cartao_pendente",totalValue:300, paymentMethod:"cartao",paymentStatus:"pendente"},
  { id:"r6",  suiteId:"s8",  suiteName:"Suíte Opala (301)",     motel:"Motel Fortaleza Norte", guestName:"Lúcia M.",     checkIn:d(2,10),  checkOut:null,    type:"rotativo", status:"pendente",   totalValue:250, paymentMethod:"pix",     paymentStatus:"pendente"},
  { id:"r7",  suiteId:"s5",  suiteName:"Suíte Diamante (202)",  motel:"Motel Fortaleza Sul",   guestName:"Henrique S.",  checkIn:d(3,22),  checkOut:d(4,8),  type:"pernoite", status:"aguardando",  totalValue:450, paymentMethod:"cartao",  paymentStatus:"pendente"},
  { id:"r8",  suiteId:"s7",  suiteName:"Suíte Pérola (204)",    motel:"Motel Fortaleza Norte", guestName:"Roberta K.",   checkIn:d(-2,20), checkOut:d(-1,6), type:"pernoite", status:"confirmado",  totalValue:300, paymentMethod:"pix",     paymentStatus:"pago"    },
  { id:"r9",  suiteId:"s11", suiteName:"Suíte Aurora (304)",    motel:"Motel Fortaleza Sul",   guestName:"Felipe N.",    checkIn:d(0,18),  checkOut:null,    type:"rotativo", status:"confirmado",  totalValue:130, paymentMethod:"dinheiro",paymentStatus:"pago"    },
  { id:"r10", suiteId:"s3",  suiteName:"Suíte Safira (103)",    motel:"Motel Fortaleza Norte", guestName:"Camila R.",    checkIn:d(4,22),  checkOut:d(5,8),  type:"pernoite", status:"cancelado",   totalValue:200, paymentMethod:"pix",     paymentStatus:"cancelado"},
  { id:"r11", suiteId:"s10", suiteName:"Suíte Granada (303)",   motel:"Motel Fortaleza Sul",   guestName:"Bruno S.",     checkIn:d(-3,22), checkOut:d(-2,6), type:"pernoite", status:"confirmado",  totalValue:300, paymentMethod:"cartao",  paymentStatus:"pago"    },
  { id:"r12", suiteId:"s12", suiteName:"Suíte Noir (305)",      motel:"Motel Fortaleza Norte", guestName:"Juliana V.",   checkIn:d(2,22),  checkOut:d(3,8),  type:"pernoite", status:"cartao_pendente",totalValue:450,paymentMethod:"cartao", paymentStatus:"pendente"},
];

const PRODUCTS_DATA = [
  { id:"p1",  name:"Cerveja Long Neck 350ml",  category:"Bebidas",  costPrice:4.50, sellPrice:12.00, currentStock:48, minStock:20, unit:"un", active:true },
  { id:"p2",  name:"Vinho Tinto 750ml",         category:"Bebidas",  costPrice:22.0, sellPrice:55.00, currentStock:12, minStock:10, unit:"un", active:true },
  { id:"p3",  name:"Água Mineral 500ml",        category:"Bebidas",  costPrice:1.20, sellPrice:4.00,  currentStock:5,  minStock:30, unit:"un", active:true },
  { id:"p4",  name:"Refrigerante Lata 350ml",   category:"Bebidas",  costPrice:2.50, sellPrice:7.00,  currentStock:60, minStock:20, unit:"un", active:true },
  { id:"p5",  name:"Energético 473ml",          category:"Bebidas",  costPrice:6.00, sellPrice:15.00, currentStock:18, minStock:10, unit:"un", active:true },
  { id:"p6",  name:"Whisky Dose 50ml",          category:"Bebidas",  costPrice:8.00, sellPrice:22.00, currentStock:24, minStock:10, unit:"un", active:true },
  { id:"p7",  name:"Preservativo CX12",         category:"Higiene",  costPrice:8.00, sellPrice:15.00, currentStock:3,  minStock:15, unit:"cx", active:true },
  { id:"p8",  name:"Gel Íntimo 60ml",           category:"Higiene",  costPrice:5.00, sellPrice:18.00, currentStock:22, minStock:10, unit:"un", active:true },
  { id:"p9",  name:"Amendoim Torrado 80g",      category:"Snacks",   costPrice:3.00, sellPrice:8.00,  currentStock:35, minStock:15, unit:"un", active:true },
  { id:"p10", name:"Batata Chips 60g",          category:"Snacks",   costPrice:4.00, sellPrice:10.00, currentStock:8,  minStock:10, unit:"un", active:true },
  { id:"p11", name:"Chocolate ao Leite 25g",    category:"Snacks",   costPrice:3.50, sellPrice:9.00,  currentStock:18, minStock:10, unit:"un", active:true },
  { id:"p12", name:"Mix de Castanhas 40g",      category:"Snacks",   costPrice:5.00, sellPrice:13.00, currentStock:0,  minStock:10, unit:"un", active:false },
];

const FINANCIAL_DATA = [
  { id:"f1", type:"entrada", category:"Hospedagem",  description:"Check-out Suíte 102 - Carlos M.",  value:180, operator:"João Silva",  paymentMethod:"pix"     },
  { id:"f2", type:"entrada", category:"Frigobar",    description:"Consumo Suíte 102 - Bebidas",       value:47,  operator:"João Silva",  paymentMethod:"pix"     },
  { id:"f3", type:"entrada", category:"Hospedagem",  description:"Check-out Suíte 201 - Ana K.",      value:300, operator:"Maria Lima",  paymentMethod:"cartao"  },
  { id:"f4", type:"saida",   category:"Operacional", description:"Compra estoque frigobar",            value:320, operator:"Admin",       paymentMethod:"dinheiro"},
  { id:"f5", type:"entrada", category:"Hospedagem",  description:"Reserva Suíte Imperial",            value:700, operator:"Maria Lima",  paymentMethod:"pix"     },
  { id:"f6", type:"entrada", category:"Hospedagem",  description:"Check-out Suíte 203 - Fernanda L.", value:130, operator:"João Silva",  paymentMethod:"dinheiro"},
];

const NPS_DATA = [
  { id:"n1", suiteId:"s1", score:5, comment:"Lugar incrível, atendimento impecável!", date:new Date(Date.now()-86400000) },
  { id:"n2", suiteId:"s2", score:4, comment:"Muito bom, frigobar com alguns itens faltando.", date:new Date(Date.now()-172800000) },
  { id:"n3", suiteId:"s5", score:5, comment:"A suíte Diamante é simplesmente perfeita.", date:new Date(Date.now()-259200000) },
  { id:"n4", suiteId:"s9", score:3, comment:"O ambiente é lindo mas o check-in demorou.", date:new Date(Date.now()-345600000) },
  { id:"n5", suiteId:"s4", score:5, comment:"Piscina privativa maravilhosa!", date:new Date(Date.now()-432000000) },
];

const REVENUE_DATA = [
  {day:"Seg",v:2840},{day:"Ter",v:3200},{day:"Qua",v:2100},
  {day:"Qui",v:3800},{day:"Sex",v:5200},{day:"Sáb",v:7100},{day:"Dom",v:4900},
];

// ============================================================
// STATUS CONFIG — fiel ao original
// ============================================================
const RES_STATUS = {
  confirmado:      { label:"Confirmado",       color:t.confirmed, bg:t.confirmedBg  },
  pix_pendente:    { label:"PIX Pendente",     color:t.yellow,    bg:t.pixPendBg    },
  cartao_pendente: { label:"Cartão Pendente",  color:t.blue,      bg:t.cardPendBg   },
  aguardando:      { label:"Aguardando Pagto", color:t.red,       bg:t.waitingBg    },
  pendente:        { label:"Pendente",         color:t.pending,   bg:t.pendingBg    },
  cancelado:       { label:"Cancelado",        color:t.cancelled, bg:t.cancelledBg  },
};

const SUITE_STATUS = {
  disponivel:  { label:"Disponível",      color:t.avail,    border:`${t.avail}44`   },
  ocupada:     { label:"Ocupada",         color:t.occupied, border:`${t.occupied}44`},
  suja:        { label:"Aguard. Limpeza", color:t.yellow,   border:`${t.yellow}44`  },
  em_limpeza:  { label:"Em Limpeza",      color:t.cleaning, border:`${t.cleaning}44`},
  manutencao:  { label:"Manutenção",      color:t.maint,    border:`${t.maint}44`   },
};

// ============================================================
// SHARED UI ATOMS
// ============================================================
const Chip = ({ children, color, bg }) => (
  <span style={{
    display:"inline-block", padding:"2px 9px", borderRadius:4, fontSize:11,
    fontWeight:600, letterSpacing:.3,
    color: color || t.textSecondary,
    background: bg || t.bgItem,
    border:`1px solid ${color || t.border}33`,
  }}>{children}</span>
);

const StatusChip = ({ status }) => {
  const cfg = RES_STATUS[status] || RES_STATUS.pendente;
  return <Chip color={cfg.color} bg={cfg.bg}>{cfg.label}</Chip>;
};

const Btn = ({ children, onClick, variant="primary", small=false, disabled=false, style:sx={} }) => {
  const base = { border:"none", borderRadius:5, fontWeight:600, cursor:disabled?"not-allowed":"pointer",
    padding: small ? "5px 12px" : "9px 18px", fontSize: small ? 12 : 13, opacity:disabled?.5:1,
    transition:"filter .15s", ...sx };
  const variants = {
    primary:  { background:t.accent,   color:t.white   },
    ghost:    { background:"transparent", color:t.textSecondary, border:`1px solid ${t.border2}` },
    danger:   { background:t.red,      color:t.white   },
    success:  { background:t.green,    color:t.white   },
    warning:  { background:t.yellow,   color:"#000"    },
  };
  return (
    <button onClick={disabled?undefined:onClick} style={{...base,...variants[variant]}}
      onMouseEnter={e=>!disabled&&(e.currentTarget.style.filter="brightness(1.15)")}
      onMouseLeave={e=>e.currentTarget.style.filter="none"}>
      {children}
    </button>
  );
};

const Input = ({ value, onChange, placeholder, type="text", style:sx={} }) => (
  <input type={type} value={value} onChange={onChange} placeholder={placeholder}
    style={{ width:"100%", background:t.bgItem, border:`1px solid ${t.border2}`,
      borderRadius:5, padding:"8px 11px", color:t.textPrimary, fontSize:13,
      outline:"none", ...sx }}
    onFocus={e=>e.target.style.borderColor=t.accent}
    onBlur={e=>e.target.style.borderColor=t.border2}/>
);

const Select = ({ value, onChange, children, style:sx={} }) => (
  <select value={value} onChange={onChange}
    style={{ width:"100%", background:t.bgItem, border:`1px solid ${t.border2}`,
      borderRadius:5, padding:"8px 11px", color:t.textPrimary, fontSize:13,
      outline:"none", ...sx }}>
    {children}
  </select>
);

const Card = ({ children, style:sx={} }) => (
  <div style={{ background:t.bgCard, border:`1px solid ${t.border}`, borderRadius:8, ...sx }}>
    {children}
  </div>
);

const SectionHeader = ({ title, sub, right }) => (
  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20, flexWrap:"wrap", gap:10 }}>
    <div>
      <h2 style={{ color:t.textPrimary, fontSize:18, fontWeight:700, margin:0 }}>{title}</h2>
      {sub && <p style={{ color:t.textSecondary, fontSize:13, margin:"3px 0 0" }}>{sub}</p>}
    </div>
    {right && <div style={{ display:"flex", gap:8 }}>{right}</div>}
  </div>
);

const Spinner = () => (
  <div style={{ display:"flex", justifyContent:"center", padding:40 }}>
    <div style={{ width:24, height:24, border:`2px solid ${t.border2}`, borderTop:`2px solid ${t.accent}`, borderRadius:"50%", animation:"spin .7s linear infinite" }}/>
  </div>
);

// ============================================================
// TIMER
// ============================================================
function useTimer(since) {
  const [e, setE] = useState(0);
  useEffect(() => {
    if (!since) return;
    const tick = () => setE(Math.floor((Date.now()-new Date(since).getTime())/1000));
    tick(); const id=setInterval(tick,1000); return ()=>clearInterval(id);
  }, [since]);
  const h=String(Math.floor(e/3600)).padStart(2,"0");
  const m=String(Math.floor((e%3600)/60)).padStart(2,"0");
  const s=String(e%60).padStart(2,"0");
  return `${h}:${m}:${s}`;
}

// ============================================================
// MINI BAR CHART — SVG puro
// ============================================================
const BarChart = ({ data }) => {
  const max = Math.max(...data.map(d=>d.v));
  const W=340,H=100,PB=24,PL=8,PR=8;
  const cw=(W-PL-PR)/data.length;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%"}}>
      {data.map((d,i)=>{
        const bh=Math.max(4,(H-PB)*(d.v/max));
        const x=PL+i*cw+cw*.15;
        const y=H-PB-bh;
        return (
          <g key={i}>
            <rect x={x} y={y} width={cw*.7} height={bh} rx={3} fill={t.accent} opacity={.75}/>
            <text x={x+cw*.35} y={H-6} textAnchor="middle" fontSize={9} fill={t.textSecondary}>{d.day}</text>
          </g>
        );
      })}
    </svg>
  );
};

// ============================================================
// KPI CARD
// ============================================================
const KPI = ({ icon, label, value, color }) => (
  <Card style={{ padding:"16px 20px" }}>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
      <span style={{ fontSize:18 }}>{icon}</span>
      <span style={{ color:t.textMuted, fontSize:11, textTransform:"uppercase", letterSpacing:.8 }}>{label}</span>
    </div>
    <p style={{ color:color||t.textPrimary, fontSize:26, fontWeight:700, margin:0 }}>{value}</p>
  </Card>
);

// ============================================================
// LOGIN
// ============================================================
function LoginPage() {
  const { setPage } = useContext(AppCtx);
  const [email, setEmail] = useState("");
  const [pass, setPass]   = useState("");
  const [err, setErr]     = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    if (!email || !pass) { setErr("Preencha email e senha."); return; }
    setLoading(true); await delay(800); setLoading(false); setPage("admin");
  };

  return (
    <div style={{ minHeight:"100vh", background:t.bg, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <G/>
      <div style={{ width:360, padding:"40px 36px", background:t.bgCard, border:`1px solid ${t.border}`, borderRadius:10 }}>
        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ width:48, height:48, background:t.accent, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px", fontSize:22 }}>🏨</div>
          <h1 style={{ color:t.textPrimary, fontSize:18, fontWeight:700, margin:"0 0 4px" }}>Motéis Fortaleza</h1>
          <p style={{ color:t.textSecondary, fontSize:13, margin:0 }}>Painel de gerenciamento de reservas</p>
        </div>

        {err && <p style={{ color:t.red, fontSize:12, marginBottom:14, textAlign:"center" }}>{err}</p>}

        <div style={{ marginBottom:14 }}>
          <label style={{ color:t.textSecondary, fontSize:12, display:"block", marginBottom:5 }}>Email</label>
          <Input value={email} onChange={e=>setEmail(e.target.value)} placeholder="operador@moteis.com.br"/>
        </div>
        <div style={{ marginBottom:20 }}>
          <label style={{ color:t.textSecondary, fontSize:12, display:"block", marginBottom:5 }}>Senha</label>
          <Input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••"/>
        </div>
        <Btn onClick={handle} disabled={loading} style={{ width:"100%" }}>
          {loading ? "⏳ Verificando..." : "Entrar"}
        </Btn>
        <p style={{ color:t.textMuted, fontSize:11, textAlign:"center", marginTop:14 }}>Demo: qualquer email + senha</p>
        <p style={{ color:t.textSecondary, fontSize:11, textAlign:"center", marginTop:6 }}>Rede de Motéis Fortaleza</p>
      </div>
    </div>
  );
}

// ============================================================
// SIDEBAR NAV
// ============================================================
const NAV = [
  { id:"calendario",  label:"Calendário",        icon:"📊" },
  { id:"tabela",      label:"Tabela",             icon:"📋" },
  { id:"relatorios",  label:"Relatórios",         icon:"📊" },
  { id:"__sep1",      sep:true },
  { id:"recepcao",    label:"Mapa de Ocupação",   icon:"🏨", group:"Sistema" },
  { id:"estoque",     label:"Estoque & Frigobar", icon:"🛒" },
  { id:"produtos",    label:"Produtos",           icon:"🍺" },
  { id:"financeiro",  label:"Financeiro",         icon:"💰" },
  { id:"cadastro",    label:"Configurações",      icon:"⚙️" },
  { id:"__sep2",      sep:true },
  { id:"encurtador",  label:"Encurtador de Links",icon:"🔗", group:"Ferramentas" },
  { id:"nps",         label:"Pesquisa NPS",       icon:"📝", badge:"EM BREVE", badgeColor:t.accent },
  { id:"__sep3",      sep:true },
  { id:"governanca",  label:"Governança",         icon:"🧹", group:"Mobile" },
];

function Sidebar({ active, setActive, open, setOpen }) {
  const { setPage } = useContext(AppCtx);
  const W = open ? 220 : 52;

  return (
    <aside style={{ width:W, minWidth:W, background:t.bgCard, borderRight:`1px solid ${t.border}`,
      display:"flex", flexDirection:"column", height:"100vh", position:"sticky", top:0,
      transition:"width .2s", overflow:"hidden", flexShrink:0 }}>

      {/* Logo */}
      <div style={{ padding: open ? "18px 16px" : "18px 10px", borderBottom:`1px solid ${t.border}`,
        display:"flex", alignItems:"center", gap:10, minWidth:220 }}>
        <div style={{ width:32, height:32, background:t.accent, borderRadius:6, display:"flex",
          alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>🏨</div>
        {open && (
          <div>
            <p style={{ color:t.textPrimary, fontWeight:700, fontSize:13, margin:0, lineHeight:1.2 }}>Motéis Fortaleza</p>
            <p style={{ color:t.textSecondary, fontSize:10, margin:0 }}>Painel de reservas</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex:1, overflowY:"auto", padding:"8px 6px" }}>
        {NAV.map((item, i) => {
          if (item.sep) return (
            <div key={i} style={{ height:1, background:t.border, margin:"6px 4px" }}/>
          );
          if (item.group && open) return (
            <p key={i} style={{ color:t.textMuted, fontSize:10, fontWeight:600, letterSpacing:1,
              textTransform:"uppercase", padding:"10px 8px 3px", margin:0 }}>{item.group}</p>
          );
          const isActive = active === item.id;
          return (
            <button key={item.id} onClick={() => setActive(item.id)}
              style={{ display:"flex", alignItems:"center", gap:9, width:"100%", padding: open ? "7px 10px" : "8px 10px",
                borderRadius:5, border:"none", background:isActive ? `${t.accent}22` : "transparent",
                color: isActive ? t.accent : t.textSecondary, textAlign:"left",
                fontSize:13, fontWeight:isActive?600:400, transition:"background .15s",
                justifyContent: open ? "flex-start" : "center" }}
              onMouseEnter={e=>!isActive&&(e.currentTarget.style.background=t.bgHover)}
              onMouseLeave={e=>!isActive&&(e.currentTarget.style.background="transparent")}>
              <span style={{ fontSize:15, flexShrink:0 }}>{item.icon}</span>
              {open && (
                <>
                  <span style={{ whiteSpace:"nowrap", flex:1 }}>{item.label}</span>
                  {item.badge && (
                    <span style={{ background:item.badgeColor||t.accent, color:t.white,
                      borderRadius:3, padding:"1px 5px", fontSize:9, fontWeight:700 }}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
              {isActive && <div style={{ position:"absolute", right:0, width:3, height:20, background:t.accent, borderRadius:"2px 0 0 2px" }}/>}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ borderTop:`1px solid ${t.border}`, padding:"8px 6px" }}>
        <button onClick={() => setOpen(o=>!o)}
          style={{ display:"flex", alignItems:"center", gap:9, width:"100%", padding:"7px 10px",
            borderRadius:5, border:"none", background:"transparent", color:t.textSecondary,
            fontSize:12, cursor:"pointer", justifyContent:open?"flex-start":"center" }}>
          <span>{open ? "◀" : "▶"}</span>
          {open && "Recolher"}
        </button>
        {/* User */}
        <div style={{ display:"flex", alignItems:"center", gap:9, padding:"8px 10px", marginTop:2,
          borderTop:`1px solid ${t.border}` }}>
          <div style={{ width:28, height:28, background:t.accent, borderRadius:"50%", display:"flex",
            alignItems:"center", justifyContent:"center", color:t.white, fontWeight:700, fontSize:13, flexShrink:0 }}>U</div>
          {open && (
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ color:t.textPrimary, fontSize:12, fontWeight:600, margin:0 }}>Operador</p>
              <p style={{ color:t.textSecondary, fontSize:10, margin:0 }}>Acesso limitado</p>
            </div>
          )}
          {open && (
            <button onClick={() => setPage("login")}
              style={{ background:"transparent", border:"none", color:t.textMuted, fontSize:11, cursor:"pointer" }}>
              Sair
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

// ============================================================
// HEADER
// ============================================================
function Header({ title, sub, right }) {
  return (
    <div style={{ padding:"14px 24px", borderBottom:`1px solid ${t.border}`,
      display:"flex", justifyContent:"space-between", alignItems:"center",
      background:t.bgCard, gap:12, flexWrap:"wrap" }}>
      <div>
        <h2 style={{ color:t.textPrimary, fontSize:16, fontWeight:700, margin:0 }}>{title}</h2>
        {sub && <p style={{ color:t.textSecondary, fontSize:12, margin:"2px 0 0" }}>{sub}</p>}
      </div>
      {right && <div style={{ display:"flex", gap:8, alignItems:"center" }}>{right}</div>}
    </div>
  );
}

// ============================================================
// PAGE: CALENDÁRIO (Página principal)
// ============================================================
const MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const WDAYS  = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

function PageCalendario({ reservations, setReservations }) {
  const now = new Date();
  const [cur, setCur]           = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [selected, setSelected] = useState(null);
  const [showNew, setShowNew]   = useState(false);
  const [filterStatus, setFS]   = useState("todos");
  const [filterMotel, setFM]    = useState("todos");
  const [viewMode, setVM]       = useState("month"); // month | agenda
  const [newR, setNewR]         = useState({ guestName:"", suiteId:"s1", type:"pernoite", checkIn:"", checkOut:"", paymentMethod:"pix", motel:"Motel Fortaleza Norte" });

  const year  = cur.getFullYear();
  const month = cur.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const cells = Array.from({length:firstDay+daysInMonth}, (_,i) => i<firstDay ? null : i-firstDay+1);

  const resOnDay = (day) => {
    const target = new Date(year, month, day);
    return reservations.filter(r => {
      const ci = new Date(r.checkIn); ci.setHours(0,0,0,0);
      const co = r.checkOut ? new Date(r.checkOut) : null; if(co) co.setHours(0,0,0,0);
      return ci <= target && (!co || co >= target);
    }).filter(r => (filterStatus === "todos" || r.status === filterStatus) && (filterMotel === "todos" || r.motel === filterMotel));
  };

  const handleSave = () => {
    if (!newR.guestName || !newR.checkIn) return;
    const suite = SUITES_DATA.find(s=>s.id===newR.suiteId);
    setReservations(prev=>[...prev, {
      id:`r${Date.now()}`, suiteId:newR.suiteId,
      suiteName:`${suite?.name} (${suite?.number})`,
      motel:newR.motel, guestName:newR.guestName,
      checkIn:new Date(newR.checkIn), checkOut:newR.checkOut?new Date(newR.checkOut):null,
      type:newR.type, status:"pendente", totalValue:newR.type==="pernoite"?(suite?.pricePernoite||200):(suite?.priceRotativo||120),
      paymentMethod:newR.paymentMethod, paymentStatus:"pendente",
    }]);
    setShowNew(false);
    setNewR({ guestName:"", suiteId:"s1", type:"pernoite", checkIn:"", checkOut:"", paymentMethod:"pix", motel:"Motel Fortaleza Norte" });
  };

  const motels = [...new Set(reservations.map(r=>r.motel))];
  const today = now.getDate();

  const kpis = [
    { icon:"📊", label:"Total", value:reservations.length, color:t.textPrimary },
    { icon:"📅", label:"Reservas hoje", value:resOnDay(today).length, color:t.textPrimary },
    { icon:"⏳", label:"PIX Pendente",   value:reservations.filter(r=>r.status==="pix_pendente").length, color:t.yellow },
    { icon:"💳", label:"Cartão Pendente",value:reservations.filter(r=>r.status==="cartao_pendente").length, color:t.blue },
    { icon:"✅", label:"Confirmados",    value:reservations.filter(r=>r.status==="confirmado").length, color:t.green },
  ];

  return (
    <div className="fade-in" style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      <Header
        title="📅 Calendário"
        sub="Gerencie suas reservas com facilidade"
        right={
          <>
            <Btn variant="ghost" small onClick={()=>setVM(v=>v==="month"?"agenda":"month")}>
              {viewMode==="month"?"📋 Agenda":"📅 Mês"}
            </Btn>
            <Btn variant="ghost" small>📥 Exportar CSV</Btn>
            <Btn small onClick={()=>setShowNew(true)}>+ Nova Reserva</Btn>
          </>
        }
      />

      <div style={{ flex:1, overflowY:"auto", padding:20 }}>
        {/* KPIs */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:10, marginBottom:16 }}>
          {kpis.map(k=><KPI key={k.label} {...k}/>)}
        </div>

        {/* Filters */}
        <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap", alignItems:"center" }}>
          <Select value={filterMotel} onChange={e=>setFM(e.target.value)} style={{ width:"auto", fontSize:12, padding:"6px 10px" }}>
            <option value="todos">Todos os Motéis</option>
            {motels.map(m=><option key={m} value={m}>{m}</option>)}
          </Select>
          <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
            {["todos",...Object.keys(RES_STATUS)].map(s=>{
              const cfg = RES_STATUS[s];
              const active = filterStatus === s;
              return (
                <button key={s} onClick={()=>setFS(s)}
                  style={{ padding:"5px 12px", borderRadius:4, border:`1px solid ${active?(cfg?.color||t.accent):t.border}`,
                    background:active?`${cfg?.color||t.accent}22`:"transparent",
                    color:active?(cfg?.color||t.accent):t.textSecondary, fontSize:11, fontWeight:active?600:400, cursor:"pointer" }}>
                  {s==="todos"?"Todos":cfg?.label}
                </button>
              );
            })}
          </div>
        </div>

        {viewMode==="month" && (
          <Card>
            {/* Month nav */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
              padding:"12px 16px", borderBottom:`1px solid ${t.border}` }}>
              <button onClick={()=>setCur(new Date(year,month-1,1))}
                style={{ background:"transparent", border:"none", color:t.textSecondary, cursor:"pointer", fontSize:18, padding:"2px 8px" }}>←</button>
              <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                <span style={{ color:t.textPrimary, fontWeight:700, fontSize:15 }}>{MONTHS[month]} {year}</span>
                <button onClick={()=>setCur(new Date(now.getFullYear(),now.getMonth(),1))}
                  style={{ background:t.bgItem, border:`1px solid ${t.border}`, borderRadius:4,
                    color:t.textSecondary, fontSize:11, padding:"3px 8px", cursor:"pointer" }}>Hoje</button>
              </div>
              <button onClick={()=>setCur(new Date(year,month+1,1))}
                style={{ background:"transparent", border:"none", color:t.textSecondary, cursor:"pointer", fontSize:18, padding:"2px 8px" }}>→</button>
            </div>
            {/* Weekdays */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", borderBottom:`1px solid ${t.border}` }}>
              {WDAYS.map(w=>(
                <div key={w} style={{ padding:"8px 0", textAlign:"center", color:t.textSecondary, fontSize:11, fontWeight:600 }}>{w}</div>
              ))}
            </div>
            {/* Days */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)" }}>
              {cells.map((day,i)=>{
                if (!day) return <div key={i} style={{ minHeight:72, borderRight:`1px solid ${t.border}22`, borderBottom:`1px solid ${t.border}22` }}/>;
                const dayRes = resOnDay(day);
                const isToday = now.getDate()===day && now.getMonth()===month && now.getFullYear()===year;
                return (
                  <div key={i} onClick={()=>dayRes.length&&setSelected({day,res:dayRes})}
                    className={dayRes.length?"row-hover":""}
                    style={{ minHeight:72, padding:"6px 5px",
                      borderRight:`1px solid ${t.border}22`, borderBottom:`1px solid ${t.border}22`,
                      cursor:dayRes.length?"pointer":"default" }}>
                    <span style={{ fontSize:12, fontWeight:isToday?700:400,
                      color:isToday?t.accent:t.textSecondary, display:"block", marginBottom:3 }}>
                      {isToday?<span style={{background:t.accent,color:"#fff",borderRadius:"50%",padding:"1px 5px"}}>{day}</span>:day}
                    </span>
                    {dayRes.slice(0,2).map(r=>{
                      const cfg=RES_STATUS[r.status]||RES_STATUS.pendente;
                      return (
                        <div key={r.id} style={{ background:cfg.bg, borderLeft:`2px solid ${cfg.color}`,
                          borderRadius:"0 3px 3px 0", padding:"2px 5px", marginBottom:2 }}>
                          <span style={{ color:t.textPrimary, fontSize:10, display:"block",
                            whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                            {r.guestName}
                          </span>
                        </div>
                      );
                    })}
                    {dayRes.length>2&&<span style={{color:t.textMuted,fontSize:9}}>+{dayRes.length-2}</span>}
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {viewMode==="agenda" && (
          <Card>
            <div style={{ padding:"12px 16px", borderBottom:`1px solid ${t.border}` }}>
              <span style={{ color:t.textSecondary, fontSize:12 }}>Próximas reservas</span>
            </div>
            {reservations.filter(r=>new Date(r.checkIn)>=new Date()).slice(0,20).map((r,i)=>{
              const cfg=RES_STATUS[r.status]||RES_STATUS.pendente;
              return (
                <div key={r.id} className="row-hover" style={{ display:"flex", justifyContent:"space-between",
                  alignItems:"center", padding:"12px 16px", borderBottom:`1px solid ${t.border}22`,
                  gap:10, flexWrap:"wrap" }}>
                  <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                    <div style={{ width:3, height:36, background:cfg.color, borderRadius:2, flexShrink:0 }}/>
                    <div>
                      <p style={{ color:t.textPrimary, fontWeight:600, fontSize:13, margin:0 }}>{r.guestName}</p>
                      <p style={{ color:t.textSecondary, fontSize:11, margin:0 }}>{r.suiteName} · {r.motel}</p>
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                    <span style={{ color:t.textSecondary, fontSize:11, fontFamily:"monospace" }}>
                      {new Date(r.checkIn).toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit"})}
                    </span>
                    <StatusChip status={r.status}/>
                    <span style={{ color:t.textSecondary, fontSize:12 }}>R$ {r.totalValue}</span>
                  </div>
                </div>
              );
            })}
          </Card>
        )}
      </div>

      {/* Day modal */}
      {selected && (
        <div style={{ position:"fixed",inset:0,background:"#000000bb",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200 }}>
          <Card style={{ width:400, maxHeight:"80vh", overflow:"auto" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 18px",borderBottom:`1px solid ${t.border}` }}>
              <span style={{ color:t.textPrimary,fontWeight:700,fontSize:15 }}>
                {selected.day}/{month+1}/{year}
              </span>
              <button onClick={()=>setSelected(null)} style={{ background:"transparent",border:"none",color:t.textSecondary,cursor:"pointer",fontSize:18 }}>✕</button>
            </div>
            <div style={{ padding:16 }}>
              {selected.res.map(r=>{
                const cfg=RES_STATUS[r.status]||RES_STATUS.pendente;
                return (
                  <div key={r.id} style={{ background:t.bgItem,borderRadius:6,padding:14,marginBottom:10,borderLeft:`3px solid ${cfg.color}` }}>
                    <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}>
                      <span style={{ color:t.textPrimary,fontWeight:700,fontSize:14 }}>{r.guestName}</span>
                      <StatusChip status={r.status}/>
                    </div>
                    <p style={{ color:t.textSecondary,fontSize:12,margin:"0 0 4px" }}>{r.suiteName} · {r.motel}</p>
                    <p style={{ color:t.textSecondary,fontSize:12,margin:0 }}>R$ {r.totalValue} · {r.paymentMethod} · {r.type}</p>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* New reservation modal */}
      {showNew && (
        <div style={{ position:"fixed",inset:0,background:"#000000bb",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200 }}>
          <Card style={{ width:420 }}>
            <div style={{ padding:"14px 18px",borderBottom:`1px solid ${t.border}`,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <span style={{ color:t.textPrimary,fontWeight:700 }}>+ Nova Reserva</span>
              <button onClick={()=>setShowNew(false)} style={{ background:"transparent",border:"none",color:t.textSecondary,cursor:"pointer",fontSize:18 }}>✕</button>
            </div>
            <div style={{ padding:18, display:"flex",flexDirection:"column",gap:12 }}>
              {[["Hóspede","guestName","text","Nome completo"],["Check-in","checkIn","datetime-local",""],["Check-out","checkOut","datetime-local",""]].map(([lbl,key,type,ph])=>(
                <div key={key}>
                  <label style={{ color:t.textSecondary,fontSize:12,display:"block",marginBottom:5 }}>{lbl}</label>
                  <Input type={type} value={newR[key]} onChange={e=>setNewR(p=>({...p,[key]:e.target.value}))} placeholder={ph}/>
                </div>
              ))}
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
                <div>
                  <label style={{ color:t.textSecondary,fontSize:12,display:"block",marginBottom:5 }}>Suíte</label>
                  <Select value={newR.suiteId} onChange={e=>setNewR(p=>({...p,suiteId:e.target.value}))}>
                    {SUITES_DATA.map(s=><option key={s.id} value={s.id}>{s.name} #{s.number}</option>)}
                  </Select>
                </div>
                <div>
                  <label style={{ color:t.textSecondary,fontSize:12,display:"block",marginBottom:5 }}>Tipo</label>
                  <Select value={newR.type} onChange={e=>setNewR(p=>({...p,type:e.target.value}))}>
                    <option value="rotativo">Rotativo</option>
                    <option value="pernoite">Pernoite</option>
                  </Select>
                </div>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
                <div>
                  <label style={{ color:t.textSecondary,fontSize:12,display:"block",marginBottom:5 }}>Pagamento</label>
                  <Select value={newR.paymentMethod} onChange={e=>setNewR(p=>({...p,paymentMethod:e.target.value}))}>
                    <option value="pix">PIX</option>
                    <option value="cartao">Cartão</option>
                    <option value="dinheiro">Dinheiro</option>
                  </Select>
                </div>
                <div>
                  <label style={{ color:t.textSecondary,fontSize:12,display:"block",marginBottom:5 }}>Motel</label>
                  <Select value={newR.motel} onChange={e=>setNewR(p=>({...p,motel:e.target.value}))}>
                    <option>Motel Fortaleza Norte</option>
                    <option>Motel Fortaleza Sul</option>
                  </Select>
                </div>
              </div>
              <div style={{ display:"flex",gap:8,marginTop:4 }}>
                <Btn variant="ghost" onClick={()=>setShowNew(false)} style={{ flex:1 }}>Cancelar</Btn>
                <Btn onClick={handleSave} style={{ flex:2 }}>Salvar Reserva</Btn>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// ============================================================
// PAGE: TABELA DE RESERVAS
// ============================================================
function PageTabela({ reservations }) {
  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState("todos");
  const [fMotel, setFMotel]   = useState("todos");
  const motels = [...new Set(reservations.map(r=>r.motel))];

  const data = reservations.filter(r=>
    (filter==="todos"||r.status===filter) &&
    (fMotel==="todos"||r.motel===fMotel) &&
    (r.guestName.toLowerCase().includes(search.toLowerCase())||r.suiteName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="fade-in" style={{ display:"flex",flexDirection:"column",height:"100%" }}>
      <Header title="📋 Reservas" sub="Lista completa de agendamentos"
        right={<Btn variant="ghost" small>📥 Exportar CSV</Btn>}/>
      <div style={{ flex:1,overflowY:"auto",padding:20 }}>
        {/* Filters */}
        <div style={{ display:"flex",gap:8,marginBottom:14,flexWrap:"wrap",alignItems:"center" }}>
          <Input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar hóspede ou suíte..." style={{ width:220 }}/>
          <Select value={fMotel} onChange={e=>setFMotel(e.target.value)} style={{ width:"auto",fontSize:12,padding:"6px 10px" }}>
            <option value="todos">Todos os Motéis</option>
            {motels.map(m=><option key={m}>{m}</option>)}
          </Select>
          <div style={{ display:"flex",gap:4,flexWrap:"wrap" }}>
            {["todos",...Object.keys(RES_STATUS)].map(s=>{
              const cfg=RES_STATUS[s];
              const active=filter===s;
              return (
                <button key={s} onClick={()=>setFilter(s)}
                  style={{ padding:"5px 11px",borderRadius:4,border:`1px solid ${active?(cfg?.color||t.accent):t.border}`,
                    background:active?`${cfg?.color||t.accent}22`:"transparent",
                    color:active?(cfg?.color||t.accent):t.textSecondary,fontSize:11,fontWeight:active?600:400,cursor:"pointer" }}>
                  {s==="todos"?"Todos":cfg?.label}
                </button>
              );
            })}
          </div>
        </div>
        <Card style={{ overflow:"hidden" }}>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%",borderCollapse:"collapse",minWidth:700 }}>
              <thead>
                <tr style={{ background:t.bgItem }}>
                  {["Hóspede","Suíte","Motel","Check-in","Check-out","Tipo","Pgto","Status"].map(h=>(
                    <th key={h} style={{ padding:"10px 14px",textAlign:"left",color:t.textSecondary,
                      fontSize:11,fontWeight:600,letterSpacing:.8,textTransform:"uppercase",whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((r,i)=>(
                  <tr key={r.id} className="row-hover" style={{ borderTop:`1px solid ${t.border}22` }}>
                    <td style={{ padding:"11px 14px",color:t.textPrimary,fontWeight:600,fontSize:13 }}>{r.guestName}</td>
                    <td style={{ padding:"11px 14px",color:t.textSecondary,fontSize:12 }}>{r.suiteName}</td>
                    <td style={{ padding:"11px 14px",color:t.textSecondary,fontSize:12 }}>{r.motel}</td>
                    <td style={{ padding:"11px 14px",color:t.textSecondary,fontSize:12,fontFamily:"monospace" }}>
                      {new Date(r.checkIn).toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"})}</td>
                    <td style={{ padding:"11px 14px",color:r.checkOut?t.textSecondary:t.textMuted,fontSize:12,fontFamily:"monospace" }}>
                      {r.checkOut?new Date(r.checkOut).toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}):"-"}</td>
                    <td style={{ padding:"11px 14px" }}><Chip>{r.type}</Chip></td>
                    <td style={{ padding:"11px 14px" }}><Chip>{r.paymentMethod}</Chip></td>
                    <td style={{ padding:"11px 14px" }}><StatusChip status={r.status}/></td>
                  </tr>
                ))}
                {data.length===0&&(
                  <tr><td colSpan={8} style={{ padding:32,textAlign:"center",color:t.textMuted,fontSize:13 }}>
                    Nenhuma reserva encontrada.
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ============================================================
// PAGE: RELATÓRIOS
// ============================================================
function PageRelatorios() {
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

// ============================================================
// PAGE: MAPA DE OCUPAÇÃO
// ============================================================
function OccTimer({ since }) { const t2=useTimer(since); return <span style={{fontFamily:"monospace",color:t.red,fontSize:12,fontWeight:700}}>{t2}</span>; }

function PageRecepcao({ suites, setSuites }) {
  const [checkinT, setCI] = useState(null);
  const [checkoutT, setCO] = useState(null);
  const [filter, setFilter] = useState("todos");
  const [guest, setGuest] = useState("");
  const [type, setType]   = useState("rotativo");
  const [method, setMethod] = useState("pix");

  const doCheckin = () => {
    if (!guest) return;
    setSuites(prev=>prev.map(s=>s.id===checkinT.id?{...s,status:"ocupada",currentGuest:guest,occupiedSince:new Date()}:s));
    setCI(null); setGuest("");
  };
  const doCheckout = () => {
    setSuites(prev=>prev.map(s=>s.id===checkoutT.id?{...s,status:"suja",currentGuest:undefined,occupiedSince:undefined}:s));
    setCO(null);
  };

  const counts = Object.keys(SUITE_STATUS).reduce((a,k)=>({...a,[k]:suites.filter(s=>s.status===k).length}),{});
  const shown  = filter==="todos"?suites:suites.filter(s=>s.status===filter);

  return (
    <div className="fade-in" style={{ display:"flex",flexDirection:"column",height:"100%" }}>
      <Header title="🏨 Mapa de Ocupação" sub="Status em tempo real"
        right={
          <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
            {[["todos","Todos",t.accent],[...Object.entries(SUITE_STATUS)].map(([k,v])=>[k,v.label,v.color])].flat(1).filter(x=>Array.isArray(x)).map(([val,lbl,col])=>(
              <button key={val} onClick={()=>setFilter(val)}
                style={{ padding:"4px 10px",borderRadius:4,border:`1px solid ${filter===val?col:t.border}`,
                  background:filter===val?`${col}22`:"transparent",color:filter===val?col:t.textSecondary,
                  cursor:"pointer",fontSize:11,fontWeight:filter===val?600:400 }}>
                {lbl}
                {val!=="todos"&&<span style={{marginLeft:4,opacity:.7}}>({counts[val]||0})</span>}
              </button>
            ))}
          </div>
        }
      />
      <div style={{ flex:1,overflowY:"auto",padding:20 }}>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))",gap:12 }}>
          {shown.map(suite=>{
            const cfg = SUITE_STATUS[suite.status];
            return (
              <div key={suite.id} style={{ background:t.bgCard,border:`1px solid ${cfg.border}`,borderRadius:8,padding:14 }}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8 }}>
                  <div>
                    <span style={{ color:t.textPrimary,fontWeight:700,fontSize:15 }}>#{suite.number}</span>
                    <p style={{ color:t.textSecondary,fontSize:11,margin:"2px 0 0" }}>{suite.name}</p>
                  </div>
                  <span style={{ color:cfg.color,fontSize:10,fontWeight:600,textTransform:"uppercase" }}>{cfg.label}</span>
                </div>
                <Chip>{suite.category}</Chip>
                <div style={{ marginTop:10 }}>
                  {suite.status==="disponivel" && (
                    <Btn small onClick={()=>setCI(suite)} style={{ width:"100%" }} variant="success">+ Check-in</Btn>
                  )}
                  {suite.status==="ocupada" && (
                    <>
                      <p style={{ color:t.textSecondary,fontSize:11,margin:"0 0 4px" }}>👤 {suite.currentGuest}</p>
                      <OccTimer since={suite.occupiedSince}/>
                      <Btn small onClick={()=>setCO(suite)} style={{ width:"100%",marginTop:6 }} variant="danger">Checkout</Btn>
                    </>
                  )}
                  {suite.status==="suja"       && <p style={{ color:t.yellow,fontSize:11,margin:0 }}>⚠️ Aguardando limpeza</p>}
                  {suite.status==="em_limpeza" && <p style={{ color:t.cleaning,fontSize:11,margin:0 }}>🧹 {suite.camareira}</p>}
                  {suite.status==="manutencao" && <p style={{ color:t.maint,fontSize:11,margin:0 }}>🔧 Em manutenção</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Checkin Modal */}
      {checkinT && (
        <div style={{ position:"fixed",inset:0,background:"#000000bb",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200 }}>
          <Card style={{ width:380 }}>
            <div style={{ padding:"14px 18px",borderBottom:`1px solid ${t.border}` }}>
              <p style={{ color:t.textPrimary,fontWeight:700,margin:0 }}>Check-in — {checkinT.name}</p>
            </div>
            <div style={{ padding:18,display:"flex",flexDirection:"column",gap:12 }}>
              <div><label style={{ color:t.textSecondary,fontSize:12,display:"block",marginBottom:5 }}>Hóspede</label>
                <Input value={guest} onChange={e=>setGuest(e.target.value)} placeholder="Nome completo"/></div>
              <div><label style={{ color:t.textSecondary,fontSize:12,display:"block",marginBottom:5 }}>Tipo</label>
                <Select value={type} onChange={e=>setType(e.target.value)}>
                  <option value="rotativo">Rotativo — R$ {checkinT.priceRotativo}</option>
                  <option value="pernoite">Pernoite — R$ {checkinT.pricePernoite}</option>
                </Select></div>
              <div style={{ display:"flex",gap:8 }}>
                <Btn variant="ghost" onClick={()=>setCI(null)} style={{ flex:1 }}>Cancelar</Btn>
                <Btn onClick={doCheckin} disabled={!guest} style={{ flex:2 }}>Confirmar</Btn>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Checkout Modal */}
      {checkoutT && (
        <div style={{ position:"fixed",inset:0,background:"#000000bb",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200 }}>
          <Card style={{ width:380 }}>
            <div style={{ padding:"14px 18px",borderBottom:`1px solid ${t.border}` }}>
              <p style={{ color:t.textPrimary,fontWeight:700,margin:0 }}>Checkout — {checkoutT.name}</p>
            </div>
            <div style={{ padding:18,display:"flex",flexDirection:"column",gap:12 }}>
              <div style={{ background:t.bgItem,borderRadius:6,padding:12 }}>
                <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}>
                  <span style={{ color:t.textSecondary,fontSize:12 }}>Hóspede</span>
                  <span style={{ color:t.textPrimary,fontWeight:600,fontSize:12 }}>{checkoutT.currentGuest}</span>
                </div>
                <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}>
                  <span style={{ color:t.textSecondary,fontSize:12 }}>Permanência</span>
                  <OccTimer since={checkoutT.occupiedSince}/>
                </div>
                <div style={{ display:"flex",justifyContent:"space-between" }}>
                  <span style={{ color:t.textSecondary,fontSize:12 }}>Valor</span>
                  <span style={{ color:t.green,fontWeight:700,fontSize:13 }}>R$ {checkoutT.priceRotativo}</span>
                </div>
              </div>
              <div><label style={{ color:t.textSecondary,fontSize:12,display:"block",marginBottom:5 }}>Forma de Pagamento</label>
                <Select value={method} onChange={e=>setMethod(e.target.value)}>
                  <option value="pix">PIX</option><option value="cartao">Cartão</option><option value="dinheiro">Dinheiro</option>
                </Select></div>
              <div style={{ display:"flex",gap:8 }}>
                <Btn variant="ghost" onClick={()=>setCO(null)} style={{ flex:1 }}>Cancelar</Btn>
                <Btn variant="success" onClick={doCheckout} style={{ flex:2 }}>Finalizar</Btn>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// ============================================================
// PAGE: ESTOQUE
// ============================================================
function PageEstoque() {
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

// ============================================================
// PAGE: PRODUTOS
// ============================================================
function PageProdutos() {
  const [products, setProducts] = useState(PRODUCTS_DATA.map(p=>({...p})));
  const [tab, setTab]     = useState("lista");
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [cat, setCat]     = useState("todos");
  const [saved, setSaved] = useState(false);
  const empty = { name:"", category:"Bebidas", costPrice:"", sellPrice:"", currentStock:"", minStock:"", unit:"un", active:true };
  const [form, setForm]   = useState(empty);

  const cats = ["todos","Bebidas","Higiene","Snacks","Enxoval"];
  const shown = products.filter(p=>(cat==="todos"||p.category===cat)&&p.name.toLowerCase().includes(search.toLowerCase()));
  const margin = p => p.sellPrice>0?Math.round(((p.sellPrice-p.costPrice)/p.sellPrice)*100):0;

  const save = () => {
    if (!form.name||!form.sellPrice) return;
    const row = {...form,costPrice:+form.costPrice,sellPrice:+form.sellPrice,currentStock:+form.currentStock,minStock:+form.minStock};
    if (editId) setProducts(prev=>prev.map(p=>p.id===editId?{...p,...row}:p));
    else        setProducts(prev=>[...prev,{...row,id:`p${Date.now()}`}]);
    setSaved(true); setTimeout(()=>setSaved(false),2500);
    setTab("lista"); setEditId(null); setForm(empty);
  };

  const edit = p => { setForm({...p,costPrice:String(p.costPrice),sellPrice:String(p.sellPrice),currentStock:String(p.currentStock),minStock:String(p.minStock)}); setEditId(p.id); setTab("form"); };
  const toggle = id => setProducts(prev=>prev.map(p=>p.id===id?{...p,active:!p.active}:p));

  return (
    <div className="fade-in" style={{ display:"flex",flexDirection:"column",height:"100%" }}>
      <Header title="🍺 Produtos & Frigobar" sub="Catálogo com preços e margens"
        right={
          <>
            {saved&&<span style={{color:t.green,fontSize:12}}>✓ Salvo</span>}
            <Btn small onClick={()=>{setForm(empty);setEditId(null);setTab("form");}}>+ Novo Produto</Btn>
          </>
        }/>
      <div style={{ flex:1,overflowY:"auto",padding:20 }}>
        {tab==="lista"&&(
          <>
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
                              <Btn small variant="ghost" onClick={()=>edit(p)}>✏️</Btn>
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
          </>
        )}
        {tab==="form"&&(
          <Card style={{ padding:24,maxWidth:500 }}>
            <h3 style={{ color:t.textPrimary,fontWeight:700,fontSize:15,marginBottom:20 }}>{editId?"✏️ Editar Produto":"+ Novo Produto"}</h3>
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
                <Btn variant="ghost" onClick={()=>setTab("lista")} style={{ flex:1 }}>Cancelar</Btn>
                <Btn onClick={save} style={{ flex:2 }}>{editId?"Salvar Alterações":"Cadastrar"}</Btn>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

// ============================================================
// PAGE: NPS
// ============================================================
function PageNPS() {
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

// ============================================================
// PAGE: CADASTRO / CONFIGURAÇÕES
// ============================================================
function PageCadastro() {
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

// ============================================================
// PAGE: ENCURTADOR
// ============================================================
function PageEncurtador() {
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

// ============================================================
// MODULE: GOVERNANÇA — Mobile First
// ============================================================
function ModuleGovernanca({ suites, setSuites }) {
  const dirty = suites.filter(s=>s.status==="suja"||s.status==="em_limpeza");
  const [active, setActive] = useState(null);
  const [modal, setModal]   = useState(false);
  const [consumed, setConsumed] = useState({});
  const items = ["Cerveja Long Neck","Água Mineral","Refrigerante Lata","Amendoim","Batata Chips","Preservativo CX12","Gel Íntimo","Chocolate"];

  const start = suite => {
    setSuites(prev=>prev.map(s=>s.id===suite.id?{...s,status:"em_limpeza",camareira:"Você"}:s));
    setActive({...suite,startedAt:new Date()});
  };
  const finish = () => {
    setSuites(prev=>prev.map(s=>s.id===active.id?{...s,status:"disponivel",camareira:undefined}:s));
    setActive(null); setModal(false); setConsumed({});
  };

  return (
    <div style={{ minHeight:"100vh",background:t.bg }}>
      <G/>
      <div style={{ background:t.bgCard,padding:"14px 16px",borderBottom:`1px solid ${t.border}`,
        position:"sticky",top:0,zIndex:10,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
        <div>
          <p style={{ color:t.textPrimary,fontWeight:700,fontSize:16,margin:0 }}>🧹 Governança</p>
          <p style={{ color:t.textSecondary,fontSize:11,margin:0 }}>Painel da Camareira</p>
        </div>
        <div style={{ textAlign:"right" }}>
          <p style={{ color:t.accent,fontWeight:700,fontSize:18,margin:0 }}>{dirty.length}</p>
          <p style={{ color:t.textSecondary,fontSize:10,margin:0 }}>pendentes</p>
        </div>
      </div>

      {active&&(
        <div style={{ background:`${t.blue}18`,borderBottom:`2px solid ${t.blue}`,padding:"10px 16px" }}>
          <p style={{ color:t.blue,fontWeight:600,fontSize:13,margin:0 }}>⏳ Em andamento: {active.name} #{active.number}</p>
          <p style={{ color:t.textSecondary,fontSize:11,margin:0 }}>Início: {active.startedAt.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}</p>
        </div>
      )}

      <div style={{ padding:14,display:"flex",flexDirection:"column",gap:10 }}>
        {dirty.length===0?(
          <div style={{ textAlign:"center",padding:"60px 20px" }}>
            <p style={{ fontSize:40,marginBottom:10 }}>✨</p>
            <p style={{ color:t.textPrimary,fontWeight:700,fontSize:17 }}>Tudo limpo!</p>
            <p style={{ color:t.textSecondary,fontSize:13 }}>Nenhuma suíte pendente.</p>
          </div>
        ):dirty.map(suite=>{
          const inProg=suite.status==="em_limpeza";
          const isMe=active?.id===suite.id;
          return (
            <Card key={suite.id} style={{ padding:16,borderLeft:`3px solid ${inProg?t.blue:t.yellow}` }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8 }}>
                <div>
                  <p style={{ color:t.textPrimary,fontWeight:700,fontSize:15,margin:0 }}>{suite.name}</p>
                  <p style={{ color:t.textSecondary,fontSize:12,margin:"2px 0 0" }}>#{suite.number} · {suite.floor}º andar</p>
                </div>
                <Chip color={inProg?t.blue:t.yellow}>{inProg?"Em Limpeza":"Aguardando"}</Chip>
              </div>
              {!inProg&&!active&&(
                <Btn onClick={()=>start(suite)} style={{ width:"100%",padding:"12px 0",fontSize:14 }}>🧹 Iniciar Limpeza</Btn>
              )}
              {isMe&&(
                <Btn variant="success" onClick={()=>setModal(true)} style={{ width:"100%",padding:"12px 0",fontSize:14 }}>✅ Finalizar Limpeza</Btn>
              )}
              {inProg&&!isMe&&(
                <p style={{ color:t.blue,fontSize:12,margin:0 }}>👤 {suite.camareira}</p>
              )}
            </Card>
          );
        })}
      </div>

      {modal&&(
        <div style={{ position:"fixed",inset:0,background:"#000000CC",display:"flex",alignItems:"flex-end",zIndex:100 }}>
          <div style={{ width:"100%",background:t.bgCard,borderRadius:"16px 16px 0 0",padding:20,maxHeight:"80vh",overflowY:"auto",borderTop:`1px solid ${t.border}` }}>
            <h3 style={{ color:t.textPrimary,fontWeight:700,fontSize:16,marginBottom:4 }}>Registrar Consumo</h3>
            <p style={{ color:t.textSecondary,fontSize:12,marginBottom:16 }}>Marque os itens consumidos antes de liberar a suíte.</p>
            <div style={{ display:"flex",flexDirection:"column",gap:8,marginBottom:20 }}>
              {items.map(item=>(
                <div key={item} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",
                  background:t.bgItem,borderRadius:6,padding:"11px 14px" }}>
                  <span style={{ color:t.textPrimary,fontSize:13 }}>{item}</span>
                  <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                    {consumed[item]>0&&<span style={{ color:t.accent,fontWeight:700 }}>×{consumed[item]}</span>}
                    <button onClick={()=>setConsumed(c=>({...c,[item]:(c[item]||0)+1}))}
                      style={{ width:30,height:30,borderRadius:"50%",
                        background:consumed[item]>0?t.accent:"transparent",
                        border:`1px solid ${consumed[item]>0?t.accent:t.border2}`,
                        color:consumed[item]>0?t.white:t.textSecondary,
                        fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700 }}>+</button>
                  </div>
                </div>
              ))}
            </div>
            <Btn variant="success" onClick={finish} style={{ width:"100%",padding:"14px 0",fontSize:15,marginBottom:8 }}>✅ Liberar como Disponível</Btn>
            <Btn variant="ghost" onClick={()=>setModal(false)} style={{ width:"100%",padding:"12px 0" }}>Cancelar</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// ADMIN SHELL
// ============================================================
function AdminShell({ suites, setSuites }) {
  const [page, setPage]   = useState("calendario");
  const [open, setOpen]   = useState(true);
  const [reservations, setReservations] = useState(RESERVATIONS_DATA.map(r=>({...r})));

  if (page === "governanca") {
    return (
      <div>
        <G/>
        <div style={{ position:"fixed",top:10,left:10,zIndex:200 }}>
          <Btn small variant="ghost" onClick={()=>setPage("calendario")}>← Voltar ao painel</Btn>
        </div>
        <ModuleGovernanca suites={suites} setSuites={setSuites}/>
      </div>
    );
  }

  const pages = {
    calendario: <PageCalendario reservations={reservations} setReservations={setReservations}/>,
    tabela:     <PageTabela reservations={reservations}/>,
    relatorios: <PageRelatorios/>,
    recepcao:   <PageRecepcao suites={suites} setSuites={setSuites}/>,
    estoque:    <PageEstoque/>,
    produtos:   <PageProdutos/>,
    financeiro: <PageRelatorios/>,
    cadastro:   <PageCadastro/>,
    nps:        <PageNPS/>,
    encurtador: <PageEncurtador/>,
    governanca: null,
  };

  const dirtyCount = suites.filter(s=>s.status==="suja").length;

  return (
    <div style={{ display:"flex", height:"100vh", background:t.bg, overflow:"hidden" }}>
      <G/>
      <Sidebar active={page} setActive={setPage} open={open} setOpen={setOpen}/>
      <main style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        {pages[page] || <div style={{ padding:40,color:t.textSecondary }}>Em breve</div>}
      </main>
    </div>
  );
}

// ============================================================
// ROOT APP
// ============================================================
export default function App() {
  const [page, setPage] = useState("login");
  const [suites, setSuites] = useState(SUITES_DATA.map(s=>({...s})));
  return (
    <AppCtx.Provider value={{ page, setPage }}>
      {page==="login" && <LoginPage/>}
      {page==="admin" && <AdminShell suites={suites} setSuites={setSuites}/>}
    </AppCtx.Provider>
  );
}
