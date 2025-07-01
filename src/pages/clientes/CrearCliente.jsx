import React, { useReducer, useState, useCallback, useEffect, Fragment } from 'react';
import { useNavigate } from "react-router-dom";
import AnimatedPage from '../../components/AnimatedPage';
import FormularioCliente from './FormularioCliente'; // <-- Importamos nuestro nuevo formulario
import { validateCliente, validateFinancialStep } from './clienteValidation.js';
import { getClientes, addClienteAndAssignVivienda } from '../../utils/storage.js';
import toast from 'react-hot-toast';
import { Home, User, CircleDollarSign, Check } from 'lucide-react';

const blankInitialState = {
    viviendaSeleccionada: { id: null, valorTotal: 0, label: '' },
    datosCliente: { nombres: '', apellidos: '', cedula: '', telefono: '', correo: '', direccion: '', urlCedula: null },
    financiero: {
        aplicaCuotaInicial: false,
        cuotaInicial: { metodo: '', monto: 0, urlSoportePago: null },
        aplicaCredito: false,
        credito: { banco: '', monto: 0, urlCartaAprobacion: null },
        aplicaSubsidioVivienda: false,
        subsidioVivienda: { monto: 0, urlSoporte: null },
        aplicaSubsidioCaja: false,
        subsidioCaja: { caja: '', monto: 0, urlSoporte: null }
    },
    seguimiento: {},
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
    const [formData, dispatch] = useReducer(formReducer, blankInitialState);
    const [todosLosClientes, setTodosLosClientes] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchClientes = async () => {
            const clientesData = await getClientes();
            setTodosLosClientes(clientesData);
        };
        fetchClientes();
    }, []);

    const handleNextStep = () => {
        let errors = {};
        let isValid = true;

        if (step === 2) {
            errors = validateCliente(formData.datosCliente, todosLosClientes, null);
            isValid = Object.keys(errors).length === 0;
            if (!isValid) {
                toast.error("Por favor, corrige los errores del formulario.");
            }
        }

        dispatch({ type: 'SET_ERRORS', payload: errors });
        if (isValid) {
            setStep(s => s + 1);
        }
    };

    const handlePrevStep = () => setStep(s => s - 1);

    const handleSave = useCallback(async () => {
        const clientErrors = validateCliente(formData.datosCliente, todosLosClientes, null);
        const financialErrors = validateFinancialStep(formData.financiero, formData.viviendaSeleccionada.valorTotal);
        const totalErrors = { ...clientErrors, ...financialErrors };

        if (Object.keys(totalErrors).length > 0) {
            dispatch({ type: 'SET_ERRORS', payload: totalErrors });
            toast.error("Por favor, corrige los errores antes de guardar.");
            return;
        }

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

    const STEPS_CONFIG = [
        { number: 1, title: 'Vivienda', icon: Home },
        { number: 2, title: 'Datos Cliente', icon: User },
        { number: 3, title: 'Finanzas', icon: CircleDollarSign },
    ];

    return (
        <AnimatedPage>
            <div className="max-w-4xl mx-auto">
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                    <h2 className="text-3xl font-extrabold mb-4 text-center text-[#1976d2]">
                        👥 Registrar Nuevo Cliente
                    </h2>

                    <div className="flex items-center justify-center my-8">
                        {STEPS_CONFIG.map((s, index) => (
                            <Fragment key={s.number}>
                                <div className="flex flex-col items-center text-center w-24">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${step >= s.number ? 'bg-blue-500 border-blue-500 text-white' : 'bg-gray-100 border-gray-300 text-gray-400'}`}>
                                        {step > s.number ? <Check size={24} /> : <s.icon size={24} />}
                                    </div>
                                    <p className={`mt-2 text-xs font-semibold ${step >= s.number ? 'text-blue-500' : 'text-gray-400'}`}>{s.title}</p>
                                </div>
                                {index < STEPS_CONFIG.length - 1 && (
                                    <div className={`flex-auto border-t-2 transition-all duration-300 mx-4 ${step > s.number ? 'border-blue-500' : 'border-gray-300'}`}></div>
                                )}
                            </Fragment>
                        ))}
                    </div>

                    {/* El JSX del formulario ahora es mucho más limpio */}
                    <FormularioCliente
                        step={step}
                        formData={formData}
                        dispatch={dispatch}
                        errors={formData.errors}
                    />

                    <div className="mt-10 flex justify-between">
                        {step > 1 ? (
                            <button onClick={handlePrevStep} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg transition-colors">
                                Anterior
                            </button>
                        ) : <div />}

                        {step < 3 ? (
                            <button onClick={handleNextStep} disabled={step === 1 && !formData.viviendaSeleccionada.id} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:bg-gray-300 ml-auto">
                                Siguiente
                            </button>
                        ) : (
                            <button onClick={handleSave} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition-colors ml-auto">
                                Finalizar y Guardar
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
};

export default CrearCliente;