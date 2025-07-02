import { useMemo } from 'react';

// Este es un hook de lógica pura. No renderiza nada.
export const useDashboardStats = ({ viviendas, clientes, abonos, renuncias }) => {
    // Lógica para calcular las estadísticas principales
    const stats = useMemo(() => {
        const totalViviendas = viviendas.length;
        const viviendasOcupadas = viviendas.filter(v => v.clienteId !== null).length;
        const viviendasDisponibles = totalViviendas - viviendasOcupadas;
        const totalClientes = clientes.length;

        const totalRecaudado = abonos.reduce((sum, abono) => {
            const monto = parseFloat(abono.monto);
            return sum + (isNaN(monto) ? 0 : monto);
        }, 0);

        return { totalViviendas, viviendasOcupadas, viviendasDisponibles, totalClientes, totalRecaudado };
    }, [viviendas, clientes, abonos]);

    // Lógica para el gráfico de ocupación
    const chartDataOcupacion = useMemo(() => [
        { name: 'Ocupadas', value: stats.viviendasOcupadas },
        { name: 'Disponibles', value: stats.viviendasDisponibles },
    ], [stats.viviendasOcupadas, stats.viviendasDisponibles]);

    // Lógica para el gráfico de ingresos mensuales
    const ingresosPorMes = useMemo(() => {
        const monthlyTotals = abonos.reduce((acc, abono) => {
            if (!abono.fechaPago) return acc;
            const monthYear = abono.fechaPago.substring(0, 7);
            const monto = parseFloat(abono.monto);
            acc[monthYear] = (acc[monthYear] || 0) + (isNaN(monto) ? 0 : monto);
            return acc;
        }, {});

        return Object.entries(monthlyTotals)
            .map(([monthYear, total]) => ({
                name: new Date(monthYear + '-02').toLocaleString('es-ES', { month: 'short', year: '2-digit' }),
                Ingresos: total,
            }))
            .sort((a, b) => new Date(a.name) - new Date(b.name));
    }, [abonos]);

    // Lógica para la sección de actividad reciente
    const actividadReciente = useMemo(() => {
        const ultimosAbonos = abonos.map(a => ({ ...a, tipo: 'abono', fecha: a.fechaPago }));
        const clientesNuevos = clientes.map(c => ({ ...c, tipo: 'clienteNuevo', fecha: c.fechaCreacion || new Date(0).toISOString() }));
        const renunciasRecientes = renuncias.map(r => ({ ...r, tipo: 'renuncia', fecha: r.fechaRenuncia }));

        return [...ultimosAbonos, ...clientesNuevos, ...renunciasRecientes]
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
            .slice(0, 5);
    }, [abonos, clientes, renuncias]);

    // El hook devuelve un objeto con todos los datos ya procesados
    return { stats, chartDataOcupacion, ingresosPorMes, actividadReciente };
};