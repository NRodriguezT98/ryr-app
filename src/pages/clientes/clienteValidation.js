/**
 * Valida los datos del formulario de un cliente.
 * @param {object} formData - El objeto datosCliente del estado principal.
 * @param {Array} todosLosClientes - Array con todos los clientes para chequear unicidad.
 * @param {string|null} editingId - El ID del cliente que se está editando.
 */
export const validateCliente = (formData, todosLosClientes, editingId = null) => {
    const errors = {};

    // Nombres
    if (!formData.nombres || !formData.nombres.trim()) {
        errors.nombres = "El nombre(s) es obligatorio(s).";
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.nombres.trim())) {
        errors.nombres = "El nombre(s) solo puede(n) contener letras y espacios.";
    }

    // Apellidos
    if (!formData.apellidos || !formData.apellidos.trim()) {
        errors.apellidos = "El apellido(s) es obligatorio(s).";
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.apellidos.trim())) {
        errors.apellidos = "El apellido(s) solo puede(n) contener letras y espacios.";
    }

    // Cédula
    if (!formData.cedula || !formData.cedula.trim()) {
        errors.cedula = "La cédula es obligatoria.";
    } else if (!/^\d+$/.test(formData.cedula.trim())) {
        errors.cedula = "La cédula debe contener solo números.";
    } else if (todosLosClientes) {
        const existe = todosLosClientes.some(
            c => c.id !== editingId && c.cedula === formData.cedula.trim()
        );
        if (existe) {
            errors.cedula = "Esta cédula ya se encuentra registrada.";
        }
    }

    // Teléfono
    if (!formData.telefono || !formData.telefono.trim()) {
        errors.telefono = "El teléfono es obligatorio.";
    } else if (!/^\d+$/.test(formData.telefono.trim())) {
        errors.telefono = "El teléfono debe contener solo números.";
    }

    // Correo
    if (!formData.correo || !formData.correo.trim()) {
        errors.correo = "El correo es obligatorio.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo.trim())) {
        errors.correo = "El formato del correo no es válido.";
    }

    // Dirección (con la nueva validación de formato)
    if (!formData.direccion || !formData.direccion.trim()) {
        errors.direccion = "La dirección es obligatoria.";
    }
    // --- NUEVA REGLA AÑADIDA ---
    else if (!/^[a-zA-Z0-9\s#\-áéíóúÁÉÍÓÚñÑ]*$/.test(formData.direccion)) {
        errors.direccion = "La dirección solo puede contener letras, números, espacios y los símbolos # -";
    }

    return errors;
};

export const validateFinancialStep = (financiero, valorVivienda) => {
    const errors = {};
    const {
        aplicaCuotaInicial, cuotaInicial,
        aplicaCredito, credito,
        aplicaSubsidioVivienda, subsidioVivienda,
        aplicaSubsidioCaja, subsidioCaja
    } = financiero;

    let totalAportado = 0;

    // Validación Cuota Inicial
    if (aplicaCuotaInicial) {
        if (!cuotaInicial.metodo) {
            errors.cuotaInicial_metodo = "Selecciona un método.";
        }
        if (!cuotaInicial.monto || cuotaInicial.monto <= 0) {
            errors.cuotaInicial_monto = "El monto debe ser mayor a cero.";
        }
        totalAportado += cuotaInicial.monto || 0;
    }

    // Validación Crédito Hipotecario
    if (aplicaCredito) {
        if (!credito.banco) {
            errors.credito_banco = "Selecciona un banco.";
        }
        if (!credito.monto || credito.monto <= 0) {
            errors.credito_monto = "El monto debe ser mayor a cero.";
        }
        totalAportado += credito.monto || 0;
    }

    // Validación Subsidio Mi Casa Ya
    if (aplicaSubsidioVivienda) {
        if (!subsidioVivienda.monto || subsidioVivienda.monto <= 0) {
            errors.subsidioVivienda_monto = "El monto debe ser mayor a cero.";
        }
        totalAportado += subsidioVivienda.monto || 0;
    }

    // Validación Subsidio Caja de Compensación
    if (aplicaSubsidioCaja) {
        if (!subsidioCaja.caja) {
            errors.subsidioCaja_caja = "Selecciona una caja.";
        }
        if (!subsidioCaja.monto || subsidioCaja.monto <= 0) {
            errors.subsidioCaja_monto = "El monto debe ser mayor a cero.";
        }
        totalAportado += subsidioCaja.monto || 0;
    }

    // Validación final de la suma total
    if (totalAportado !== valorVivienda) {
        errors.financiero = `La suma de los recursos propios (${totalAportado.toLocaleString("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 })}) debe ser igual al valor de la vivienda.`;
    }

    return errors;
}