// src/hooks/useForm.jsx

import { useReducer, useCallback, useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';

function formReducer(state, action) {
    switch (action.type) {
        case 'INITIALIZE_FORM':
            return { ...(action.payload || {}), errors: {} };
        case 'UPDATE_FIELD': {
            const { name, value } = action.payload;
            const newErrors = { ...state.errors };
            delete newErrors[name];
            return { ...state, [name]: value, errors: newErrors };
        }
        case 'SET_ERRORS':
            return { ...state, errors: { ...state.errors, ...action.payload } };
        default:
            return state;
    }
}

export const useForm = ({ initialState, validate = () => ({}), onSubmit, options = {} }) => {
    const [formData, dispatch] = useReducer(formReducer, { ...initialState, errors: {} });
    const { inputFilters = {}, resetOnSuccess = true } = options;
    const [isSubmitting, setIsSubmitting] = useState(false);

    const setFormData = useCallback((newData) => {
        dispatch({ type: 'INITIALIZE_FORM', payload: newData });
    }, []);

    const setErrors = useCallback((errors) => {
        dispatch({ type: 'SET_ERRORS', payload: errors });
    }, []);

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        const filterConfig = inputFilters[name];
        if (filterConfig && !filterConfig.regex.test(value)) {
            setErrors({ [name]: filterConfig.message || "Caracter no permitido." });
            return;
        }
        dispatch({ type: 'UPDATE_FIELD', payload: { name, value } });
    }, [inputFilters, setErrors]);

    const handleValueChange = useCallback((name, value) => {
        dispatch({ type: 'UPDATE_FIELD', payload: { name, value } });
    }, []);

    const resetForm = useCallback(() => {
        dispatch({ type: 'INITIALIZE_FORM', payload: initialState });
    }, [initialState]);

    const handleSubmit = useCallback(async (e) => {
        if (e) e.preventDefault();

        const validationErrors = validate(formData);
        if (Object.keys(validationErrors).length > 0) {
            dispatch({ type: 'SET_ERRORS', payload: validationErrors });
            toast.error("Por favor, corrige los errores en el formulario.");
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit(formData);
            if (resetOnSuccess) {
                resetForm();
            }
        } catch (error) {
            console.error("useForm: Ocurrió un error durante la ejecución de onSubmit.", error);
            toast.error("Ocurrió un error inesperado al guardar.");
        } finally {
            setIsSubmitting(false);
        }
    }, [onSubmit, formData, validate, resetForm, dispatch]); // Añadimos dispatch aquí para la llamada de setErrors

    return useMemo(() => ({
        formData,
        errors: formData.errors || {},
        isSubmitting,
        handleSubmit,
        handleInputChange,
        handleValueChange,
        setFormData,
        setErrors,
        resetForm,
        dispatch
    }), [formData, isSubmitting, handleSubmit, handleInputChange, handleValueChange, setFormData, setErrors, resetForm, dispatch]); // <-- CORRECCIÓN AQUÍ: 'errors' fue eliminado del array
};