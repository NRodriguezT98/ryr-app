// Este archivo es la única fuente de verdad para la lógica del proceso del cliente.

export const PROCESO_CONFIG = [
    {
        key: 'promesaEnviada',
        label: 'Promesa de Compraventa Enviada',
        aplicaA: () => true,
        evidenciasRequeridas: [
            { id: 'promesaEnviadaCorreo', label: 'Captura del Correo de Envío', tipo: 'imagen' },
            { id: 'promesaEnviadaDoc', label: 'Documento de Promesa Enviado (PDF)', tipo: 'documento' }
        ]
    },
    {
        key: 'promesaRecibida',
        label: 'Promesa de Compraventa Firmada',
        aplicaA: () => true,
        evidenciasRequeridas: [
            { id: 'promesaRecibidaDoc', label: 'Documento de Promesa Firmado (PDF)', tipo: 'documento' }
        ]
    },
    {
        key: 'envioDocumentacionAvaluo',
        label: 'Envío Documentación para Avalúo',
        aplicaA: (financiero) => financiero.aplicaCredito,
        evidenciasRequeridas: [
            { id: 'docAvaluo', label: 'Soporte de Envío de Documentos', tipo: 'documento' }
        ]
    },
    {
        key: 'pagoEstudioTitulos',
        label: 'Pago Estudio de Títulos',
        aplicaA: (financiero) => financiero.aplicaCredito,
        evidenciasRequeridas: [
            { id: 'pagoEstudioTitulosSoporte', label: 'Comprobante de Pago', tipo: 'documento' }
        ]
    },
    {
        key: 'minutaEnviadaAbogada',
        label: 'Minuta de Compraventa Enviada a Abogada',
        aplicaA: (financiero) => financiero.aplicaCredito,
        evidenciasRequeridas: [{ id: 'minutaEnviadaSoporte', label: 'Soporte de Envío', tipo: 'documento' }]
    },
    {
        key: 'minutaAprobadaAbogada',
        label: 'Minuta Aprobada por Abogada',
        aplicaA: (financiero) => financiero.aplicaCredito,
        evidenciasRequeridas: [{ id: 'minutaAprobadaSoporte', label: 'Soporte de Aprobación', tipo: 'documento' }]
    },
    {
        key: 'minutaEnviadaNotaria',
        label: 'Minuta Enviada a Notaría',
        aplicaA: () => true,
        evidenciasRequeridas: [{ id: 'minutaNotariaSoporte', label: 'Soporte de Envío', tipo: 'documento' }]
    },
    {
        key: 'minutaFirmada',
        label: 'Minuta Firmada por Ambas Partes',
        aplicaA: () => true,
        esHito: true, // <-- Hito
        evidenciasRequeridas: [{ id: 'minutaFirmadaDoc', label: 'Documento Minuta Firmada', tipo: 'documento' }]
    },
    {
        key: 'actaEntregaEnviada',
        label: 'Acta de Entrega Enviada',
        aplicaA: () => true,
        evidenciasRequeridas: [{ id: 'actaEnviadaSoporte', label: 'Soporte de Envío', tipo: 'documento' }]
    },
    {
        key: 'actaEntregaRecibida',
        label: 'Acta de Entrega Firmada',
        aplicaA: () => true,
        evidenciasRequeridas: [{ id: 'actaFirmadaDoc', label: 'Documento Acta Firmada', tipo: 'documento' }]
    },
    {
        key: 'pagoBoletaFiscal',
        label: 'Pago de Boleta Fiscal',
        aplicaA: () => true,
        evidenciasRequeridas: [{ id: 'pagoBoletaFiscalSoporte', label: 'Comprobante de Pago', tipo: 'documento' }]
    },
    {
        key: 'pagoBoletaRegistro',
        label: 'Pago de Boleta de Registro',
        aplicaA: () => true,
        evidenciasRequeridas: [{ id: 'pagoBoletaRegistroSoporte', label: 'Comprobante de Pago', tipo: 'documento' }]
    },
    {
        key: 'solicitudDesembolsoCredito',
        label: 'Solicitud Desembolso Crédito',
        aplicaA: (financiero) => financiero.aplicaCredito,
        evidenciasRequeridas: [{ id: 'solicitudCreditoSoporte', label: 'Soporte de Solicitud', tipo: 'documento' }]
    },
    {
        key: 'desembolsoCredito',
        label: 'Crédito Desembolsado',
        aplicaA: (financiero) => financiero.aplicaCredito,
        esHito: true, // <-- Hito
        evidenciasRequeridas: [{ id: 'desembolsoCreditoSoporte', label: 'Soporte de Desembolso', tipo: 'documento' }]
    },
    {
        key: 'solicitudDesembolsoMCY',
        label: 'Solicitud Desembolso Sub. MCY',
        aplicaA: (financiero) => financiero.aplicaSubsidioVivienda,
        evidenciasRequeridas: [{ id: 'solicitudMCYSoporte', label: 'Soporte de Solicitud', tipo: 'documento' }]
    },
    {
        key: 'desembolsoMCY',
        label: 'Subsidio MCY Desembolsado',
        aplicaA: (financiero) => financiero.aplicaSubsidioVivienda,
        esHito: true, // <-- Hito
        evidenciasRequeridas: [{ id: 'desembolsoMCYSoporte', label: 'Soporte de Desembolso', tipo: 'documento' }]
    },
    {
        key: 'solicitudDesembolsoCaja',
        label: 'Solicitud Desembolso Sub. Caja Comp.',
        aplicaA: (financiero) => financiero.aplicaSubsidioCaja,
        evidenciasRequeridas: [{ id: 'solicitudCajaSoporte', label: 'Soporte de Solicitud', tipo: 'documento' }]
    },
    {
        key: 'desembolsoCaja',
        label: 'Subsidio Caja Comp. Desembolsado',
        aplicaA: (financiero) => financiero.aplicaSubsidioCaja,
        esHito: true, // <-- Hito
        evidenciasRequeridas: [{ id: 'desembolsoCajaSoporte', label: 'Soporte de Desembolso', tipo: 'documento' }]
    },
    {
        key: 'facturaVenta',
        label: 'Factura de Venta',
        aplicaA: () => true,
        esHito: true, // <-- Hito
        evidenciasRequeridas: [{ id: 'facturaVentaDoc', label: 'Documento Factura de Venta', tipo: 'documento' }]
    },
];