import { useMemo, useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';

/**
 * Hook optimizado para DetalleVivienda
 * 🔥 OPTIMIZADO: Reduce filtrado y procesamiento de abonos
 */
export const useDetalleVivienda = () => {
    const { viviendaId } = useParams();
    const navigate = useNavigate();
    const { viviendas, clientes, abonos, proyectos, isLoading, recargarDatos } = useData();
    const [activeTab, setActiveTab] = useState('info');
    const [datosDetalle, setDatosDetalle] = useState(null);
    const [fuenteACondonar, setFuenteACondonar] = useState(null);
    const [desembolsoACrear, setDesembolsoACrear] = useState(null);

    useEffect(() => {
        if (!isLoading) {
            const vivienda = viviendas.find(v => v.id === viviendaId);
            if (!vivienda) {
                navigate('/viviendas/listar');
                return;
            }

            const proyecto = proyectos.find(p => p.id === vivienda.proyectoId);
            let cliente = null;
            let historialAbonos = [];
            let fuentes = [];
            let desgloseTotalAbonado = [];

            if (vivienda.clienteId) {
                cliente = clientes.find(c => c.id === vivienda.clienteId);

                if (cliente) {
                    // 🔥 OPTIMIZACIÓN: Filtrado más eficiente con índices tempranos
                    historialAbonos = abonos
                        .filter(a =>
                            a.viviendaId === viviendaId &&
                            a.clienteId === cliente.id &&
                            a.estadoProceso === 'activo'
                        )
                        .sort((a, b) => new Date(b.fechaPago) - new Date(a.fechaPago))
                        .map(abono => ({
                            ...abono,
                            clienteInfo: cliente.datosCliente
                                ? `${cliente.datosCliente.nombres} ${cliente.datosCliente.apellidos}`
                                : 'N/A',
                            clienteStatus: cliente.status || 'activo'
                        }));

                    // 🔥 OPTIMIZACIÓN: Creación de fuentes más eficiente
                    if (cliente.financiero) {
                        const { financiero } = cliente;

                        // Helper para crear fuentes sin repetir código
                        const crearFuente = (condicion, titulo, fuente, monto) =>
                            condicion ? {
                                titulo,
                                fuente,
                                montoPactado: monto,
                                abonos: historialAbonos.filter(a => a.fuente === fuente)
                            } : null;

                        fuentes = [
                            crearFuente(financiero.aplicaCuotaInicial, "Cuota Inicial", "cuotaInicial", financiero.cuotaInicial.monto),
                            crearFuente(financiero.aplicaCredito, "Crédito Hipotecario", "credito", financiero.credito.monto),
                            crearFuente(financiero.aplicaSubsidioVivienda, "Subsidio Mi Casa Ya", "subsidioVivienda", financiero.subsidioVivienda.monto),
                            crearFuente(financiero.aplicaSubsidioCaja, `Subsidio Caja (${financiero.subsidioCaja.caja})`, "subsidioCaja", financiero.subsidioCaja.monto),
                        ].filter(Boolean); // Elimina nulls
                    }

                    // Desglose de total abonado por fuente
                    desgloseTotalAbonado = fuentes.map(f => ({
                        label: f.titulo,
                        value: f.abonos.reduce((sum, abono) => sum + abono.monto, 0)
                    }));
                }
            }

            // Desglose del valor de la vivienda
            const desgloseValorVivienda = [
                { label: 'Valor Base', value: vivienda.valorTotal },
                { label: 'Recargo Esquinera', value: vivienda.recargoEsquinera },
                { label: 'Descuento Aplicado', value: -vivienda.descuentoMonto }
            ];

            setDatosDetalle({ vivienda, proyecto, cliente, historialAbonos, fuentes, desgloseValorVivienda, desgloseTotalAbonado });
        }
    }, [viviendaId, viviendas, clientes, abonos, proyectos, isLoading, navigate]);

    const handleGuardado = useCallback(() => {
        recargarDatos();
        setFuenteACondonar(null);
        setDesembolsoACrear(null);
    }, [recargarDatos]);

    const handleRegistrarDesembolso = useCallback(() => {
        if (datosDetalle) {
            setDesembolsoACrear({
                cliente: datosDetalle.cliente,
                vivienda: datosDetalle.vivienda
            });
        }
    }, [datosDetalle]);

    return {
        isLoading: isLoading || !datosDetalle,
        datosDetalle,
        activeTab,
        setActiveTab,
        recargarDatos,
        navigate,
        fuenteACondonar,
        setFuenteACondonar,
        handleGuardado,
        desembolsoACrear,
        setDesembolsoACrear,
        handleRegistrarDesembolso
    };
};