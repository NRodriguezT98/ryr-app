// Función para validar la creación/edición de una vivienda completa
export const validateVivienda = (formData, todasLasViviendas, viviendaAEditar = null) => {
    const errors = {};
    const { manzana, numero, matricula, nomenclatura, valorBase, gastosNotariales } = formData;

    // Validaciones de campos básicos
    if (!manzana) errors.manzana = "La manzana es obligatoria.";
    if (!numero) errors.numero = "El número de casa es obligatorio.";
    if (!matricula?.trim()) errors.matricula = "La matrícula es obligatoria.";
    if (!nomenclatura?.trim()) errors.nomenclatura = "La nomenclatura es obligatoria.";

    // --- NUEVAS VALIDACIONES AÑADIDAS AQUÍ ---
    // Estos campos ahora son requeridos para la validación final
    if (!valorBase) {
        errors.valorBase = "El valor base de la casa es obligatorio.";
    }
    if (!gastosNotariales) {
        errors.gastosNotariales = "Los gastos notariales son obligatorios.";
    }
    // Ya no validamos el campo 'valor' porque se calcula automáticamente.


    // Comprobación de duplicados (sin cambios)
    if (todasLasViviendas && manzana && numero) {
        const isDuplicate = todasLasViviendas.some(vivienda => {
            if (vivienda.id === viviendaAEditar?.id) return false;
            return vivienda.manzana === manzana && vivienda.numeroCasa?.toString() === numero.trim();
        });
        if (isDuplicate) errors.numero = "Ya existe una vivienda con esta manzana y número.";
    }

    return errors;
};

// La función para validar descuentos no necesita cambios.
export const validateDescuento = (formData, vivienda) => {
    const errors = {};
    const { descuentoMonto, descuentoMotivo } = formData;

    if (!vivienda) {
        errors.general = "No se ha proporcionado una vivienda para validar el descuento.";
        return errors;
    }

    const montoDescuentoNuevo = parseInt(String(descuentoMonto).replace(/\D/g, ''), 10) || 0;

    if (montoDescuentoNuevo > 0 && !descuentoMotivo?.trim()) {
        errors.descuentoMotivo = "El motivo es obligatorio si se aplica un descuento.";
    }

    const saldoPendiente = vivienda.saldoPendiente || 0;
    if (montoDescuentoNuevo > saldoPendiente) {
        errors.descuentoMonto = `El descuento no puede superar el saldo pendiente de ${formatCurrency(saldoPendiente)}.`;
    }

    return errors;
};

// Pequeña función de ayuda para formatear moneda
const formatCurrency = (value) => (value || 0).toLocaleString("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 });