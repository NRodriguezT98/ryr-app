import { useReducer, useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import { validateCliente, validateFinancialStep, validateEditarCliente } from '../../utils/validation.js';
import { addClienteAndAssignVivienda, updateCliente } from "../../services/clienteService";
import { getAbonos } from '../../services/dataService.js';
import { createAuditLog } from "../../services/auditService";
import { createNotification } from "../../services/notificationService";
import { useData } from '../../context/DataContext.jsx';
import { PROCESO_CONFIG } from '../../utils/procesoConfig.js';
import { formatCurrency, toTitleCase, formatDisplayDate, getTodayString } from '../../utils/textFormatters.js';
import { uploadFile } from '../../services/fileService'

const blankInitialState = {
    viviendaSeleccionada: null,
    datosCliente: {
        nombres: '', apellidos: '', cedula: '', telefono: '',
        correo: '', direccion: '', urlCedula: null,
        fechaIngreso: getTodayString()
    },
    financiero: {
        aplicaCuotaInicial: false, cuotaInicial: { monto: 0 },
        aplicaCredito: false, credito: { banco: '', monto: 0, caso: '', urlCartaAprobacion: null },
        aplicaSubsidioVivienda: false, subsidioVivienda: { monto: 0 },
        aplicaSubsidioCaja: false, subsidioCaja: { caja: '', monto: 0, urlCartaAprobacion: null },
        usaValorEscrituraDiferente: false,
        valorEscritura: 0,
    },
    documentos: {
        promesaEnviadaUrl: null,
        promesaEnviadaCorreoUrl: null
    },
    errors: {}
};

function formReducer(state, action) {
    switch (action.type) {
        case 'INITIALIZE_FORM':
            return { ...(action.payload || {}), errors: {} };
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
            const newFinancials = { ...state.financiero };

            // --- INICIO DE LA CORRECCIÓN ---
            // Si la sección es 'financiero', es una propiedad directa. Si no, es un sub-objeto.
            if (section === 'financiero') {
                newFinancials[field] = value;
            } else {
                newFinancials[section] = { ...state.financiero[section], [field]: value };
            }
            // --- FIN DE LA CORRECCIÓN ---

            const newErrors = { ...state.errors };
            delete newErrors[`${section}_${field}`];
            if (field === 'urlCartaAprobacion') {
                delete newErrors[`${section}_urlCartaAprobacion`];
            }
            return { ...state, financiero: newFinancials, errors: newErrors };
        }
        case 'UPDATE_DOCUMENTO_URL': {
            const { docId, url } = action.payload;
            const newErrors = { ...state.errors };
            delete newErrors[docId];
            return { ...state, documentos: { ...state.documentos, [docId]: url }, errors: newErrors };
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

export const useClienteForm = (isEditing = false, clienteAEditar = null, onSaveSuccess, modo = 'editar') => {
    const navigate = useNavigate();
    const { clientes: todosLosClientes, viviendas, proyectos } = useData();
    const [step, setStep] = useState(1);
    const [formData, dispatch] = useReducer(formReducer, blankInitialState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [abonosDelCliente, setAbonosDelCliente] = useState([]);
    const [viviendaOriginalId, setViviendaOriginalId] = useState(null);
    const [initialData, setInitialData] = useState(null);
    const [isConfirming, setIsConfirming] = useState(false);
    const [cambios, setCambios] = useState([]);

    const isViviendaLocked = useMemo(() => {
        const resultado = isEditing && abonosDelCliente.length > 0;
        return resultado;
    }, [isEditing, abonosDelCliente]);

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

    const handleFinancialFieldChange = useCallback((section, field, value) => {
        if (field === 'caso') {
            const filter = /^[a-zA-Z0-9_-]*$/;
            if (!filter.test(value)) {
                dispatch({ type: 'SET_ERRORS', payload: { [`${section}_${field}`]: 'Solo se permiten letras, números, _ y -.' } });
                return;
            }
        }
        dispatch({ type: 'UPDATE_FINANCIAL_FIELD', payload: { section, field, value } });
    }, [dispatch]);

    const handleFileReplace = useCallback(async (event, field) => {
        const file = event.target.files[0];
        if (!file) return;

        const cedula = formData.datosCliente.cedula;
        if (!cedula) {
            toast.error("Se requiere un número de cédula para subir el archivo.");
            return;
        }

        const filePath = `documentos_clientes/${cedula}/${field}-${file.name}`;

        toast.loading('Reemplazando archivo...');
        try {
            const downloadURL = await uploadFile(file, filePath);
            dispatch({ type: 'UPDATE_DATOS_CLIENTE', payload: { field, value: downloadURL } });
            toast.dismiss();
            toast.success('¡Archivo reemplazado con éxito!');
        } catch (error) {
            toast.dismiss();
            toast.error('No se pudo reemplazar el archivo.');
            console.error(error);
        }
    }, [formData.datosCliente.cedula, dispatch]);

    const handleFinancialFileReplace = useCallback(async (event, section, field) => {
        const file = event.target.files[0];
        if (!file) return;

        const cedula = formData.datosCliente.cedula;
        if (!cedula) {
            toast.error("Se requiere un número de cédula para subir el archivo.");
            return;
        }

        const filePath = `documentos_clientes/${cedula}/${field}-${file.name}`;

        toast.loading('Reemplazando archivo...');
        try {
            const downloadURL = await uploadFile(file, filePath);
            // Usamos el handler que ya existe para campos financieros
            handleFinancialFieldChange(section, field, downloadURL);
            toast.dismiss();
            toast.success('¡Archivo reemplazado con éxito!');
        } catch (error) {
            toast.dismiss();
            toast.error('No se pudo reemplazar el archivo.');
            console.error(error);
        }
    }, [formData.datosCliente.cedula, handleFinancialFieldChange]);

    useEffect(() => {
        if (isEditing && clienteAEditar) {
            const viviendaAsignada = viviendas.find(v => v.id === clienteAEditar.viviendaId);
            setViviendaOriginalId(clienteAEditar.viviendaId);
            getAbonos().then(abonos => {
                const abonosFiltrados = abonos.filter(a => a.clienteId === clienteAEditar.id);
                setAbonosDelCliente(abonosFiltrados);
            });
            let initialStateForEdit;
            if (modo === 'reactivar') {
                initialStateForEdit = {
                    ...blankInitialState,
                    datosCliente: {
                        ...clienteAEditar.datosCliente,
                        fechaIngreso: clienteAEditar.datosCliente.fechaIngreso
                    },
                    status: 'renunciado'
                };
            } else {
                initialStateForEdit = { ...blankInitialState, ...clienteAEditar, financiero: { ...blankInitialState.financiero, ...clienteAEditar.financiero }, viviendaSeleccionada: viviendaAsignada || null };
            }
            dispatch({ type: 'INITIALIZE_FORM', payload: { ...initialStateForEdit, errors: {} } });
            setInitialData(JSON.parse(JSON.stringify(initialStateForEdit)));
        }
    }, [isEditing, clienteAEditar, viviendas, modo]);

    const viviendasOptions = useMemo(() => {
        const disponibles = viviendas.filter(v => !v.clienteId || v.id === clienteAEditar?.viviendaId);
        return disponibles
            .sort((a, b) => a.manzana.localeCompare(b.manzana) || a.numeroCasa - b.numeroCasa)
            .map(v => {
                const proyecto = proyectos.find(p => p.id === v.proyectoId);
                return {
                    value: v.id,
                    label: `Mz ${v.manzana} - Casa ${v.numeroCasa} (${formatCurrency(v.valorFinal || v.valorTotal || 0)})`,
                    vivienda: v,
                    // Los nuevos datos que necesita el componente Step1_SelectVivienda
                    nombreProyecto: proyecto ? proyecto.nombre : 'Sin Proyecto Asignado',
                    ubicacionSearchKey: `${v.manzana}${v.numeroCasa}`.toLowerCase().replace(/\s/g, '')
                };
            });
    }, [viviendas, proyectos, clienteAEditar]);

    const handleNextStep = () => {
        let errors = {};
        if (step === 1 && !formData.viviendaSeleccionada) {
            toast.error("Debes seleccionar una vivienda para continuar.");
            return;
        }
        if (step === 2) {
            errors = validateCliente(formData.datosCliente, todosLosClientes, clienteAEditar?.id);
            if (Object.keys(errors).length > 0) {
                dispatch({ type: 'SET_ERRORS', payload: errors });
                return;
            }
        }
        dispatch({ type: 'SET_ERRORS', payload: {} });
        setStep(s => s + 1);
    };

    const handlePrevStep = () => setStep(s => s - 1);

    const isFechaIngresoLocked = useMemo(() => {
        if (!isEditing || !clienteAEditar) return false; // La fecha no se bloquea al crear

        // Condición 1: ¿Hay abonos?
        if (abonosDelCliente.length > 0) return true;

        // Condición 2: ¿Se ha completado más de un paso?
        const proceso = clienteAEditar.proceso || {};
        const otrosPasosCompletados = Object.keys(proceso).filter(key =>
            proceso[key]?.completado && key !== 'promesaEnviada'
        ).length;

        // Si hay otros pasos completados, se bloquea.
        return otrosPasosCompletados > 0;
    }, [clienteAEditar, abonosDelCliente, isEditing]);

    const executeSave = useCallback(async () => {
        setIsSubmitting(true);
        try {
            if (modo === 'reactivar') {
                if (!formData.viviendaSeleccionada?.id) {
                    toast.error("Error: Debes seleccionar una vivienda para reactivar al cliente.");
                    setIsSubmitting(false);
                    return;
                }
                const nuevoProceso = {};
                PROCESO_CONFIG.forEach(paso => {
                    if (paso.aplicaA(formData.financiero)) {
                        const evidencias = {};
                        paso.evidenciasRequeridas.forEach(ev => {
                            evidencias[ev.id] = { url: null, estado: 'pendiente' };
                        });
                        nuevoProceso[paso.key] = { completado: false, fecha: null, evidencias };
                    }
                });
                if (formData.documentos.promesaEnviadaUrl && formData.documentos.promesaEnviadaCorreoUrl) {
                    const fechaDeInicio = getTodayString();
                    nuevoProceso.promesaEnviada = {
                        completado: true,
                        fecha: fechaDeInicio,
                        evidencias: {
                            promesaEnviadaDoc: { url: formData.documentos.promesaEnviadaUrl, estado: 'subido', fechaSubida: fechaDeInicio },
                            promesaEnviadaCorreo: { url: formData.documentos.promesaEnviadaCorreoUrl, estado: 'subido', fechaSubida: fechaDeInicio }
                        }
                    };
                }
                const clienteParaActualizar = {
                    datosCliente: formData.datosCliente,
                    financiero: formData.financiero,
                    proceso: nuevoProceso,
                    viviendaId: formData.viviendaSeleccionada.id,
                    status: 'activo',
                    fechaInicioProceso: getTodayString(),
                    fechaCreacion: clienteAEditar.fechaCreacion
                };
                const nuevaVivienda = viviendas.find(v => v.id === clienteParaActualizar.viviendaId);
                const nombreNuevaVivienda = nuevaVivienda ? `Mz ${nuevaVivienda.manzana} - Casa ${nuevaVivienda.numeroCasa}` : 'Vivienda no encontrada';

                await updateCliente(clienteAEditar.id, clienteParaActualizar, viviendaOriginalId, {
                    action: 'RESTART_CLIENT_PROCESS',
                    snapshotCompleto: clienteParaActualizar, // Pasamos la "fotografía" completa
                    nombreNuevaVivienda: nombreNuevaVivienda
                });

                toast.success("¡Cliente reactivado con un nuevo proceso!");
                const clienteNombre = toTitleCase(`${clienteParaActualizar.datosCliente.nombres} ${clienteParaActualizar.datosCliente.apellidos}`);
                await createNotification('cliente', `El cliente ${clienteNombre} fue reactivado.`, `/clientes/detalle/${clienteAEditar.id}`);

            } else if (isEditing) {
                const { errors, ...datosParaGuardar } = formData;
                const clienteParaActualizar = {
                    datosCliente: formData.datosCliente,
                    financiero: formData.financiero,
                    proceso: formData.proceso,
                    viviendaId: formData.viviendaSeleccionada?.id || null,
                    status: formData.status
                };
                const fechaOriginal = initialData?.datosCliente?.fechaIngreso;
                const fechaNueva = formData.datosCliente.fechaIngreso;

                if (fechaOriginal !== fechaNueva) {
                    if (isFechaIngresoLocked) {
                        toast.error("La fecha de inicio no se puede modificar porque el cliente ya tiene abonos o ha avanzado en el proceso.");
                        setIsSubmitting(false);
                        return; // Detenemos el guardado
                    }

                    // Si la fecha cambió y es permitido, sincronizamos el primer paso del proceso
                    if (clienteParaActualizar.proceso?.promesaEnviada) {
                        clienteParaActualizar.proceso.promesaEnviada.fecha = fechaNueva;
                    }

                    clienteParaActualizar.fechaInicioProceso = fechaNueva;
                }

                await updateCliente(clienteAEditar.id, clienteParaActualizar, viviendaOriginalId, {
                    action: 'UPDATE_CLIENT',
                    cambios
                });
                toast.success("¡Cliente actualizado con éxito!");
                createNotification('cliente', `Se actualizaron los datos de ${toTitleCase(clienteAEditar.datosCliente.nombres)}.`, `/clientes/detalle/${clienteAEditar.id}`);
            } else {
                if (!formData.viviendaSeleccionada?.id) {
                    toast.error("Error: No hay una vivienda seleccionada.");
                    setIsSubmitting(false);
                    return;
                }
                const nuevoProceso = {};
                PROCESO_CONFIG.forEach(paso => {
                    if (paso.aplicaA(formData.financiero)) {
                        const evidencias = {};
                        paso.evidenciasRequeridas.forEach(ev => {
                            evidencias[ev.id] = { url: null, estado: 'pendiente' };
                        });
                        nuevoProceso[paso.key] = { completado: false, fecha: null, evidencias };
                    }
                });
                if (formData.documentos.promesaEnviadaUrl && formData.documentos.promesaEnviadaCorreoUrl) {
                    const fechaDeInicio = formData.datosCliente.fechaIngreso;
                    nuevoProceso.promesaEnviada = {
                        completado: true,
                        fecha: fechaDeInicio,
                        evidencias: {
                            promesaEnviadaDoc: { url: formData.documentos.promesaEnviadaUrl, estado: 'subido', fechaSubida: fechaDeInicio },
                            promesaEnviadaCorreo: { url: formData.documentos.promesaEnviadaCorreoUrl, estado: 'subido', fechaSubida: fechaDeInicio }
                        }
                    };
                }
                const clienteParaGuardar = {
                    datosCliente: formData.datosCliente,
                    financiero: formData.financiero,
                    proceso: nuevoProceso,
                    viviendaId: formData.viviendaSeleccionada.id,
                    fechaInicioProceso: formData.datosCliente.fechaIngreso
                };

                const { datosCliente, financiero, documentos, viviendaSeleccionada } = formData;

                // 1. Obtenemos el nombre del proyecto
                const proyectoAsignado = proyectos.find(p => p.id === viviendaSeleccionada.proyectoId);
                const nombreProyecto = proyectoAsignado ? proyectoAsignado.nombre : 'N/A';
                const nombreVivienda = `Mz ${viviendaSeleccionada.manzana} - Casa ${viviendaSeleccionada.numeroCasa}`;
                const nombreCompleto = `${datosCliente.nombres} ${datosCliente.apellidos}`;

                // 2. Creamos el mensaje detallado
                const auditMessage = `Creó al cliente ${toTitleCase(nombreCompleto)} (C.C. ${datosCliente.cedula}), asignándole la vivienda ${nombreVivienda} del proyecto "${nombreProyecto}"`;

                // 3. Creamos el objeto de detalles con el snapshot completo
                const fuentesDePago = [];
                if (financiero.aplicaCuotaInicial) fuentesDePago.push({ nombre: 'Cuota Inicial', monto: financiero.cuotaInicial.monto });
                if (financiero.aplicaCredito) fuentesDePago.push({ nombre: 'Crédito Hipotecario', monto: financiero.credito.monto });
                if (financiero.aplicaSubsidioVivienda) fuentesDePago.push({ nombre: 'Subsidio Mi Casa Ya', monto: financiero.subsidioVivienda.monto });
                if (financiero.aplicaSubsidioCaja) fuentesDePago.push({ nombre: `Subsidio Caja (${financiero.subsidioCaja.caja})`, monto: financiero.subsidioCaja.monto });

                const auditDetails = {
                    action: 'CREATE_CLIENT',
                    clienteId: datosCliente.cedula,
                    clienteNombre: toTitleCase(nombreCompleto),
                    snapshotCliente: {
                        viviendaAsignada: `${nombreVivienda} del Proyecto ${nombreProyecto}`,
                        valorVivienda: viviendaSeleccionada.valorTotal,
                        nombreCompleto: toTitleCase(nombreCompleto),
                        cedula: datosCliente.cedula,
                        telefono: datosCliente.telefono,
                        correo: datosCliente.correo,
                        direccion: datosCliente.direccion,
                        fechaIngreso: datosCliente.fechaIngreso,
                        cedulaAdjuntada: datosCliente.urlCedula ? 'Sí' : 'No',
                        promesaAdjuntada: documentos.promesaEnviadaUrl ? 'Sí' : 'No',
                        correoAdjuntado: documentos.promesaEnviadaCorreoUrl ? 'Sí' : 'No',
                        fuentesDePago: fuentesDePago,
                        usaValorEscrituraDiferente: financiero.usaValorEscrituraDiferente,
                        valorEscritura: financiero.valorEscritura
                    }
                };

                await addClienteAndAssignVivienda(clienteParaGuardar, auditMessage, auditDetails);
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
    }, [formData, navigate, todosLosClientes, isEditing, clienteAEditar, onSaveSuccess, viviendaOriginalId, modo, cambios, initialData, isFechaIngresoLocked, proyectos]);

    const hayCambios = useMemo(() => {
        if (!initialData || !formData) return false;
        return JSON.stringify(formData) !== JSON.stringify(initialData);
    }, [formData, initialData]);

    const escrituraFirmada = useMemo(() => {
        return clienteAEditar?.proceso?.minutaFirmada?.completado === true;
    }, [clienteAEditar]);

    const handleSave = useCallback(() => {
        const valorTotalVivienda = formData.viviendaSeleccionada?.valorTotal || 0;

        const totalAbonadoCuotaInicial = abonosDelCliente
            .filter(abono => abono.fuente === 'cuotaInicial' && abono.estadoProceso === 'activo')
            .reduce((sum, abono) => sum + abono.monto, 0);

        const clientErrors = isEditing
            ? validateEditarCliente(formData.datosCliente, todosLosClientes, clienteAEditar?.id, abonosDelCliente)
            : validateCliente(formData.datosCliente, todosLosClientes);

        const financialErrors = validateFinancialStep(formData.financiero, valorTotalVivienda, formData.documentos, isEditing, totalAbonadoCuotaInicial);
        const totalErrors = { ...clientErrors, ...financialErrors };
        if (Object.keys(totalErrors).length > 0) {
            dispatch({ type: 'SET_ERRORS', payload: totalErrors });
            toast.error("Por favor, corrige los errores antes de guardar.");
            return;
        }
        if (isEditing && modo !== 'reactivar') {
            const cambiosDetectados = [];
            const initial = initialData;
            const current = formData;

            const formatValue = (value, type = 'text') => {
                if (value === null || value === undefined || value === '') return 'Vacío';
                if (type === 'date') return formatDisplayDate(value);
                if (type === 'currency') return formatCurrency(value || 0);
                if (type === 'boolean') return value ? 'Sí' : 'No';
                // Nuevo tipo para manejar URLs de archivos
                if (type === 'file') return 'Archivo adjunto';
                return String(value) || 'Vacío';
            };
            const compareAndPush = (label, initialVal, currentVal, type = 'text') => {
                if (String(initialVal || '') !== String(currentVal || '')) {
                    cambiosDetectados.push({
                        campo: label,
                        anterior: formatValue(initialVal, type),
                        actual: formatValue(currentVal, type)
                    });
                }
            };

            const compareAndPushFileChange = (label, initialUrl, currentUrl) => {
                if (initialUrl !== currentUrl) {
                    let anterior = initialUrl ? 'Archivo adjunto' : 'Vacío';
                    let actual = currentUrl ? 'Archivo adjunto' : 'Vacío';

                    // Si se elimina un archivo
                    if (initialUrl && !currentUrl) {
                        actual = 'Archivo eliminado';
                    }
                    // Si se reemplaza un archivo
                    if (initialUrl && currentUrl) {
                        actual = 'Nuevo archivo adjunto';
                    }

                    cambiosDetectados.push({
                        campo: label,
                        anterior: anterior,
                        actual: actual
                    });
                }
            };

            if (initial.viviendaSeleccionada?.id !== current.viviendaSeleccionada?.id) {
                const viviendaInicial = viviendas.find(v => v.id === initial.viviendaSeleccionada?.id);
                const viviendaActual = viviendas.find(v => v.id === current.viviendaSeleccionada?.id);
                compareAndPush('Vivienda Asignada',
                    viviendaInicial ? `Mz ${viviendaInicial.manzana} - C ${viviendaInicial.numeroCasa}` : 'Ninguna',
                    viviendaActual ? `Mz ${viviendaActual.manzana} - C ${viviendaActual.numeroCasa}` : 'Ninguna'
                );
            }

            compareAndPush('Nombres', initial.datosCliente.nombres, current.datosCliente.nombres);
            compareAndPush('Apellidos', initial.datosCliente.apellidos, current.datosCliente.apellidos);
            compareAndPush('Teléfono', initial.datosCliente.telefono, current.datosCliente.telefono);
            compareAndPush('Correo', initial.datosCliente.correo, current.datosCliente.correo);
            compareAndPush('Dirección', initial.datosCliente.direccion, current.datosCliente.direccion);
            compareAndPush('Fecha de Ingreso', initial.datosCliente.fechaIngreso, current.datosCliente.fechaIngreso, 'date');
            compareAndPush('Aplica Cuota Inicial', initial.financiero.aplicaCuotaInicial, current.financiero.aplicaCuotaInicial, 'boolean');
            compareAndPush('Monto Cuota Inicial', initial.financiero.cuotaInicial.monto, current.financiero.cuotaInicial.monto, 'currency');
            compareAndPush('Aplica Crédito', initial.financiero.aplicaCredito, current.financiero.aplicaCredito, 'boolean');
            compareAndPush('Monto Crédito', initial.financiero.credito.monto, current.financiero.credito.monto, 'currency');
            compareAndPush('Banco (Crédito)', initial.financiero.credito.banco, current.financiero.credito.banco);
            compareAndPush('Número de Caso (Crédito)', initial.financiero.credito.caso, current.financiero.credito.caso);
            compareAndPush('Aplica Sub. Mi Casa Ya', initial.financiero.aplicaSubsidioVivienda, current.financiero.aplicaSubsidioVivienda, 'boolean');
            compareAndPush('Monto Sub. Mi Casa Ya', initial.financiero.subsidioVivienda.monto, current.financiero.subsidioVivienda.monto, 'currency');
            compareAndPush('Aplica Sub. Caja Comp.', initial.financiero.aplicaSubsidioCaja, current.financiero.aplicaSubsidioCaja, 'boolean');
            compareAndPush('Monto Sub. Caja Comp.', initial.financiero.subsidioCaja.monto, current.financiero.subsidioCaja.monto, 'currency');
            compareAndPush('Caja de Compensación', initial.financiero.subsidioCaja.caja, current.financiero.subsidioCaja.caja);

            compareAndPush('Usa Valor Escritura Diferente', initial.financiero.usaValorEscrituraDiferente, current.financiero.usaValorEscrituraDiferente, 'boolean');
            compareAndPush('Valor Escritura', initial.financiero.valorEscritura, current.financiero.valorEscritura, 'currency');

            compareAndPushFileChange(
                'Cédula (Archivo)',
                initial.datosCliente.urlCedula,
                current.datosCliente.urlCedula
            );
            compareAndPushFileChange(
                'Carta Aprob. Crédito',
                initial.financiero.credito.urlCartaAprobacion,
                current.financiero.credito.urlCartaAprobacion
            );
            compareAndPushFileChange(
                'Carta Aprob. Subsidio',
                initial.financiero.subsidioCaja.urlCartaAprobacion,
                current.financiero.subsidioCaja.urlCartaAprobacion
            );

            setCambios(cambiosDetectados);
            setIsConfirming(true);
        } else {
            executeSave();
        }
    }, [formData, todosLosClientes, isEditing, modo, clienteAEditar, abonosDelCliente, initialData, executeSave, viviendas, abonosDelCliente]);

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
        proyectos,
        isFechaIngresoLocked,
        escrituraFirmada,
        isViviendaLocked,
        handlers: {
            handleNextStep,
            handlePrevStep,
            handleSave,
            executeSave,
            handleInputChange,
            handleFinancialFieldChange,
            handleFileReplace,
            handleFinancialFileReplace
        }
    };
};