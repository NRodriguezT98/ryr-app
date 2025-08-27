import { useState, useMemo, useCallback, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import { useData } from "../../context/DataContext";
import { useUndoableDelete } from "../useUndoableDelete";
import { deleteViviendaPermanently, archiveVivienda, restoreVivienda } from "../../utils/storage";
import toast from 'react-hot-toast';

const ITEMS_PER_PAGE = 9;

export const useListarViviendas = () => {
    const location = useLocation();
    const { isLoading, viviendas, clientes, abonos, recargarDatos } = useData();

    const [statusFilter, setStatusFilter] = useState(location.state?.statusFilter || 'todas');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('ubicacion');
    const [currentPage, setCurrentPage] = useState(1);
    const [viviendaAEditar, setViviendaAEditar] = useState(null);
    const [viviendaAEliminar, setViviendaAEliminar] = useState(null);
    const [viviendaAArchivar, setViviendaAArchivar] = useState(null);
    const [viviendaARestaurar, setViviendaARestaurar] = useState(null);

    const viviendasFiltradasYOrdenadas = useMemo(() => {
        let itemsProcesados = viviendas.map(vivienda => {
            const clienteAsignado = clientes.find(c => c.id === vivienda.clienteId);
            const procesoFinalizado = clienteAsignado?.proceso?.facturaVenta?.completado === true;
            const tieneHistorialDeAbonos = abonos.some(a => a.viviendaId === vivienda.id);
            const tieneValorEscrituraDiferente = clienteAsignado?.financiero?.usaValorEscrituraDiferente === true && clienteAsignado?.financiero?.valorEscritura > 0;

            return {
                ...vivienda,
                puedeEditar: !procesoFinalizado,
                puedeEliminar: !vivienda.clienteId && !tieneHistorialDeAbonos,
                puedeArchivar: !vivienda.clienteId && vivienda.status !== 'archivada',
                puedeRestaurar: vivienda.status === 'archivada',
                camposFinancierosBloqueados: !!vivienda.clienteId,
                tieneValorEscrituraDiferente
            };
        });

        // 2. Aplicamos los filtros de estado de forma secuencial
        let itemsFiltrados;

        if (statusFilter === 'archivadas') {
            itemsFiltrados = itemsProcesados.filter(v => v.status === 'archivada');
        } else {
            // Por defecto, excluimos las archivadas
            itemsFiltrados = itemsProcesados.filter(v => v.status !== 'archivada');

            // Si el filtro no es 'todas', aplicamos el filtro específico
            if (statusFilter !== 'todas') {
                if (statusFilter === 'disponibles') itemsFiltrados = itemsFiltrados.filter(v => !v.clienteId);
                if (statusFilter === 'asignadas') itemsFiltrados = itemsFiltrados.filter(v => v.clienteId && v.saldoPendiente > 0);
                if (statusFilter === 'pagadas') itemsFiltrados = itemsFiltrados.filter(v => v.clienteId && v.saldoPendiente <= 0);
            }
        }

        // 3. Aplicamos el filtro de búsqueda
        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase().replace(/\s/g, '');
            itemsFiltrados = itemsFiltrados.filter(v => {
                const ubicacion = `${v.manzana}${v.numeroCasa}`.toLowerCase().replace(/\s/g, '');
                const matricula = (v.matricula || '').toLowerCase();
                const cliente = (v.clienteNombre || '').toLowerCase();
                return ubicacion.includes(lowerCaseSearchTerm) || matricula.includes(lowerCaseSearchTerm) || cliente.includes(searchTerm.toLowerCase());
            });
        }

        let itemsOrdenados = [...itemsFiltrados];

        switch (sortOrder) {
            case 'nombre_cliente':
                itemsOrdenados.sort((a, b) => (a.clienteNombre || 'z').localeCompare(b.clienteNombre || 'z'));
                break;
            case 'recientes':
                itemsOrdenados.sort((a, b) => (b.fechaCreacion || '').localeCompare(a.fechaCreacion || ''));
                break;
            case 'valor_desc':
                itemsOrdenados.sort((a, b) => b.valorFinal - a.valorFinal);
                break;
            case 'valor_asc':
                itemsOrdenados.sort((a, b) => a.valorFinal - b.valorFinal);
                break;
            case 'saldo_desc':
                itemsOrdenados.sort((a, b) => (b.saldoPendiente ?? 0) - (a.saldoPendiente ?? 0));
                break;
            case 'saldo_asc':
                itemsOrdenados.sort((a, b) => (a.saldoPendiente ?? 0) - (b.saldoPendiente ?? 0));
                break;
            case 'ubicacion':
            default:
                itemsOrdenados.sort((a, b) => a.manzana.localeCompare(b.manzana) || a.numeroCasa - b.numeroCasa);
                break;
        }

        return itemsOrdenados;
    }, [viviendas, clientes, abonos, statusFilter, searchTerm, sortOrder]);

    const totalPages = useMemo(() => Math.ceil(viviendasFiltradasYOrdenadas.length / ITEMS_PER_PAGE), [viviendasFiltradasYOrdenadas]);

    const viviendasPaginadas = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return viviendasFiltradasYOrdenadas.slice(startIndex, endIndex);
    }, [currentPage, viviendasFiltradasYOrdenadas]);

    useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter, searchTerm, sortOrder]);

    const { hiddenItems: viviendasOcultas, initiateDelete } = useUndoableDelete(
        async ({ vivienda, nombreProyecto }) => deleteViviendaPermanently(vivienda, nombreProyecto),
        recargarDatos,
        "Vivienda"
    );
    const viviendasVisibles = viviendasPaginadas.filter(v => !viviendasOcultas.includes(v.id));

    const handleGuardado = useCallback(() => { recargarDatos(); setViviendaAEditar(null); }, [recargarDatos]);

    const handleIniciarEliminacion = (vivienda, nombreProyecto) => {
        if (!vivienda.puedeEliminar) {
            toast.error("No se puede eliminar: la vivienda ya tiene un historial de pagos registrado.");
            return;
        }
        setViviendaAEliminar({ vivienda, nombreProyecto });
    };

    const confirmarEliminar = () => {
        if (!viviendaAEliminar) return;
        initiateDelete(viviendaAEliminar);
        setViviendaAEliminar(null);
    };

    const handleIniciarArchivado = useCallback((vivienda, nombreProyecto) => {
        setViviendaAArchivar({ vivienda, nombreProyecto });
    }, []);

    const confirmarArchivado = useCallback(async () => {
        if (!viviendaAArchivar) return;
        try {
            await archiveVivienda(viviendaAArchivar.vivienda, viviendaAArchivar.nombreProyecto);
            toast.success("Vivienda archivada con éxito.");
            recargarDatos();
        } catch (error) {
            toast.error(error.message || "No se pudo archivar la vivienda.");
        } finally {
            setViviendaAArchivar(null);
        }
    }, [viviendaAArchivar, recargarDatos]);

    const handleIniciarRestauracion = useCallback((vivienda, nombreProyecto) => {
        setViviendaARestaurar({ vivienda, nombreProyecto });
    }, []);

    const confirmarRestauracion = useCallback(async () => {
        if (!viviendaARestaurar) return;
        try {
            await restoreVivienda(viviendaARestaurar.vivienda, viviendaARestaurar.nombreProyecto);
            toast.success("Vivienda restaurada con éxito.");
            recargarDatos();
        } catch (error) {
            toast.error(error.message || "No se pudo restaurar la vivienda.");
        } finally {
            setViviendaARestaurar(null);
        }
    }, [viviendaARestaurar, recargarDatos]);

    return {
        isLoading,
        viviendasVisibles,
        todasLasViviendasFiltradas: viviendasFiltradasYOrdenadas,
        filters: { statusFilter, setStatusFilter, searchTerm, setSearchTerm, sortOrder, setSortOrder },
        pagination: { currentPage, totalPages, onPageChange: setCurrentPage },
        modals: { viviendaAEditar, setViviendaAEditar, viviendaAEliminar, setViviendaAEliminar, viviendaAArchivar, setViviendaAArchivar, viviendaARestaurar, setViviendaARestaurar },
        handlers: {
            handleGuardado, handleIniciarEliminacion, confirmarEliminar, handleIniciarArchivado, confirmarArchivado, handleIniciarRestauracion,
            confirmarRestauracion
        },
        recargarDatos
    };
};