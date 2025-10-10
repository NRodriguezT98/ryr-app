/**
 * ✅ Hook: useClienteValidation
 * 
 * Responsabilidad: Validación de datos del formulario de cliente
 * - Validación por paso del wizard
 * - Combinación de validaciones de cliente y financiero
 * - Gestión de errores estructurados
 * 
 * Extraído de: useClienteForm.jsx (validaciones dispersas)
 * Complejidad: Media
 * Testing: Unit tests
 * Riesgo: 15% - Lógica de negocio importante
 */

import { useCallback, useMemo } from 'react';
import {
    validateCliente,
    validateFinancialStep,
    validateEditarCliente
} from '../../../utils/validation.js';

/**
 * Hook para gestionar las validaciones del formulario de cliente
 * 
 * @param {Object} formData - Datos completos del formulario
 * @param {number} step - Paso actual del wizard
 * @param {string} modo - Modo de operación: 'crear' | 'editar' | 'reactivar'
 * @param {boolean} isEditing - Si está en modo edición
 * @param {Array} todosLosClientes - Lista completa de clientes (para validar duplicados)
 * @param {string} clienteId - ID del cliente (para edición)
 * @param {Array} abonosDelCliente - Abonos del cliente (para edición)
 * @returns {Object} { validateCurrentStep, validateAll, hasErrors }
 * 
 * @example
 * const { validateCurrentStep, validateAll } = useClienteValidation(
 *   formData,
 *   step,
 *   modo,
 *   isEditing,
 *   clientes,
 *   clienteId,
 *   abonos
 * );
 * 
 * // Validar paso actual
 * const errors = validateCurrentStep();
 * 
 * // Validar todo el formulario
 * const allErrors = validateAll();
 */
export const useClienteValidation = (
    formData,
    step,
    modo = 'crear',
    isEditing = false,
    todosLosClientes = [],
    clienteId = null,
    abonosDelCliente = []
) => {
    /**
     * Validar datos del cliente según el modo
     */
    const validateClienteData = useCallback(() => {
        if (isEditing) {
            return validateEditarCliente(
                formData.datosCliente,
                todosLosClientes,
                clienteId,
                abonosDelCliente
            );
        } else {
            return validateCliente(
                formData.datosCliente,
                todosLosClientes
            );
        }
    }, [formData.datosCliente, isEditing, todosLosClientes, clienteId, abonosDelCliente]);

    /**
     * Validar datos financieros
     */
    const validateFinancialData = useCallback(() => {
        const valorTotalVivienda = formData.viviendaSeleccionada?.valorTotal || 0;

        // Calcular total abonado a cuota inicial
        const totalAbonadoCuotaInicial = abonosDelCliente
            .filter(abono => abono.fuente === 'cuotaInicial' && abono.estadoProceso === 'activo')
            .reduce((sum, abono) => sum + abono.monto, 0);

        return validateFinancialStep(
            formData.financiero,
            valorTotalVivienda,
            formData.documentos,
            isEditing,
            totalAbonadoCuotaInicial
        );
    }, [formData.financiero, formData.viviendaSeleccionada, formData.documentos, isEditing, abonosDelCliente]);

    /**
     * Validar vivienda seleccionada
     */
    const validateVivienda = useCallback(() => {
        if (!formData.viviendaSeleccionada) {
            return { vivienda: 'Debe seleccionar una vivienda' };
        }
        return {};
    }, [formData.viviendaSeleccionada]);

    /**
     * Validar el paso actual del wizard
     */
    const validateCurrentStep = useCallback(() => {
        switch (step) {
            case 1:
                return validateVivienda();
            case 2:
                return validateClienteData();
            case 3:
                // El paso 3 no se valida durante la navegación,
                // solo al guardar
                return {};
            default:
                return {};
        }
    }, [step, validateVivienda, validateClienteData]);

    /**
     * Validar todo el formulario (para guardado final)
     */
    const validateAll = useCallback(() => {
        const viviendaErrors = validateVivienda();
        const clienteErrors = validateClienteData();
        const financialErrors = validateFinancialData();

        return {
            ...viviendaErrors,
            ...clienteErrors,
            ...financialErrors
        };
    }, [validateVivienda, validateClienteData, validateFinancialData]);

    /**
     * Verificar si hay errores en la validación actual
     */
    const hasErrors = useCallback((errors) => {
        return Object.keys(errors || {}).length > 0;
    }, []);

    /**
     * Obtener mensaje de error amigable
     */
    const getErrorMessage = useCallback((errors) => {
        const errorCount = Object.keys(errors || {}).length;
        if (errorCount === 0) return null;

        if (errorCount === 1) {
            return 'Por favor, corrige el error antes de continuar.';
        }

        return `Por favor, corrige los ${errorCount} errores antes de continuar.`;
    }, []);

    /**
     * Validar campo específico
     */
    const validateField = useCallback((fieldName, value) => {
        // Validaciones específicas por campo
        const fieldValidations = {
            nombres: (val) => {
                if (!val?.trim()) return 'El nombre es requerido';
                if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(val)) {
                    return 'Solo se permiten letras y espacios';
                }
                return null;
            },
            apellidos: (val) => {
                if (!val?.trim()) return 'El apellido es requerido';
                if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(val)) {
                    return 'Solo se permiten letras y espacios';
                }
                return null;
            },
            cedula: (val) => {
                if (!val?.trim()) return 'La cédula es requerida';
                if (!/^[0-9]+$/.test(val)) {
                    return 'La cédula solo puede contener números';
                }
                return null;
            },
            telefono: (val) => {
                if (!val?.trim()) return 'El teléfono es requerido';
                if (!/^[0-9]+$/.test(val)) {
                    return 'El teléfono solo puede contener números';
                }
                if (val.length < 7) {
                    return 'El teléfono debe tener al menos 7 dígitos';
                }
                return null;
            },
            correo: (val) => {
                if (!val?.trim()) return 'El correo es requerido';
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
                    return 'El correo no tiene un formato válido';
                }
                return null;
            }
        };

        const validator = fieldValidations[fieldName];
        return validator ? validator(value) : null;
    }, []);

    return {
        validateCurrentStep,
        validateAll,
        validateClienteData,
        validateFinancialData,
        validateVivienda,
        hasErrors,
        getErrorMessage,
        validateField
    };
};

export default useClienteValidation;
