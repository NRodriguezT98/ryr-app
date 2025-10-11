import { useState, useMemo, useCallback } from 'react';
import { useData } from '../../context/DataContext';
import { cancelarRenuncia } from "../../services/renunciaService";
import toast from 'react-hot-toast';
import { useDebounce } from '../useDebounce';

export const useListarRenuncias = () => {
    const { isLoading, renuncias, recargarDatos } = useData();

    const [statusFilter, setStatusFilter] = useState('Pendiente');
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [motivoFiltro, setMotivoFiltro] = useState(null);

    const [modals, setModals] = useState({
        renunciaADevolver: null,
        renunciaACancelar: null,
        isSubmitting: false,
    });

    const renunciasFiltradas = useMemo(() => {
        let itemsProcesados = [...renuncias].sort((a, b) => (b.timestamp?.toMillis() || 0) - (a.timestamp?.toMillis() || 0));
        if (statusFilter !== 'Todas') {
            if (statusFilter === 'Cerrada') {
                itemsProcesados = itemsProcesados.filter(r => r.estadoDevolucion === 'Cerrada' || r.estadoDevolucion === 'Pagada');
            } else {
                itemsProcesados = itemsProcesados.filter(r => r.estadoDevolucion === statusFilter);
            }
        }
        if (debouncedSearchTerm.trim()) {
            const lower = debouncedSearchTerm.toLowerCase();
            itemsProcesados = itemsProcesados.filter(r => r.clienteNombre.toLowerCase().includes(lower) || r.viviendaInfo.toLowerCase().replace(/\s/g, '').includes(lower.replace(/\s/g, '')));
        }
        if (fechaInicio) itemsProcesados = itemsProcesados.filter(r => r.fechaRenuncia >= fechaInicio);
        if (fechaFin) itemsProcesados = itemsProcesados.filter(r => r.fechaRenuncia <= fechaFin);
        if (motivoFiltro) itemsProcesados = itemsProcesados.filter(r => r.motivo === motivoFiltro.value);
        return itemsProcesados;
    }, [renuncias, statusFilter, debouncedSearchTerm, fechaInicio, fechaFin, motivoFiltro]);

    // --- HANDLERS (Manejadores de eventos y acciones) ---
    const handleSave = useCallback(() => {
        recargarDatos();
        setModals(prev => ({ ...prev, renunciaADevolver: null }));
    }, [recargarDatos]);

    const iniciarCancelacion = (renuncia) => {
        setModals(prev => ({ ...prev, renunciaACancelar: renuncia }));
    };

    const confirmarCancelacion = useCallback(async (motivo) => { // Acepta el motivo
        if (!modals.renunciaACancelar) return;

        setModals(prev => ({ ...prev, isSubmitting: true }));

        try {
            // Pasamos el motivo al servicio
            await cancelarRenuncia(modals.renunciaACancelar, motivo);
            toast.success("La renuncia ha sido cancelada exitosamente.");
            recargarDatos();
        } catch (error) {
            if (error.message === 'VIVIENDA_NO_DISPONIBLE') {
                toast.error("No se puede cancelar la renuncia: la vivienda ya ha sido asignada a otro cliente.");
            } else {
                toast.error("No se pudo cancelar la renuncia.");
                console.error("Error al cancelar renuncia:", error);
            }
        } finally {
            // Reseteamos el estado de forma limpia
            setModals(prev => ({ ...prev, renunciaACancelar: null, isSubmitting: false }));
        }
    }, [modals.renunciaACancelar, recargarDatos]);

    return {
        isLoading,
        renunciasFiltradas,
        filters: {
            statusFilter, setStatusFilter,
            searchTerm, setSearchTerm,
            fechaInicio, setFechaInicio,
            fechaFin, setFechaFin,
            motivoFiltro, setMotivoFiltro
        },
        modals,
        handlers: {
            handleSave,
            confirmarCancelacion,
            iniciarCancelacion, // Exponemos el nuevo handler para abrir la modal
            setModals
        }
    };
};