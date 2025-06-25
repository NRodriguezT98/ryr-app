import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import toast from 'react-hot-toast';
import { getViviendas, getClientes, getAbonos } from '../utils/storage';
import AnimatedPage from '../components/AnimatedPage';
import StatCard from '../components/dashboard/StatCard';
import ActivityItem from '../components/dashboard/ActivityItem';
import BarChartIngresos from '../components/dashboard/BarChartIngresos';

const DashboardPage = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [viviendas, setViviendas] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [abonos, setAbonos] = useState([]);

    useEffect(() => {
        const fetchAllData = async () => {
            setIsLoading(true);
            try {
                const [viviendasData, clientesData, abonosData] = await Promise.all([
                    getViviendas(),
                    getClientes(),
                    getAbonos()
                ]);
                setViviendas(viviendasData);
                setClientes(clientesData);
                setAbonos(abonosData);
            } catch (error) {
                console.error("Error cargando datos para el dashboard:", error);
                toast.error("No se pudieron cargar las estadísticas.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchAllData();
    }, []);

    const stats = useMemo(() => {
        const totalViviendas = viviendas.length;
        const viviendasOcupadas = viviendas.filter(v => v.clienteId !== null).length;
        const viviendasDisponibles = totalViviendas - viviendasOcupadas;
        const totalClientes = clientes.length;
        const totalRecaudado = abonos.reduce((sum, abono) => sum + (abono.monto || 0), 0);
        return { totalViviendas, viviendasOcupadas, viviendasDisponibles, totalClientes, totalRecaudado };
    }, [viviendas, clientes, abonos]);

    const ultimosAbonos = useMemo(() => {
        return abonos.map(abono => {
            const cliente = clientes.find(c => c.id === abono.clienteId);
            return { ...abono, nombreCliente: cliente?.nombre || 'Desconocido' };
        }).sort((a, b) => b.id - a.id).slice(0, 5);
    }, [abonos, clientes]);

    const ingresosPorMes = useMemo(() => {
        const monthlyTotals = abonos.reduce((acc, abono) => {
            if (!abono.fechaPago) return acc;
            const monthYear = abono.fechaPago.substring(0, 7);
            acc[monthYear] = (acc[monthYear] || 0) + (abono.monto || 0);
            return acc;
        }, {});
        return Object.entries(monthlyTotals).map(([monthYear, total]) => ({
            name: new Date(monthYear + '-02').toLocaleString('es-ES', { month: 'short', year: '2-digit' }),
            Ingresos: total,
        })).sort((a, b) => new Date(a.name) - new Date(b.name));
    }, [abonos]);

    const chartDataOcupacion = useMemo(() => [
        { name: 'Disponibles', value: stats.viviendasDisponibles },
        { name: 'Ocupadas', value: stats.viviendasOcupadas },
    ], [stats.viviendasDisponibles, stats.viviendasOcupadas]);

    const COLORS = ['#34d399', '#f87171'];

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
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
                        <h2 className="text-xl font-bold text-gray-700 mb-4">Ingresos por Mes</h2>
                        <BarChartIngresos data={ingresosPorMes} />
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h2 className="text-xl font-bold text-gray-700 mb-4">Actividad Reciente</h2>
                        <ul>
                            {ultimosAbonos.length > 0 ? (
                                ultimosAbonos.map(abono => (
                                    <ActivityItem key={abono.id} icon="💵" title={abono.nombreCliente} subtitle={new Date(abono.id).toLocaleDateString('es-ES')} value={`+${(abono.monto || 0).toLocaleString("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 })}`} />
                                ))
                            ) : (
                                <p className="text-sm text-gray-500 text-center mt-10">No hay abonos registrados todavía.</p>
                            )}
                        </ul>
                    </div>
                </div>
                <div className="mt-8">
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h2 className="text-xl font-bold text-gray-700 mb-4">Ocupación de Viviendas</h2>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={chartDataOcupacion} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                        {chartDataOcupacion.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                                    </Pie>
                                    <Tooltip formatter={(value) => new Intl.NumberFormat('en').format(value)} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
};
export default DashboardPage;