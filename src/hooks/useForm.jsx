import { useReducer, useCallback } from 'react';
import toast from 'react-hot-toast';

function formReducer(state, action) {
    switch (action.type) {
        case 'INITIALIZE_FORM':
            return { ...(action.payload || {}), errors: {} };
        case 'UPDATE_FIELD': {
            const { name, value } = action.payload;
            return { ...state, [name]: value };
        }
        case 'SET_ERRORS':
            return { ...state, errors: action.payload };
        case 'SET_FORM_DATA_FN':
            return action.payload(state);
        default:
            return state;
    }
}

export const useForm = ({ initialState, validate = () => ({}), onSubmit, options = {} }) => {
    // El estado se inicializa una sola vez aquí.
    const [formData, dispatch] = useReducer(formReducer, { ...initialState, errors: {} });
    const { inputFilters = {}, resetOnSuccess = true } = options;

    // setFormData ahora solo actualiza el estado. La responsabilidad de cuándo llamar a esto
    // recae en el componente que usa el hook.
    const setFormData = useCallback((newData) => {
        dispatch({ type: 'INITIALIZE_FORM', payload: newData });
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

    const resetForm = useCallback(() => {
        dispatch({ type: 'INITIALIZE_FORM', payload: initialState });
    }, [initialState]);

    const handleSubmit = useCallback(async (e) => {
        if (e) e.preventDefault();

        const validationErrors = validate(formData);
        if (Object.keys(validationErrors).length > 0) {
            dispatch({ type: 'SET_ERRORS', payload: validationErrors });
            toast.error("Por favor, corrige los errores antes de enviar.");
            return;
        }

        try {
            await onSubmit(formData);
            if (resetOnSuccess) {
                resetForm();
            }
        } catch (error) {
            console.error("useForm: Ocurrió un error durante la ejecución de onSubmit.", error);
            toast.error("Ocurrió un error inesperado al guardar.");
        }
    }, [onSubmit, formData, resetOnSuccess, validate, resetForm]);

    return {
        formData,
        errors: formData.errors || {},
        isSubmitting: false, // Simplificamos, el componente puede manejar su propio estado de carga si es complejo.
        handleSubmit,
        handleInputChange,
        handleValueChange,
        setFormData,
        setErrors,
        resetForm,
        dispatch
    };
};