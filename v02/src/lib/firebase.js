const fb = window.firebase;
if (!fb.apps.length) {
  fb.initializeApp({
    apiKey: "AIzaSyCln4mcb1j46UcmG-sTVb3bUudTQCpdfvY",
    authDomain: "moteisfortaleza-9dadd.firebaseapp.com",
    projectId: "moteisfortaleza-9dadd",
    storageBucket: "moteisfortaleza-9dadd.firebasestorage.app",
    appId: "1:285292896374:web:ef6d3ad37e94313ad3bf57",
  });
}

export const db = fb.firestore();
export const auth = fb.auth();
export const serverTimestamp = fb.firestore.FieldValue.serverTimestamp;

export function collection(ref, path) {
  return ref.collection(path);
}

export function doc(ref, path, ...ids) {
  return ids.length ? ref.collection(path).doc(ids[0]) : ref.doc(path);
}

export async function getDocs(query) {
  const snap = await query.get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getDoc(ref) {
  const snap = await ref.get();
  if (!snap.exists) return null;
  return { id: snap.id, ...snap.data() };
}

export function addDoc(collRef, data) {
  return collRef.add(data);
}

export function setDoc(docRef, data, opts) {
  return opts ? docRef.set(data, opts) : docRef.set(data);
}

export function updateDoc(docRef, data) {
  return docRef.update(data);
}

export function deleteDoc(docRef) {
  return docRef.delete();
}

export function query(collRef, ...constraints) {
  let q = collRef;
  if (constraints.length) q = q.where(constraints[0], constraints[1], constraints[2]);
  return q;
}

export function orderBy(q, field, dir) {
  return q.orderBy(field, dir);
}
