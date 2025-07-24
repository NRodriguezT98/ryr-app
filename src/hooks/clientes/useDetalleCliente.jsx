import { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import toast from 'react-hot-toast';

export const useDetalleCliente = () => {
    const { clienteId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { clientes, abonos, renuncias, isLoading, recargarDatos } = useData(); // Obtenemos las renuncias

    const [activeTab, setActiveTab] = useState(location.state?.defaultTab || 'info');

    const datosDetalle = useMemo(() => {
        if (isLoading || !clienteId) {
            return { isLoading: true, data: null };
        }

        const cliente = clientes.find(c => c.id === clienteId);

        if (!cliente) {
            return { isLoading: false, data: null };
        }

        // --- INICIO DE LA MODIFICACIÓN ---
        // Buscamos el registro de renuncia más reciente para este cliente
        const renunciaAsociada = renuncias
            .filter(r => r.clienteId === cliente.id)
            .sort((a, b) => new Date(b.fechaRenuncia) - new Date(a.fechaRenuncia))[0] || null;
        // --- FIN DE LA MODIFICACIÓN ---

        const historialAbonos = abonos
            .filter(a => a.clienteId === clienteId && a.estadoProceso === 'activo')
            .sort((a, b) => new Date(b.fechaPago) - new Date(a.fechaPago));

        return {
            isLoading: false,
            data: {
                cliente,
                vivienda: cliente.vivienda,
                historialAbonos,
                renuncia: renunciaAsociada // Devolvemos la renuncia encontrada
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