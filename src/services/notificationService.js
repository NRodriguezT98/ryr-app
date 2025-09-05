import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const createNotification = async (type, message, link = '#') => {
    const notificationsCol = collection(db, 'notifications');
    try {
        await addDoc(notificationsCol, {
            type,
            message,
            link,
            read: false,
            timestamp: serverTimestamp()
        });
    } catch (error) {
        console.error("Error al crear la notificación:", error);
    }
};