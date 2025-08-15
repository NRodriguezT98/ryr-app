import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, deleteUser } from 'firebase/auth';
import { db, auth, firebaseConfig } from '../../firebase/config';
import toast from 'react-hot-toast';

export const useGestionUsuarios = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const usersSnapshot = await getDocs(collection(db, "users"));
            const usersList = usersSnapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id }));
            setUsers(usersList);
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("No se pudo cargar la lista de usuarios.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const crearNuevoUsuario = async (formData, resetForm) => {
        setIsSubmitting(true);
        const { nombres, apellidos, cedula, email, password, role } = formData;

        if (!nombres || !apellidos || !cedula || !email || !password || !role) {
            toast.error("Todos los campos son obligatorios.");
            setIsSubmitting(false);
            return;
        }

        // --- INICIO DE LA CORRECCIÓN: Lógica de app secundaria ---
        const secondaryApp = initializeApp(firebaseConfig, `secondary-app-${Date.now()}`);
        const secondaryAuth = getAuth(secondaryApp);
        // --- FIN DE LA CORRECCIÓN ---

        try {
            const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
            const newUser = userCredential.user;

            const userDocRef = doc(db, "users", newUser.uid);
            await setDoc(userDocRef, {
                nombres,
                apellidos,
                cedula,
                email,
                role,
                uid: newUser.uid
            });

            toast.success(`¡Usuario ${nombres} creado con éxito!`);
            resetForm();
            fetchUsers();
        } catch (error) {
            console.error("Error creating user:", error);
            if (error.code === 'auth/email-already-in-use') {
                toast.error('Este correo electrónico ya está registrado.');
            } else if (error.code === 'auth/weak-password') {
                toast.error('La contraseña debe tener al menos 6 caracteres.');
            } else {
                toast.error('No se pudo crear el usuario.');
            }
        } finally {
            setIsSubmitting(false);
            // Opcional: Eliminar la instancia de la app secundaria si Firebase lo requiere en futuras versiones.
            // await deleteApp(secondaryApp); 
        }
    };

    return { users, isLoading, isSubmitting, crearNuevoUsuario };
};