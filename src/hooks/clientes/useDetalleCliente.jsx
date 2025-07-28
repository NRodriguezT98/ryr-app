import { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import toast from 'react-hot-toast';

export const useDetalleCliente = () => {
    const { clienteId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { clientes, abonos, renuncias, isLoading, recargarDatos } = useData();

    const [activeTab, setActiveTab] = useState(location.state?.defaultTab || 'info');

    const datosDetalle = useMemo(() => {
        if (isLoading || !clienteId) {
            return { isLoading: true, data: null };
        }

        const cliente = clientes.find(c => c.id === clienteId);
        if (!cliente) return { isLoading: false, data: null };

        // --- INICIO DE LA MODIFICACIÓN ---
        // Buscamos la renuncia más reciente y determinamos si está pendiente.
        const renunciaAsociada = renuncias
            .filter(r => r.clienteId === cliente.id)
            .sort((a, b) => (b.timestamp?.toMillis() || 0) - (a.timestamp?.toMillis() || 0))[0] || null;

        const tieneRenunciaPendiente = renunciaAsociada?.estadoDevolucion === 'Pendiente';
        // --- FIN DE LA MODIFICACIÓN ---

        const historialAbonos = abonos
            .filter(a => a.clienteId === clienteId && a.estadoProceso === 'activo')
            .sort((a, b) => new Date(b.fechaPago) - new Date(a.fechaPago));

        return {
            isLoading: false,
            data: {
                // Añadimos la bandera 'tieneRenunciaPendiente' al objeto del cliente para que sea fácil de usar
                cliente: { ...cliente, tieneRenunciaPendiente },
                vivienda: cliente.vivienda,
                historialAbonos,
                renuncia: renunciaAsociada
            }
        };
    }, [clienteId, clientes, abonos, renuncias, isLoading]);

    useEffect(() => {
        if (!isLoading && !datosDetalle?.data) {
            toast.error("Cliente no encontrado.");
            navigate('/clientes/listar');
        }
    }, [isLoading, datosDetalle, navigate]);

    return {
        isLoading: datosDetalle?.isLoading ?? true,
        data: datosDetalle?.data,
        activeTab,
        setActiveTab,
        recargarDatos,
        navigate
    };
};