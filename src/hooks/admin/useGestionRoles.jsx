import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import toast from 'react-hot-toast';

export const useGestionRoles = () => {
    const [roles, setRoles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [roleToEdit, setRoleToEdit] = useState(null);

    const fetchRoles = useCallback(async () => {
        setIsLoading(true);
        try {
            const rolesSnapshot = await getDocs(collection(db, "roles"));
            const rolesList = rolesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setRoles(rolesList);
        } catch (error) {
            console.error("Error fetching roles:", error);
            toast.error("No se pudo cargar la lista de roles.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRoles();
    }, [fetchRoles]);

    const saveRole = async (formData) => {
        setIsSubmitting(true);
        const { id, nombre, permissions } = formData;
        const roleId = id || nombre.toLowerCase().replace(/\s+/g, '-');

        if (!nombre) {
            toast.error("El nombre del rol es obligatorio.");
            setIsSubmitting(false);
            return;
        }

        try {
            const roleDocRef = doc(db, "roles", roleId);
            await setDoc(roleDocRef, { nombre, permissions }, { merge: true });

            toast.success(`¡Rol '${nombre}' guardado con éxito!`);
            fetchRoles();
            setRoleToEdit(null); // Cierra el modal/formulario
        } catch (error) {
            console.error("Error saving role:", error);
            toast.error("No se pudo guardar el rol.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        roles,
        isLoading,
        isSubmitting,
        roleToEdit,
        setRoleToEdit,
        saveRole
    };
};