import { db, collection, getDocs, getDoc, doc, setDoc, updateDoc, deleteDoc, addDoc, query, orderBy, serverTimestamp } from "../lib/firebase";
import { adaptMotelsToApp, adaptReservationsToApp } from "../lib/adapter";
import { MOTEIS_DATA, SUITES_DATA, RESERVATIONS_DATA } from "../data/mock";

let fbAvailable = null;

export async function checkFirebase() {
  if (fbAvailable !== null) return fbAvailable;
  try {
    await getDoc(doc(db, "config", "motels"));
    fbAvailable = true;
  } catch {
    console.warn("Firebase indisponível, usando dados mock");
    fbAvailable = false;
  }
  return fbAvailable;
}

export async function loadMotels(admin) {
  if (!(await checkFirebase())) {
    return { moteis: MOTEIS_DATA.map(m => ({ ...m })), suites: SUITES_DATA.map(s => ({ ...s })) };
  }
  try {
    const snap = await getDoc(doc(db, "config", "motels"));
    const { moteis, suites } = adaptMotelsToApp(snap);
    return { moteis, suites };
  } catch (e) {
    console.warn("Erro ao carregar motéis:", e);
    return { moteis: MOTEIS_DATA.map(m => ({ ...m })), suites: SUITES_DATA.map(s => ({ ...s })) };
  }
}

export async function loadReservations() {
  if (!(await checkFirebase())) {
    return RESERVATIONS_DATA.map(r => ({ ...r }));
  }
  try {
    const q = orderBy(query(collection(db, "reservas")), "criado_em", "desc");
    const docs = await getDocs(q);
    return adaptReservationsToApp(docs);
  } catch (e) {
    console.warn("Erro ao carregar reservas:", e);
    return RESERVATIONS_DATA.map(r => ({ ...r }));
  }
}

export async function saveReservation(data) {
  if (!(await checkFirebase())) return data;
  try {
    const ref = await addDoc(collection(db, "reservas"), {
      ...data,
      criado_em: serverTimestamp,
    });
    return { ...data, id: ref.id };
  } catch (e) {
    console.warn("Erro ao salvar reserva:", e);
    return data;
  }
}

export async function updateReservation(id, data) {
  if (!(await checkFirebase())) return;
  try {
    await updateDoc(doc(db, "reservas", id), data);
  } catch (e) {
    console.warn("Erro ao atualizar reserva:", e);
  }
}

export async function removeReservation(id) {
  if (!(await checkFirebase())) return;
  try {
    await deleteDoc(doc(db, "reservas", id));
  } catch (e) {
    console.warn("Erro ao remover reserva:", e);
  }
}

export async function saveMotels(data) {
  if (!(await checkFirebase())) return;
  try {
    await setDoc(doc(db, "config", "motels"), data);
  } catch (e) {
    console.warn("Erro ao salvar motéis:", e);
  }
}

export async function loginFirebase(email, password) {
  if (!(await checkFirebase())) return false;
  try {
    const { auth } = await import("../lib/firebase");
    await auth.signInWithEmailAndPassword(email, password);
    return true;
  } catch (e) {
    console.warn("Erro de login:", e.message);
    return false;
  }
}
