// Este archivo define las reglas de validación específicas para el formulario de viviendas.

export const validateVivienda = (formData) => {
    const errors = {};
    const viviendas = JSON.parse(localStorage.getItem("viviendas")) || [];

    // --- Reglas de Campos Obligatorios y Formato ---
    if (!formData.manzana) errors.manzana = "La manzana es obligatoria.";

    if (!formData.numero) {
        errors.numero = "El número de casa es obligatorio.";
    } else if (!/^\d+$/.test(formData.numero)) {
        errors.numero = "Solo se permiten números.";
    }

    if (!formData.matricula.trim()) {
        errors.matricula = "La matrícula es obligatoria.";
    } else if (!/^[0-9-]+$/.test(formData.matricula.trim())) {
        errors.matricula = 'En el campo "Matrícula inmobiliaria" solo se permite el ingreso de numeros y guiones (-), por ejemplo: 373-123456.';
    }

    if (!formData.nomenclatura.trim()) {
        errors.nomenclatura = "La nomenclatura es obligatoria.";
    } else if (!/^[a-zA-Z0-9\s#-]*$/.test(formData.nomenclatura.trim())) {
        errors.nomenclatura = 'En el campo "Nomenclatura" solo se permite el ingreso de: letras, números, espacios, guiones (-) y numeral (#), por ejemplo: Carrera 5 # 1-02.';
    }

    if (!formData.valor) errors.valor = "El valor total es obligatorio.";

    // --- Reglas de Unicidad (Valores que no se pueden repetir) ---

    // Manzana + Número (si no hay ya un error de formato)
    if (formData.manzana && formData.numero && !errors.numero) {
        const existe = viviendas.some(v => v.manzana === formData.manzana && Number(v.numeroCasa) === Number(formData.numero));
        if (existe) {
            errors.numero = "Ya existe una vivienda con esta manzana y número.";
        }
    }

    // Matrícula
    if (formData.matricula.trim() && !errors.matricula) {
        const existe = viviendas.some(v => v.matricula.trim().toLowerCase() === formData.matricula.trim().toLowerCase());
        if (existe) {
            errors.matricula = "Esta matrícula ya está registrada.";
        }
    }

    // Nomenclatura
    if (formData.nomenclatura.trim() && !errors.nomenclatura) {
        const normalizar = (str) => str.toLowerCase().replace(/\s+/g, " ").trim();
        const nomenclaturaNormalizada = normalizar(formData.nomenclatura);
        const existe = viviendas.some(v => normalizar(v.nomenclatura) === nomenclaturaNormalizada);
        if (existe) {
            errors.nomenclatura = "Esta nomenclatura ya está registrada.";
        }
    }

    return errors;
};