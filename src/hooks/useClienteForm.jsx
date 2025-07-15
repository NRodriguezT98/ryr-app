import { useReducer, useState, useCallback, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import { validateCliente, validateFinancialStep } from '../pages/clientes/clienteValidation.js';
import { getClientes, addClienteAndAssignVivienda, createNotification } from '../utils/storage.js';
import { PASOS_SEGUIMIENTO_CONFIG } from '../utils/seguimientoConfig.js';
import { useForm } from './useForm.jsx';

const getTodayString = () => new Date().toISOString().split('T')[0];

const blankInitialState = {
    viviendaSeleccionada: { id: null, valorTotal: 0 },
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
        case 'UPDATE_FIELD': {
            const { section, field, value } = action.payload;
            return { ...state, [section]: { ...state[section], [field]: value } };
        }
        case 'UPDATE_FINANCIAL_FIELD': {
            const { section: financialSection, field: financialField, value: financialValue } = action.payload;
            return { ...state, financiero: { ...state.financiero, [financialSection]: { ...state.financiero[financialSection], [financialField]: financialValue } } };
        }
        case 'TOGGLE_FINANCIAL_OPTION': {
            return { ...state, financiero: { ...state.financiero, [action.payload.field]: action.payload.value } };
        }
        case 'UPDATE_VIVIENDA_SELECCIONADA': {
            return { ...state, viviendaSeleccionada: action.payload };
        }
        case 'SET_ERRORS':
            return { ...state, errors: action.payload };
        default:
            return state;
    }
}

export const useClienteForm = () => {
    const [step, setStep] = useState(1);
    const [formData, dispatch] = useReducer(formReducer, blankInitialState);
    const [todosLosClientes, setTodosLosClientes] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    // Usamos nuestro hook base para obtener las funciones de manejo de inputs
    const { handleInputChange, handleValueChange } = useForm({
        initialState: formData,
        dispatch,
        options: { inputFilters }
    });

    useEffect(() => {
        const fetchClientes = async () => {
            const clientesData = await getClientes();
            setTodosLosClientes(clientesData);
        };
        fetchClientes();
    }, []);

    const handleNextStep = () => {
        let errors = {};
        if (step === 1) {
            if (!formData.viviendaSeleccionada.id) {
                toast.error("Debes seleccionar una vivienda para continuar.");
                return;
            }
        } else if (step === 2) {
            errors = validateCliente(formData.datosCliente, todosLosClientes, null);
            if (Object.keys(errors).length > 0) {
                dispatch({ type: 'SET_ERRORS', payload: errors });
                toast.error("Por favor, corrige los errores del formulario.");
                return;
            }
        }
        dispatch({ type: 'SET_ERRORS', payload: {} });
        setStep(s => s + 1);
    };

    const handlePrevStep = () => setStep(s => s - 1);

    const handleSave = useCallback(async () => {
        setIsSubmitting(true);
        const clientErrors = validateCliente(formData.datosCliente, todosLosClientes, null);
        const financialErrors = validateFinancialStep(formData.financiero, formData.viviendaSeleccionada.valorTotal);
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

    return {
        step,
        formData,
        dispatch,
        errors: formData.errors,
        isSubmitting,
        handleNextStep,
        handlePrevStep,
        handleSave,
        handleInputChange,
        handleValueChange
    };
};