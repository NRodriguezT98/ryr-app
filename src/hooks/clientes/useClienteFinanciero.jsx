import { useMemo } from 'react';

export const useClienteFinanciero = (financiero, valorVivienda) => {
    const resumen = useMemo(() => {
        // --- GUARDIA AÑADIDA AQUÍ ---
        // Si no hay datos financieros, devolvemos un resumen vacío.
        if (!financiero) {
            return { totalRecursos: 0, totalAPagar: 0, diferencia: 0 };
        }

        const montoCuota = financiero.aplicaCuotaInicial ? (financiero.cuotaInicial.monto || 0) : 0;
        const montoCredito = financiero.aplicaCredito ? (financiero.credito.monto || 0) : 0;
        const montoSubVivienda = financiero.aplicaSubsidioVivienda ? (financiero.subsidioVivienda.monto || 0) : 0;
        const montoSubCaja = financiero.aplicaSubsidioCaja ? (financiero.subsidioCaja.monto || 0) : 0;

        const totalRecursos = montoCuota + montoCredito + montoSubVivienda + montoSubCaja;
        const totalAPagar = valorVivienda || 0;

        return {
            totalRecursos,
            totalAPagar,
            diferencia: totalAPagar - totalRecursos
        };
    }, [financiero, valorVivienda]);

    return resumen;
};