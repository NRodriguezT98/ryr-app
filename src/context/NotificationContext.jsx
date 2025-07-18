import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { db } from '../firebase/config';
import { collection, onSnapshot, query, orderBy, limit, writeBatch, doc, updateDoc, deleteDoc } from "firebase/firestore";
import toast from 'react-hot-toast';

const NotificationContext = createContext(null);

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotifications debe ser usado dentro de un NotificationProvider");
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const notifCollection = collection(db, 'notifications');
        const q = query(notifCollection, orderBy('timestamp', 'desc'), limit(50));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setNotifications(notifs);
            setIsLoading(false);
        }, (error) => {
            console.error("Error al obtener notificaciones:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const unreadCount = useMemo(() => {
        return notifications.filter(n => !n.read).length;
    }, [notifications]);

    // --- LÓGICA DE AGRUPACIÓN AÑADIDA ---
    const groupedNotifications = useMemo(() => {
        const newNotifs = notifications.filter(n => !n.read);
        const readNotifs = notifications.filter(n => n.read);
        return {
            new: newNotifs,
            previous: readNotifs,
        };
    }, [notifications]);

    const markAllAsRead = async () => {
        const batch = writeBatch(db);
        const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
        if (unreadIds.length === 0) return;
        unreadIds.forEach(id => {
            const notifRef = doc(db, 'notifications', id);
            batch.update(notifRef, { read: true });
        });
        try {
            await batch.commit();
        } catch (error) {
            console.error("Error al marcar notificaciones como leídas:", error);
        }
    };

    const markAsRead = async (id) => {
        const notifRef = doc(db, 'notifications', id);
        try {
            await updateDoc(notifRef, { read: true });
        } catch (error) {
            console.error("Error al marcar la notificación como leída:", error);
        }
    };

    const clearAllNotifications = async () => {
        if (notifications.length === 0) {
            toast.success("No hay notificaciones para limpiar.");
            return;
        }

        const batch = writeBatch(db);
        notifications.forEach(notif => {
            const notifRef = doc(db, 'notifications', notif.id);
            batch.delete(notifRef);
        });

        try {
            await batch.commit();
            toast.success("Todas las notificaciones han sido eliminadas.");
        } catch (error) {
            toast.error("No se pudieron eliminar las notificaciones.");
            console.error("Error al limpiar notificaciones:", error);
        }
    };

    const value = {
        notifications,
        unreadCount,
        groupedNotifications, // Exportamos las notificaciones agrupadas
        isLoading,
        markAllAsRead,
        markAsRead,
        clearAllNotifications
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};