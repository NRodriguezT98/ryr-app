import React, { useReducer, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import Step1_SelectVivienda from './wizard/Step1_SelectVivienda';
import Step2_ClientInfo from './wizard/Step2_ClientInfo';
import Step3_Financial from './wizard/Step3_Financial';
import { validateCliente, validateFinancialStep } from './clienteValidation.js';
import { getClientes, getViviendas, updateCliente } from '../../utils/storage.js';

// Usamos el mismo reducer que en CrearCliente, pero con una acción nueva para inicializar
function formReducer(state, action) {
    switch (action.type) {
        case 'INITIALIZE_FORM':
            return { ...action.payload, errors: {} };
        case 'UPDATE_FIELD':
            const { section, field, value } = action.payload;
            return { ...state, [section]: { ...state[section], [field]: value } };
        case 'UPDATE_FINANCIAL_FIELD':
            const { section: financialSection, field: financialField, value: financialValue } = action.payload;
            return { ...state, financiero: { ...state.financiero, [financialSection]: { ...state.financiero[financialSection], [financialField]: financialValue } } };
        case 'TOGGLE_FINANCIAL_OPTION':
            return { ...state, financiero: { ...state.financiero, [action.payload.field]: action.payload.value } };
        case 'UPDATE_VIVIENDA_SELECCIONADA':
            return { ...state, viviendaSeleccionada: action.payload };
        case 'SET_ERRORS':
            return { ...state, errors: action.payload };
        default:
            return state;
    }
}

const blankInitialState = {
    viviendaSeleccionada: { id: null, valorTotal: 0, label: '' },
    datosCliente: { nombres: '', apellidos: '', cedula: '', telefono: '', correo: '', direccion: '' },
    financiero: { aplicaCuotaInicial: false, cuotaInicial: { metodo: '', monto: 0 }, aplicaCredito: false, credito: { banco: '', monto: 0 }, aplicaSubsidioVivienda: false, subsidioVivienda: { monto: 0 }, aplicaSubsidioCaja: false, subsidioCaja: { caja: '', monto: 0 } },
    seguimiento: {},
    errors: {}
};

const EditarCliente = ({ isOpen, onClose, onGuardar, clienteAEditar }) => {
    const [step, setStep] = useState(1);
    const [formData, dispatch] = useReducer(formReducer, blankInitialState);
    const [todosLosClientes, setTodosLosClientes] = useState([]);
    const [viviendaOriginalId, setViviendaOriginalId] = useState(null); // Estado para guardar el ID original
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initializeForm = async () => {
            if (clienteAEditar) {
                setIsLoading(true);
                const todasLasViviendas = await getViviendas();
                const todosLosClientesData = await getClientes();
                const viviendaAsignada = todasLasViviendas.find(v => v.id === clienteAEditar.viviendaId);

                // --- Guardamos el ID de la vivienda original ---
                setViviendaOriginalId(clienteAEditar.viviendaId);

                const initialStateForEdit = {
                    ...blankInitialState,
                    ...clienteAEditar,
                    viviendaSeleccionada: {
                        id: viviendaAsignada?.id || null,
                        valorTotal: viviendaAsignada?.valorTotal || 0,
                        label: viviendaAsignada ? `Mz ${viviendaAsignada.manzana} - Casa ${viviendaAsignada.numeroCasa} (${(viviendaAsignada.valorTotal || 0).toLocaleString("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 })})` : ''
                    },
                    errors: {}
                };

                dispatch({ type: 'INITIALIZE_FORM', payload: initialStateForEdit });
                setTodosLosClientes(todosLosClientesData);
                setIsLoading(false);
                setStep(1); // Siempre empezamos en el paso 1 al abrir
            }
        };

        if (isOpen) {
            initializeForm();
        }
    }, [isOpen, clienteAEditar]);

    const nextStep = () => setStep(prev => prev < 3 ? prev + 1 : 3);
    const prevStep = () => setStep(prev => prev > 1 ? prev - 1 : 1);

    const handleNext = () => {
        let errors = {};
        if (step === 2) {
            errors = validateCliente(formData.datosCliente, todosLosClientes, clienteAEditar.id);
        }

        if (Object.keys(errors).length > 0) {
            dispatch({ type: 'SET_ERRORS', payload: errors });
            return;
        }

        dispatch({ type: 'SET_ERRORS', payload: {} });
        nextStep();
    };

    const handleUpdate = useCallback(async () => {
        const clientErrors = validateCliente(formData.datosCliente, todosLosClientes, clienteAEditar.id);
        const financialErrors = validateFinancialStep(formData.financiero, formData.viviendaSeleccionada.valorTotal);
        const totalErrors = { ...clientErrors, ...financialErrors };

        if (Object.keys(totalErrors).length > 0) {
            dispatch({ type: 'SET_ERRORS', payload: totalErrors });
            toast.error("Por favor, corrige los errores en el formulario.");
            return;
        }

        const clienteParaActualizar = {
            datosCliente: formData.datosCliente,
            financiero: formData.financiero,
            seguimiento: formData.seguimiento,
            viviendaId: formData.viviendaSeleccionada.id
        };

        try {
            // --- LLAMADA A LA FUNCIÓN ACTUALIZADA ---
            // Pasamos el ID del cliente, el objeto actualizado y el ID de la vivienda original
            await updateCliente(clienteAEditar.id, clienteParaActualizar, viviendaOriginalId);
            toast.success("Cliente actualizado con éxito!");
            onGuardar();
            onClose();
        } catch (error) {
            console.error("Error al actualizar el cliente:", error);
            toast.error("Hubo un error al actualizar los datos.");
        }
    }, [formData, clienteAEditar, onGuardar, onClose, todosLosClientes, viviendaOriginalId]);

    const steps = [
        <Step1_SelectVivienda key="step1" formData={formData} dispatch={dispatch} isEditing={true} />,
        <Step2_ClientInfo key="step2" formData={formData} dispatch={dispatch} errors={formData.errors} />,
        <Step3_Financial key="step3" formData={formData} dispatch={dispatch} errors={formData.errors} />,
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
            <div className="max-w-5xl mx-auto w-full">
                <div className="bg-white p-8 rounded-xl shadow-lg m-4 max-h-[90vh] overflow-y-auto">
                    {isLoading ? (
                        <div className="text-center py-10 text-gray-500 animate-pulse">Cargando datos del cliente...</div>
                    ) : (
                        <>
                            <h2 className="text-3xl font-bold mb-2 text-center text-[#1976d2]">
                                Editar Cliente y Proceso de Venta
                            </h2>
                            <p className="text-center text-gray-500 mb-8">Paso {step} de 3</p>
                            <div>
                                {steps[step - 1]}
                            </div>
                            <div className="mt-8 flex justify-between">
                                {step > 1 ? (
                                    <button onClick={prevStep} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-6 py-2 rounded-lg transition">Anterior</button>
                                ) : (
                                    // Botón de cancelar solo en el primer paso
                                    <button onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-6 py-2 rounded-lg transition">Cancelar</button>
                                )}

                                {step < 3 ? (
                                    <button onClick={handleNext} disabled={step === 1 && !formData.viviendaSeleccionada.id} className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg transition disabled:bg-gray-300 ml-auto">Siguiente</button>
                                ) : (
                                    <button onClick={handleUpdate} className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-lg transition ml-auto">Guardar Cambios</button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EditarCliente;