import { useMemo, useState, useEffect } from 'react';
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

        const viviendaAsignada = viviendas.find(v => v.id === cliente.viviendaId) || null;
        const proyectoAsignado = viviendaAsignada
            ? proyectos.find(p => p.id === viviendaAsignada.proyectoId)
            : null;

        // --- INICIO DE LA MODIFICACIÓN ---
        // Buscamos la renuncia más reciente y determinamos si está pendiente.
        const renunciaAsociada = renuncias
            .filter(r => r.clienteId === cliente.id)
            .sort((a, b) => (b.timestamp?.toMillis() || 0) - (a.timestamp?.toMillis() || 0))[0] || null;

        const tieneRenunciaPendiente = renunciaAsociada?.estadoDevolucion === 'Pendiente';
        // --- FIN DE LA MODIFICACIÓN ---

        const historialAbonos = abonos
            .filter(a => a.clienteId === clienteId && a.estadoProceso === 'activo')
            .sort((a, b) => new Date(b.fechaPago) - new Date(a.fechaPago));

        //Obtenemos la información de status con colores
        const statusInfo = determineClientStatus(cliente);

        // Buscamos el nombre del paso actual en el proceso
        let pasoActualLabel = 'No iniciado';
        if (cliente.proceso && Object.keys(cliente.proceso).length > 0) {
            const pasosAplicables = PROCESO_CONFIG.filter(p => p.aplicaA(cliente.financiero || {}));
            const primerPasoIncompleto = pasosAplicables.find(p => !cliente.proceso[p.key]?.completado);

            if (primerPasoIncompleto) {
                pasoActualLabel = primerPasoIncompleto.label;
            } else if (pasosAplicables.length > 0) {
                pasoActualLabel = 'Completado';
            }
        }

        // Comprobamos si el valor de escritura es diferente al valor final
        const mostrarAvisoValorEscritura = cliente.financiero?.usaValorEscrituraDiferente === true &&
            cliente.financiero?.valorEscritura > 0;


        return {
            isLoading: false,
            data: {
                cliente: { ...cliente, tieneRenunciaPendiente },
                vivienda: viviendaAsignada, // <-- Usamos la vivienda completa que encontramos
                proyecto: proyectoAsignado,
                historialAbonos,
                renuncia: renunciaAsociada,
                statusInfo,
                pasoActualLabel,
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