import React, { useReducer, useState, useCallback, useEffect, Fragment } from 'react';
import { useNavigate } from "react-router-dom";
import AnimatedPage from '../../components/AnimatedPage';
import FormularioCliente from './FormularioCliente';
import { validateCliente, validateFinancialStep } from './clienteValidation.js';
import { getClientes, addClienteAndAssignVivienda, createNotification } from '../../utils/storage.js';
import toast from 'react-hot-toast';
import { Home, User, CircleDollarSign, Check, Loader } from 'lucide-react';
import { PASOS_SEGUIMIENTO_CONFIG } from '../../utils/seguimientoConfig.js';

const getTodayString = () => new Date().toISOString().split('T')[0];

const blankInitialState = {
    viviendaSeleccionada: null,
    datosCliente: {
        nombres: '', apellidos: '', cedula: '', telefono: '',
        correo: '', direccion: '', urlCedula: null,
        fechaIngreso: getTodayString()
    },
    financiero: {
        aplicaCuotaInicial: false, cuotaInicial: { monto: 0 },
        aplicaCredito: false, credito: { banco: '', monto: 0 },
        aplicaSubsidioVivienda: false, subsidioVivienda: { monto: 0 },
        aplicaSubsidioCaja: false, subsidioCaja: { caja: '', monto: 0 },
    },
    errors: {}
};

const inputFilters = {
    nombres: { regex: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/, message: 'Solo se permiten letras y espacios.' },
    apellidos: { regex: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/, message: 'Solo se permiten letras y espacios.' },
    cedula: { regex: /^[0-9]*$/, message: 'Este campo solo permite números.' },
    telefono: { regex: /^[0-9]*$/, message: 'Este campo solo permite números.' },
};

function formReducer(state, action) {
    switch (action.type) {
        case 'UPDATE_VIVIENDA_SELECCIONADA':
            return { ...state, viviendaSeleccionada: action.payload };
        case 'UPDATE_DATOS_CLIENTE': {
            const { field, value } = action.payload;
            const newErrors = { ...state.errors };
            delete newErrors[field];
            return { ...state, datosCliente: { ...state.datosCliente, [field]: value }, errors: newErrors };
        }
        case 'UPDATE_FINANCIAL_FIELD': {
            const { section: financialSection, field: financialField, value: financialValue } = action.payload;
            return { ...state, financiero: { ...state.financiero, [financialSection]: { ...state.financiero[financialSection], [financialField]: financialValue } } };
        }
        case 'TOGGLE_FINANCIAL_OPTION': {
            return { ...state, financiero: { ...state.financiero, [action.payload.field]: action.payload.value } };
        }
        case 'SET_ERRORS':
            return { ...state, errors: { ...state.errors, ...action.payload } };
        default:
            return state;
    }
}

const CrearCliente = () => {
    const [step, setStep] = useState(1);
    const [formData, dispatch] = useReducer(formReducer, blankInitialState);
    const [todosLosClientes, setTodosLosClientes] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        getClientes().then(setTodosLosClientes);
    }, []);

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        const filterConfig = inputFilters[name];

        if (filterConfig && !filterConfig.regex.test(value)) {
            dispatch({
                type: 'SET_ERRORS',
                payload: { [name]: filterConfig.message }
            });
            return;
        }
        dispatch({ type: 'UPDATE_DATOS_CLIENTE', payload: { field: name, value } });
    }, [dispatch]);

    const handleValueChange = useCallback((field, value) => {
        dispatch({ type: 'UPDATE_DATOS_CLIENTE', payload: { field, value } });
    }, [dispatch]);

    const handleNextStep = () => {
        let errors = {};
        if (step === 1) {
            if (!formData.viviendaSeleccionada) {
                toast.error("Debes seleccionar una vivienda para continuar.");
                return;
            }
        }
        if (step === 2) {
            errors = validateCliente(formData.datosCliente, todosLosClientes);
            if (Object.keys(errors).length > 0) {
                dispatch({ type: 'SET_ERRORS', payload: errors });
                return;
            }
        }
        dispatch({ type: 'SET_ERRORS', payload: {} });
        setStep(s => s + 1);
    };

    const handlePrevStep = () => setStep(s => s - 1);

    const handleSave = useCallback(async () => {
        setIsSubmitting(true);
        const valorTotalVivienda = formData.viviendaSeleccionada?.valorTotal || 0;
        const clientErrors = validateCliente(formData.datosCliente, todosLosClientes);
        const financialErrors = validateFinancialStep(formData.financiero, valorTotalVivienda);
        const totalErrors = { ...clientErrors, ...financialErrors };

        if (Object.keys(totalErrors).length > 0) {
            dispatch({ type: 'SET_ERRORS', payload: totalErrors });
            toast.error("Por favor, corrige los errores antes de guardar.");
            setIsSubmitting(false);
            return;
        }

        const nuevoSeguimiento = {};
        PASOS_SEGUIMIENTO_CONFIG.forEach(paso => {
            if (paso.aplicaA(formData.financiero)) {
                nuevoSeguimiento[paso.key] = { completado: false, fecha: null };
            }
        });

        const clienteParaGuardar = {
            datosCliente: formData.datosCliente,
            financiero: formData.financiero,
            seguimiento: nuevoSeguimiento,
            viviendaId: formData.viviendaSeleccionada.id
        };

        try {
            await addClienteAndAssignVivienda(clienteParaGuardar);
            toast.success("¡Cliente y proceso iniciados con éxito!");
            const clienteNombre = `${clienteParaGuardar.datosCliente.nombres} ${clienteParaGuardar.datosCliente.apellidos}`.trim();
            await createNotification('cliente', `Nuevo cliente registrado: ${clienteNombre}`, `/clientes/detalle/${clienteParaGuardar.datosCliente.cedula}`);
            navigate("/clientes/listar");
        } catch (error) {
            console.error("Error al guardar el cliente:", error);
            toast.error("Hubo un error al guardar los datos.");
        } finally {
            setIsSubmitting(false);
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
                    <h2 className="text-3xl font-extrabold mb-4 text-center text-[#1976d2]">👥 Registrar Nuevo Cliente</h2>
                    <div className="flex items-center justify-center my-8">
                        {STEPS_CONFIG.map((s, index) => (
                            <Fragment key={s.number}>
                                <div className="flex flex-col items-center text-center w-24">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${step >= s.number ? 'bg-blue-500 border-blue-500 text-white' : 'bg-gray-100 border-gray-300 text-gray-400'}`}>
                                        {step > s.number ? <Check size={24} /> : <s.icon size={24} />}
                                    </div>
                                    <p className={`mt-2 text-xs font-semibold ${step >= s.number ? 'text-blue-500' : 'text-gray-400'}`}>{s.title}</p>
                                </div>
                                {index < STEPS_CONFIG.length - 1 && (<div className={`flex-auto border-t-2 transition-all duration-300 mx-4 ${step > s.number ? 'border-blue-500' : 'border-gray-300'}`}></div>)}
                            </Fragment>
                        ))}
                    </div>
                    <FormularioCliente
                        step={step}
                        formData={formData}
                        dispatch={dispatch}
                        errors={formData.errors}
                        handleInputChange={handleInputChange}
                        handleValueChange={handleValueChange}
                    />
                    <div className="mt-10 flex justify-between">
                        {step > 1 ? (<button onClick={handlePrevStep} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg transition-colors">Anterior</button>) : <div />}
                        {step < 3 ? (
                            <button onClick={handleNextStep} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition-colors ml-auto">Siguiente</button>
                        ) : (
                            <button onClick={handleSave} disabled={isSubmitting} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:bg-gray-400 ml-auto flex items-center justify-center gap-2">
                                {isSubmitting ? (<><Loader size={20} className="animate-spin" /><span>Guardando...</span></>) : ("Finalizar y Guardar")}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
};

export default CrearCliente;