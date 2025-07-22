import { useMemo } from 'react';
import { determineClientStatus } from '../../utils/statusHelper';

export const useClienteCardLogic = (cliente) => {
    const { status, vivienda } = cliente;

    // Determina el estado visual del cliente (ej: "A Paz y Salvo", "Promesa Firmada")
    const clientStatus = useMemo(() => determineClientStatus(cliente), [cliente]);

    // Determina si el cliente tiene un estado de "renunciado"
    const isRenunciado = useMemo(() => status === 'renunciado', [status]);

    // Determina si la vivienda ha sido pagada en su totalidad
    const isPagada = useMemo(() => vivienda && vivienda.saldoPendiente <= 0, [vivienda]);

    // Calcula los valores financieros para mostrar en la tarjeta
    const { totalAbonado, porcentajePagado, valorFinal } = useMemo(() => {
        const vf = vivienda?.valorFinal || 0;
        const ta = vivienda?.totalAbonado || 0;
        const pp = vf > 0 ? (ta / vf) * 100 : (vivienda ? 100 : 0);
        return {
            totalAbonado: ta,
            porcentajePagado: pp,
            valorFinal: vf
        };
    }, [vivienda]);

    // Devuelve un objeto con todos los datos ya procesados, listos para ser mostrados
    return {
        ...cliente,
        clientStatus,
        isRenunciado,
        isPagada,
        totalAbonado,
        porcentajePagado,
        valorFinal
    };
};