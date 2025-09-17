import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import toast from 'react-hot-toast';
import { determineClientStatus } from '../../utils/statusHelper';
import { PROCESO_CONFIG } from '../../utils/procesoConfig';

export const useDetalleCliente = () => {
    const { clienteId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { clientes, viviendas, proyectos, abonos, renuncias, isLoading, recargarDatos } = useData();

    const [activeTab, setActiveTab] = useState(location.state?.defaultTab || 'info');

    const datosDetalle = useMemo(() => {
        if (isLoading || !clienteId) {
            return { isLoading: true, data: null };
        }

        const cliente = clientes.find(c => c.id === clienteId);
        if (!cliente) return { isLoading: false, data: null };

        // --- INICIO DE LA SOLUCIÓN ---
        // 1. Unificamos toda la lógica del proceso en una sola sección
        let pasoActualLabel = 'No iniciado';
        let progresoProceso = { completados: 0, total: 0 }; // Objeto para el progreso

        if (cliente.proceso && Object.keys(cliente.proceso).length > 0) {
            const pasosAplicables = PROCESO_CONFIG.filter(p => p.aplicaA(cliente.financiero || {}));

            // Contamos los pasos completados y el total
            const pasosCompletados = pasosAplicables.filter(p => cliente.proceso[p.key]?.completado).length;
            progresoProceso = { completados: pasosCompletados, total: pasosAplicables.length };

            const primerPasoIncompleto = pasosAplicables.find(p => !cliente.proceso[p.key]?.completado);
            if (primerPasoIncompleto) {
                pasoActualLabel = primerPasoIncompleto.label;
            } else if (pasosAplicables.length > 0) {
                pasoActualLabel = 'Completado';
            }
        }

        const viviendaAsignada = viviendas.find(v => v.id === cliente.viviendaId) || null;
        const proyectoAsignado = viviendaAsignada ? proyectos.find(p => p.id === viviendaAsignada.proyectoId) : null;
        const renunciaAsociada = renuncias.filter(r => r.clienteId === cliente.id).sort((a, b) => (b.timestamp?.toMillis() || 0) - (a.timestamp?.toMillis() || 0))[0] || null;
        const historialAbonos = abonos.filter(a => a.clienteId === clienteId && a.estadoProceso === 'activo').sort((a, b) => new Date(b.fechaPago) - new Date(a.fechaPago));

        const statusInfo = determineClientStatus(cliente);
        const mostrarAvisoValorEscritura = cliente.financiero?.usaValorEscrituraDiferente === true && cliente.financiero?.valorEscritura > 0;
        const progresoFinanciero = viviendaAsignada?.valorFinal > 0 ? (viviendaAsignada.totalAbonado / viviendaAsignada.valorFinal) * 100 : 0;

        return {
            isLoading: false,
            data: {
                cliente,
                vivienda: viviendaAsignada,
                proyecto: proyectoAsignado,
                historialAbonos,
                renuncia: renunciaAsociada,
                statusInfo,
                pasoActualLabel,
                progresoProceso,
                progresoFinanciero,
                mostrarAvisoValorEscritura
            }
        };
    }, [clienteId, clientes, viviendas, proyectos, abonos, renuncias, isLoading]);

    useEffect(() => {
        if (!isLoading && !datosDetalle?.data) {
            toast.error("Cliente no encontrado.");
            navigate('/clientes/listar');
        }
    }, [isLoading, datosDetalle, navigate]);

    return {
        isLoading: datosDetalle?.isLoading ?? true,
        data: datosDetalle?.data,
        activeTab,
        setActiveTab,
        recargarDatos,
        navigate
    };
};