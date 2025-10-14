import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation, useBlocker } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useModernToast } from '../useModernToast';
import { determineClientStatus } from '../../utils/statusHelper';
import { PROCESO_CONFIG } from '../../utils/procesoConfig';

export const useDetalleCliente = () => {
    const { clienteId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const {
        clientes,
        viviendas,
        proyectos,
        abonos,
        renuncias,
        isLoading: isDataContextLoading,
        loadCollection,
        hasLoaded
    } = useData();
    const toast = useModernToast();

    const [activeTab, setActiveTab] = useState(location.state?.defaultTab || 'info');
    const [procesoTieneCambios, setProcesoTieneCambios] = useState(false);
    const [navegacionBloqueada, setNavegacionBloqueada] = useState(null);
    const historialRef = useRef(null);

    // Cargar colección de clientes si no está cargada (lazy loading)
    useEffect(() => {
        if (!hasLoaded.clientes) {
            loadCollection('clientes');
        }
    }, [hasLoaded.clientes, loadCollection]);

    const recargarDatos = async (mostrarToast = true) => {
        // Firestore sincronizará automáticamente
        if (historialRef.current && typeof historialRef.current.fetchHistorial === 'function') {
            historialRef.current.fetchHistorial();
        }
        if (mostrarToast) {
            toast.success('Datos actualizados correctamente');
        }
    };

    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            procesoTieneCambios && currentLocation.pathname !== nextLocation.pathname
    );

    const memoizedData = useMemo(() => {
        // Esperamos a que la colección de clientes esté cargada
        if (!hasLoaded.clientes || !clienteId) {
            return { isLoading: true, data: null };
        }

        const cliente = clientes.find(c => c.id === clienteId);
        if (!cliente) {
            return { isLoading: false, data: null };
        }

        const viviendaAsignada = viviendas.find(v => v.id === cliente.viviendaId) || null;
        const proyectoAsignado = viviendaAsignada ? proyectos.find(p => p.id === viviendaAsignada.proyectoId) : null;
        const renunciaAsociada = renuncias.filter(r => r.clienteId === cliente.id).sort((a, b) => (b.timestamp?.toMillis() || 0) - (a.timestamp?.toMillis() || 0))[0] || null;
        const historialAbonos = abonos.filter(a => a.clienteId === clienteId && a.estadoProceso === 'activo').sort((a, b) => new Date(b.fechaPago) - new Date(a.fechaPago));

        const statusInfo = determineClientStatus(cliente);
        const mostrarAvisoValorEscritura = cliente.financiero?.usaValorEscrituraDiferente === true && cliente.financiero?.valorEscritura > 0;
        const estaAPazYSalvo = cliente.status === 'activo' && viviendaAsignada && viviendaAsignada.saldoPendiente <= 0;

        let pasoActualLabel = 'No iniciado';
        let progresoProceso = { completados: 0, total: 0 };
        if (cliente.proceso && Object.keys(cliente.proceso).length > 0) {
            const pasosAplicables = PROCESO_CONFIG.filter(p => p.aplicaA(cliente.financiero || {}));
            const pasosCompletados = pasosAplicables.filter(p => cliente.proceso[p.key]?.completado).length;
            progresoProceso = { completados: pasosCompletados, total: pasosAplicables.length };
            const primerPasoIncompleto = pasosAplicables.find(p => !cliente.proceso[p.key]?.completado);

            if (primerPasoIncompleto) {
                pasoActualLabel = primerPasoIncompleto.label;
            } else if (pasosAplicables.length > 0) {
                pasoActualLabel = 'Completado';
            }
        }

        const clienteCompleto = {
            ...cliente, // Copiamos todos los datos originales del cliente
            // Y le anidamos la vivienda y el proyecto en la estructura correcta
            vivienda: {
                ...viviendaAsignada,
                proyecto: proyectoAsignado
            }
        };

        return {
            isLoading: false,
            data: {
                cliente: clienteCompleto,
                vivienda: viviendaAsignada,
                proyecto: proyectoAsignado,
                historialAbonos,
                renuncia: renunciaAsociada,
                statusInfo,
                pasoActualLabel,
                progresoProceso,
                mostrarAvisoValorEscritura,
                estaAPazYSalvo
            }
        };
    }, [clienteId, clientes, viviendas, proyectos, abonos, renuncias, hasLoaded.clientes]);

    const isReadOnly = useMemo(() => {
        const status = memoizedData.data?.cliente?.status;
        return status === 'enProcesoDeRenuncia' || status === 'renunciado' || status === 'inactivo';
    }, [memoizedData.data?.cliente?.status]);

    // Solo mostrar error cuando la colección ya haya cargado completamente
    useEffect(() => {
        // Si la colección de clientes ya cargó y no encontramos el cliente
        if (hasLoaded.clientes && !memoizedData.isLoading && !memoizedData.data && clienteId) {
            toast.error('Cliente no encontrado');
            navigate('/clientes/listar');
        }
    }, [hasLoaded.clientes, memoizedData.isLoading, memoizedData.data, clienteId, navigate, toast]);

    const handleTabClick = (tabName) => {
        if (procesoTieneCambios && activeTab === 'proceso' && tabName !== 'proceso') {
            setNavegacionBloqueada({ proximaTab: tabName });
        } else {
            setActiveTab(tabName);
        }
    };

    const handleConfirmarSalida = () => {
        setProcesoTieneCambios(false); // Marca los cambios como "descartados"
        if (navegacionBloqueada) {
            setActiveTab(navegacionBloqueada.proximaTab);
            setNavegacionBloqueada(null);
        } else if (blocker.state === 'blocked') {
            blocker.proceed();
        }
    };

    const handleCancelarSalida = () => {
        setNavegacionBloqueada(null);
        if (blocker.state === 'blocked') {
            blocker.reset();
        }
    };

    return {
        isLoading: memoizedData.isLoading,
        data: memoizedData.data,
        activeTab,
        setActiveTab,
        isReadOnly,
        blocker,
        navegacionBloqueada,
        setProcesoTieneCambios,
        recargarDatos,
        handlers: {
            handleTabClick,
            handleConfirmarSalida,
            handleCancelarSalida,
        },
        navigate,
        historialRef
    };
};