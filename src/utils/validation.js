import { formatCurrency, formatDisplayDate } from './textFormatters';

// --- VALIDACIONES DE VIVIENDA ---
export const validateVivienda = (formData, todasLasViviendas, viviendaAEditar = null) => {
    const errors = {};
    const { manzana, numero, matricula, nomenclatura, valorBase, linderoNorte, linderoSur, linderoOriente, linderoOccidente, areaLote, areaConstruida } = formData;
    const linderoRegex = /^[a-zA-ZáéíóúÁÉÍÓÚ0-9\s.,\(\)-]*$/;

    if (!manzana) errors.manzana = "La manzana es obligatoria.";
    if (!numero) errors.numero = "El número de casa es obligatorio.";

    if (!linderoNorte?.trim()) errors.linderoNorte = "El lindero Norte es obligatorio.";
    else if (!linderoRegex.test(linderoNorte)) errors.linderoNorte = "Contiene caracteres no permitidos.";

    if (!linderoSur?.trim()) errors.linderoSur = "El lindero Sur es obligatorio.";
    else if (!linderoRegex.test(linderoSur)) errors.linderoSur = "Contiene caracteres no permitidos.";

    if (!linderoOriente?.trim()) errors.linderoOriente = "El lindero Oriente es obligatorio.";
    else if (!linderoRegex.test(linderoOriente)) errors.linderoOriente = "Contiene caracteres no permitidos.";

    if (!linderoOccidente?.trim()) errors.linderoOccidente = "El lindero Occidente es obligatorio.";
    else if (!linderoRegex.test(linderoOccidente)) errors.linderoOccidente = "Contiene caracteres no permitidos.";

    if (!matricula?.trim()) errors.matricula = "La matrícula es obligatoria.";
    if (!nomenclatura?.trim()) errors.nomenclatura = "La nomenclatura es obligatoria.";
    if (!valorBase) errors.valorBase = "El valor base de la casa es obligatorio.";

    const areaLoteNum = parseFloat(String(areaLote).replace(',', '.'));
    const areaConstruidaNum = parseFloat(String(areaConstruida).replace(',', '.'));

    if (!areaLote || String(areaLote).trim() === '') errors.areaLote = "El área del lote es obligatoria.";
    else if (isNaN(areaLoteNum) || areaLoteNum <= 0) errors.areaLote = "Debe ser un número positivo.";

    if (!areaConstruida || String(areaConstruida).trim() === '') errors.areaConstruida = "El área construida es obligatoria.";
    else if (isNaN(areaConstruidaNum) || areaConstruidaNum <= 0) errors.areaConstruida = "Debe ser un número positivo.";

    if (!isNaN(areaLoteNum) && !isNaN(areaConstruidaNum) && areaConstruidaNum > areaLoteNum) {
        errors.areaConstruida = "No puede ser mayor al área del lote.";
    }

    if (todasLasViviendas && manzana && numero) {
        const isDuplicate = todasLasViviendas.some(vivienda => {
            if (viviendaAEditar?.id && vivienda.id === viviendaAEditar.id) return false;
            return vivienda.manzana === manzana && vivienda.numeroCasa?.toString() === numero.trim();
        });
        if (isDuplicate) errors.numero = "Ya existe una vivienda con esta manzana y número.";
    }

    return errors;
};

export const validateDescuento = (formData, vivienda) => {
    const errors = {};
    const { descuentoMonto, descuentoMotivo } = formData;
    const montoDescuentoNuevo = parseInt(String(descuentoMonto).replace(/\D/g, ''), 10) || 0;

    if (montoDescuentoNuevo > 0 && !descuentoMotivo?.trim()) {
        errors.descuentoMotivo = "El motivo es obligatorio si se aplica un descuento.";
    }

    if (vivienda) {
        const saldoPendiente = vivienda.saldoPendiente || 0;
        if (montoDescuentoNuevo > saldoPendiente) {
            errors.descuentoMonto = `El descuento no puede superar el saldo pendiente de ${formatCurrency(saldoPendiente)}.`;
        }
    }

    return errors;
};

// --- VALIDACIONES DE CLIENTE ---
export const validateCliente = (formData, todosLosClientes, clienteIdActual = null) => {
    const errors = {};
    if (!formData.nombres?.trim()) errors.nombres = "El nombre es requerido.";
    if (!formData.apellidos?.trim()) errors.apellidos = "El apellido es requerido.";
    if (!formData.cedula?.trim()) {
        errors.cedula = "La cédula es requerida.";
    } else if (todosLosClientes.some(c => c.id === formData.cedula && c.id !== clienteIdActual)) {
        errors.cedula = "Esta cédula ya está registrada.";
    }
    if (!formData.telefono?.trim()) errors.telefono = "El teléfono es requerido.";
    if (!formData.correo?.trim()) {
        errors.correo = "El correo es requerido.";
    } else if (!/\S+@\S+\.\S+/.test(formData.correo)) {
        errors.correo = "El formato del correo no es válido.";
    }
    if (!formData.direccion?.trim()) errors.direccion = "La dirección es requerida.";
    if (!formData.fechaIngreso) errors.fechaIngreso = "La fecha de ingreso es requerida.";
    if (!formData.urlCedula) {
        errors.urlCedula = "Adjuntar la cédula es obligatorio.";
    }
    return errors;
};

export const validateEditarCliente = (formData, todosLosClientes, clienteIdActual, abonosDelCliente = []) => {
    const baseErrors = validateCliente(formData, todosLosClientes, clienteIdActual);
    if (formData.fechaIngreso && abonosDelCliente.length > 0) {
        const nuevaFechaIngreso = new Date(formData.fechaIngreso + 'T00:00:00');
        const abonoMasAntiguo = abonosDelCliente.reduce((masAntiguo, abonoActual) => {
            const fechaActual = new Date(abonoActual.fechaPago + 'T00:00:00');
            return fechaActual < masAntiguo ? fechaActual : masAntiguo;
        }, new Date());

        if (nuevaFechaIngreso > abonoMasAntiguo) {
            baseErrors.fechaIngreso = `No puedes usar esta fecha. Ya existen abonos registrados desde el ${abonoMasAntiguo.toLocaleDateString('es-ES')}.`;
        }
    }
    return baseErrors;
};

export const validateFinancialStep = (financiero, valorVivienda, documentos) => {
    const errors = {};
    const { aplicaCuotaInicial, cuotaInicial, aplicaCredito, credito, aplicaSubsidioVivienda, subsidioVivienda, aplicaSubsidioCaja, subsidioCaja } = financiero;

    let totalRecursos = 0;
    if (aplicaCuotaInicial) {
        if (!cuotaInicial.monto || cuotaInicial.monto <= 0) errors.cuotaInicial_monto = "El monto debe ser > 0.";
        totalRecursos += cuotaInicial.monto || 0;
    }
    if (aplicaCredito) {
        if (!credito.banco) errors.credito_banco = "Selecciona un banco.";
        if (!credito.monto || credito.monto <= 0) errors.credito_monto = "El monto debe ser > 0.";
        if (credito.banco === 'Bancolombia' && !credito.caso?.trim()) {
            errors.credito_caso = "El número de caso es obligatorio para Bancolombia.";
        }
        if (!credito.urlCartaAprobacion) {
            errors.credito_urlCartaAprobacion = "La carta de aprobación es obligatoria.";
        }
        totalRecursos += credito.monto || 0;
    }
    if (aplicaSubsidioVivienda) {
        if (!subsidioVivienda.monto || subsidioVivienda.monto <= 0) errors.subsidioVivienda_monto = "El monto debe ser > 0.";
        totalRecursos += subsidioVivienda.monto || 0;
    }
    if (aplicaSubsidioCaja) {
        if (!subsidioCaja.caja) errors.subsidioCaja_caja = "Selecciona una caja.";
        if (!subsidioCaja.monto || subsidioCaja.monto <= 0) errors.subsidioCaja_monto = "El monto debe ser > 0.";
        if (!subsidioCaja.urlCartaAprobacion) {
            errors.subsidioCaja_urlCartaAprobacion = "La carta de aprobación es obligatoria.";
        }
        totalRecursos += subsidioCaja.monto || 0;
    }

    if (!documentos.promesaEnviadaUrl) {
        errors.promesaEnviadaUrl = "Es obligatorio adjuntar la promesa.";
    }
    if (!documentos.promesaEnviadaCorreoUrl) {
        errors.promesaEnviadaCorreoUrl = "Es obligatorio adjuntar la evidencia de envío.";
    }

    const totalAPagar = valorVivienda || 0;
    if (totalRecursos !== totalAPagar && totalAPagar > 0) {
        errors.financiero = `La suma de los recursos (${formatCurrency(totalRecursos)}) debe ser igual al valor de la vivienda (${formatCurrency(totalAPagar)}).`;
    }
    return errors;
};

// --- VALIDACIONES DE ABONO ---
export const validateAbono = (formData, resumenPago, fechaIngresoCliente, procesoCliente, pasoConfig) => {
    const errors = {};
    const montoNumerico = parseInt(String(formData.monto || '0').replace(/\D/g, ''), 10);

    // --- INICIO DE LA MODIFICACIÓN ---
    if (!formData.urlComprobante) {
        errors.urlComprobante = "El comprobante de pago es obligatorio.";
    }
    // --- FIN DE LA MODIFICACIÓN ---

    if (pasoConfig && procesoCliente) {
        const pasoSolicitud = procesoCliente[pasoConfig.solicitudKey];
        if (!pasoSolicitud?.completado) {
            errors.monto = `El paso de solicitud de desembolso debe estar completado.`;
        }
    }

    if (!formData.fechaPago) {
        errors.fechaPago = "La fecha del abono es obligatoria.";
    } else {
        const fechaSeleccionada = new Date(formData.fechaPago + 'T00:00:00');
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        if (fechaSeleccionada > hoy) {
            errors.fechaPago = "La fecha del abono no puede ser futura.";
        }

        if (fechaIngresoCliente) {
            const fechaIngreso = new Date(fechaIngresoCliente.split('T')[0] + 'T00:00:00');
            if (fechaSeleccionada < fechaIngreso) {
                errors.fechaPago = `La fecha no puede ser anterior al ingreso del cliente (${formatDisplayDate(fechaIngresoCliente)}).`;
            }
        }

        // --- INICIO DE LA MODIFICACIÓN ---
        if (pasoConfig && procesoCliente) {
            const pasoSolicitud = procesoCliente[pasoConfig.solicitudKey];
            if (pasoSolicitud?.completado && pasoSolicitud.fecha) {
                const fechaSolicitud = new Date(pasoSolicitud.fecha + 'T00:00:00');
                if (fechaSeleccionada < fechaSolicitud) {
                    errors.fechaPago = `La fecha no puede ser anterior a la solicitud de desembolso (${formatDisplayDate(pasoSolicitud.fecha)}).`;
                }
            }
        }
        // --- FIN DE LA MODIFICACIÓN ---
    }

    if (!montoNumerico || montoNumerico <= 0) {
        errors.monto = "El monto debe ser un número positivo.";
    }

    if (resumenPago && montoNumerico > resumenPago.saldoPendiente && resumenPago.saldoPendiente > 0) {
        errors.monto = `El abono no puede superar el saldo pendiente de ${formatCurrency(resumenPago.saldoPendiente)}`;
    }

    if (!formData.metodoPago || formData.metodoPago.trim() === "") {
        errors.metodoPago = "Debes seleccionar un método de pago.";
    }

    return errors;
};