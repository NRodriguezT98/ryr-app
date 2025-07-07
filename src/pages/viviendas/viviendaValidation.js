// Función para validar la creación/edición de una vivienda completa
export const validateVivienda = (formData, todasLasViviendas, viviendaAEditar = null) => {
    const errors = {};
    // Ya no extraemos 'gastosNotariales' porque no viene del formulario.
    const { manzana, numero, matricula, nomenclatura, valorBase, linderoNorte, linderoSur, linderoOriente, linderoOccidente } = formData;

    const linderoRegex = /^[a-zA-Z0-9\s.,\-()]*$/;

    // --- Validaciones de campos de ubicación ---
    if (!manzana) errors.manzana = "La manzana es obligatoria.";
    if (!numero) errors.numero = "El número de casa es obligatorio.";

    // --- Validaciones para los linderos ---
    if (!linderoNorte?.trim()) {
        errors.linderoNorte = "El lindero Norte es obligatorio.";
    } else if (!linderoRegex.test(linderoNorte)) {
        errors.linderoNorte = "Contiene caracteres no permitidos.";
    }

    if (!linderoSur?.trim()) {
        errors.linderoSur = "El lindero Sur es obligatorio.";
    } else if (!linderoRegex.test(linderoSur)) {
        errors.linderoSur = "Contiene caracteres no permitidos.";
    }

    if (!linderoOriente?.trim()) {
        errors.linderoOriente = "El lindero Oriente es obligatorio.";
    } else if (!linderoRegex.test(linderoOriente)) {
        errors.linderoOriente = "Contiene caracteres no permitidos.";
    }

    if (!linderoOccidente?.trim()) {
        errors.linderoOccidente = "El lindero Occidente es obligatorio.";
    } else if (!linderoRegex.test(linderoOccidente)) {
        errors.linderoOccidente = "Contiene caracteres no permitidos.";
    }

    // --- Validaciones existentes ---
    if (!matricula?.trim()) errors.matricula = "La matrícula es obligatoria.";
    if (!nomenclatura?.trim()) errors.nomenclatura = "La nomenclatura es obligatoria.";
    if (!valorBase) errors.valorBase = "El valor base de la casa es obligatorio.";

    // --- VALIDACIÓN DE GASTOS NOTARIALES ELIMINADA ---

    if (todasLasViviendas && manzana && numero) {
        const isDuplicate = todasLasViviendas.some(vivienda => {
            if (viviendaAEditar?.id && vivienda.id === viviendaAEditar.id) return false;
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

const formatCurrency = (value) => (value || 0).toLocaleString("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 });