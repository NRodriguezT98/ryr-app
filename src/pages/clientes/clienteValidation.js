export const validateCliente = (formData, todosLosClientes, editingId = null) => {
    const errors = {};

    if (!formData.nombres || !formData.nombres.trim()) {
        errors.nombres = "El nombre(s) es obligatorio(s).";
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.nombres.trim())) {
        errors.nombres = "El nombre(s) solo puede(n) contener letras y espacios.";
    }

    if (!formData.apellidos || !formData.apellidos.trim()) {
        errors.apellidos = "El apellido(s) es obligatorio(s).";
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.apellidos.trim())) {
        errors.apellidos = "El apellido(s) solo puede(n) contener letras y espacios.";
    }

    if (!formData.cedula || !formData.cedula.trim()) {
        errors.cedula = "La cédula es obligatoria.";
    } else if (!/^\d+$/.test(formData.cedula.trim())) {
        errors.cedula = "La cédula debe contener solo números.";
    } else if (todosLosClientes) {
        const existe = todosLosClientes.some(
            c => c.id !== editingId && c.datosCliente.cedula === formData.cedula.trim()
        );
        if (existe) {
            errors.cedula = "Esta cédula ya se encuentra registrada.";
        }
    }

    if (!formData.telefono || !formData.telefono.trim()) {
        errors.telefono = "El teléfono es obligatorio.";
    } else if (!/^\d+$/.test(formData.telefono.trim())) {
        errors.telefono = "El teléfono debe contener solo números.";
    }

    if (!formData.correo || !formData.correo.trim()) {
        errors.correo = "El correo es obligatorio.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo.trim())) {
        errors.correo = "El formato del correo no es válido.";
    }

    if (!formData.direccion || !formData.direccion.trim()) {
        errors.direccion = "La dirección es obligatoria.";
    }

    if (!formData.fechaIngreso) {
        errors.fechaIngreso = "La fecha de ingreso es obligatoria.";
    }

    return errors;
};

// --- FUNCIÓN CORREGIDA Y DEFINITIVA ---
export const validateFinancialStep = (financiero, valorVivienda) => {
    const errors = {};
    const {
        aplicaCuotaInicial, cuotaInicial,
        aplicaCredito, credito,
        aplicaSubsidioVivienda, subsidioVivienda,
        aplicaSubsidioCaja, subsidioCaja,
        gastosNotariales
    } = financiero;

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

    // --- NUEVA VALIDACIÓN PARA GASTOS NOTARIALES ---
    if (gastosNotariales.monto > 5000000) {
        errors.gastosNotariales_monto = "El monto no puede superar los $5.000.000";
    }
    totalRecursos += gastosNotariales.monto || 0;


    const totalAPagar = valorVivienda || 0;
    if (totalRecursos !== totalAPagar) {
        errors.financiero = `La suma de los recursos (${totalRecursos.toLocaleString("es-CO", { style: "currency", currency: "COP" })}) debe ser igual al valor de la vivienda.`;
    }

    return errors;
}