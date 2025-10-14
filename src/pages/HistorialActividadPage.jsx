import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useLoadCollections } from '../components/withCollections';
import { useDashboardStats } from '../hooks/useDashboardStats';
import AnimatedPage from '../components/AnimatedPage';
import {
    Activity,
    User,
    Wallet,
    UserX,
    Clock,
    Search,
    Filter,
    Calendar,
    ArrowLeft,
    TrendingUp,
    FileText,
    Eye,
    EyeOff
} from 'lucide-react';
import { formatCurrency, formatDisplayDate, toTitleCase } from '../utils/textFormatters';

const ActivityIcon = ({ tipo }) => {
    const iconProps = { size: 20 };

    switch (tipo) {
        case 'abono':
            return <Wallet {...iconProps} className="text-green-600" />;
        case 'clienteNuevo':
            return <User {...iconProps} className="text-blue-600" />;
        case 'renuncia':
            return <UserX {...iconProps} className="text-red-600" />;
        default:
            return <Activity {...iconProps} className="text-gray-600" />;
    }
};

const ActivityCard = ({ item, clientes, viviendas, showDetails, toggleDetails }) => {
    const getActivityContent = () => {
        switch (item.tipo) {
            case 'abono':
                const cliente = clientes?.find(c => c.id === item.clienteId);
                const clienteNombre = cliente ?
                    `${cliente.datosCliente.nombres} ${cliente.datosCliente.apellidos}` :
                    'Cliente no encontrado';

                // Obtener información de la vivienda
                const vivienda = viviendas?.find(v => v.id === cliente?.viviendaId);
                const viviendaInfo = vivienda ?
                    `Mz ${vivienda.manzana} - Casa ${vivienda.numeroCasa}` :
                    'No asignada';

                // Mapear fuentes de pago a nombres más legibles
                const fuentesNombres = {
                    'cuotaInicial': 'Cuota Inicial',
                    'credito': 'Crédito Hipotecario',
                    'subsidioVivienda': 'Subsidio de Vivienda',
                    'subsidioCaja': 'Subsidio Caja de Compensación',
                    'gastosNotariales': 'Gastos Notariales',
                    'condonacion': 'Condonación'
                };

                const fuentePago = fuentesNombres[item.fuente] || item.fuente || 'No especificada';

                return {
                    title: 'Nuevo Abono Registrado',
                    description: `${toTitleCase(clienteNombre)} realizó un pago`,
                    amount: formatCurrency(item.monto),
                    detailsStructured: {
                        'Cliente': clienteNombre,
                        'Vivienda': viviendaInfo,
                        'Monto': formatCurrency(item.monto),
                        'Fuente de pago': fuentePago
                    },
                    gradient: 'from-green-500/10 to-emerald-500/10',
                    borderColor: 'border-green-200 dark:border-green-700'
                };

            case 'clienteNuevo':
                const nombreCompleto = item.datosCliente ?
                    `${item.datosCliente.nombres} ${item.datosCliente.apellidos}` :
                    'Cliente';

                // Obtener información de la vivienda asignada al cliente
                const clienteVivienda = viviendas?.find(v => v.id === item.viviendaId);
                const viviendaAsignada = clienteVivienda ?
                    `Mz ${clienteVivienda.manzana} - Casa ${clienteVivienda.numeroCasa}` :
                    'Sin vivienda asignada';

                return {
                    title: 'Cliente Registrado',
                    description: `${toTitleCase(nombreCompleto)} se unió al sistema`,
                    amount: null,
                    detailsStructured: {
                        'Nombre completo': nombreCompleto,
                        'Documento': item.datosCliente?.cedula || 'No registrado',
                        'Teléfono': item.datosCliente?.telefono || 'No registrado',
                        'Vivienda asignada': viviendaAsignada
                    },
                    gradient: 'from-blue-500/10 to-cyan-500/10',
                    borderColor: 'border-blue-200 dark:border-blue-700'
                };

            case 'renuncia':
                // Obtener información de la vivienda relacionada con la renuncia
                const clienteRenuncia = clientes?.find(c => c.datosCliente?.nombres && c.datosCliente?.apellidos &&
                    `${c.datosCliente.nombres} ${c.datosCliente.apellidos}`.toLowerCase() === item.clienteNombre.toLowerCase());
                const viviendaRenuncia = viviendas?.find(v => v.id === clienteRenuncia?.viviendaId);
                const viviendaInfoRenuncia = viviendaRenuncia ?
                    `Mz ${viviendaRenuncia.manzana} - Casa ${viviendaRenuncia.numeroCasa}` :
                    'No identificada';

                return {
                    title: 'Renuncia Procesada',
                    description: `${toTitleCase(item.clienteNombre)} renunció al proceso`,
                    amount: item.monto ? formatCurrency(item.monto) : null,
                    detailsStructured: {
                        'Cliente': item.clienteNombre,
                        'Vivienda': viviendaInfoRenuncia,
                        'Estado de devolución': item.estadoDevolucion || 'Pendiente',
                        'Monto a devolver': item.monto ? formatCurrency(item.monto) : 'Sin devolución'
                    },
                    gradient: 'from-red-500/10 to-pink-500/10',
                    borderColor: 'border-red-200 dark:border-red-700'
                };

            default:
                return {
                    title: 'Actividad del Sistema',
                    description: 'Actividad registrada en el sistema',
                    amount: null,
                    detailsStructured: {
                        'Tipo': 'Actividad general',
                        'Estado': 'Procesado'
                    },
                    gradient: 'from-gray-500/10 to-slate-500/10',
                    borderColor: 'border-gray-200 dark:border-gray-700'
                };
        }
    };

    const content = getActivityContent();
    const timeAgo = formatDisplayDate(item.fecha);
    const itemKey = `${item.tipo}-${item.id}`;

    return (
        <div className={`p-4 md:p-6 rounded-2xl bg-gradient-to-r ${content.gradient} border-2 ${content.borderColor} transition-all duration-300 hover:shadow-lg`}>
            <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-white dark:bg-gray-800 shadow-md flex-shrink-0">
                    <ActivityIcon tipo={item.tipo} />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-800 dark:text-gray-200 text-base mb-2">
                                {content.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                                {content.description}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500">
                                <Clock size={14} />
                                <span>{timeAgo}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                            {content.amount && (
                                <span className="font-bold text-lg text-gray-800 dark:text-gray-200 px-3 py-1 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                                    {content.amount}
                                </span>
                            )}
                            <button
                                onClick={() => toggleDetails(itemKey)}
                                className="p-2 rounded-lg bg-white/70 dark:bg-gray-800/70 hover:bg-white dark:hover:bg-gray-700 transition-colors duration-200"
                                title={showDetails ? 'Ocultar detalles' : 'Ver detalles'}
                            >
                                {showDetails ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* Detalles expandibles */}
                    {showDetails && (
                        <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-600">
                            <div className="flex items-start gap-3">
                                <FileText size={16} className="text-gray-500 dark:text-gray-400 mt-1 flex-shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <h4 className="font-semibold text-gray-700 dark:text-gray-300 text-sm mb-3">
                                        Información detallada:
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {Object.entries(content.detailsStructured || {}).map(([key, value]) => (
                                            <div key={key} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                                                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                                                    {key}
                                                </div>
                                                <div className="text-sm text-gray-800 dark:text-gray-200 font-medium break-words">
                                                    {value}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const HistorialActividadPage = () => {
    const navigate = useNavigate();

    // ✅ Cargar colecciones necesarias
    const { isReady: collectionsReady } = useLoadCollections(['viviendas', 'clientes', 'abonos', 'renuncias']);
    const { viviendas, clientes, abonos, renuncias } = useData();
    const { actividadReciente } = useDashboardStats({ viviendas, clientes, abonos, renuncias });

    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('todos');
    const [expandedItems, setExpandedItems] = useState(new Set());

    const toggleDetails = (itemKey) => {
        setExpandedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(itemKey)) {
                newSet.delete(itemKey);
            } else {
                newSet.add(itemKey);
            }
            return newSet;
        });
    };

    const filteredActivity = useMemo(() => {
        if (!actividadReciente) return [];

        return actividadReciente.filter(item => {
            // Filtro por tipo
            if (filterType !== 'todos' && item.tipo !== filterType) {
                return false;
            }

            // Filtro por búsqueda
            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                const itemText = JSON.stringify(item).toLowerCase();

                // También buscar en nombres de clientes si es un abono
                if (item.tipo === 'abono') {
                    const cliente = clientes?.find(c => c.id === item.clienteId);
                    if (cliente) {
                        const nombreCompleto = `${cliente.datosCliente.nombres} ${cliente.datosCliente.apellidos}`.toLowerCase();
                        if (nombreCompleto.includes(searchLower)) {
                            return true;
                        }
                    }
                }

                return itemText.includes(searchLower);
            }

            return true;
        });
    }, [actividadReciente, searchTerm, filterType, clientes]);

    const activityStats = useMemo(() => {
        const total = actividadReciente?.length || 0;
        const abonos = actividadReciente?.filter(item => item.tipo === 'abono').length || 0;
        const clientes = actividadReciente?.filter(item => item.tipo === 'clienteNuevo').length || 0;
        const renuncias = actividadReciente?.filter(item => item.tipo === 'renuncia').length || 0;

        return { total, abonos, clientes, renuncias };
    }, [actividadReciente]);

    // ✅ Mostrar loader si las colecciones no están listas
    if (!collectionsReady) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <Activity className="w-16 h-16 text-blue-600 animate-pulse mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                        Cargando Historial
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Preparando actividad reciente...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <AnimatedPage>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                <div className="w-full px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-4 mb-6">
                            <button
                                onClick={() => navigate('/')}
                                className="p-2 rounded-xl bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700"
                            >
                                <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
                            </button>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
                                    Historial de Actividad
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">
                                    Registro completo de todas las actividades del sistema
                                </p>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                        <TrendingUp size={20} className="text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                                            {activityStats.total}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                                        <Wallet size={20} className="text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                                            {activityStats.abonos}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Abonos</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                        <User size={20} className="text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                                            {activityStats.clientes}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Clientes</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                                        <UserX size={20} className="text-red-600 dark:text-red-400" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                                            {activityStats.renuncias}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Renuncias</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 mb-6">
                            <div className="flex flex-col md:flex-row gap-4">
                                {/* Search */}
                                <div className="flex-1 relative">
                                    <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Buscar en historial..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>

                                {/* Filter */}
                                <div className="relative">
                                    <Filter size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <select
                                        value={filterType}
                                        onChange={(e) => setFilterType(e.target.value)}
                                        className="pl-10 pr-8 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white min-w-[160px]"
                                    >
                                        <option value="todos">Todos</option>
                                        <option value="abono">Abonos</option>
                                        <option value="clienteNuevo">Clientes</option>
                                        <option value="renuncia">Renuncias</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Activity List */}
                    <div className="space-y-4">
                        {filteredActivity.length > 0 ? (
                            filteredActivity.map((item) => {
                                const itemKey = `${item.tipo}-${item.id}`;
                                return (
                                    <ActivityCard
                                        key={itemKey}
                                        item={item}
                                        clientes={clientes}
                                        viviendas={viviendas}
                                        showDetails={expandedItems.has(itemKey)}
                                        toggleDetails={toggleDetails}
                                    />
                                );
                            })
                        ) : (
                            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                                <Activity size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                                <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
                                    {searchTerm || filterType !== 'todos' ? 'No se encontraron resultados' : 'No hay actividad registrada'}
                                </p>
                                <p className="text-gray-400 dark:text-gray-500">
                                    {searchTerm || filterType !== 'todos' ? 'Intenta con otros criterios de búsqueda' : 'La actividad aparecerá aquí cuando se registren movimientos'}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Results count */}
                    {filteredActivity.length > 0 && (
                        <div className="mt-8 text-center">
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                Mostrando {filteredActivity.length} de {activityStats.total} registros
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AnimatedPage>
    );
};

export default HistorialActividadPage;