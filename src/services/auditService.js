import { db, auth } from '../firebase/config';
import { collection, addDoc, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { toTitleCase } from '../utils/textFormatters';

/**
* Crea un registro en el log de auditoría.
 * @param {string} message - El mensaje descriptivo de la acción (ej: "Creó al cliente Pedro Suarez").
 * @param {object} details - Un objeto con detalles relevantes sobre el evento (ej: { cambios: [...] }).
 */
export const createAuditLog = async (message, details = {}) => {
    try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            console.warn("Intento de registro de auditoría sin usuario autenticado.");
            return;
        }

        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        const userName = userDocSnap.exists()
            ? toTitleCase(`${userDocSnap.data().nombres} ${userDocSnap.data().apellidos}`)
            : currentUser.email;

        const auditCollectionRef = collection(db, "audits");

        await addDoc(auditCollectionRef, {
            timestamp: serverTimestamp(),
            userId: currentUser.uid,
            userName: userName,
            message: message,
            details: details // Se añade el nuevo campo de detalles
        });

    } catch (error) {
        console.error("Error al crear el registro de auditoría:", error);
    }
};