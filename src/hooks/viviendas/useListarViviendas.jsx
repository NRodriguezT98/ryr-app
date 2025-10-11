// src/hooks/viviendas/useListarViviendas.jsx
// 🔥 OPTIMIZADO: Lógica de filtrado/ordenamiento extraída a utilidades reutilizables

import { useState, useMemo, useCallback, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import { useData } from "../../context/DataContext";
import { useUndoableDelete } from "../useUndoableDelete";
import { deleteViviendaPermanently, archiveVivienda, restoreVivienda } from "../../services/viviendaService";
import { aplicarFiltrosViviendas, ordenarViviendas, calcularPermisosVivienda } from "../../utils/viviendaFilters";
import toast from 'react-hot-toast';
import { useDebounce } from '../useDebounce';

const ITEMS_PER_PAGE = 9;

export const useListarViviendas = () => {
    const location = useLocation();
    const { isLoading, viviendas, clientes, abonos, recargarDatos, loadCollection, hasLoaded } = useData();

    // Cargar colecciones necesarias si no están cargadas (lazy loading)
    useEffect(() => {
        if (!hasLoaded.viviendas) {
            loadCollection('viviendas');
        }
        if (!hasLoaded.clientes) {
            loadCollection('clientes');
        }
        if (!hasLoaded.abonos) {
            loadCollection('abonos');
        }
    }, [hasLoaded.viviendas, hasLoaded.clientes, hasLoaded.abonos, loadCollection]);

    // Estados del hook
    const [statusFilter, setStatusFilter] = useState(location.state?.statusFilter || 'todas');
    const [proyectoFilter, setProyectoFilter] = useState('todos');
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const [sortOrder, setSortOrder] = useState('ubicacion');
    const [currentPage, setCurrentPage] = useState(1);
    const [viviendaAEditar, setViviendaAEditar] = useState(null);
    const [viviendaAEliminar, setViviendaAEliminar] = useState(null);
    const [viviendaAArchivar, setViviendaAArchivar] = useState(null);
    const [viviendaARestaurar, setViviendaARestaurar] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 🔥 OPTIMIZACIÓN: Procesamiento + filtrado + ordenamiento centralizado
    const viviendasFiltradasYOrdenadas = useMemo(() => {
        // 1. Enriquecemos viviendas con permisos calculados
        const itemsProcesados = viviendas.map(vivienda => {
            const clienteAsignado = clientes.find(c => c.id === vivienda.clienteId);
            const tieneHistorialDeAbonos = abonos.some(a => a.viviendaId === vivienda.id);

            const permisos = calcularPermisosVivienda(vivienda, clienteAsignado, tieneHistorialDeAbonos);

            return { ...vivienda, ...permisos };
        });

        // 2. Aplicamos filtros usando utilidad centralizada
        const itemsFiltrados = aplicarFiltrosViviendas(itemsProcesados, {
            statusFilter,
            proyectoFilter,
            searchTerm: debouncedSearchTerm
        });

        // 3. Ordenamos usando utilidad centralizada
        return ordenarViviendas(itemsFiltrados, sortOrder);
    }, [viviendas, clientes, abonos, statusFilter, proyectoFilter, debouncedSearchTerm, sortOrder]);

    const totalPages = useMemo(() =>
        Math.ceil(viviendasFiltradasYOrdenadas.length / ITEMS_PER_PAGE),
        [viviendasFiltradasYOrdenadas]
    );

    const viviendasPaginadas = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return viviendasFiltradasYOrdenadas.slice(startIndex, endIndex);
    }, [currentPage, viviendasFiltradasYOrdenadas]);

    useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter, proyectoFilter, searchTerm, sortOrder]);

    const { hiddenItems: viviendasOcultas, initiateDelete } = useUndoableDelete(
        async ({ vivienda, nombreProyecto }) => {
            setIsSubmitting(true);
            try {
                await deleteViviendaPermanently(vivienda, nombreProyecto);
                recargarDatos();
            } catch (error) {
                console.error("Error en borrado permanente:", error);
                throw error;
            } finally {
                setIsSubmitting(false);
            }
        },
        recargarDatos,
        "Vivienda"
    );

    const viviendasVisibles = viviendasPaginadas.filter(v => !viviendasOcultas.includes(v.id));

    const handleGuardado = useCallback(() => {
        recargarDatos();
        setViviendaAEditar(null);
    }, [recargarDatos]);

    const handleIniciarEliminacion = (vivienda, nombreProyecto) => {
        if (!vivienda.puedeEliminar) {
            toast.error("No se puede eliminar: la vivienda ya tiene un historial de pagos registrado.");
            return;
        }
        setViviendaAEliminar({ vivienda, nombreProyecto });
    };

    const confirmarEliminar = useCallback(() => {
        if (!viviendaAEliminar) return;
        initiateDelete(viviendaAEliminar);
        setViviendaAEliminar(null);
    }, [viviendaAEliminar, initiateDelete]);

    const handleIniciarArchivado = useCallback((vivienda, nombreProyecto) => {
        setViviendaAArchivar({ vivienda, nombreProyecto });
    }, []);

    const confirmarArchivado = useCallback(async () => {
        if (!viviendaAArchivar) return;

        setIsSubmitting(true);
        try {
            await archiveVivienda(viviendaAArchivar.vivienda, viviendaAArchivar.nombreProyecto);
            toast.success("Vivienda archivada con éxito.");
            recargarDatos();
        } catch (error) {
            toast.error(error.message || "No se pudo archivar la vivienda.");
        } finally {
            setIsSubmitting(false);
            setViviendaAArchivar(null);
        }
    }, [viviendaAArchivar, recargarDatos]);

    const handleIniciarRestauracion = useCallback((vivienda, nombreProyecto) => {
        setViviendaARestaurar({ vivienda, nombreProyecto });
    }, []);

    const confirmarRestauracion = useCallback(async () => {
        if (!viviendaARestaurar) return;

        setIsSubmitting(true);
        try {
            await restoreVivienda(viviendaARestaurar.vivienda, viviendaARestaurar.nombreProyecto);
            toast.success("Vivienda restaurada con éxito.");
            recargarDatos();
        } catch (error) {
            toast.error(error.message || "No se pudo restaurar la vivienda.");
        } finally {
            setIsSubmitting(false);
            setViviendaARestaurar(null);
        }
    }, [viviendaARestaurar, recargarDatos]);

    // Determinar si está cargando (incluye estado inicial de lazy loading)
    const isLoadingData = isLoading || !hasLoaded.viviendas || !hasLoaded.clientes || !hasLoaded.abonos;

    return {
        isLoading: isLoadingData,
        isSubmitting,
        viviendasVisibles,
        todasLasViviendasFiltradas: viviendasFiltradasYOrdenadas,
        totalViviendasCount: viviendas.length,
        filters: {
            statusFilter, setStatusFilter,
            proyectoFilter, setProyectoFilter,
            searchTerm, setSearchTerm,
            sortOrder, setSortOrder
        },
        pagination: { currentPage, totalPages, onPageChange: setCurrentPage },
        modals: { viviendaAEditar, setViviendaAEditar, viviendaAEliminar, setViviendaAEliminar, viviendaAArchivar, setViviendaAArchivar, viviendaARestaurar, setViviendaARestaurar },
        handlers: {
            handleGuardado, handleIniciarEliminacion, confirmarEliminar, handleIniciarArchivado, confirmarArchivado, handleIniciarRestauracion,
            confirmarRestauracion
        },
        recargarDatos
    };
};