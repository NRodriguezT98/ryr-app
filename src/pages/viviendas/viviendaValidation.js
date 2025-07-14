import { formatCurrency } from '../../utils/textFormatters';

export const validateVivienda = (formData, todasLasViviendas, viviendaAEditar = null) => {
    const errors = {};
    const { manzana, numero, matricula, nomenclatura, valorBase, linderoNorte, linderoSur, linderoOriente, linderoOccidente, areaLote, areaConstruida } = formData;

    // --- EXPRESIÓN REGULAR PARA LINDEROS ---
    const linderoRegex = /^[a-zA-Z0-9\s.,\(\)-]*$/;

    if (!manzana) errors.manzana = "La manzana es obligatoria.";
    if (!numero) errors.numero = "El número de casa es obligatorio.";

    // --- VALIDACIÓN DE LINDEROS CON REGEX ---
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
    // --- FIN DE VALIDACIÓN DE LINDEROS ---

    if (!matricula?.trim()) errors.matricula = "La matrícula es obligatoria.";
    if (!nomenclatura?.trim()) errors.nomenclatura = "La nomenclatura es obligatoria.";
    if (!valorBase) errors.valorBase = "El valor base de la casa es obligatorio.";

    const areaLoteNum = parseFloat(String(areaLote).replace(',', '.'));
    const areaConstruidaNum = parseFloat(String(areaConstruida).replace(',', '.'));

    if (!areaLote || String(areaLote).trim() === '') {
        errors.areaLote = "El área del lote es obligatoria.";
    } else if (isNaN(areaLoteNum) || areaLoteNum <= 0) {
        errors.areaLote = "Debe ser un número positivo.";
    }

    if (!areaConstruida || String(areaConstruida).trim() === '') {
        errors.areaConstruida = "El área construida es obligatoria.";
    } else if (isNaN(areaConstruidaNum) || areaConstruidaNum <= 0) {
        errors.areaConstruida = "Debe ser un número positivo.";
    }

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