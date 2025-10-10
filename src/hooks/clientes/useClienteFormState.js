/**
 * 🎯 Hook: useClienteFormState
 * 
 * Responsabilidad: Gestión del estado del formulario de cliente
 * - Inicializa el reducer con estado en blanco
 * - Gestiona errores de validación
 * - Proporciona dispatch para actualizar estado
 * 
 * Extraído de: useClienteForm.jsx (líneas 90-92)
 * Complejidad: Baja
 * Testing: Unit tests
 * Riesgo: 0% - Solo manejo de estado
 */

import { useReducer, useState } from 'react';
import { formReducer, blankInitialState } from './formReducer.js';

/**
 * Hook para gestionar el estado del formulario de cliente
 * 
 * @param {Object} initialData - Datos iniciales (opcional)
 * @returns {Object} { formData, dispatch, errors, setErrors }
 * 
 * @example
 * const { formData, dispatch, errors, setErrors } = useClienteFormState();
 * 
 * // Actualizar campo
 * dispatch({
 *   type: 'UPDATE_DATOS_CLIENTE',
 *   payload: { field: 'nombres', value: 'Juan' }
 * });
 * 
 * // Establecer errores
 * setErrors({ nombres: 'Campo requerido' });
 */
export const useClienteFormState = (initialData = blankInitialState) => {
    // Reducer para el estado del formulario
    const [formData, dispatch] = useReducer(formReducer, initialData);

    // Estado separado para errores (por compatibilidad con código existente)
    // Nota: También se pueden manejar errores dentro del reducer
    const [errors, setErrors] = useState({});

    return {
        formData,
        dispatch,
        errors,
        setErrors
    };
};

export default useClienteFormState;
