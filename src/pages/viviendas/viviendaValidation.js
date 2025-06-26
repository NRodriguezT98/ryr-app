/**
 * Valida los datos del formulario de una vivienda. Es una función pura.
 * @param {object} formData - Los datos del formulario a validar.
 * @param {Array} todasLasViviendas - Un array con TODAS las viviendas existentes para chequear unicidad.
 * @param {number|null} editingId - El ID de la vivienda que se está editando, o null si se está creando una nueva.
 * @returns {object} Un objeto de errores. Si está vacío, la validación es exitosa.
 */
export const validateVivienda = (formData, todasLasViviendas, viviendaIdAExcluir = null) => {
    const errors = {};
    const { manzana, numero, matricula, nomenclatura, valor, descuentoMonto, descuentoMotivo } = formData;

    // Validaciones de los campos principales
    if (!manzana) errors.manzana = "La manzana es obligatoria.";
    if (!numero) errors.numero = "El número de casa es obligatorio.";
    if (!matricula.trim()) errors.matricula = "La matrícula es obligatoria.";
    if (!nomenclatura.trim()) errors.nomenclatura = "La nomenclatura es obligatoria.";

    // Solo validamos el valor al crear, no al editar
    if (!viviendaIdAExcluir) {
        if (!valor) errors.valor = "El valor total es obligatorio.";
    }

    // --- NUEVA VALIDACIÓN PARA EL DESCUENTO ---
    // Limpiamos y convertimos el monto a número para la validación
    const montoDescuentoNumerico = parseInt(String(descuentoMonto).replace(/\D/g, ''), 10) || 0;

    if (montoDescuentoNumerico > 0 && !descuentoMotivo.trim()) {
        errors.descuentoMotivo = "El motivo es obligatorio si se aplica un descuento.";
    }
    // -----------------------------------------

    // Comprobación de duplicados
    if (todasLasViviendas && manzana && numero) {
        const isDuplicate = todasLasViviendas.some(vivienda => {
            if (vivienda.id === viviendaIdAExcluir) return false;
            return vivienda.manzana === manzana && vivienda.numeroCasa?.toString() === numero.trim();
        });

        if (isDuplicate) {
            errors.numero = "Ya existe una vivienda con esta manzana y número.";
        }
    }

    return errors;
};