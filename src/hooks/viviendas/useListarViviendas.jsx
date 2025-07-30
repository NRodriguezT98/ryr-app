import { useState, useMemo, useCallback } from "react";
import { useLocation } from 'react-router-dom';
import { useData } from "../../context/DataContext";
import { useUndoableDelete } from "../useUndoableDelete";
import { deleteViviendaPermanently } from "../../utils/storage";
import toast from 'react-hot-toast';

export const useListarViviendas = () => {
    const location = useLocation();
    const { isLoading, viviendas, clientes, abonos, recargarDatos } = useData();

    const initialStateFromLink = location.state?.statusFilter || 'todas';
    const [statusFilter, setStatusFilter] = useState(initialStateFromLink);
    const [searchTerm, setSearchTerm] = useState('');

    const viviendasFiltradasYOrdenadas = useMemo(() => {
        return viviendas.map(vivienda => {
            const clienteAsignado = clientes.find(c => c.id === vivienda.clienteId);
            const procesoFinalizado = clienteAsignado?.proceso?.facturaVenta?.completado === true;
            const tieneHistorialDeAbonos = abonos.some(a => a.viviendaId === vivienda.id);

            return {
                ...vivienda,
                puedeEditar: !procesoFinalizado,
                puedeEliminar: !vivienda.clienteId && !tieneHistorialDeAbonos,
                camposFinancierosBloqueados: !!vivienda.clienteId
            };
        }).filter(vivienda => {
            if (statusFilter === 'disponibles') return !vivienda.clienteId;
            if (statusFilter === 'asignadas') return vivienda.clienteId && vivienda.saldoPendiente > 0;
            if (statusFilter === 'pagadas') return vivienda.clienteId && vivienda.saldoPendiente <= 0;
            return true;
        }).filter(vivienda => {
            if (!searchTerm) return true;
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            return (
                vivienda.manzana.toLowerCase().includes(lowerCaseSearchTerm) ||
                vivienda.numeroCasa.toString().includes(lowerCaseSearchTerm) ||
                (vivienda.matricula || '').toLowerCase().includes(lowerCaseSearchTerm) ||
                (vivienda.clienteNombre || '').toLowerCase().includes(lowerCaseSearchTerm)
            );
        }).sort((a, b) => a.manzana.localeCompare(b.manzana) || a.numeroCasa - b.numeroCasa);
    }, [viviendas, clientes, abonos, statusFilter, searchTerm]);

    const { hiddenItems: viviendasOcultas, initiateDelete } = useUndoableDelete(
        async (vivienda) => deleteViviendaPermanently(vivienda.id),
        recargarDatos,
        "Vivienda"
    );
    const viviendasVisibles = viviendasFiltradasYOrdenadas.filter(v => !viviendasOcultas.includes(v.id));

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
        todasLasViviendas: viviendas,
        filters: {
            statusFilter, setStatusFilter,
            searchTerm, setSearchTerm
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