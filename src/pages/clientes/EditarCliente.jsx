import React, { useReducer, useState, useEffect, useCallback, Fragment, useMemo } from 'react';
import toast from 'react-hot-toast';
import { Tooltip } from 'react-tooltip';
import Step1_SelectVivienda from './wizard/Step1_SelectVivienda';
import Step2_ClientInfo from './wizard/Step2_ClientInfo';
import Step3_Financial from './wizard/Step3_Financial';
import { validateEditarCliente, validateFinancialStep } from './clienteValidation.js';
import { updateCliente, getAbonos } from '../../utils/storage.js';
import ModalConfirmacion from '../../components/ModalConfirmacion.jsx'; // Usamos el modal unificado
import Modal from '../../components/Modal.jsx';
import { Home, User, CircleDollarSign, Check, UserCog, Loader } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { formatCurrency, formatID } from '../../utils/textFormatters.js';

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
            const { section: financialSection, field: financialField, value: financialValue } = action.payload;
            return { ...state, financiero: { ...state.financiero, [financialSection]: { ...state.financiero[financialSection], [field]: financialField, value: financialValue } } };
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

const getTodayString = () => new Date().toISOString().split('T')[0];
const formatDisplayDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
};

const blankInitialState = {
    viviendaSeleccionada: null,
    datosCliente: { nombres: '', apellidos: '', cedula: '', telefono: '', correo: '', direccion: '', fechaIngreso: getTodayString() },
    financiero: {
        aplicaCuotaInicial: false, cuotaInicial: { monto: 0 },
        aplicaCredito: false, credito: { banco: '', monto: 0 },
        aplicaSubsidioVivienda: false, subsidioVivienda: { monto: 0 },
        aplicaSubsidioCaja: false, subsidioCaja: { caja: '', monto: 0 },
    },
    errors: {}
};

const EditarCliente = ({ isOpen, onClose, onGuardar, clienteAEditar }) => {
    const { clientes: todosLosClientes, viviendas } = useData();
    const [step, setStep] = useState(1);
    const [formData, dispatch] = useReducer(formReducer, blankInitialState);
    const [viviendaOriginalId, setViviendaOriginalId] = useState(null);
    const [isConfirming, setIsConfirming] = useState(false);
    const [cambios, setCambios] = useState([]);
    const [initialData, setInitialData] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [abonosDelCliente, setAbonosDelCliente] = useState([]);

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

    const handleNextStep = () => {
        let errors = {};
        if (step === 2) {
            errors = validateEditarCliente(formData.datosCliente, todosLosClientes, clienteAEditar.id, abonosDelCliente);
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
            onGuardar();
            onClose();
        } catch (error) {
            console.error("Error al actualizar el cliente:", error);
            toast.error("Hubo un error al actualizar los datos.");
        } finally {
            setIsConfirming(false);
            setIsSubmitting(false);
        }
    }, [formData, clienteAEditar, onGuardar, onClose, viviendaOriginalId]);

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
            if (key.startsWith('url') || key === 'cedula') continue;
            if (String(initial.datosCliente[key] || '') !== String(current.datosCliente[key] || '')) {
                cambiosDetectados.push({ campo: fieldLabels[key] || key, anterior: formatValue(initial.datosCliente[key], false, key === 'fechaIngreso'), actual: formatValue(current.datosCliente[key], false, key === 'fechaIngreso') });
            }
        }

        setCambios(cambiosDetectados);
        setIsConfirming(true);

    }, [formData, todosLosClientes, clienteAEditar, abonosDelCliente, initialData]);

    const hayCambios = useMemo(() => {
        if (!initialData) return false;
        return JSON.stringify(formData) !== JSON.stringify(initialData);
    }, [formData, initialData]);

    const steps = [
        <Step1_SelectVivienda key="step1" formData={formData} dispatch={dispatch} isEditing={true} options={viviendaOptions} />,
        <Step2_ClientInfo key="step2" formData={formData.datosCliente} dispatch={dispatch} errors={formData.errors} />,
        <Step3_Financial key="step3" formData={formData} dispatch={dispatch} errors={formData.errors} />,
    ];

    const STEPS_CONFIG = [
        { number: 1, title: 'Vivienda', icon: Home },
        { number: 2, title: 'Datos Cliente', icon: User },
        { number: 3, title: 'Finanzas', icon: CircleDollarSign },
    ];

    if (!isOpen || !formData) return null;

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title="Editar Cliente" icon={<UserCog size={32} className="text-[#1976d2]" />}>
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
                <div className="mt-8 min-h-[300px]">{steps[step - 1]}</div>
                <div className="mt-10 pt-6 border-t flex justify-between">
                    {step > 1 ? (<button type="button" onClick={handlePrevStep} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg transition-colors">Anterior</button>) : <div />}
                    {step < 3 ? (
                        <button type="button" onClick={handleNextStep} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition-colors ml-auto">Siguiente</button>
                    ) : (
                        <span className="ml-auto" data-tooltip-id="app-tooltip" data-tooltip-content={!hayCambios ? "No hay cambios para guardar" : ''}>
                            <button onClick={handlePreSave} disabled={!hayCambios || isSubmitting} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed w-full flex items-center justify-center gap-2">
                                {isSubmitting ? <Loader size={20} className="animate-spin" /> : null}
                                {isSubmitting ? "Guardando..." : "Guardar Cambios"}
                            </button>
                        </span>
                    )}
                </div>
            </Modal>

            {isConfirming && (
                <ModalConfirmacion
                    isOpen={isConfirming}
                    onClose={() => setIsConfirming(false)}
                    onConfirm={executeSave}
                    titulo="Confirmar Cambios del Cliente"
                    cambios={cambios}
                    isSubmitting={isSubmitting}
                />
            )}

            <Tooltip id="app-tooltip" />
        </>
    );
};

export default EditarCliente;