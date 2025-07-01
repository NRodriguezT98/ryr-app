// Ruta: src/hooks/useForm.jsx

import { useState, useEffect, useCallback } from 'react';

/**
 * Hook de React para gestionar el estado, validación y envío de formularios.
 * @param {object} config - Objeto de configuración.
 * @param {object} config.initialState - El estado inicial del formulario.
 * @param {function} [config.validate] - (Opcional) Función que recibe formData y devuelve un objeto de errores.
 * @param {function} config.onSubmit - Función (async) a ejecutar en un envío válido.
 * @param {object} config.options - Opciones adicionales como inputFilters.
 */
// CAMBIO CLAVE: Se añade un valor por defecto a 'validate'. Si no se pasa la función,
// se usará una función vacía que no dará errores.
export const useForm = ({ initialState, validate = () => ({}), onSubmit, options = {} }) => {
    const [formData, setFormData] = useState(initialState);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [initialData, setInitialData] = useState(initialState);

    const { inputFilters = {}, resetOnSuccess = true } = options;

    useEffect(() => {
        setFormData(initialState);
        setInitialData(initialState);
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
        if (e) e.preventDefault();

        // Esta línea ahora es segura, incluso si 'validate' no se proporciona.
        const validationErrors = validate(formData);
        setErrors(validationErrors);


        const isValid = Object.keys(validationErrors).length === 0;

        if (isValid) {
            setIsSubmitting(true);
            try {
                if (typeof onSubmit === 'function') {
                    await onSubmit(formData);
                    if (resetOnSuccess) {
                        resetForm();
                    }
                } else {
                    console.warn("useForm: La función 'onSubmit' no está definida.");
                }
            } catch (error) {
                console.error("useForm: Ocurrió un error durante la ejecución de onSubmit.", error);
            } finally {
                setIsSubmitting(false);
            }
        } else {
        }
    };

    return {
        formData,
        setFormData,
        initialData,
        errors,
        setErrors,
        isSubmitting,
        handleInputChange,
        handleValueChange,
        handleSubmit,
        resetForm,
    };
};
