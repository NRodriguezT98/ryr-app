/**
 * Valida los datos del formulario de una vivienda. Es una función pura.
 * @param {object} formData - Los datos del formulario a validar.
 * @param {Array} todasLasViviendas - Un array con TODAS las viviendas existentes para chequear unicidad.
 * @param {number|null} editingId - El ID de la vivienda que se está editando, o null si se está creando una nueva.
 * @returns {object} Un objeto de errores. Si está vacío, la validación es exitosa.
 */
export const validateVivienda = (formData, todasLasViviendas, editingId = null) => {
    const errors = {};

    // Reglas de Campos Obligatorios
    if (!formData.manzana) errors.manzana = "La manzana es obligatoria.";
    if (!formData.numero) errors.numero = "El número de casa es obligatorio.";
    if (!formData.matricula.trim()) errors.matricula = "La matrícula es obligatoria.";
    if (!formData.nomenclatura.trim()) errors.nomenclatura = "La nomenclatura es obligatoria.";
    if (!formData.valor) errors.valor = "El valor total es obligatorio.";

    // Reglas de Unicidad (solo se ejecutan si los campos básicos son válidos)
    if (formData.manzana && formData.numero && !errors.numero) {
        const existe = todasLasViviendas.some(
            v => v.id !== editingId &&
                v.manzana === formData.manzana &&
                Number(v.numeroCasa) === Number(formData.numero)
        );
        if (existe) errors.numero = "Ya existe otra vivienda con esta manzana y número.";
    }

    if (formData.matricula.trim() && !errors.matricula) {
        const existe = todasLasViviendas.some(
            v => v.id !== editingId &&
                v.matricula.trim().toLowerCase() === formData.matricula.trim().toLowerCase()
        );
        if (existe) errors.matricula = "Esta matrícula ya está registrada en otra vivienda.";
    }

    if (formData.nomenclatura.trim() && !errors.nomenclatura) {
        const normalizar = (str) => str.toLowerCase().replace(/\s+/g, " ").trim();
        const nomenclaturaNormalizada = normalizar(formData.nomenclatura);
        const existe = todasLasViviendas.some(
            v => v.id !== editingId && normalizar(v.nomenclatura) === nomenclaturaNormalizada
        );
        if (existe) errors.nomenclatura = "Esta nomenclatura ya está registrada en otra vivienda.";
    }

    return errors;
};