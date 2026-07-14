import { MOTEIS_DATA, SUITES_DATA, RESERVATIONS_DATA } from "../data/mock";

let fbAvailable = null;

async function tryGetFirebase() {
  if (fbAvailable !== null) return fbAvailable;
  try {
    const { db, getDoc, doc } = await import("../lib/firebase");
    const result = await Promise.race([
      getDoc(doc(db, "config", "motels")),
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 5000)),
    ]);
    fbAvailable = true;
  } catch {
    console.warn("Firebase indisponível, usando dados mock");
    fbAvailable = false;
  }
  return fbAvailable;
}

export async function loadMotels() {
  if (!(await tryGetFirebase())) {
    return { moteis: MOTEIS_DATA.map(m => ({ ...m })), suites: SUITES_DATA.map(s => ({ ...s })) };
  }
  try {
    const { db, getDoc, doc } = await import("../lib/firebase");
    const { adaptMotelsToApp } = await import("../lib/adapter");
    const snap = await getDoc(doc(db, "config", "motels"));
    const { moteis, suites } = adaptMotelsToApp(snap);
    return { moteis, suites };
  } catch (e) {
    console.warn("Erro ao carregar motéis:", e);
    return { moteis: MOTEIS_DATA.map(m => ({ ...m })), suites: SUITES_DATA.map(s => ({ ...s })) };
  }
}

export async function loadReservations() {
  if (!(await tryGetFirebase())) {
    return RESERVATIONS_DATA.map(r => ({ ...r }));
  }
  try {
    const { db, collection, getDocs, query, orderBy } = await import("../lib/firebase");
    const { adaptReservationsToApp } = await import("../lib/adapter");
    const q = orderBy(query(collection(db, "reservas")), "criado_em", "desc");
    const docs = await getDocs(q);
    return adaptReservationsToApp(docs);
  } catch (e) {
    console.warn("Erro ao carregar reservas:", e);
    return RESERVATIONS_DATA.map(r => ({ ...r }));
  }
}

export async function saveReservation(data) {
  if (!(await tryGetFirebase())) return data;
  try {
    const { db, collection, addDoc, serverTimestamp } = await import("../lib/firebase");
    const ref = await addDoc(collection(db, "reservas"), { ...data, criado_em: serverTimestamp });
    return { ...data, id: ref.id };
  } catch (e) {
    console.warn("Erro ao salvar reserva:", e);
    return data;
  }
}

export async function updateReservation(id, data) {
  if (!(await tryGetFirebase())) return;
  try {
    const { db, doc, updateDoc } = await import("../lib/firebase");
    await updateDoc(doc(db, "reservas", id), data);
  } catch (e) {
    console.warn("Erro ao atualizar reserva:", e);
  }
}

export async function removeReservation(id) {
  if (!(await tryGetFirebase())) return;
  try {
    const { db, doc, deleteDoc } = await import("../lib/firebase");
    await deleteDoc(doc(db, "reservas", id));
  } catch (e) {
    console.warn("Erro ao remover reserva:", e);
  }
}

export async function saveMotels(data) {
  if (!(await tryGetFirebase())) return;
  try {
    const { db, doc, setDoc } = await import("../lib/firebase");
    await setDoc(doc(db, "config", "motels"), data);
  } catch (e) {
    console.warn("Erro ao salvar motéis:", e);
  }
}

export async function loginFirebase(email, password) {
  if (!(await tryGetFirebase())) return false;
  try {
    const { auth } = await import("../lib/firebase");
    await auth.signInWithEmailAndPassword(email, password);
    return true;
  } catch (e) {
    console.warn("Erro de login:", e.message);
    return false;
  }
}
