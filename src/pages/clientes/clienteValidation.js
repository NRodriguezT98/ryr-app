import { formatCurrency } from '../../utils/textFormatters';

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

export const validateFinancialStep = (financiero, valorVivienda) => {
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
        totalRecursos += credito.monto || 0;
    }
    if (aplicaSubsidioVivienda) {
        if (!subsidioVivienda.monto || subsidioVivienda.monto <= 0) errors.subsidioVivienda_monto = "El monto debe ser > 0.";
        totalRecursos += subsidioVivienda.monto || 0;
    }
    if (aplicaSubsidioCaja) {
        if (!subsidioCaja.caja) errors.subsidioCaja_caja = "Selecciona una caja.";
        if (!subsidioCaja.monto || subsidioCaja.monto <= 0) errors.subsidioCaja_monto = "El monto debe ser > 0.";
        totalRecursos += subsidioCaja.monto || 0;
    }

    const totalAPagar = valorVivienda || 0;
    if (totalRecursos !== totalAPagar && totalAPagar > 0) {
        errors.financiero = `La suma de los recursos (${formatCurrency(totalRecursos)}) debe ser igual al valor de la vivienda.`;
    }
    return errors;
};