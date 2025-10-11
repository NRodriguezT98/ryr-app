import { useState, useMemo, useCallback, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useClienteCardLogic } from './useClienteCardLogic';
import { deleteClientePermanently, inactivarCliente, renunciarAVivienda, restaurarCliente } from "../../services/clientes";
import { createNotification } from "../../services/notificationService";
import toast from 'react-hot-toast';
import { PROCESO_CONFIG } from '../../utils/procesoConfig';
import { useDebounce } from '../useDebounce';
import {
    aplicarFiltrosClientes,
    ordenarClientes,
    enriquecerClientes
} from '../../utils/clienteFilters';

const ITEMS_PER_PAGE = 10;

export const useListarClientes = () => {
    const { isLoading, clientes, abonos, viviendas, proyectos, recargarDatos, loadCollection } = useData();

    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300); // Debounce de 300ms
    const [statusFilter, setStatusFilter] = useState('activo');
    const [proyectoFilter, setProyectoFilter] = useState('todos');
    const [sortOrder, setSortOrder] = useState('ubicacion');
    const [currentPage, setCurrentPage] = useState(1);

    // 🔥 CRÍTICO: Cargar clientes, viviendas y abonos al montar
    useEffect(() => {
        loadCollection('clientes'); // Auto-carga viviendas internamente
        loadCollection('abonos');
    }, [loadCollection]);

    const limpiarFiltros = useCallback(() => {
        setSearchTerm('');
        setStatusFilter('activo'); // Vuelve al filtro por defecto
        setProyectoFilter('todos');
        setSortOrder('ubicacion');
        toast.success('Filtros limpiados.');
    }, []);

    const [modals, setModals] = useState({
        clienteAArchivar: null,
        clienteAEliminar: null,
        clienteARenunciar: null,
        clienteARestaurar: null,
        clienteParaTransferir: null,
        datosRenuncia: null,
        isSubmitting: false,
        clienteEnModal: { cliente: null, modo: null },
    });

    // 🔥 OPTIMIZACIÓN: Enriquecimiento centralizado usando utilidad
    const todosLosClientes = useMemo(() => {
        const proyectosMap = new Map(proyectos.map(p => [p.id, p]));
        const abonosSet = new Set(abonos.map(a => a.clienteId));

        return enriquecerClientes(clientes, proyectosMap, abonosSet);
    }, [clientes, abonos, proyectos]);

    // 🔥 OPTIMIZACIÓN: Filtrado y ordenamiento usando utilidades centralizadas
    const clientesFiltrados = useMemo(() => {
        // 1. Aplicar filtros
        const filtrados = aplicarFiltrosClientes(todosLosClientes, {
            statusFilter,
            proyectoFilter,
            searchTerm: debouncedSearchTerm
        });

        // 2. Ordenar resultados
        return ordenarClientes(filtrados, sortOrder);
    }, [todosLosClientes, debouncedSearchTerm, statusFilter, proyectoFilter, sortOrder]);

    const totalPages = useMemo(() => Math.ceil(clientesFiltrados.length / ITEMS_PER_PAGE), [clientesFiltrados]);

    const clientesPaginados = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return clientesFiltrados.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [currentPage, clientesFiltrados]);

    useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter, searchTerm, sortOrder, proyectoFilter]);

    const projectOptions = useMemo(() => [
        { value: 'todos', label: 'Todos los Proyectos' },
        ...proyectos.map(p => ({ value: p.id, label: p.nombre }))
    ], [proyectos]);

    const handleGuardado = useCallback(() => {
        recargarDatos();
        setModals(prev => ({ ...prev, clienteEnModal: { cliente: null, modo: null } }));
    }, [recargarDatos]);

    const iniciarRenuncia = (cliente) => {
        if (!cliente.puedeRenunciar) {
            toast.error("No se puede iniciar la renuncia: el cliente ya ha superado un hito clave en el proceso.");
            return;
        }
        setModals(prev => ({ ...prev, clienteARenunciar: cliente }));
    };

    const iniciarEdicion = (cliente) => setModals(prev => ({ ...prev, clienteEnModal: { cliente, modo: 'editar' } }));
    const iniciarReactivacion = (cliente) => setModals(prev => ({ ...prev, clienteEnModal: { cliente, modo: 'reactivar' } }));
    const iniciarArchivado = (cliente) => setModals(prev => ({ ...prev, clienteAArchivar: cliente }));
    const iniciarEliminacionPermanente = (cliente) => setModals(prev => ({ ...prev, clienteAEliminar: cliente }));
    const iniciarRestauracion = (cliente) => setModals(prev => ({ ...prev, clienteARestaurar: cliente }));

    const iniciarTransferencia = (cliente) => {
        setModals(prev => ({ ...prev, clienteParaTransferir: cliente }));
    };

    const cerrarModalTransferencia = () => {
        setModals(prev => ({ ...prev, clienteParaTransferir: null }));
    };

    const confirmarArchivado = useCallback(async () => {
        if (!modals.clienteAArchivar) return;
        try {
            const nombreCompleto = `${modals.clienteAArchivar.datosCliente.nombres} ${modals.clienteAArchivar.datosCliente.apellidos}`;
            await inactivarCliente(modals.clienteAArchivar.id, nombreCompleto);
            toast.success("Cliente archivado con éxito.");
            recargarDatos();
        } catch (error) {
            toast.error("No se pudo archivar el cliente.");
        } finally {
            setModals(prev => ({ ...prev, clienteAArchivar: null }));
        }
    }, [modals.clienteAArchivar, recargarDatos]);

    const confirmarEliminacionPermanente = useCallback(async () => {
        if (!modals.clienteAEliminar) return;
        try {
            await deleteClientePermanently(modals.clienteAEliminar.id);
            toast.success("Cliente y su historial han sido eliminados permanentemente.");
            recargarDatos();
        } catch (error) { toast.error("No se pudo eliminar el cliente."); }
        finally { setModals(prev => ({ ...prev, clienteAEliminar: null })); }
    }, [modals.clienteAEliminar, recargarDatos]);

    const handleConfirmarMotivo = (motivo, observacion, fechaRenuncia, penalidadMonto, penalidadMotivo) => {
        setModals(prev => ({ ...prev, datosRenuncia: { cliente: prev.clienteARenunciar, motivo, observacion, fechaRenuncia, penalidadMonto, penalidadMotivo }, clienteARenunciar: null }));
    };

    const confirmarRenunciaFinal = useCallback(async () => {
        // CORRECCIÓN: Usamos modals.datosRenuncia en lugar de datosRenuncia
        if (!modals.datosRenuncia || !modals.datosRenuncia.cliente) return;
        setModals(prev => ({ ...prev, isSubmitting: true }));
        const { cliente, motivo, observacion, fechaRenuncia, penalidadMonto, penalidadMotivo } = modals.datosRenuncia;
        try {
            const { renunciaId, clienteNombre } = await renunciarAVivienda(cliente.id, motivo, observacion, fechaRenuncia, penalidadMonto, penalidadMotivo);
            toast.success("La renuncia se ha procesado correctamente.");
            await createNotification('renuncia', `Se registró una renuncia del cliente ${clienteNombre}.`, `/renuncias/detalle/${renunciaId}`);
            recargarDatos();
        } catch (error) { toast.error("No se pudo procesar la renuncia."); }
        finally { setModals(prev => ({ ...prev, datosRenuncia: null, isSubmitting: false })); }
    }, [modals.datosRenuncia, recargarDatos]);

    const confirmarRestauracion = useCallback(async () => {
        // CORRECCIÓN: Usamos modals.clienteARestaurar en lugar de clienteARestaurar
        if (!modals.clienteARestaurar) return;
        setModals(prev => ({ ...prev, isSubmitting: true }));
        try {
            await restaurarCliente(modals.clienteARestaurar.id);
            toast.success("El cliente ha sido restaurado con éxito.");
            recargarDatos();
        } catch (error) { toast.error("No se pudo restaurar el cliente."); }
        finally { setModals(prev => ({ ...prev, clienteARestaurar: null, isSubmitting: false })); }
    }, [modals.clienteARestaurar, recargarDatos]);

    return {
        isLoading,
        clientesVisibles: clientesPaginados,
        todosLosClientesFiltrados: clientesFiltrados,
        totalClientesEnSistema: todosLosClientes.length,
        statusFilter, setStatusFilter,
        proyectoFilter, setProyectoFilter,
        searchTerm, setSearchTerm, // Mantener searchTerm para el input
        debouncedSearchTerm, // Exponer para indicadores
        sortOrder, setSortOrder,
        pagination: {
            currentPage,
            totalPages,
            onPageChange: setCurrentPage
        },
        modals,
        projectOptions,
        handlers: {
            handleGuardado,
            iniciarArchivado,
            confirmarArchivado,
            iniciarEliminacionPermanente,
            confirmarEliminacionPermanente,
            iniciarRenuncia,
            handleConfirmarMotivo,
            confirmarRenunciaFinal,
            iniciarEdicion,
            iniciarReactivacion,
            iniciarRestauracion,
            confirmarRestauracion,
            setModals,
            iniciarTransferencia,
            limpiarFiltros,
            cerrarModalTransferencia
        }
    };
};