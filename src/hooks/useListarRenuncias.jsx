import { useState, useMemo, useCallback } from 'react';
import { useData } from '../context/DataContext';
import { cancelarRenuncia } from '../utils/storage';
import toast from 'react-hot-toast';

export const useListarRenuncias = () => {
    const { isLoading, renuncias, recargarDatos } = useData();
    const [statusFilter, setStatusFilter] = useState('Pendiente');

    const [renunciaADevolver, setRenunciaADevolver] = useState(null);
    const [renunciaAEditar, setRenunciaAEditar] = useState(null);
    const [renunciaACancelar, setRenunciaACancelar] = useState(null);

    const renunciasFiltradas = useMemo(() => {
        const sortedRenuncias = [...renuncias].sort((a, b) => new Date(b.fechaRenuncia) - new Date(a.fechaRenuncia));
        if (statusFilter === 'Todas') {
            return sortedRenuncias;
        }
        // --- INICIO DE LA CORRECCIÓN ---
        // Si el filtro es 'Cerrada', incluimos también los registros antiguos 'Pagada'.
        if (statusFilter === 'Cerrada') {
            return sortedRenuncias.filter(r => r.estadoDevolucion === 'Cerrada' || r.estadoDevolucion === 'Pagada');
        }
        // --- FIN DE LA CORRECCIÓN ---
        return sortedRenuncias.filter(r => r.estadoDevolucion === statusFilter);
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
            toast.error("No se pudo cancelar la renuncia.");
            console.error("Error al cancelar renuncia:", error);
        } finally {
            setRenunciaACancelar(null);
        }
    }, [renunciaACancelar, recargarDatos]);

    return {
        isLoading,
        renunciasFiltradas,
        statusFilter,
        setStatusFilter,
        modals: {
            renunciaADevolver,
            setRenunciaADevolver,
            renunciaAEditar,
            setRenunciaAEditar,
            renunciaACancelar,
            setRenunciaACancelar
        },
        handlers: {
            handleSave,
            confirmarCancelacion
        }
    };
};