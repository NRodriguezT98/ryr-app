import { useState, useMemo, useCallback } from "react";
import { useLocation } from 'react-router-dom';
import { useData } from "../../context/DataContext";
import { useUndoableDelete } from "../useUndoableDelete";
import { deleteVivienda } from "../../utils/storage";
import toast from 'react-hot-toast';

export const useListarViviendas = () => {
    const location = useLocation();
    const { isLoading, viviendas, recargarDatos } = useData();

    // El estado inicial ahora puede ser uno de los nuevos filtros
    const initialStateFromLink = location.state?.statusFilter || 'todas';
    const [statusFilter, setStatusFilter] = useState(initialStateFromLink);
    const [searchTerm, setSearchTerm] = useState('');

    const viviendasFiltradasYOrdenadas = useMemo(() => {
        let itemsProcesados = [...viviendas];

        // --- LÓGICA DE FILTRADO ACTUALIZADA ---
        switch (statusFilter) {
            case 'disponibles':
                itemsProcesados = itemsProcesados.filter(v => !v.clienteId);
                break;
            case 'asignadas':
                // Asignada = Tiene cliente Y su saldo pendiente es mayor a 0
                itemsProcesados = itemsProcesados.filter(v => v.clienteId && v.saldoPendiente > 0);
                break;
            case 'pagadas':
                // Pagada = Tiene cliente Y su saldo pendiente es 0 o menos
                itemsProcesados = itemsProcesados.filter(v => v.clienteId && v.saldoPendiente <= 0);
                break;
            case 'todas':
            default:
                // No se aplica ningún filtro de estado
                break;
        }

        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            itemsProcesados = itemsProcesados.filter(v =>
                v.manzana.toLowerCase().includes(lowerCaseSearchTerm) ||
                v.numeroCasa.toString().includes(lowerCaseSearchTerm) ||
                (v.matricula || '').toLowerCase().includes(lowerCaseSearchTerm) ||
                (v.clienteNombre || '').toLowerCase().includes(lowerCaseSearchTerm)
            );
        }

        return itemsProcesados.sort((a, b) => a.manzana.localeCompare(b.manzana) || a.numeroCasa - b.numeroCasa);
    }, [viviendas, statusFilter, searchTerm]);

    const { hiddenItems: viviendasOcultas, initiateDelete } = useUndoableDelete(
        async (vivienda) => deleteVivienda(vivienda.id),
        recargarDatos,
        "Vivienda"
    );
    const viviendasVisibles = viviendasFiltradasYOrdenadas.filter(v => !viviendasOcultas.includes(v.id));

    const [viviendaAEditar, setViviendaAEditar] = useState(null);
    const [viviendaAEliminar, setViviendaAEliminar] = useState(null);
    const [viviendaConDescuento, setViviendaConDescuento] = useState(null);

    const handleGuardado = useCallback(() => {
        recargarDatos();
        setViviendaAEditar(null);
        setViviendaConDescuento(null);
    }, [recargarDatos]);

    const handleIniciarEliminacion = (vivienda) => {
        if (vivienda.clienteId) {
            toast.error("No se puede eliminar: la vivienda ya tiene un cliente asignado.");
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
            viviendaAEliminar, setViviendaAEliminar,
            viviendaConDescuento, setViviendaConDescuento
        },
        handlers: {
            handleGuardado,
            handleIniciarEliminacion,
            confirmarEliminar
        }
    };
};