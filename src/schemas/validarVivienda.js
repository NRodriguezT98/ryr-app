// src/schemas/validarVivienda.js
export const validarVivienda = (formData, viviendas) => {
    const errores = {};

    if (!formData.manzana) errores.manzana = "La manzana es obligatoria.";

    if (!formData.numero) {
        errores.numero = "El número de casa es obligatorio.";
    } else if (!/^\d+$/.test(formData.numero)) {
        errores.numero = "Solo se permiten números en el número de casa.";
    }

    if (!formData.matricula?.trim()) {
        errores.matricula = "La matrícula es obligatoria.";
    } else if (!/^[0-9-]+$/.test(formData.matricula.trim())) {
        errores.matricula = "Solo puede contener números y guiones.";
    }

    if (!formData.nomenclatura?.trim()) {
        errores.nomenclatura = "La nomenclatura es obligatoria.";
    } else if (!/^[a-zA-Z0-9\s\-#]+$/.test(formData.nomenclatura.trim())) {
        errores.nomenclatura = "Solo letras, números, espacios, guión y numeral.";
    }

    if (formData.valor === "") {
        errores.valor = "El valor total es obligatorio.";
    } else if (!/^\d+$/.test(formData.valor)) {
        errores.valor = "Solo se permiten números.";
    }

    const yaExiste = viviendas.some(
        (v) => v.manzana === formData.manzana && parseInt(v.numeroCasa) === parseInt(formData.numero)
    );
    if (yaExiste) {
        errores.repetido = "Ya existe una vivienda con esta manzana y número.";
    }

    return errores;
};
