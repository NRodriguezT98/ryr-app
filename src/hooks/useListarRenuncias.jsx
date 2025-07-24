import { useState, useMemo, useCallback } from 'react';
import { useData } from '../context/DataContext';
import { cancelarRenuncia } from '../utils/storage';
import toast from 'react-hot-toast';

export const useListarRenuncias = () => {
    const { isLoading, renuncias, recargarDatos } = useData();

    // --- INICIO DE LA MODIFICACIÓN ---
    // Estados para los nuevos filtros
    const [statusFilter, setStatusFilter] = useState('Pendiente');
    const [searchTerm, setSearchTerm] = useState('');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [motivoFiltro, setMotivoFiltro] = useState(null);
    // --- FIN DE LA MODIFICACIÓN ---

    const [renunciaADevolver, setRenunciaADevolver] = useState(null);
    const [renunciaAEditar, setRenunciaAEditar] = useState(null);
    const [renunciaACancelar, setRenunciaACancelar] = useState(null);

    const renunciasFiltradas = useMemo(() => {
        let itemsProcesados = [...renuncias].sort((a, b) => new Date(b.fechaRenuncia) - new Date(a.fechaRenuncia));

        // 1. Filtrado por estado (Pendiente / Cerrada)
        if (statusFilter !== 'Todas') {
            if (statusFilter === 'Cerrada') {
                itemsProcesados = itemsProcesados.filter(r => r.estadoDevolucion === 'Cerrada' || r.estadoDevolucion === 'Pagada');
            } else {
                itemsProcesados = itemsProcesados.filter(r => r.estadoDevolucion === statusFilter);
            }
        }

        // 2. Filtrado por término de búsqueda
        if (searchTerm.trim()) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            itemsProcesados = itemsProcesados.filter(r =>
                r.clienteNombre.toLowerCase().includes(lowerCaseSearchTerm) ||
                r.viviendaInfo.toLowerCase().includes(lowerCaseSearchTerm)
            );
        }

        // 3. Filtrado por rango de fechas
        if (fechaInicio) {
            itemsProcesados = itemsProcesados.filter(r => r.fechaRenuncia >= fechaInicio);
        }
        if (fechaFin) {
            itemsProcesados = itemsProcesados.filter(r => r.fechaRenuncia <= fechaFin);
        }

        // 4. Filtrado por motivo
        if (motivoFiltro) {
            itemsProcesados = itemsProcesados.filter(r => r.motivo === motivoFiltro.value);
        }

        return itemsProcesados;
    }, [renuncias, statusFilter, searchTerm, fechaInicio, fechaFin, motivoFiltro]);

    const handleSave = useCallback(() => {
        recargarDatos();
        setRenunciaADevolver(null);
        setRenunciaAEditar(null);
    }, [recargarDatos]);

    const confirmarCancelacion = useCallback(async () => {
        if (!renunciaACancelar) return;
        try {
            await cancelarRenuncia(renunciaACancelar);
            toast.success("La renuncia ha sido cancelada exitosamente.");
            recargarDatos();
        } catch (error) {
            toast.error("No se pudo cancelar la renuncia.");
            console.error("Error al cancelar renuncia:", error);
        } finally {
            setRenunciaACancelar(null);
        }
    }, [renunciaACancelar, recargarDatos]);

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
        modals: {
            renunciaADevolver, setRenunciaADevolver,
            renunciaAEditar, setRenunciaAEditar,
            renunciaACancelar, setRenunciaACancelar
        },
        handlers: {
            handleSave,
            confirmarCancelacion
        }
    };
};