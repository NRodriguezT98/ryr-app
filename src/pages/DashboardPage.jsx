import React from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useDashboardStats } from '../hooks/useDashboardStats';
import AnimatedPage from '../components/AnimatedPage';
import StatCard from '../components/dashboard/StatCard';
import ActivityItem from '../components/dashboard/ActivityItem';
import BarChartIngresos from '../components/dashboard/BarChartIngresos';
import DocumentosPendientes from '../components/dashboard/DocumentosPendientes';
import RenunciasPendientes from '../components/dashboard/RenunciasPendientes';
import GraficoOcupacion from '../components/dashboard/GraficoOcupacion';
import { Home, User, CheckCircle, Wallet } from 'lucide-react';
import { formatCurrency } from '../utils/textFormatters';

const DashboardPage = () => {
    const { isLoading, viviendas, clientes, abonos, renuncias } = useData();

    const {
        stats,
        chartDataOcupacion,
        ingresosPorMes,
        actividadReciente
    } = useDashboardStats({ viviendas, clientes, abonos, renuncias });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-100px)]">
                <p className="text-xl text-gray-500 dark:text-gray-400 animate-pulse">Cargando dashboard...</p>
            </div>
        );
    }

    return (
        <AnimatedPage>
            <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8">Panel de Control</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Link to="/viviendas/listar">
                        <StatCard title="Total de Viviendas" value={stats.totalViviendas} icon={<Home />} colorClass="text-red-500" />
                    </Link>
                    <Link to="/clientes/listar" state={{ statusFilter: 'activo' }}>
                        <StatCard title="Clientes Activos" value={stats.totalClientes} icon={<User />} colorClass="text-blue-500" />
                    </Link>
                    <Link to="/viviendas/listar" state={{ statusFilter: 'disponibles' }}>
                        <StatCard title="Viviendas Disponibles" value={stats.viviendasDisponibles} icon={<CheckCircle />} colorClass="text-green-500" />
                    </Link>
                    <Link to="/abonos/listar">
                        <StatCard title="Total Recaudado" value={formatCurrency(stats.totalRecaudado)} icon={<Wallet />} colorClass="text-yellow-500" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    <DocumentosPendientes clientes={clientes} />
                    <RenunciasPendientes renuncias={renuncias} />
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                        <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-4">Ocupación Actual</h2>
                        <GraficoOcupacion data={chartDataOcupacion} />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg flex flex-col">
                        <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-4">Ingresos por Mes</h2>
                        <div className="flex-grow">
                            <BarChartIngresos data={ingresosPorMes} />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                        <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-4">Actividad Reciente</h2>
                        <ul className="space-y-2">
                            {actividadReciente.length > 0 ? (
                                actividadReciente.map((item) => (
                                    <ActivityItem
                                        key={`${item.tipo}-${item.id}`}
                                        item={item}
                                        clientes={clientes}
                                    />
                                ))
                            ) : (
                                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-10">No hay actividad reciente.</p>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
};

export default DashboardPage;