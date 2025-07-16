import { useReducer, useState, useEffect, useCallback, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { updateCliente, getAbonos, createNotification } from '../../utils/storage.js';
import { validateEditarCliente, validateFinancialStep } from '../../pages/clientes/clienteValidation';
import toast from 'react-hot-toast';
import { useForm } from '../useForm.jsx';
import { formatCurrency, toTitleCase, formatID, formatDisplayDate } from '../../utils/textFormatters.js';
import { PASOS_SEGUIMIENTO_CONFIG } from '../../utils/seguimientoConfig.js';

function formReducer(state, action) {
    switch (action.type) {
        case 'INITIALIZE_FORM':
            return { ...action.payload, errors: {} };
        case 'UPDATE_VIVIENDA_SELECCIONADA':
            return { ...state, viviendaSeleccionada: action.payload };
        case 'UPDATE_DATOS_CLIENTE': {
            const { field, value } = action.payload;
            return { ...state, datosCliente: { ...state.datosCliente, [field]: value } };
        }
        case 'UPDATE_FINANCIAL_FIELD': {
            const { section, field, value } = action.payload;
            return { ...state, financiero: { ...state.financiero, [section]: { ...state.financiero[section], [field]: value } } };
        }
        case 'TOGGLE_FINANCIAL_OPTION': {
            return { ...state, financiero: { ...state.financiero, [action.payload.field]: action.payload.value } };
        }
        case 'SET_ERRORS':
            return { ...state, errors: action.payload };
        default:
            return state;
    }
}

const blankInitialState = {
    viviendaSeleccionada: null,
    datosCliente: { nombres: '', apellidos: '', cedula: '', telefono: '', correo: '', direccion: '', fechaIngreso: '' },
    financiero: {},
    errors: {}
};

export const useEditarCliente = (clienteAEditar, isOpen, onSave, onClose) => {
    const { clientes: todosLosClientes, viviendas } = useData();
    const [step, setStep] = useState(1);
    const [formData, dispatch] = useReducer(formReducer, blankInitialState);
    const [initialData, setInitialData] = useState(null);
    const [viviendaOriginalId, setViviendaOriginalId] = useState(null);
    const [isConfirming, setIsConfirming] = useState(false);
    const [cambios, setCambios] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [abonosDelCliente, setAbonosDelCliente] = useState([]);

    const { handleInputChange, handleValueChange, setErrors } = useForm({
        dispatch,
        initialState: formData
    });

    useEffect(() => {
        if (isOpen && clienteAEditar) {
            const viviendaAsignada = viviendas.find(v => v.id === clienteAEditar.viviendaId);
            setViviendaOriginalId(clienteAEditar.viviendaId);

            getAbonos().then(todosAbonos => {
                setAbonosDelCliente(todosAbonos.filter(a => a.clienteId === clienteAEditar.id));
            });

            const initialStateForEdit = {
                ...blankInitialState,
                ...clienteAEditar,
                viviendaSeleccionada: viviendaAsignada || null,
                errors: {}
            };
            setInitialData(JSON.parse(JSON.stringify(initialStateForEdit)));
            dispatch({ type: 'INITIALIZE_FORM', payload: initialStateForEdit });
            setStep(1);
        }
    }, [isOpen, clienteAEditar, viviendas]);

    const viviendaOptions = useMemo(() => {
        if (!isOpen) return [];
        const disponibles = viviendas.filter(v => v.clienteId === null || v.id === clienteAEditar?.viviendaId);
        return disponibles
            .sort((a, b) => a.manzana.localeCompare(b.manzana) || a.numeroCasa - b.numeroCasa)
            .map(v => ({
                value: v.id,
                label: `Mz ${v.manzana} - Casa ${v.numeroCasa} (${formatCurrency(v.valorFinal || v.valorTotal || 0)})`,
                vivienda: v
            }));
    }, [isOpen, viviendas, clienteAEditar]);

    const hayCambios = useMemo(() => {
        if (!initialData || !formData) return false;
        return JSON.stringify(formData) !== JSON.stringify(initialData);
    }, [formData, initialData]);

    const handleNextStep = () => {
        const errors = validateEditarCliente(formData.datosCliente, todosLosClientes, clienteAEditar.id, abonosDelCliente);
        dispatch({ type: 'SET_ERRORS', payload: errors });
        if (Object.keys(errors).length === 0) {
            setStep(s => s + 1);
        }
    };

    const handlePrevStep = () => setStep(s => s - 1);

    const executeSave = useCallback(async () => {
        setIsSubmitting(true);
        const clienteParaActualizar = {
            datosCliente: formData.datosCliente,
            financiero: formData.financiero,
            seguimiento: clienteAEditar.seguimiento,
            viviendaId: formData.viviendaSeleccionada?.id || null,
            status: clienteAEditar.status
        };
        try {
            await updateCliente(clienteAEditar.id, clienteParaActualizar, viviendaOriginalId);
            toast.success("Cliente actualizado con éxito!");
            createNotification('cliente', `Se actualizaron los datos de ${toTitleCase(clienteAEditar.datosCliente.nombres)}.`, `/clientes/detalle/${clienteAEditar.id}`);
            onSave();
            onClose();
        } catch (error) {
            console.error("Error al actualizar el cliente:", error);
            toast.error("Hubo un error al actualizar los datos.");
        } finally {
            setIsConfirming(false);
            setIsSubmitting(false);
        }
    }, [formData, clienteAEditar, onSave, onClose, viviendaOriginalId]);

    const handlePreSave = useCallback(() => {
        const valorTotalVivienda = formData.viviendaSeleccionada?.valorTotal || 0;
        const totalErrors = {
            ...validateEditarCliente(formData.datosCliente, todosLosClientes, clienteAEditar.id, abonosDelCliente),
            ...validateFinancialStep(formData.financiero, valorTotalVivienda)
        };
        if (Object.keys(totalErrors).length > 0) {
            dispatch({ type: 'SET_ERRORS', payload: totalErrors });
            toast.error("Por favor, corrige los errores del formulario.");
            return;
        }

        const cambiosDetectados = [];
        const initial = initialData;
        const current = formData;

        const fieldLabels = {
            nombres: 'Nombres', apellidos: 'Apellidos', telefono: 'Teléfono', correo: 'Correo', direccion: 'Dirección', fechaIngreso: 'Fecha de Ingreso',
            monto: 'Monto', banco: 'Banco', caja: 'Caja'
        };

        const formatValue = (value, isCurrency = false, isDate = false) => {
            if (typeof value === 'boolean') return value ? 'Sí' : 'No';
            if (isCurrency) return formatCurrency(value);
            if (isDate) return formatDisplayDate(value);
            return value || 'Vacío';
        };

        if (initial.viviendaSeleccionada?.id !== current.viviendaSeleccionada?.id) {
            const anteriorLabel = initial.viviendaSeleccionada ? `Mz ${initial.viviendaSeleccionada.manzana} - Casa ${initial.viviendaSeleccionada.numeroCasa}` : 'Ninguna';
            const actualLabel = current.viviendaSeleccionada ? `Mz ${current.viviendaSeleccionada.manzana} - Casa ${current.viviendaSeleccionada.numeroCasa}` : 'Ninguna';
            cambiosDetectados.push({ campo: 'Vivienda Asignada', anterior: anteriorLabel, actual: actualLabel });
        }

        for (const key in current.datosCliente) {
            if (key.startsWith('url') || key === 'cedula' || String(initial.datosCliente[key] || '') === String(current.datosCliente[key] || '')) continue;
            const isDateField = key === 'fechaIngreso';
            cambiosDetectados.push({ campo: fieldLabels[key] || key, anterior: formatValue(initial.datosCliente[key], false, isDateField), actual: formatValue(current.datosCliente[key], false, isDateField) });
        }

        setCambios(cambiosDetectados);
        setIsConfirming(true);
    }, [formData, todosLosClientes, clienteAEditar, abonosDelCliente, initialData]);

    return {
        step, setStep, formData, dispatch, errors: formData.errors,
        isConfirming, setIsConfirming, isSubmitting, cambios, hayCambios,
        viviendaOptions,
        handlers: { handleNextStep, handlePrevStep, handlePreSave, executeSave, handleInputChange, handleValueChange }
    };
};