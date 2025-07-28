import { useMemo } from 'react';
import { determineClientStatus } from '../../utils/statusHelper';

export const useClienteCardLogic = (cliente) => {
    const { status, vivienda } = cliente;

    const clientStatus = useMemo(() => determineClientStatus(cliente), [cliente]);

    const isRenunciado = useMemo(() => status === 'renunciado', [status]);

    // --- INICIO DE LA MODIFICACIÓN ---
    // Añadimos una variable específica para saber si el cliente está archivado.
    const isArchivado = useMemo(() => status === 'inactivo', [status]);
    // --- FIN DE LA MODIFICACIÓN ---

    const isPagada = useMemo(() => vivienda && vivienda.saldoPendiente <= 0, [vivienda]);

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

    return {
        ...cliente,
        clientStatus,
        isRenunciado,
        isArchivado, // <-- Exportamos la nueva variable
        isPagada,
        totalAbonado,
        porcentajePagado,
        valorFinal
    };
};