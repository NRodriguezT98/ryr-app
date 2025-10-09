// En src/hooks/clientes/useHisto    // Si es una actualización del proceso, crear mensaje más específico
    if (details?.action === 'UPDATE_PROCESO') {
        if (details.cambios && details.cambios.length > 0) {
            const cambio = details.cambios[0]; // Tomamos el primer cambio
            if (cambio.accion === 'completó') {
                return `Completó el paso "${cambio.paso}" con fecha ${cambio.fecha || 'no especificada'}.`;
            } else if (cambio.accion === 'reabrió') {
                return `Reabrió el paso "${cambio.paso}". Motivo: ${cambio.motivo || 'No especificado'}.`;
            } else {
                return `Modificó el paso "${cambio.paso}".`;
            }
        }
        return log.message; // Fallback al mensaje original
    }Cliente.jsx

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getAuditLogsForCliente } from '../../services/auditService';
import { useData } from '../../context/DataContext';
import { formatCurrency } from '../../utils/textFormatters';

// La funci+¦n para generar el mensaje ahora vive dentro del hook

const formatFuentesDePago = (plan) => {
    if (!plan) return [];
    const fuentes = [];
    if (plan.aplicaCuotaInicial && plan.cuotaInicial?.monto > 0) {
        fuentes.push(`ÔÇó Cuota Inicial: ${formatCurrency(plan.cuotaInicial.monto)}`);
    }
    if (plan.aplicaCredito && plan.credito?.monto > 0) {
        fuentes.push(`ÔÇó Cr+®dito Hipotecario: ${formatCurrency(plan.credito.monto)}`);
    }
    if (plan.aplicaSubsidioVivienda && plan.subsidioVivienda?.monto > 0) {
        fuentes.push(`ÔÇó Subsidio Mi Casa Ya: ${formatCurrency(plan.subsidioVivienda.monto)}`);
    }
    if (plan.aplicaSubsidioCaja && plan.subsidioCaja?.monto > 0) {
        fuentes.push(`ÔÇó Subsidio Caja (${plan.subsidioCaja.caja || 'N/A'}): ${formatCurrency(plan.subsidioCaja.monto)}`);
    }
    return fuentes;
};
const getDisplayMessage = (log, viviendas) => {
    const { details, message } = log;

    if (details?.action === 'ADD_NOTE') {
        return details.nota || log.message;
    }

    // Si es una actualizaci+¦n del proceso, usamos el mensaje de auditor+¡a
    if (details?.action === 'UPDATE_PROCESO') {
        return log.message;
    }

    // Si es una actualizaci+¦n de cliente con cambios espec+¡ficos, generamos mensaje detallado para TabHistorial
    if (details?.action === 'UPDATE_CLIENT' && details?.cambios && details.cambios.length > 0) {
        const cambios = details.cambios;
        const clienteNombre = details.clienteNombre || 'Cliente';
        const clienteId = details.clienteId || '';

        // Si solo hay un cambio, usar formato simplificado
        if (cambios.length === 1) {
            const cambio = cambios[0];

            // Mejorar el mensaje para archivos
            if (cambio.fileChange) {
                const tipo = cambio.fileChange.type;
                return `${tipo.charAt(0).toUpperCase() + tipo.slice(1)} ${cambio.campo.toLowerCase()} del cliente ${clienteNombre} (C.C. ${clienteId})`;
            }

            // Para cambios normales (no archivos)
            return `Actualiz+¦ ${cambio.campo.toLowerCase()} del cliente ${clienteNombre} (C.C. ${clienteId}): de "${cambio.anterior}" ÔåÆ "${cambio.actual}"`;
        }

        // Si hay m+¦ltiples cambios, usar formato de lista
        const listaCambios = cambios.map(cambio => {
            // Mejorar el mensaje para archivos
            if (cambio.fileChange) {
                const tipo = cambio.fileChange.type;
                if (tipo === 'adjunt+¦') {
                    return `ÔÇó ${tipo.charAt(0).toUpperCase() + tipo.slice(1)} ${cambio.campo.toLowerCase()}`;
                } else if (tipo === 'elimin+¦') {
                    return `ÔÇó ${tipo.charAt(0).toUpperCase() + tipo.slice(1)} ${cambio.campo.toLowerCase()}`;
                } else if (tipo === 'reemplaz+¦') {
                    return `ÔÇó ${tipo.charAt(0).toUpperCase() + tipo.slice(1)} ${cambio.campo.toLowerCase()}`;
                }
            }
            // Para cambios normales (no archivos)
            return `ÔÇó ${cambio.campo}: de "${cambio.anterior}" ÔåÆ "${cambio.actual}"`;
        }).join('\n');

        return `Actualiz+¦ m+¦ltiples datos del cliente ${clienteNombre} (C.C. ${clienteId}):\n${listaCambios}`;
    }

    // Para otros casos, mantenemos la l+¦gica anterior si es necesario
    // o simplemente devolvemos el mensaje por defecto.
    return log.message;
};


export const useHistorialCliente = (clienteId) => {
    const { viviendas } = useData();
    const [historial, setHistorial] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchHistorial = useCallback(async () => {
        if (!clienteId) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const logs = await getAuditLogsForCliente(clienteId);
            
            // Filtrar registros no deseados y eliminar duplicados
            const historialFiltrado = logs.filter(log => {
                // Eliminar notas editadas
                if (log.details.action === 'EDIT_NOTE') return false;
                
                // Si es UPDATE_PROCESO, verificar que tenga cambios específicos
                if (log.details.action === 'UPDATE_PROCESO') {
                    return log.details.cambios && log.details.cambios.length > 0;
                }
                
                return true;
            });
            
            // Eliminar duplicados basados en timestamp y acción similar
            const historialSinDuplicados = historialFiltrado.reduce((acc, current) => {
                const currentTime = current.timestamp?.toDate?.() || current.timestamp;
                
                const existing = acc.find(item => {
                    const itemTime = item.timestamp?.toDate?.() || item.timestamp;
                    const timeDiff = Math.abs(itemTime - currentTime);
                    
                    // Si son del mismo usuario y en el mismo momento (menos de 5 segundos de diferencia)
                    if (timeDiff < 5000 && item.userName === current.userName) {
                        // Verificar si es el mismo paso del proceso
                        const currentPaso = current.details?.cambios?.[0]?.paso || 
                                          current.details?.paso || 
                                          current.message?.match(/"([^"]+)"/)?.[1];
                        const itemPaso = item.details?.cambios?.[0]?.paso || 
                                       item.details?.paso || 
                                       item.message?.match(/"([^"]+)"/)?.[1];
                        
                        // Si tienen el mismo paso, son duplicados
                        if (currentPaso && itemPaso && currentPaso === itemPaso) {
                            return true;
                        }
                        
                        // También verificar por acción exacta como antes
                        if (item.details?.action === current.details?.action) {
                            return true;
                        }
                    }
                    
                    return false;
                });
                
                if (!existing) {
                    acc.push(current);
                } else {
                    // Mantener el registro con más información o el más específico
                    const currentSpecificity = (current.details?.cambios?.length || 0) + 
                                             (current.details?.action === 'UPDATE_PROCESO' ? 10 : 0);
                    const existingSpecificity = (existing.details?.cambios?.length || 0) + 
                                              (existing.details?.action === 'UPDATE_PROCESO' ? 10 : 0);
                    
                    if (currentSpecificity > existingSpecificity) {
                        const index = acc.indexOf(existing);
                        acc[index] = current;
                    }
                }
                
                return acc;
            }, []);
            
            setHistorial(historialSinDuplicados);
        } catch (err) {
            console.error("Error al cargar el historial:", err);
            // Considera a+¦adir un estado de error aqu+¡ si lo deseas
        } finally {
            setLoading(false);
        }
    }, [clienteId]);

    useEffect(() => {
        fetchHistorial();
    }, [fetchHistorial]);

    // Usamos useMemo para procesar los datos solo cuando el historial original cambia
    const processedHistorial = useMemo(() => {
        return historial.map(log => ({
            ...log,
            // A+¦adimos una nueva propiedad con el mensaje ya procesado
            displayMessage: getDisplayMessage(log, viviendas)
        }));
    }, [historial, viviendas]);

    return {
        historial: processedHistorial, // Devolvemos el historial ya procesado
        loading,
        fetchHistorial // Lo devolvemos para poder recargar si es necesario
    };
};
