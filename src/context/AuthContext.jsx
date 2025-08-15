import React, { createContext, useState, useEffect, useContext } from 'react';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore"; // 1. Se importan funciones de Firestore
import { db } from '../firebase/config'; // Se importa la configuración de la base de datos

// 1. Creamos el contexto
const AuthContext = createContext();

// 2. Creamos un hook personalizado para usar el contexto fácilmente
export const useAuth = () => {
    return useContext(AuthContext);
};

// 3. Creamos el proveedor que envolverá nuestra aplicación
export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const auth = getAuth();

    // Función para registrar un nuevo usuario (la usaremos en el panel de admin)
    function signup(email, password) {
        return createUserWithEmailAndPassword(auth, email, password);
    }

    // Función para iniciar sesión
    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    // Función para cerrar sesión
    function logout() {
        setUserData(null);
        return signOut(auth);
    }

    // Función para restablecer la contraseña
    function resetPassword(email) {
        return sendPasswordResetEmail(auth, email);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                // 3. Si hay un usuario, buscamos su perfil en Firestore
                const userDocRef = doc(db, "users", user.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    setUserData(userDocSnap.data()); // Guardamos el perfil completo
                } else {
                    setUserData(null); // El usuario existe en Auth pero no en Firestore
                }
            } else {
                setUserData(null); // No hay usuario, limpiamos el perfil
            }
            setLoading(false);
        });

        return unsubscribe;
    }, [auth]);

    // 4. Pasamos el usuario actual y las funciones de autenticación al resto de la app
    const value = {
        currentUser,
        userData,
        login,
        signup,
        logout,
        resetPassword // Se exporta la nueva función
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};