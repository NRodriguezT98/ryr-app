/**
 * generadorMensajes.js
 * 
 * Motor de generación de mensajes usando plantillas.
 * Analiza cambios y prepara datos para las plantillas espectaculares.
 * 
 * REFACTORIZADO: Solo 3 plantillas según la lógica real del negocio:
 * 1. COMPLETACIÓN (Primera vez)
 * 2. EDICIÓN DE FECHA (Solo fecha)
 * 3. REAPERTURA (Con o sin cambios)
 */

import {
    PLANTILLA_COMPLETACION,
    PLANTILLA_REAPERTURA,
    PLANTILLA_EDICION_FECHA
} from './mensajesPlantillas';
import { DOCUMENTACION_CONFIG } from '../../../utils/documentacionConfig';
import { PROCESO_CONFIG } from '../../../utils/procesoConfig';

/**
 * Genera mensaje espectacular según el tipo de cambio detectado.
 * 
 * @param {Object} cambio - Cambio detectado por cambiosDetector
 * @param {Object} pasoConfig - Configuración del paso
 * @param {Object} financiero - Datos financieros del cliente para calcular pasos aplicables
 * @returns {string} Mensaje hermoso y completo
 */
export const generarMensajeEspectacular = (cambio, pasoConfig, financiero = {}) => {
    const { tipo, pasoNombre, estadoOriginal, estadoNuevo, flags, pasoKey } = cambio;

    // Calcular número del paso y total de pasos
    const pasosAplicables = PROCESO_CONFIG.filter(p =>
        typeof p.aplicaA === 'function' ? p.aplicaA(financiero) : true
    );
    const numeroPaso = pasosAplicables.findIndex(p => p.key === pasoKey) + 1;
    const totalPasos = pasosAplicables.length;

    // Preparar evidencias
    const evidenciasOriginales = prepararEvidencias(estadoOriginal.evidencias, pasoConfig);
    const evidenciasNuevas = prepararEvidencias(estadoNuevo.evidencias, pasoConfig);

    switch (tipo) {
        case 'completacion':
            // Primera completación
            return PLANTILLA_COMPLETACION({
                pasoNombre,
                fecha: estadoNuevo.fecha,
                evidencias: evidenciasNuevas,
                cantidadEvidencias: evidenciasNuevas.length,
                numeroPaso,
                totalPasos
            });

        case 'reapertura':
            // Reapertura con o sin cambios
            // 🔥 IMPORTANTE: Para reaperturas, debemos comparar con el estadoAnterior guardado
            const fechaAnteriorReapertura = estadoNuevo.estadoAnterior?.fecha || estadoOriginal.fecha;
            const fechaNuevaReapertura = estadoNuevo.fecha;

            // Detectar cambio de fecha comparando estado anterior con estado nuevo
            const huboCambioFechaReapertura = fechaAnteriorReapertura !== fechaNuevaReapertura;

            // Para evidencias, usar el estadoAnterior si existe
            const evidenciasAntesDeReabrir = prepararEvidencias(
                estadoNuevo.estadoAnterior?.evidencias || estadoOriginal.evidencias,
                pasoConfig
            );

            // Detectar reemplazos de evidencias
            const evidenciasReemplazadas = detectarReemplazosEvidencias(
                evidenciasAntesDeReabrir,
                evidenciasNuevas,
                pasoConfig
            );

            const mensajeGenerado = PLANTILLA_REAPERTURA({
                pasoNombre,
                motivoReapertura: estadoNuevo.motivoReapertura || 'No especificado',
                fechaAnterior: fechaAnteriorReapertura,
                fechaNueva: fechaNuevaReapertura,
                evidenciasReemplazadas,
                evidenciasNuevas,
                cantidadEvidenciasAnterior: evidenciasAntesDeReabrir.length,
                cantidadEvidenciasNueva: evidenciasNuevas.length,
                huboCambioFecha: huboCambioFechaReapertura,
                huboCambioEvidencias: evidenciasReemplazadas.length > 0,
                numeroPaso,
                totalPasos
            });

            console.log('📝 [REAPERTURA] Mensaje generado para:', pasoNombre);

            return mensajeGenerado;

        case 'cambio_fecha':
            // Edición SOLO de fecha (botón Editar Fecha)
            return PLANTILLA_EDICION_FECHA({
                pasoNombre,
                fechaAnterior: estadoOriginal.fecha,
                fechaNueva: estadoNuevo.fecha,
                numeroPaso,
                totalPasos
            });

        default:
            // Fallback genérico
            return `Cambio detectado en paso "${pasoNombre}"`;
    }
};

/**
 * Prepara evidencias en formato limpio para las plantillas.
 * 
 * @param {Object} evidenciasObj - Objeto de evidencias de Firestore
 * @param {Object} pasoConfig - Configuración del paso
 * @returns {Array} Array de evidencias con nombre legible
 */
function prepararEvidencias(evidenciasObj, pasoConfig) {
    if (!evidenciasObj || Object.keys(evidenciasObj).length === 0) {
        return [];
    }

    return Object.entries(evidenciasObj).map(([id, evidencia]) => ({
        id,
        nombre: obtenerNombreLegible(id, evidencia, pasoConfig),
        displayName: evidencia.displayName || evidencia.nombre,
        url: evidencia.url,
        tipo: evidencia.tipo || 'archivo'
    }));
}

/**
 * Detecta reemplazos de evidencias en una reapertura.
 * Un reemplazo ocurre cuando:
 * 1. Mismo número de evidencias antes y después
 * 2. Mismo tipo de evidencia (mismo ID en config)
 * 3. URL diferente (archivo diferente)
 * 
 * @param {Array} evidenciasOriginales - Evidencias antes de la reapertura
 * @param {Array} evidenciasNuevas - Evidencias después de completar
 * @param {Object} pasoConfig - Configuración del paso
 * @returns {Array} Array de reemplazos {anterior, nueva}
 */
function detectarReemplazosEvidencias(evidenciasOriginales, evidenciasNuevas, pasoConfig) {
    const reemplazos = [];

    // Si no hay el mismo número, no son reemplazos sino cambios
    if (evidenciasOriginales.length !== evidenciasNuevas.length) {
        return [];
    }

    // Comparar por ID de evidencia (tipo de documento)
    const mapaOriginales = new Map(evidenciasOriginales.map(ev => [ev.id, ev]));
    const mapaNuevas = new Map(evidenciasNuevas.map(ev => [ev.id, ev]));

    for (const [id, evOriginal] of mapaOriginales) {
        const evNueva = mapaNuevas.get(id);

        if (evNueva && evOriginal.url !== evNueva.url) {
            // Es un reemplazo: mismo tipo de documento, diferente archivo
            reemplazos.push({
                id,
                anterior: evOriginal.nombre,
                nueva: evNueva.nombre
            });
        }
    }

    return reemplazos;
}

/**
 * Obtiene nombre legible de una evidencia.
 * Reutiliza la lógica existente del sistema.
 */
function obtenerNombreLegible(evidenciaId, evidencia, pasoConfig) {
    // PRIORIDAD 1: Buscar en DOCUMENTACION_CONFIG
    const docConfig = DOCUMENTACION_CONFIG.find(doc => doc.id === evidenciaId);
    if (docConfig) {
        return docConfig.label;
    }

    // PRIORIDAD 2: Configuración del paso
    const evidenciaConfig = pasoConfig.evidenciasRequeridas?.find(ev => ev.id === evidenciaId);
    if (evidenciaConfig && evidenciaConfig.nombre) {
        return evidenciaConfig.nombre;
    }

    // PRIORIDAD 3: Nombre del archivo
    return evidencia?.displayName || evidencia?.nombre || evidencia?.name || evidencia?.originalName || evidenciaId;
}

/**
 * Genera datos iconográficos para el sistema legacy.
 * Mantiene compatibilidad con el sistema de iconos actual.
 */
export const generarIconData = (tipoCambio) => {
    const iconMap = {
        'completacion': {
            mainIcon: 'CheckCircle',
            sections: {
                paso: 'FileText',
                fecha: 'Calendar',
                evidencias: 'Paperclip'
            }
        },
        'reapertura': {
            mainIcon: 'RefreshCw',
            sections: {
                paso: 'FileText',
                motivo: 'AlertTriangle',
                cambios: 'Edit',
                evidencias: 'Paperclip'
            }
        },
        'cambio_fecha': {
            mainIcon: 'Calendar',
            sections: {
                fecha: 'Calendar'
            }
        }
    };

    return iconMap[tipoCambio] || {
        mainIcon: 'FileText',
        sections: {}
    };
};
