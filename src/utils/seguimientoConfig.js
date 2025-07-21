// src/utils/seguimientoConfig.js

// Nueva lista de 19 pasos para el seguimiento del cliente con sus reglas de aplicación.
export const PASOS_SEGUIMIENTO_CONFIG = [
    { key: 'promesaEnviada', label: '1. Promesa de Compraventa Enviada', aplicaA: () => true },
    { key: 'promesaRecibida', label: '2. Promesa de Compraventa Firmada', aplicaA: () => true },
    { key: 'envioDocumentacionAvaluo', label: '3. Envío Documentación para Avalúo', aplicaA: (financiero) => financiero.aplicaCredito },
    { key: 'pagoEstudioTitulos', label: '4. Pago Estudio de Títulos', aplicaA: (financiero) => financiero.aplicaCredito },
    { key: 'minutaEnviadaAbogada', label: '5. Minuta Enviada a Abogada', aplicaA: (financiero) => financiero.aplicaCredito },
    { key: 'minutaAprobadaAbogada', label: '6. Minuta Aprobada por Abogada', aplicaA: (financiero) => financiero.aplicaCredito },
    { key: 'minutaEnviadaNotaria', label: '7. Minuta Enviada a Notaría', aplicaA: (financiero) => financiero.aplicaCredito },
    { key: 'minutaFirmada', label: '8. Minuta Firmada por Ambas Partes', aplicaA: () => true },
    { key: 'actaEntregaEnviada', label: '9. Acta de Entrega Enviada', aplicaA: () => true },
    { key: 'actaEntregaRecibida', label: '10. Acta de Entrega Firmada', aplicaA: () => true },
    { key: 'pagoBoletaFiscal', label: '11. Pago de Boleta Fiscal', aplicaA: () => true },
    { key: 'pagoBoletaRegistro', label: '12. Pago de Boleta de Registro', aplicaA: () => true },
    { key: 'solicitudDesembolsoCredito', label: '13. Solicitud Desembolso Crédito', aplicaA: (financiero) => financiero.aplicaCredito },
    { key: 'desembolsoCredito', label: '14. Crédito Desembolsado', aplicaA: (financiero) => financiero.aplicaCredito },
    { key: 'solicitudDesembolsoMCY', label: '15. Solicitud Desembolso Sub. MCY', aplicaA: (financiero) => financiero.aplicaSubsidioVivienda },
    { key: 'desembolsoMCY', label: '16. Subsidio MCY Desembolsado', aplicaA: (financiero) => financiero.aplicaSubsidioVivienda },
    { key: 'solicitudDesembolsoCaja', label: '17. Solicitud Desembolso Sub. Caja Comp.', aplicaA: (financiero) => financiero.aplicaSubsidioCaja },
    { key: 'desembolsoCaja', label: '18. Subsidio Caja Comp. Desembolsado', aplicaA: (financiero) => financiero.aplicaSubsidioCaja },
    { key: 'facturaVenta', label: '19. Factura de Venta', aplicaA: () => true },
];