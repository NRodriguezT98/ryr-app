import { useState, useMemo, useEffect, useReducer } from 'react';
import { useData } from '../../context/DataContext';
import { useDataSync } from '../useDataSync'; // ✅ Sistema de sincronización inteligente
import toast from 'react-hot-toast';
import { transferirViviendaCliente } from '../../services/clientes';
import { toTitleCase, formatCurrency } from '../../utils/textFormatters';
import { useClienteFinanciero } from './useClienteFinanciero'; // Reutilizamos tu hook de cálculo

// Estado inicial para el nuevo plan financiero, similar al de useClienteForm
const blankFinancialState = {
    aplicaCuotaInicial: false, cuotaInicial: { monto: 0 },
    aplicaCredito: false, credito: { banco: '', monto: 0, caso: '', urlCartaAprobacion: null },
    aplicaSubsidioVivienda: false, subsidioVivienda: { monto: 0 },
    aplicaSubsidioCaja: false, subsidioCaja: { caja: '', monto: 0, urlCartaAprobacion: null },
    usaValorEscrituraDiferente: false, valorEscritura: 0,
};

function financieroReducer(state, action) {
    switch (action.type) {
        case 'INITIALIZE':
            return action.payload;
        case 'TOGGLE_OPTION': {
            const { field, value } = action.payload;
            return { ...state, [field]: value };
        }
        case 'UPDATE_FIELD': {
            const { section, field, value } = action.payload;
            if (section === 'financiero') { // Campo directo como valorEscritura
                return { ...state, [field]: value };
            }
            return { ...state, [section]: { ...state[section], [field]: value } };
        }
        default:
            return state;
    }
}

const useTransferirVivienda = (cliente, onTransferSuccess) => {
    const { viviendas, proyectos, abonos, isLoading } = useData();
    const { afterClienteMutation } = useDataSync(); // ✅ Sincronización granular

    const [step, setStep] = useState(1);
    const [motivo, setMotivo] = useState('');
    const [nuevaViviendaId, setNuevaViviendaId] = useState('');
    const [nuevoPlanFinanciero, dispatchFinanciero] = useReducer(financieroReducer, blankFinancialState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const totalAbonadoCliente = useMemo(() => {
        // Asumimos que todos los abonos son a cuota inicial, según la nueva regla
        return abonos
            .filter(abono => abono.clienteId === cliente.id && abono.estado !== 'anulado')
            .reduce((total, abono) => total + abono.monto, 0);
    }, [abonos, cliente.id]);

    const nuevaViviendaSeleccionada = useMemo(() => viviendas.find(v => v.id === nuevaViviendaId), [nuevaViviendaId, viviendas]);
    const resumenNuevoPlan = useClienteFinanciero(nuevoPlanFinanciero, nuevaViviendaSeleccionada?.valorTotal);

    // --- INICIO DE LA MODIFICACIÓN: Lógica para forzar la Cuota Inicial ---
    useEffect(() => {
        if (step === 2 && totalAbonadoCliente > 0) {
            // Forzamos la activación de la cuota inicial y establecemos el monto mínimo
            dispatchFinanciero({ type: 'TOGGLE_OPTION', payload: { field: 'aplicaCuotaInicial', value: true } });
            dispatchFinanciero({ type: 'UPDATE_FIELD', payload: { section: 'cuotaInicial', field: 'monto', value: totalAbonadoCliente } });
        }
    }, [step, totalAbonadoCliente]);
    // --- FIN DE LA MODIFICACIÓN ---

    const handleNextStep = () => {
        const newErrors = {};
        if (!nuevaViviendaId) newErrors.nuevaViviendaId = 'Debe seleccionar una vivienda.';
        if (!motivo.trim()) newErrors.motivo = 'El motivo es obligatorio.';
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error('Por favor, complete todos los campos.');
            return;
        }
        setErrors({});
        setStep(2);
    };

    const handlePrevStep = () => setStep(1);

    const validateStep2 = () => {
        const newErrors = {};

        if (totalAbonadoCliente > 0 && nuevoPlanFinanciero.cuotaInicial.monto < totalAbonadoCliente) {
            // Se cambia la clave del error para que sea más fácil de conectar en la UI
            newErrors.cuotaInicial = `El monto de la cuota inicial debe ser mayor o igual al total de abonos realizados por el cliente (${formatCurrency(totalAbonadoCliente)}.)`;
        }
        if (resumenNuevoPlan.diferencia !== 0) {
            newErrors.financiero = 'El plan financiero debe cuadrar a cero.';
        }
        if (nuevoPlanFinanciero.aplicaCredito && !nuevoPlanFinanciero.credito.urlCartaAprobacion) {
            newErrors.credito_urlCartaAprobacion = 'La carta de aprobación es obligatoria.';
        }
        if (nuevoPlanFinanciero.aplicaSubsidioCaja && !nuevoPlanFinanciero.subsidioCaja.urlCartaAprobacion) {
            newErrors.subsidioCaja_urlCartaAprobacion = 'La carta de aprobación es obligatoria.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    // --- FIN DE LA MODIFICACIÓN ---

    const handleTransfer = async () => {
        // --- INICIO DE LA MODIFICACIÓN: Usamos la nueva función de validación ---
        if (!validateStep2()) {
            toast.error('Por favor, corrija los errores en el formulario.');
            return;
        }

        setIsSubmitting(true);
        try {
            await transferirViviendaCliente({
                clienteId: cliente.id,
                viviendaOriginalId: cliente.viviendaId,
                nuevaViviendaId,
                motivo,
                nuevoPlanFinanciero,
                nombreCliente: toTitleCase(`${cliente.datosCliente.nombres} ${cliente.datosCliente.apellidos}`),
            });

            toast.success('¡Cliente transferido con éxito!');

            // ✅ Sincronización inteligente (solo clientes y viviendas)
            await afterClienteMutation();

            if (onTransferSuccess) {
                onTransferSuccess();
            }
        } catch (error) {
            console.error("Error al transferir el cliente:", error);
            toast.error(error.message || 'Hubo un error al realizar la transferencia.');
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        setStep(1);
        setNuevaViviendaId('');
        setMotivo('');
        dispatchFinanciero({ type: 'INITIALIZE', payload: blankFinancialState });
        setErrors({});
    }, [cliente]);

    const handleFinancialFieldChange = (section, field, value) => {
        // Limpiamos el error al cambiar el campo
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[section];
            return newErrors;
        });
        dispatchFinanciero({ type: 'UPDATE_FIELD', payload: { section, field, value } });
    };
    const handleCheckboxChange = (e) => {
        dispatchFinanciero({ type: 'TOGGLE_OPTION', payload: { field: e.target.name, value: e.target.checked } });
    };

    return {
        step,
        handleNextStep,
        handlePrevStep,
        motivo,
        setMotivo,
        nuevaViviendaId,
        setNuevaViviendaId,
        nuevoPlanFinanciero,
        handleFinancialFieldChange,
        handleCheckboxChange,
        resumenNuevoPlan,
        viviendaActual: cliente.vivienda,
        opcionesViviendaParaSelector: useMemo(() => viviendas.filter(v => !v.clienteId).map(v => ({ value: v.id, label: `Mz ${v.manzana} - Casa ${v.numeroCasa}`, vivienda: v, nombreProyecto: proyectos.find(p => p.id === v.proyectoId)?.nombre || 'N/A' })), [viviendas, proyectos]),
        isSubmitting,
        isLoading,
        errors,
        handleTransfer,
        totalAbonadoCliente,
        cliente,
        nuevaViviendaSeleccionada
    };
};

export default useTransferirVivienda;