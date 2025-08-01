import { useState, useMemo, useCallback, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import { useData } from "../../context/DataContext";
import { useUndoableDelete } from "../useUndoableDelete";
import { deleteViviendaPermanently } from "../../utils/storage";
import toast from 'react-hot-toast';

const ITEMS_PER_PAGE = 9;

export const useListarViviendas = () => {
    const location = useLocation();
    const { isLoading, viviendas, clientes, abonos, recargarDatos } = useData();

    const initialStateFromLink = location.state?.statusFilter || 'todas';
    const [statusFilter, setStatusFilter] = useState(initialStateFromLink);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('ubicacion');
    const [currentPage, setCurrentPage] = useState(1);

    const viviendasFiltradasYOrdenadas = useMemo(() => {
        let itemsProcesados = viviendas.map(vivienda => {
            const clienteAsignado = clientes.find(c => c.id === vivienda.clienteId);
            const procesoFinalizado = clienteAsignado?.proceso?.facturaVenta?.completado === true;
            const tieneHistorialDeAbonos = abonos.some(a => a.viviendaId === vivienda.id);
            return {
                ...vivienda,
                puedeEditar: !procesoFinalizado,
                puedeEliminar: !vivienda.clienteId && !tieneHistorialDeAbonos,
                camposFinancierosBloqueados: !!vivienda.clienteId
            };
        });

        if (statusFilter !== 'todas') {
            if (statusFilter === 'disponibles') itemsProcesados = itemsProcesados.filter(v => !v.clienteId);
            if (statusFilter === 'asignadas') itemsProcesados = itemsProcesados.filter(v => v.clienteId && v.saldoPendiente > 0);
            if (statusFilter === 'pagadas') itemsProcesados = itemsProcesados.filter(v => v.clienteId && v.saldoPendiente <= 0);
        }

        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase().replace(/\s/g, '');
            itemsProcesados = itemsProcesados.filter(v => {
                const ubicacion = `${v.manzana}${v.numeroCasa}`.toLowerCase().replace(/\s/g, '');
                const matricula = (v.matricula || '').toLowerCase();
                const cliente = (v.clienteNombre || '').toLowerCase();
                return ubicacion.includes(lowerCaseSearchTerm) || matricula.includes(lowerCaseSearchTerm) || cliente.includes(searchTerm.toLowerCase());
            });
        }

        switch (sortOrder) {
            case 'nombre_cliente':
                itemsProcesados.sort((a, b) => (a.clienteNombre || 'z').localeCompare(b.clienteNombre || 'z'));
                break;
            case 'recientes':
                itemsProcesados.sort((a, b) => (b.fechaCreacion || '').localeCompare(a.fechaCreacion || ''));
                break;
            case 'valor_desc':
                itemsProcesados.sort((a, b) => b.valorFinal - a.valorFinal);
                break;
            case 'valor_asc':
                itemsProcesados.sort((a, b) => a.valorFinal - b.valorFinal);
                break;
            case 'saldo_desc':
                itemsProcesados.sort((a, b) => (b.saldoPendiente ?? 0) - (a.saldoPendiente ?? 0));
                break;
            case 'saldo_asc':
                itemsProcesados.sort((a, b) => (a.saldoPendiente ?? 0) - (b.saldoPendiente ?? 0));
                break;
            case 'ubicacion':
            default:
                itemsProcesados.sort((a, b) => a.manzana.localeCompare(b.manzana) || a.numeroCasa - b.numeroCasa);
                break;
        }

        return itemsProcesados;
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
        async (vivienda) => deleteViviendaPermanently(vivienda.id),
        recargarDatos,
        "Vivienda"
    );
    const viviendasVisibles = viviendasPaginadas.filter(v => !viviendasOcultas.includes(v.id));

    const [viviendaAEditar, setViviendaAEditar] = useState(null);
    const [viviendaAEliminar, setViviendaAEliminar] = useState(null);

    const handleGuardado = useCallback(() => {
        recargarDatos();
        setViviendaAEditar(null);
    }, [recargarDatos]);

    const handleIniciarEliminacion = (vivienda) => {
        if (!vivienda.puedeEliminar) {
            toast.error("No se puede eliminar: la vivienda ya tiene un historial de pagos registrado.");
            return;
        }
        setViviendaAEliminar(vivienda);
    };

    const confirmarEliminar = () => {
        if (!viviendaAEliminar) return;
        initiateDelete(viviendaAEliminar);
        setViviendaAEliminar(null);
    };

    return {
        isLoading,
        viviendasVisibles,
        todasLasViviendasFiltradas: viviendasFiltradasYOrdenadas,
        filters: {
            statusFilter, setStatusFilter,
            searchTerm, setSearchTerm,
            sortOrder, setSortOrder
        },
        pagination: {
            currentPage,
            totalPages,
            onPageChange: setCurrentPage
        },
        modals: {
            viviendaAEditar, setViviendaAEditar,
            viviendaAEliminar, setViviendaAEliminar
        },
        handlers: {
            handleGuardado,
            handleIniciarEliminacion,
            confirmarEliminar
        }
    };
};