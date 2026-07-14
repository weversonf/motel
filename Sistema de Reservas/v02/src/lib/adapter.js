export function adaptMotelsToApp(motelsDoc) {
  if (!motelsDoc) return { moteis: [], suites: [] };
  const data = motelsDoc.data || motelsDoc;
  const moteis = [];
  const suites = [];
  const motelNames = Object.keys(data);

  motelNames.forEach((name, idx) => {
    const m = data[name];
    const motelId = `motel_${idx}`;
    moteis.push({
      id: motelId,
      name,
      cor: m.cor || "#d20150",
      icon: m.icone || "🏨",
      token: m.token_asaas || "",
    });

    (m.suites || []).forEach((s, sIdx) => {
      const suiteId = `s_${idx}_${sIdx}`;
      suites.push({
        id: suiteId,
        motelId,
        number: String((m.suites.indexOf(s) + 1)).padStart(3, "0"),
        name: s.nome || `Suíte ${idx + 1}`,
        category: mapCategory(s.preco3 || 0),
        status: "disponivel",
        floor: Math.ceil((sIdx + 1) / 4),
        priceRotativo: s.preco3 || 0,
        pricePernoite: s.preco12 || 0,
        amenities: mapAmenities(s.tags || [], s.descricao || ""),
        capacity: s.qtde ? Math.min(s.qtde, 4) : 2,
      });
    });
  });

  return { moteis, suites };
}

function mapCategory(preco3) {
  if (preco3 >= 400) return "presidential";
  if (preco3 >= 250) return "master";
  if (preco3 >= 180) return "luxo";
  return "standard";
}

function mapAmenities(tags, descricao) {
  const amenities = [];
  const has = (txt) => descricao.toLowerCase().includes(txt) || tags.some(t => t.toLowerCase().includes(txt));
  if (has("tv") || has("smart")) amenities.push("Smart TV");
  if (has("hidro")) amenities.push("Hidro");
  if (has("sauna")) amenities.push("Sauna");
  if (has("piscina")) amenities.push("Piscina");
  if (has("alexa")) amenities.push("Alexa");
  if (has("frigobar")) amenities.push("Frigobar");
  if (has("lareira")) amenities.push("Lareira");
  if (has("ar") || has("split")) amenities.push("Ar-Condicionado");
  if (has("pole") || has("dance")) amenities.push("Pole Dance");
  return amenities;
}

export function adaptReservationsToApp(firebaseDocs) {
  return firebaseDocs.map(doc => ({
    id: doc.id,
    suiteId: doc.suiteId || "",
    suiteName: doc.suiteName || doc.suite || doc.suite_name || "",
    motel: doc.motel || doc.motel_name || "",
    motelId: doc.motelId || "",
    guestName: doc.guestName || doc.cliente || doc.nome || "",
    cpf: doc.cpf || "",
    protocolo: doc.protocolo || doc.id || "",
    reservationDate: toDate(doc.reservationDate || doc.criado_em || doc.data_reserva),
    checkIn: toDate(doc.checkIn || doc.checkin || doc.data_checkin),
    checkOut: doc.checkOut || doc.checkout || doc.data_checkout ? toDate(doc.checkOut || doc.checkout || doc.data_checkout) : null,
    type: doc.type || doc.tipo || "pernoite",
    status: doc.status || "pendente",
    totalValue: doc.totalValue || doc.valor || doc.valor_total || 0,
    paymentMethod: doc.paymentMethod || doc.pagamento || doc.metodo_pagamento || "pix",
    paymentStatus: doc.paymentStatus || doc.status_pagamento || "pendente",
    asaasPaid: doc.asaasPaid || doc.asaas_paid || doc.asaas_pago || false,
  }));
}

function toDate(val) {
  if (!val) return new Date();
  if (val instanceof Date) return val;
  if (val.toDate) return val.toDate();
  return new Date(val);
}
