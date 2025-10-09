// src/hooks/admin/useAuditMetrics.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { collection, getDocs, query, orderBy, where, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { AuditFilters } from '../../utils/auditFilters';
import { formatDisplayDate } from '../../utils/textFormatters';
import toast from 'react-hot-toast';

/**
 * Hook para métricas de auditoría avanzadas
 */
export const useAuditMetrics = (initialDateRange = null) => {
    const [metrics, setMetrics] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dateRange, setDateRange] = useState(() => {
        if (initialDateRange) return initialDateRange;

        // Por defecto: últimos 30 días
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 30);

        return {
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0]
        };
    });

    /**
     * Carga todos los logs de auditoría
     */
    const fetchAuditLogs = useCallback(async () => {
        try {
            const auditsCollection = collection(db, "audits");

            // Crear query con filtro de fecha si está disponible
            let logsQuery = query(auditsCollection, orderBy("timestamp", "desc"));

            if (dateRange.start && dateRange.end) {
                const startDate = Timestamp.fromDate(new Date(dateRange.start));
                const endDate = Timestamp.fromDate(new Date(dateRange.end + 'T23:59:59'));

                logsQuery = query(
                    auditsCollection,
                    where("timestamp", ">=", startDate),
                    where("timestamp", "<=", endDate),
                    orderBy("timestamp", "desc")
                );
            }

            const documentSnapshots = await getDocs(logsQuery);
            const logs = documentSnapshots.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp?.toDate() || new Date(doc.data().timestamp)
            }));

            return logs;
        } catch (error) {
            console.error("Error fetching audit logs:", error);
            throw error;
        }
    }, [dateRange]);

    /**
     * Calcula métricas básicas
     */
    const calculateBasicMetrics = useCallback((logs) => {
        const totalActions = logs.length;
        const uniqueUsers = new Set(logs.map(log => log.userName)).size;

        // Calcular promedio diario
        const daysDiff = Math.max(1, Math.ceil(
            (new Date(dateRange.end) - new Date(dateRange.start)) / (1000 * 60 * 60 * 24)
        ));
        const averagePerDay = totalActions / daysDiff;

        // Acción más común
        const actionCounts = {};
        logs.forEach(log => {
            const action = log.details?.action || 'unknown';
            actionCounts[action] = (actionCounts[action] || 0) + 1;
        });

        let mostCommonAction = null;
        let mostCommonActionCount = 0;
        Object.entries(actionCounts).forEach(([action, count]) => {
            if (count > mostCommonActionCount) {
                mostCommonAction = action;
                mostCommonActionCount = count;
            }
        });

        return {
            totalActions,
            activeUsers: uniqueUsers,
            averagePerDay,
            mostCommonAction,
            mostCommonActionCount,
            actionCounts
        };
    }, [dateRange]);

    /**
     * Calcula distribución por categorías
     */
    const calculateCategoryDistribution = useCallback((logs) => {
        const categoryCounts = {};

        logs.forEach(log => {
            const category = log.details?.category || 'general';
            categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        });

        return Object.entries(categoryCounts).map(([name, count]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            count
        }));
    }, []);

    /**
     * Genera datos para gráfico de línea temporal
     */
    const generateTimelineData = useCallback((logs) => {
        const dailyCounts = {};

        logs.forEach(log => {
            const date = formatDisplayDate(log.timestamp);
            dailyCounts[date] = (dailyCounts[date] || 0) + 1;
        });

        // Generar array con todos los días del rango
        const start = new Date(dateRange.start);
        const end = new Date(dateRange.end);
        const timelineData = [];

        for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
            const dateStr = formatDisplayDate(date);
            timelineData.push({
                date: dateStr,
                count: dailyCounts[dateStr] || 0
            });
        }

        return timelineData;
    }, [dateRange]);

    /**
     * Genera datos de actividad por usuario
     */
    const generateUserActivityData = useCallback((logs) => {
        const userCounts = {};

        logs.forEach(log => {
            userCounts[log.userName] = (userCounts[log.userName] || 0) + 1;
        });

        return Object.entries(userCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10) // Top 10 usuarios
            .map(([name, count]) => ({ name, count }));
    }, []);

    /**
     * Genera datos de tipos de acción
     */
    const generateActionTypeData = useCallback((logs) => {
        const actionCounts = {};

        logs.forEach(log => {
            const action = log.details?.action || 'unknown';
            // Formatear nombre de acción para mejor visualización
            const formattedAction = action.split('_').map(word =>
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            ).join(' ');

            actionCounts[formattedAction] = (actionCounts[formattedAction] || 0) + 1;
        });

        return Object.entries(actionCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10) // Top 10 acciones
            .map(([action, count]) => ({ action, count }));
    }, []);

    /**
     * Calcula tendencia de actividad
     */
    const calculateActionTrend = useCallback((logs) => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

        const todayLogs = logs.filter(log =>
            new Date(log.timestamp) >= today
        );

        const yesterdayLogs = logs.filter(log => {
            const logDate = new Date(log.timestamp);
            return logDate >= yesterday && logDate < today;
        });

        const todayCount = todayLogs.length;
        const yesterdayCount = yesterdayLogs.length;

        if (yesterdayCount === 0) return todayCount > 0 ? 100 : 0;

        return Math.round(((todayCount - yesterdayCount) / yesterdayCount) * 100);
    }, []);

    /**
     * Obtiene actividad reciente
     */
    const getRecentActivity = useCallback((logs) => {
        return logs
            .slice(0, 20) // Últimas 20 actividades
            .map(log => ({
                message: log.message,
                userName: log.userName,
                timestamp: log.timestamp,
                action: log.details?.action
            }));
    }, []);

    /**
     * Carga y procesa todas las métricas
     */
    const loadMetrics = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const logs = await fetchAuditLogs();

            // Calcular todas las métricas
            const basicMetrics = calculateBasicMetrics(logs);
            const categoryDistribution = calculateCategoryDistribution(logs);
            const timelineData = generateTimelineData(logs);
            const userActivityData = generateUserActivityData(logs);
            const actionTypeData = generateActionTypeData(logs);
            const actionTrend = calculateActionTrend(logs);
            const recentActivity = getRecentActivity(logs);

            setMetrics({
                ...basicMetrics,
                categoryDistribution,
                timelineData,
                userActivityData,
                actionTypeData,
                actionTrend,
                recentActivity,
                lastUpdated: new Date()
            });

        } catch (err) {
            console.error('Error loading metrics:', err);
            setError(err.message || 'Error desconocido');
            toast.error('Error al cargar las métricas');
        } finally {
            setLoading(false);
        }
    }, [
        fetchAuditLogs,
        calculateBasicMetrics,
        calculateCategoryDistribution,
        generateTimelineData,
        generateUserActivityData,
        generateActionTypeData,
        calculateActionTrend,
        getRecentActivity
    ]);

    // Cargar métricas cuando cambie el rango de fechas
    useEffect(() => {
        loadMetrics();
    }, [loadMetrics]);

    // Funciones de utilidad para componentes
    const getActionTrend = useCallback(() => metrics.actionTrend || 0, [metrics]);

    const getUserActivityData = useCallback(() => metrics.userActivityData || [], [metrics]);

    const getActionTypeData = useCallback(() => metrics.actionTypeData || [], [metrics]);

    const getTimelineData = useCallback(() => metrics.timelineData || [], [metrics]);

    const getTopUsers = useCallback(() => metrics.userActivityData?.slice(0, 5) || [], [metrics]);

    /**
     * Exporta métricas completas
     */
    const exportMetrics = useCallback(async () => {
        try {
            const logs = await fetchAuditLogs();

            return {
                dateRange,
                metrics,
                rawData: {
                    totalLogs: logs.length,
                    logs: logs.map(log => ({
                        id: log.id,
                        timestamp: log.timestamp,
                        userName: log.userName,
                        message: log.message,
                        action: log.details?.action,
                        category: log.details?.category
                    }))
                },
                exportMetadata: {
                    exportDate: new Date().toISOString(),
                    version: '1.0.0'
                }
            };
        } catch (error) {
            console.error('Error exporting metrics:', error);
            throw error;
        }
    }, [dateRange, metrics, fetchAuditLogs]);

    /**
     * Actualiza el rango de fechas y recarga métricas
     */
    const updateDateRange = useCallback((newRange) => {
        setDateRange(newRange);
    }, []);

    return {
        // Estado
        metrics,
        loading,
        error,
        dateRange,

        // Acciones
        setDateRange: updateDateRange,
        refreshMetrics: loadMetrics,
        exportMetrics,

        // Getters para componentes
        getActionTrend,
        getUserActivityData,
        getActionTypeData,
        getTimelineData,
        getTopUsers,

        // Información adicional
        hasData: !loading && !error && Object.keys(metrics).length > 0,
        isEmpty: !loading && !error && metrics.totalActions === 0,
        lastUpdated: metrics.lastUpdated
    };
};

/**
 * Hook simplificado para métricas básicas
 */
export const useBasicAuditMetrics = () => {
    const { metrics, loading, error } = useAuditMetrics();

    return {
        totalActions: metrics.totalActions || 0,
        activeUsers: metrics.activeUsers || 0,
        averagePerDay: metrics.averagePerDay || 0,
        mostCommonAction: metrics.mostCommonAction || 'N/A',
        loading,
        error
    };
};

/**
 * Hook para métricas en tiempo real (se actualiza cada minuto)
 */
export const useRealtimeAuditMetrics = () => {
    const metricsHook = useAuditMetrics();

    useEffect(() => {
        const interval = setInterval(() => {
            metricsHook.refreshMetrics();
        }, 60000); // Actualizar cada minuto

        return () => clearInterval(interval);
    }, [metricsHook]);

    return metricsHook;
};

export default useAuditMetrics;