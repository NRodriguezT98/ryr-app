// Este archivo define todos los documentos requeridos y su lógica de negocio.

export const DOCUMENTACION_CONFIG = [
    // --- Documentos de Identificación y Contrato ---
    {
        id: 'cedula',
        label: 'Cédula de Ciudadanía',
        aplicaA: () => true,
        vinculadoA: null,
        esImportante: true, // <-- Marcado como importante
    },
    {
        id: 'promesaEnviada',
        label: 'Promesa de Compraventa Enviada',
        aplicaA: () => true,
        vinculadoA: 'promesaEnviada',
    },
    {
        id: 'promesaRecibida',
        label: 'Promesa de Compraventa Firmada',
        aplicaA: () => true,
        vinculadoA: 'promesaRecibida',
        esImportante: true, // <-- Marcado como importante
    },

    // --- Documentos de Fuentes de Pago (Informativos) ---
    {
        id: 'cartaAprobacionCredito',
        label: 'Carta de Aprobación Crédito Hipotecario',
        aplicaA: (financiero) => financiero.aplicaCredito,
        vinculadoA: null,
        esImportante: true, // <-- Marcado como importante
    },
    {
        id: 'resolucionSubsidioMCY',
        label: 'Resolución Aprobación Subsidio Mi Casa Ya',
        aplicaA: (financiero) => financiero.aplicaSubsidioVivienda,
        vinculadoA: null,
        esImportante: true, // <-- Marcado como importante
    },
    {
        id: 'actaAprobacionCaja',
        label: 'Acta Aprobación Caja de Compensación',
        aplicaA: (financiero) => financiero.aplicaSubsidioCaja,
        vinculadoA: null,
        esImportante: true, // <-- Marcado como importante
    },

    // --- Documentos del Proceso de Crédito ---
    {
        id: 'docAvaluo',
        label: 'Documentación para Avalúo',
        aplicaA: (financiero) => financiero.aplicaCredito,
        vinculadoA: 'envioDocumentacionAvaluo',
    },
    {
        id: 'pagoEstudioTitulos',
        label: 'Soporte Pago Estudio de Títulos',
        aplicaA: (financiero) => financiero.aplicaCredito,
        vinculadoA: 'pagoEstudioTitulos',
    },
    {
        id: 'envioMinuta',
        label: 'Envío Minuta de Compraventa a Abogada',
        aplicaA: (financiero) => financiero.aplicaCredito,
        vinculadoA: 'minutaEnviadaAbogada',
    },
    {
        id: 'minutaAprobada',
        label: 'Minuta de Compraventa Aprobada por Abogada',
        aplicaA: (financiero) => financiero.aplicaCredito,
        vinculadoA: 'minutaAprobadaAbogada',
    },

    // --- Documentos de Notaría y Registro ---
    {
        id: 'minutaEnviadaNotaria',
        label: 'Minuta Enviada a Notaría',
        aplicaA: () => true,
        vinculadoA: 'minutaEnviadaNotaria',
    },
    {
        id: 'facturaNotaria',
        label: 'Factura Notaría',
        aplicaA: () => true,
        vinculadoA: 'minutaFirmada',
        esImportante: true, // <-- Marcado como importante
    },
    {
        id: 'actaEntregaEnviada',
        label: 'Acta de Entrega Enviada',
        aplicaA: () => true,
        vinculadoA: 'actaEntregaEnviada',
    },
    {
        id: 'actaEntregaFirmada',
        label: 'Acta de Entrega Firmada',
        aplicaA: () => true,
        vinculadoA: 'actaEntregaRecibida',
        esImportante: true, // <-- Marcado como importante
    },
    {
        id: 'pagoBoletaFiscal',
        label: 'Soporte Pago Boleta Fiscal',
        aplicaA: () => true,
        vinculadoA: 'pagoBoletaFiscal',
    },
    {
        id: 'boletaFiscal',
        label: 'Boleta Fiscal',
        aplicaA: () => true,
        vinculadoA: null,
        esImportante: true, // <-- Marcado como importante
    },
    {
        id: 'boletaRegistro',
        label: 'Boleta de Registro',
        aplicaA: () => true,
        vinculadoA: 'pagoBoletaRegistro',
        esImportante: true, // <-- Marcado como importante
    },

    // --- Documentos de Desembolsos ---
    {
        id: 'solicitudDesembolsoCredito',
        label: 'Soporte Solicitud Desembolso Crédito',
        aplicaA: (financiero) => financiero.aplicaCredito,
        vinculadoA: 'solicitudDesembolsoCredito',
    },
    {
        id: 'desembolsoCredito',
        label: 'Soporte Desembolso Crédito Hipotecario',
        aplicaA: (financiero) => financiero.aplicaCredito,
        vinculadoA: 'desembolsoCredito',
        esImportante: true, // <-- Marcado como importante
    },
    {
        id: 'solicitudDesembolsoMCY',
        label: 'Soporte Solicitud Desembolso Sub. MCY',
        aplicaA: (financiero) => financiero.aplicaSubsidioVivienda,
        vinculadoA: 'solicitudDesembolsoMCY',
    },
    {
        id: 'desembolsoMCY',
        label: 'Soporte Desembolso Sub. MCY',
        aplicaA: (financiero) => financiero.aplicaSubsidioVivienda,
        vinculadoA: 'desembolsoMCY',
        esImportante: true, // <-- Marcado como importante
    },
    {
        id: 'solicitudDesembolsoCaja',
        label: 'Soporte Solicitud Desembolso Sub. Caja',
        aplicaA: (financiero) => financiero.aplicaSubsidioCaja,
        vinculadoA: 'solicitudDesembolsoCaja',
    },
    {
        id: 'desembolsoCaja',
        label: 'Soporte Desembolso Sub. Caja',
        aplicaA: (financiero) => financiero.aplicaSubsidioCaja,
        vinculadoA: 'desembolsoCaja',
        esImportante: true, // <-- Marcado como importante
    },

    // --- Documento Final ---
    {
        id: 'facturaVenta',
        label: 'Factura de Venta RyR',
        aplicaA: () => true,
        vinculadoA: 'facturaVenta',
        esImportante: true, // <-- Marcado como importante
    },
];