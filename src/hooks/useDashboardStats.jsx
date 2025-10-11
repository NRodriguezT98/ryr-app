import { useMemo } from 'react';

/**
 * Hook optimizado para calcular estadísticas del Dashboard
 * Usa memoización agresiva para evitar recálculos innecesarios
 */
export const useDashboardStats = ({ viviendas, clientes, abonos, renuncias }) => {

    // Memoizar stats básicos
    const stats = useMemo(() => {
        const totalViviendas = viviendas?.length || 0;
        const viviendasOcupadas = viviendas?.filter(v => v.clienteId !== null).length || 0;
        const viviendasDisponibles = totalViviendas - viviendasOcupadas;
        const totalClientes = clientes?.filter(c => c.status !== 'renunciado').length || 0;

        const totalRecaudado = abonos
            ?.filter(abono => abono.estadoProceso === 'activo')
            .reduce((sum, abono) => sum + (abono.monto || 0), 0) || 0;

        return {
            totalViviendas,
            viviendasOcupadas,
            viviendasDisponibles,
            totalClientes,
            totalRecaudado
        };
    }, [viviendas, clientes, abonos]);

    // Memoizar datos de gráfica de ocupación
    const chartDataOcupacion = useMemo(() => [
        { name: 'Ocupadas', value: stats.viviendasOcupadas },
        { name: 'Disponibles', value: stats.viviendasDisponibles },
    ], [stats.viviendasOcupadas, stats.viviendasDisponibles]);

    // Memoizar ingresos por mes
    const ingresosPorMes = useMemo(() => {
        if (!abonos?.length) return [];

        const monthlyTotals = abonos
            .filter(abono => abono.estadoProceso === 'activo')
            .reduce((acc, abono) => {
                if (!abono.fechaPago) return acc;
                const monthYear = abono.fechaPago.substring(0, 7);
                acc[monthYear] = (acc[monthYear] || 0) + (abono.monto || 0);
                return acc;
            }, {});

        return Object.entries(monthlyTotals)
            .map(([monthYear, total]) => ({
                name: new Date(monthYear + '-02').toLocaleString('es-ES', {
                    month: 'short',
                    year: '2-digit'
                }),
                Ingresos: total,
            }))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [abonos]);

    // Memoizar actividad reciente
    const actividadReciente = useMemo(() => {
        if (!abonos?.length && !clientes?.length && !renuncias?.length) return [];

        const ultimosAbonos = (abonos || []).map(a => ({
            id: `abono-${a.id}`,
            tipo: 'abono',
            fecha: a.fechaPago,
            monto: a.monto,
            clienteId: a.clienteId,
            fuente: a.fuente,
            metodoPago: a.metodoPago
        }));

        const clientesNuevos = (clientes || []).map(c => ({
            id: `cliente-${c.id}`,
            tipo: 'clienteNuevo',
            fecha: c.fechaCreacion || new Date(0).toISOString(),
            datosCliente: c.datosCliente,
            viviendaId: c.viviendaId
        }));

        const renunciasRecientes = (renuncias || []).map(r => ({
            id: `renuncia-${r.id}`,
            tipo: 'renuncia',
            fecha: r.fechaRenuncia,
            clienteNombre: r.clienteNombre,
            monto: r.totalAbonadoParaDevolucion,
            estadoDevolucion: r.estadoDevolucion,
            motivo: r.motivo
        }));

        return [...ultimosAbonos, ...clientesNuevos, ...renunciasRecientes]
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
            .slice(0, 7);

    }, [abonos, clientes, renuncias]);

    return { stats, chartDataOcupacion, ingresosPorMes, actividadReciente };
};