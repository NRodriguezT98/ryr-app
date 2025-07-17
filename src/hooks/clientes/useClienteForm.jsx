import { useReducer, useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import { validateCliente, validateFinancialStep, validateEditarCliente } from '../../utils/validation.js';
import { getClientes, addClienteAndAssignVivienda, updateCliente, getAbonos, createNotification } from '../../utils/storage.js';
import { useData } from '../../context/DataContext.jsx';
import { PASOS_SEGUIMIENTO_CONFIG } from '../../utils/seguimientoConfig.js';
import { formatCurrency, toTitleCase, formatDisplayDate } from '../../utils/textFormatters.js';

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
        aplicaCredito: false, credito: { banco: '', monto: 0, caso: '' },
        aplicaSubsidioVivienda: false, subsidioVivienda: { monto: 0 },
        aplicaSubsidioCaja: false, subsidioCaja: { caja: '', monto: 0 },
    },
    errors: {}
};

function formReducer(state, action) {
    switch (action.type) {
        case 'INITIALIZE_FORM':
            return { ...action.payload, errors: {} };
        case 'UPDATE_VIVIENDA_SELECCIONADA':
            return { ...state, viviendaSeleccionada: action.payload, errors: { ...state.errors, financiero: null } };
        case 'UPDATE_DATOS_CLIENTE': {
            const { field, value } = action.payload;
            const newErrors = { ...state.errors };
            delete newErrors[field];
            return { ...state, datosCliente: { ...state.datosCliente, [field]: value }, errors: newErrors };
        }
        case 'UPDATE_FINANCIAL_FIELD': {
            const { section, field, value } = action.payload;
            const newFinancials = {
                ...state.financiero,
                [section]: { ...state.financiero[section], [field]: value }
            };
            const newErrors = { ...state.errors };
            delete newErrors[`${section}_${field}`];
            return { ...state, financiero: newFinancials, errors: newErrors };
        }
        case 'TOGGLE_FINANCIAL_OPTION': {
            const newFinancials = { ...state.financiero, [action.payload.field]: action.payload.value };
            return { ...state, financiero: newFinancials, errors: { ...state.errors, financiero: null } };
        }
        case 'SET_ERRORS':
            return { ...state, errors: { ...state.errors, ...action.payload } };
        default:
            return state;
    }
}

export const useClienteForm = (isEditing = false, clienteAEditar = null, onSaveSuccess) => {
    const navigate = useNavigate();
    const { clientes: todosLosClientes, viviendas } = useData();
    const [step, setStep] = useState(1);
    const [formData, dispatch] = useReducer(formReducer, blankInitialState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [abonosDelCliente, setAbonosDelCliente] = useState([]);
    const [viviendaOriginalId, setViviendaOriginalId] = useState(null);
    const [initialData, setInitialData] = useState(null);
    const [isConfirming, setIsConfirming] = useState(false);
    const [cambios, setCambios] = useState([]);

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        const inputFilters = {
            nombres: { regex: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/, message: 'Solo se permiten letras y espacios.' },
            apellidos: { regex: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/, message: 'Solo se permiten letras y espacios.' },
            cedula: { regex: /^[0-9]*$/, message: 'Este campo solo permite números.' },
            telefono: { regex: /^[0-9]*$/, message: 'Este campo solo permite números.' },
            correo: { regex: /^[a-zA-Z0-9._%+\-@]*$/, message: 'El correo contiene caracteres no permitidos.' },
            direccion: { regex: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s#\-.]*$/, message: 'La dirección contiene caracteres no permitidos.' },
        };

        const filter = inputFilters[name];
        if (filter && !filter.regex.test(value)) {
            dispatch({ type: 'SET_ERRORS', payload: { [name]: filter.message } });
            return;
        }

        dispatch({ type: 'UPDATE_DATOS_CLIENTE', payload: { field: name, value } });
    }, [dispatch]);

    // --- NUEVO HANDLER CENTRALIZADO PARA CAMPOS FINANCIEROS ---
    const handleFinancialFieldChange = useCallback((section, field, value) => {
        // Lógica de filtrado para el campo 'caso'
        if (field === 'caso') {
            const filter = /^[a-zA-Z0-9_-]*$/; // Permite letras, números, guion bajo y guion medio
            if (!filter.test(value)) {
                dispatch({ type: 'SET_ERRORS', payload: { [`${section}_${field}`]: 'Solo se permiten letras, números, _ y -.' } });
                return;
            }
        }
        dispatch({ type: 'UPDATE_FINANCIAL_FIELD', payload: { section, field, value } });
    }, [dispatch]);


    useEffect(() => {
        if (isEditing && clienteAEditar) {
            const viviendaAsignada = viviendas.find(v => v.id === clienteAEditar.viviendaId);
            setViviendaOriginalId(clienteAEditar.viviendaId);
            getAbonos().then(abonos => setAbonosDelCliente(abonos.filter(a => a.clienteId === clienteAEditar.id)));
            const initialStateForEdit = { ...blankInitialState, ...clienteAEditar, financiero: { ...blankInitialState.financiero, ...clienteAEditar.financiero }, viviendaSeleccionada: viviendaAsignada || null, errors: {} };
            dispatch({ type: 'INITIALIZE_FORM', payload: initialStateForEdit });
            setInitialData(JSON.parse(JSON.stringify(initialStateForEdit)));
        }
    }, [isEditing, clienteAEditar, viviendas]);

    const viviendasOptions = useMemo(() => {
        const disponibles = viviendas.filter(v => !v.clienteId || v.id === clienteAEditar?.viviendaId);
        return disponibles
            .sort((a, b) => a.manzana.localeCompare(b.manzana) || a.numeroCasa - b.numeroCasa)
            .map(v => ({
                value: v.id,
                label: `Mz ${v.manzana} - Casa ${v.numeroCasa} (${formatCurrency(v.valorFinal || v.valorTotal || 0)})`,
                vivienda: v
            }));
    }, [viviendas, clienteAEditar]);

    const handleNextStep = () => {
        let errors = {};
        if (step === 1 && !formData.viviendaSeleccionada) {
            toast.error("Debes seleccionar una vivienda para continuar.");
            return;
        }
        if (step === 2) {
            const validationFunction = isEditing ? validateEditarCliente : validateCliente;
            errors = validationFunction(formData.datosCliente, todosLosClientes, clienteAEditar?.id, abonosDelCliente);
            if (Object.keys(errors).length > 0) {
                dispatch({ type: 'SET_ERRORS', payload: errors });
                return;
            }
        }
        dispatch({ type: 'SET_ERRORS', payload: {} });
        setStep(s => s + 1);
    };

    const handlePrevStep = () => setStep(s => s - 1);

    const executeSave = useCallback(async () => {
        setIsSubmitting(true);
        try {
            if (isEditing) {
                const clienteParaActualizar = {
                    datosCliente: formData.datosCliente,
                    financiero: formData.financiero,
                    seguimiento: formData.seguimiento,
                    viviendaId: formData.viviendaSeleccionada?.id || null,
                    status: formData.status
                };
                await updateCliente(clienteAEditar.id, clienteParaActualizar, viviendaOriginalId);
                toast.success("¡Cliente actualizado con éxito!");
                createNotification('cliente', `Se actualizaron los datos de ${toTitleCase(clienteAEditar.datosCliente.nombres)}.`, `/clientes/detalle/${clienteAEditar.id}`);
            } else {
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
                await addClienteAndAssignVivienda(clienteParaGuardar);
                toast.success("¡Cliente y proceso iniciados con éxito!");
                const clienteNombre = `${clienteParaGuardar.datosCliente.nombres} ${clienteParaGuardar.datosCliente.apellidos}`.trim();
                await createNotification('cliente', `Nuevo cliente registrado: ${clienteNombre}`, `/clientes/detalle/${clienteParaGuardar.datosCliente.cedula}`);
            }

            if (onSaveSuccess) onSaveSuccess();
            else navigate('/clientes/listar');

        } catch (error) {
            console.error("Error al guardar el cliente:", error);
            toast.error("Hubo un error al guardar los datos.");
        } finally {
            setIsSubmitting(false);
            setIsConfirming(false);
        }
    }, [formData, navigate, isEditing, clienteAEditar, onSaveSuccess, viviendaOriginalId]);

    const hayCambios = useMemo(() => {
        if (!initialData || !formData) return false;
        return JSON.stringify(formData) !== JSON.stringify(initialData);
    }, [formData, initialData]);

    const handleSave = useCallback(() => {
        const valorTotalVivienda = formData.viviendaSeleccionada?.valorTotal || 0;
        const validationFunction = isEditing ? validateEditarCliente : validateCliente;
        const clientErrors = validationFunction(formData.datosCliente, todosLosClientes, clienteAEditar?.id, abonosDelCliente);
        const financialErrors = validateFinancialStep(formData.financiero, valorTotalVivienda);
        const totalErrors = { ...clientErrors, ...financialErrors };

        if (Object.keys(totalErrors).length > 0) {
            dispatch({ type: 'SET_ERRORS', payload: totalErrors });
            toast.error("Por favor, corrige los errores antes de guardar.");
            return;
        }

        if (isEditing) {
            const cambiosDetectados = [];
            const labels = { nombres: "Nombres", apellidos: "Apellidos", telefono: "Teléfono", correo: "Correo", direccion: "Dirección", fechaIngreso: "Fecha de Ingreso", caso: "Número de Caso" };

            const formatValue = (key, value) => {
                if (key === 'fechaIngreso') return formatDisplayDate(value);
                return value || 'Vacío';
            };

            if (initialData.viviendaSeleccionada?.id !== formData.viviendaSeleccionada?.id) {
                cambiosDetectados.push({
                    campo: 'Vivienda Asignada',
                    anterior: initialData.viviendaSeleccionada ? `Mz ${initialData.viviendaSeleccionada.manzana} - Casa ${initialData.viviendaSeleccionada.numeroCasa}` : 'Ninguna',
                    actual: formData.viviendaSeleccionada ? `Mz ${formData.viviendaSeleccionada.manzana} - Casa ${formData.viviendaSeleccionada.numeroCasa}` : 'Ninguna'
                });
            }

            for (const key in formData.datosCliente) {
                if (!labels[key]) continue;
                if (String(initialData.datosCliente[key] || '') !== String(formData.datosCliente[key] || '')) {
                    cambiosDetectados.push({
                        campo: labels[key],
                        anterior: formatValue(key, initialData.datosCliente[key]),
                        actual: formatValue(key, formData.datosCliente[key])
                    });
                }
            }

            if (initialData.financiero?.credito?.caso !== formData.financiero?.credito?.caso) {
                cambiosDetectados.push({
                    campo: labels.caso,
                    anterior: formatValue('caso', initialData.financiero.credito.caso),
                    actual: formatValue('caso', formData.financiero.credito.caso)
                });
            }

            setCambios(cambiosDetectados);
            setIsConfirming(true);
        } else {
            executeSave();
        }

    }, [formData, todosLosClientes, isEditing, clienteAEditar, abonosDelCliente, initialData, executeSave]);

    return {
        step,
        formData,
        dispatch,
        errors: formData.errors || {},
        isSubmitting,
        viviendasOptions,
        isConfirming,
        setIsConfirming,
        cambios,
        hayCambios,
        handlers: {
            handleNextStep,
            handlePrevStep,
            handleSave,
            executeSave,
            handleInputChange,
            handleFinancialFieldChange // <-- Exportamos el nuevo handler
        }
    };
};