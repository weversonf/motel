const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));
const d = (offset, h = 22, m = 0) => {
  const x = new Date();
  x.setDate(x.getDate() + offset);
  x.setHours(h, m, 0, 0);
  return x;
};

export const MOTEIS_DATA = [
  { id:"spa",     name:"Spa Urbano",  cor:"#ff44ff", icon:"🏩", token:"spa_sk_live_xxx", suites:["s1","s2","s3","s4","s5"] },
  { id:"assahi",  name:"Assahi",      cor:"#ff8800", icon:"🏢", token:"ass_sk_live_xxx", suites:["s6","s7","s8","s9","s10","s11"] },
  { id:"dragon",  name:"Dragon",      cor:"#ff4444", icon:"🐉", token:"drg_sk_live_xxx", suites:["s12","s13","s14","s15"] },
  { id:"dreams",  name:"Dreams",      cor:"#00ff88", icon:"💚", token:"drm_sk_live_xxx", suites:["s16","s17","s18","s19","s20","s21","s22","s23"] },
];

export const SUITES_DATA = [
  // Spa Urbano
  { id:"s1", motelId:"spa", name:"Suíte Jade",        status:"disponivel", floor:1, priceRotativo:160, pricePernoite:300, capacity:2, descricao:"TV Smart, Ar Split, Secador, Prancha p/ Cabelo e Portão Automático.", qtde:28 },
  { id:"s2", motelId:"spa", name:"Suíte Safira",      status:"ocupada",    floor:1, priceRotativo:180, pricePernoite:335, capacity:2, descricao:"Hidromassagem c/ iluminação Cromoterapia, TV Smart, Ar Split, Secador.", qtde:13, currentGuest:"Carlos M.", occupiedSince:new Date(Date.now()-5400000) },
  { id:"s3", motelId:"spa", name:"Suíte Rubi",        status:"suja",       floor:1, priceRotativo:204, pricePernoite:377, capacity:2, descricao:"Hidromassagem c/ iluminação Cromoterapia, Pole Dance, TV Smart, Ar Split, Secador.", qtde:4 },
  { id:"s4", motelId:"spa", name:"Suíte Esmeralda",   status:"disponivel", floor:2, priceRotativo:441, pricePernoite:791, capacity:2, descricao:"Piscina Aquecida, Pole Dance, Sonorização, Hidromassagem, Poltrona Erótica, TV Smart, Ar Split.", qtde:1 },
  { id:"s5", motelId:"spa", name:"Suíte Diamante",    status:"em_limpeza", floor:2, priceRotativo:552, pricePernoite:986, capacity:4, descricao:"Boate, Duas Camas, Piscina Aquecida com Cascata, Telão, Pole Dance, Hidro, Sauna, TV, Ar Split.", qtde:1, camareira:"Ana Lima" },
  // Assahi
  { id:"s6",  motelId:"assahi", name:"Suíte Tahiti",       status:"ocupada",    floor:1, priceRotativo:180, pricePernoite:335, capacity:2, descricao:"TV Smart, Home, Ar Split, Secador, Prancha p/ Cabelo e Portão Automático.", qtde:48, currentGuest:"Fernanda L.", occupiedSince:new Date(Date.now()-2700000) },
  { id:"s7",  motelId:"assahi", name:"Suíte Bora Bora",    status:"disponivel", floor:1, priceRotativo:208, pricePernoite:384, capacity:2, descricao:"Hidromassagem c/ iluminação Cromoterapia, TV Smart, Poltrona, Ar Split, Secador.", qtde:14 },
  { id:"s8",  motelId:"assahi", name:"Suíte Maui (Cadeirante)", status:"disponivel", floor:1, priceRotativo:240, pricePernoite:440, capacity:2, descricao:"TV Smart, Home, 2 Camas, Ar Split, Secador, Prancha p/ Cabelo e Portão Automático.", qtde:1 },
  { id:"s9",  motelId:"assahi", name:"Suíte Honolulu",     status:"disponivel", floor:2, priceRotativo:268, pricePernoite:489, capacity:2, descricao:"Área de banho, Poltrona, Ofurô com iluminação Cromoterapia, TV Smart, Ar Split, Secador.", qtde:2 },
  { id:"s10", motelId:"assahi", name:"Suíte Kauai",        status:"suja",       floor:2, priceRotativo:281, pricePernoite:511, capacity:2, descricao:"Hidromassagem c/ iluminação Cromoterapia, Pole Dance, Sauna a Vapor, Poltrona Erótica, TV Smart, Ar Split.", qtde:2 },
  { id:"s11", motelId:"assahi", name:"Suíte Fórmula 1",    status:"ocupada",    floor:2, priceRotativo:613, pricePernoite:1092, capacity:4, descricao:"Boate, Duas Camas, Piscina Aquecida, Sonorização, Pole Dance, Hidro, Sauna, Poltrona Erótica, TV Smart, Ar Split.", qtde:1, currentGuest:"Ricardo P.", occupiedSince:new Date(Date.now()-900000) },
  // Dragon
  { id:"s12", motelId:"dragon", name:"Suíte Sonho",        status:"disponivel", floor:1, priceRotativo:193, pricePernoite:357, capacity:2, descricao:'TV 65" Smart, Ar Split, Secador, Prancha p/ Cabelo e Portão Automático.', qtde:28 },
  { id:"s13", motelId:"dragon", name:"Suíte Inspiração",   status:"suja",       floor:1, priceRotativo:259, pricePernoite:473, capacity:2, descricao:'TV 65" Smart, Hidromassagem com iluminação Cromoterapia, Ar Split, Secador.', qtde:10 },
  { id:"s14", motelId:"dragon", name:"Suíte Felicidade",   status:"disponivel", floor:2, priceRotativo:301, pricePernoite:547, capacity:2, descricao:'TV 65" Smart, Hidromassagem com iluminação Cromoterapia, Sauna, Ar Split, Secador.', qtde:8 },
  { id:"s15", motelId:"dragon", name:"Suíte Sucesso",      status:"em_limpeza", floor:2, priceRotativo:552, pricePernoite:986, capacity:4, descricao:'TV 75" Smart, Piscina Aquecida, Poltrona Erótica, Hidro, Pole Dance, Sauna, Alexa, Ar Split, Secador.', qtde:4, camareira:"Maria S." },
  // Dreams
  { id:"s16", motelId:"dreams", name:"Suíte Delirius",      status:"disponivel", floor:1, priceRotativo:127, pricePernoite:242, capacity:2, descricao:"TV, Sistema de DVD, Ar Split, Secador, Prancha para Cabelo e Portão Automático.", qtde:31 },
  { id:"s17", motelId:"dreams", name:"Suíte Romântica",     status:"disponivel", floor:1, priceRotativo:152, pricePernoite:286, capacity:2, descricao:"Hidromassagem com iluminação Cromoterapia, Sala de Jantar, Poltrona, TV, Ar Split, Secador.", qtde:1 },
  { id:"s18", motelId:"dreams", name:"Suíte Sonho",         status:"ocupada",    floor:1, priceRotativo:167, pricePernoite:312, capacity:2, descricao:"TV Smart, Alexa, Poltrona Erótica, Ar Split, Secador, Prancha para Cabelo e Portão Automático.", qtde:7, currentGuest:"Felipe N.", occupiedSince:new Date(Date.now()-5400000) },
  { id:"s19", motelId:"dreams", name:"Suíte Fantasia",      status:"suja",       floor:2, priceRotativo:180, pricePernoite:335, capacity:2, descricao:"Piscina ao Ar Livre, Hidromassagem, Poltrona Erótica, TV Smart, Ar Split, Secador.", qtde:6 },
  { id:"s20", motelId:"dreams", name:"Suíte Sonho Amado",   status:"disponivel", floor:2, priceRotativo:193, pricePernoite:357, capacity:2, descricao:"TV Smart, Alexa, Hidromassagem, Poltrona Erótica, Ar Split, Secador.", qtde:8 },
  { id:"s21", motelId:"dreams", name:"Suíte Sonho Molhado", status:"disponivel", floor:2, priceRotativo:220, pricePernoite:415, capacity:2, descricao:"TV Smart, Piscina ao Ar Livre, Alexa, Hidro, Pole Dance, Sauna, Home Theater, Ar Split, Secador.", qtde:2 },
  { id:"s22", motelId:"dreams", name:"Suite Ceará",         status:"disponivel", floor:2, priceRotativo:220, pricePernoite:415, capacity:2, descricao:"TV Smart, Piscina ao Ar Livre, Alexa, Hidro, Pole Dance, Sauna, Home Theater, Ar Split, Secador.", qtde:1 },
  { id:"s23", motelId:"dreams", name:"Suite Fortaleza",     status:"disponivel", floor:2, priceRotativo:220, pricePernoite:415, capacity:2, descricao:"TV Smart, Piscina ao Ar Livre, Alexa, Hidro, Pole Dance, Sauna, Home Theater, Ar Split, Secador.", qtde:1 },
];

export const RESERVATIONS_DATA = [
  { id:"r1",  suiteId:"s2",  suiteName:"Suíte Safira",      motel:"Spa Urbano",  motelId:"spa",    guestName:"Carlos M.",    cpf:"123.456.789-00", protocolo:"RES-2025-001", reservationDate:d(-2,14), checkIn:d(-1,22), checkOut:d(0,6),    type:"pernoite", status:"confirmado",   totalValue:335, paymentMethod:"pix",     paymentStatus:"pago",       asaasPaid:true  },
  { id:"r2",  suiteId:"s6",  suiteName:"Suíte Tahiti",       motel:"Assahi",      motelId:"assahi", guestName:"Fernanda L.",  cpf:"234.567.890-11", protocolo:"RES-2025-002", reservationDate:d(-1,9),  checkIn:d(0,14),   checkOut:null,    type:"rotativo", status:"check-in",      totalValue:180, paymentMethod:"dinheiro",paymentStatus:"pago",       asaasPaid:true  },
  { id:"r3",  suiteId:"s11", suiteName:"Suíte Fórmula 1",    motel:"Assahi",      motelId:"assahi", guestName:"Ricardo P.",   cpf:"345.678.901-22", protocolo:"RES-2025-003", reservationDate:d(-1,16), checkIn:d(0,16),   checkOut:null,    type:"pernoite", status:"pendente",      totalValue:1092, paymentMethod:"pix",    paymentStatus:"pendente",   asaasPaid:false },
  { id:"r4",  suiteId:"s1",  suiteName:"Suíte Jade",         motel:"Spa Urbano",  motelId:"spa",    guestName:"Paulo & Ana",  cpf:"456.789.012-33", protocolo:"RES-2025-004", reservationDate:d(0,10),  checkIn:d(1,20),   checkOut:d(2,8),  type:"pernoite", status:"pagar-motel",   totalValue:300, paymentMethod:"pix",     paymentStatus:"pendente",   asaasPaid:false },
  { id:"r5",  suiteId:"s4",  suiteName:"Suíte Esmeralda",    motel:"Spa Urbano",  motelId:"spa",    guestName:"Marcos T.",    cpf:"567.890.123-44", protocolo:"RES-2025-005", reservationDate:d(0,11),  checkIn:d(1,22),   checkOut:d(2,6),  type:"pernoite", status:"aguardando",    totalValue:791, paymentMethod:"cartao",  paymentStatus:"pendente",   asaasPaid:false },
  { id:"r6",  suiteId:"s12", suiteName:"Suíte Sonho",        motel:"Dragon",      motelId:"dragon", guestName:"Lúcia M.",     cpf:"678.901.234-55", protocolo:"RES-2025-006", reservationDate:d(1,8),   checkIn:d(2,10),   checkOut:null,    type:"rotativo", status:"pendente",      totalValue:193, paymentMethod:"pix",     paymentStatus:"pendente",   asaasPaid:false },
  { id:"r7",  suiteId:"s5",  suiteName:"Suíte Diamante",     motel:"Spa Urbano",  motelId:"spa",    guestName:"Henrique S.",  cpf:"789.012.345-66", protocolo:"RES-2025-007", reservationDate:d(1,15),  checkIn:d(3,22),   checkOut:d(4,8),  type:"pernoite", status:"aguardando",    totalValue:986, paymentMethod:"cartao",  paymentStatus:"pendente",   asaasPaid:false },
  { id:"r8",  suiteId:"s7",  suiteName:"Suíte Bora Bora",    motel:"Assahi",      motelId:"assahi", guestName:"Roberta K.",   cpf:"890.123.456-77", protocolo:"RES-2025-008", reservationDate:d(-3,10), checkIn:d(-2,20),  checkOut:d(-1,6), type:"pernoite", status:"confirmado",    totalValue:384, paymentMethod:"pix",     paymentStatus:"pago",       asaasPaid:true  },
  { id:"r9",  suiteId:"s18", suiteName:"Suíte Sonho",        motel:"Dreams",      motelId:"dreams", guestName:"Felipe N.",    cpf:"901.234.567-88", protocolo:"RES-2025-009", reservationDate:d(0,7),   checkIn:d(0,18),   checkOut:null,    type:"rotativo", status:"check-in",      totalValue:167, paymentMethod:"dinheiro",paymentStatus:"pago",       asaasPaid:true  },
  { id:"r10", suiteId:"s3",  suiteName:"Suíte Rubi",         motel:"Spa Urbano",  motelId:"spa",    guestName:"Camila R.",    cpf:"012.345.678-99", protocolo:"RES-2025-010", reservationDate:d(2,13),  checkIn:d(4,22),   checkOut:d(5,8),  type:"pernoite", status:"cancelado",     totalValue:377, paymentMethod:"pix",     paymentStatus:"cancelado",  asaasPaid:false },
  { id:"r11", suiteId:"s13", suiteName:"Suíte Inspiração",   motel:"Dragon",      motelId:"dragon", guestName:"Bruno S.",     cpf:"111.222.333-44", protocolo:"RES-2025-011", reservationDate:d(-4,16), checkIn:d(-3,22),  checkOut:d(-2,6), type:"pernoite", status:"confirmado",    totalValue:473, paymentMethod:"cartao",  paymentStatus:"pago",       asaasPaid:true  },
  { id:"r12", suiteId:"s20", suiteName:"Suíte Sonho Amado",  motel:"Dreams",      motelId:"dreams", guestName:"Juliana V.",   cpf:"222.333.444-55", protocolo:"RES-2025-012", reservationDate:d(1,9),   checkIn:d(2,22),   checkOut:d(3,8),  type:"pernoite", status:"aguardando",    totalValue:357, paymentMethod:"cartao", paymentStatus:"pendente",   asaasPaid:false },
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
  { id:"f1", type:"entrada", category:"Hospedagem",  description:"Check-out Suíte Safira - Carlos M.",  value:335, operator:"João Silva",  paymentMethod:"pix"     },
  { id:"f2", type:"entrada", category:"Frigobar",    description:"Consumo Suíte Safira - Bebidas",       value:47,  operator:"João Silva",  paymentMethod:"pix"     },
  { id:"f3", type:"entrada", category:"Hospedagem",  description:"Check-out Suíte Bora Bora - Ana K.",   value:384, operator:"Maria Lima",  paymentMethod:"cartao"  },
  { id:"f4", type:"saida",   category:"Operacional", description:"Compra estoque frigobar",                value:320, operator:"Admin",       paymentMethod:"dinheiro"},
  { id:"f5", type:"entrada", category:"Hospedagem",  description:"Reserva Suíte Fórmula 1",              value:1092,operator:"Maria Lima",  paymentMethod:"pix"     },
  { id:"f6", type:"entrada", category:"Hospedagem",  description:"Check-out Suíte Tahiti - Fernanda L.", value:180, operator:"João Silva",  paymentMethod:"dinheiro"},
];

export const NPS_DATA = [
  { id:"n1", suiteId:"s1", score:5, comment:"Lugar incrível, atendimento impecável!", date:new Date(Date.now()-86400000) },
  { id:"n2", suiteId:"s2", score:4, comment:"Muito bom, frigobar com alguns itens faltando.", date:new Date(Date.now()-172800000) },
  { id:"n3", suiteId:"s5", score:5, comment:"A suíte Diamante é simplesmente perfeita.", date:new Date(Date.now()-259200000) },
  { id:"n4", suiteId:"s11", score:3, comment:"O ambiente é lindo mas o check-in demorou.", date:new Date(Date.now()-345600000) },
  { id:"n5", suiteId:"s4", score:5, comment:"Piscina privativa maravilhosa!", date:new Date(Date.now()-432000000) },
];

export const REVENUE_DATA = [
  {day:"Seg",v:2840},{day:"Ter",v:3200},{day:"Qua",v:2100},
  {day:"Qui",v:3800},{day:"Sex",v:5200},{day:"Sáb",v:7100},{day:"Dom",v:4900},
];

export const USUARIOS_DATA = [
  { id:"u1", name:"João Silva",  email:"joao@moteis.com",  perfil:"perfil_admin",   motelId:"spa",    avatar:"" },
  { id:"u2", name:"Maria Lima",  email:"maria@moteis.com", perfil:"perfil_operador", motelId:"dragon", avatar:"" },
  { id:"u3", name:"Ana Lima",    email:"ana@moteis.com",   perfil:"perfil_atendente",motelId:"dreams", avatar:"" },
];

export const PERFIS_DATA = [
  { id:"perfil_admin",    label:"Administrador", level:3, canSeeAll:true,  canManage:["reservas","suites","usuarios","estoque","relatorios"] },
  { id:"perfil_operador", label:"Operador",       level:2, canSeeAll:false, canManage:["reservas","suites","estoque"] },
  { id:"perfil_atendente",label:"Atendente",      level:1, canSeeAll:false, canManage:["reservas"] },
];

export { delay };
