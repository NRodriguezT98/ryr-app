// Importa las funciones que necesitas del SDK de Firebase
import { initializeApp } from "firebase/app";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
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

// 2. Se crea la instancia de autenticación
const auth = getAuth(app);

// Se crea la instancia de la base de datos
// 🔥 OPTIMIZACIÓN: Usando initializeFirestore con persistencia moderna
// Beneficio: Queries instantáneas cuando datos ya fueron consultados
// Funciona offline: NO (solo cache para velocidad)
// Soporte multi-tab: SÍ (sincronización automática entre pestañas)
const db = initializeFirestore(app, {
    localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
    }),
});

const storage = getStorage(app);

export { db, storage, auth, firebaseConfig };