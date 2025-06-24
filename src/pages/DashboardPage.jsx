import React, { useMemo } from 'react';
import { Link } from 'react-router-dom'; // <-- 1. Importamos Link para los enlaces
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { getViviendas, getClientes, getAbonos } from '../utils/storage';
import AnimatedPage from '../components/AnimatedPage';
import StatCard from '../components/dashboard/StatCard';
import ActivityItem from '../components/dashboard/ActivityItem';

const DashboardPage = () => {
    // 1. Obtenemos todos los datos usando nuestras funciones de storage
    const viviendas = useMemo(() => getViviendas(), []);
    const clientes = useMemo(() => getClientes(), []);
    const abonos = useMemo(() => getAbonos(), []);

    // 2. Calculamos todas las estadísticas que necesitamos
    const stats = useMemo(() => {
        const totalViviendas = viviendas.length;
        const viviendasOcupadas = viviendas.filter(v => v.clienteId !== null).length;
        const viviendasDisponibles = totalViviendas - viviendasOcupadas;
        const totalClientes = clientes.length;
        const totalRecaudado = abonos.reduce((sum, abono) => sum + (abono.monto || 0), 0);

        return {
            totalViviendas,
            viviendasOcupadas,
            viviendasDisponibles,
            totalClientes,
            totalRecaudado,
        };
    }, [viviendas, clientes, abonos]);

    const ultimosAbonos = useMemo(() => {
        return abonos
            .map(abono => {
                const cliente = clientes.find(c => c.id === abono.clienteId);
                return { ...abono, nombreCliente: cliente?.nombre || 'Cliente no encontrado' };
            })
            .sort((a, b) => new Date(b.id) - new Date(a.id)) // Ordenamos por ID (timestamp)
            .slice(0, 5); // Tomamos los últimos 5
    }, [abonos, clientes]);

    const chartData = [
        { name: 'Disponibles', value: stats.viviendasDisponibles },
        { name: 'Ocupadas', value: stats.viviendasOcupadas },
    ];
    const COLORS = ['#34d399', '#f87171'];

    return (
        <AnimatedPage>
            <div className="p-6 bg-gray-50 min-h-screen">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Panel de Control</h1>

                {/* Tarjetas de estadísticas ahora son enlaces */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Link to="/viviendas/listar"><StatCard title="Total de Viviendas" value={stats.totalViviendas} icon="🏠" colorClass="text-red-500" /></Link>
                    <Link to="/clientes/listar"><StatCard title="Total de Clientes" value={stats.totalClientes} icon="👥" colorClass="text-blue-500" /></Link>
                    <Link to="/viviendas/listar"><StatCard title="Viviendas Disponibles" value={stats.viviendasDisponibles} icon="✅" colorClass="text-green-500" /></Link>
                    <Link to="/abonos"><StatCard title="Total Recaudado" value={stats.totalRecaudado.toLocaleString("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 })} icon="💰" colorClass="text-yellow-500" /></Link>
                </div>

                {/* --- NUEVO: Layout de dos columnas para gráfico y actividad --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Columna Izquierda (Gráfico) */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
                        <h2 className="text-xl font-bold text-gray-700 mb-4">Ocupación de Viviendas</h2>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => new Intl.NumberFormat('en').format(value)} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Columna Derecha (Actividad Reciente) */}
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h2 className="text-xl font-bold text-gray-700 mb-4">Actividad Reciente</h2>
                        <ul>
                            {ultimosAbonos.length > 0 ? (
                                ultimosAbonos.map(abono => (
                                    <ActivityItem
                                        key={abono.id}
                                        icon="💵"
                                        title={abono.nombreCliente}
                                        subtitle={new Date(abono.id).toLocaleDateString('es-ES')}
                                        value={`+${(abono.monto || 0).toLocaleString("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 })}`}
                                    />
                                ))
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