import { getDB, serverTimestamp } from "../lib/firebase";
import { adaptMotelsToApp, adaptReservationsToApp } from "../lib/adapter";
import { MOTEIS_DATA, SUITES_DATA, RESERVATIONS_DATA } from "../data/mock";

let checked = false;
let fbOk = false;

function checkFB() {
  if (checked) return fbOk;
  checked = true;
  try {
    const db = getDB();
    if (db) { fbOk = true; return true; }
  } catch {}
  console.warn("Firebase indisponível, usando dados mock");
  return false;
}

export async function loadMotels() {
  if (!checkFB()) {
    return { moteis: MOTEIS_DATA.map(m => ({ ...m })), suites: SUITES_DATA.map(s => ({ ...s })) };
  }
  try {
    const db = getDB();
    const snap = await Promise.race([
      db.collection("config").doc("motels").get(),
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 5000)),
    ]);
    if (!snap.exists) throw new Error("no config");
    const { moteis, suites } = adaptMotelsToApp(snap.data());
    return { moteis, suites };
  } catch (e) {
    console.warn("Erro ao carregar motéis:", e);
    return { moteis: MOTEIS_DATA.map(m => ({ ...m })), suites: SUITES_DATA.map(s => ({ ...s })) };
  }
}

export async function loadReservations() {
  if (!checkFB()) {
    return RESERVATIONS_DATA.map(r => ({ ...r }));
  }
  try {
    const db = getDB();
    const snap = await Promise.race([
      db.collection("reservas").orderBy("criado_em", "desc").get(),
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 5000)),
    ]);
    return adaptReservationsToApp(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch (e) {
    console.warn("Erro ao carregar reservas:", e);
    return RESERVATIONS_DATA.map(r => ({ ...r }));
  }
}

export async function saveReservation(data) {
  if (!checkFB()) return data;
  try {
    const db = getDB();
    const ref = await db.collection("reservas").add({ ...data, criado_em: serverTimestamp() });
    return { ...data, id: ref.id };
  } catch (e) {
    console.warn("Erro ao salvar reserva:", e);
    return data;
  }
}

export async function updateReservation(id, data) {
  if (!checkFB()) return;
  try {
    const db = getDB();
    await db.collection("reservas").doc(id).update(data);
  } catch (e) { console.warn("Erro ao atualizar reserva:", e); }
}

export async function removeReservation(id) {
  if (!checkFB()) return;
  try {
    const db = getDB();
    await db.collection("reservas").doc(id).delete();
  } catch (e) { console.warn("Erro ao remover reserva:", e); }
}
