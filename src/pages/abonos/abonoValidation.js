export const validateAbono = (formData, resumenPago, fechaIngresoCliente) => {
    const errors = {};
    const montoNumerico = parseInt(String(formData.monto || '0').replace(/\D/g, ''), 10);

    // Validación de Fecha
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
                errors.fechaPago = `La fecha no puede ser anterior al ingreso del cliente (${fechaIngreso.toLocaleDateString('es-ES')}).`;
            }
        }
    }

    // Validación de Monto
    if (!montoNumerico || montoNumerico <= 0) {
        errors.monto = "El monto debe ser un número positivo.";
    }

    if (resumenPago && montoNumerico > resumenPago.saldoPendiente && resumenPago.saldoPendiente > 0) {
        errors.monto = `El abono no puede superar el saldo pendiente de ${resumenPago.saldoPendiente.toLocaleString("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 })}`;
    }

    // Esta validación estaba ausente en el archivo anterior, la restauramos.
    if (!formData.metodoPago || formData.metodoPago.trim() === "") {
        errors.metodoPago = "Debes seleccionar un método de pago.";
    }

    return errors;
};