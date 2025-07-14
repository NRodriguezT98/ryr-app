import { useReducer, useCallback, useState, useEffect } from 'react';

function formReducer(state, action) {
    switch (action.type) {
        case 'INITIALIZE_FORM':
            return { ...(action.payload || {}), errors: {} };
        case 'UPDATE_FIELD': {
            const { name, value } = action.payload;
            // Al actualizar un campo, limpiamos su error específico
            const newErrors = { ...state.errors };
            delete newErrors[name];
            return { ...state, [name]: value, errors: newErrors };
        }
        case 'SET_ERRORS':
            return { ...state, errors: action.payload };
        default:
            return state;
    }
}

export const useForm = ({ initialState, validate = () => ({}), onSubmit, options = {} }) => {
    const [formData, dispatch] = useReducer(formReducer, { ...initialState, errors: {} });
    const { inputFilters = {} } = options;
    const [isSubmitting, setIsSubmitting] = useState(false);

    const setFormData = useCallback((newData) => {
        dispatch({ type: 'INITIALIZE_FORM', payload: newData });
    }, []);

    useEffect(() => {
        setFormData(initialState);
    }, [initialState, setFormData]);

    const setErrors = useCallback((errors) => {
        dispatch({ type: 'SET_ERRORS', payload: errors });
    }, []);

    // --- FUNCIÓN DE INPUT MEJORADA CON FILTROS Y ERRORES EN LÍNEA ---
    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        const filterConfig = inputFilters[name];

        if (filterConfig && !filterConfig.regex.test(value)) {
            // Si el valor no coincide, NO actualizamos el estado.
            // En su lugar, establecemos un error específico para este campo.
            setErrors({
                ...formData.errors,
                [name]: filterConfig.message || "Caracter no permitido."
            });
            return;
        }
        // Si el valor es válido, actualizamos el campo y limpiamos cualquier error previo.
        dispatch({ type: 'UPDATE_FIELD', payload: { name, value } });
    }, [inputFilters, formData.errors, setErrors]);

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
            // Ya no usamos toast, la UI mostrará los errores.
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit(formData);
            resetForm();
        } catch (error) {
            console.error("useForm: Ocurrió un error durante la ejecución de onSubmit.", error);
        } finally {
            setIsSubmitting(false);
        }
    }, [onSubmit, formData, validate, resetForm]);

    return {
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
    };
};