import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { db } from '../firebase/config';
import { collection, onSnapshot, query, orderBy, limit, writeBatch, where, getDocs } from "firebase/firestore";

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
        // Creamos una consulta para ordenar por fecha y limitar a las últimas 50
        const q = query(notifCollection, orderBy('timestamp', 'desc'), limit(50));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setNotifications(notifs);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const unreadCount = useMemo(() => {
        return notifications.filter(n => !n.read).length;
    }, [notifications]);

    const markAllAsRead = async () => {
        const batch = writeBatch(db);
        const unreadIds = notifications.filter(n => !n.read).map(n => n.id);

        if (unreadIds.length === 0) return;

        unreadIds.forEach(id => {
            const notifRef = doc(db, 'notifications', id);
            batch.update(notifRef, { read: true });
        });

        await batch.commit();
    };

    // Versión para marcar una notificación específica como leída (opcional por ahora)
    const markAsRead = async (id) => {
        const notifRef = doc(db, 'notifications', id);
        await updateDoc(notifRef, { read: true });
    };

    const value = {
        notifications,
        unreadCount,
        isLoading,
        markAllAsRead
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};