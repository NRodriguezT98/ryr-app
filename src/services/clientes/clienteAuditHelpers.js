/**
 * Helpers para generación de mensajes de auditoría del proceso de clientes
 * 🔥 REFACTORIZACIÓN: Extraído de clienteService.js (300 líneas)
 */

import { formatCurrency, formatDisplayDate, toTitleCase, getTodayString } from "../../utils/textFormatters";
import { generarMensajeEspectacular } from './proceso/generadorMensajes';
import { detectarCambiosProceso } from './proceso/cambiosDetector';
import { DOCUMENTACION_CONFIG } from '../../utils/documentacionConfig';

/**
 * Obtiene el nombre legible de una evidencia
 * @param {string} evidenciaId - ID de la evidencia
 * @param {Object} evidencia - Datos de la evidencia
 * @param {Object} pasoConfig - Configuración del paso del proceso
 * @returns {string} Nombre legible de la evidencia
 */
export const obtenerNombreEvidencia = (evidenciaId, evidencia, pasoConfig) => {
    // PRIORIDAD: Buscar el label en DOCUMENTACION_CONFIG
    const docConfig = DOCUMENTACION_CONFIG.find(doc => doc.id === evidenciaId);
    if (docConfig) {
        return docConfig.label;
    }

    // Fallback al nombre de la configuración del proceso
    const evidenciaConfig = pasoConfig.evidenciasRequeridas?.find(ev => ev.id === evidenciaId);
    if (evidenciaConfig && evidenciaConfig.nombre) {
        return evidenciaConfig.nombre;
    }

    // Último fallback
    return evidencia?.nombre || evidencia?.name || evidencia?.originalName || evidenciaId;
};

/**
 * Construye la lista de evidencias adjuntas para mostrar en auditoría
 * @param {Object} evidencias - Objeto con evidencias del paso
 * @param {Object} pasoConfig - Configuración del paso
 * @returns {{texto: string, cantidad: number}} Texto formateado y cantidad de evidencias
 */
export const construirListaEvidencias = (evidencias, pasoConfig) => {
    if (!evidencias || Object.keys(evidencias).length === 0) {
        return { texto: '', cantidad: 0 };
    }

    const evidenciasAdjuntas = [];
    Object.entries(evidencias).forEach(([evidenciaId, evidencia]) => {
        if (evidencia && (evidencia.url || evidencia.nombre || evidencia.originalName)) {
            const nombreEvidencia = obtenerNombreEvidencia(evidenciaId, evidencia, pasoConfig);
            if (nombreEvidencia) {
                evidenciasAdjuntas.push(nombreEvidencia);
            }
        }
    });

    let texto = '';
    if (evidenciasAdjuntas.length > 0) {
        if (evidenciasAdjuntas.length === 1) {
            texto = `\n   • ${evidenciasAdjuntas[0]}`;
        } else {
            texto = `\n   • ${evidenciasAdjuntas.join('\n   • ')}`;
        }
    }

    return { texto, cantidad: evidenciasAdjuntas.length };
};

/**
 * Genera mensaje de auditoría para completar un paso del proceso
 * @param {string} pasoNombre - Nombre del paso completado
 * @param {Object} pasoData - Datos del paso (fecha, evidencias)
 * @param {Object} pasoConfig - Configuración del paso
 * @returns {string} Mensaje formateado para auditoría
 */
export const generarMensajeComplecion = (pasoNombre, pasoData, pasoConfig) => {
    const { texto: evidenciasTexto, cantidad } = construirListaEvidencias(pasoData.evidencias, pasoConfig);
    const fechaFormulario = pasoData.fecha;

    if (evidenciasTexto) {
        const iconoEvidencia = cantidad === 1 ? '📄' : '📋';
        const textoEvidencias = cantidad === 1 ? 'se adjuntó la evidencia' : `se adjuntaron ${cantidad} evidencias`;

        return `🎉 ¡Paso completado con éxito!

📋 Paso: "${pasoNombre}"
${iconoEvidencia} Evidencias: ${textoEvidencias}:${evidenciasTexto}
📅 Fecha de completado: ${formatDisplayDate(fechaFormulario)}`;
    } else {
        return `🎉 ¡Paso completado con éxito!

📋 Paso: "${pasoNombre}"
📝 Sin evidencias adjuntas
📅 Fecha de completado: ${formatDisplayDate(fechaFormulario)}`;
    }
};

/**
 * Genera mensaje de auditoría para reapertura de un paso
 * @param {string} pasoNombre - Nombre del paso reabierto
 * @param {Object} pasoOriginal - Datos originales del paso
 * @param {Object} pasoActual - Datos actuales del paso
 * @returns {string} Mensaje formateado para auditoría
 */
export const generarMensajeReapertura = (pasoNombre, pasoOriginal, pasoActual) => {
    const motivo = pasoActual.motivoReapertura || 'No especificado';
    const fechaOriginal = formatDisplayDate(pasoOriginal.fecha);

    return `🔄 Reapertura de paso

📋 Paso: "${pasoNombre}"
⚠️  Motivo: ${motivo}
📅 Fecha original de completado: ${fechaOriginal}
🔓 El paso fue marcado como pendiente nuevamente`;
};

/**
 * Genera mensaje de auditoría para recompletado de un paso
 * @param {string} pasoNombre - Nombre del paso recompletado
 * @param {Object} pasoOriginal - Datos originales del paso
 * @param {Object} pasoActual - Datos actuales del paso
 * @param {Object} pasoConfig - Configuración del paso
 * @returns {string} Mensaje formateado para auditoría
 */
export const generarMensajeReCompletado = (pasoNombre, pasoOriginal, pasoActual, pasoConfig) => {
    const { texto: evidenciasTexto, cantidad } = construirListaEvidencias(pasoActual.evidencias, pasoConfig);
    const fechaNuevaFormulario = pasoActual.fecha;
    const fechaOriginalFormulario = pasoOriginal.fecha;

    let mensaje = `🔄 Paso completado nuevamente

📋 Paso: "${pasoNombre}"
📅 Fecha original: ${formatDisplayDate(fechaOriginalFormulario)}
📅 Nueva fecha: ${formatDisplayDate(fechaNuevaFormulario)}`;

    if (evidenciasTexto) {
        const iconoEvidencia = cantidad === 1 ? '📄' : '📋';
        const textoEvidencias = cantidad === 1 ? 'evidencia actualizada' : `${cantidad} evidencias actualizadas`;
        mensaje += `\n${iconoEvidencia} ${textoEvidencias}:${evidenciasTexto}`;
    } else {
        mensaje += `\n📝 Sin evidencias adjuntas`;
    }

    return mensaje;
};

/**
 * Analiza y genera todas las actividades del proceso entre versión original y actual
 * 🔥 REFACTORIZADO: Ahora usa el nuevo sistema de detección de cambios y plantillas espectaculares
 * 
 * @param {Object} procesoOriginal - Proceso antes de los cambios
 * @param {Object} procesoActual - Proceso después de los cambios
 * @param {string} userName - Nombre del usuario que hizo los cambios
 * @param {Array} PROCESO_CONFIG - Configuración de todos los pasos del proceso (no usado, se mantiene por compatibilidad)
 * @returns {Object} Proceso actualizado con actividad generada
 */
export const generarActividadProceso = (procesoOriginal, procesoActual, userName, PROCESO_CONFIG) => {
    const nuevoProcesoConActividad = JSON.parse(JSON.stringify(procesoActual));

    // Detectar cambios usando el sistema unificado
    const cambios = detectarCambiosProceso(procesoOriginal, procesoActual);

    // Generar actividad para cada cambio detectado
    cambios.forEach(cambio => {
        const { pasoKey, pasoConfig } = cambio;
        const pasoActualData = nuevoProcesoConActividad[pasoKey];

        if (!pasoActualData) return;

        // Inicializar actividad si no existe
        if (!pasoActualData.actividad) {
            pasoActualData.actividad = [];
        }

        // Generar mensaje espectacular usando las plantillas refactorizadas
        const mensaje = generarMensajeEspectacular(cambio, pasoConfig);

        // Agregar a la actividad
        pasoActualData.actividad.push({
            tipo: cambio.tipo,
            usuario: userName,
            fecha: new Date().toISOString(),
            mensaje: mensaje
        });
    });

    return nuevoProcesoConActividad;
};
