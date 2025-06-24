/**
 * Valida los datos del formulario de un cliente. Es una función pura.
 * @param {object} formData - Los datos del formulario a validar.
 * @param {Array} todosLosClientes - Un array con TODOS los clientes existentes para chequear unicidad.
 * @param {number|null} editingId - El ID del cliente que se está editando, o null si se está creando uno nuevo.
 * @returns {object} Un objeto de errores. Si está vacío, la validación es exitosa.
 */
export const validateCliente = (formData, todosLosClientes, editingId = null) => {
    const errors = {};

    // Reglas de Campos Obligatorios y Formato
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

    if (!formData.direccion.trim()) {
        errors.direccion = "La dirección es obligatoria.";
    }

    // La asignación de vivienda es opcional al crear/editar un cliente, por lo que no se valida aquí
    // a menos que tus reglas de negocio lo requieran explícitamente.

    // --- Reglas de Unicidad ---
    // Se ejecutan solo si los campos básicos son válidos.
    if (formData.cedula.trim() && !errors.cedula) {
        const existe = todosLosClientes.some(
            c => c.id !== editingId && c.cedula === formData.cedula.trim()
        );
        if (existe) {
            errors.cedula = "Esta cédula ya se encuentra registrada.";
        }
    }

    // Si decides reactivar la validación de correo único, este sería el lugar.
    /*
    if (formData.correo.trim() && !errors.correo) {
        const existe = todosLosClientes.some(
            c => c.id !== editingId && c.correo.trim().toLowerCase() === formData.correo.trim().toLowerCase()
        );
        if (existe) {
            errors.correo = "Este correo ya se encuentra registrado.";
        }
    }
    */

    return errors;
};