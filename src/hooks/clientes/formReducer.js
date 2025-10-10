/**
 * 📦 Form Reducer y Estado Inicial - Cliente
 * 
 * Este archivo contiene el estado inicial del formulario de cliente
 * y el reducer que maneja todas las actualizaciones de estado.
 * 
 * Extraído de: useClienteForm.jsx (líneas 14-63)
 * Fecha extracción: 2025-10-10
 * Estado: ✅ Código idéntico al original (zero-risk extraction)
 */

import { getTodayString } from '../../../utils/textFormatters.js';

/**
 * Estado inicial en blanco para el formulario de cliente
 * 
 * Estructura:
 * - viviendaSeleccionada: Vivienda asignada al cliente
 * - datosCliente: Información personal y de contacto
 * - financiero: Configuración de fuentes de pago
 * - documentos: URLs de documentos (promesa)
 * - errors: Errores de validación
 */
export const blankInitialState = {
    viviendaSeleccionada: null,
    datosCliente: {
        nombres: '',
        apellidos: '',
        cedula: '',
        telefono: '',
        correo: '',
        direccion: '',
        urlCedula: null,
        fechaIngreso: getTodayString()
    },
    financiero: {
        aplicaCuotaInicial: false,
        cuotaInicial: { monto: 0 },
        aplicaCredito: false,
        credito: {
            banco: '',
            monto: 0,
            caso: '',
            urlCartaAprobacion: null
        },
        aplicaSubsidioVivienda: false,
        subsidioVivienda: { monto: 0 },
        aplicaSubsidioCaja: false,
        subsidioCaja: {
            caja: '',
            monto: 0,
            urlCartaAprobacion: null
        },
        usaValorEscrituraDiferente: false,
        valorEscritura: 0,
    },
    documentos: {
        promesaEnviadaUrl: null,
        promesaEnviadaCorreoUrl: null
    },
    errors: {}
};

/**
 * Action Types
 * Tipos de acciones soportadas por el reducer
 */
export const ACTION_TYPES = {
    INITIALIZE_FORM: 'INITIALIZE_FORM',
    UPDATE_VIVIENDA_SELECCIONADA: 'UPDATE_VIVIENDA_SELECCIONADA',
    UPDATE_DATOS_CLIENTE: 'UPDATE_DATOS_CLIENTE',
    UPDATE_FINANCIAL_FIELD: 'UPDATE_FINANCIAL_FIELD',
    UPDATE_DOCUMENTO_URL: 'UPDATE_DOCUMENTO_URL',
    TOGGLE_FINANCIAL_OPTION: 'TOGGLE_FINANCIAL_OPTION',
    SET_ERRORS: 'SET_ERRORS',
};

/**
 * Form Reducer
 * 
 * Maneja todas las actualizaciones de estado del formulario.
 * Código extraído exactamente igual del original.
 * 
 * @param {Object} state - Estado actual
 * @param {Object} action - Acción a ejecutar
 * @param {string} action.type - Tipo de acción
 * @param {any} action.payload - Datos de la acción
 * @returns {Object} Nuevo estado
 */
export function formReducer(state, action) {
    switch (action.type) {
        case ACTION_TYPES.INITIALIZE_FORM:
            return { ...(action.payload || {}), errors: {} };

        case ACTION_TYPES.UPDATE_VIVIENDA_SELECCIONADA:
            return {
                ...state,
                viviendaSeleccionada: action.payload,
                errors: { ...state.errors, financiero: null }
            };

        case ACTION_TYPES.UPDATE_DATOS_CLIENTE: {
            const { field, value } = action.payload;
            const newErrors = { ...state.errors };
            delete newErrors[field];
            return {
                ...state,
                datosCliente: {
                    ...state.datosCliente,
                    [field]: value
                },
                errors: newErrors
            };
        }

        case ACTION_TYPES.UPDATE_FINANCIAL_FIELD: {
            const { section, field, value } = action.payload;
            const newFinancials = { ...state.financiero };

            // Si la sección es 'financiero', es una propiedad directa
            // Si no, es un sub-objeto (cuotaInicial, credito, etc)
            if (section === 'financiero') {
                newFinancials[field] = value;
            } else {
                newFinancials[section] = {
                    ...state.financiero[section],
                    [field]: value
                };
            }

            const newErrors = { ...state.errors };
            delete newErrors[`${section}_${field}`];
            if (field === 'urlCartaAprobacion') {
                delete newErrors[`${section}_urlCartaAprobacion`];
            }

            return {
                ...state,
                financiero: newFinancials,
                errors: newErrors
            };
        }

        case ACTION_TYPES.UPDATE_DOCUMENTO_URL: {
            const { docId, url } = action.payload;
            const newErrors = { ...state.errors };
            delete newErrors[docId];
            return {
                ...state,
                documentos: {
                    ...state.documentos,
                    [docId]: url
                },
                errors: newErrors
            };
        }

        case ACTION_TYPES.TOGGLE_FINANCIAL_OPTION: {
            const newFinancials = {
                ...state.financiero,
                [action.payload.field]: action.payload.value
            };
            return {
                ...state,
                financiero: newFinancials,
                errors: { ...state.errors, financiero: null }
            };
        }

        case ACTION_TYPES.SET_ERRORS:
            return {
                ...state,
                errors: { ...state.errors, ...action.payload }
            };

        default:
            return state;
    }
}

/**
 * Helper: Crear acción para inicializar formulario
 */
export const initializeForm = (payload) => ({
    type: ACTION_TYPES.INITIALIZE_FORM,
    payload
});

/**
 * Helper: Crear acción para actualizar vivienda
 */
export const updateViviendaSeleccionada = (vivienda) => ({
    type: ACTION_TYPES.UPDATE_VIVIENDA_SELECCIONADA,
    payload: vivienda
});

/**
 * Helper: Crear acción para actualizar datos cliente
 */
export const updateDatosCliente = (field, value) => ({
    type: ACTION_TYPES.UPDATE_DATOS_CLIENTE,
    payload: { field, value }
});

/**
 * Helper: Crear acción para actualizar campo financiero
 */
export const updateFinancialField = (section, field, value) => ({
    type: ACTION_TYPES.UPDATE_FINANCIAL_FIELD,
    payload: { section, field, value }
});

/**
 * Helper: Crear acción para actualizar URL documento
 */
export const updateDocumentoUrl = (docId, url) => ({
    type: ACTION_TYPES.UPDATE_DOCUMENTO_URL,
    payload: { docId, url }
});

/**
 * Helper: Crear acción para toggle opción financiera
 */
export const toggleFinancialOption = (field, value) => ({
    type: ACTION_TYPES.TOGGLE_FINANCIAL_OPTION,
    payload: { field, value }
});

/**
 * Helper: Crear acción para establecer errores
 */
export const setErrors = (errors) => ({
    type: ACTION_TYPES.SET_ERRORS,
    payload: errors
});
