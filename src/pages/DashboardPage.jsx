import React, { useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import AnimatedPage from '../components/AnimatedPage';
import StatCard from '../components/dashboard/StatCard';
import ActivityItem from '../components/dashboard/ActivityItem';
import BarChartIngresos from '../components/dashboard/BarChartIngresos';
import DocumentosPendientes from '../components/dashboard/DocumentosPendientes';
import RenunciasPendientes from '../components/dashboard/RenunciasPendientes';
import GraficoOcupacion from '../components/dashboard/GraficoOcupacion';
import { getRenuncias } from '../utils/storage'; // Necesitamos una nueva función en storage

// Debes añadir esta nueva función en src/utils/storage.js
// export const getRenuncias = () => getData("renuncias");
// (Asegúrate de que getData esté exportada o disponible en ese archivo)

const DashboardPage = () => {
    const { isLoading, viviendas, clientes, abonos, recargarDatos } = useData();
    const [renuncias, setRenuncias] = React.useState([]);

    useEffect(() => {
        const fetchRenuncias = async () => {
            const renunciasData = await getRenuncias();
            setRenuncias(renunciasData.filter(r => r.estadoDevolucion === 'Pendiente'));
        }
        fetchRenuncias();
    }, [abonos]); // Se recarga si cambian los abonos, lo que implica un cambio de estado

    const stats = useMemo(() => {
        const totalViviendas = viviendas.length;
        const viviendasOcupadas = viviendas.filter(v => v.clienteId !== null).length;
        const viviendasDisponibles = totalViviendas - viviendasOcupadas;
        const totalClientes = clientes.length;
        const totalRecaudado = abonos.reduce((sum, abono) => sum + (abono.monto || 0), 0);
        return { totalViviendas, viviendasOcupadas, viviendasDisponibles, totalClientes, totalRecaudado };
    }, [viviendas, clientes, abonos]);

    const chartDataOcupacion = useMemo(() => [
        { name: 'Ocupadas', value: stats.viviendasOcupadas },
        { name: 'Disponibles', value: stats.viviendasDisponibles },
    ], [stats.viviendasOcupadas, stats.viviendasDisponibles]);

    const actividadReciente = useMemo(() => {
        const ultimosAbonos = abonos.map(a => ({ ...a, tipo: 'abono' }));
        const clientesNuevos = clientes.map(c => ({ ...c, tipo: 'clienteNuevo', fecha: c.fechaCreacion || new Date(0).toISOString() }));

        return [...ultimosAbonos, ...clientesNuevos]
            .sort((a, b) => new Date(b.fechaPago || b.fecha) - new Date(a.fechaPago || a.fecha))
            .slice(0, 5);
    }, [abonos, clientes]);


    if (isLoading) {
        return <div className="text-center p-10 animate-pulse">Cargando dashboard...</div>;
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
                        <BarChartIngresos data={[]} /> {/* Necesitarías recalcular ingresosPorMes */}
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h2 className="text-xl font-bold text-gray-700 mb-4">Actividad Reciente</h2>
                        <ul>
                            {actividadReciente.length > 0 ? (
                                actividadReciente.map((item, index) => (
                                    <ActivityItem
                                        key={`${item.tipo}-${item.id || index}`}
                                        item={item}
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