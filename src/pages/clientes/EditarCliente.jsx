import React, { useReducer, useState, useEffect, useCallback, Fragment, useMemo } from 'react';
import toast from 'react-hot-toast';
import { Tooltip } from 'react-tooltip';
import Step1_SelectVivienda from './wizard/Step1_SelectVivienda';
import Step2_ClientInfo from './wizard/Step2_ClientInfo';
import Step3_Financial from './wizard/Step3_Financial';
import { validateEditarCliente, validateFinancialStep } from './clienteValidation.js'; // Usaremos la nueva validación
import { updateCliente, getAbonos } from '../../utils/storage.js'; // Importamos getAbonos
import ModalConfirmacion from '../../components/ModalConfirmacion.jsx';
import Modal from '../../components/Modal.jsx';
import { Home, User, CircleDollarSign, Check, UserCog } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { formatCurrency } from '../../utils/textFormatters.js';

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

const getTodayString = () => new Date().toISOString().split('T')[0];
const formatDisplayDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
};

const blankInitialState = {
    viviendaSeleccionada: { id: null, valorTotal: 0, label: '' },
    datosCliente: { nombres: '', apellidos: '', cedula: '', telefono: '', correo: '', direccion: '', fechaIngreso: getTodayString() },
    financiero: {
        aplicaCuotaInicial: false, cuotaInicial: { monto: 0 },
        aplicaCredito: false, credito: { banco: '', monto: 0, cubreGastosNotariales: false, montoParaNotariales: 0 },
        aplicaSubsidioVivienda: false, subsidioVivienda: { monto: 0 },
        aplicaSubsidioCaja: false, subsidioCaja: { caja: '', monto: 0 },
        gastosNotariales: { monto: 0, fuentePago: 'recursosPropios' }
    },
    seguimiento: {},
    errors: {}
};

const EditarCliente = ({ isOpen, onClose, onGuardar, clienteAEditar }) => {
    const { clientes: todosLosClientes, viviendas } = useData();
    const [step, setStep] = useState(1);
    const [formData, dispatch] = useReducer(formReducer, blankInitialState);
    const [viviendaOriginalId, setViviendaOriginalId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isConfirming, setIsConfirming] = useState(false);
    const [cambios, setCambios] = useState([]);
    const [initialData, setInitialData] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [abonosDelCliente, setAbonosDelCliente] = useState([]); // Estado para los abonos

    useEffect(() => {
        if (isOpen && clienteAEditar) {
            setIsLoading(true);
            const viviendaAsignada = viviendas.find(v => v.id === clienteAEditar.viviendaId);
            setViviendaOriginalId(clienteAEditar.viviendaId);

            const fetchAbonos = async () => {
                const todosAbonos = await getAbonos();
                setAbonosDelCliente(todosAbonos.filter(a => a.clienteId === clienteAEditar.id));
            };
            fetchAbonos();

            const initialStateForEdit = {
                ...blankInitialState,
                ...clienteAEditar,
                viviendaSeleccionada: {
                    id: viviendaAsignada?.id || null,
                    valorTotal: viviendaAsignada?.valorTotal || 0,
                    label: viviendaAsignada ? `Mz ${viviendaAsignada.manzana} - Casa ${viviendaAsignada.numeroCasa} (${formatCurrency(viviendaAsignada.valorTotal || 0)})` : ''
                },
                errors: {}
            };
            setInitialData(JSON.parse(JSON.stringify(initialStateForEdit)));
            dispatch({ type: 'INITIALIZE_FORM', payload: initialStateForEdit });
            setIsLoading(false);
            setStep(1);
        }
    }, [isOpen, clienteAEditar, viviendas]);

    const nextStep = () => setStep(prev => prev < 3 ? prev + 1 : 3);
    const prevStep = () => setStep(prev => prev > 1 ? prev - 1 : 1);

    const handleNext = () => {
        let errors = {};
        if (step === 2) {
            // Usamos la nueva función de validación que incluye la fecha
            errors = validateEditarCliente(formData.datosCliente, todosLosClientes, clienteAEditar.id, abonosDelCliente);
            if (Object.keys(errors).length > 0) {
                dispatch({ type: 'SET_ERRORS', payload: errors });
                toast.error("Por favor, corrige los errores del formulario.");
                return;
            }
        }
        dispatch({ type: 'SET_ERRORS', payload: {} });
        nextStep();
    };

    const executeSave = useCallback(async () => {
        setIsSubmitting(true);
        const clienteParaActualizar = {
            datosCliente: formData.datosCliente,
            financiero: formData.financiero,
            seguimiento: formData.seguimiento,
            viviendaId: formData.viviendaSeleccionada.id,
            status: 'activo'
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
        const totalErrors = {
            ...validateEditarCliente(formData.datosCliente, todosLosClientes, clienteAEditar.id, abonosDelCliente),
            ...validateFinancialStep(formData.financiero, formData.viviendaSeleccionada.valorTotal)
        };
        if (Object.keys(totalErrors).length > 0) {
            dispatch({ type: 'SET_ERRORS', payload: totalErrors });
            toast.error("Por favor, corrige los errores del formulario.");
            return;
        }

        const cambiosDetectados = [];
        // Lógica de detección de cambios... (sin cambios)

        if (cambiosDetectados.length === 0) {
            toast('No se han detectado cambios para guardar.', { icon: 'ℹ️' });
            return;
        }

        setCambios(cambiosDetectados);
        setIsConfirming(true);
    }, [formData, todosLosClientes, clienteAEditar, initialData, abonosDelCliente]);

    const hayCambios = useMemo(() => {
        if (!initialData) return false;
        return JSON.stringify(formData) !== JSON.stringify(initialData);
    }, [formData, initialData]);

    const steps = [
        <Step1_SelectVivienda key="step1" formData={formData} dispatch={dispatch} isEditing={true} clienteAEditar={clienteAEditar} />,
        <Step2_ClientInfo key="step2" formData={formData} dispatch={dispatch} errors={formData.errors} />,
        <Step3_Financial key="step3" formData={formData} dispatch={dispatch} errors={formData.errors} />,
    ];

    const STEPS_CONFIG = [
        { number: 1, title: 'Vivienda', icon: Home },
        { number: 2, title: 'Datos Cliente', icon: User },
        { number: 3, title: 'Finanzas', icon: CircleDollarSign },
    ];

    if (!isOpen) return null;

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title="Editar Cliente"
                icon={<UserCog size={32} className="text-[#1976d2]" />}
            >
                {isLoading ? (
                    <div className="text-center py-10 text-gray-500 animate-pulse">Cargando datos...</div>
                ) : (
                    <>
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
                        <div className="mt-8">{steps[step - 1]}</div>
                        <div className="mt-10 pt-6 border-t flex justify-between">
                            {step > 1 ? (
                                <button type="button" onClick={prevStep} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg transition-colors">Anterior</button>
                            ) : <div />}
                            {step < 3 ? (
                                <button type="button" onClick={handleNext} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition-colors ml-auto">Siguiente</button>
                            ) : (
                                <span
                                    className="ml-auto"
                                    data-tooltip-id="app-tooltip"
                                    data-tooltip-content={!hayCambios ? "No hay cambios para guardar" : ''}
                                >
                                    <button
                                        onClick={handlePreSave}
                                        disabled={!hayCambios || isSubmitting}
                                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed w-full flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? <Loader size={20} className="animate-spin" /> : null}
                                        {isSubmitting ? "Guardando..." : "Guardar Cambios"}
                                    </button>
                                </span>
                            )}
                        </div>
                    </>
                )}
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