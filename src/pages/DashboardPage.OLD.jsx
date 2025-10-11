import React, { Suspense, lazy } from 'react';
import { useData } from '../context/DataContext';
import { useDashboardStats } from '../hooks/useDashboardStats';
import AnimatedPage from '../components/AnimatedPage';
import HeroMetrics from '../components/dashboard/HeroMetrics';
import QuickActionsHub from '../components/dashboard/QuickActionsHub';
import { Sparkles, Loader } from 'lucide-react';

// Lazy loading de componentes pesados con gráficas
const AnalyticsDashboard = lazy(() => import('../components/dashboard/AnalyticsDashboard'));
const SmartNotifications = lazy(() => import('../components/dashboard/SmartNotifications'));

const LoadingScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
            <div className="relative">
                <Loader className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
                <Sparkles className="w-8 h-8 text-purple-500 absolute -top-2 -right-2 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                Cargando Panel de Control
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
                Preparando la experiencia perfecta para ti...
            </p>
        </div>
    </div>
);

// Loading skeleton para componentes lazy
const ChartSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded"></div>
    </div>
);

const DashboardPage = () => {
    const { isLoading, viviendas, clientes, abonos, renuncias } = useData();

    const {
        stats,
        chartDataOcupacion,
        ingresosPorMes,
        actividadReciente
    } = useDashboardStats({ viviendas, clientes, abonos, renuncias });

    if (isLoading) {
        return <LoadingScreen />;
    }

    return (
        <AnimatedPage>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                <div className="w-full px-4 sm:px-6 lg:px-8 py-4 md:py-8 max-w-7xl mx-auto">
                    {/* Hero Section - Métricas Principales */}
                    <div className="mb-8">
                        <HeroMetrics stats={stats} />
                    </div>

                    {/* Quick Actions Hub */}
                    <div className="mb-8">
                        <QuickActionsHub />
                    </div>

                    {/* Analytics y Notificaciones */}
                    <div className="space-y-6 mb-8">
                        {/* Analytics Dashboard con lazy loading */}
                        <Suspense fallback={<ChartSkeleton />}>
                            <AnalyticsDashboard
                                ingresosPorMes={ingresosPorMes}
                                chartDataOcupacion={chartDataOcupacion}
                            />
                        </Suspense>

                        {/* Smart Notifications con lazy loading */}
                        <Suspense fallback={<ChartSkeleton />}>
                            <SmartNotifications
                                actividadReciente={actividadReciente}
                                clientes={clientes}
                                renuncias={renuncias}
                            />
                        </Suspense>
                    </div>

                    {/* Footer del Dashboard */}
                    <div className="text-center py-6">
                        <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                            <Sparkles size={16} />
                            <span>Panel de Control RyR - Gestión Inmobiliaria Inteligente</span>
                            <Sparkles size={16} />
                        </div>
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
};

export default DashboardPage;