import React, { createContext, useState, useEffect, useContext } from 'react';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from "firebase/auth"; // Se añade sendPasswordResetEmail

// 1. Creamos el contexto
const AuthContext = createContext();

// 2. Creamos un hook personalizado para usar el contexto fácilmente
export const useAuth = () => {
    return useContext(AuthContext);
};

// 3. Creamos el proveedor que envolverá nuestra aplicación
export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
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
        return signOut(auth);
    }

    // Función para restablecer la contraseña
    function resetPassword(email) {
        return sendPasswordResetEmail(auth, email);
    }

    // Este es el "oyente" de Firebase. Se ejecuta una vez al cargar la app
    // y cada vez que el estado de autenticación cambia.
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, user => {
            setCurrentUser(user);
            setLoading(false); // Dejamos de cargar una vez que sabemos si hay un usuario o no
        });

        return unsubscribe; // Se limpia el oyente cuando el componente se desmonta
    }, [auth]);

    // 4. Pasamos el usuario actual y las funciones de autenticación al resto de la app
    const value = {
        currentUser,
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