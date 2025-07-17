// src/utils/seguimientoConfig.js

// Define el orden explícito de las etapas del proceso del cliente.
// Estas serán los valores posibles para el nuevo campo 'currentStage' en el documento del cliente.
export const PROCESS_STAGES_ORDER = [
    'DOCUMENTACION_INICIAL',
    'PROCESO_PROMESA',
    'PROCESO_AVALUO',
    'ESTUDIO_TITULOS_Y_ESCRITURA',
    'ENTREGA_REGISTRO_Y_DESEMBOLSO',
    'PROCESO_COMPLETADO', // Etapa final cuando todo está en orden
];

// Aquí definimos todos los pasos posibles y la lógica para saber si aplican a un cliente,
// y a qué etapa principal del proceso pertenecen.
export const PASOS_SEGUIMIENTO_CONFIG = [
    // Etapa: DOCUMENTACION_INICIAL (No hay un paso específico que "active" esta etapa, es la predeterminada)
    // Los pasos iniciales de documentación como 'urlCedula' están en los datos del cliente.

    // Etapa: PROCESO_PROMESA
    {
        key: 'promesaEnviada',
        label: 'Promesa de Compraventa Enviada',
        aplicaA: () => true,
        stage: 'PROCESO_PROMESA'
    },
    {
        key: 'promesaRecibida',
        label: 'Promesa de Compraventa Firmada',
        aplicaA: () => true,
        stage: 'PROCESO_PROMESA'
    },

    // Etapa: PROCESO_AVALUO
    {
        key: 'envioDocumentacionAvaluo',
        label: 'Envío documentación para Avalúo',
        aplicaA: (financiero) => financiero.aplicaCredito,
        stage: 'PROCESO_AVALUO'
    },
    {
        key: 'avaluoRealizado',
        label: 'Avalúo Realizado',
        aplicaA: (financiero) => financiero.aplicaCredito,
        stage: 'PROCESO_AVALUO'
    },

    // Etapa: ESTUDIO_TITULOS_Y_ESCRITURA
    {
        key: 'pagoEstudioTitulos',
        label: 'Pago Estudio de Títulos',
        aplicaA: () => true,
        stage: 'ESTUDIO_TITULOS_Y_ESCRITURA'
    },
    {
        key: 'escrituraEnviada',
        label: 'Escritura Enviada a Notaría',
        aplicaA: () => true,
        stage: 'ESTUDIO_TITULOS_Y_ESCRITURA'
    },
    {
        key: 'escrituraFirmada',
        label: 'Escritura Firmada por Cliente',
        aplicaA: () => true,
        stage: 'ESTUDIO_TITULOS_Y_ESCRITURA'
    },

    // Etapa: ENTREGA_REGISTRO_Y_DESEMBOLSO
    {
        key: 'actaEntregaEnviada',
        label: 'Acta de Entrega Enviada',
        aplicaA: () => true,
        stage: 'ENTREGA_REGISTRO_Y_DESEMBOLSO'
    },
    {
        key: 'actaEntregaRecibida',
        label: 'Acta de Entrega Firmada',
        aplicaA: () => true,
        stage: 'ENTREGA_REGISTRO_Y_DESEMBOLSO'
    },
    {
        key: 'boletaRegistro',
        label: 'Boleta de Registro Emitida',
        aplicaA: () => true,
        stage: 'ENTREGA_REGISTRO_Y_DESEMBOLSO'
    },
    {
        key: 'solicitudDesembolso',
        label: 'Solicitud Desembolso de Crédito',
        aplicaA: (financiero) => financiero.aplicaCredito,
        stage: 'ENTREGA_REGISTRO_Y_DESEMBOLSO'
    },
    {
        key: 'desembolsoSubsidio',
        label: 'Desembolso de Subsidio',
        aplicaA: (financiero) => financiero.aplicaSubsidioVivienda || financiero.aplicaSubsidioCaja,
        stage: 'ENTREGA_REGISTRO_Y_DESEMBOLSO'
    },
];