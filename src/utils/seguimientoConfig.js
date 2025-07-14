// src/utils/seguimientoConfig.js

// Aquí definimos todos los pasos posibles y la lógica para saber si aplican a un cliente.
export const PASOS_SEGUIMIENTO_CONFIG = [
    { key: 'promesaEnviada', label: 'Promesa de Compraventa Enviada', aplicaA: () => true },
    { key: 'promesaRecibida', label: 'Promesa de Compraventa Firmada', aplicaA: () => true },
    { key: 'envioDocumentacionAvaluo', label: 'Envío documentación para Avalúo', aplicaA: (financiero) => financiero.aplicaCredito },
    { key: 'avaluoRealizado', label: 'Avalúo Realizado', aplicaA: (financiero) => financiero.aplicaCredito },
    { key: 'pagoEstudioTitulos', label: 'Pago Estudio de Títulos', aplicaA: () => true },
    { key: 'escrituraEnviada', label: 'Escritura Enviada a Notaría', aplicaA: () => true },
    { key: 'escrituraFirmada', label: 'Escritura Firmada por Cliente', aplicaA: () => true },
    { key: 'actaEntregaEnviada', label: 'Acta de Entrega Enviada', aplicaA: () => true },
    { key: 'actaEntregaRecibida', label: 'Acta de Entrega Firmada', aplicaA: () => true },
    { key: 'boletaRegistro', label: 'Boleta de Registro Emitida', aplicaA: () => true },
    { key: 'solicitudDesembolso', label: 'Solicitud Desembolso de Crédito', aplicaA: (financiero) => financiero.aplicaCredito },
    { key: 'desembolsoSubsidio', label: 'Desembolso de Subsidio', aplicaA: (financiero) => financiero.aplicaSubsidioVivienda || financiero.aplicaSubsidioCaja },
];