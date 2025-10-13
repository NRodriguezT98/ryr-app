/**
 * auditoriaSistemaLegacy.js
 * 
 * Sistema de auditoría LEGACY (actual).
 * Genera mensajes ESPECTACULARES con emojis y usa createAuditLog.
 * 
 * ✨ FASE 2 MEJORADO: Usa sistema de plantillas moderno
 */

import { createAuditLog } from '../../auditService';
import { toTitleCase } from '../../../utils/textFormatters';
import { generarMensajeEspectacular, generarIconData } from './generadorMensajes';
import { construirAccesoEvidencias } from '../utils/evidenciasHelpers';

/**
 * Crea auditoría usando el sistema legacy.
 * 
 * @param {Array} cambios - Lista de cambios detectados
 * @param {string} clienteId - ID del cliente
 * @param {Object} clienteOriginal - Datos completos del cliente
 * @param {string} auditMessageFallback - Mensaje de auditoría fallback
 * @param {Object} auditDetailsFallback - Detalles de auditoría fallback
 */
export const crearAuditoriaLegacy = async (
    cambios,
    clienteId,
    clienteOriginal,
    auditMessageFallback,
    auditDetailsFallback
) => {
    const clienteNombre = toTitleCase(
        `${clienteOriginal.datosCliente.nombres} ${clienteOriginal.datosCliente.apellidos}`
    );

    let stepCompletionLogged = false;

    // Procesar cada cambio detectado
    for (const cambio of cambios) {
        const mensajeYDetalles = generarMensajeLegacy(cambio, clienteId, clienteNombre);

        await createAuditLog(mensajeYDetalles.mensaje, mensajeYDetalles.detalles);
        stepCompletionLogged = true;
    }

    // Solo crear log general si NO se completó ningún paso
    if (auditMessageFallback && auditDetailsFallback && !stepCompletionLogged) {
        await createAuditLog(auditMessageFallback, auditDetailsFallback);
    }
};

/**
 * Genera mensaje y detalles según el tipo de cambio (sistema legacy).
 * ✨ FASE 2: Usa generador de mensajes espectaculares
 */
const generarMensajeLegacy = (cambio, clienteId, clienteNombre) => {
    const { tipo, pasoNombre, pasoConfig, estadoOriginal, estadoNuevo, flags } = cambio;

    // ✨ NUEVO: Generar mensaje espectacular usando plantillas
    const mensaje = generarMensajeEspectacular(cambio, pasoConfig);

    // Generar iconData para compatibilidad con UI
    const iconData = generarIconData(tipo);

    let actionType;
    let scenario;
    let detalles = {
        category: 'clientes',
        clienteId: clienteId,
        clienteNombre: clienteNombre,
    };

    switch (tipo) {
        case 'completacion':
            if (flags.esReComplecion) {
                actionType = 'RECOMPLETE_PROCESS_STEP';
                scenario = 'STEP_RECOMPLETED';
                detalles = {
                    ...detalles,
                    pasoCompletado: pasoNombre,
                    completionDate: estadoNuevo.fecha,
                    evidenciasAdjuntas: estadoNuevo.evidencias,
                    motivoReapertura: estadoNuevo.motivoReapertura,
                    fechaReapertura: estadoNuevo.fechaReapertura,
                    estadoAnterior: estadoNuevo.estadoAnterior,
                    scenario: scenario,
                    iconData: iconData
                };
            } else {
                actionType = 'COMPLETE_PROCESS_STEP';
                scenario = 'FIRST_COMPLETION';
                detalles = {
                    ...detalles,
                    pasoCompletado: pasoNombre,
                    completionDate: estadoNuevo.fecha,
                    evidenciasAdjuntas: estadoNuevo.evidencias,
                    scenario: scenario,
                    iconData: iconData
                };
            }
            break;

        case 'reapertura':
            actionType = 'REOPEN_PROCESS_STEP_COMPLETE';
            scenario = 'STEP_REOPENED_WITH_CHANGES';
            detalles = {
                ...detalles,
                pasoReabierto: pasoNombre,
                fechaOriginal: estadoOriginal.fecha,
                motivoReapertura: estadoNuevo.motivoReapertura || 'No especificado',
                cambiosRealizados: {
                    fechaCambio: flags.huboCambioFecha,
                    evidenciasCambio: flags.huboCambioEvidencias
                },
                scenario: scenario,
                iconData: iconData
            };
            break;

        case 'cambios_durante_reapertura':
            actionType = 'REOPEN_PROCESS_STEP_COMPLETE';
            scenario = 'STEP_REOPENED_WITH_CHANGES';

            const evidenciasAcceso = construirAccesoEvidencias(
                estadoOriginal.evidencias,
                estadoNuevo.evidencias,
                pasoConfig
            );

            detalles = {
                ...detalles,
                pasoReabierto: pasoNombre,
                fechaOriginal: estadoOriginal.fecha || '',
                fechaNueva: estadoNuevo.fecha || '',
                motivoReapertura: estadoNuevo.motivoReapertura || 'No especificado',
                cambiosRealizados: {
                    fechaCambio: flags.huboCambioFecha,
                    evidenciasCambio: flags.huboCambioEvidencias
                },
                evidenciasDetalladas: {
                    originales: estadoOriginal.evidencias,
                    actuales: estadoNuevo.evidencias
                },
                scenario: scenario,
                iconData: iconData
            };

            if (evidenciasAcceso && evidenciasAcceso.length > 0) {
                detalles.evidenciasAcceso = evidenciasAcceso;
            }
            break;

        case 'cambio_fecha':
            actionType = 'CHANGE_COMPLETION_DATE';
            scenario = 'DATE_MODIFIED';
            detalles = {
                ...detalles,
                pasoModificado: pasoNombre,
                cambiosRealizados: ['fecha'],
                fechaOriginal: estadoOriginal.fecha || '',
                fechaNueva: estadoNuevo.fecha || '',
                evidenciasOriginales: estadoOriginal.evidencias,
                evidenciasNuevas: estadoNuevo.evidencias,
                scenario: scenario,
                iconData: iconData
            };
            break;

        case 'cambio_evidencias':
            actionType = 'CHANGE_STEP_EVIDENCE';
            scenario = 'EVIDENCE_MODIFIED';
            detalles = {
                ...detalles,
                pasoModificado: pasoNombre,
                cambiosRealizados: ['evidencias'],
                fechaOriginal: estadoOriginal.fecha || '',
                fechaNueva: estadoNuevo.fecha || '',
                evidenciasOriginales: estadoOriginal.evidencias,
                evidenciasNuevas: estadoNuevo.evidencias,
                scenario: scenario,
                iconData: iconData
            };

            // Agregar acceso a evidencias
            const evidenciasAccesoChange = construirAccesoEvidencias(
                estadoOriginal.evidencias,
                estadoNuevo.evidencias,
                pasoConfig
            );
            if (evidenciasAccesoChange && evidenciasAccesoChange.length > 0) {
                detalles.evidenciasAcceso = evidenciasAccesoChange;
            }
            break;

        case 'cambio_multiple':
            actionType = 'MODIFY_COMPLETED_STEP';
            scenario = 'STEP_MODIFIED';
            detalles = {
                ...detalles,
                pasoModificado: pasoNombre,
                cambiosRealizados: ['fecha', 'evidencias'],
                fechaOriginal: estadoOriginal.fecha || '',
                fechaNueva: estadoNuevo.fecha || '',
                evidenciasOriginales: estadoOriginal.evidencias,
                evidenciasNuevas: estadoNuevo.evidencias,
                scenario: scenario,
                iconData: iconData
            };

            const evidenciasAccesoMultiple = construirAccesoEvidencias(
                estadoOriginal.evidencias,
                estadoNuevo.evidencias,
                pasoConfig
            );
            if (evidenciasAccesoMultiple && evidenciasAccesoMultiple.length > 0) {
                detalles.evidenciasAcceso = evidenciasAccesoMultiple;
            }
            break;

        default:
            actionType = 'UPDATE_PROCESS';
            scenario = 'GENERIC_UPDATE';
            detalles.iconData = iconData;
    }

    detalles.action = actionType;

    return { mensaje, detalles };
};
