/**
 * Servicio de auditoría completamente renovado
 * 
 * Filosofía Nueva:
 * 1. Captura datos crudos sin procesar mensajes
 * 2. Usa la estructura unificada
 * 3. Permite interpretación flexible por parte de las vistas
 */

import { db, auth } from '../firebase/config';
import { collection, addDoc, doc, getDoc, serverTimestamp, Timestamp, query, where, orderBy, getDocs, limit, startAfter } from "firebase/firestore";
import { toTitleCase } from '../utils/textFormatters';
import { createAuditLog as createAuditStructure, ACTION_TYPES } from '../utils/auditStructure';
import toast from 'react-hot-toast';

/**
 * Función principal para crear registros de auditoría con la nueva estructura
 */
export const createUnifiedAuditLog = async (actionType, module, rawData, options = {}) => {
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

        // Crear la estructura usando el factory
        const auditStructure = createAuditStructure(actionType, module, rawData);

        // Agregar metadatos del sistema
        auditStructure.userId = currentUser.uid;
        auditStructure.userName = userName;
        auditStructure.timestamp = new Date(); // Para validación local

        // Validaciones básicas
        if (!actionType || !module) {
            throw new Error("actionType y module son requeridos");
        }

        // Si es solo validación, retornar sin guardar
        if (options.validateOnly) {
            return { isValid: true, auditLog: auditStructure };
        }

        // Preparar para guardar (convertir timestamp para Firestore)
        // Si se pasa un timestamp específico en options, usarlo; sino usar serverTimestamp
        const auditToSave = {
            ...auditStructure,
            timestamp: options.timestamp ? Timestamp.fromDate(options.timestamp) : serverTimestamp()
        };

        // Limpiar valores undefined para evitar errores de Firestore
        const cleanedAudit = cleanFirestoreData(auditToSave);

        // Guardar en Firestore
        const auditCollectionRef = collection(db, "audits");
        const docRef = await addDoc(auditCollectionRef, cleanedAudit);

        // Retornar el log creado con su ID y timestamp válido
        return {
            id: docRef.id,
            ...auditStructure,
            timestamp: new Date() // Garantizar un timestamp válido en el retorno
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
 * Funciones específicas para cada módulo (wrappers convenientes)
 */

// === CLIENTES ===
export const createClientAuditLog = async (actionType, clientData, additionalData = {}, options = {}) => {
    // Validar que el actionType sea válido para clientes
    if (!ACTION_TYPES.CLIENTES[actionType]) {
        throw new Error(`Tipo de acción inválido para módulo CLIENTES: ${actionType}`);
    }

    const rawData = {
        entities: {
            clienteId: clientData.id || clientData.clienteId,
            viviendaId: additionalData.viviendaId,
            proyectoId: additionalData.proyectoId
        },
        context: {
            cliente: {
                id: clientData.id || clientData.clienteId,
                nombre: clientData.nombre || `${clientData.nombres} ${clientData.apellidos}`,
                documento: clientData.numeroDocumento || clientData.documento
            },
            vivienda: additionalData.vivienda || {},
            proyecto: additionalData.proyecto || {}
        },
        actionData: additionalData.actionData || {},
        changes: additionalData.changes || {}
    };

    // Agregar mensaje si viene en options
    if (options.message) {
        rawData.message = options.message;
    }

    // Agregar structured data si viene en options
    if (options.structured) {
        rawData.structured = options.structured;
    }

    const result = await createUnifiedAuditLog(actionType, 'CLIENTES', rawData, options);
    return result;
};// === VIVIENDAS ===
export const createViviendaAuditLog = async (actionType, viviendaData, additionalData = {}, options = {}) => {
    if (!ACTION_TYPES.VIVIENDAS[actionType]) {
        throw new Error(`Tipo de acción inválido para módulo VIVIENDAS: ${actionType}`);
    }

    const rawData = {
        entities: {
            viviendaId: viviendaData.id,
            clienteId: additionalData.clienteId,
            proyectoId: viviendaData.proyectoId
        },
        context: {
            vivienda: {
                id: viviendaData.id,
                manzana: viviendaData.manzana,
                numeroCasa: viviendaData.numeroCasa,
                proyecto: additionalData.proyectoNombre
            },
            cliente: additionalData.cliente || {},
            proyecto: additionalData.proyecto || {}
        },
        actionData: {
            ...additionalData.actionData,
            ...viviendaData
        },
        changes: additionalData.changes || {}
    };

    return await createUnifiedAuditLog(actionType, 'VIVIENDAS', rawData, options);
};

// === ABONOS ===
export const createAbonoAuditLog = async (actionType, abonoData, additionalData = {}, options = {}) => {
    if (!ACTION_TYPES.ABONOS[actionType]) {
        throw new Error(`Tipo de acción inválido para módulo ABONOS: ${actionType}`);
    }

    const rawData = {
        entities: {
            abonoId: abonoData.id,
            clienteId: abonoData.clienteId,
            viviendaId: abonoData.viviendaId,
            proyectoId: additionalData.proyectoId
        },
        context: {
            cliente: additionalData.cliente || {},
            vivienda: additionalData.vivienda || {},
            proyecto: additionalData.proyecto || {}
        },
        actionData: {
            ...additionalData.actionData,
            monto: abonoData.monto,
            metodoPago: abonoData.metodoPago,
            fechaPago: abonoData.fechaPago,
            fuente: abonoData.fuente,
            consecutivo: abonoData.consecutivo
        },
        changes: additionalData.changes || {}
    };

    return await createUnifiedAuditLog(actionType, 'ABONOS', rawData, options);
};

// === RENUNCIAS ===
export const createRenunciaAuditLog = async (actionType, renunciaData, additionalData = {}, options = {}) => {
    if (!ACTION_TYPES.RENUNCIAS[actionType]) {
        throw new Error(`Tipo de acción inválido para módulo RENUNCIAS: ${actionType}`);
    }

    const rawData = {
        entities: {
            renunciaId: renunciaData.id,
            clienteId: renunciaData.clienteId,
            viviendaId: additionalData.viviendaId,
            proyectoId: additionalData.proyectoId
        },
        context: {
            cliente: additionalData.cliente || {},
            vivienda: additionalData.vivienda || {},
            proyecto: additionalData.proyecto || {}
        },
        actionData: {
            ...additionalData.actionData,
            motivo: renunciaData.motivo,
            fechaRenuncia: renunciaData.fechaRenuncia,
            estado: renunciaData.estado
        },
        changes: additionalData.changes || {}
    };

    return await createUnifiedAuditLog(actionType, 'RENUNCIAS', rawData, options);
};

/**
 * Función para mantener compatibilidad con el sistema anterior
 * (Temporalmente para migración gradual)
 */
export const createAuditLog = async (message, details = {}, options = {}) => {
    try {
        // Mapear al sistema anterior por compatibilidad
        const currentUser = auth.currentUser;
        if (!currentUser) {
            console.warn("Intento de registro de auditoría sin usuario autenticado.");
            return null;
        }

        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        const userName = userDocSnap.exists()
            ? toTitleCase(`${userDocSnap.data().nombres} ${userDocSnap.data().apellidos}`)
            : currentUser.email;

        // Crear log en formato anterior (para compatibilidad)
        let auditLog = {
            timestamp: new Date(),
            userId: currentUser.uid,
            userName: userName,
            message: message,
            details: details
        };

        if (options.validateOnly) {
            return { isValid: true, errors: [], warnings: [] };
        }

        const auditToSave = {
            ...auditLog,
            timestamp: serverTimestamp()
        };

        const auditCollectionRef = collection(db, "audits");
        const docRef = await addDoc(auditCollectionRef, auditToSave);

        return {
            id: docRef.id,
            ...auditLog
        };

    } catch (error) {
        console.error("Error al crear el registro de auditoría (compatibilidad):", error);

        if (!options.silentErrors) {
            toast.error("Error al registrar la actividad");
        }

        throw error;
    }
};

/**
 * Funciones de consulta (sin cambios significativos)
 */
export const getAuditLogsForCliente = async (clienteId) => {
    const logsRef = collection(db, "audits");

    // NOTA: La ruta correcta en la nueva estructura unificada es "entities.clienteId"
    const q = query(
        logsRef,
        where("entities.clienteId", "==", clienteId),
        orderBy("timestamp", "desc")
    );

    const querySnapshot = await getDocs(q);
    const logs = [];
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Debug: Ver si el log tiene mensaje
        if (data.message) {
            console.log('📨 [LOG CON MENSAJE]:', data.message.substring(0, 60) + '...');
        }
        logs.push({ id: doc.id, ...data });
    });

    console.log(`📊 Total logs: ${logs.length} | Con mensaje: ${logs.filter(l => l.message).length}`);
    return logs;
};

export const getAuditLogsForClienteAdvanced = async (clienteId, options = {}) => {
    try {
        const logsRef = collection(db, "audits");

        // NOTA: La ruta correcta en la nueva estructura unificada es "entities.clienteId"
        // Esta consulta requiere un índice compuesto en Firebase
        let q2 = query(
            logsRef,
            where("entities.clienteId", "==", clienteId),
            orderBy("timestamp", "desc")
        );

        // Aplicar límite si se especifica
        if (options.limit) {
            q1 = query(q1, limit(options.limit));
            q2 = query(q2, limit(options.limit));
        }

        // TEMPORAL: Solo ejecutar consulta de estructura anterior
        const querySnapshot2 = await getDocs(q2);

        let logs = [];

        querySnapshot2.forEach((doc) => {
            const data = doc.data();
            logs.push({
                id: doc.id,
                ...data,
                timestamp: data.timestamp?.toDate() || new Date(data.timestamp),
                _source: 'anterior'
            });
        });

        console.log('🔍 Logs obtenidos (temporal - solo estructura anterior):', {
            total: logs.length,
            clienteId: clienteId,
            muestra: logs.slice(0, 2).map(log => ({
                id: log.id?.substring(0, 8),
                action: log.details?.action,
                scenario: log.details?.scenario,
                message: log.message?.substring(0, 50)
            }))
        });

        // Ordenar por timestamp
        logs.sort((a, b) => b.timestamp - a.timestamp);

        // Aplicar filtros adicionales si se especifican
        if (options.actions && options.actions.length > 0) {
            logs = logs.filter(log =>
                options.actions.includes(log.actionType) ||
                options.actions.includes(log.details?.action)
            );
        }

        if (options.dateFrom) {
            const fromDate = new Date(options.dateFrom);
            logs = logs.filter(log => log.timestamp >= fromDate);
        }

        if (options.dateTo) {
            const toDate = new Date(options.dateTo);
            logs = logs.filter(log => log.timestamp <= toDate);
        }

        return logs;

    } catch (error) {
        console.error("Error al obtener logs para cliente:", error);
        throw error;
    }
};

/**
 * Función auxiliar para limpiar datos de Firestore
 */
function cleanFirestoreData(obj) {
    if (obj === null || obj === undefined) {
        return null;
    }

    // 🔥 NO procesar serverTimestamp() ni Timestamp de Firestore
    if (obj && typeof obj === 'object' && (obj._methodName === 'serverTimestamp' || obj.constructor?.name === 'Timestamp')) {
        return obj; // Retornar tal cual sin procesar
    }

    if (Array.isArray(obj)) {
        return obj.map(item => cleanFirestoreData(item)).filter(item => item !== null);
    }

    if (typeof obj === 'object') {
        const cleaned = {};
        for (const [key, value] of Object.entries(obj)) {
            const cleanValue = cleanFirestoreData(value);
            if (cleanValue !== null && cleanValue !== undefined) {
                cleaned[key] = cleanValue;
            }
        }
        return cleaned;
    }

    return obj;
}

// Mantener exports adicionales para compatibilidad
export { createAuditLogWithBuilder } from './auditService';
export const getAuditLogs = async (filters = {}, pagination = {}) => {
    // Implementación simplificada
    const logsRef = collection(db, "audits");
    let q = query(logsRef, orderBy("timestamp", "desc"));

    if (pagination.limit) {
        q = query(q, limit(pagination.limit));
    }

    const querySnapshot = await getDocs(q);
    const logs = [];

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        logs.push({
            id: doc.id,
            ...data,
            timestamp: data.timestamp?.toDate() || new Date(data.timestamp)
        });
    });

    return {
        logs,
        hasMore: querySnapshot.docs.length === (pagination.limit || 50),
        lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] || null
    };
};

// Re-exportar ACTION_TYPES para facilitar el acceso
export { ACTION_TYPES } from '../utils/auditStructure';