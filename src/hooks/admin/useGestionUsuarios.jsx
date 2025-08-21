import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, deleteUser } from 'firebase/auth';
import { db, auth, firebaseConfig } from '../../firebase/config';
import toast from 'react-hot-toast';

export const useGestionUsuarios = () => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [userToEdit, setUserToEdit] = useState(null);

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            // Cargar usuarios
            const usersSnapshot = await getDocs(collection(db, "users"));
            const usersList = usersSnapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id }));
            setUsers(usersList);

            // Cargar roles desde Firestore
            const rolesSnapshot = await getDocs(collection(db, "roles"));
            const rolesList = rolesSnapshot.docs.map(doc => ({ value: doc.id, label: doc.data().nombre }));
            setRoles(rolesList);

        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("No se pudo cargar la información de administración.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const crearNuevoUsuario = async (formData) => {
        setIsSubmitting(true);
        const { nombres, apellidos, cedula, email, password, role } = formData;

        const secondaryApp = initializeApp(firebaseConfig, `secondary-app-${Date.now()}`);
        const secondaryAuth = getAuth(secondaryApp);

        try {
            const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
            const newUser = userCredential.user;

            const userDocRef = doc(db, "users", newUser.uid);
            await setDoc(userDocRef, {
                nombres, apellidos, cedula, email, role, uid: newUser.uid
            });

            toast.success(`¡Usuario ${nombres} creado con éxito!`);
            fetchUsers(); // Refresca tanto usuarios como roles
            return true; // Indica éxito
        } catch (error) {
            console.error("Error creating user:", error);
            if (error.code === 'auth/email-already-in-use') {
                toast.error('Este correo electrónico ya está registrado.');
            } else if (error.code === 'auth/weak-password') {
                toast.error('La contraseña debe tener al menos 6 caracteres.');
            } else {
                toast.error('No se pudo crear el usuario.');
            }
            return false; // Indica fallo
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateUser = async (uid, data, setErrors) => {
        const errors = validateUsuario({ ...data, email: 'valid@email.com' });
        setIsSubmitting(true);
        try {
            const userDocRef = doc(db, "users", uid);
            await updateDoc(userDocRef, data);
            toast.success("¡Usuario actualizado con éxito!");
            fetchUsers(); // Refresca la lista
            setUserToEdit(null); // Cierra el modal
        } catch (error) {
            console.error("Error updating user:", error);
            toast.error("No se pudo actualizar el usuario.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return { users, roles, isLoading, isSubmitting, userToEdit, setUserToEdit, crearNuevoUsuario, updateUser };
};