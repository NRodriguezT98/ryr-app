import { useState, useMemo, useCallback, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { deleteAbono } from '../../utils/storage';
import toast from 'react-hot-toast';
import UndoToast from '../../components/UndoToast';

export const useGestionarAbonos = () => {
    const { isLoading: isDataLoading, clientes, viviendas, abonos, recargarDatos } = useData();
    const [selectedClienteId, setSelectedClienteId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const [abonoAEditar, setAbonoAEditar] = useState(null);
    const [abonoAEliminar, setAbonoAEliminar] = useState(null);
    const [abonosOcultos, setAbonosOcultos] = useState([]);
    const deletionTimeouts = useRef({});

    const datosClienteSeleccionado = useMemo(() => {
        if (!selectedClienteId || isDataLoading) {
            return null;
        }

        const cliente = clientes.find(c => c.id === selectedClienteId);
        if (!cliente) return null;

        const vivienda = viviendas.find(v => v.id === cliente.viviendaId);
        if (!vivienda) return { data: { cliente, vivienda: null, historial: [], fuentes: [] } };

        const historial = abonos
            .filter(a => a.clienteId === selectedClienteId)
            .sort((a, b) => new Date(b.fechaPago) - new Date(a.fechaPago));

        const fuentes = [];
        if (cliente.financiero) {
            const { financiero } = cliente;
            const crearFuente = (titulo, fuente, montoPactado) => ({
                titulo, fuente, montoPactado, abonos: historial.filter(a => a.fuente === fuente)
            });
            if (financiero.aplicaCuotaInicial) fuentes.push(crearFuente("Cuota Inicial", "cuotaInicial", financiero.cuotaInicial.monto || 0));
            if (financiero.aplicaCredito) fuentes.push(crearFuente("Crédito Hipotecario", "credito", financiero.credito.monto || 0));
            if (financiero.aplicaSubsidioVivienda) fuentes.push(crearFuente("Subsidio Mi Casa Ya", "subsidioVivienda", financiero.subsidioVivienda.monto || 0));
            if (financiero.aplicaSubsidioCaja) fuentes.push(crearFuente(`Subsidio Caja (${financiero.subsidioCaja.caja || 'N/A'})`, "subsidioCaja", financiero.subsidioCaja.monto || 0));
        }

        return {
            data: {
                cliente,
                vivienda,
                historial,
                fuentes
            }
        };
    }, [selectedClienteId, clientes, viviendas, abonos, isDataLoading]);

    const isLoading = isDataLoading;

    const clientesConVivienda = useMemo(() => clientes.filter(c => c.vivienda && c.status === 'activo'), [clientes]);

    const clientesFiltrados = useMemo(() => {
        // --- LÓGICA DE FILTRADO Y ORDENACIÓN MEJORADA ---
        const clientesActivos = clientes.filter(c => c.vivienda && c.status === 'activo');

        const filtrados = searchTerm.trim()
            ? clientesActivos.filter(c => {
                const nombreCompleto = `${c.datosCliente.nombres} ${c.datosCliente.apellidos}`.toLowerCase();
                const ubicacion = `mz ${c.vivienda.manzana} casa ${c.vivienda.numeroCasa}`.toLowerCase().replace(/\s/g, '');
                const cedula = c.datosCliente.cedula;
                return nombreCompleto.includes(searchTerm.toLowerCase()) || ubicacion.includes(searchTerm.toLowerCase().replace(/\s/g, '')) || cedula.includes(searchTerm);
            })
            : clientesActivos;

        return filtrados.sort((a, b) => {
            const manzanaComp = a.vivienda.manzana.localeCompare(b.vivienda.manzana);
            if (manzanaComp !== 0) return manzanaComp;
            return a.vivienda.numeroCasa - b.vivienda.numeroCasa;
        });
    }, [clientes, searchTerm]);

    const handleGuardadoEdicion = useCallback(() => {
        recargarDatos();
        setAbonoAEditar(null);
    }, [recargarDatos]);

    const iniciarEliminacion = (abono) => setAbonoAEliminar(abono);

    const confirmarEliminarReal = async (abono) => {
        try {
            await deleteAbono(abono);
            recargarDatos();
        } catch (error) {
            toast.error("No se pudo eliminar el abono.");
            setAbonosOcultos(prev => prev.filter(aId => aId !== abono.id));
        }
    };

    const deshacerEliminacion = (id) => {
        clearTimeout(deletionTimeouts.current[id]);
        delete deletionTimeouts.current[id];
        setAbonosOcultos(prev => prev.filter(aId => aId !== id));
        toast.success("Eliminación deshecha.");
    };

    const confirmarEliminar = () => {
        if (!abonoAEliminar) return;
        const id = abonoAEliminar.id;
        setAbonosOcultos(prev => [...prev, id]);
        toast.custom((t) => (<UndoToast t={t} message="Abono eliminado" onUndo={() => deshacerEliminacion(id)} />), { duration: 5000 });
        const timeoutId = setTimeout(() => confirmarEliminarReal(abonoAEliminar), 5000);
        deletionTimeouts.current[id] = timeoutId;
        setAbonoAEliminar(null);
    };

    return {
        isLoading,
        searchTerm, setSearchTerm,
        clientesFiltrados,
        selectedClienteId, setSelectedClienteId,
        datosClienteSeleccionado,
        abonosOcultos,
        modals: {
            abonoAEditar, setAbonoAEditar,
            abonoAEliminar, setAbonoAEliminar
        },
        handlers: {
            recargarDatos,
            handleGuardadoEdicion,
            iniciarEliminacion,
            confirmarEliminar
        }
    };
};