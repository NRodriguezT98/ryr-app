/**
 * 🧪 Tests: useClienteNavigation
 * 
 * Verifica que la navegación del wizard funciona correctamente
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useClienteNavigation } from '../../v2/useClienteNavigation.js';

// Mock de useModernToast
vi.mock('../../useModernToast.jsx', () => ({
    useModernToast: () => ({
        error: vi.fn(),
        success: vi.fn(),
        loading: vi.fn(),
        dismiss: vi.fn()
    })
}));

describe('useClienteNavigation', () => {
    let mockValidateCurrentStep;
    let mockSetErrors;
    let mockFormData;

    beforeEach(() => {
        mockValidateCurrentStep = vi.fn();
        mockSetErrors = vi.fn();
        mockFormData = {
            viviendaSeleccionada: null,
            datosCliente: {},
            financiero: {}
        };
    });

    describe('Estado inicial', () => {
        it('debe iniciar en paso 1', () => {
            const { result } = renderHook(() =>
                useClienteNavigation(mockValidateCurrentStep, mockSetErrors, mockFormData)
            );

            expect(result.current.step).toBe(1);
        });

        it('debe indicar que puede avanzar pero no retroceder', () => {
            const { result } = renderHook(() =>
                useClienteNavigation(mockValidateCurrentStep, mockSetErrors, mockFormData)
            );

            expect(result.current.canGoNext).toBe(true);
            expect(result.current.canGoPrev).toBe(false);
        });
    });

    describe('handleNextStep', () => {
        it('NO debe avanzar desde paso 1 si no hay vivienda seleccionada', () => {
            const { result } = renderHook(() =>
                useClienteNavigation(mockValidateCurrentStep, mockSetErrors, mockFormData)
            );

            act(() => {
                const advanced = result.current.handleNextStep();
                expect(advanced).toBe(false);
            });

            expect(result.current.step).toBe(1);
        });

        it('debe avanzar desde paso 1 si hay vivienda seleccionada', () => {
            mockFormData.viviendaSeleccionada = { id: '123', manzana: 'A' };

            const { result } = renderHook(() =>
                useClienteNavigation(mockValidateCurrentStep, mockSetErrors, mockFormData)
            );

            act(() => {
                const advanced = result.current.handleNextStep();
                expect(advanced).toBe(true);
            });

            expect(result.current.step).toBe(2);
            expect(mockSetErrors).toHaveBeenCalledWith({});
        });

        it('NO debe avanzar desde paso 2 si hay errores de validación', () => {
            mockFormData.viviendaSeleccionada = { id: '123' };
            mockValidateCurrentStep.mockReturnValue({
                nombres: 'Campo requerido',
                cedula: 'Campo requerido'
            });

            const { result } = renderHook(() =>
                useClienteNavigation(mockValidateCurrentStep, mockSetErrors, mockFormData)
            );

            // Avanzar al paso 2
            act(() => {
                result.current.handleNextStep();
            });

            expect(result.current.step).toBe(2);

            // Intentar avanzar al paso 3 con errores
            act(() => {
                const advanced = result.current.handleNextStep();
                expect(advanced).toBe(false);
            });

            expect(result.current.step).toBe(2);
            expect(mockValidateCurrentStep).toHaveBeenCalled();
            expect(mockSetErrors).toHaveBeenCalledWith({
                nombres: 'Campo requerido',
                cedula: 'Campo requerido'
            });
        });

        it('debe avanzar desde paso 2 si no hay errores de validación', () => {
            mockFormData.viviendaSeleccionada = { id: '123' };
            mockValidateCurrentStep.mockReturnValue({});

            const { result } = renderHook(() =>
                useClienteNavigation(mockValidateCurrentStep, mockSetErrors, mockFormData)
            );

            // Avanzar al paso 2
            act(() => {
                result.current.handleNextStep();
            });

            // Avanzar al paso 3
            act(() => {
                const advanced = result.current.handleNextStep();
                expect(advanced).toBe(true);
            });

            expect(result.current.step).toBe(3);
            expect(mockValidateCurrentStep).toHaveBeenCalled();
            expect(mockSetErrors).toHaveBeenCalledWith({});
        });

        it('NO debe avanzar más allá del paso 3', () => {
            mockFormData.viviendaSeleccionada = { id: '123' };
            mockValidateCurrentStep.mockReturnValue({});

            const { result } = renderHook(() =>
                useClienteNavigation(mockValidateCurrentStep, mockSetErrors, mockFormData)
            );

            // Avanzar al paso 2
            act(() => {
                result.current.handleNextStep();
            });

            // Avanzar al paso 3
            act(() => {
                result.current.handleNextStep();
            });

            expect(result.current.step).toBe(3);

            // Intentar avanzar más allá del paso 3
            act(() => {
                result.current.handleNextStep();
            });

            expect(result.current.step).toBe(3); // Debe quedarse en 3
        });
    });

    describe('handlePrevStep', () => {
        it('debe retroceder del paso 2 al paso 1', () => {
            mockFormData.viviendaSeleccionada = { id: '123' };
            mockValidateCurrentStep.mockReturnValue({});

            const { result } = renderHook(() =>
                useClienteNavigation(mockValidateCurrentStep, mockSetErrors, mockFormData)
            );

            // Avanzar al paso 2
            act(() => {
                result.current.handleNextStep();
            });

            expect(result.current.step).toBe(2);

            // Retroceder al paso 1
            act(() => {
                result.current.handlePrevStep();
            });

            expect(result.current.step).toBe(1);
        });

        it('NO debe retroceder más allá del paso 1', () => {
            const { result } = renderHook(() =>
                useClienteNavigation(mockValidateCurrentStep, mockSetErrors, mockFormData)
            );

            expect(result.current.step).toBe(1);

            // Intentar retroceder desde paso 1
            act(() => {
                result.current.handlePrevStep();
            });

            expect(result.current.step).toBe(1); // Debe quedarse en 1
        });

        it('debe retroceder del paso 3 al paso 2', () => {
            mockFormData.viviendaSeleccionada = { id: '123' };
            mockValidateCurrentStep.mockReturnValue({});

            const { result } = renderHook(() =>
                useClienteNavigation(mockValidateCurrentStep, mockSetErrors, mockFormData)
            );

            // Avanzar al paso 2 y luego al 3
            act(() => {
                result.current.handleNextStep();
                result.current.handleNextStep();
            });

            expect(result.current.step).toBe(3);

            // Retroceder al paso 2
            act(() => {
                result.current.handlePrevStep();
            });

            expect(result.current.step).toBe(2);
        });
    });

    describe('goToStep', () => {
        it('debe permitir ir directamente a un paso específico', () => {
            const { result } = renderHook(() =>
                useClienteNavigation(mockValidateCurrentStep, mockSetErrors, mockFormData)
            );

            act(() => {
                result.current.goToStep(3);
            });

            expect(result.current.step).toBe(3);
        });

        it('NO debe permitir ir a un paso menor a 1', () => {
            const { result } = renderHook(() =>
                useClienteNavigation(mockValidateCurrentStep, mockSetErrors, mockFormData)
            );

            act(() => {
                result.current.goToStep(0);
            });

            expect(result.current.step).toBe(1); // Debe quedarse en 1
        });

        it('NO debe permitir ir a un paso mayor a 3', () => {
            const { result } = renderHook(() =>
                useClienteNavigation(mockValidateCurrentStep, mockSetErrors, mockFormData)
            );

            act(() => {
                result.current.goToStep(5);
            });

            expect(result.current.step).toBe(1); // Debe quedarse en 1
        });
    });

    describe('canGoNext y canGoPrev', () => {
        it('debe actualizar correctamente en cada paso', () => {
            mockFormData.viviendaSeleccionada = { id: '123' };
            mockValidateCurrentStep.mockReturnValue({});

            const { result } = renderHook(() =>
                useClienteNavigation(mockValidateCurrentStep, mockSetErrors, mockFormData)
            );

            // Paso 1: puede avanzar, no puede retroceder
            expect(result.current.canGoNext).toBe(true);
            expect(result.current.canGoPrev).toBe(false);

            // Avanzar al paso 2
            act(() => {
                result.current.handleNextStep();
            });

            // Paso 2: puede avanzar y retroceder
            expect(result.current.canGoNext).toBe(true);
            expect(result.current.canGoPrev).toBe(true);

            // Avanzar al paso 3
            act(() => {
                result.current.handleNextStep();
            });

            // Paso 3: no puede avanzar, puede retroceder
            expect(result.current.canGoNext).toBe(false);
            expect(result.current.canGoPrev).toBe(true);
        });
    });

    describe('setStep directo', () => {
        it('debe permitir cambiar el paso directamente', () => {
            const { result } = renderHook(() =>
                useClienteNavigation(mockValidateCurrentStep, mockSetErrors, mockFormData)
            );

            act(() => {
                result.current.setStep(2);
            });

            expect(result.current.step).toBe(2);
        });
    });
});
