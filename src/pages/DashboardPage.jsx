import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import AnimatedPage from '../components/AnimatedPage';
import StatCard from '../components/dashboard/StatCard';
import ActivityItem from '../components/dashboard/ActivityItem';
import BarChartIngresos from '../components/dashboard/BarChartIngresos';
import DocumentosPendientes from '../components/dashboard/DocumentosPendientes';

const DashboardPage = () => {
    const { isLoading, viviendas, clientes, abonos } = useData();

    const stats = useMemo(() => {
        const totalViviendas = viviendas.length;
        const viviendasOcupadas = viviendas.filter(v => v.clienteId !== null).length;
        const viviendasDisponibles = totalViviendas - viviendasOcupadas;
        const totalClientes = clientes.length;
        const totalRecaudado = abonos.reduce((sum, abono) => sum + (abono.monto || 0), 0);
        return { totalViviendas, viviendasOcupadas, viviendasDisponibles, totalClientes, totalRecaudado };
    }, [viviendas, clientes, abonos]);

    const ultimosAbonos = useMemo(() => {
        return abonos
            .sort((a, b) => new Date(b.fechaPago) - new Date(a.fechaPago))
            .slice(0, 5);
    }, [abonos]);

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

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-100px)]">
                <p className="text-xl text-gray-500 animate-pulse">Cargando dashboard...</p>
            </div>
        );
    }

    return (
        <AnimatedPage>
            <div className="p-6 bg-gray-50 min-h-screen">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Panel de Control</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Link to="/viviendas/listar"><StatCard title="Total de Viviendas" value={stats.totalViviendas} icon="🏠" colorClass="text-red-500" /></Link>
                    <Link to="/clientes/listar"><StatCard title="Total de Clientes" value={stats.totalClientes} icon="👥" colorClass="text-blue-500" /></Link>
                    <Link to="/viviendas/listar"><StatCard title="Viviendas Disponibles" value={stats.viviendasDisponibles} icon="✅" colorClass="text-green-500" /></Link>
                    <Link to="/abonos"><StatCard title="Total Recaudado" value={stats.totalRecaudado.toLocaleString("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 })} icon="💰" colorClass="text-yellow-500" /></Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Tarjeta de Documentos Pendientes */}
                    <div className="lg:col-span-1">
                        <DocumentosPendientes clientes={clientes} />
                    </div>

                    {/* Gráfico de Ingresos */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
                        <h2 className="text-xl font-bold text-gray-700 mb-4">Ingresos por Mes</h2>
                        <BarChartIngresos data={ingresosPorMes} />
                    </div>
                </div>

                <div className="mt-8">
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h2 className="text-xl font-bold text-gray-700 mb-4">Actividad Reciente</h2>
                        <ul>
                            {ultimosAbonos.length > 0 ? (
                                ultimosAbonos.map(abono => {
                                    // El estado 'clientes' del contexto ya viene con los datos completos
                                    const clienteDelAbono = clientes.find(c => c.id === abono.clienteId);
                                    const nombreCliente = clienteDelAbono ? `${clienteDelAbono.datosCliente.nombres} ${clienteDelAbono.datosCliente.apellidos}` : 'Desconocido';
                                    return (
                                        <ActivityItem key={abono.id} icon="💵" title={nombreCliente} subtitle={new Date(abono.fechaPago + 'T00:00:00').toLocaleDateString('es-ES')} value={`+${(abono.monto || 0).toLocaleString("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 })}`} />
                                    );
                                })
                            ) : (
                                <p className="text-sm text-gray-500 text-center mt-10">No hay abonos registrados todavía.</p>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
};

export default DashboardPage;