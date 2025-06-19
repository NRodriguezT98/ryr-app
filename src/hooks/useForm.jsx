import { useState, useEffect, useCallback } from 'react';

export const useForm = (initialState, validate, onSubmit, options = {}) => {
    const [formData, setFormData] = useState(initialState);
    const [errors, setErrors] = useState({});
    const [enviando, setEnviando] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { inputFilters = {} } = options;

    const runValidation = useCallback(() => {
        const validationErrors = validate(formData);
        setErrors(validationErrors);
        return Object.keys(validationErrors).length === 0;
    }, [formData, validate]);

    useEffect(() => {
        if (isSubmitting) {
            runValidation();
        }
    }, [formData, isSubmitting, runValidation]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        const filterConfig = inputFilters[name];
        if (filterConfig && !filterConfig.regex.test(value)) {
            setErrors(prev => ({ ...prev, [name]: filterConfig.message }));
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));

        if (errors[name] && filterConfig && errors[name] === filterConfig.message) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleValueChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const isValid = runValidation();

        if (isValid) {
            setErrors({});
            setIsSubmitting(false);
            setEnviando(true);

            await onSubmit(formData);

            // --- LA SOLUCIÓN DEFINITIVA ESTÁ AQUÍ ---
            // Inmediatamente después de un envío exitoso, reseteamos el formulario a su estado inicial.
            setFormData(initialState);

            setEnviando(false);
        }
    };

    return {
        formData,
        errors,
        setErrors,
        enviando,
        handleInputChange,
        handleValueChange,
        handleSubmit,
    };
};