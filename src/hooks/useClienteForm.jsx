import { useReducer, useState, useCallback, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import { validateCliente, validateFinancialStep } from '../pages/clientes/clienteValidation.js';
import { getClientes, addClienteAndAssignVivienda, createNotification } from '../utils/storage.js';
import { PASOS_SEGUIMIENTO_CONFIG } from '../utils/seguimientoConfig.js';
import { useForm } from './useForm.jsx'; // Usaremos nuestro hook base

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

export const useClienteForm = () => {
    const [step, setStep] = useState(1);
    const [todosLosClientes, setTodosLosClientes] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const navigate = useNavigate();

    const {
        formData, dispatch, errors, setErrors, handleSubmit,
        handleInputChange, handleValueChange
    } = useForm({
        initialState: blankInitialState,
        validate: (data) => ({
            ...validateCliente(data.datosCliente, todosLosClientes),
            ...validateFinancialStep(data.financiero, data.viviendaSeleccionada.valorTotal)
        }),
        onSubmit: async (formData) => {
            setIsSaving(true);
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
                setIsSaving(false);
            }
        },
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
        const step2Errors = validateCliente(formData.datosCliente, todosLosClientes, null);
        setErrors(step2Errors);

        if (Object.keys(step2Errors).length === 0) {
            setStep(s => s + 1);
        }
    };

    const handlePrevStep = () => setStep(s => s - 1);

    return {
        step, formData, dispatch, errors, isSubmitting: isSaving,
        handleNextStep, handlePrevStep, handleSubmit, handleInputChange, handleValueChange
    };
};