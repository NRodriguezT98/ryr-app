import { useState, useMemo, useCallback, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { useClienteFinanciero } from '../clientes/useClienteFinanciero';
import { deleteAbono } from '../../utils/storage';
import toast from 'react-hot-toast';
import UndoToast from '../../components/UndoToast';

export const useGestionarAbonos = () => {
    const { isLoading: isDataLoading, clientes, viviendas, recargarDatos } = useData();
    const [selectedClienteId, setSelectedClienteId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const [abonoAEditar, setAbonoAEditar] = useState(null);
    const [abonoAEliminar, setAbonoAEliminar] = useState(null);
    const [abonosOcultos, setAbonosOcultos] = useState([]);
    const deletionTimeouts = useRef({});

    // 1. Llamamos al hook de datos financieros desde aquí
    const { isLoading: isFinancialDataLoading, data: datosClienteSeleccionado } = useClienteFinanciero(selectedClienteId);

    // 2. Combinamos los estados de carga
    const isLoading = isDataLoading || (selectedClienteId && isFinancialDataLoading);

    // 3. Lógica de filtrado de clientes
    const clientesConVivienda = useMemo(() => clientes.filter(c => c.vivienda && c.status === 'activo'), [clientes]);

    const clientesFiltrados = useMemo(() => {
        if (!searchTerm.trim()) return [];
        const lowerCaseSearchTerm = searchTerm.toLowerCase().replace(/\s/g, '');
        return clientesConVivienda.filter(c => {
            const nombreCompleto = `${c.datosCliente.nombres} ${c.datosCliente.apellidos}`.toLowerCase();
            const ubicacion = `${c.vivienda.manzana}${c.vivienda.numeroCasa}`.toLowerCase().replace(/\s/g, '');
            return nombreCompleto.includes(searchTerm.toLowerCase()) || ubicacion.includes(lowerCaseSearchTerm);
        }).sort((a, b) => a.vivienda.manzana.localeCompare(b.vivienda.manzana) || a.vivienda.numeroCasa - b.vivienda.numeroCasa);
    }, [clientesConVivienda, searchTerm]);

    // 4. Lógica para manejar los abonos (edición, eliminación)
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

    // Devolvemos todo lo que el componente necesita
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