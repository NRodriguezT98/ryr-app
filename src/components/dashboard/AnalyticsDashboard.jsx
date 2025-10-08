import React, { useMemo } from 'react';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { formatCurrency } from '../../utils/textFormatters';
import {
    TrendingUp,
    DollarSign,
    BarChart3,
    PieChart as PieChartIcon,
    Calendar,
    Home
} from 'lucide-react';

// Paleta de colores moderna
const COLORS = {
    primary: '#3B82F6',
    secondary: '#10B981',
    accent: '#F59E0B',
    danger: '#EF4444',
    purple: '#8B5CF6',
    teal: '#14B8A6',
    rose: '#F43F5E',
    gradient: ['#3B82F6', '#1E40AF', '#1E3A8A']
};

// Tooltip personalizado para los gráficos
const CustomTooltip = ({ active, payload, label, formatter, labelFormatter }) => {
    if (!active || !payload || !payload.length) return null;

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700">
            <p className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                {labelFormatter ? labelFormatter(label) : label}
            </p>
            {payload.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                    <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-gray-600 dark:text-gray-400 text-sm">
                        {entry.name}:
                    </span>
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                        {formatter ? formatter(entry.value) : entry.value}
                    </span>
                </div>
            ))}
        </div>
    );
};

// Componente de gráfico de ingresos mejorado
const AdvancedIncomeChart = ({ data }) => {
    const processedData = useMemo(() => {
        if (!data || data.length === 0) return [];

        return data.map((item, index) => ({
            ...item,
            trend: index > 0 ? item.Ingresos - data[index - 1].Ingresos : 0,
            cumulative: data.slice(0, index + 1).reduce((sum, curr) => sum + curr.Ingresos, 0)
        }));
    }, [data]);

    if (!processedData.length) {
        return (
            <div className="flex items-center justify-center h-80 text-gray-500 dark:text-gray-400">
                <div className="text-center">
                    <DollarSign size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No hay datos de ingresos disponibles</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={processedData}
                    margin={{
                        top: 20,
                        right: 10,
                        left: 10,
                        bottom: 5
                    }}
                >
                    <defs>
                        <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.9} />
                            <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.6} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                        dataKey="name"
                        tick={{ fill: '#6B7280', fontSize: 10 }}
                        stroke="#9CA3AF"
                        interval={0}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                    />
                    <YAxis
                        tick={{ fill: '#6B7280', fontSize: 10 }}
                        stroke="#9CA3AF"
                        tickFormatter={(value) => formatCurrency(value).replace('$ ', '$')}
                        width={80}
                    />
                    <Tooltip
                        content={<CustomTooltip formatter={formatCurrency} />}
                    />
                    <Bar
                        dataKey="Ingresos"
                        fill="url(#incomeGradient)"
                        radius={[4, 4, 0, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

// Componente de gráfico de ocupación mejorado
const AdvancedOccupancyChart = ({ data }) => {
    const chartData = useMemo(() => {
        if (!data || data.length === 0) return [];

        const total = data.reduce((sum, item) => sum + item.value, 0);
        return data.map((item, index) => ({
            ...item,
            percentage: total > 0 ? ((item.value / total) * 100).toFixed(1) : 0,
            color: index === 0 ? COLORS.secondary : COLORS.accent
        }));
    }, [data]);

    if (!chartData.length) {
        return (
            <div className="flex items-center justify-center h-80 text-gray-500 dark:text-gray-400">
                <div className="text-center">
                    <Home size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No hay datos de ocupación disponibles</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-64 md:h-80 flex flex-col">
            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="45%"
                            innerRadius={30}
                            outerRadius={60}
                            paddingAngle={3}
                            dataKey="value"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            content={<CustomTooltip formatter={(value) => `${value} viviendas`} />}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Leyenda personalizada - responsive */}
            <div className="flex flex-wrap justify-center gap-2 md:gap-4 mt-2 px-2">
                {chartData.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-2 min-w-0">
                        <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: item.color }}
                        />
                        <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            {item.name}: <span className="font-semibold">{item.value}</span> ({item.percentage}%)
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Componente principal de analytics
const AnalyticsDashboard = ({ ingresosPorMes, chartDataOcupacion }) => {
    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
            {/* Gráfico de Ingresos */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-6 border border-gray-100 dark:border-gray-700">
                <div className="flex items-start justify-between mb-4 md:mb-6">
                    <div className="min-w-0 flex-1">
                        <h3 className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-100">
                            Ingresos Mensuales
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Evolución de los ingresos por mes
                        </p>
                    </div>
                    <div className="p-2 md:p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 flex-shrink-0">
                        <BarChart3 className="text-blue-600 dark:text-blue-400" size={20} />
                    </div>
                </div>
                <AdvancedIncomeChart data={ingresosPorMes} />
            </div>

            {/* Gráfico de Ocupación */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-6 border border-gray-100 dark:border-gray-700">
                <div className="flex items-start justify-between mb-4 md:mb-6">
                    <div className="min-w-0 flex-1">
                        <h3 className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-100">
                            Ocupación Actual
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Distribución de viviendas
                        </p>
                    </div>
                    <div className="p-2 md:p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex-shrink-0">
                        <PieChartIcon className="text-emerald-600 dark:text-emerald-400" size={20} />
                    </div>
                </div>
                <AdvancedOccupancyChart data={chartDataOcupacion} />
            </div>
        </div>
    );
};

export default AnalyticsDashboard;