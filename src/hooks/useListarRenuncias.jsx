import { useState, useMemo, useCallback } from 'react';
import { useData } from '../context/DataContext';
import { cancelarRenuncia } from '../utils/storage';
import toast from 'react-hot-toast';

export const useListarRenuncias = () => {
    const { isLoading, renuncias, recargarDatos } = useData();
    const [statusFilter, setStatusFilter] = useState('Pendiente');
    const [searchTerm, setSearchTerm] = useState('');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [motivoFiltro, setMotivoFiltro] = useState(null);

    const [renunciaADevolver, setRenunciaADevolver] = useState(null);
    const [renunciaAEditar, setRenunciaAEditar] = useState(null);
    const [renunciaACancelar, setRenunciaACancelar] = useState(null);

    const renunciasFiltradas = useMemo(() => {
        let itemsProcesados = [...renuncias].sort((a, b) => new Date(b.fechaRenuncia) - new Date(a.fechaRenuncia));
        if (statusFilter === 'Todas') {
            return itemsProcesados;
        }
        if (statusFilter === 'Cerrada') {
            return itemsProcesados.filter(r => r.estadoDevolucion === 'Cerrada' || r.estadoDevolucion === 'Pagada');
        }
        return itemsProcesados.filter(r => r.estadoDevolucion === statusFilter);
    }, [renuncias, statusFilter]);

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
            if (error.message === 'VIVIENDA_NO_DISPONIBLE') {
                toast.error("No se puede cancelar la renuncia: la vivienda ya ha sido asignada a otro cliente, por lo que no puede ser reasignada, debe terminar el proceso de renuncia.");
            } else {
                toast.error("No se pudo cancelar la renuncia.");
            }
            // --- INICIO DE LA MODIFICACIÓN ---
            // Simplemente eliminamos el console.error para no mostrar el error técnico.
            // console.error("Error al cancelar renuncia:", error);
            // --- FIN DE LA MODIFICACIÓN ---
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