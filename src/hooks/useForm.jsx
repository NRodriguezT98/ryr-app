import { useState, useReducer, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';

function formReducer(state, action) {
    switch (action.type) {
        case 'INITIALIZE_FORM':
            return { ...(action.payload || {}), errors: {} };
        case 'UPDATE_FIELD':
            const { name, value } = action.payload;
            return { ...state, [name]: value };
        case 'SET_ERRORS':
            return { ...state, errors: action.payload };
        // <-- 1. AÑADIMOS UN NUEVO CASO PARA MANEJAR ACTUALIZACIONES CON FUNCIONES
        case 'SET_FORM_DATA_FN':
            return action.payload(state);
        default:
            return state;
    }
}

export const useForm = ({ initialState, validate = () => ({}), onSubmit, options = {} }) => {
    // Usamos el estado del reducer, pero también guardamos una copia inicial limpia.
    const [formData, dispatch] = useReducer(formReducer, { ...initialState, errors: {} });
    const [initialData, setInitialData] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { inputFilters = {}, resetOnSuccess = true } = options;

    // Guardamos el estado inicial una sola vez
    useMemo(() => {
        if (initialState) {
            const deepCopy = JSON.parse(JSON.stringify(initialState));
            setInitialData(deepCopy);
        }
    }, [initialState]);

    // <-- 2. HACEMOS QUE setFormData ACEPTE OBJETOS O FUNCIONES
    const setFormData = useCallback((updater) => {
        if (typeof updater === 'function') {
            dispatch({ type: 'SET_FORM_DATA_FN', payload: updater });
        } else {
            dispatch({ type: 'INITIALIZE_FORM', payload: updater });
        }
    }, []);

    const setErrors = useCallback((errors) => {
        dispatch({ type: 'SET_ERRORS', payload: errors });
    }, []);

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        const filterConfig = inputFilters[name];
        if (filterConfig && !filterConfig.regex.test(value)) return;
        dispatch({ type: 'UPDATE_FIELD', payload: { name, value } });
    }, [inputFilters]);

    const handleValueChange = useCallback((name, value) => {
        dispatch({ type: 'UPDATE_FIELD', payload: { name, value } });
    }, []);

    const handleSubmit = useCallback(async (e) => {
        if (e) e.preventDefault();
        if (isSubmitting) return;

        const validationErrors = validate(formData);
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            toast.error("Por favor, corrige los errores antes de enviar.");
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit(formData);
            if (resetOnSuccess) {
                dispatch({ type: 'INITIALIZE_FORM', payload: initialState });
            }
        } catch (error) {
            console.error("useForm: Ocurrió un error durante la ejecución de onSubmit.", error);
            toast.error("Ocurrió un error inesperado al guardar.");
        } finally {
            setIsSubmitting(false);
        }
    }, [onSubmit, formData, isSubmitting, resetOnSuccess, initialState, validate, setErrors]);

    return {
        formData, dispatch, errors: formData.errors || {},
        isSubmitting, handleSubmit, handleInputChange, handleValueChange, setFormData, setErrors,
        initialData
    };
};