/**
 * auditoriaSistemaUnificado.js
 * 
 * Sistema de auditoría UNIFICADO (nuevo).
 * Usa ACTION_TYPES y createClientAuditLog.
 */

import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { createClientAuditLog, ACTION_TYPES } from '../../unifiedAuditService';
import { toTitleCase } from '../../../utils/textFormatters';

// Importamos helper para obtener nombre de evidencia
import { obtenerNombreEvidencia } from '../../../services/clientes/clienteAuditHelpers';

// Importar generador de mensajes espectaculares
import { generarMensajeEspectacular } from './generadorMensajes';

// 🆕 FASE 1: Importar builder de datos estructurados
import { buildStructuredData, createLogData } from './structuredDataBuilder';

/**
 * Crea auditoría usando el sistema unificado.
 * 
 * @param {Array} cambios - Lista de cambios detectados
 * @param {string} clienteId - ID del cliente
 * @param {Object} clienteOriginal - Datos completos del cliente
 */
export const crearAuditoriaUnificada = async (cambios, clienteId, clienteOriginal) => {
    // Preparar datos contextuales
    const clienteData = {
        id: clienteId,
        nombres: clienteOriginal.datosCliente?.nombres,
        apellidos: clienteOriginal.datosCliente?.apellidos,
        nombre: toTitleCase(
            `${clienteOriginal.datosCliente?.nombres} ${clienteOriginal.datosCliente?.apellidos}`
        )
    };

    // Obtener datos de vivienda y proyecto si existen
    let viviendaData = {};
    let proyectoData = {};

    if (clienteOriginal.viviendaId) {
        const viviendaRef = doc(db, "viviendas", String(clienteOriginal.viviendaId));
        const viviendaSnap = await getDoc(viviendaRef);

        if (viviendaSnap.exists()) {
            viviendaData = viviendaSnap.data();

            if (viviendaData.proyectoId) {
                const proyectoRef = doc(db, "proyectos", String(viviendaData.proyectoId));
                const proyectoSnap = await getDoc(proyectoRef);

                if (proyectoSnap.exists()) {
                    proyectoData = proyectoSnap.data();
                }
            }
        }
    }

    // 🔥 FIX: Crear timestamp base y agregar 1ms entre cada log para garantizar orden único
    const baseTimestamp = new Date();

    // Procesar cada cambio detectado con timestamps incrementales
    for (let i = 0; i < cambios.length; i++) {
        const cambio = cambios[i];
        // Cada log sucesivo tiene +1ms para mantener orden cronológico
        const timestampUnico = new Date(baseTimestamp.getTime() + i);
        await crearLogUnificado(cambio, clienteData, viviendaData, proyectoData, clienteOriginal, timestampUnico);
    }
};

/**
 * Crea un log unificado para un cambio específico.
 */
const crearLogUnificado = async (cambio, clienteData, viviendaData, proyectoData, clienteOriginal, customTimestamp) => {
    const { tipo, pasoKey, pasoNombre, pasoConfig, estadoOriginal, estadoNuevo, flags } = cambio;

    // Generar mensaje espectacular usando las plantillas FASE 2
    // Pasar datos financieros para calcular número de paso
    const mensajeEspectacular = generarMensajeEspectacular(
        cambio,
        pasoConfig,
        clienteOriginal.financiero || {}
    );

    // 🆕 FASE 1: Generar datos estructurados
    const structured = buildStructuredData(
        cambio,
        pasoConfig,
        clienteOriginal.financiero || {}
    );

    // Crear log data completo (mensaje + structured)
    const logData = createLogData(mensajeEspectacular, structured);

    // Mapear evidencias (mantenido para actionData legacy)
    const mapEvidencias = (evidencias) => {
        if (!evidencias) return [];
        return Object.entries(evidencias).map(([id, evidencia]) => ({
            id,
            nombre: obtenerNombreEvidencia(id, evidencia, pasoConfig),
            displayName: evidencia.displayName || evidencia.nombre,
            tipo: evidencia.tipo || 'archivo',
            url: evidencia.url
        }));
    };

    // Preparar actionData
    let actionType;
    let actionData = {
        pasoId: pasoKey,
        pasoNombre: pasoNombre,
        procesoId: pasoConfig.proceso || 'general',
        procesoNombre: 'Proceso de Cliente',
        fechaComplecion: estadoNuevo.fecha,
        evidenciasAntes: mapEvidencias(estadoOriginal.evidencias),
        evidenciasDespues: mapEvidencias(estadoNuevo.evidencias),
        esReComplecion: false,
        esPrimeraComplecion: false,
        fechaAnterior: estadoOriginal.fecha,
        cambioSoloFecha: false,
        cambioSoloEvidencias: false
    };

    // Determinar actionType según tipo de cambio
    switch (tipo) {
        case 'completacion':
            actionType = ACTION_TYPES.CLIENTES.COMPLETE_PROCESS_STEP;
            actionData.esReComplecion = flags.esReComplecion;
            actionData.esPrimeraComplecion = !flags.esReComplecion;

            if (flags.esReComplecion) {
                actionData.motivoReapertura = estadoNuevo.motivoReapertura;
                actionData.fechaReapertura = estadoNuevo.fechaReapertura;
                actionData.estadoAnterior = estadoNuevo.estadoAnterior;
            }
            break;

        case 'reapertura':
            actionType = ACTION_TYPES.CLIENTES.REOPEN_PROCESS_STEP;
            break;

        case 'cambio_fecha':
            actionType = ACTION_TYPES.CLIENTES.CHANGE_COMPLETION_DATE;
            actionData.cambioSoloFecha = true;
            break;

        case 'cambio_evidencias':
            actionType = ACTION_TYPES.CLIENTES.CHANGE_STEP_EVIDENCE;
            actionData.cambioSoloEvidencias = true;
            break;

        case 'cambios_durante_reapertura':
        case 'cambio_multiple':
            actionType = ACTION_TYPES.CLIENTES.COMPLETE_PROCESS_STEP;
            actionData.esReComplecion = true;
            break;

        default:
            actionType = ACTION_TYPES.CLIENTES.COMPLETE_PROCESS_STEP;
    }

    // Crear el audit log
    try {
        await createClientAuditLog(
            actionType,
            clienteData,
            {
                viviendaId: clienteOriginal.viviendaId,
                proyectoId: proyectoData.id,
                vivienda: {
                    id: viviendaData.id,
                    manzana: viviendaData.manzana,
                    numeroCasa: viviendaData.numeroCasa,
                    proyecto: proyectoData.nombre
                },
                proyecto: {
                    id: proyectoData.id,
                    nombre: proyectoData.nombre
                },
                actionData: actionData
            },
            {
                message: logData.message,           // 🆕 FASE 1: Mensaje para humanos
                structured: logData.structured,      // 🆕 FASE 1: Datos estructurados para la app
                timestamp: customTimestamp           // Timestamp único para cada log
            }
        );
    } catch (error) {
        console.error('❌ ERROR guardando log:', error);
        throw error;
    }
};
