/**
 * cambiosDetector.js
 *            cambios.push(cambio);
        }
    });

    return cambios;
};tecta cambios en el proceso de un cliente.
 * Separa la lógica de detección de la lógica de auditoría.
 * 
 * REFACTORIZADO: Solo 3 tipos de cambios:
 * 1. completacion - Primera vez que se completa un paso
 * 2. cambio_fecha - Solo se modifica la fecha (botón Editar Fecha)
 * 3. reapertura - Se reabre y completa el paso (con o sin cambios)
 */

import { PROCESO_CONFIG } from '../../../utils/procesoConfig';

/**
 * Detecta todos los cambios entre dos estados de proceso.
 * 
 * @param {Object} procesoOriginal - Estado anterior del proceso
 * @param {Object} procesoNuevo - Estado nuevo del proceso
 * @returns {Array} Lista de cambios detectados con contexto completo
 */
export const detectarCambiosProceso = (procesoOriginal, procesoNuevo) => {
    const cambios = []; for (const pasoConfig of PROCESO_CONFIG) {
        const key = pasoConfig.key;
        const pasoOriginal = procesoOriginal[key] || {};
        const pasoNuevo = procesoNuevo[key] || {};

        const cambio = detectarCambioPaso(pasoOriginal, pasoNuevo, pasoConfig);

        if (cambio.tipo !== 'sin_cambios') {
            cambios.push(cambio);
        }
    }

    return cambios;
};

/**
 * Detecta cambios en un paso específico del proceso.
 */
const detectarCambioPaso = (pasoOriginal, pasoNuevo, config) => {
    // 1. Detectar tipo de cambio
    const huboComplecion = !pasoOriginal.completado && pasoNuevo.completado;
    const huboCambioFecha = compararFechas(pasoOriginal, pasoNuevo);
    const huboCambioEvidencias = compararEvidencias(pasoOriginal, pasoNuevo);

    // 2. Si no hay cambios, retornar temprano
    if (!huboComplecion && !huboCambioFecha && !huboCambioEvidencias) {
        return { tipo: 'sin_cambios' };
    }

    // 3. Determinar el tipo específico de cambio
    const tipoCambio = determinarTipoCambio({
        huboComplecion,
        huboCambioFecha,
        huboCambioEvidencias,
        esReapertura: !!(pasoNuevo.motivoReapertura && pasoNuevo.fechaReapertura)
    });

    // 4. Retornar objeto con TODO el contexto
    return {
        tipo: tipoCambio,
        pasoKey: config.key,
        pasoNombre: extraerNombrePaso(config.label),
        pasoConfig: config,
        estadoOriginal: {
            completado: pasoOriginal.completado,
            fecha: pasoOriginal.fecha,
            evidencias: pasoOriginal.evidencias || {}
        },
        estadoNuevo: {
            completado: pasoNuevo.completado,
            fecha: pasoNuevo.fecha,
            evidencias: pasoNuevo.evidencias || {},
            motivoReapertura: pasoNuevo.motivoReapertura,
            fechaReapertura: pasoNuevo.fechaReapertura,
            estadoAnterior: pasoNuevo.estadoAnterior
        },
        flags: {
            huboCambioFecha,
            huboCambioEvidencias,
            esReapertura: !!(pasoNuevo.motivoReapertura && pasoNuevo.fechaReapertura)
        }
    };
};

/**
 * Compara fechas de dos pasos.
 */
const compararFechas = (pasoOriginal, pasoNuevo) => {
    return pasoOriginal.completado &&
        pasoNuevo.completado &&
        pasoOriginal.fecha !== pasoNuevo.fecha;
};

/**
 * Compara evidencias de dos pasos.
 */
const compararEvidencias = (pasoOriginal, pasoNuevo) => {
    return pasoOriginal.completado &&
        pasoNuevo.completado &&
        JSON.stringify(pasoOriginal.evidencias || {}) !==
        JSON.stringify(pasoNuevo.evidencias || {});
};

/**
 * Determina el tipo específico de cambio basado en flags.
 * 
 * LÓGICA MEJORADA:
 * - Si es primera completación → completacion
 * - Si es reapertura (tiene motivoReapertura) → reapertura
 * - Si solo cambia fecha (sin reapertura ni evidencias) → cambio_fecha
 * - Cambios de evidencias SIN reapertura → ignorar (no debería pasar)
 */
const determinarTipoCambio = ({
    huboComplecion,
    huboCambioFecha,
    huboCambioEvidencias,
    esReapertura
}) => {
    // Primera completación
    if (huboComplecion && !esReapertura) {
        return 'completacion';
    }

    // Reapertura (con o sin cambios de fecha/evidencias)
    if (esReapertura) {
        return 'reapertura';
    }

    // Edición solo de fecha (botón Editar Fecha) - sin evidencias
    if (huboCambioFecha && !huboCambioEvidencias) {
        return 'cambio_fecha';
    }

    // 🔥 FIX: Cambios de evidencias sin reapertura → NO CREAR LOG
    // Esto previene logs duplicados de "cambio de fecha" cuando solo cambiaron evidencias
    if (huboCambioEvidencias && !esReapertura) {
        // ℹ️  Cambio de evidencias sin reapertura se ignora para evitar logs duplicados
        return 'sin_cambios'; // ✅ Cambio de 'cambio_fecha' a 'sin_cambios'
    }

    return 'sin_cambios';
};

/**
 * Extrae el nombre limpio del paso desde el label.
 */
const extraerNombrePaso = (label) => {
    const dotIndex = label.indexOf('.');
    return dotIndex !== -1 ? label.substring(dotIndex + 1).trim() : label;
};
