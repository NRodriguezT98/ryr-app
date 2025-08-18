import React, { createContext, useState, useEffect, useContext } from 'react';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from '../firebase/config';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [userPermissions, setUserPermissions] = useState(null); // Nuevo estado para los permisos
    const [loading, setLoading] = useState(true);
    const auth = getAuth();

    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    function logout() {
        setUserData(null);
        setUserPermissions(null); // Limpiar permisos al salir
        return signOut(auth);
    }

    function resetPassword(email) {
        return sendPasswordResetEmail(auth, email);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                // 1. Buscamos el perfil del usuario en Firestore
                const userDocRef = doc(db, "users", user.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    const fetchedUserData = userDocSnap.data();
                    setUserData(fetchedUserData);

                    // 2. Si el usuario tiene un rol, buscamos sus permisos
                    if (fetchedUserData.role) {
                        const roleDocRef = doc(db, "roles", fetchedUserData.role);
                        const roleDocSnap = await getDoc(roleDocRef);
                        if (roleDocSnap.exists()) {
                            setUserPermissions(roleDocSnap.data().permissions);
                        } else {
                            setUserPermissions(null); // El rol no existe en la DB
                        }
                    } else {
                        setUserPermissions(null); // El usuario no tiene rol asignado
                    }
                } else {
                    setUserData(null);
                    setUserPermissions(null);
                }
            } else {
                setUserData(null);
                setUserPermissions(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, [auth]);

    const value = {
        currentUser,
        userData,
        userPermissions, // 3. Exportamos los permisos al resto de la app
        login,
        logout,
        resetPassword
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};