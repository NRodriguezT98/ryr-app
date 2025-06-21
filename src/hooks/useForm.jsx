// Ruta: src/hooks/useForm.jsx

import { useState, useEffect, useCallback } from 'react';

/**
 * Hook de React para gestionar el estado, validación y envío de formularios.
 * @param {object} config - Objeto de configuración.
 * @param {object} config.initialState - El estado inicial del formulario.
 * @param {function} config.validate - Función que recibe formData y devuelve un objeto de errores.
 * @param {function} config.onSubmit - Función (async) a ejecutar en un envío válido.
 * @param {object} config.options - Opciones adicionales como inputFilters.
 */
// --- LA CORRECCIÓN ESTÁ EN ESTA LÍNEA ---
export const useForm = ({ initialState, validate, onSubmit, options = {} }) => {
    const [formData, setFormData] = useState(initialState);
    const [errors, setErrors] = useState({});
    const [enviando, setEnviando] = useState(false);

    // El resto del código no cambia, ya estaba correcto.
    const { inputFilters = {} } = options;

    useEffect(() => {
        setFormData(initialState);
        setErrors({});
    }, [initialState]);

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        const filterConfig = inputFilters[name];
        if (filterConfig && !filterConfig.regex.test(value)) {
            return;
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    }, [inputFilters]);

    const handleValueChange = useCallback((name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const resetForm = useCallback(() => {
        setFormData(initialState);
        setErrors({});
    }, [initialState]);


    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validate(formData);
        setErrors(validationErrors);

        const isValid = Object.keys(validationErrors).length === 0;

        if (isValid) {
            setEnviando(true);
            try {
                if (typeof onSubmit === 'function') {
                    await onSubmit(formData);
                    resetForm();
                } else {
                    console.warn("useForm: La función 'onSubmit' no está definida.");
                }
            } catch (error) {
                console.error("useForm: Ocurrió un error durante la ejecución de onSubmit.", error);
            } finally {
                setEnviando(false);
            }
        }
    };

    return {
        formData,
        setFormData,
        errors,
        enviando,
        handleInputChange,
        handleValueChange,
        handleSubmit,
        resetForm,
    };
};