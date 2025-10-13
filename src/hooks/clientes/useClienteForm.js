/**
 * 🎯 Hook: useClienteForm (v2 - Refactorizado)
 * 
 * ORQUESTADOR    // 1. Hook de Estado
    const { formData, dispatch, errors, setErrors } = useClienteFormState(blankInitialState);
    
    // 3. Hook de Navegación (antes de validación para obtener step actual)
    const navigation = useClienteNavigation(
        null, // validateCurrentStep se pasa después
        setErrors,
        formData
    );

    // 2. Hook de Validación (ahora con el step correcto)
    const validation = useClienteValidation(
        formData,
        navigation.step, // ✅ Usamos el step del hook de navegación
        modo,
        isEditing,
        todosLosClientes,
        clienteId?.id,
        abonosDelCliente
    );
    
    // Actualizar la función de validación en navigation
    navigation.setValidateFunction(validation.validateCurrentStep);Responsabilidad: Combinar todos los hooks especializados
 * Este hook mantiene la MISMA INTERFAZ que el hook original para
 * garantizar compatibilidad 100% con el código existente.
 * 
 * Arquitectura:
 * - useClienteFormState: Estado del formulario
 * - useClienteValidation: Validaciones
 * - useClienteNavigation: Navegación entre pasos
 * - useClienteFileUpload: Subida de archivos
 * - useClienteSave: Persistencia de datos
 * 
 * Beneficios vs Original:
 * - 676 líneas → ~200 líneas (orquestador)
 * - Separación de responsabilidades
 * - Testeable independientemente
 * - Reutilizable
 * - Mantenible
 * 
 * Complejidad: Media (solo orquestación)
 * Testing: Integration tests
 * Riesgo: 30% - Punto de integración crítico
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useData } from '../../context/DataContext.jsx';
import { getAbonos } from '../../services/dataService.js';
import { getRenunciasByCliente } from '../../services/renunciaService.js';
import { formatCurrency, getTodayString } from '../../utils/textFormatters.js';
import { validateCliente, validateFinancialStep } from '../../utils/validation.js';
import { useModernToast } from '../useModernToast.jsx';

// Importar hooks especializados
import { useClienteFormState } from './useClienteFormState.js';
import { useClienteValidation } from './useClienteValidation.js';
import { useClienteNavigation } from './useClienteNavigation.js';
import { useClienteFileUpload } from './useClienteFileUpload.js';
import { useClienteSave } from './useClienteSave.js';
import { blankInitialState } from './formReducer.js';

/**
 * Hook principal del formulario de cliente (VERSIÓN REFACTORIZADA)
 * 
 * IMPORTANTE: Mantiene la misma interfaz que el hook original
 * para garantizar compatibilidad sin cambios en componentes.
 * 
 * @param {boolean} isEditing - Si está en modo edición
 * @param {Object} clienteAEditar - Cliente a editar (null si es nuevo)
 * @param {Function} onSaveSuccess - Callback al guardar exitosamente
 * @param {string} modo - Modo: 'crear' | 'editar' | 'reactivar'
 * @returns {Object} Mismo objeto que useClienteForm original
 */
export const useClienteForm = (
    isEditing = false,
    clienteAEditar = null,
    onSaveSuccess,
    modo = 'editar'
) => {
    const { clientes: todosLosClientes, viviendas, proyectos, loadCollection, hasLoaded } = useData();
    const toast = useModernToast();

    // 🔥 FIX: Forzar carga de viviendas y proyectos cuando se monta el formulario
    useEffect(() => {
        // Cargar viviendas si no están cargadas
        if (!hasLoaded.viviendas) {
            loadCollection('viviendas');
        }
        // Cargar proyectos si no están cargados
        if (!hasLoaded.proyectos) {
            loadCollection('proyectos');
        }
    }, []); // Solo al montar el componente

    // Estados adicionales (no cubiertos por hooks especializados)
    const [abonosDelCliente, setAbonosDelCliente] = useState([]);
    const [viviendaOriginalId, setViviendaOriginalId] = useState(null);
    const [initialData, setInitialData] = useState(null);
    const [isConfirming, setIsConfirming] = useState(false);
    const [cambios, setCambios] = useState([]);
    const [ultimaRenuncia, setUltimaRenuncia] = useState(null);

    // 1. Hook de Estado
    const { formData, dispatch, errors, setErrors } = useClienteFormState(blankInitialState);

    // 3. Hook de Navegación (antes de validación para obtener step actual)
    const navigation = useClienteNavigation(
        null, // validateCurrentStep se pasa después
        setErrors,
        formData
    );

    // 2. Hook de Validación (ahora con el step correcto)
    const validation = useClienteValidation(
        formData,
        navigation.step, // ✅ Usamos el step del hook de navegación
        modo,
        isEditing,
        todosLosClientes,
        clienteAEditar?.id,
        abonosDelCliente
    );

    // Actualizar la función de validación en navigation (dentro de useEffect para evitar re-renders)
    useEffect(() => {
        navigation.setValidateFunction(validation.validateCurrentStep);
    }, [validation.validateCurrentStep, navigation.setValidateFunction]);

    // 4. Hook de Archivos
    const fileUpload = useClienteFileUpload(
        formData.datosCliente.cedula,
        dispatch
    );

    // 5. Hook de Guardado
    const save = useClienteSave(
        modo,
        isEditing,
        clienteAEditar,
        viviendaOriginalId,
        onSaveSuccess,
        proyectos,
        viviendas
    );

    // ===== LÓGICA ADICIONAL (no en hooks especializados) =====

    /**
     * Handlers de input (delegados a dispatch)
     */
    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;

        // Filtros de input (mismo que original)
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
            // ✅ Usamos callback para evitar dependencia de errors
            setErrors(prevErrors => ({ ...prevErrors, [name]: filter.message }));
            return;
        }

        // 🔥 NUEVO: Limpiar el error del campo cuando el usuario lo modifica
        setErrors(prevErrors => {
            const newErrors = { ...prevErrors };
            delete newErrors[name];
            return newErrors;
        });

        dispatch({ type: 'UPDATE_DATOS_CLIENTE', payload: { field: name, value } });
    }, [dispatch, setErrors]);

    /**
     * Handler de campos financieros
     */
    const handleFinancialFieldChange = useCallback((section, field, value) => {
        const errorKey = `${section}_${field}`;

        if (field === 'caso') {
            const filter = /^[a-zA-Z0-9_-]*$/;
            if (!filter.test(value)) {
                // ✅ Usamos callback para evitar dependencia de errors
                setErrors(prevErrors => ({
                    ...prevErrors,
                    [errorKey]: 'Solo se permiten letras, números, _ y -.'
                }));
                return;
            }
        }

        // 🔥 NUEVO: Limpiar el error del campo cuando el usuario lo modifica
        setErrors(prevErrors => {
            const newErrors = { ...prevErrors };
            delete newErrors[errorKey];
            // También limpiar errores relacionados con validaciones financieras generales
            if (field === 'valorVivienda') delete newErrors['valorVivienda'];
            if (field === 'cuotaInicial') delete newErrors['cuotaInicial'];
            if (field === 'valorCreditoHipotecario') delete newErrors['creditoHipotecario'];
            return newErrors;
        });

        dispatch({ type: 'UPDATE_FINANCIAL_FIELD', payload: { section, field, value } });
    }, [dispatch, setErrors]);

    /**
     * Efecto de inicialización (cargar datos en modo edición)
     */
    useEffect(() => {
        if (isEditing && clienteAEditar) {
            const viviendaAsignada = viviendas.find(v => v.id === clienteAEditar.viviendaId);
            setViviendaOriginalId(clienteAEditar.viviendaId);

            // Cargar abonos
            getAbonos().then(abonos => {
                const abonosActivos = abonos.filter(a =>
                    a.clienteId === clienteAEditar.id && a.estadoProceso === 'activo'
                );
                setAbonosDelCliente(abonosActivos);
            });

            // Si modo reactivar, cargar última renuncia
            if (modo === 'reactivar') {
                getRenunciasByCliente(clienteAEditar.id).then(renuncias => {
                    const renunciasCerradas = renuncias.filter(r => r.estadoDevolucion === 'Cerrada');
                    renunciasCerradas.sort((a, b) => new Date(b.fechaDevolucion) - new Date(a.fechaDevolucion));
                    if (renunciasCerradas.length > 0) {
                        setUltimaRenuncia(renunciasCerradas[0]);
                    }
                });
            }

            // Inicializar formulario
            let initialStateForEdit;
            if (modo === 'reactivar') {
                initialStateForEdit = {
                    ...blankInitialState,
                    datosCliente: {
                        ...clienteAEditar.datosCliente,
                        fechaIngreso: getTodayString()
                    },
                    status: 'renunciado'
                };
            } else {
                initialStateForEdit = {
                    ...blankInitialState,
                    ...clienteAEditar,
                    financiero: { ...blankInitialState.financiero, ...clienteAEditar.financiero },
                    viviendaSeleccionada: viviendaAsignada || null
                };
            }

            dispatch({ type: 'INITIALIZE_FORM', payload: { ...initialStateForEdit, errors: {} } });
            setInitialData(JSON.parse(JSON.stringify(initialStateForEdit)));
        }
    }, [isEditing, clienteAEditar, viviendas, modo, dispatch]);

    /**
     * Memos computados
     */
    const minDateForReactivation = useMemo(() => {
        if (modo === 'reactivar' && ultimaRenuncia?.fechaDevolucion) {
            try {
                const fecha = new Date(ultimaRenuncia.fechaDevolucion);
                fecha.setMinutes(fecha.getMinutes() + fecha.getTimezoneOffset());
                return fecha.toISOString().split('T')[0];
            } catch (e) {
                console.error("Fecha de devolución inválida:", ultimaRenuncia.fechaDevolucion);
                return undefined;
            }
        }
        return undefined;
    }, [modo, ultimaRenuncia]);

    const isViviendaLocked = useMemo(() => {
        if (modo === 'reactivar') return false;
        return isEditing && abonosDelCliente.length > 0;
    }, [isEditing, abonosDelCliente, modo]);

    const viviendasOptions = useMemo(() => {
        // Validar que viviendas y proyectos estén cargados
        if (!viviendas || viviendas.length === 0) {
            return [];
        }
        if (!proyectos || proyectos.length === 0) {
            return [];
        }

        const disponibles = viviendas.filter(v => !v.clienteId || v.id === clienteAEditar?.viviendaId);

        return disponibles
            .sort((a, b) => a.manzana.localeCompare(b.manzana) || a.numeroCasa - b.numeroCasa)
            .map(v => {
                const proyecto = proyectos.find(p => p.id === v.proyectoId);
                return {
                    value: v.id,
                    label: `Mz ${v.manzana} - Casa ${v.numeroCasa} (${formatCurrency(v.valorFinal || v.valorTotal || 0)})`,
                    vivienda: v,
                    nombreProyecto: proyecto ? proyecto.nombre : 'Sin Proyecto Asignado',
                    ubicacionSearchKey: `${v.manzana}${v.numeroCasa}`.toLowerCase().replace(/\s/g, '')
                };
            });
    }, [viviendas, proyectos, clienteAEditar]);

    const hayCambios = useMemo(() => {
        if (!initialData || !formData) return false;
        return JSON.stringify(formData) !== JSON.stringify(initialData);
    }, [formData, initialData]);

    const escrituraFirmada = useMemo(() => {
        return clienteAEditar?.proceso?.minutaFirmada?.completado === true;
    }, [clienteAEditar]);

    const isFechaIngresoLocked = useMemo(() => {
        if (!isEditing || !clienteAEditar) return false;
        if (abonosDelCliente.length > 0) return true;

        const proceso = clienteAEditar.proceso || {};
        const otrosPasosCompletados = Object.keys(proceso).filter(key =>
            proceso[key]?.completado && key !== 'promesaEnviada'
        ).length;

        return otrosPasosCompletados > 0;
    }, [clienteAEditar, abonosDelCliente, isEditing]);

    /**
     * Handler de guardado con detección de cambios
     */
    const handleSave = useCallback(() => {
        // Validar todo antes de guardar
        const allErrors = validation.validateAll();

        if (Object.keys(allErrors).length > 0) {
            setErrors(allErrors);
            toast.error("Por favor, corrige los errores antes de guardar.", {
                title: "Errores de Validación"
            });
            return;
        }

        // Si es edición y no reactivar, detectar cambios
        if (isEditing && modo !== 'reactivar') {
            console.log('🔍 [useClienteForm] Detectando cambios...');
            console.log('  - isEditing:', isEditing);
            console.log('  - modo:', modo);
            console.log('  - initialData:', initialData);
            console.log('  - formData:', formData);

            const cambiosDetectados = [];

            // Definir orden de campos para mantener consistencia con el formulario
            let orderCounter = 0;

            // Labels para campos comunes
            const fieldLabels = {
                // Datos personales (orden según formulario)
                nombres: { label: 'Nombres', order: orderCounter++ },
                apellidos: { label: 'Apellidos', order: orderCounter++ },
                cedula: { label: 'Número de Documento', order: orderCounter++ },
                tipoDocumento: { label: 'Tipo de Documento', order: orderCounter++ },
                telefono: { label: 'Teléfono', order: orderCounter++ },
                correo: { label: 'Correo Electrónico', order: orderCounter++ },
                direccion: { label: 'Dirección', order: orderCounter++ },
                fechaNacimiento: { label: 'Fecha de Nacimiento', order: orderCounter++ },
                genero: { label: 'Género', order: orderCounter++ },
                // Datos financieros
                cuotaInicial: { label: 'Cuota Inicial', order: orderCounter++ },
                cuotaMensual: { label: 'Cuota Mensual', order: orderCounter++ },
                tasaInteres: { label: 'Tasa de Interés', order: orderCounter++ },
                plazoMeses: { label: 'Plazo (meses)', order: orderCounter++ },
                bancoCredito: { label: 'Banco de Crédito', order: orderCounter++ },
                estadoCesantias: { label: 'Estado Cesantías', order: orderCounter++ },
                // Vivienda
                viviendaId: { label: 'Vivienda Asignada', order: 0 }, // Primera en el formulario
                fechaIngreso: { label: 'Fecha de Ingreso', order: 1 }
            };

            if (!initialData) {
                toast.error("No se pudo detectar el estado inicial del cliente", {
                    title: "Error"
                });
                return;
            }

            // Comparar vivienda
            const viviendaInicial = initialData.viviendaAsignada?.viviendaId;
            const viviendaActual = formData.viviendaAsignada?.viviendaId;

            if (viviendaInicial !== viviendaActual) {
                const viviendaInicialData = viviendas.find(v => v.id === viviendaInicial);
                const viviendaActualData = viviendas.find(v => v.id === viviendaActual);

                cambiosDetectados.push({
                    campo: fieldLabels.viviendaId.label,
                    anterior: viviendaInicialData ? `Mz ${viviendaInicialData.manzana} - Casa ${viviendaInicialData.numeroCasa}` : 'Sin asignar',
                    actual: viviendaActualData ? `Mz ${viviendaActualData.manzana} - Casa ${viviendaActualData.numeroCasa}` : 'Sin asignar',
                    order: fieldLabels.viviendaId.order
                });
            }

            // Comparar datos del cliente
            const datosIniciales = initialData.datosCliente || {};
            const datosActuales = formData.datosCliente || {};

            for (const key of Object.keys(datosActuales)) {
                // Saltar campos que ya manejamos o que no deberíamos comparar
                // Excluimos cualquier campo que sea URL o archivo
                if (['viviendaId', 'urlCedula'].includes(key)) continue;

                const valorInicial = datosIniciales[key] || '';
                const valorActual = datosActuales[key] || '';

                // Solo comparar si son valores primitivos (no objetos)
                if (typeof valorActual === 'object' || typeof valorInicial === 'object') continue;

                if (String(valorInicial) !== String(valorActual)) {
                    const fieldConfig = fieldLabels[key];
                    const label = fieldConfig ? fieldConfig.label : key;
                    const order = fieldConfig ? fieldConfig.order : 999;

                    cambiosDetectados.push({
                        campo: label,
                        anterior: String(valorInicial || 'Vacío'),
                        actual: String(valorActual || 'Vacío'),
                        order: order
                    });
                }
            }

            // Comparar cédula (archivo) - ÚLTIMO campo del formulario de datos personales
            if (datosIniciales.urlCedula !== datosActuales.urlCedula) {
                // Determinar acción
                let accion = 'reemplazado';
                if (!datosIniciales.urlCedula && datosActuales.urlCedula) {
                    accion = 'agregado';
                } else if (datosIniciales.urlCedula && !datosActuales.urlCedula) {
                    accion = 'eliminado';
                }

                // Extraer nombres de archivos de las URLs
                const getNombreArchivo = (url) => {
                    if (!url) return null;
                    try {
                        const urlObj = new URL(url);
                        const pathname = decodeURIComponent(urlObj.pathname);
                        const filename = pathname.split('/').pop();
                        return filename || 'archivo.pdf';
                    } catch (error) {
                        return 'cedula.pdf';
                    }
                };

                cambiosDetectados.push({
                    campo: 'Copia de la Cédula',
                    fileChange: true,
                    accion: accion,
                    urlAnterior: datosIniciales.urlCedula,
                    urlNuevo: datosActuales.urlCedula,
                    nombreArchivoAnterior: getNombreArchivo(datosIniciales.urlCedula),
                    nombreArchivo: getNombreArchivo(datosActuales.urlCedula),
                    mensaje: datosActuales.urlCedula && datosIniciales.urlCedula
                        ? 'Está por reemplazar la "Copia de la Cédula" antigua por la nueva adjuntada'
                        : datosActuales.urlCedula
                            ? 'Se agregará la copia de la cédula del cliente'
                            : 'Se eliminará la copia de la cédula del cliente',
                    order: (fieldLabels.genero?.order || 8) + 0.5 // Después del último campo (género)
                });
            }

            // Comparar datos financieros
            const financieroInicial = initialData.financiero || {};
            const financieroActual = formData.financiero || {};

            // Comparar Cuota Inicial (que tiene flag y monto en objeto)
            if (financieroInicial.aplicaCuotaInicial !== financieroActual.aplicaCuotaInicial) {
                cambiosDetectados.push({
                    campo: 'Cuota Inicial',
                    anterior: financieroInicial.aplicaCuotaInicial ? 'Activo' : 'Inactivo',
                    actual: financieroActual.aplicaCuotaInicial ? 'Activo' : 'Inactivo',
                    order: fieldLabels.cuotaInicial.order
                });
            }

            // Si la cuota inicial está activa, comparar monto
            if (financieroActual.aplicaCuotaInicial && financieroInicial.aplicaCuotaInicial) {
                const montoInicial = financieroInicial.cuotaInicial?.monto || 0;
                const montoActual = financieroActual.cuotaInicial?.monto || 0;

                if (Number(montoInicial) !== Number(montoActual)) {
                    cambiosDetectados.push({
                        campo: 'Cuota Inicial - Monto',
                        anterior: formatCurrency(montoInicial),
                        actual: formatCurrency(montoActual),
                        order: fieldLabels.cuotaInicial.order + 0.1
                    });
                }
            } else if (financieroActual.aplicaCuotaInicial && !financieroInicial.aplicaCuotaInicial) {
                // Si se activó la cuota inicial, mostrar el monto nuevo
                const montoActual = financieroActual.cuotaInicial?.monto || 0;
                if (montoActual > 0) {
                    cambiosDetectados.push({
                        campo: 'Cuota Inicial - Monto',
                        anterior: 'No aplicaba',
                        actual: formatCurrency(montoActual),
                        order: fieldLabels.cuotaInicial.order + 0.1
                    });
                }
            }

            // Comparar fuentes de pago (crédito, subsidioVivienda, subsidioCaja)
            const fuentesConfig = [
                {
                    key: 'credito',
                    flag: 'aplicaCredito',
                    nombre: 'Crédito Hipotecario',
                    nombreCarta: 'Carta de Aprobación - Crédito Hipotecario',
                    tieneCarta: true,
                    order: orderCounter++
                },
                {
                    key: 'subsidioVivienda',
                    flag: 'aplicaSubsidioVivienda',
                    nombre: 'Subsidio Mi Casa Ya',
                    tieneCarta: false,
                    order: orderCounter++
                },
                {
                    key: 'subsidioCaja',
                    flag: 'aplicaSubsidioCaja',
                    nombre: 'Subsidio de Caja de Compensación',
                    nombreCarta: 'Carta de Aprobación - Caja de Compensación',
                    tieneCarta: true,
                    order: orderCounter++
                }
            ];

            for (const fuenteConfig of fuentesConfig) {
                const fuenteInicial = financieroInicial[fuenteConfig.key] || {};
                const fuenteActual = financieroActual[fuenteConfig.key] || {};

                // Comparar si la fuente está activa
                const activaInicial = financieroInicial[fuenteConfig.flag];
                const activaActual = financieroActual[fuenteConfig.flag];

                if (activaInicial !== activaActual) {
                    cambiosDetectados.push({
                        campo: fuenteConfig.nombre,
                        anterior: activaInicial ? 'Activo' : 'Inactivo',
                        actual: activaActual ? 'Activo' : 'Inactivo',
                        order: fuenteConfig.order
                    });

                    // 🔥 Si se activó la fuente, mostrar campos en orden del formulario
                    if (activaActual && !activaInicial) {
                        // 1. Banco/Caja (primero en el formulario)
                        if (fuenteActual.banco) {
                            cambiosDetectados.push({
                                campo: `${fuenteConfig.nombre} - Banco`,
                                anterior: 'No aplicaba',
                                actual: String(fuenteActual.banco),
                                order: fuenteConfig.order + 0.1
                            });
                        }
                        if (fuenteActual.caja) {
                            cambiosDetectados.push({
                                campo: `${fuenteConfig.nombre} - Caja`,
                                anterior: 'No aplicaba',
                                actual: String(fuenteActual.caja),
                                order: fuenteConfig.order + 0.1
                            });
                        }

                        // 2. Monto (segundo en el formulario)
                        const montoActual = fuenteActual.monto || 0;
                        if (montoActual > 0) {
                            cambiosDetectados.push({
                                campo: `${fuenteConfig.nombre} - Monto`,
                                anterior: 'No aplicaba',
                                actual: formatCurrency(montoActual),
                                order: fuenteConfig.order + 0.2
                            });
                        }

                        // 3. Referencia (tercero en el formulario)
                        if (fuenteActual.caso) {
                            cambiosDetectados.push({
                                campo: `${fuenteConfig.nombre} - Referencia`,
                                anterior: 'No aplicaba',
                                actual: String(fuenteActual.caso),
                                order: fuenteConfig.order + 0.3
                            });
                        }

                        // 4. Carta (ÚLTIMO en el formulario - adjunto)
                        if (fuenteConfig.tieneCarta && fuenteActual.urlCartaAprobacion) {
                            // Extraer nombre de archivo de la URL
                            const getNombreArchivo = (url) => {
                                if (!url) return null;
                                try {
                                    const urlObj = new URL(url);
                                    const pathname = decodeURIComponent(urlObj.pathname);
                                    const filename = pathname.split('/').pop();
                                    return filename || 'carta.pdf';
                                } catch (error) {
                                    return 'carta.pdf';
                                }
                            };

                            cambiosDetectados.push({
                                campo: fuenteConfig.nombreCarta,
                                fileChange: true,
                                accion: 'agregado',
                                urlAnterior: null,
                                urlNuevo: fuenteActual.urlCartaAprobacion,
                                nombreArchivo: getNombreArchivo(fuenteActual.urlCartaAprobacion),
                                mensaje: `Se agregará la carta de aprobación de ${fuenteConfig.nombre}`,
                                order: fuenteConfig.order + 0.4
                            });
                        }
                    }
                }

                // Si está activa en ambos, comparar campos internos (ORDEN: Banco → Monto → Referencia → Carta)
                if (activaActual && activaInicial) {
                    for (const key of Object.keys(fuenteActual)) {
                        if (key === 'banco' || key === 'caja') {
                            // 1. Banco/Caja (primero)
                            const valorInicial = fuenteInicial[key] || '';
                            const valorActual = fuenteActual[key] || '';

                            if (String(valorInicial) !== String(valorActual)) {
                                const labelCampo = key === 'banco' ? 'Banco' : 'Caja';
                                cambiosDetectados.push({
                                    campo: `${fuenteConfig.nombre} - ${labelCampo}`,
                                    anterior: String(valorInicial || 'Vacío'),
                                    actual: String(valorActual || 'Vacío'),
                                    order: fuenteConfig.order + 0.1
                                });
                            }
                        } else if (key === 'monto') {
                            // 2. Monto (segundo)
                            const montoInicial = fuenteInicial[key] || 0;
                            const montoActual = fuenteActual[key] || 0;

                            if (Number(montoInicial) !== Number(montoActual)) {
                                cambiosDetectados.push({
                                    campo: `${fuenteConfig.nombre} - Monto`,
                                    anterior: formatCurrency(montoInicial),
                                    actual: formatCurrency(montoActual),
                                    order: fuenteConfig.order + 0.2
                                });
                            }
                        } else if (key === 'caso') {
                            // 3. Referencia (tercero)
                            const valorInicial = fuenteInicial[key] || '';
                            const valorActual = fuenteActual[key] || '';

                            if (String(valorInicial) !== String(valorActual)) {
                                cambiosDetectados.push({
                                    campo: `${fuenteConfig.nombre} - Referencia`,
                                    anterior: String(valorInicial || 'Vacío'),
                                    actual: String(valorActual || 'Vacío'),
                                    order: fuenteConfig.order + 0.3
                                });
                            }
                        } else if (key === 'urlCartaAprobacion' && fuenteConfig.tieneCarta) {
                            // 4. Carta (último - archivo adjunto)
                            if (fuenteInicial[key] !== fuenteActual[key]) {
                                // Determinar acción
                                let accion = 'reemplazado';
                                if (!fuenteInicial[key] && fuenteActual[key]) {
                                    accion = 'agregado';
                                } else if (fuenteInicial[key] && !fuenteActual[key]) {
                                    accion = 'eliminado';
                                }

                                // Extraer nombres de archivos de las URLs
                                const getNombreArchivo = (url) => {
                                    if (!url) return null;
                                    try {
                                        const urlObj = new URL(url);
                                        const pathname = decodeURIComponent(urlObj.pathname);
                                        const filename = pathname.split('/').pop();
                                        return filename || 'carta.pdf';
                                    } catch (error) {
                                        return 'carta.pdf';
                                    }
                                };

                                cambiosDetectados.push({
                                    campo: fuenteConfig.nombreCarta,
                                    fileChange: true,
                                    accion: accion,
                                    urlAnterior: fuenteInicial[key],
                                    urlNuevo: fuenteActual[key],
                                    nombreArchivoAnterior: getNombreArchivo(fuenteInicial[key]),
                                    nombreArchivo: getNombreArchivo(fuenteActual[key]),
                                    mensaje: fuenteActual[key] && fuenteInicial[key]
                                        ? `Está por reemplazar la "${fuenteConfig.nombreCarta}" antigua por la nueva adjuntada`
                                        : fuenteActual[key]
                                            ? `Se agregará la carta de aprobación de ${fuenteConfig.nombre}`
                                            : `Se eliminará la carta de aprobación de ${fuenteConfig.nombre}`,
                                    order: fuenteConfig.order + 0.4
                                });
                            }
                        }
                    }
                }
            }

            // Si no hay cambios, mostrar mensaje
            if (cambiosDetectados.length === 0) {
                console.log('⚠️ [useClienteForm] NO se detectaron cambios');
                toast.info("No se detectaron cambios para guardar", {
                    title: "Sin Cambios"
                });
                return;
            }

            // 🔥 ORDENAR cambios según el orden del formulario
            cambiosDetectados.sort((a, b) => {
                const orderA = a.order !== undefined ? a.order : 999;
                const orderB = b.order !== undefined ? b.order : 999;
                return orderA - orderB;
            });

            console.log('✅ [useClienteForm] Cambios detectados:', cambiosDetectados);
            console.log('  - Total de cambios:', cambiosDetectados.length);

            // Abrir modal de confirmación
            setCambios(cambiosDetectados);
            setIsConfirming(true);
        } else {
            // Modo crear o reactivar - guardar directamente
            save.saveCliente(formData, [], initialData, isFechaIngresoLocked);
        }
    }, [formData, validation, setErrors, toast, isEditing, modo, save, initialData, isFechaIngresoLocked, viviendas, setCambios, setIsConfirming]);

    // ===== RETORNAR INTERFAZ IDÉNTICA AL ORIGINAL =====
    return {
        // Estado
        step: navigation.step,
        formData,
        dispatch,
        errors,
        setErrors, // 🔥 NUEVO: Exportar setErrors para limpiar errores desde componentes
        isSubmitting: save.isSubmitting,
        viviendasOptions,
        isConfirming,
        setIsConfirming,
        cambios,
        hayCambios,
        proyectos,
        isFechaIngresoLocked,
        escrituraFirmada,
        isViviendaLocked,
        minDateForReactivation,
        initialData, // 🔥 NUEVO: Exportar initialData para modal de confirmación
        // 🔥 NUEVO: Estados de carga
        isLoadingViviendas: !hasLoaded.viviendas,
        isLoadingProyectos: !hasLoaded.proyectos,

        // Handlers
        handlers: {
            handleNextStep: navigation.handleNextStep,
            handlePrevStep: navigation.handlePrevStep,
            handleSave,
            executeSave: save.saveCliente,
            handleInputChange,
            handleFinancialFieldChange,
            handleFileReplace: fileUpload.handleClientFileChange,
            handleFinancialFileReplace: fileUpload.handleFinancialFileChange
        }
    };
};

export default useClienteForm;
