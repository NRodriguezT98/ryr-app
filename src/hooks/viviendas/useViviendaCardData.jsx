// src/hooks/viviendas/useViviendaCardData.jsx
// 🔥 OPTIMIZADO: Datos derivados sin cálculos redundantes (totalAbonado/saldoPendiente YA están en vivienda)

import { useMemo } from 'react';

/**
 * Hook optimizado para datos de ViviendaCard
 * NO recalcula totalAbonado/saldoPendiente (ya vienen actualizados de Firestore)
 * Solo calcula estados derivados livianos
 * 🔥 DEFENSIVO: Maneja campos undefined de viviendas antiguas
 */
export const useViviendaCardData = (vivienda) => {
    const datosCalculados = useMemo(() => {
        if (!vivienda) {
            return {
                porcentajePagado: 0,
                isDisponible: true,
                isPagada: false,
                esEsquinera: false,
                tieneDescuento: false,
                esIrregular: false,
            };
        }

        // ✅ OPTIMIZACIÓN: Usamos los valores que YA vienen de Firestore
        // 🔥 DEFENSIVO: Valores por defecto para campos que pueden no existir
        const totalAbonado = vivienda.totalAbonado ?? 0;
        const valorFinal = vivienda.valorFinal ?? vivienda.valorTotal ?? 0;
        const saldoPendiente = vivienda.saldoPendiente ?? valorFinal;

        // Solo calculamos derivados livianos
        const porcentajePagado = valorFinal > 0 ? (totalAbonado / valorFinal) * 100 : 0;
        const isDisponible = !vivienda.clienteId;
        const isPagada = saldoPendiente <= 0 && !isDisponible;
        const esEsquinera = (vivienda.recargoEsquinera ?? 0) > 0;
        const tieneDescuento = (vivienda.descuentoMonto ?? 0) > 0;
        const esIrregular = vivienda.tipoVivienda === 'Irregular';

        return {
            porcentajePagado,
            isDisponible,
            isPagada,
            esEsquinera,
            tieneDescuento,
            esIrregular,
        };
    }, [vivienda]);

    return {
        ...vivienda,
        ...datosCalculados,
    };
};