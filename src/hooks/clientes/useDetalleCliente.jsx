import { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import toast from 'react-hot-toast';
import { DOCUMENTACION_CONFIG } from '../../utils/documentacionConfig'; // <-- 1. Importamos la configuración

export const useDetalleCliente = () => {
    const { clienteId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { clientes, abonos, isLoading, recargarDatos } = useData();

    const [activeTab, setActiveTab] = useState(location.state?.defaultTab || 'info');

    const datosDetalle = useMemo(() => {
        if (isLoading || !clienteId) {
            return { isLoading: true, data: null };
        }

        const cliente = clientes.find(c => c.id === clienteId);

        if (!cliente) {
            return { isLoading: false, data: null };
        }

        // --- 2. LÓGICA DE DOCUMENTACIÓN CENTRALIZADA AQUÍ ---
        // Generamos la lista de documentos que aplican al cliente, basándonos en la configuración.
        const documentosRequeridos = DOCUMENTACION_CONFIG
            .filter(docConfig => docConfig.aplicaA(cliente.financiero || {}))
            .map(docConfig => {
                const docData = cliente.documentos?.[docConfig.id];
                return {
                    ...docConfig, // Traemos la configuración (id, label, etc.)
                    ...docData    // Traemos los datos guardados (url, estado)
                };
            });

        const historialAbonos = abonos
            .filter(a => a.clienteId === clienteId && a.estadoProceso === 'activo')
            .sort((a, b) => new Date(b.fechaPago) - new Date(a.fechaPago));

        return {
            isLoading: false,
            data: {
                cliente,
                vivienda: cliente.vivienda,
                historialAbonos,
                documentosRequeridos // <-- 3. Devolvemos la lista ya procesada
            }
        };
    }, [clienteId, clientes, abonos, isLoading]);

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