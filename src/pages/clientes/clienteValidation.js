// Ruta: src/pages/clientes/clienteValidation.js

import { getClientes } from '../../utils/storage';

export const validateCliente = (formData, isEditing = false) => { // Asegúrate de que `isEditing` tenga un valor por defecto
    const errors = {};
    const clientes = getClientes();

    if (!formData.nombre.trim()) {
        errors.nombre = "El nombre es obligatorio.";
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.nombre.trim())) {
        errors.nombre = "El nombre solo puede contener letras y espacios.";
    }

    if (!formData.cedula.trim()) {
        errors.cedula = "La cédula es obligatoria.";
    } else if (!/^\d+$/.test(formData.cedula.trim())) {
        errors.cedula = "La cédula debe contener solo números.";
    }

    // --- Reglas de Unicidad para la Cédula ---
    if (formData.cedula.trim() && !errors.cedula) {
        const existe = clientes.some(c =>
            c.cedula === formData.cedula.trim() &&
            (isEditing ? c.id !== formData.id : false) // Si isEditing es false, c.id !== formData.id será true para todos los clientes, lo que está bien para crear
        );
        if (existe) {
            errors.cedula = "Esta cédula ya se encuentra registrada.";
        }
    }

    if (!formData.telefono.trim()) {
        errors.telefono = "El teléfono es obligatorio.";
    } else if (!/^\d+$/.test(formData.telefono.trim())) {
        errors.telefono = "El teléfono debe contener solo números.";
    }

    if (!formData.correo.trim()) {
        errors.correo = "El correo es obligatorio.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo.trim())) {
        errors.correo = "El formato del correo no es válido.";
    }

    // El bloque de validación de correo único fue comentado previamente.
    /*
    if (formData.correo.trim() && !errors.correo) {
        const existe = clientes.some(c => 
            c.correo.trim().toLowerCase() === formData.correo.trim().toLowerCase() && 
            (isEditing ? c.id !== formData.id : false)
        );
        if (existe) {
            errors.correo = "Este correo ya se encuentra registrado.";
        }
    }
    */

    if (!formData.direccion.trim()) errors.direccion = "La dirección es obligatoria.";
    // La validación de viviendaId ahora considera también `null` para el caso de Select que puede retornar null.
    if (formData.viviendaId === "" || formData.viviendaId === null) errors.viviendaId = "Debes asignar una vivienda.";

    return errors;
};