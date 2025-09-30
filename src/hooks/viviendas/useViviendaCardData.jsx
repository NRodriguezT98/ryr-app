// En src/hooks/viviendas/useViviendaCardData.jsx

import { useMemo } from 'react';
import { useData } from '../../context/DataContext';

export const useViviendaCardData = (vivienda) => {
    const { abonos } = useData();

    // Calculamos los totales en tiempo real usando la lista de abonos
    const datosFinancierosReales = useMemo(() => {
        if (!vivienda) return { totalAbonado: 0, saldoPendiente: 0, porcentajePagado: 0 };

        const abonosDeVivienda = abonos.filter(a => a.viviendaId === vivienda.id && a.estadoProceso === 'activo');
        const totalAbonado = abonosDeVivienda.reduce((sum, abono) => sum + abono.monto, 0);

        const valorFinal = vivienda.valorFinal || 0;
        const saldoPendiente = valorFinal - totalAbonado;
        const porcentajePagado = valorFinal > 0 ? (totalAbonado / valorFinal) * 100 : 0;

        return { totalAbonado, saldoPendiente, porcentajePagado };
    }, [vivienda, abonos]);

    return {
        // Devolvemos el objeto vivienda original, pero sobreescribimos los datos financieros
        // con los que acabamos de calcular en tiempo real.
        ...vivienda,
        totalAbonado: datosFinancierosReales.totalAbonado,
        saldoPendiente: datosFinancierosReales.saldoPendiente,
        porcentajePagado: datosFinancierosReales.porcentajePagado,
    };
};