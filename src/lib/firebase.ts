import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAdku2nLF8TmunJF83wresfvZmTQdLeijI",
  authDomain: "gen-lang-client-0121446000.firebaseapp.com",
  projectId: "gen-lang-client-0121446000",
  storageBucket: "gen-lang-client-0121446000.firebasestorage.app",
  messagingSenderId: "700798801107",
  appId: "1:700798801107:web:c4ba80e4e2a2c8c8de3026"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Authentication
const auth = getAuth(app);

// Initialize Firestore with specific custom database ID
const dbId = "ai-studio-tajliftmanagemen-d5205c36-0a1b-427c-bb44-ea1b2a359e3b";
const db = getFirestore(app, dbId);

// Enable IndexedDb Persistence immediately to avoid "Firestore has already been started"
enableIndexedDbPersistence(db).catch((e) => {
  if (e.code !== "failed-precondition") {
    console.warn("Firestore persistence could not be enabled:", e);
  }
});

export { app, auth, db };
