// Ruta: src/pages/abonos/abonoValidation.js

import { getClientes } from '../../utils/storage';

export const validateAbono = (formData, selectedViviendaId, resumenPago, allViviendasData) => {
    const errors = {};

    const montoNumerico = parseFloat(String(formData.monto).replace(/\./g, '').replace(',', '.'));

    if (!selectedViviendaId) {
        errors.viviendaId = "Debes seleccionar una vivienda para registrar el abono.";
    } else {
        const viviendaSeleccionada = allViviendasData.find(v => v.id === selectedViviendaId);
        if (!viviendaSeleccionada || !viviendaSeleccionada.clienteId) {
            errors.viviendaId = "La vivienda seleccionada no tiene un cliente asignado.";
        }
    }

    if (isNaN(montoNumerico) || montoNumerico <= 0) {
        errors.monto = "El monto debe ser un número positivo.";
    } else if (resumenPago.saldoPendiente !== null && montoNumerico > resumenPago.saldoPendiente && resumenPago.saldoPendiente >= 0) {
        errors.monto = `El abono no puede ser mayor al saldo pendiente ($${resumenPago.saldoPendiente.toLocaleString("es-CO", { minimumFractionDigits: 0 })}).`;
    }

    if (!formData.metodoPago) {
        errors.metodoPago = "Debes seleccionar un método de pago.";
    }

    return errors;
};