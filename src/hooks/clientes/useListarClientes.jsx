import { useState, useMemo, useCallback } from 'react';
import { useData } from '../../context/DataContext';
import { deleteClientePermanently, inactivarCliente, renunciarAVivienda, createNotification, restaurarCliente } from '../../utils/storage';
import toast from 'react-hot-toast';
import { PROCESO_CONFIG } from '../../utils/procesoConfig';

export const useListarClientes = () => {
    const { isLoading, clientes, abonos, recargarDatos } = useData();

    const [clienteAArchivar, setClienteAArchivar] = useState(null);
    const [clienteAEliminar, setClienteAEliminar] = useState(null);
    const [clienteARenunciar, setClienteARenunciar] = useState(null);
    const [clienteARestaurar, setClienteARestaurar] = useState(null);
    const [datosRenuncia, setDatosRenuncia] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [clienteEnModal, setClienteEnModal] = useState({ cliente: null, modo: null });

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('activo');

    const clientesFiltrados = useMemo(() => {
        let itemsProcesados = clientes.map(cliente => {
            const procesoFinalizado = cliente.proceso?.facturaVenta?.completado === true;
            const tieneAbonos = abonos.some(a => a.clienteId === cliente.id);
            return {
                ...cliente,
                puedeRenunciar: !procesoFinalizado,
                puedeEditar: !procesoFinalizado,
                puedeSerEliminado: !tieneAbonos
            };
        });

        if (statusFilter !== 'todos') {
            itemsProcesados = itemsProcesados.filter(c => c.status === statusFilter);
        }

        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            itemsProcesados = itemsProcesados.filter(c =>
                `${c.datosCliente?.nombres || ''} ${c.datosCliente?.apellidos || ''}`.toLowerCase().includes(lowerCaseSearchTerm) ||
                (c.datosCliente?.cedula || '').includes(searchTerm)
            );
        }

        return itemsProcesados.sort((a, b) => {
            const nameA = `${a.datosCliente?.nombres || ''} ${a.datosCliente?.apellidos || ''}`.toLowerCase();
            const nameB = `${b.datosCliente?.nombres || ''} ${b.datosCliente?.apellidos || ''}`.toLowerCase();
            return nameA.localeCompare(nameB);
        });
    }, [clientes, abonos, searchTerm, statusFilter]);

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
            await inactivarCliente(clienteAArchivar.id);
            toast.success("Cliente archivado con éxito.");
            recargarDatos();
        } catch (error) {
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
        clientesVisibles: clientesFiltrados,
        statusFilter, setStatusFilter,
        searchTerm, setSearchTerm,
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