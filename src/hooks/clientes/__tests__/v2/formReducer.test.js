/**
 * 🧪 Tests: formReducer
 * 
 * Verifica que el reducer funciona correctamente con todas las acciones
 */

import { describe, it, expect } from 'vitest';
import {
    formReducer,
    blankInitialState,
    ACTION_TYPES,
    initializeForm,
    updateViviendaSeleccionada,
    updateDatosCliente,
    updateFinancialField,
    updateDocumentoUrl,
    toggleFinancialOption,
    setErrors
} from '../../v2/formReducer.js';

describe('formReducer', () => {
    describe('blankInitialState', () => {
        it('debe tener la estructura correcta', () => {
            expect(blankInitialState).toHaveProperty('viviendaSeleccionada');
            expect(blankInitialState).toHaveProperty('datosCliente');
            expect(blankInitialState).toHaveProperty('financiero');
            expect(blankInitialState).toHaveProperty('documentos');
            expect(blankInitialState).toHaveProperty('errors');
        });

        it('datosCliente debe tener todos los campos', () => {
            const { datosCliente } = blankInitialState;
            expect(datosCliente).toHaveProperty('nombres');
            expect(datosCliente).toHaveProperty('apellidos');
            expect(datosCliente).toHaveProperty('cedula');
            expect(datosCliente).toHaveProperty('telefono');
            expect(datosCliente).toHaveProperty('correo');
            expect(datosCliente).toHaveProperty('direccion');
            expect(datosCliente).toHaveProperty('urlCedula');
            expect(datosCliente).toHaveProperty('fechaIngreso');
        });

        it('financiero debe tener la estructura completa', () => {
            const { financiero } = blankInitialState;
            expect(financiero).toHaveProperty('aplicaCuotaInicial');
            expect(financiero).toHaveProperty('cuotaInicial');
            expect(financiero).toHaveProperty('aplicaCredito');
            expect(financiero).toHaveProperty('credito');
            expect(financiero).toHaveProperty('aplicaSubsidioVivienda');
            expect(financiero).toHaveProperty('subsidioVivienda');
            expect(financiero).toHaveProperty('aplicaSubsidioCaja');
            expect(financiero).toHaveProperty('subsidioCaja');
        });
    });

    describe('INITIALIZE_FORM', () => {
        it('debe inicializar con payload y resetear errores', () => {
            const initialState = { ...blankInitialState, errors: { campo: 'error' } };
            const payload = {
                datosCliente: { nombres: 'Juan', apellidos: 'Pérez' }
            };

            const action = initializeForm(payload);
            const newState = formReducer(initialState, action);

            expect(newState.datosCliente.nombres).toBe('Juan');
            expect(newState.errors).toEqual({});
        });

        it('debe manejar payload vacío', () => {
            const action = initializeForm(null);
            const newState = formReducer(blankInitialState, action);

            expect(newState.errors).toEqual({});
        });
    });

    describe('UPDATE_VIVIENDA_SELECCIONADA', () => {
        it('debe actualizar vivienda y limpiar error financiero', () => {
            const initialState = {
                ...blankInitialState,
                errors: { financiero: 'Error de financiamiento' }
            };
            const vivienda = { id: '123', manzana: 'A', numeroCasa: 1 };

            const action = updateViviendaSeleccionada(vivienda);
            const newState = formReducer(initialState, action);

            expect(newState.viviendaSeleccionada).toEqual(vivienda);
            expect(newState.errors.financiero).toBeNull();
        });
    });

    describe('UPDATE_DATOS_CLIENTE', () => {
        it('debe actualizar campo y limpiar su error', () => {
            const initialState = {
                ...blankInitialState,
                errors: { nombres: 'Campo requerido' }
            };

            const action = updateDatosCliente('nombres', 'Juan');
            const newState = formReducer(initialState, action);

            expect(newState.datosCliente.nombres).toBe('Juan');
            expect(newState.errors.nombres).toBeUndefined();
        });

        it('debe mantener otros campos sin cambios', () => {
            const action = updateDatosCliente('nombres', 'Juan');
            const newState = formReducer(blankInitialState, action);

            expect(newState.datosCliente.apellidos).toBe('');
            expect(newState.datosCliente.cedula).toBe('');
        });
    });

    describe('UPDATE_FINANCIAL_FIELD', () => {
        it('debe actualizar campo en sub-objeto (ej: credito.banco)', () => {
            const action = updateFinancialField('credito', 'banco', 'Bancolombia');
            const newState = formReducer(blankInitialState, action);

            expect(newState.financiero.credito.banco).toBe('Bancolombia');
            expect(newState.financiero.credito.monto).toBe(0); // No debe cambiar
        });

        it('debe actualizar propiedad directa cuando section=financiero', () => {
            const action = updateFinancialField('financiero', 'valorEscritura', 50000000);
            const newState = formReducer(blankInitialState, action);

            expect(newState.financiero.valorEscritura).toBe(50000000);
        });

        it('debe limpiar errores relacionados', () => {
            const initialState = {
                ...blankInitialState,
                errors: {
                    'credito_banco': 'Campo requerido',
                    'credito_monto': 'Monto inválido'
                }
            };

            const action = updateFinancialField('credito', 'banco', 'Bancolombia');
            const newState = formReducer(initialState, action);

            expect(newState.errors['credito_banco']).toBeUndefined();
            expect(newState.errors['credito_monto']).toBe('Monto inválido'); // No se toca
        });

        it('debe limpiar error de urlCartaAprobacion específicamente', () => {
            const initialState = {
                ...blankInitialState,
                errors: { 'credito_urlCartaAprobacion': 'Archivo requerido' }
            };

            const action = updateFinancialField('credito', 'urlCartaAprobacion', 'https://...pdf');
            const newState = formReducer(initialState, action);

            expect(newState.errors['credito_urlCartaAprobacion']).toBeUndefined();
        });
    });

    describe('UPDATE_DOCUMENTO_URL', () => {
        it('debe actualizar URL de documento y limpiar error', () => {
            const initialState = {
                ...blankInitialState,
                errors: { promesaEnviadaUrl: 'Documento requerido' }
            };

            const action = updateDocumentoUrl('promesaEnviadaUrl', 'https://...pdf');
            const newState = formReducer(initialState, action);

            expect(newState.documentos.promesaEnviadaUrl).toBe('https://...pdf');
            expect(newState.errors.promesaEnviadaUrl).toBeUndefined();
        });
    });

    describe('TOGGLE_FINANCIAL_OPTION', () => {
        it('debe toggle opción y limpiar error financiero', () => {
            const initialState = {
                ...blankInitialState,
                errors: { financiero: 'Error de balance' }
            };

            const action = toggleFinancialOption('aplicaCredito', true);
            const newState = formReducer(initialState, action);

            expect(newState.financiero.aplicaCredito).toBe(true);
            expect(newState.errors.financiero).toBeNull();
        });
    });

    describe('SET_ERRORS', () => {
        it('debe agregar nuevos errores sin borrar existentes', () => {
            const initialState = {
                ...blankInitialState,
                errors: { nombres: 'Error existente' }
            };

            const action = setErrors({ apellidos: 'Nuevo error' });
            const newState = formReducer(initialState, action);

            expect(newState.errors.nombres).toBe('Error existente');
            expect(newState.errors.apellidos).toBe('Nuevo error');
        });

        it('debe sobrescribir error si ya existe', () => {
            const initialState = {
                ...blankInitialState,
                errors: { nombres: 'Error viejo' }
            };

            const action = setErrors({ nombres: 'Error nuevo' });
            const newState = formReducer(initialState, action);

            expect(newState.errors.nombres).toBe('Error nuevo');
        });
    });

    describe('Acción desconocida', () => {
        it('debe retornar estado sin cambios', () => {
            const action = { type: 'UNKNOWN_ACTION', payload: {} };
            const newState = formReducer(blankInitialState, action);

            expect(newState).toEqual(blankInitialState);
        });
    });
});
