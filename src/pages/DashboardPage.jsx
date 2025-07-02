import React from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useDashboardStats } from '../hooks/useDashboardStats'; // <-- Importamos nuestro nuevo hook
import AnimatedPage from '../components/AnimatedPage';
import StatCard from '../components/dashboard/StatCard';
import ActivityItem from '../components/dashboard/ActivityItem';
import BarChartIngresos from '../components/dashboard/BarChartIngresos';
import DocumentosPendientes from '../components/dashboard/DocumentosPendientes';
import RenunciasPendientes from '../components/dashboard/RenunciasPendientes';
import GraficoOcupacion from '../components/dashboard/GraficoOcupacion';

const DashboardPage = () => {
    // 1. Obtenemos los datos crudos del contexto global
    const { isLoading, viviendas, clientes, abonos, renuncias } = useData();

    // 2. Usamos nuestro hook para obtener todas las estadísticas procesadas
    const {
        stats,
        chartDataOcupacion,
        ingresosPorMes,
        actividadReciente
    } = useDashboardStats({ viviendas, clientes, abonos, renuncias });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-100px)]">
                <p className="text-xl text-gray-500 animate-pulse">Cargando dashboard...</p>
            </div>
        );
    }

    // 3. El JSX ahora es mucho más limpio y solo se dedica a mostrar la información
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    <div className="lg:col-span-1"><DocumentosPendientes clientes={clientes} /></div>
                    <div className="lg:col-span-1"><RenunciasPendientes renuncias={renuncias} /></div>
                    <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg">
                        <h2 className="text-xl font-bold text-gray-700 mb-4">Ocupación Actual</h2>
                        <GraficoOcupacion data={chartDataOcupacion} />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
                        <h2 className="text-xl font-bold text-gray-700 mb-4">Ingresos por Mes</h2>
                        <BarChartIngresos data={ingresosPorMes} />
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h2 className="text-xl font-bold text-gray-700 mb-4">Actividad Reciente</h2>
                        <ul>
                            {actividadReciente.length > 0 ? (
                                actividadReciente.map((item) => (
                                    <ActivityItem
                                        key={`${item.tipo}-${item.id}`}
                                        item={item}
                                        clientes={clientes} // Pasamos la lista de clientes para encontrar nombres
                                    />
                                ))
                            ) : (
                                <p className="text-sm text-gray-500 text-center mt-10">No hay actividad reciente.</p>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
};

export default DashboardPage;