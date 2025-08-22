import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, query, orderBy, limit, startAfter } from 'firebase/firestore';
import { db } from '../../firebase/config';
import toast from 'react-hot-toast';

const LOGS_PER_PAGE = 15; // 15 registros por página

export const useAuditLog = () => {
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [lastVisible, setLastVisible] = useState(null); // Para paginación
    const [hasMore, setHasMore] = useState(true); // Para saber si hay más registros

    const fetchLogs = useCallback(async (loadMore = false) => {
        setIsLoading(true);
        try {
            let logsQuery;
            const auditsCollection = collection(db, "audits");

            if (loadMore && lastVisible) {
                logsQuery = query(auditsCollection, orderBy("timestamp", "desc"), startAfter(lastVisible), limit(LOGS_PER_PAGE));
            } else {
                logsQuery = query(auditsCollection, orderBy("timestamp", "desc"), limit(LOGS_PER_PAGE));
            }

            const documentSnapshots = await getDocs(logsQuery);

            const newLogs = documentSnapshots.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Actualizar el estado
            setLogs(prevLogs => loadMore ? [...prevLogs, ...newLogs] : newLogs);

            // Guardar el último documento visible para la siguiente página
            const lastDoc = documentSnapshots.docs[documentSnapshots.docs.length - 1];
            setLastVisible(lastDoc);

            // Si se cargaron menos registros que el límite, no hay más páginas.
            if (documentSnapshots.docs.length < LOGS_PER_PAGE) {
                setHasMore(false);
            }

        } catch (error) {
            console.error("Error fetching audit logs:", error);
            toast.error("No se pudo cargar el registro de auditoría.");
        } finally {
            setIsLoading(false);
        }
    }, [lastVisible]);

    useEffect(() => {
        // Carga inicial de logs
        if (!logs.length) {
            fetchLogs(false);
        }
    }, [fetchLogs, logs.length]);

    const fetchMoreLogs = () => {
        if (hasMore && !isLoading) {
            fetchLogs(true);
        }
    };

    return { logs, isLoading, hasMore, fetchMoreLogs };
};