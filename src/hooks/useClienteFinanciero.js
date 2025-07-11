import { useMemo } from 'react';
import { useData } from '../context/DataContext';

export const useClienteFinanciero = (clienteId) => {
    const { clientes, abonos, isLoading } = useData();

    const datosFinancieros = useMemo(() => {
        if (isLoading || !clienteId) return { isLoading: true, data: null };

        const cliente = clientes.find(c => c.id === clienteId);
        if (!cliente || !cliente.vivienda) return { isLoading: false, data: null };

        const vivienda = cliente.vivienda;
        const historial = abonos
            .filter(a => a.clienteId === clienteId && a.estadoProceso === 'activo')
            .sort((a, b) => new Date(b.fechaPago) - new Date(a.fechaPago));

        const fuentes = [];
        if (cliente.financiero) {
            const { financiero } = cliente;
            if (financiero.aplicaCuotaInicial) fuentes.push({ titulo: "Cuota Inicial", fuente: "cuotaInicial", montoPactado: financiero.cuotaInicial.monto, abonos: historial.filter(a => a.fuente === 'cuotaInicial') });
            if (financiero.aplicaCredito) fuentes.push({ titulo: "Crédito Hipotecario", fuente: "credito", montoPactado: financiero.credito.monto, abonos: historial.filter(a => a.fuente === 'credito') });
            if (financiero.aplicaSubsidioVivienda) fuentes.push({ titulo: "Subsidio Mi Casa Ya", fuente: "subsidioVivienda", montoPactado: financiero.subsidioVivienda.monto, abonos: historial.filter(a => a.fuente === 'subsidioVivienda') });
            if (financiero.aplicaSubsidioCaja) fuentes.push({ titulo: `Subsidio Caja (${financiero.subsidioCaja.caja})`, fuente: "subsidioCaja", montoPactado: financiero.subsidioCaja.monto, abonos: historial.filter(a => a.fuente === 'subsidioCaja') });
        }

        return {
            isLoading: false,
            data: { cliente, vivienda, historial, fuentes }
        };

    }, [clienteId, clientes, abonos, isLoading]);

    return datosFinancieros;
};