// Importa las funciones que necesitas del SDK de Firebase
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// La configuración ahora lee las variables de entorno de Vite
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Autenticación
const auth = getAuth(app);

// 🔥 SOLUCIÓN DEFINITIVA: Usar getFirestore() simple (configuración por defecto de Firestore)
// initializeFirestore() con configuraciones custom causa problemas con listeners después de batches/transactions
// getFirestore() usa la configuración estándar que SÍ funciona correctamente
const db = getFirestore(app);

const storage = getStorage(app);

export { db, storage, auth, firebaseConfig };