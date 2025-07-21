import { useState, useMemo, useCallback, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { deleteCliente, renunciarAVivienda, reactivarCliente, createNotification } from '../../utils/storage';
import toast from 'react-hot-toast';
import UndoToast from '../../components/UndoToast';

export const useListarClientes = () => {
    const { isLoading, clientes, renuncias, recargarDatos } = useData();

    // Estados para modales
    const [clienteAEditar, setClienteAEditar] = useState(null);
    const [clienteAEliminar, setClienteAEliminar] = useState(null);
    const [clienteARenunciar, setClienteARenunciar] = useState(null);
    const [clienteAReactivar, setClienteAReactivar] = useState(null);
    const [datosRenuncia, setDatosRenuncia] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Estados para filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('activo');

    const [clientesOcultos, setClientesOcultos] = useState([]);
    const deletionTimeouts = useRef({});

    const clientesFiltrados = useMemo(() => {
        let itemsProcesados = clientes.map(cliente => {
            const renunciaPendiente = renuncias.find(r => r.clienteId === cliente.id && r.estadoDevolucion === 'Pendiente');
            return { ...cliente, tieneRenunciaPendiente: !!renunciaPendiente };
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
    }, [clientes, renuncias, searchTerm, statusFilter]);

    const clientesVisibles = clientesFiltrados.filter(c => !clientesOcultos.includes(c.id));

    const handleGuardado = useCallback(() => { recargarDatos(); setClienteAEditar(null); }, [recargarDatos]);
    const iniciarRenuncia = (cliente) => setClienteARenunciar(cliente);
    const iniciarReactivacion = (cliente) => setClienteAReactivar(cliente);
    const iniciarEliminacion = (cliente) => {
        // --- LÓGICA A AÑADIR ---
        const renunciaAsociada = renuncias.find(r => r.clienteId === cliente.id);
        if (renunciaAsociada) {
            toast.error("No se puede eliminar: el cliente tiene un historial de renuncias.");
            return;
        }
        // --- FIN DE LA LÓGICA ---
        setClienteAEliminar(cliente);
    };

    const handleConfirmarMotivo = (motivo, observacion, fechaRenuncia) => {
        setDatosRenuncia({ cliente: clienteARenunciar, motivo, observacion, fechaRenuncia });
        setClienteARenunciar(null);
    };

    const confirmarRenunciaFinal = useCallback(async () => {
        if (!datosRenuncia || !datosRenuncia.cliente) return;
        setIsSubmitting(true);
        const { cliente, motivo, observacion, fechaRenuncia } = datosRenuncia;
        try {
            const { renunciaId, clienteNombre } = await renunciarAVivienda(cliente.id, cliente.viviendaId, motivo, observacion, fechaRenuncia);
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

    const confirmarReactivacion = useCallback(async () => {
        if (!clienteAReactivar) return;
        setIsSubmitting(true);
        try {
            await reactivarCliente(clienteAReactivar.id);
            toast.success("El cliente ha sido reactivado.");
            recargarDatos();
        } catch (error) {
            toast.error("No se pudo reactivar el cliente.");
        } finally {
            setClienteAReactivar(null);
            setIsSubmitting(false);
        }
    }, [clienteAReactivar, recargarDatos]);

    const confirmarEliminarReal = useCallback(async (id) => {
        try {
            await deleteCliente(id);
            recargarDatos();
        } catch (error) {
            toast.error("No se pudo eliminar el cliente.");
            setClientesOcultos(prev => prev.filter(cId => cId !== id));
        }
    }, [recargarDatos]);

    const deshacerEliminacion = useCallback((id) => {
        clearTimeout(deletionTimeouts.current[id]);
        delete deletionTimeouts.current[id];
        setClientesOcultos(prev => prev.filter(cId => cId !== id));
        toast.success("Eliminación deshecha.");
    }, []);

    const confirmarEliminar = useCallback(() => {
        if (!clienteAEliminar) return;
        const id = clienteAEliminar.id;
        setClientesOcultos(prev => [...prev, id]);
        toast.custom((t) => (<UndoToast t={t} message="Cliente eliminado" onUndo={() => deshacerEliminacion(id)} />), { duration: 5000 });
        const timeoutId = setTimeout(() => confirmarEliminarReal(id), 5000);
        deletionTimeouts.current[id] = timeoutId;
        setClienteAEliminar(null);
    }, [clienteAEliminar, deshacerEliminacion, confirmarEliminarReal]);

    return {
        isLoading,
        clientesVisibles,
        statusFilter, setStatusFilter,
        searchTerm, setSearchTerm,
        modals: { clienteAEditar, setClienteAEditar, clienteAEliminar, setClienteAEliminar, clienteARenunciar, setClienteARenunciar, clienteAReactivar, setClienteAReactivar, datosRenuncia, setDatosRenuncia, isSubmitting },
        handlers: { handleGuardado, iniciarEliminacion, iniciarReactivacion, iniciarRenuncia, handleConfirmarMotivo, confirmarRenunciaFinal, confirmarReactivacion, confirmarEliminar }
    };
};