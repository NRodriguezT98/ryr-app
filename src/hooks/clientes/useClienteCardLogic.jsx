import { useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { determineClientStatus } from '../../utils/statusHelper';
import { usePermissions } from '../auth/usePermissions';

export const useClienteCardLogic = (cliente) => {
    const { maps, abonos } = useData();
    const { can } = usePermissions();

    return useMemo(() => {
        // Usar Map para búsqueda O(1) en vez de find O(n)
        const vivienda = cliente.vivienda || maps.viviendas.get(cliente.viviendaId);

        const totalAbonado = abonos
            .filter(abono => abono.clienteId === cliente.id && abono.viviendaId === vivienda?.id && abono.estadoProceso === 'activo')
            .reduce((sum, abono) => sum + abono.monto, 0);

        const valorFinal = vivienda?.valorFinal || 0;

        const saldoPendienteCalculado = valorFinal - totalAbonado;

        const porcentajePagado = valorFinal > 0 ? (totalAbonado / valorFinal) * 100 : 0;
        const isPagada = saldoPendienteCalculado <= 0 && !!vivienda;

        const clientStatus = determineClientStatus(cliente);
        const isRenunciado = cliente.status === 'renunciado';
        const isArchivado = cliente.status === 'inactivo';
        const isEnRenuncia = cliente.status === 'enProcesoDeRenuncia';

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
            transferir: {
                visible: cliente.status === 'activo' && can('clientes', 'transferirVivienda') && vivienda && !isPagada,
                enabled: !!vivienda,
                tooltip: !vivienda ? "El cliente debe tener una vivienda asignada para poder ser transferido." : 'Transferir cliente a una nueva vivienda.'
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
            vivienda: vivienda ? {
                ...vivienda,
                saldoPendiente: saldoPendienteCalculado
            } : null,
            totalAbonado,
            porcentajePagado,
            clientStatus,
            isRenunciado,
            isArchivado,
            isPagada,
            puedeArchivar,
            saldoPendiente: saldoPendienteCalculado,
            tieneValorEscrituraDiferente,
            acciones,
            tieneAccionesDisponibles
        };
    }, [cliente, maps.viviendas, abonos, can]);
};