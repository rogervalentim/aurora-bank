/**
 * Firebase Auth/Firestore do backoffice.
 * As credenciais vêm de `NEXT_PUBLIC_FIREBASE_*`; sem elas o app roda no sandbox
 * local (`services/auth.ts` + banco em memória) e este módulo permanece inerte.
 */
import { getApp, getApps, initializeApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';

const env = {
  apiKey: process.env['NEXT_PUBLIC_FIREBASE_API_KEY'] ?? '',
  authDomain: process.env['NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'] ?? '',
  projectId: process.env['NEXT_PUBLIC_FIREBASE_PROJECT_ID'] ?? '',
  storageBucket: process.env['NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'] ?? '',
  messagingSenderId: process.env['NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'] ?? '',
  appId: process.env['NEXT_PUBLIC_FIREBASE_APP_ID'] ?? '',
} as const satisfies FirebaseOptions;

/** `true` quando todas as chaves do Firebase estão configuradas. */
export function isFirebaseConfigured(): boolean {
  return Object.values(env).every((value) => value.length > 0);
}

/** Inicializa (uma vez) e devolve o app Firebase. */
export function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase não configurado: preencha NEXT_PUBLIC_FIREBASE_* no .env.local.');
  }
  return getApps().length > 0 ? getApp() : initializeApp(env);
}
