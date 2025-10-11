import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import {
    Home,
    Users,
    CheckCircle,
    Wallet,
    TrendingUp,
    TrendingDown,
    Minus,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import { formatCurrency } from '../../utils/textFormatters';

// Componentes memoizados para evitar re-renders
const TrendIcon = ({ trend }) => {
    if (trend > 0) return <TrendingUp className="text-green-500" size={16} />;
    if (trend < 0) return <TrendingDown className="text-red-500" size={16} />;
    return <Minus className="text-gray-400" size={16} />;
};

const TrendBadge = ({ trend }) => {
    if (trend === 0) return null;

    const isPositive = trend > 0;
    const bgColor = isPositive ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30';
    const textColor = isPositive ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300';
    const Icon = isPositive ? ArrowUpRight : ArrowDownRight;

    return (
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${bgColor}`}>
            <Icon size={12} className={textColor} />
            <span className={`text-xs font-medium ${textColor}`}>
                {Math.abs(trend)}%
            </span>
        </div>
    );
};

const ModernStatCard = ({
    title,
    value,
    icon: Icon,
    gradient,
    trend = 0,
    subtitle,
    to,
    clickable = true,
    prefix = '',
    suffix = ''
}) => {
    const CardContent = () => (
        <div className={`relative overflow-hidden rounded-2xl p-6 transition-all duration-300 ${clickable ? 'transform hover:scale-105 hover:shadow-2xl cursor-pointer' : ''
            } bg-gradient-to-br ${gradient} group`}>
            {/* Patrón de fondo sutil */}
            <div className="absolute inset-0 bg-white/5 bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.1),transparent_50%)]"></div>

            <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                        <Icon size={28} className="text-white" />
                    </div>
                    <TrendBadge trend={trend} />
                </div>

                <div className="space-y-1">
                    <p className="text-white/80 text-sm font-medium">{title}</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-white/60 text-lg">{prefix}</span>
                        <h3 className="text-3xl font-bold text-white">{value}</h3>
                        <span className="text-white/60 text-lg">{suffix}</span>
                    </div>
                    {subtitle && (
                        <p className="text-white/60 text-xs">{subtitle}</p>
                    )}
                </div>

                {/* Indicador de interactividad */}
                {clickable && (
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <ArrowUpRight className="text-white/60" size={20} />
                    </div>
                )}
            </div>

            {/* Efecto de brillo animado */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 skew-x-12"></div>
        </div>
    );

    return clickable && to ? (
        <Link to={to} className="block">
            <CardContent />
        </Link>
    ) : (
        <CardContent />
    );
};

const HeroMetrics = ({ stats, previousStats = null }) => {
    // Calcular tendencias si tenemos datos previos
    const calculateTrend = (current, previous) => {
        if (!previous || previous === 0) return 0;
        return Math.round(((current - previous) / previous) * 100);
    };

    const metrics = [
        {
            title: "Total de Viviendas",
            value: stats.totalViviendas,
            icon: Home,
            gradient: "from-blue-600 via-blue-700 to-blue-800",
            trend: previousStats ? calculateTrend(stats.totalViviendas, previousStats.totalViviendas) : 0,
            to: "/viviendas/listar",
            subtitle: "En el sistema"
        },
        {
            title: "Clientes Activos",
            value: stats.totalClientes,
            icon: Users,
            gradient: "from-emerald-600 via-emerald-700 to-emerald-800",
            trend: previousStats ? calculateTrend(stats.totalClientes, previousStats.totalClientes) : 0,
            to: "/clientes/listar",
            subtitle: "Con procesos activos"
        },
        {
            title: "Viviendas Disponibles",
            value: stats.viviendasDisponibles,
            icon: CheckCircle,
            gradient: "from-amber-600 via-amber-700 to-amber-800",
            trend: previousStats ? calculateTrend(stats.viviendasDisponibles, previousStats.viviendasDisponibles) : 0,
            to: "/viviendas/listar",
            subtitle: "Listas para asignar"
        },
        {
            title: "Total Recaudado",
            value: formatCurrency(stats.totalRecaudado),
            icon: Wallet,
            gradient: "from-purple-600 via-purple-700 to-purple-800",
            trend: previousStats ? calculateTrend(stats.totalRecaudado, previousStats.totalRecaudado) : 0,
            to: "/abonos/listar",
            subtitle: "Este período"
        }
    ];

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-2">
                    Panel de Control RyR
                </h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {metrics.map((metric, index) => (
                    <div key={metric.title} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                        <ModernStatCard {...metric} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HeroMetrics;