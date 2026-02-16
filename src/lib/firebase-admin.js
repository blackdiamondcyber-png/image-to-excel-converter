import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

let _adminApp = null;
let _adminAuth = null;
let _adminDb = null;
let _initError = null;
let _initialized = false;

/**
 * Parse the Firebase private key from env, handling both escaped
 * newlines (\\n in .env files) and real newlines (cloud platform UIs).
 */
function parsePrivateKey(raw) {
  if (!raw) return null;
  // If the key contains literal \n sequences, convert to real newlines
  if (raw.includes("\\n")) {
    return raw.replace(/\\n/g, "\n");
  }
  return raw;
}

function ensureInitialized() {
  if (_initialized) return;
  _initialized = true;

  if (getApps().length > 0) {
    _adminApp = getApps()[0];
    _adminAuth = getAuth(_adminApp);
    _adminDb = getFirestore(_adminApp);
    return;
  }

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawKey = process.env.FIREBASE_PRIVATE_KEY;
  const privateKey = parsePrivateKey(rawKey);

  console.log("ADMIN DEBUG: projectId present:", !!projectId, "clientEmail present:", !!clientEmail, "rawKey present:", !!rawKey, "rawKey length:", rawKey?.length, "privateKey starts with BEGIN:", privateKey?.startsWith("-----BEGIN"));

  const missing = [];
  if (!projectId) missing.push("NEXT_PUBLIC_FIREBASE_PROJECT_ID");
  if (!clientEmail) missing.push("FIREBASE_CLIENT_EMAIL");
  if (!privateKey) missing.push("FIREBASE_PRIVATE_KEY");

  if (missing.length > 0) {
    _initError = `Missing env vars: ${missing.join(", ")}`;
    console.warn("Firebase Admin:", _initError);
    return;
  }

  try {
    _adminApp = initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
    _adminAuth = getAuth(_adminApp);
    _adminDb = getFirestore(_adminApp);
    console.log("ADMIN DEBUG: Firebase Admin initialized successfully");
  } catch (err) {
    _initError = err.message;
    console.error("Firebase Admin init failed:", err.message);
  }
}

/** Returns the Auth instance, or null if not configured. */
export function getAdminAuth() {
  ensureInitialized();
  return _adminAuth;
}

/** Returns the Firestore instance, or null if not configured. */
export function getAdminDb() {
  ensureInitialized();
  return _adminDb;
}

/** Returns the initialization error message, if any. */
export function getInitError() {
  ensureInitialized();
  return _initError;
}
