let _db = null;
let _auth = null;

function getFirebase() {
  const fb = window.firebase;
  if (!fb) return null;
  if (!fb.apps.length) {
    fb.initializeApp({
      apiKey: "AIzaSyCln4mcb1j46UcmG-sTVb3bUudTQCpdfvY",
      authDomain: "moteisfortaleza-9dadd.firebaseapp.com",
      projectId: "moteisfortaleza-9dadd",
      storageBucket: "moteisfortaleza-9dadd.firebasestorage.app",
      appId: "1:285292896374:web:ef6d3ad37e94313ad3bf57",
    });
  }
  if (!_db) _db = fb.firestore();
  if (!_auth) _auth = fb.auth();
  return { db: _db, auth: _auth };
}

export function getDB() {
  const fb = getFirebase();
  return fb ? fb.db : null;
}

export function getAuth() {
  const fb = getFirebase();
  return fb ? fb.auth : null;
}

export function serverTimestamp() {
  const fb = window.firebase;
  return fb ? fb.firestore.FieldValue.serverTimestamp() : null;
}
