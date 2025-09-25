import { useState, useMemo, useCallback, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useClienteCardLogic } from './useClienteCardLogic';
import { deleteClientePermanently, inactivarCliente, renunciarAVivienda, restaurarCliente } from "../../services/clienteService";
import { createNotification } from "../../services/notificationService";
import toast from 'react-hot-toast';
import { PROCESO_CONFIG } from '../../utils/procesoConfig';

const ITEMS_PER_PAGE = 10;

export const useListarClientes = () => {
    const { isLoading, clientes, abonos, viviendas, proyectos, recargarDatos } = useData();

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('activo');
    const [proyectoFilter, setProyectoFilter] = useState('todos');
    const [sortOrder, setSortOrder] = useState('ubicacion');
    const [currentPage, setCurrentPage] = useState(1);

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

    const todosLosClientes = useMemo(() => {
        return clientes.map(cliente => {
            const viviendaAsignada = viviendas.find(v => v.id === cliente.viviendaId);
            const proyectoAsignado = viviendaAsignada ? proyectos.find(p => p.id === viviendaAsignada.proyectoId) : null;
            const procesoFinalizado = cliente.proceso?.facturaVenta?.completado === true;
            const tieneAbonos = abonos.some(a => a.clienteId === cliente.id);

            return {
                ...cliente,
                vivienda: viviendaAsignada,
                nombreProyecto: proyectoAsignado ? proyectoAsignado.nombre : null,
                puedeRenunciar: !procesoFinalizado,
                puedeEditar: !procesoFinalizado,
                puedeSerEliminado: !tieneAbonos
            };
        });
    }, [clientes, abonos, viviendas, proyectos]);

    const clientesFiltrados = useMemo(() => {
        // Enriquecemos cada cliente con los datos que la Card necesitará.
        // Este cálculo se hace una sola vez, en lugar de en cada render del componente.
        let itemsProcesados = [...todosLosClientes];

        if (proyectoFilter !== 'todos') {
            itemsProcesados = itemsProcesados.filter(c => c.vivienda?.proyectoId === proyectoFilter);
        }

        if (statusFilter !== 'todos') {
            itemsProcesados = itemsProcesados.filter(c => c.status === statusFilter);
        }

        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase().replace(/\s/g, '');
            itemsProcesados = itemsProcesados.filter(c => {
                const nombreCompleto = `${c.datosCliente?.nombres || ''} ${c.datosCliente?.apellidos || ''}`.toLowerCase();
                const cedula = (c.datosCliente?.cedula || '');
                const ubicacion = c.vivienda ? `${c.vivienda.manzana}${c.vivienda.numeroCasa}`.toLowerCase().replace(/\s/g, '') : '';
                return nombreCompleto.includes(searchTerm.toLowerCase()) || cedula.includes(lowerCaseSearchTerm) || (ubicacion && ubicacion.includes(lowerCaseSearchTerm));
            });
        }


        switch (sortOrder) {
            case 'fecha_reciente':
                itemsProcesados.sort((a, b) => new Date(b.datosCliente.fechaIngreso) - new Date(a.datosCliente.fechaIngreso));
                break;
            case 'saldo_desc':
                itemsProcesados.sort((a, b) => (b.vivienda?.saldoPendiente ?? -Infinity) - (a.vivienda?.saldoPendiente ?? -Infinity));
                break;
            case 'saldo_asc':
                itemsProcesados.sort((a, b) => (a.vivienda?.saldoPendiente ?? Infinity) - (b.vivienda?.saldoPendiente ?? Infinity));
                break;
            case 'valor_desc':
                itemsProcesados.sort((a, b) => (b.vivienda?.valorFinal || 0) - (a.vivienda?.valorFinal || 0));
                break;
            case 'valor_asc':
                itemsProcesados.sort((a, b) => (a.vivienda?.valorFinal || 0) - (b.vivienda?.valorFinal || 0));
                break;
            case 'nombre_asc':
                itemsProcesados.sort((a, b) => {
                    const nameA = `${a.datosCliente?.nombres || ''} ${a.datosCliente?.apellidos || ''}`.toLowerCase();
                    const nameB = `${b.datosCliente?.nombres || ''} ${b.datosCliente?.apellidos || ''}`.toLowerCase();
                    return nameA.localeCompare(nameB);
                });
                break;
            case 'ubicacion':
            default:
                itemsProcesados.sort((a, b) => {
                    const viviendaA = a.vivienda;
                    const viviendaB = b.vivienda;
                    if (!viviendaA && !viviendaB) return 0;
                    if (!viviendaA) return 1;
                    if (!viviendaB) return -1;
                    return viviendaA.manzana.localeCompare(viviendaB.manzana) || viviendaA.numeroCasa - viviendaB.numeroCasa;
                });
                break;
        }

        return itemsProcesados;
    }, [todosLosClientes, searchTerm, statusFilter, proyectoFilter, sortOrder]);

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
        searchTerm, setSearchTerm,
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