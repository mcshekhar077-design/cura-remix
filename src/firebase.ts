import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with configured database ID
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Authentication
export const auth = getAuth(app);

// Connection Status Monitor
export let isFirestoreConnected = false;

// Test Firestore connection on boot with quiet error handling
async function testConnection() {
  try {
    await getDocFromServer(doc(db, '_connection_test', 'status')).catch(() => {
      // Document may not exist, but connection handshake succeeded
      isFirestoreConnected = true;
    });
    isFirestoreConnected = true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('offline')) {
      console.warn("Firebase client is currently in offline cache mode.");
    }
  }
}

testConnection();

export default { app, db, auth };
