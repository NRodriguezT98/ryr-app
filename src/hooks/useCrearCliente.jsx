import { useReducer, useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
// --- RUTA CORREGIDA AQUÍ ---
import { validateCliente, validateFinancialStep } from '../pages/clientes/clienteValidation.js';
import { getClientes, getViviendas, addClienteAndAssignVivienda, createNotification } from '../utils/storage.js';
import { PASOS_SEGUIMIENTO_CONFIG } from '../utils/seguimientoConfig.js';
import { useForm } from './useForm.jsx';
import { formatCurrency } from '../utils/textFormatters.js';

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

function formReducer(state, action) {
    switch (action.type) {
        case 'UPDATE_VIVIENDA_SELECCIONADA':
            return { ...state, viviendaSeleccionada: action.payload, errors: {} };
        case 'UPDATE_DATOS_CLIENTE': {
            const { field, value } = action.payload;
            const newErrors = { ...state.errors };
            delete newErrors[field];
            return { ...state, datosCliente: { ...state.datosCliente, [field]: value }, errors: newErrors };
        }
        case 'UPDATE_FINANCIAL_FIELD': {
            const { section, field, value } = action.payload;
            return { ...state, financiero: { ...state.financiero, [section]: { ...state.financiero[section], [field]: value } } };
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

export const useCrearCliente = () => {
    const [step, setStep] = useState(1);
    const [formData, dispatch] = useReducer(formReducer, blankInitialState);
    const [todosLosClientes, setTodosLosClientes] = useState([]);
    const [viviendasDisponibles, setViviendasDisponibles] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const { handleInputChange, handleValueChange, setErrors } = useForm({
        dispatch,
        initialState: formData,
        options: {
            nombres: { regex: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/, message: 'Solo se permiten letras y espacios.' },
            apellidos: { regex: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/, message: 'Solo se permiten letras y espacios.' },
            cedula: { regex: /^[0-9]*$/, message: 'Este campo solo permite números.' },
            telefono: { regex: /^[0-9]*$/, message: 'Este campo solo permite números.' },
        }
    });

    useEffect(() => {
        getClientes().then(setTodosLosClientes);
        getViviendas().then(viviendas => {
            setViviendasDisponibles(viviendas.filter(v => !v.clienteId));
        });
    }, []);

    const viviendaOptions = useMemo(() => {
        return viviendasDisponibles
            .sort((a, b) => a.manzana.localeCompare(b.manzana) || a.numeroCasa - b.numeroCasa)
            .map(v => ({
                value: v.id,
                label: `Mz ${v.manzana} - Casa ${v.numeroCasa} (${formatCurrency(v.valorFinal || v.valorTotal || 0)})`,
                vivienda: v
            }));
    }, [viviendasDisponibles]);

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

    return {
        step,
        formData,
        dispatch,
        errors: formData.errors,
        isSubmitting,
        viviendaOptions,
        handleNextStep,
        handlePrevStep,
        handleSave,
        handleInputChange,
        handleValueChange
    };
};