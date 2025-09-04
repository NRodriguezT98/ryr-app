// Este archivo es la única fuente de verdad para la lógica del proceso del cliente.

export const PROCESO_CONFIG = [
    {
        key: 'promesaEnviada',
        label: 'Promesa de Compraventa Enviada',
        aplicaA: () => true,
        evidenciasRequeridas: [
            { id: 'promesaEnviadaCorreo', label: 'Captura de Envio de Promesa', tipo: 'imagen' },
            { id: 'promesaEnviadaDoc', label: 'Promesa de Compraventa Enviada (PDF)', tipo: 'documento' }
        ]
    },
    {
        key: 'promesaRecibida',
        label: 'Promesa de Compraventa Firmada',
        aplicaA: () => true,
        evidenciasRequeridas: [
            { id: 'promesaRecibidaDoc', label: 'Promesa de Compraventa Firmada (PDF)', tipo: 'documento' }
        ]
    },
    {
        key: 'envioDocumentacionAvaluo',
        label: 'Envío Documentación para Avalúo',
        aplicaA: (financiero) => financiero.aplicaCredito,
        evidenciasRequeridas: [
            { id: 'docAvaluo', label: 'Captura de Correo con Envío Documentación para Avalúo', tipo: 'documento' }
        ]
    },
    {
        key: 'cartaRatificacionRecibida',
        label: 'Carta de Ratificación Recibida',
        aplicaA: (financiero) => financiero.aplicaCredito,
        evidenciasRequeridas: [
            { id: 'cartaRatificacionDoc', label: 'Carta de Ratificación (PDF)', tipo: 'documento' }
        ]
    },
    {
        key: 'pagoEstudioTitulos',
        label: 'Pago Estudio de Títulos',
        aplicaA: (financiero) => financiero.aplicaCredito,
        evidenciasRequeridas: [
            { id: 'pagoEstudioTitulosSoporte', label: 'Comprobante de Pago Estudio de Títulos', tipo: 'documento' }
        ]
    },
    {
        key: 'minutaEnviadaAbogada',
        label: 'Minuta de Compraventa Enviada a Abogada',
        aplicaA: (financiero) => financiero.aplicaCredito,
        evidenciasRequeridas: [{ id: 'minutaEnviadaSoporte', label: 'Captura de Correo con Envío de Minuta a Abogada', tipo: 'documento' }]
    },
    {
        key: 'minutaAprobadaAbogada',
        label: 'Minuta Aprobada por Abogada',
        aplicaA: (financiero) => financiero.aplicaCredito,
        evidenciasRequeridas: [{ id: 'minutaAprobadaSoporte', label: 'Captura de Correo Aprobación de Minuta por Abogada', tipo: 'documento' }]
    },
    {
        key: 'minutaEnviadaNotaria',
        label: 'Minuta Enviada a Notaría',
        aplicaA: () => true,
        evidenciasRequeridas: [{ id: 'minutaNotariaSoporte', label: 'Captura de Correo con Envío de Minuta a Notaría', tipo: 'documento' }]
    },
    {
        key: 'minutaFirmada',
        label: 'Minuta Firmada por Ambas Partes',
        aplicaA: () => true,
        esHito: true,
        evidenciasRequeridas: [{ id: 'minutaFirmadaDoc', label: 'Factura emitida por Notaría', tipo: 'documento' }]
    },
    {
        key: 'actaEntregaEnviada',
        label: 'Acta de Entrega Enviada',
        aplicaA: () => true,
        evidenciasRequeridas: [{ id: 'actaEnviadaSoporte', label: 'Acta de Entrega Enviada para Firma', tipo: 'documento' }]
    },
    {
        key: 'actaEntregaRecibida',
        label: 'Acta de Entrega Firmada',
        aplicaA: () => true,
        evidenciasRequeridas: [{ id: 'actaFirmadaDoc', label: 'Acta de Entrega Firmada por Cliente', tipo: 'documento' }]
    },
    {
        key: 'pagoBoletaFiscal',
        label: 'Pago de Boleta Fiscal',
        aplicaA: () => true,
        evidenciasRequeridas: [{ id: 'pagoBoletaFiscalSoporte', label: 'Comprobante de Pago Boleta Fiscal', tipo: 'documento' }]
    },
    {
        key: 'pagoBoletaRegistro',
        label: 'Pago de Boleta de Registro',
        aplicaA: () => true,
        evidenciasRequeridas: [{ id: 'pagoBoletaRegistroSoporte', label: 'Comprobante de Pago Boleta de Registro', tipo: 'documento' }]
    },
    {
        key: 'solicitudDesembolsoCredito',
        label: 'Solicitud Desembolso Crédito',
        aplicaA: (financiero) => financiero.aplicaCredito,
        evidenciasRequeridas: [{ id: 'solicitudCreditoSoporte', label: 'Captura envío de Solicitud desembolso de Crédito', tipo: 'documento' }]
    },
    {
        key: 'desembolsoCredito',
        label: 'Crédito Desembolsado',
        aplicaA: (financiero) => financiero.aplicaCredito,
        esHito: true,
        esAutomatico: true,
        evidenciasRequeridas: [{ id: 'desembolsoCreditoSoporte', label: 'Captura confirmación de desembolso de Crédito', tipo: 'documento' }]
    },
    {
        key: 'solicitudDesembolsoMCY',
        label: 'Solicitud Desembolso Sub. MCY',
        aplicaA: (financiero) => financiero.aplicaSubsidioVivienda,
        evidenciasRequeridas: [{ id: 'solicitudMCYSoporte', label: 'Captura envío de Solicitud desembolso Subsidio MCY', tipo: 'documento' }]
    },
    {
        key: 'desembolsoMCY',
        label: 'Subsidio MCY Desembolsado',
        aplicaA: (financiero) => financiero.aplicaSubsidioVivienda,
        esHito: true,
        esAutomatico: true,
        evidenciasRequeridas: [{ id: 'desembolsoMCYSoporte', label: 'Captura confirmación de desembolso Subsidio MCY', tipo: 'documento' }]
    },
    {
        key: 'solicitudDesembolsoCaja',
        label: 'Solicitud Desembolso Sub. Caja Comp.',
        aplicaA: (financiero) => financiero.aplicaSubsidioCaja,
        evidenciasRequeridas: [{ id: 'solicitudCajaSoporte', label: 'Captura envío de Solicitud desembolso Subsidio Caja de Compensación', tipo: 'documento' }]
    },
    {
        key: 'desembolsoCaja',
        label: 'Subsidio Caja Comp. Desembolsado',
        aplicaA: (financiero) => financiero.aplicaSubsidioCaja,
        esHito: true,
        esAutomatico: true,
        evidenciasRequeridas: [{ id: 'desembolsoCajaSoporte', label: 'Captura confirmación de desembolso Subsidio Caja de Compensación', tipo: 'documento' }]
    },
    {
        key: 'facturaVenta',
        label: 'Factura de Venta',
        aplicaA: () => true,
        esHito: true,
        evidenciasRequeridas: [{ id: 'facturaVentaDoc', label: 'Factura de Venta Emitida por La Constructora', tipo: 'documento' }]
    },
];

// Mapa para conectar fuentes de pago con los pasos del proceso
export const FUENTE_PROCESO_MAP = {
    credito: {
        solicitudKey: 'solicitudDesembolsoCredito',
        desembolsoKey: 'desembolsoCredito',
        evidenciaId: 'desembolsoCreditoSoporte'
    },
    subsidioVivienda: {
        solicitudKey: 'solicitudDesembolsoMCY',
        desembolsoKey: 'desembolsoMCY',
        evidenciaId: 'desembolsoMCYSoporte'
    },
    subsidioCaja: {
        solicitudKey: 'solicitudDesembolsoCaja',
        desembolsoKey: 'desembolsoCaja',
        evidenciaId: 'desembolsoCajaSoporte'
    }
};

export const NOMBRE_FUENTE_PAGO = {
    cuotaInicial: "Cuota Inicial",
    credito: "Crédito Hipotecario",
    subsidioVivienda: "Subsidio Mi Casa Ya",
    subsidioCaja: "Subsidio Caja de Compensación",
    condonacion: "Condonación de Saldo",
    gastosNotariales: "Gastos Notariales",
};