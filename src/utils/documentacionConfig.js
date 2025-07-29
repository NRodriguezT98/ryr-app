export const DOCUMENTACION_CONFIG = [
    // --- 1. DOCUMENTOS INICIALES OBLIGATORIOS ---
    {
        id: 'cedula',
        label: 'Cédula de Ciudadanía',
        aplicaA: () => true,
        vinculadoA: null,
        esImportante: true,
        selector: (cliente) => cliente.datosCliente?.urlCedula,
        path: 'datosCliente.urlCedula'
    },
    {
        id: 'cartaAprobacionCredito',
        label: 'Carta de Aprobación Crédito Hipotecario',
        aplicaA: (financiero) => financiero.aplicaCredito,
        vinculadoA: null,
        esImportante: true,
        selector: (cliente) => cliente.financiero?.credito?.urlCartaAprobacion,
        path: 'financiero.credito.urlCartaAprobacion'
    },
    {
        id: 'actaAprobacionCaja',
        label: 'Carta de Aprobación Subsidio Caja de Compensación',
        aplicaA: (financiero) => financiero.aplicaSubsidioCaja,
        vinculadoA: null,
        esImportante: true,
        selector: (cliente) => cliente.financiero?.subsidioCaja?.urlCartaAprobacion,
        path: 'financiero.subsidioCaja.urlCartaAprobacion'
    },
    {
        id: 'promesaEnviadaCorreo',
        label: 'Soporte de Envío Promesa de Compraventa',
        aplicaA: () => true,
        vinculadoA: 'promesaEnviada',
        selector: (cliente) => cliente.proceso?.promesaEnviada?.evidencias?.promesaEnviadaCorreo,
        path: 'proceso.promesaEnviada.evidencias.promesaEnviadaCorreo'
    },
    {
        id: 'promesaEnviadaDoc',
        label: 'Documento de Promesa Enviado (PDF)',
        aplicaA: () => true,
        vinculadoA: 'promesaEnviada',
        esImportante: true,
        selector: (cliente) => cliente.proceso?.promesaEnviada?.evidencias?.promesaEnviadaDoc,
        path: 'proceso.promesaEnviada.evidencias.promesaEnviadaDoc'
    },
    {
        id: 'promesaRecibidaDoc',
        label: 'Promesa de Compraventa Firmada',
        aplicaA: () => true,
        vinculadoA: 'promesaRecibida',
        esImportante: true,
        selector: (cliente) => cliente.proceso?.promesaRecibida?.evidencias?.promesaRecibidaDoc,
        path: 'proceso.promesaRecibida.evidencias.promesaRecibidaDoc'
    },

    // --- 2. RESTO DE DOCUMENTOS DEL PROCESO ---
    {
        id: 'docAvaluo',
        label: 'Soporte de Envío de Documentos para Avalúo',
        aplicaA: (financiero) => financiero.aplicaCredito,
        vinculadoA: 'envioDocumentacionAvaluo',
        selector: (cliente) => cliente.proceso?.envioDocumentacionAvaluo?.evidencias?.docAvaluo,
        path: 'proceso.envioDocumentacionAvaluo.evidencias.docAvaluo'
    },
    {
        id: 'cartaRatificacionDoc',
        label: 'Documento Carta de Ratificación (PDF)',
        aplicaA: (financiero) => financiero.aplicaCredito,
        vinculadoA: 'cartaRatificacionRecibida',
        esImportante: true,
        selector: (cliente) => cliente.proceso?.cartaRatificacionRecibida?.evidencias?.cartaRatificacionDoc,
        path: 'proceso.cartaRatificacionRecibida.evidencias.cartaRatificacionDoc'
    },
    {
        id: 'pagoEstudioTitulosSoporte',
        label: 'Comprobante de Pago Estudio de Títulos',
        aplicaA: (financiero) => financiero.aplicaCredito,
        vinculadoA: 'pagoEstudioTitulos',
        esImportante: true,
        selector: (cliente) => cliente.proceso?.pagoEstudioTitulos?.evidencias?.pagoEstudioTitulosSoporte,
        path: 'proceso.pagoEstudioTitulos.evidencias.pagoEstudioTitulosSoporte'
    },
    {
        id: 'minutaEnviadaSoporte',
        label: 'Soporte de Envío de Minuta a Abogada',
        aplicaA: (financiero) => financiero.aplicaCredito,
        vinculadoA: 'minutaEnviadaAbogada',
        selector: (cliente) => cliente.proceso?.minutaEnviadaAbogada?.evidencias?.minutaEnviadaSoporte,
        path: 'proceso.minutaEnviadaAbogada.evidencias.minutaEnviadaSoporte'
    },
    {
        id: 'minutaAprobadaSoporte',
        label: 'Soporte de Aprobación de Minuta',
        aplicaA: (financiero) => financiero.aplicaCredito,
        vinculadoA: 'minutaAprobadaAbogada',
        selector: (cliente) => cliente.proceso?.minutaAprobadaAbogada?.evidencias?.minutaAprobadaSoporte,
        path: 'proceso.minutaAprobadaAbogada.evidencias.minutaAprobadaSoporte'
    },
    {
        id: 'minutaNotariaSoporte',
        label: 'Soporte de Envío Minuta a Notaría',
        aplicaA: () => true,
        vinculadoA: 'minutaEnviadaNotaria',
        selector: (cliente) => cliente.proceso?.minutaEnviadaNotaria?.evidencias?.minutaNotariaSoporte,
        path: 'proceso.minutaEnviadaNotaria.evidencias.minutaNotariaSoporte'
    },
    {
        id: 'minutaFirmadaDoc',
        label: 'Documento Minuta Firmada (Escritura)',
        aplicaA: () => true,
        vinculadoA: 'minutaFirmada',
        esImportante: true,
        selector: (cliente) => cliente.proceso?.minutaFirmada?.evidencias?.minutaFirmadaDoc,
        path: 'proceso.minutaFirmada.evidencias.minutaFirmadaDoc'
    },
    {
        id: 'actaEnviadaSoporte',
        label: 'Soporte de Envío Acta de Entrega',
        aplicaA: () => true,
        vinculadoA: 'actaEntregaEnviada',
        selector: (cliente) => cliente.proceso?.actaEntregaEnviada?.evidencias?.actaEnviadaSoporte,
        path: 'proceso.actaEntregaEnviada.evidencias.actaEnviadaSoporte'
    },
    {
        id: 'actaFirmadaDoc',
        label: 'Documento Acta de Entrega Firmada',
        aplicaA: () => true,
        vinculadoA: 'actaEntregaRecibida',
        esImportante: true,
        selector: (cliente) => cliente.proceso?.actaEntregaRecibida?.evidencias?.actaFirmadaDoc,
        path: 'proceso.actaEntregaRecibida.evidencias.actaFirmadaDoc'
    },
    {
        id: 'pagoBoletaFiscalSoporte',
        label: 'Comprobante de Pago Boleta Fiscal',
        aplicaA: () => true,
        vinculadoA: 'pagoBoletaFiscal',
        selector: (cliente) => cliente.proceso?.pagoBoletaFiscal?.evidencias?.pagoBoletaFiscalSoporte,
        path: 'proceso.pagoBoletaFiscal.evidencias.pagoBoletaFiscalSoporte'
    },
    {
        id: 'pagoBoletaRegistroSoporte',
        label: 'Comprobante de Pago Boleta de Registro',
        aplicaA: () => true,
        vinculadoA: 'pagoBoletaRegistro',
        esImportante: true,
        selector: (cliente) => cliente.proceso?.pagoBoletaRegistro?.evidencias?.pagoBoletaRegistroSoporte,
        path: 'proceso.pagoBoletaRegistro.evidencias.pagoBoletaRegistroSoporte'
    },

    // --- 3. DOCUMENTOS DE DESEMBOLSOS ---
    {
        id: 'solicitudCreditoSoporte',
        label: 'Soporte Solicitud Desembolso Crédito',
        aplicaA: (financiero) => financiero.aplicaCredito,
        vinculadoA: 'solicitudDesembolsoCredito',
        selector: (cliente) => cliente.proceso?.solicitudDesembolsoCredito?.evidencias?.solicitudCreditoSoporte,
        path: 'proceso.solicitudDesembolsoCredito.evidencias.solicitudCreditoSoporte'
    },
    {
        id: 'desembolsoCreditoSoporte',
        label: 'Soporte Desembolso Crédito Hipotecario',
        aplicaA: (financiero) => financiero.aplicaCredito,
        vinculadoA: 'desembolsoCredito',
        esImportante: true,
        selector: (cliente) => cliente.proceso?.desembolsoCredito?.evidencias?.desembolsoCreditoSoporte,
        path: 'proceso.desembolsoCredito.evidencias.desembolsoCreditoSoporte'
    },
    {
        id: 'solicitudMCYSoporte',
        label: 'Soporte Solicitud Desembolso Sub. MCY',
        aplicaA: (financiero) => financiero.aplicaSubsidioVivienda,
        vinculadoA: 'solicitudDesembolsoMCY',
        selector: (cliente) => cliente.proceso?.solicitudDesembolsoMCY?.evidencias?.solicitudMCYSoporte,
        path: 'proceso.solicitudDesembolsoMCY.evidencias.solicitudMCYSoporte'
    },
    {
        id: 'desembolsoMCYSoporte',
        label: 'Soporte Desembolso Sub. MCY',
        aplicaA: (financiero) => financiero.aplicaSubsidioVivienda,
        vinculadoA: 'desembolsoMCY',
        esImportante: true,
        selector: (cliente) => cliente.proceso?.desembolsoMCY?.evidencias?.desembolsoMCYSoporte,
        path: 'proceso.desembolsoMCY.evidencias.desembolsoMCYSoporte'
    },
    {
        id: 'solicitudCajaSoporte',
        label: 'Soporte Solicitud Desembolso Sub. Caja',
        aplicaA: (financiero) => financiero.aplicaSubsidioCaja,
        vinculadoA: 'solicitudDesembolsoCaja',
        selector: (cliente) => cliente.proceso?.solicitudDesembolsoCaja?.evidencias?.solicitudCajaSoporte,
        path: 'proceso.solicitudDesembolsoCaja.evidencias.solicitudCajaSoporte'
    },
    {
        id: 'desembolsoCajaSoporte',
        label: 'Soporte Desembolso Sub. Caja',
        aplicaA: (financiero) => financiero.aplicaSubsidioCaja,
        vinculadoA: 'desembolsoCaja',
        esImportante: true,
        selector: (cliente) => cliente.proceso?.desembolsoCaja?.evidencias?.desembolsoCajaSoporte,
        path: 'proceso.desembolsoCaja.evidencias.desembolsoCajaSoporte'
    },
    {
        id: 'facturaVentaDoc',
        label: 'Documento Factura de Venta',
        aplicaA: () => true,
        vinculadoA: 'facturaVenta',
        esImportante: true,
        selector: (cliente) => cliente.proceso?.facturaVenta?.evidencias?.facturaVentaDoc,
        path: 'proceso.facturaVenta.evidencias.facturaVentaDoc'
    },
];