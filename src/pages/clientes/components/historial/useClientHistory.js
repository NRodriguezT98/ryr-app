/**
 * Hook personalizado para manejar el historial de auditoría de un cliente
 */

import { useState, useEffect, useCallback } from 'react';
import { getAuditLogsForCliente } from '@/services/auditService';

export const useClientHistory = (clienteId) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchHistory = useCallback(async () => {
        if (!clienteId) {
            console.warn('⚠️ [fetchHistory] No hay clienteId, abortando');
            return;
        }

        console.log('🚀 [fetchHistory] Cargando historial para cliente:', clienteId);

        try {
            setLoading(true);
            setError(null);

            const auditLogs = await getAuditLogsForCliente(clienteId);
            console.log('📦 [fetchHistory] Logs recibidos:', auditLogs.length);

            // Filtrar logs irrelevantes
            const filtered = auditLogs.filter(log => {
                const actionType = log.actionType || log.details?.action;

                // Excluir acciones menores
                if (actionType === 'VIEW_CLIENT' || actionType === 'VIEW_DETAILS') {
                    return false;
                }

                return true;
            });

            // DEBUG: Ver timestamps reales
            console.log('🔍 TIMESTAMPS DE LOGS RECIBIDOS:');
            filtered.forEach((log, i) => {
                let ts;
                try {
                    if (log.timestamp?.toDate) {
                        ts = log.timestamp.toDate();
                    } else if (log.timestamp?.seconds) {
                        ts = new Date(log.timestamp.seconds * 1000);
                    } else if (log.timestamp) {
                        ts = new Date(log.timestamp);
                    } else {
                        ts = new Date(); // Fallback si no hay timestamp
                    }

                    // Validar que el timestamp sea válido
                    if (isNaN(ts.getTime())) {
                        console.warn(`  ${i + 1}. ${log.id}: TIMESTAMP INVÁLIDO - usando fallback`);
                        ts = new Date();
                    } else {
                        console.log(`  ${i + 1}. ${log.id}: ${ts.toISOString()} (${ts.getTime()})`);
                    }
                } catch (error) {
                    console.error(`  ${i + 1}. ${log.id}: ERROR procesando timestamp:`, error);
                    ts = new Date(); // Fallback en caso de error
                }
            });

            // Ordenar por timestamp descendente (más reciente primero)
            const sorted = filtered.sort((a, b) => {
                let timeA, timeB;

                try {
                    if (a.timestamp?.toDate) {
                        timeA = a.timestamp.toDate().getTime();
                    } else if (a.timestamp?.seconds) {
                        timeA = a.timestamp.seconds * 1000 + (a.timestamp.nanoseconds || 0) / 1000000;
                    } else if (a.timestamp) {
                        timeA = new Date(a.timestamp).getTime();
                    } else {
                        timeA = 0;
                    }

                    // Validar que timeA sea un número válido
                    if (isNaN(timeA)) timeA = 0;
                } catch (error) {
                    console.error('Error procesando timestamp A:', error);
                    timeA = 0;
                }

                try {
                    if (b.timestamp?.toDate) {
                        timeB = b.timestamp.toDate().getTime();
                    } else if (b.timestamp?.seconds) {
                        timeB = b.timestamp.seconds * 1000 + (b.timestamp.nanoseconds || 0) / 1000000;
                    } else if (b.timestamp) {
                        timeB = new Date(b.timestamp).getTime();
                    } else {
                        timeB = 0;
                    }

                    // Validar que timeB sea un número válido
                    if (isNaN(timeB)) timeB = 0;
                } catch (error) {
                    console.error('Error procesando timestamp B:', error);
                    timeB = 0;
                }

                return timeB - timeA; // Descendente
            });

            console.log(`✅ Historial cargado: ${sorted.length} logs`);
            setLogs(sorted);
        } catch (err) {
            console.error('❌ Error cargando historial:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [clienteId]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    return { logs, loading, error, refetch: fetchHistory };
};
