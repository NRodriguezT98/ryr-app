import { useState, useMemo, useCallback } from 'react';
import { useData } from '../../context/DataContext';
import { cancelarRenuncia } from "../../services/renunciaService";
import toast from 'react-hot-toast';

export const useListarRenuncias = () => {
    const { isLoading, renuncias, recargarDatos } = useData();

    const [statusFilter, setStatusFilter] = useState('Pendiente');
    const [searchTerm, setSearchTerm] = useState('');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [motivoFiltro, setMotivoFiltro] = useState(null);

    const [renunciaADevolver, setRenunciaADevolver] = useState(null);
    const [renunciaACancelar, setRenunciaACancelar] = useState(null);

    const renunciasFiltradas = useMemo(() => {
        let itemsProcesados = [...renuncias].sort((a, b) => (b.timestamp?.toMillis() || 0) - (a.timestamp?.toMillis() || 0));

        if (statusFilter !== 'Todas') {
            if (statusFilter === 'Cerrada') {
                itemsProcesados = itemsProcesados.filter(r => r.estadoDevolucion === 'Cerrada' || r.estadoDevolucion === 'Pagada');
            } else {
                itemsProcesados = itemsProcesados.filter(r => r.estadoDevolucion === statusFilter);
            }
        }

        if (searchTerm.trim()) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            itemsProcesados = itemsProcesados.filter(r =>
                r.clienteNombre.toLowerCase().includes(lowerCaseSearchTerm) ||
                r.viviendaInfo.toLowerCase().replace(/\s/g, '').includes(lowerCaseSearchTerm.replace(/\s/g, ''))
            );
        }

        if (fechaInicio) {
            itemsProcesados = itemsProcesados.filter(r => r.fechaRenuncia >= fechaInicio);
        }
        if (fechaFin) {
            itemsProcesados = itemsProcesados.filter(r => r.fechaRenuncia <= fechaFin);
        }

        if (motivoFiltro) {
            itemsProcesados = itemsProcesados.filter(r => r.motivo === motivoFiltro.value);
        }

        return itemsProcesados;
    }, [renuncias, statusFilter, searchTerm, fechaInicio, fechaFin, motivoFiltro]);

    const handleSave = useCallback(() => {
        recargarDatos();
        setRenunciaADevolver(null);
    }, [recargarDatos]);

    const confirmarCancelacion = useCallback(async () => {
        if (!renunciaACancelar) return;
        try {
            await cancelarRenuncia(renunciaACancelar);
            toast.success("La renuncia ha sido cancelada exitosamente.");
            recargarDatos();
        } catch (error) {
            if (error.message === 'VIVIENDA_NO_DISPONIBLE') {
                toast.error("No se puede cancelar la renuncia: la vivienda ya ha sido asignada a otro cliente.");
            } else {
                toast.error("No se pudo cancelar la renuncia.");
            }
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
            renunciaACancelar, setRenunciaACancelar
        },
        handlers: {
            handleSave,
            confirmarCancelacion
        }
    };
};