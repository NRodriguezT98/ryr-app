// Importa las funciones que necesitas del SDK de Firebase
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Reemplaza lo siguiente con la configuración de tu propio proyecto de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDG4HIAQRcbhf8VFzf1A3G2pdHULsW8lPI",
    authDomain: "ryr-constructora-app.firebaseapp.com",
    projectId: "ryr-constructora-app",
    storageBucket: "ryr-constructora-app.firebasestorage.app",
    messagingSenderId: "1061579478680",
    appId: "1:1061579478680:web:2709e19b6eb7002b94a2ed"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Exporta los servicios que vamos a usar en nuestra aplicación
export const db = getFirestore(app);
export const storage = getStorage(app);