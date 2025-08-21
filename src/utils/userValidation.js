export const validateUsuario = (formData) => {
    const errors = {};
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    const cedulaRegex = /^[0-9]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

    if (!formData.nombres?.trim() || !nameRegex.test(formData.nombres)) {
        errors.nombres = 'Solo se permiten letras y espacios.';
    }
    if (!formData.apellidos?.trim() || !nameRegex.test(formData.apellidos)) {
        errors.apellidos = 'Solo se permiten letras y espacios.';
    }
    if (!formData.cedula?.trim() || !cedulaRegex.test(formData.cedula)) {
        errors.cedula = 'La cédula solo debe contener números.';
    }
    if (!formData.email?.trim() || !emailRegex.test(formData.email)) {
        errors.email = 'El formato del correo no es válido.';
    }
    if (formData.password && !passwordRegex.test(formData.password)) {
        errors.password = 'Debe tener 8+ caracteres, 1 mayúscula, 1 minúscula y 1 número.';
    }
    if (!formData.role) {
        errors.role = 'Debes seleccionar un rol.';
    }

    return errors;
};