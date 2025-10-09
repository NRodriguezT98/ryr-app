// src/pages/admin/AuditMetricsPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AnimatedPage from '../../components/AnimatedPage';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, Area, AreaChart
} from 'recharts';
import {
    ArrowLeft, Activity, Users, TrendingUp, Clock,
    Filter, Calendar, Download, RefreshCw, AlertCircle
} from 'lucide-react';
import { useAuditMetrics } from '../../hooks/admin/useAuditMetrics';
import { AuditMessageBuilder } from '../../utils/auditMessageBuilder';
import { formatDisplayDateWithTime, formatDisplayDate } from '../../utils/textFormatters';

// Colores para gráficos
const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

// Componente para métricas resumidas
const MetricCard = ({ title, value, subtitle, icon: Icon, color = 'blue', trend, onClick }) => (
    <div
        className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 ${onClick ? 'cursor-pointer hover:shadow-xl' : ''} transition-all duration-300`}
        onClick={onClick}
    >
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
                {subtitle && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
                )}
                {trend && (
                    <div className={`flex items-center mt-2 ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                        <TrendingUp size={16} className="mr-1" />
                        <span className="text-sm font-medium">
                            {trend > 0 ? '+' : ''}{trend}% vs ayer
                        </span>
                    </div>
                )}
            </div>
            {Icon && (
                <div className={`p-3 rounded-lg bg-${color}-100 dark:bg-${color}-900/20`}>
                    <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
                </div>
            )}
        </div>
    </div>
);

// Componente para filtros de fecha
const DateRangeFilter = ({ startDate, endDate, onStartDateChange, onEndDateChange, presets, onPresetClick }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Calendar size={20} />
            Filtros de Fecha
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fecha Inicio
                </label>
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => onStartDateChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fecha Fin
                </label>
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => onEndDateChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
            </div>
        </div>

        <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
                <button
                    key={preset.key}
                    onClick={() => onPresetClick(preset)}
                    className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-lg transition-colors"
                >
                    {preset.label}
                </button>
            ))}
        </div>
    </div>
);

// Componente principal
const AuditMetricsPage = () => {
    const {
        metrics,
        loading,
        error,
        dateRange,
        setDateRange,
        refreshMetrics,
        getActionTrend,
        getUserActivityData,
        getActionTypeData,
        getTimelineData,
        getTopUsers,
        exportMetrics
    } = useAuditMetrics();

    const [selectedMetric, setSelectedMetric] = useState(null);

    // Presets de fecha
    const datePresets = [
        { key: 'today', label: 'Hoy', days: 0 },
        { key: 'week', label: 'Esta Semana', days: 7 },
        { key: 'month', label: 'Este Mes', days: 30 },
        { key: 'quarter', label: 'Este Trimestre', days: 90 }
    ];

    const handlePresetClick = (preset) => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - preset.days);

        setDateRange({
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0]
        });
    };

    const handleExport = async () => {
        try {
            const data = await exportMetrics();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `audit-metrics-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting metrics:', error);
        }
    };

    if (loading) {
        return (
            <AnimatedPage>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <RefreshCw className="animate-spin mx-auto mb-4 text-blue-500" size={48} />
                        <p className="text-gray-600 dark:text-gray-400">Cargando métricas de auditoría...</p>
                    </div>
                </div>
            </AnimatedPage>
        );
    }

    if (error) {
        return (
            <AnimatedPage>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
                        <p className="text-red-600 dark:text-red-400 mb-4">Error al cargar las métricas</p>
                        <button
                            onClick={refreshMetrics}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                        >
                            Reintentar
                        </button>
                    </div>
                </div>
            </AnimatedPage>
        );
    }

    return (
        <AnimatedPage>
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <Link
                            to="/admin"
                            className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 inline-flex items-center gap-2 mb-4"
                        >
                            <ArrowLeft size={14} /> Volver al Panel de Administración
                        </Link>
                        <div className="flex items-center gap-4">
                            <Activity size={40} className="text-gray-500" />
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                                    Métricas de Auditoría
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Análisis detallado de la actividad del sistema
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={refreshMetrics}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                            <RefreshCw size={16} />
                            Actualizar
                        </button>
                        <button
                            onClick={handleExport}
                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                            <Download size={16} />
                            Exportar
                        </button>
                    </div>
                </div>

                {/* Filtros de Fecha */}
                <DateRangeFilter
                    startDate={dateRange.start}
                    endDate={dateRange.end}
                    onStartDateChange={(date) => setDateRange(prev => ({ ...prev, start: date }))}
                    onEndDateChange={(date) => setDateRange(prev => ({ ...prev, end: date }))}
                    presets={datePresets}
                    onPresetClick={handlePresetClick}
                />

                {/* Métricas Resumidas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard
                        title="Total de Acciones"
                        value={metrics.totalActions?.toLocaleString() || '0'}
                        subtitle="En el período seleccionado"
                        icon={Activity}
                        color="blue"
                        trend={getActionTrend()}
                    />
                    <MetricCard
                        title="Usuarios Activos"
                        value={metrics.activeUsers || '0'}
                        subtitle="Han realizado acciones"
                        icon={Users}
                        color="green"
                    />
                    <MetricCard
                        title="Promedio Diario"
                        value={metrics.averagePerDay?.toFixed(1) || '0.0'}
                        subtitle="Acciones por día"
                        icon={TrendingUp}
                        color="purple"
                    />
                    <MetricCard
                        title="Acción Más Común"
                        value={metrics.mostCommonAction || 'N/A'}
                        subtitle={`${metrics.mostCommonActionCount || 0} veces`}
                        icon={Clock}
                        color="orange"
                    />
                </div>

                {/* Gráficos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Actividad por Tipo de Acción */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Actividad por Tipo de Acción
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={getActionTypeData()}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                                <XAxis
                                    dataKey="action"
                                    stroke="#6B7280"
                                    fontSize={12}
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                />
                                <YAxis stroke="#6B7280" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1F2937',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: '#F9FAFB'
                                    }}
                                />
                                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Actividad en el Tiempo */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Actividad en el Tiempo
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={getTimelineData()}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                                <XAxis
                                    dataKey="date"
                                    stroke="#6B7280"
                                    fontSize={12}
                                />
                                <YAxis stroke="#6B7280" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1F2937',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: '#F9FAFB'
                                    }}
                                    labelFormatter={(value) => formatDisplayDate(value)}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#3B82F6"
                                    fill="#3B82F6"
                                    fillOpacity={0.6}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Top Usuarios */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Usuarios Más Activos
                        </h3>
                        <div className="space-y-3">
                            {getTopUsers().map((user, index) => (
                                <div key={user.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full ${index === 0 ? 'bg-yellow-100 text-yellow-600' :
                                                index === 1 ? 'bg-gray-100 text-gray-600' :
                                                    index === 2 ? 'bg-orange-100 text-orange-600' :
                                                        'bg-blue-100 text-blue-600'
                                            } flex items-center justify-center font-semibold text-sm`}>
                                            {index + 1}
                                        </div>
                                        <span className="font-medium text-gray-900 dark:text-white">{user.name}</span>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                                        {user.count} acciones
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Distribución por Categoría */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Distribución por Categoría
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={metrics.categoryDistribution || []}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="count"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {(metrics.categoryDistribution || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1F2937',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: '#F9FAFB'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Actividad Reciente */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Actividad Reciente
                    </h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {(metrics.recentActivity || []).map((activity, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {activity.message}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            por {activity.userName}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatDisplayDateWithTime(activity.timestamp)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
};

export default AuditMetricsPage;