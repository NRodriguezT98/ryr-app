// src/hooks/admin/useAuditLog.jsx

import { useState, useEffect, useMemo, useCallback } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import toast from 'react-hot-toast';

const LOGS_PER_PAGE = 10; // Puedes ajustar el número de registros por página

export const useAuditLog = () => {
    const [allLogs, setAllLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // 1. Declaramos el estado de la página actual en el nivel superior del hook.
    const [currentPage, setCurrentPage] = useState(1);

    // Carga todos los logs de la base de datos una sola vez.
    useEffect(() => {
        const fetchAllLogs = async () => {
            setIsLoading(true);
            try {
                const auditsCollection = collection(db, "audits");
                const logsQuery = query(auditsCollection, orderBy("timestamp", "desc"));
                const documentSnapshots = await getDocs(logsQuery);
                const logsData = documentSnapshots.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setAllLogs(logsData);
            } catch (error) {
                console.error("Error fetching audit logs:", error);
                toast.error("No se pudo cargar el registro de auditoría.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchAllLogs();
    }, []); // El array vacío asegura que esto se ejecute solo una vez.

    // Calcula el número total de páginas basándose en los logs cargados.
    const totalPages = Math.ceil(allLogs.length / LOGS_PER_PAGE);

    // Obtiene la porción de logs que corresponde a la página actual.
    // useMemo optimiza esto para que no se recalcule innecesariamente.
    const currentLogs = useMemo(() => {
        const startIndex = (currentPage - 1) * LOGS_PER_PAGE;
        const endIndex = startIndex + LOGS_PER_PAGE;
        return allLogs.slice(startIndex, endIndex);
    }, [allLogs, currentPage]);

    // Función segura para cambiar de página.
    const handlePageChange = useCallback((page) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
        }
    }, [totalPages]);

    // Devolvemos todo lo que la vista necesita.
    return {
        isLoading,
        currentLogs,
        currentPage,
        totalPages,
        handlePageChange
    };
};