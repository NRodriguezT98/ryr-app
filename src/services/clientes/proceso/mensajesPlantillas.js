/**
 * mensajesPlantillas.js
 * 
 * Sistema de plantillas para mensajes de auditoría del proceso.
 * Genera mensajes ESPECTACULARES, completos y gráficamente atractivos
 * para el Tab Historial del cliente.
 * 
 * 🎯 Objetivo: Narrativa clara + Detalles completos + Belleza visual
 * 
 * SOLO 3 PLANTILLAS:
 * 1. COMPLETACIÓN (Primera vez)
 * 2. EDICIÓN DE FECHA (Solo fecha, sin evidencias)
 * 3. REAPERTURA (Con o sin cambios de fecha/evidencias)
 */

import { formatDisplayDate } from '../../../utils/textFormatters';

/**
 * PLANTILLAS MAESTRAS
 * Cada plantilla es una función que recibe datos y retorna un mensaje hermoso.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * 🎉 COMPLETACIÓN DE PASO (Primera vez)
 * ═══════════════════════════════════════════════════════════════
 */
export const PLANTILLA_COMPLETACION = (data) => {
    const { pasoNombre, fecha, evidencias, cantidadEvidencias } = data;

    let mensaje = `
╔════════════════════════════════════════════════════════════════╗
║  🎉  PASO COMPLETADO CON ÉXITO                                ║
╚════════════════════════════════════════════════════════════════╝

📋 PASO DEL PROCESO
   "${pasoNombre}"

📅 FECHA DE COMPLETADO
   ${formatDisplayDate(fecha)}
`;

    // Sección de evidencias con detalle completo
    if (cantidadEvidencias > 0) {
        const iconoEvidencias = cantidadEvidencias === 1 ? '📄' : '📋';
        const textoEvidencias = cantidadEvidencias === 1
            ? 'Se adjuntó 1 evidencia'
            : `Se adjuntaron ${cantidadEvidencias} evidencias`;

        mensaje += `
${iconoEvidencias} EVIDENCIAS ADJUNTAS
   ${textoEvidencias}:
`;
        evidencias.forEach((ev, index) => {
            mensaje += `   ${index + 1}. ${ev.nombre}\n`;
        });
    } else {
        mensaje += `
📝 EVIDENCIAS
   No se adjuntaron evidencias en este paso
`;
    }

    mensaje += `
╔════════════════════════════════════════════════════════════════╗
║  ✅ Este paso ha sido marcado como completado exitosamente   ║
╚════════════════════════════════════════════════════════════════╝
`;

    return mensaje.trim();
};

/**
 * ═══════════════════════════════════════════════════════════════
 * 🔄 REAPERTURA DE PASO (Con o sin cambios)
 * ═══════════════════════════════════════════════════════════════
 * Una reapertura SIEMPRE termina en completación.
 * Puede incluir cambios de fecha y/o reemplazo de evidencias.
 */
export const PLANTILLA_REAPERTURA = (data) => {
    const {
        pasoNombre,
        motivoReapertura,
        fechaAnterior,
        fechaNueva,
        evidenciasReemplazadas,
        evidenciasNuevas,
        cantidadEvidenciasAnterior,
        cantidadEvidenciasNueva,
        huboCambioFecha,
        huboCambioEvidencias
    } = data;

    let mensaje = `
╔════════════════════════════════════════════════════════════════╗
║  🔄  PASO REABIERTO Y COMPLETADO NUEVAMENTE                   ║
╚════════════════════════════════════════════════════════════════╝

📋 PASO DEL PROCESO
   "${pasoNombre}"

⚠️  MOTIVO DE REAPERTURA
   ${motivoReapertura}

📊 ESTADO ANTERIOR (Antes de reapertura)
   📅 Fecha de completado: ${formatDisplayDate(fechaAnterior)}
   📄 Evidencias: ${cantidadEvidenciasAnterior} archivo(s)
`;

    // Mostrar cambios realizados (si los hay)
    const huboCambios = huboCambioFecha || huboCambioEvidencias;

    if (huboCambios) {
        mensaje += `
═══════════════════════════════════════════════════════════════

🔧 CAMBIOS REALIZADOS
`;

        // Cambio de fecha
        if (huboCambioFecha) {
            mensaje += `
   📅 FECHA DE COMPLETADO MODIFICADA:
      Anterior: ${formatDisplayDate(fechaAnterior)}
      Nueva:    ${formatDisplayDate(fechaNueva)}
      
      ${getFlechaDireccion(fechaAnterior, fechaNueva)} ${getDescripcionCambioFecha(fechaAnterior, fechaNueva)}
`;
        }

        // Cambio de evidencias (REEMPLAZO)
        if (huboCambioEvidencias && evidenciasReemplazadas && evidenciasReemplazadas.length > 0) {
            mensaje += `
   📄 EVIDENCIAS REEMPLAZADAS:
`;
            evidenciasReemplazadas.forEach((reemplazo, index) => {
                mensaje += `      ${index + 1}. "${reemplazo.anterior}" ➡️  "${reemplazo.nueva}"\n`;
            });
        }
    } else {
        mensaje += `
═══════════════════════════════════════════════════════════════

✅ REAPERTURA SIN CAMBIOS
   El paso fue reabierto y completado nuevamente sin modificaciones
`;
    }

    // Estado final
    mensaje += `
═══════════════════════════════════════════════════════════════

📊 ESTADO FINAL
   📅 Fecha de completado: ${formatDisplayDate(fechaNueva)}
   📄 Total de evidencias: ${cantidadEvidenciasNueva} archivo(s)
`;

    if (cantidadEvidenciasNueva > 0) {
        mensaje += `
📋 EVIDENCIAS FINALES
`;
        evidenciasNuevas.forEach((ev, index) => {
            mensaje += `   ${index + 1}. ${ev.nombre}\n`;
        });
    }

    mensaje += `
╔════════════════════════════════════════════════════════════════╗
║  ✅ Paso completado nuevamente con historial preservado      ║
╚════════════════════════════════════════════════════════════════╝
`;

    return mensaje.trim();
};

/**
 * ═══════════════════════════════════════════════════════════════
 * 📅 EDICIÓN DE FECHA (Solo fecha, sin tocar evidencias)
 * ═══════════════════════════════════════════════════════════════
 * Cuando se usa el botón "Editar Fecha" ÚNICAMENTE se modifica
 * la fecha de completado. NO se muestran evidencias.
 */
export const PLANTILLA_EDICION_FECHA = (data) => {
    const {
        pasoNombre,
        fechaAnterior,
        fechaNueva
    } = data;

    let mensaje = `
╔════════════════════════════════════════════════════════════════╗
║  �  FECHA DE COMPLETADO MODIFICADA                           ║
╚════════════════════════════════════════════════════════════════╝

📋 PASO MODIFICADO
   "${pasoNombre}"

📅 CAMBIO DE FECHA
   Anterior: ${formatDisplayDate(fechaAnterior)}
   Nueva:    ${formatDisplayDate(fechaNueva)}
   
   ${getFlechaDireccion(fechaAnterior, fechaNueva)} ${getDescripcionCambioFecha(fechaAnterior, fechaNueva)}

╔════════════════════════════════════════════════════════════════╗
║  ✅ Fecha actualizada correctamente                           ║
╚════════════════════════════════════════════════════════════════╝
`;

    return mensaje.trim();
};

/**
 * ═══════════════════════════════════════════════════════════════
 * FUNCIONES HELPER PARA MEJORAR LA NARRATIVA
 * ═══════════════════════════════════════════════════════════════
 */

/**
 * Obtiene flecha direccional según el cambio de fecha
 */
function getFlechaDireccion(fechaAnterior, fechaNueva) {
    const dateAnterior = new Date(fechaAnterior);
    const dateNueva = new Date(fechaNueva);

    if (dateNueva > dateAnterior) {
        return '⬆️';
    } else if (dateNueva < dateAnterior) {
        return '⬇️';
    } else {
        return '➡️';
    }
}

/**
 * Genera descripción textual del cambio de fecha
 */
function getDescripcionCambioFecha(fechaAnterior, fechaNueva) {
    const dateAnterior = new Date(fechaAnterior);
    const dateNueva = new Date(fechaNueva);

    const diferenciaDias = Math.abs(Math.floor((dateNueva - dateAnterior) / (1000 * 60 * 60 * 24)));

    if (dateNueva > dateAnterior) {
        if (diferenciaDias === 0) return 'Mismo día, hora ajustada';
        if (diferenciaDias === 1) return 'Adelantado 1 día';
        if (diferenciaDias < 7) return `Adelantado ${diferenciaDias} días`;
        if (diferenciaDias < 30) return `Adelantado ${Math.floor(diferenciaDias / 7)} semana(s)`;
        return `Adelantado ${Math.floor(diferenciaDias / 30)} mes(es)`;
    } else if (dateNueva < dateAnterior) {
        if (diferenciaDias === 0) return 'Mismo día, hora ajustada';
        if (diferenciaDias === 1) return 'Retrocedido 1 día';
        if (diferenciaDias < 7) return `Retrocedido ${diferenciaDias} días`;
        if (diferenciaDias < 30) return `Retrocedido ${Math.floor(diferenciaDias / 7)} semana(s)`;
        return `Retrocedido ${Math.floor(diferenciaDias / 30)} mes(es)`;
    } else {
        return 'Fecha sin cambios';
    }
}
