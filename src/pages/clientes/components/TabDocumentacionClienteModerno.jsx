// TabDocumentacionClienteModerno.jsx - Versión completamente modernizada 🚀
import React, { useState, useMemo } from 'react';
import { useDocumentacion } from '../../../hooks/clientes/useDocumentacion';
import DocumentoRow from '../../../components/documentos/DocumentoRow';
import {
    AlertTriangle,
    Archive,
    FileText,
    FolderOpen,
    Search,
    Filter,
    CheckCircle2,
    Clock,
    AlertCircle,
    Sparkles,
    TrendingUp,
    Shield,
    Zap,
    Target,
    BarChart3
} from 'lucide-react';

// Componente de estadística moderna
const ModernStatCard = ({ icon: Icon, label, value, color = "blue", trend, delay = 0 }) => {
    const colorVariants = {
        blue: "from-blue-500 to-blue-600",
        green: "from-green-500 to-green-600",
        orange: "from-orange-500 to-orange-600",
        purple: "from-purple-500 to-purple-600"
    };

    return (
        <div
            className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
        >
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {value}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                        {label}
                    </div>
                    {trend && (
                        <div className="flex items-center gap-1 mt-1">
                            <TrendingUp size={12} className="text-green-500" />
                            <span className="text-xs text-green-600 dark:text-green-400 font-semibold">
                                {trend}
                            </span>
                        </div>
                    )}
                </div>
                <div className={`p-3 rounded-lg bg-gradient-to-br ${colorVariants[color]} shadow-lg`}>
                    <Icon size={20} className="text-white" />
                </div>
            </div>
        </div>
    );
};

// Componente de progreso circular
const CircularProgress = ({ percentage, size = 80, strokeWidth = 6 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="none"
                    className="text-gray-200 dark:text-gray-700"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="url(#progressGradient)"
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                />
                <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3B82F6" />
                        <stop offset="100%" stopColor="#8B5CF6" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {Math.round(percentage)}%
                </span>
            </div>
        </div>
    );
};

// Componente de filtro moderno
const ModernFilterButton = ({ active, onClick, children, icon: Icon, count }) => (
    <button
        onClick={onClick}
        className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all
            ${active
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }
        `}
    >
        <Icon size={16} />
        {children}
        {count !== undefined && (
            <span className={`
                px-2 py-0.5 rounded-full text-xs font-bold
                ${active ? 'bg-white/20' : 'bg-blue-500 text-white'}
            `}>
                {count}
            </span>
        )}
    </button>
);

// Componente de aviso modernizado
const ModernAlert = ({ type = "info", icon: Icon, title, children, delay = 0 }) => {
    const variants = {
        info: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700",
        warning: "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700",
        success: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700"
    };

    const iconColors = {
        info: "text-blue-500 dark:text-blue-400",
        warning: "text-orange-500 dark:text-orange-400",
        success: "text-green-500 dark:text-green-400"
    };

    const textColors = {
        info: "text-blue-700 dark:text-blue-300",
        warning: "text-orange-700 dark:text-orange-300",
        success: "text-green-700 dark:text-green-300"
    };

    return (
        <div
            className={`rounded-lg border p-4 ${variants[type]}`}
        >
            <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg bg-white dark:bg-gray-800 ${iconColors[type]}`}>
                    <Icon size={20} />
                </div>
                <div className="flex-1">
                    <h4 className={`font-bold text-sm mb-1 ${textColors[type]}`}>
                        {title}
                    </h4>
                    <div className={`text-sm ${textColors[type]}`}>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

const TabDocumentacionClienteModerno = ({ cliente, renuncia }) => {
    const { filtro, setFiltro, documentosFiltrados } = useDocumentacion(cliente, renuncia);
    const [searchTerm, setSearchTerm] = useState('');

    const isReadOnly = cliente.status === 'renunciado' || cliente.status === 'inactivo' || cliente.status === 'enProcesoDeRenuncia';

    // Estadísticas calculadas
    const stats = useMemo(() => {
        const total = documentosFiltrados.length;
        const subidos = documentosFiltrados.filter(doc => doc.url).length;
        const pendientes = total - subidos;
        const completionPercentage = total > 0 ? (subidos / total) * 100 : 0;

        return {
            total,
            subidos,
            pendientes,
            completionPercentage
        };
    }, [documentosFiltrados]);

    // Filtrado con búsqueda
    const documentosFiltradosConBusqueda = useMemo(() => {
        if (!searchTerm) return documentosFiltrados;
        return documentosFiltrados.filter(doc =>
            doc.label.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [documentosFiltrados, searchTerm]);

    return (
        <div
            className="space-y-6"
        >
            {/* Header moderno con título y estadísticas */}
            <div
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                                <FolderOpen size={24} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">
                                    Repositorio de Documentos
                                </h2>
                                <p className="text-blue-100 text-sm">
                                    Gestión centralizada de documentación
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <CircularProgress percentage={stats.completionPercentage} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ModernStatCard
                    icon={FileText}
                    label="Total Documentos"
                    value={stats.total}
                    color="blue"
                    delay={0.1}
                />
                <ModernStatCard
                    icon={CheckCircle2}
                    label="Subidos"
                    value={stats.subidos}
                    color="green"
                    trend={`${Math.round(stats.completionPercentage)}%`}
                    delay={0.2}
                />
                <ModernStatCard
                    icon={Clock}
                    label="Pendientes"
                    value={stats.pendientes}
                    color="orange"
                    delay={0.3}
                />
            </div>

            {/* Alertas de estado */}

            {(cliente.status === 'renunciado' || cliente.status === 'inactivo') && (
                <ModernAlert
                    type="info"
                    icon={Archive}
                    title="Modo Archivo"
                    delay={0.4}
                >
                    Esta es la documentación que se reunió del cliente antes de la renuncia.
                </ModernAlert>
            )}

            {cliente.tieneRenunciaPendiente && (
                <ModernAlert
                    type="warning"
                    icon={AlertTriangle}
                    title="Modo de Solo Lectura"
                    delay={0.5}
                >
                    La gestión de documentos está pausada durante el proceso de renuncia.
                </ModernAlert>
            )}


            {/* Controles de filtrado y búsqueda */}
            <div
                className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
            >
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                    {/* Filtros */}
                    <div className="flex items-center gap-2">
                        <Filter size={20} className="text-gray-500 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">
                            Filtros:
                        </span>
                        <div className="flex gap-2">
                            <ModernFilterButton
                                active={filtro === 'importantes'}
                                onClick={() => setFiltro('importantes')}
                                icon={Target}
                                count={filtro === 'importantes' ? documentosFiltrados.length : undefined}
                            >
                                Importantes
                            </ModernFilterButton>
                            <ModernFilterButton
                                active={filtro === 'todos'}
                                onClick={() => setFiltro('todos')}
                                icon={BarChart3}
                                count={filtro === 'todos' ? documentosFiltrados.length : undefined}
                            >
                                Todos
                            </ModernFilterButton>
                        </div>
                    </div>

                    {/* Búsqueda */}
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar documentos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Lista de documentos */}
            <div
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
                <div className="divide-y dark:divide-gray-700">

                    {documentosFiltradosConBusqueda.length > 0 ? (
                        documentosFiltradosConBusqueda.map((doc, index) => (
                            <div
                                key={doc.id || doc.label}>
                                <DocumentoRow
                                    label={doc.label}
                                    isRequired={true}
                                    currentFileUrl={doc.url}
                                    estado={doc.estado || 'Subido'}
                                    isReadOnly={isReadOnly}
                                />
                            </div>
                        ))
                    ) : (
                        <div
                            className="p-12 text-center"
                        >
                            <div className="flex flex-col items-center gap-4">
                                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full">
                                    <FileText size={32} className="text-gray-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                        No hay documentos
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        {searchTerm
                                            ? `No se encontraron documentos que coincidan con "${searchTerm}"`
                                            : "No hay documentos que coincidan con el filtro actual"
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Footer decorativo */}
            <div
                className="text-center py-4"
            >
                <div className="flex items-center justify-center gap-2 text-gray-400 dark:text-gray-500 text-sm">
                    <Sparkles size={16} />
                    <span>Sistema de Documentación RyR</span>
                    <Sparkles size={16} />
                </div>
            </div>
        </div>
    );
};

export default TabDocumentacionClienteModerno;


