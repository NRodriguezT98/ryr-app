import { useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { determineClientStatus } from '../../utils/statusHelper';
import { usePermissions } from '../auth/usePermissions';

export const useClienteCardLogic = (cliente) => {
    const { viviendas } = useData();
    const { can } = usePermissions();

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
        const tieneValorEscrituraDiferente = cliente.financiero?.usaValorEscrituraDiferente === true && cliente.financiero?.valorEscritura > 0;

        const acciones = {
            verDetalle: {
                visible: can('clientes', 'verDetalle'),
                enabled: true,
            },
            editar: {
                visible: cliente.status === 'activo' && can('clientes', 'editar'),
                enabled: cliente.puedeEditar,
                tooltip: !cliente.puedeEditar ? "No se puede editar un cliente con el proceso finalizado." : ''
            },
            renunciar: {
                visible: cliente.status === 'activo' && can('clientes', 'renunciar') && vivienda && !isPagada,
                enabled: cliente.puedeRenunciar,
                tooltip: !cliente.puedeRenunciar ? "No se puede renunciar: el cliente ha superado un hito clave." : ''
            },
            iniciarNuevoProceso: {
                visible: cliente.status === 'renunciado' && can('clientes', 'nuevoProceso'),
                enabled: true,
            },
            archivar: {
                visible: cliente.status === 'renunciado' && can('clientes', 'archivar'),
                enabled: true,
            },
            restaurar: {
                visible: cliente.status === 'inactivo' && can('clientes', 'restaurarCliente'),
                enabled: true,
            },
            eliminar: {
                visible: cliente.status === 'inactivo' && can('clientes', 'eliminar'),
                enabled: cliente.puedeSerEliminado,
                tooltip: !cliente.puedeSerEliminado ? "Este cliente no puede ser eliminado permanentemente." : ''
            }
        };

        const tieneAccionesDisponibles = Object.values(acciones).some(accion => accion.visible === true);

        return {
            ...cliente,
            vivienda,
            totalAbonado,
            porcentajePagado,
            clientStatus,
            isRenunciado,
            isArchivado,
            isPagada,
            puedeArchivar,
            tieneValorEscrituraDiferente,
            acciones,
            tieneAccionesDisponibles
        };
    }, [cliente, viviendas]);
};