import React from 'react';
import { Award, ShieldCheck, Handshake, PenSquare, FileCheck2, Search, FileSignature, FileUp, UserPlus, AlertTriangle, CheckCircle } from 'lucide-react';
import { PASOS_SEGUIMIENTO_CONFIG, PROCESS_STAGES_ORDER } from './seguimientoConfig'; // Importamos las nuevas constantes

// Configuraciones visuales para las etapas explícitas
const STATUS_CONFIG_DETAILED = {
    'DOCUMENTACION_INICIAL': { text: 'Recopilando Documentación', color: 'bg-gray-100 text-gray-800', icon: <FileUp size={14} /> },
    'PROCESO_PROMESA': { text: 'Proceso de Promesa', color: 'bg-pink-100 text-pink-800', icon: <FileSignature size={14} /> },
    'PROCESO_AVALUO': { text: 'En Proceso de Avalúo', color: 'bg-purple-100 text-purple-800', icon: <Search size={14} /> },
    'ESTUDIO_TITULOS_Y_ESCRITURA': { text: 'Estudio de Títulos / Escritura', color: 'bg-indigo-100 text-indigo-800', icon: <FileCheck2 size={14} /> },
    'ENTREGA_REGISTRO_Y_DESEMBOLSO': { text: 'Entrega / Registro / Desembolso', color: 'bg-blue-100 text-blue-800', icon: <Handshake size={14} /> },
    'PROCESO_COMPLETADO': { text: 'Proceso Completado', color: 'bg-green-100 text-green-800', icon: <Award size={14} /> },
    'RENUNCIA_CLIENTE': { text: 'Renuncia Pendiente', color: 'bg-orange-100 text-orange-800', icon: <AlertTriangle size={14} /> },
    'DESCONOCIDO': { text: 'Estado Desconocido', color: 'bg-gray-100 text-gray-800', icon: <UserPlus size={14} /> },
};


/**
 * Determina la etapa actual del proceso de un cliente basándose en los pasos de seguimiento completados.
 * Prioriza la etapa más avanzada que tenga al menos un paso completado, siguiendo el orden definido.
 *
 * @param {object} clientData - Objeto completo del cliente, incluyendo 'seguimiento'.
 * @returns {string} El nombre de la etapa actual del proceso (ej. 'PROCESO_PROMESA').
 */
export const getCurrentProcessStage = (clientData) => {
    if (!clientData || !clientData.seguimiento) return PROCESS_STAGES_ORDER[0]; // 'DOCUMENTACION_INICIAL'

    const completedSteps = clientData.seguimiento;
    let highestStage = PROCESS_STAGES_ORDER[0]; // Estado por defecto

    // Si el cliente está renunciado o su vivienda a paz y salvo, priorizar esos estados finales
    if (clientData.status === 'renunciado') { // Asumiendo que 'renunciado' es un status final manejado aparte.
        return 'RENUNCIA_CLIENTE';
    }
    // Si la vivienda está a paz y salvo (saldo 0 o menos), el proceso principal está completado
    if (clientData.vivienda && clientData.vivienda.saldoPendiente <= 0) {
        return 'PROCESO_COMPLETADO';
    }

    // Recorre las etapas en orden inverso para encontrar la más avanzada con pasos completados
    for (let i = PROCESS_STAGES_ORDER.length - 1; i >= 0; i--) {
        const stage = PROCESS_STAGES_ORDER[i];
        if (stage === 'DOCUMENTACION_INICIAL' || stage === 'PROCESO_COMPLETADO' || stage === 'RENUNCIA_CLIENTE') continue; // Estas se manejan por lógica específica

        // Encuentra si hay algún paso de esta etapa que esté completado
        const stepsInThisStage = PASOS_SEGUIMIENTO_CONFIG.filter(paso => paso.stage === stage);
        const isAnyStepInStageCompleted = stepsInThisStage.some(paso => completedSteps[paso.key]?.completado);

        if (isAnyStepInStageCompleted) {
            highestStage = stage;
            break; // Una vez que encontramos la etapa más alta con algún paso completado, salimos.
        }
    }

    return highestStage;
};

/**
 * Determina el estado general del cliente para la UI, usando el nuevo campo 'currentStage'.
 *
 * @param {object} cliente - Objeto completo del cliente.
 * @returns {object} Un objeto con texto, color e ícono del estado.
 */
export const determineClientStatus = (cliente) => {
    if (!cliente) return STATUS_CONFIG_DETAILED.DESCONOCIDO;

    // Prioriza el estado de renuncia si aplica
    // Nota: 'tieneRenunciaPendiente' es una propiedad que se puede calcular en useListarClientes
    // o DataContext si no viene directamente del documento de Firebase.
    if (cliente.tieneRenunciaPendiente || cliente.status === 'renunciado') {
        return STATUS_CONFIG_DETAILED.RENUNCIA_CLIENTE;
    }

    // Usa el campo currentStage del cliente como la fuente principal de la verdad
    // Asegurarse de que 'cliente.currentStage' esté definido y sea uno de los esperados
    return STATUS_CONFIG_DETAILED[cliente.currentStage] || STATUS_CONFIG_DETAILED.DESCONOCIDO;
};