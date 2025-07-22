import { useState, useMemo, useCallback } from "react";
import { useLocation } from 'react-router-dom';
import { useData } from "../../context/DataContext";
import { useUndoableDelete } from "../useUndoableDelete";
import { deleteVivienda } from "../../utils/storage";
import toast from 'react-hot-toast';

export const useListarViviendas = () => {
    const location = useLocation();
    const { isLoading, viviendas, clientes, renuncias, recargarDatos } = useData();

    const initialStateFromLink = location.state?.statusFilter || 'todas';
    const [statusFilter, setStatusFilter] = useState(initialStateFromLink);
    const [searchTerm, setSearchTerm] = useState('');

    const viviendasFiltradasYOrdenadas = useMemo(() => {
        let itemsProcesados = viviendas.map(vivienda => {
            const clienteAsignado = clientes.find(c => c.id === vivienda.clienteId);

            // --- INICIO DE LA MODIFICACIÓN ---
            const procesoFinalizado = clienteAsignado?.proceso?.facturaVenta?.completado === true;
            const viviendaPagada = vivienda.saldoPendiente <= 0;
            const tieneHistorial = !!vivienda.clienteId || renuncias.some(r => r.viviendaId === vivienda.id);

            return {
                ...vivienda,
                puedeEditar: !procesoFinalizado,
                puedeEliminar: !tieneHistorial,
                puedeAplicarDescuento: !procesoFinalizado && !viviendaPagada, // La nueva lógica
                camposFinancierosBloqueados: !!vivienda.clienteId
            };
            // --- FIN DE LA MODIFICACIÓN ---
        });

        switch (statusFilter) {
            case 'disponibles':
                itemsProcesados = itemsProcesados.filter(v => !v.clienteId);
                break;
            case 'asignadas':
                itemsProcesados = itemsProcesados.filter(v => v.clienteId && v.saldoPendiente > 0);
                break;
            case 'pagadas':
                itemsProcesados = itemsProcesados.filter(v => v.clienteId && v.saldoPendiente <= 0);
                break;
            default:
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
    }, [viviendas, clientes, renuncias, statusFilter, searchTerm]);

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
        if (!vivienda.puedeEliminar) {
            toast.error("No se puede eliminar: la vivienda tiene un historial de clientes.");
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