// En src/hooks/viviendas/useViviendaCardData.jsx

import { useMemo } from 'react';
import { useData } from '../../context/DataContext';

export const useViviendaCardData = (vivienda) => {
    const { abonos } = useData();

    // Calculamos los totales y estados derivados en tiempo real
    const datosCalculados = useMemo(() => {
        if (!vivienda) {
            return {
                totalAbonado: 0,
                saldoPendiente: 0,
                porcentajePagado: 0,
                isDisponible: true,
                isPagada: false,
                esEsquinera: false,
                tieneDescuento: false,
                esIrregular: false,
            };
        }

        const abonosDeVivienda = abonos.filter(a => a.viviendaId === vivienda.id && a.estadoProceso === 'activo');
        const totalAbonado = abonosDeVivienda.reduce((sum, abono) => sum + abono.monto, 0);

        const valorFinal = vivienda.valorFinal || 0;
        const saldoPendiente = valorFinal - totalAbonado;
        const porcentajePagado = valorFinal > 0 ? (totalAbonado / valorFinal) * 100 : 0;

        const isDisponible = !vivienda.clienteId;
        const isPagada = saldoPendiente <= 0 && !isDisponible;
        const esEsquinera = vivienda.recargoEsquinera > 0;
        const tieneDescuento = vivienda.descuentoMonto > 0;
        const esIrregular = vivienda.tipoVivienda === 'Irregular';

        return {
            totalAbonado,
            saldoPendiente,
            porcentajePagado,
            isDisponible,
            isPagada,
            esEsquinera,
            tieneDescuento,
            esIrregular,
        };
    }, [vivienda, abonos]);

    return {
        // Devolvemos el objeto vivienda original y todos los datos calculados.
        ...vivienda,
        ...datosCalculados,
    };
};