const formatCurrency = (value) => (value || 0).toLocaleString("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 });

// Función para validar la creación de un abono (sin cambios)
export const validateAbono = (formData, resumenPago) => {
    const errors = {};
    const montoNumerico = parseInt(String(formData.monto || '0').replace(/\D/g, ''), 10);

    if (!formData.fechaPago) {
        errors.fechaPago = "La fecha del abono es obligatoria.";
    } else {
        const fechaSeleccionada = new Date(formData.fechaPago + 'T00:00:00');
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        if (fechaSeleccionada > hoy) {
            errors.fechaPago = "La fecha del abono no puede ser futura.";
        }
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

// --- FUNCIÓN DE VALIDACIÓN PARA EDITAR ABONOS (MODIFICADA) ---
export const validateAbonoOnEdit = (formData, abonoOriginal, vivienda) => {
    const errors = {};
    if (!vivienda || !abonoOriginal) return errors;

    const montoNuevo = parseInt(String(formData.monto || '0').replace(/\D/g, ''), 10);
    const montoOriginal = abonoOriginal.monto || 0;
    const diferenciaDeMonto = montoNuevo - montoOriginal;
    const saldoPendiente = vivienda.saldoPendiente || 0;

    if (diferenciaDeMonto > (saldoPendiente + 0.01)) {
        errors.monto = `El ajuste del abono no puede superar el saldo pendiente de ${formatCurrency(saldoPendiente)}.`;
    }

    if (montoNuevo <= 0) {
        errors.monto = "El monto debe ser un número positivo.";
    }

    // --- LÓGICA DE VALIDACIÓN DE FECHA AÑADIDA AQUÍ ---
    if (!formData.fechaPago) {
        errors.fechaPago = "La fecha es obligatoria.";
    } else {
        const fechaSeleccionada = new Date(formData.fechaPago + 'T00:00:00');
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        if (fechaSeleccionada > hoy) {
            errors.fechaPago = "La fecha del abono no puede ser futura.";
        }
    }

    return errors;
};