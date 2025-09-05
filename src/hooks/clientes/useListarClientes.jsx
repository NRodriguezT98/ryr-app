import { useState, useMemo, useCallback, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { deleteClientePermanently, inactivarCliente, renunciarAVivienda, restaurarCliente } from "../../services/clienteService";
import { createNotification } from "../../services/notificationService";
import toast from 'react-hot-toast';
import { PROCESO_CONFIG } from '../../utils/procesoConfig';

const ITEMS_PER_PAGE = 10;

export const useListarClientes = () => {
    const { isLoading, clientes, abonos, viviendas, proyectos, recargarDatos } = useData();

    const [clienteAArchivar, setClienteAArchivar] = useState(null);
    const [clienteAEliminar, setClienteAEliminar] = useState(null);
    const [clienteARenunciar, setClienteARenunciar] = useState(null);
    const [clienteARestaurar, setClienteARestaurar] = useState(null);
    const [datosRenuncia, setDatosRenuncia] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [clienteEnModal, setClienteEnModal] = useState({ cliente: null, modo: null });

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('activo');
    const [proyectoFilter, setProyectoFilter] = useState('todos');
    const [sortOrder, setSortOrder] = useState('ubicacion');
    const [currentPage, setCurrentPage] = useState(1);

    const clientesFiltrados = useMemo(() => {
        let itemsProcesados = clientes.map(cliente => {
            const viviendaAsignada = viviendas.find(v => v.id === cliente.viviendaId);
            const procesoFinalizado = cliente.proceso?.facturaVenta?.completado === true;
            const tieneAbonos = abonos.some(a => a.clienteId === cliente.id);
            return {
                ...cliente,
                vivienda: viviendaAsignada,
                puedeRenunciar: !procesoFinalizado,
                puedeEditar: !procesoFinalizado,
                puedeSerEliminado: !tieneAbonos
            };
        });

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
    }, [clientes, abonos, viviendas, searchTerm, statusFilter, proyectoFilter, sortOrder]);

    const totalPages = useMemo(() => Math.ceil(clientesFiltrados.length / ITEMS_PER_PAGE), [clientesFiltrados]);

    const clientesPaginados = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return clientesFiltrados.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [currentPage, clientesFiltrados]);

    useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter, searchTerm, sortOrder, proyectoFilter]);

    const handleGuardado = useCallback(() => {
        recargarDatos();
        setClienteEnModal({ cliente: null, modo: null });
    }, [recargarDatos]);

    const iniciarRenuncia = (cliente) => {
        if (!cliente.puedeRenunciar) {
            toast.error("No se puede iniciar la renuncia: el cliente ya ha superado un hito clave en el proceso.");
            return;
        }
        setClienteARenunciar(cliente);
    };

    const iniciarEdicion = (cliente) => setClienteEnModal({ cliente, modo: 'editar' });
    const iniciarReactivacion = (cliente) => setClienteEnModal({ cliente, modo: 'reactivar' });

    const iniciarArchivado = (cliente) => {
        setClienteAArchivar(cliente);
    };

    const confirmarArchivado = useCallback(async () => {
        if (!clienteAArchivar) return;
        try {
            // --- INICIO DE LA CORRECCIÓN ---
            // 1. Construimos el nombre completo a partir del objeto del cliente.
            const nombreCompleto = `${clienteAArchivar.datosCliente.nombres} ${clienteAArchivar.datosCliente.apellidos}`;

            // 2. Pasamos el ID y el nombre completo a la función.
            await inactivarCliente(clienteAArchivar.id, nombreCompleto);
            // --- FIN DE LA CORRECCIÓN ---

            toast.success("Cliente archivado con éxito.");
            recargarDatos();
        } catch (error) {
            console.error("Error al archivar cliente:", error); // Es bueno loguear el error real.
            toast.error("No se pudo archivar el cliente.");
        } finally {
            setClienteAArchivar(null);
        }
    }, [clienteAArchivar, recargarDatos]);

    const iniciarEliminacionPermanente = (cliente) => {
        setClienteAEliminar(cliente);
    };

    const confirmarEliminacionPermanente = useCallback(async () => {
        if (!clienteAEliminar) return;
        try {
            await deleteClientePermanently(clienteAEliminar.id);
            toast.success("Cliente y su historial han sido eliminados permanentemente.");
            recargarDatos();
        } catch (error) {
            toast.error("No se pudo eliminar el cliente.");
        } finally {
            setClienteAEliminar(null);
        }
    }, [clienteAEliminar, recargarDatos]);

    const handleConfirmarMotivo = (motivo, observacion, fechaRenuncia, penalidadMonto, penalidadMotivo) => {
        setDatosRenuncia({ cliente: clienteARenunciar, motivo, observacion, fechaRenuncia, penalidadMonto, penalidadMotivo });
        setClienteARenunciar(null);
    };

    const confirmarRenunciaFinal = useCallback(async () => {
        if (!datosRenuncia || !datosRenuncia.cliente) return;
        setIsSubmitting(true);
        const { cliente, motivo, observacion, fechaRenuncia, penalidadMonto, penalidadMotivo } = datosRenuncia;
        try {
            const { renunciaId, clienteNombre } = await renunciarAVivienda(
                cliente.id, motivo, observacion, fechaRenuncia, penalidadMonto, penalidadMotivo
            );
            toast.success("La renuncia se ha procesado correctamente.");
            await createNotification('renuncia', `Se registró una renuncia del cliente ${clienteNombre}.`, `/renuncias/detalle/${renunciaId}`);
            recargarDatos();
        } catch (error) {
            toast.error("No se pudo procesar la renuncia.");
        } finally {
            setDatosRenuncia(null);
            setIsSubmitting(false);
        }
    }, [datosRenuncia, recargarDatos]);

    const iniciarRestauracion = (cliente) => {
        setClienteARestaurar(cliente);
    };

    const confirmarRestauracion = useCallback(async () => {
        if (!clienteARestaurar) return;
        setIsSubmitting(true);
        try {
            await restaurarCliente(clienteARestaurar.id);
            toast.success("El cliente ha sido restaurado con éxito.");
            recargarDatos();
        } catch (error) {
            toast.error("No se pudo restaurar el cliente.");
        } finally {
            setClienteARestaurar(null);
            setIsSubmitting(false);
        }
    }, [clienteARestaurar, recargarDatos]);

    return {
        isLoading,
        clientesVisibles: clientesPaginados,
        todosLosClientesFiltrados: clientesFiltrados,
        statusFilter, setStatusFilter,
        proyectoFilter, setProyectoFilter,
        searchTerm, setSearchTerm,
        sortOrder, setSortOrder,
        pagination: {
            currentPage,
            totalPages,
            onPageChange: setCurrentPage
        },
        modals: {
            clienteAArchivar, setClienteAArchivar,
            clienteAEliminar, setClienteAEliminar,
            clienteARenunciar, setClienteARenunciar,
            datosRenuncia, setDatosRenuncia,
            isSubmitting,
            clienteEnModal, setClienteEnModal,
            clienteARestaurar, setClienteARestaurar
        },
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
            confirmarRestauracion
        }
    };
};