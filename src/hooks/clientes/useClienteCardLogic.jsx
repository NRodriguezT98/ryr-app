import { useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { determineClientStatus } from '../../utils/statusHelper';

export const useClienteCardLogic = (cliente) => {
    const { viviendas } = useData();

    return useMemo(() => {
        const vivienda = viviendas.find(v => v.id === cliente.viviendaId);
        const totalAbonado = vivienda?.totalAbonado || 0;
        const valorFinal = vivienda?.valorFinal || 0;
        const porcentajePagado = valorFinal > 0 ? (totalAbonado / valorFinal) * 100 : 0;

        const clientStatus = determineClientStatus(cliente);
        const isRenunciado = cliente.status === 'renunciado';
        const isArchivado = cliente.status === 'inactivo';
        const isEnRenuncia = cliente.status === 'enProcesoDeRenuncia';
        const isPagada = vivienda?.saldoPendiente <= 0 && !!vivienda;

        // La acción de archivar solo está disponible si el cliente NO está en medio de una renuncia.
        const puedeArchivar = !isEnRenuncia;

        return {
            ...cliente,
            vivienda,
            totalAbonado,
            porcentajePagado,
            clientStatus,
            isRenunciado,
            isArchivado,
            isPagada,
            puedeArchivar
        };
    }, [cliente, viviendas]);
};