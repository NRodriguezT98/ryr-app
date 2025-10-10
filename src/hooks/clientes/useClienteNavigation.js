/**
 * 🧭 Hook: useClienteNavigation
 * 
 * Responsabilidad: Gestión de navegación entre pasos del wizard
 * - Control del paso actual (1, 2, 3)
 * - Navegación hacia adelante (con validación)
 * - Navegación hacia atrás
 * - Validación antes de avanzar
 * 
 * Extraído de: useClienteForm.jsx (líneas 363-380)
 * Complejidad: Baja
 * Testing: Unit tests
 * Riesgo: 10% - Lógica simple y aislada
 */

import { useState, useCallback } from 'react';
import { useModernToast } from '../../useModernToast.jsx';

/**
 * Hook para gestionar la navegación del wizard de cliente
 * 
 * @param {Function} validateCurrentStep - Función que valida el paso actual
 * @param {Function} setErrors - Función para establecer errores
 * @param {Object} formData - Datos del formulario (para validaciones específicas)
 * @returns {Object} { step, setStep, handleNextStep, handlePrevStep, canGoNext, canGoPrev }
 * 
 * @example
 * const { step, handleNextStep, handlePrevStep } = useClienteNavigation(
 *   validateCurrentStep,
 *   setErrors,
 *   formData
 * );
 * 
 * // Avanzar al siguiente paso
 * handleNextStep(); // Valida antes de avanzar
 * 
 * // Retroceder
 * handlePrevStep();
 */
export const useClienteNavigation = (
    validateCurrentStep,
    setErrors,
    formData
) => {
    const toast = useModernToast();
    const [step, setStep] = useState(1);

    /**
     * Navegar al siguiente paso
     * Valida el paso actual antes de permitir avanzar
     */
    const handleNextStep = useCallback(() => {
        let errors = {};

        // Validación específica del Paso 1: Vivienda requerida
        if (step === 1 && !formData.viviendaSeleccionada) {
            toast.error("Debes seleccionar una vivienda para continuar.", {
                title: "Vivienda Requerida"
            });
            return false;
        }

        // Validación del Paso 2: Ejecutar función de validación
        if (step === 2) {
            errors = validateCurrentStep();
            if (Object.keys(errors).length > 0) {
                setErrors(errors);
                return false;
            }
        }

        // Si no hay errores, limpiar errores y avanzar
        setErrors({});
        setStep(s => Math.min(s + 1, 3)); // Máximo paso 3
        return true;
    }, [step, formData, validateCurrentStep, setErrors, toast]);

    /**
     * Navegar al paso anterior
     * No requiere validación
     */
    const handlePrevStep = useCallback(() => {
        setStep(s => Math.max(s - 1, 1)); // Mínimo paso 1
    }, []);

    /**
     * Verificar si puede avanzar al siguiente paso
     */
    const canGoNext = step < 3;

    /**
     * Verificar si puede retroceder
     */
    const canGoPrev = step > 1;

    /**
     * Ir a un paso específico (útil para navegación directa)
     */
    const goToStep = useCallback((targetStep) => {
        if (targetStep >= 1 && targetStep <= 3) {
            setStep(targetStep);
        }
    }, []);

    return {
        step,
        setStep,
        handleNextStep,
        handlePrevStep,
        canGoNext,
        canGoPrev,
        goToStep
    };
};

export default useClienteNavigation;
