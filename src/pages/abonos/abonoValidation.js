// Ruta: (la ruta a tu archivo de validación, ej: src/pages/Abonos/abonoValidation.js)

/**
 * Valida ÚNICAMENTE los datos internos del formulario de abono.
 * @param {object} formData - Los datos del formulario, ej: { monto, metodoPago }.
 * @param {object | null} resumenPago - El resumen financiero para validar el monto. Puede ser null.
 * @returns {object} Un objeto de errores. Si está vacío, la validación es exitosa.
 */
export const validateAbono = (formData, resumenPago) => {
    const errors = {};

    // Esta expresión regular es más robusta para limpiar el valor del monto.
    const montoNumerico = parseInt(String(formData.monto || '0').replace(/\D/g, ''), 10);

    if (isNaN(montoNumerico) || montoNumerico <= 0) {
        errors.monto = "El monto debe ser un número mayor a cero.";
    }
    // Solo validamos contra el saldo si tenemos la información del resumen.
    else if (resumenPago && montoNumerico > resumenPago.saldoPendiente) {
        // Formateamos la moneda aquí para un mensaje de error más claro.
        const saldoFormateado = resumenPago.saldoPendiente.toLocaleString("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0
        });
        errors.monto = `El abono no puede superar el saldo pendiente de ${saldoFormateado}.`;
    }

    if (!formData.metodoPago || formData.metodoPago.trim() === "") {
        errors.metodoPago = "Debes seleccionar un método de pago.";
    }

    return errors;
};