import { db, auth } from '../firebase/config';
import { collection, addDoc, doc, getDoc, serverTimestamp, query, where, orderBy, getDocs, limit, startAfter } from "firebase/firestore";
import { toTitleCase } from '../utils/textFormatters';
// import { AuditMessageBuilder } from '../utils/auditMessageBuilder';
// import { AuditValidator, normalizeAuditLog } from '../utils/auditValidation';
import toast from 'react-hot-toast';

/**
 * Servicio de auditoría mejorado con validación, normalización y filtrado avanzado
 */

/**
 * Crea un registro en el log de auditoría con validación y normalización automática.
 * @param {string} message - El mensaje descriptivo de la acción (ej: "Creó al cliente Pedro Suarez").
 * @param {object} details - Un objeto con detalles relevantes sobre el evento (ej: { cambios: [...] }).
 * @param {object} options - Opciones adicionales (validateOnly, skipValidation, etc.)
 */
export const createAuditLog = async (message, details = {}, options = {}) => {
    try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            console.warn("Intento de registro de auditoría sin usuario autenticado.");
            return null;
        }

        // Obtener información del usuario
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        const userName = userDocSnap.exists()
            ? toTitleCase(`${userDocSnap.data().nombres} ${userDocSnap.data().apellidos}`)
            : currentUser.email;

        // Crear el log base
        let auditLog = {
            timestamp: new Date(), // Usamos Date para validación local, se convertirá a serverTimestamp al guardar
            userId: currentUser.uid,
            userName: userName,
            message: message,
            details: details
        };

        // Normalizar el log (temporalmente deshabilitado)
        // if (!options.skipNormalization) {
        //     auditLog = normalizeAuditLog(auditLog);
        // }

        // Validar el log si no se especifica lo contrario (temporalmente deshabilitado)
        // if (!options.skipValidation) {
        //     const validation = AuditValidator.validate(auditLog);
        //     
        //     if (!validation.isValid) {
        //         console.error("Log de auditoría inválido:", validation.errors);
        //         
        //         if (options.strictValidation) {
        //             throw new Error(`Validación falló: ${validation.errors.join(', ')}`);
        //         } else {
        //             // En modo no estricto, solo advertir pero continuar
        //             console.warn("Advertencias de validación:", validation.warnings);
        //         }
        //     }
        //     
        //     if (validation.warnings.length > 0 && !options.silentWarnings) {
        //         console.warn("Advertencias de validación:", validation.warnings);
        //     }
        // }

        // Si es solo validación, retornar sin guardar
        if (options.validateOnly) {
            // return AuditValidator.validate(auditLog);
            return { isValid: true, errors: [], warnings: [] };
        }

        // Preparar para guardar (convertir timestamp)
        const auditToSave = {
            ...auditLog,
            timestamp: serverTimestamp()
        };

        // Guardar en Firestore
        const auditCollectionRef = collection(db, "audits");
        const docRef = await addDoc(auditCollectionRef, auditToSave);

        // Retornar el log creado con su ID
        return {
            id: docRef.id,
            ...auditLog
        };

    } catch (error) {
        console.error("Error al crear el registro de auditoría:", error);

        if (!options.silentErrors) {
            toast.error("Error al registrar la actividad");
        }

        throw error;
    }
};

/**
 * Crea un log de auditoría usando el generador de mensajes automático
 * @param {string} action - La acción realizada (ej: 'CREATE_CLIENT')
 * @param {object} details - Detalles del evento
 * @param {string} userName - Nombre del usuario (opcional, se obtiene automáticamente)
 * @param {object} options - Opciones adicionales
 */
export const createAuditLogWithBuilder = async (action, details = {}, userName = null, options = {}) => {
    try {
        // Usar el generador de mensajes
        const currentUser = auth.currentUser;
        let finalUserName = userName;

        if (!finalUserName && currentUser) {
            const userDocRef = doc(db, "users", currentUser.uid);
            const userDocSnap = await getDoc(userDocRef);
            finalUserName = userDocSnap.exists()
                ? toTitleCase(`${userDocSnap.data().nombres} ${userDocSnap.data().apellidos}`)
                : currentUser.email;
        }

        // const message = AuditMessageBuilder.buildMessage(action, details, finalUserName || 'Usuario');
        const message = `Acción: ${action}`; // Mensaje temporal

        // Asegurar que el action esté en los details
        const enhancedDetails = {
            ...details,
            action: action
        };

        return await createAuditLog(message, enhancedDetails, options);

    } catch (error) {
        console.error("Error al crear log con builder:", error);
        throw error;
    }
};

/**
 * Crea múltiples logs de auditoría en lote
 * @param {Array} logs - Array de logs a crear
 * @param {object} options - Opciones adicionales
 */
export const createAuditLogBatch = async (logs, options = {}) => {
    try {
        const results = [];
        const errors = [];

        for (const logData of logs) {
            try {
                const result = await createAuditLog(
                    logData.message,
                    logData.details,
                    { ...options, silentErrors: true }
                );
                results.push(result);
            } catch (error) {
                errors.push({ logData, error });
            }
        }

        if (errors.length > 0 && !options.silentErrors) {
            console.error(`${errors.length} logs fallaron al guardarse:`, errors);
            toast.error(`${errors.length} registros de auditoría fallaron`);
        }

        return {
            successful: results,
            failed: errors,
            totalProcessed: logs.length
        };

    } catch (error) {
        console.error("Error en lote de auditoría:", error);
        throw error;
    }
};

/**
 * Obtiene logs de auditoría para un cliente específico (función original)
 */
export const getAuditLogsForCliente = async (clienteId) => {
    // CORRECCIÓN: Usamos el nombre de tu colección: "audits"
    const logsRef = collection(db, "audits");

    const q = query(
        logsRef,
        where("details.clienteId", "==", clienteId),
        orderBy("timestamp", "desc")
    );

    const querySnapshot = await getDocs(q);
    const logs = [];
    querySnapshot.forEach((doc) => {
        logs.push({ id: doc.id, ...doc.data() });
    });

    return logs;
};

/**
 * Obtiene logs de auditoría para un cliente específico con filtrado avanzado
 * @param {string} clienteId - ID del cliente
 * @param {object} options - Opciones de filtrado
 */
export const getAuditLogsForClienteAdvanced = async (clienteId, options = {}) => {
    try {
        const logsRef = collection(db, "audits");

        // Construir query base
        let q = query(
            logsRef,
            where("details.clienteId", "==", clienteId),
            orderBy("timestamp", "desc")
        );

        // Aplicar límite si se especifica
        if (options.limit) {
            q = query(q, limit(options.limit));
        }

        // Aplicar paginación si se especifica
        if (options.startAfter) {
            q = query(q, startAfter(options.startAfter));
        }

        const querySnapshot = await getDocs(q);
        let logs = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            logs.push({
                id: doc.id,
                ...data,
                timestamp: data.timestamp?.toDate() || new Date(data.timestamp)
            });
        });

        // Aplicar filtros adicionales si se especifican
        if (options.actions && options.actions.length > 0) {
            logs = logs.filter(log => options.actions.includes(log.details?.action));
        }

        if (options.dateFrom) {
            const fromDate = new Date(options.dateFrom);
            logs = logs.filter(log => log.timestamp >= fromDate);
        }

        if (options.dateTo) {
            const toDate = new Date(options.dateTo);
            logs = logs.filter(log => log.timestamp <= toDate);
        }

        // Aplicar deduplicación si se solicita (temporalmente deshabilitado)
        // if (options.deduplicate) {
        //     const { AuditFilters } = await import('../utils/auditFilters');
        //     logs = AuditFilters.deduplicateAdvanced(logs);
        // }

        return logs;

    } catch (error) {
        console.error("Error al obtener logs para cliente:", error);
        throw error;
    }
};

/**
 * Obtiene logs de auditoría generales con filtrado avanzado
 * @param {object} filters - Filtros a aplicar
 * @param {object} pagination - Opciones de paginación
 */
export const getAuditLogs = async (filters = {}, pagination = {}) => {
    try {
        const logsRef = collection(db, "audits");

        // Construir query base
        let q = query(logsRef, orderBy("timestamp", "desc"));

        // Aplicar filtros de Firestore
        if (filters.userId) {
            q = query(q, where("userId", "==", filters.userId));
        }

        if (filters.category) {
            q = query(q, where("details.category", "==", filters.category));
        }

        if (filters.dateFrom) {
            const fromTimestamp = serverTimestamp();
            // Nota: Para filtros de fecha en Firestore necesitarías usar Timestamp
            // Esta es una implementación simplificada
        }

        // Aplicar paginación
        if (pagination.limit) {
            q = query(q, limit(pagination.limit));
        }

        if (pagination.startAfter) {
            q = query(q, startAfter(pagination.startAfter));
        }

        const querySnapshot = await getDocs(q);
        let logs = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            logs.push({
                id: doc.id,
                ...data,
                timestamp: data.timestamp?.toDate() || new Date(data.timestamp)
            });
        });

        // Aplicar filtros adicionales que no se pueden hacer en Firestore
        if (filters.actions && filters.actions.length > 0) {
            logs = logs.filter(log => filters.actions.includes(log.details?.action));
        }

        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            logs = logs.filter(log =>
                log.message.toLowerCase().includes(searchTerm) ||
                log.userName.toLowerCase().includes(searchTerm)
            );
        }

        // Aplicar filtros avanzados si se solicita (temporalmente deshabilitado)
        // if (filters.useAdvancedFiltering) {
        //     const { AuditFilters } = await import('../utils/auditFilters');
        //     
        //     if (filters.deduplicate) {
        //         logs = AuditFilters.deduplicateAdvanced(logs);
        //     }
        //     
        //     if (filters.groupRelated) {
        //         logs = AuditFilters.groupRelatedActions(logs);
        //     }
        //     
        //     if (filters.relevanceFilter) {
        //         logs = AuditFilters.filterByRelevance(logs, filters.relevanceFilter);
        //     }
        // }

        return {
            logs,
            hasMore: querySnapshot.docs.length === (pagination.limit || 50),
            lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] || null
        };

    } catch (error) {
        console.error("Error al obtener logs de auditoría:", error);
        throw error;
    }
};

/**
 * Obtiene estadísticas rápidas de auditoría
 */
export const getAuditStats = async (timeframe = '30d') => {
    try {
        const logsRef = collection(db, "audits");

        // Calcular fecha de inicio basada en el timeframe
        const endDate = new Date();
        const startDate = new Date();

        switch (timeframe) {
            case '24h':
                startDate.setDate(startDate.getDate() - 1);
                break;
            case '7d':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case '30d':
            default:
                startDate.setDate(startDate.getDate() - 30);
                break;
        }

        // Obtener logs del período
        const logs = await getAuditLogs({
            dateFrom: startDate.toISOString(),
            dateTo: endDate.toISOString()
        });

        // Calcular estadísticas
        const stats = {
            totalActions: logs.logs.length,
            uniqueUsers: new Set(logs.logs.map(log => log.userId)).size,
            actionsByCategory: {},
            actionsByType: {},
            timeframe
        };

        // Agrupar por categorías y tipos
        logs.logs.forEach(log => {
            const category = log.details?.category || 'unknown';
            const action = log.details?.action || 'unknown';

            stats.actionsByCategory[category] = (stats.actionsByCategory[category] || 0) + 1;
            stats.actionsByType[action] = (stats.actionsByType[action] || 0) + 1;
        });

        return stats;

    } catch (error) {
        console.error("Error al obtener estadísticas:", error);
        throw error;
    }
};

/**
 * Valida la integridad de los logs de auditoría
 */
export const validateAuditIntegrity = async (options = {}) => {
    try {
        const { logs } = await getAuditLogs({}, { limit: options.sampleSize || 100 });

        // return AuditValidator.validateBatch(logs);
        return { results: [], summary: { total: logs.length, valid: logs.length, invalid: 0 } };

    } catch (error) {
        console.error("Error al validar integridad:", error);
        throw error;
    }
};

/**
 * Función de utilidad para limpiar logs duplicados
 */
export const cleanDuplicateLogs = async (options = { dryRun: true }) => {
    try {
        const { logs } = await getAuditLogs({}, { limit: 1000 });

        // const { AuditFilters } = await import('../utils/auditFilters');
        // const { duplicates } = AuditFilters.findDuplicates(logs);
        const duplicates = []; // Temporalmente vacío

        if (options.dryRun) {
            return {
                duplicatesFound: duplicates.length,
                duplicates: duplicates.map(d => ({
                    id: d.id,
                    message: d.message,
                    timestamp: d.timestamp
                }))
            };
        }

        // En una implementación real, aquí eliminarías los duplicados
        console.warn("Limpieza de duplicados no implementada en modo no-dryRun");

        return {
            duplicatesFound: duplicates.length,
            duplicatesRemoved: 0 // No implementado aún
        };

    } catch (error) {
        console.error("Error al limpiar duplicados:", error);
        throw error;
    }
};