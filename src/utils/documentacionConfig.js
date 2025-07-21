// Este archivo define todos los documentos requeridos y su lógica de negocio.
// *** VERSIÓN CORREGIDA Y REORDENADA ***

export const DOCUMENTACION_CONFIG = [
    // --- 1. DOCUMENTOS INICIALES OBLIGATORIOS (NUEVO ORDEN) ---
    {
        id: 'cedula',
        label: 'Cédula de Ciudadanía',
        aplicaA: () => true,
        vinculadoA: null,
        esImportante: true,
    },
    {
        id: 'cartaAprobacionCredito',
        label: 'Carta de Aprobación Crédito Hipotecario',
        aplicaA: (financiero) => financiero.aplicaCredito,
        vinculadoA: null,
        esImportante: true,
    },
    {
        id: 'actaAprobacionCaja',
        label: 'Carta de Aprobación Subsidio Caja de Compensación',
        aplicaA: (financiero) => financiero.aplicaSubsidioCaja,
        vinculadoA: null,
        esImportante: true,
    },
    // --- INICIO DE LA MODIFICACIÓN ---
    {
        id: 'promesaEnviadaCorreo', // ID coincide con la evidencia en procesoConfig
        label: 'Soporte de Envío Promesa de Compraventa',
        aplicaA: () => true,
        vinculadoA: 'promesaEnviada',
    },
    // --- FIN DE LA MODIFICACIÓN ---
    {
        id: 'promesaEnviadaDoc',
        label: 'Documento de Promesa Enviado (PDF)',
        aplicaA: () => true,
        vinculadoA: 'promesaEnviada',
        esImportante: true,
    },
    {
        id: 'promesaRecibidaDoc',
        label: 'Promesa de Compraventa Firmada',
        aplicaA: () => true,
        vinculadoA: 'promesaRecibida',
        esImportante: true,
    },

    // --- 2. RESTO DE DOCUMENTOS DEL PROCESO ---
    {
        id: 'docAvaluo',
        label: 'Soporte de Envío de Documentos para Avalúo',
        aplicaA: (financiero) => financiero.aplicaCredito,
        vinculadoA: 'envioDocumentacionAvaluo',
    },
    {
        id: 'cartaRatificacionDoc',
        label: 'Documento Carta de Ratificación (PDF)',
        aplicaA: (financiero) => financiero.aplicaCredito,
        vinculadoA: 'cartaRatificacionRecibida',
        esImportante: true,
    },
    {
        id: 'pagoEstudioTitulosSoporte',
        label: 'Comprobante de Pago Estudio de Títulos',
        aplicaA: (financiero) => financiero.aplicaCredito,
        vinculadoA: 'pagoEstudioTitulos',
        esImportante: true,
    },
    {
        id: 'minutaEnviadaSoporte',
        label: 'Soporte de Envío de Minuta a Abogada',
        aplicaA: (financiero) => financiero.aplicaCredito,
        vinculadoA: 'minutaEnviadaAbogada',
    },
    {
        id: 'minutaAprobadaSoporte',
        label: 'Soporte de Aprobación de Minuta',
        aplicaA: (financiero) => financiero.aplicaCredito,
        vinculadoA: 'minutaAprobadaAbogada',
    },
    {
        id: 'minutaNotariaSoporte',
        label: 'Soporte de Envío Minuta a Notaría',
        aplicaA: () => true,
        vinculadoA: 'minutaEnviadaNotaria',
    },
    {
        id: 'minutaFirmadaDoc',
        label: 'Documento Minuta Firmada (Escritura)',
        aplicaA: () => true,
        vinculadoA: 'minutaFirmada',
        esImportante: true,
    },
    {
        id: 'actaEnviadaSoporte',
        label: 'Soporte de Envío Acta de Entrega',
        aplicaA: () => true,
        vinculadoA: 'actaEntregaEnviada',
    },
    {
        id: 'actaFirmadaDoc',
        label: 'Documento Acta de Entrega Firmada',
        aplicaA: () => true,
        vinculadoA: 'actaEntregaRecibida',
        esImportante: true,
    },
    {
        id: 'pagoBoletaFiscalSoporte',
        label: 'Comprobante de Pago Boleta Fiscal',
        aplicaA: () => true,
        vinculadoA: 'pagoBoletaFiscal',
    },
    {
        id: 'pagoBoletaRegistroSoporte',
        label: 'Comprobante de Pago Boleta de Registro',
        aplicaA: () => true,
        vinculadoA: 'pagoBoletaRegistro',
        esImportante: true,
    },

    // --- 3. DOCUMENTOS DE DESEMBOLSOS ---
    {
        id: 'solicitudCreditoSoporte',
        label: 'Soporte Solicitud Desembolso Crédito',
        aplicaA: (financiero) => financiero.aplicaCredito,
        vinculadoA: 'solicitudDesembolsoCredito',
    },
    {
        id: 'desembolsoCreditoSoporte',
        label: 'Soporte Desembolso Crédito Hipotecario',
        aplicaA: (financiero) => financiero.aplicaCredito,
        vinculadoA: 'desembolsoCredito',
        esImportante: true,
    },
    {
        id: 'solicitudMCYSoporte',
        label: 'Soporte Solicitud Desembolso Sub. MCY',
        aplicaA: (financiero) => financiero.aplicaSubsidioVivienda,
        vinculadoA: 'solicitudDesembolsoMCY',
    },
    {
        id: 'desembolsoMCYSoporte',
        label: 'Soporte Desembolso Sub. MCY',
        aplicaA: (financiero) => financiero.aplicaSubsidioVivienda,
        vinculadoA: 'desembolsoMCY',
        esImportante: true,
    },
    {
        id: 'solicitudCajaSoporte',
        label: 'Soporte Solicitud Desembolso Sub. Caja',
        aplicaA: (financiero) => financiero.aplicaSubsidioCaja,
        vinculadoA: 'solicitudDesembolsoCaja',
    },
    {
        id: 'desembolsoCajaSoporte',
        label: 'Soporte Desembolso Sub. Caja',
        aplicaA: (financiero) => financiero.aplicaSubsidioCaja,
        vinculadoA: 'desembolsoCaja',
        esImportante: true,
    },
    {
        id: 'facturaVentaDoc',
        label: 'Documento Factura de Venta',
        aplicaA: () => true,
        vinculadoA: 'facturaVenta',
        esImportante: true,
    },
];