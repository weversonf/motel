const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));
const d = (offset: number, h = 22, m = 0): Date => {
  const x = new Date();
  x.setDate(x.getDate() + offset);
  x.setHours(h, m, 0, 0);
  return x;
};

export const SUITES_DATA = [
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

export const RESERVATIONS_DATA = [
  { id:"r1",  motelId:"motel1", suiteId:"s2",  suiteName:"Suíte Rubi (102)",      guestName:"Carlos M.",    cpf:"123.456.789-00", protocolo:"RES-2025-001", reservationDate:d(-2,14), checkIn:d(-1,22), checkOut:d(0,6),  type:"pernoite", status:"confirmado", totalValue:300, paymentMethod:"pix",     paymentStatus:"pago"    },
  { id:"r2",  motelId:"motel1", suiteId:"s6",  suiteName:"Suíte Âmbar (203)",     guestName:"Fernanda L.",  cpf:"234.567.890-11", protocolo:"RES-2025-002", reservationDate:d(-1,9),  checkIn:d(0,14),  checkOut:null,    type:"rotativo", status:"confirmado", totalValue:130, paymentMethod:"dinheiro",paymentStatus:"pago"    },
  { id:"r3",  motelId:"motel3", suiteId:"s9",  suiteName:"Suíte Imperial (302)",  guestName:"Ricardo P.",   cpf:"345.678.901-22", protocolo:"RES-2025-003", reservationDate:d(-1,16), checkIn:d(0,16),  checkOut:null,    type:"pernoite", status:"pix_pendente",totalValue:700, paymentMethod:"pix",    paymentStatus:"pendente"},
  { id:"r4",  motelId:"motel1", suiteId:"s1",  suiteName:"Suíte Esmeralda (101)", guestName:"Paulo & Ana",  cpf:"456.789.012-33", protocolo:"RES-2025-004", reservationDate:d(0,10),  checkIn:d(1,20),  checkOut:d(2,8),  type:"pernoite", status:"pix_pendente",totalValue:200, paymentMethod:"pix",    paymentStatus:"pendente"},
  { id:"r5",  motelId:"motel2", suiteId:"s4",  suiteName:"Suíte Ônix (201)",      guestName:"Marcos T.",    cpf:"567.890.123-44", protocolo:"RES-2025-005", reservationDate:d(0,11),  checkIn:d(1,22),  checkOut:d(2,6),  type:"pernoite", status:"cartao_pendente",totalValue:300, paymentMethod:"cartao",paymentStatus:"pendente"},
  { id:"r6",  motelId:"motel2", suiteId:"s8",  suiteName:"Suíte Opala (301)",     guestName:"Lúcia M.",     cpf:"678.901.234-55", protocolo:"RES-2025-006", reservationDate:d(1,8),   checkIn:d(2,10),  checkOut:null,    type:"rotativo", status:"pendente",   totalValue:250, paymentMethod:"pix",     paymentStatus:"pendente"},
  { id:"r7",  motelId:"motel2", suiteId:"s5",  suiteName:"Suíte Diamante (202)",  guestName:"Henrique S.",  cpf:"789.012.345-66", protocolo:"RES-2025-007", reservationDate:d(1,15),  checkIn:d(3,22),  checkOut:d(4,8),  type:"pernoite", status:"aguardando",  totalValue:450, paymentMethod:"cartao",  paymentStatus:"pendente"},
  { id:"r8",  motelId:"motel1", suiteId:"s7",  suiteName:"Suíte Pérola (204)",    guestName:"Roberta K.",   cpf:"890.123.456-77", protocolo:"RES-2025-008", reservationDate:d(-3,10), checkIn:d(-2,20), checkOut:d(-1,6), type:"pernoite", status:"confirmado",  totalValue:300, paymentMethod:"pix",     paymentStatus:"pago"    },
  { id:"r9",  motelId:"motel4", suiteId:"s11", suiteName:"Suíte Aurora (304)",    guestName:"Felipe N.",    cpf:"901.234.567-88", protocolo:"RES-2025-009", reservationDate:d(0,7),   checkIn:d(0,18),  checkOut:null,    type:"rotativo", status:"confirmado",  totalValue:130, paymentMethod:"dinheiro",paymentStatus:"pago"    },
  { id:"r10", motelId:"motel1", suiteId:"s3",  suiteName:"Suíte Safira (103)",    guestName:"Camila R.",    cpf:"012.345.678-99", protocolo:"RES-2025-010", reservationDate:d(2,13),  checkIn:d(4,22),  checkOut:d(5,8),  type:"pernoite", status:"cancelado",   totalValue:200, paymentMethod:"pix",     paymentStatus:"cancelado"},
  { id:"r11", motelId:"motel3", suiteId:"s10", suiteName:"Suíte Granada (303)",   guestName:"Bruno S.",     cpf:"111.222.333-44", protocolo:"RES-2025-011", reservationDate:d(-4,16), checkIn:d(-3,22), checkOut:d(-2,6), type:"pernoite", status:"confirmado",  totalValue:300, paymentMethod:"cartao",  paymentStatus:"pago"    },
  { id:"r12", motelId:"motel4", suiteId:"s12", suiteName:"Suíte Noir (305)",      guestName:"Juliana V.",   cpf:"222.333.444-55", protocolo:"RES-2025-012", reservationDate:d(1,9),   checkIn:d(2,22),  checkOut:d(3,8),  type:"pernoite", status:"cartao_pendente",totalValue:450,paymentMethod:"cartao", paymentStatus:"pendente"},
];

export const PRODUCTS_DATA = [
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

export const FINANCIAL_DATA = [
  { id:"f1", type:"entrada", category:"Hospedagem",  description:"Check-out Suíte 102 - Carlos M.",  value:180, operator:"João Silva",  paymentMethod:"pix"     },
  { id:"f2", type:"entrada", category:"Frigobar",    description:"Consumo Suíte 102 - Bebidas",       value:47,  operator:"João Silva",  paymentMethod:"pix"     },
  { id:"f3", type:"entrada", category:"Hospedagem",  description:"Check-out Suíte 201 - Ana K.",      value:300, operator:"Maria Lima",  paymentMethod:"cartao"  },
  { id:"f4", type:"saida",   category:"Operacional", description:"Compra estoque frigobar",            value:320, operator:"Admin",       paymentMethod:"dinheiro"},
  { id:"f5", type:"entrada", category:"Hospedagem",  description:"Reserva Suíte Imperial",            value:700, operator:"Maria Lima",  paymentMethod:"pix"     },
  { id:"f6", type:"entrada", category:"Hospedagem",  description:"Check-out Suíte 203 - Fernanda L.", value:130, operator:"João Silva",  paymentMethod:"dinheiro"},
];

export const NPS_DATA = [
  { id:"n1", motelId:"motel1", suiteId:"s1", score:5, comment:"Lugar incrível, atendimento impecável!", date:new Date(Date.now()-86400000) },
  { id:"n2", motelId:"motel1", suiteId:"s2", score:4, comment:"Muito bom, frigobar com alguns itens faltando.", date:new Date(Date.now()-172800000) },
  { id:"n3", motelId:"motel2", suiteId:"s5", score:5, comment:"A suíte Diamante é simplesmente perfeita.", date:new Date(Date.now()-259200000) },
  { id:"n4", motelId:"motel3", suiteId:"s9", score:3, comment:"O ambiente é lindo mas o check-in demorou.", date:new Date(Date.now()-345600000) },
  { id:"n5", motelId:"motel1", suiteId:"s4", score:5, comment:"Piscina privativa maravilhosa!", date:new Date(Date.now()-432000000) },
];

export const REVENUE_DATA = [
  {day:"Seg",v:2840},{day:"Ter",v:3200},{day:"Qua",v:2100},
  {day:"Qui",v:3800},{day:"Sex",v:5200},{day:"Sáb",v:7100},{day:"Dom",v:4900},
];

export const MOTEIS_DATA = [
  { id:"motel1", name:"Spa Urbano",     slug:"spa-urbano",  suites:["s1","s2","s3","s4"] },
  { id:"motel2", name:"Assahi Motel",   slug:"assahi",      suites:["s5","s6","s7","s8"] },
  { id:"motel3", name:"Dragon Motel",   slug:"dragon",      suites:["s9","s10"] },
  { id:"motel4", name:"Dreams Motel",   slug:"dreams",      suites:["s11","s12"] },
];

export const PERFIS_DATA = [
  { id:"perfil_adm",     name:"Adm Master",   label:"Adm Master",   level:100, canSeeAll:true,  canManage:["motel","user","financeiro"] },
  { id:"perfil_financeiro", name:"Financeiro", label:"Financeiro",  level:80,  canSeeAll:true,  canManage:["financeiro"] },
  { id:"perfil_atendente",  name:"Atendente",  label:"Atendente / Recepção", level:50, canSeeAll:false, canManage:["recepcao","reserva"] },
  { id:"perfil_governanca", name:"Governança", label:"Governança",  level:30,  canSeeAll:false, canManage:["limpeza"] },
];

export const USUARIOS_DATA = [
  { id:"u1", name:"Admin Master",   email:"admin@moteis.com",    perfil:"perfil_adm",        motelId:"todos",   avatar:"A" },
  { id:"u2", name:"João Silva",     email:"joao@urbano.com",     perfil:"perfil_atendente",  motelId:"motel1",  avatar:"J" },
  { id:"u3", name:"Maria Lima",     email:"maria@assahi.com",    perfil:"perfil_atendente",  motelId:"motel2",  avatar:"M" },
  { id:"u4", name:"Ana Costa",      email:"ana@dragon.com",      perfil:"perfil_atendente",  motelId:"motel3",  avatar:"A" },
  { id:"u5", name:"Carlos Finanças",email:"carlos@moteis.com",   perfil:"perfil_financeiro", motelId:"todos",   avatar:"C" },
  { id:"u6", name:"Pedro Limpeza",  email:"pedro@urbano.com",    perfil:"perfil_governanca", motelId:"motel1",  avatar:"P" },
];

export const PERMISSOES_POR_PAGINA = {
  dashboard:    ["perfil_adm","perfil_financeiro","perfil_atendente","perfil_governanca"],
  calendario:   ["perfil_adm","perfil_atendente"],
  tabela:       ["perfil_adm","perfil_atendente"],
  relatorios:   ["perfil_adm","perfil_financeiro"],
  recepcao:     ["perfil_adm","perfil_atendente"],
  estoque:      ["perfil_adm","perfil_atendente"],
  produtos:     ["perfil_adm","perfil_atendente"],
  financeiro:   ["perfil_adm","perfil_financeiro"],
  cadastro:     ["perfil_adm","perfil_financeiro"],
  encurtador:   ["perfil_adm"],
  nps:          ["perfil_adm","perfil_atendente"],
  governanca:   ["perfil_adm","perfil_governanca"],
  acesso:       ["perfil_adm"],
};

export { delay };
