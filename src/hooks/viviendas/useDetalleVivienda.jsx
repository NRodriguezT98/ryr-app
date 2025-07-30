import { useMemo, useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';

export const useDetalleVivienda = () => {
    const { viviendaId } = useParams();
    const navigate = useNavigate();
    const { viviendas, clientes, abonos, isLoading, recargarDatos } = useData();
    const [activeTab, setActiveTab] = useState('info');
    const [datosDetalle, setDatosDetalle] = useState(null);
    const [fuenteACondonar, setFuenteACondonar] = useState(null);

    useEffect(() => {
        if (!isLoading) {
            const vivienda = viviendas.find(v => v.id === viviendaId);
            if (!vivienda) {
                navigate('/viviendas/listar');
                return;
            }

            let cliente = null;
            let historialAbonos = [];
            let fuentes = [];
            let desgloseTotalAbonado = [];

            if (vivienda.clienteId) {
                cliente = clientes.find(c => c.id === vivienda.clienteId);

                if (cliente) {
                    historialAbonos = abonos
                        .filter(a => a.viviendaId === viviendaId && a.clienteId === cliente.id && a.estadoProceso === 'activo')
                        .sort((a, b) => new Date(b.fechaPago) - new Date(a.fechaPago))
                        .map(abono => ({
                            ...abono,
                            clienteInfo: cliente.datosCliente ? `${cliente.datosCliente.nombres} ${cliente.datosCliente.apellidos}` : 'N/A',
                            clienteStatus: cliente.status || 'activo'
                        }));

                    if (cliente.financiero) {
                        const { financiero } = cliente;
                        const crearFuente = (titulo, fuente, montoPactado) => ({
                            titulo, fuente, montoPactado, abonos: historialAbonos.filter(a => a.fuente === fuente)
                        });

                        if (financiero.aplicaCuotaInicial) fuentes.push(crearFuente("Cuota Inicial", "cuotaInicial", financiero.cuotaInicial.monto));
                        if (financiero.aplicaCredito) fuentes.push(crearFuente("Crédito Hipotecario", "credito", financiero.credito.monto));
                        if (financiero.aplicaSubsidioVivienda) fuentes.push(crearFuente("Subsidio Mi Casa Ya", "subsidioVivienda", financiero.subsidioVivienda.monto));
                        if (financiero.aplicaSubsidioCaja) fuentes.push(crearFuente(`Subsidio Caja (${financiero.subsidioCaja.caja})`, "subsidioCaja", financiero.subsidioCaja.monto));
                    }

                    desgloseTotalAbonado = fuentes.map(f => ({
                        label: f.titulo,
                        value: f.abonos.reduce((sum, abono) => sum + abono.monto, 0)
                    }));
                }
            }

            // --- INICIO DE LA CORRECCIÓN ---
            const desgloseValorVivienda = [
                { label: 'Valor Base', value: vivienda.valorTotal },
                { label: 'Recargo Esquinera', value: vivienda.recargoEsquinera },
                { label: 'Descuento Aplicado', value: -vivienda.descuentoMonto }
            ];
            // --- FIN DE LA CORRECCIÓN ---

            setDatosDetalle({ vivienda, cliente, historialAbonos, fuentes, desgloseValorVivienda, desgloseTotalAbonado });
        }
    }, [viviendaId, viviendas, clientes, abonos, isLoading, navigate]);

    const handleGuardado = useCallback(() => {
        recargarDatos();
        setFuenteACondonar(null);
    }, [recargarDatos]);

    return {
        isLoading: isLoading || !datosDetalle,
        datosDetalle,
        activeTab,
        setActiveTab,
        recargarDatos,
        navigate,
        fuenteACondonar,
        setFuenteACondonar,
        handleGuardado
    };
};