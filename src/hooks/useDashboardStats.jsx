import { useMemo } from 'react';

/**
 * Hook personalizado para calcular todas las estadísticas y datos necesarios para el Dashboard.
 * @param {object} data - Objeto que contiene las listas de datos crudos.
 * @param {Array} data.viviendas - Lista de todas las viviendas.
 * @param {Array} data.clientes - Lista de todos los clientes.
 * @param {Array} data.abonos - Lista de todos los abonos.
 * @param {Array} data.renuncias - Lista de todas las renuncias.
 * @returns {object} Un objeto con todas las estadísticas procesadas.
 */
export const useDashboardStats = ({ viviendas, clientes, abonos, renuncias }) => {

    // Lógica para las tarjetas de estadísticas (KPIs)
    const stats = useMemo(() => {
        const totalViviendas = viviendas.length;
        const viviendasOcupadas = viviendas.filter(v => v.clienteId !== null).length;
        const viviendasDisponibles = totalViviendas - viviendasOcupadas;
        const totalClientes = clientes.filter(c => c.status !== 'renunciado').length;
        const totalRecaudado = abonos.reduce((sum, abono) => sum + (abono.monto || 0), 0);

        return { totalViviendas, viviendasOcupadas, viviendasDisponibles, totalClientes, totalRecaudado };
    }, [viviendas, clientes, abonos]);

    // Lógica para el gráfico de ocupación
    const chartDataOcupacion = useMemo(() => [
        { name: 'Ocupadas', value: stats.viviendasOcupadas },
        { name: 'Disponibles', value: stats.viviendasDisponibles },
    ], [stats.viviendasOcupadas, stats.viviendasDisponibles]);

    // Lógica para el gráfico de ingresos
    const ingresosPorMes = useMemo(() => {
        const monthlyTotals = abonos.reduce((acc, abono) => {
            if (!abono.fechaPago) return acc;
            const monthYear = abono.fechaPago.substring(0, 7);
            acc[monthYear] = (acc[monthYear] || 0) + (abono.monto || 0);
            return acc;
        }, {});

        return Object.entries(monthlyTotals)
            .map(([monthYear, total]) => ({
                name: new Date(monthYear + '-02').toLocaleString('es-ES', { month: 'short', year: '2-digit' }),
                Ingresos: total,
            }))
            .sort((a, b) => new Date(a.name) - new Date(b.name));
    }, [abonos]);

    // --- LÓGICA MEJORADA PARA LA ACTIVIDAD RECIENTE ---
    const actividadReciente = useMemo(() => {
        // Mapeamos cada tipo de evento a un formato unificado
        const ultimosAbonos = abonos.map(a => ({
            id: `abono-${a.id}`,
            tipo: 'abono',
            fecha: a.fechaPago,
            monto: a.monto,
            clienteId: a.clienteId
        }));

        const clientesNuevos = clientes.map(c => ({
            id: `cliente-${c.id}`,
            tipo: 'clienteNuevo',
            fecha: c.fechaCreacion || new Date(0).toISOString(),
            datosCliente: c.datosCliente
        }));

        const renunciasRecientes = renuncias.map(r => ({
            id: `renuncia-${r.id}`,
            tipo: 'renuncia',
            fecha: r.fechaRenuncia,
            clienteNombre: r.clienteNombre,
            monto: r.totalAbonadoParaDevolucion
        }));

        // Unimos todos los eventos, los ordenamos por fecha y tomamos los 7 más recientes
        return [...ultimosAbonos, ...clientesNuevos, ...renunciasRecientes]
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
            .slice(0, 7);

    }, [abonos, clientes, renuncias]);

    // El hook devuelve todo listo para usar
    return { stats, chartDataOcupacion, ingresosPorMes, actividadReciente };
};