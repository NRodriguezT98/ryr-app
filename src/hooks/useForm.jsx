import { useState, useEffect } from 'react';

export const useForm = (initialState, validate, onSubmit, options = {}) => {
    const [formData, setFormData] = useState(initialState);
    const [errors, setErrors] = useState({});
    const [enviando, setEnviando] = useState(false);

    const { inputFilters = {} } = options;

    useEffect(() => {
        setFormData(initialState);
        setErrors({});
    }, [initialState]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const filterConfig = inputFilters[name];
        if (filterConfig && !filterConfig.regex.test(value)) {
            return;
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleValueChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // --- CORRECCIÓN CRÍTICA: Añadir chequeo de tipo de 'validate' ---
        if (typeof validate !== 'function') {
            console.error("useForm: Error crítico - La función 'validate' no es válida o no está definida.", validate); // Agregado 'validate' para ver el valor
            setErrors({ _form: "Error interno del formulario: La lógica de validación no está definida." });
            return; // Detener la ejecución si validate no es una función
        }
        // --- FIN CORRECCIÓN CRÍTICA ---

        const validationErrors = validate(formData);
        setErrors(validationErrors);

        const isValid = Object.keys(validationErrors).length === 0;

        if (isValid) {
            setEnviando(true);
            // --- CORRECCIÓN CRÍTICA: Añadir chequeo de tipo de 'onSubmit' ---
            if (typeof onSubmit === 'function') {
                await onSubmit(formData);
            } else {
                console.warn("useForm: La función 'onSubmit' no está definida. El formulario se envió sin lógica de submit.");
            }
            // --- FIN CORRECCIÓN CRÍTICA ---
            setEnviando(false);
        }
    };

    const resetForm = () => {
        setFormData(initialState);
        setErrors({});
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