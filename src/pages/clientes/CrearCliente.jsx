import React, { useReducer, useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import AnimatedPage from '../../components/AnimatedPage';
import Step1_SelectVivienda from './wizard/Step1_SelectVivienda';
import Step2_ClientInfo from './wizard/Step2_ClientInfo';
import Step3_Financial from './wizard/Step3_Financial';
import { validateCliente, validateFinancialStep } from './clienteValidation.js';
import { getClientes, addClienteAndAssignVivienda } from '../../utils/storage.js';
import toast from 'react-hot-toast';

const initialState = {
    viviendaSeleccionada: { id: null, valorTotal: 0, label: '' },
    datosCliente: { nombres: '', apellidos: '', cedula: '', telefono: '', correo: '', direccion: '' },
    financiero: {
        aplicaCuotaInicial: false, cuotaInicial: { metodo: '', monto: 0 },
        aplicaCredito: false, credito: { banco: '', monto: 0 },
        aplicaSubsidioVivienda: false, subsidioVivienda: { monto: 0 },
        aplicaSubsidioCaja: false, subsidioCaja: { caja: '', monto: 0 }
    },
    errors: {}
};

function formReducer(state, action) {
    switch (action.type) {
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

const CrearCliente = () => {
    const [step, setStep] = useState(1);
    const [formData, dispatch] = useReducer(formReducer, initialState);
    const [todosLosClientes, setTodosLosClientes] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchClientes = async () => {
            const clientesData = await getClientes();
            setTodosLosClientes(clientesData);
        };
        fetchClientes();
    }, []);

    const nextStep = () => setStep(prev => prev < 3 ? prev + 1 : 3);
    const prevStep = () => setStep(prev => prev > 1 ? prev - 1 : 1);

    const handleNext = () => {
        let errors = {};
        if (step === 2) {
            errors = validateCliente(formData.datosCliente, todosLosClientes, null);
        }
        if (Object.keys(errors).length > 0) {
            dispatch({ type: 'SET_ERRORS', payload: errors });
            return;
        }

        // Si el paso actual es válido, limpia los errores y avanza
        dispatch({ type: 'SET_ERRORS', payload: {} });
        nextStep();
    };

    const handleSave = useCallback(async () => {
        // Valida el paso de información personal y financiera antes de guardar
        const clientErrors = validateCliente(formData.datosCliente, todosLosClientes, null);
        const financialErrors = validateFinancialStep(formData.financiero, formData.viviendaSeleccionada.valorTotal);
        const totalErrors = { ...clientErrors, ...financialErrors };

        if (Object.keys(totalErrors).length > 0) {
            dispatch({ type: 'SET_ERRORS', payload: totalErrors });
            toast.error("Por favor, corrige los errores antes de guardar.");
            return;
        }

        // --- ESTRUCTURA DEL OBJETO A GUARDAR ---
        // Este objeto tiene la forma que nuestra función `addClienteAndAssignVivienda` espera
        const clienteParaGuardar = {
            datosCliente: formData.datosCliente,
            financiero: formData.financiero,
            seguimiento: {
                fechaEnvioAvaluo: null, fechaEstudioTitulos: null, escrituraEnviada: null,
                escrituraFirmada: null, actaEntrega: null, boletaRegistro: null,
                solicitudDesembolsoCredito: null, desembolsoCredito: null,
                marcacionPagoSubsidio: null, desembolsoSubsidioVivienda: null,
                desembolsoCajaCompensacion: null
            },
            viviendaId: formData.viviendaSeleccionada.id
        };

        try {
            await addClienteAndAssignVivienda(clienteParaGuardar);
            toast.success("¡Cliente y proceso iniciados con éxito!");
            navigate("/clientes/listar");
        } catch (error) {
            console.error("Error al guardar el cliente:", error);
            toast.error("Hubo un error al guardar los datos.");
        }
    }, [formData, navigate, todosLosClientes]);

    const steps = [
        <Step1_SelectVivienda key="step1" formData={formData} dispatch={dispatch} />,
        <Step2_ClientInfo key="step2" formData={formData} dispatch={dispatch} errors={formData.errors} />,
        <Step3_Financial key="step3" formData={formData} dispatch={dispatch} errors={formData.errors} />,
    ];

    return (
        <AnimatedPage>
            <div className="max-w-5xl mx-auto">
                <div className="bg-white p-8 rounded-xl shadow-lg">
                    <h2 className="text-3xl font-bold mb-2 text-center text-[#1976d2]">Registro de Nuevo Cliente y Proceso de Venta</h2>
                    <p className="text-center text-gray-500 mb-8">Paso {step} de 3</p>

                    <div>{steps[step - 1]}</div>

                    <div className="mt-8 flex justify-between">
                        {step > 1 ? (
                            <button onClick={prevStep} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-6 py-2 rounded-lg transition">Anterior</button>
                        ) : (
                            <div /> // Espaciador para mantener el botón de siguiente a la derecha
                        )}

                        {step < 3 ? (
                            <button onClick={handleNext} disabled={step === 1 && !formData.viviendaSeleccionada.id} className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg transition disabled:bg-gray-300 ml-auto">
                                Siguiente
                            </button>
                        ) : (
                            <button onClick={handleSave} className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-lg transition ml-auto">
                                Guardar Cliente y Proceso
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
};

export default CrearCliente;