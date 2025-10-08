import React from 'react';
import { Link } from 'react-router-dom';
import {
    Activity,
    User,
    Wallet,
    UserX,
    Clock,
    ArrowRight,
    TrendingUp
} from 'lucide-react';
import { formatCurrency, formatDisplayDate, toTitleCase } from '../../utils/textFormatters';

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

const ActivityItem = ({ item, clientes }) => {
    const getActivityContent = () => {
        switch (item.tipo) {
            case 'abono':
                const cliente = clientes?.find(c => c.id === item.clienteId);
                const clienteNombre = cliente ?
                    `${cliente.datosCliente.nombres} ${cliente.datosCliente.apellidos}` :
                    'Cliente no encontrado';

                return {
                    title: 'Nuevo Abono Registrado',
                    description: `${toTitleCase(clienteNombre)} realizó un pago`,
                    amount: formatCurrency(item.monto),
                    link: cliente ? `/clientes/detalle/${cliente.id}` : null,
                    gradient: 'from-green-500/10 to-emerald-500/10'
                };

            case 'clienteNuevo':
                const nombreCompleto = item.datosCliente ?
                    `${item.datosCliente.nombres} ${item.datosCliente.apellidos}` :
                    'Cliente';

                return {
                    title: 'Cliente Registrado',
                    description: `${toTitleCase(nombreCompleto)} se unió al sistema`,
                    amount: null,
                    link: `/clientes/detalle/${item.id.replace('cliente-', '')}`,
                    gradient: 'from-blue-500/10 to-cyan-500/10'
                };

            case 'renuncia':
                return {
                    title: 'Renuncia Procesada',
                    description: `${toTitleCase(item.clienteNombre)} renunció al proceso`,
                    amount: item.monto ? formatCurrency(item.monto) : null,
                    link: `/renuncias`,
                    gradient: 'from-red-500/10 to-pink-500/10'
                };

            default:
                return {
                    title: 'Actividad',
                    description: 'Actividad del sistema',
                    amount: null,
                    link: null,
                    gradient: 'from-gray-500/10 to-slate-500/10'
                };
        }
    };

    const content = getActivityContent();
    const timeAgo = formatDisplayDate(item.fecha);

    const ItemContent = () => (
        <div className={`p-3 md:p-4 rounded-xl bg-gradient-to-r ${content.gradient} border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg group`}>
            <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm flex-shrink-0">
                    <ActivityIcon tipo={item.tipo} />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm mb-1">
                                {content.title}
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 text-xs mb-2 line-clamp-2">
                                {content.description}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                                <Clock size={12} />
                                <span className="truncate">{timeAgo}</span>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            {content.amount && (
                                <span className="font-bold text-xs md:text-sm text-gray-800 dark:text-gray-200">
                                    {content.amount}
                                </span>
                            )}
                            {content.link && (
                                <ArrowRight
                                    size={14}
                                    className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 group-hover:translate-x-1 transition-all duration-300"
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return content.link ? (
        <Link to={content.link} className="block">
            <ItemContent />
        </Link>
    ) : (
        <ItemContent />
    );
};

const SmartNotifications = ({ actividadReciente, clientes, renuncias }) => {
    // Filtrar renuncias que están realmente pendientes (no cerradas)
    const renunciasPendientes = renuncias?.filter(r =>
        r.estadoDevolucion === 'Pendiente' &&
        r.estadoDevolucion !== 'Cerrada' &&
        r.estadoDevolucion !== 'Pagada'
    ) || [];

    const notificationsData = {
        hasActivity: actividadReciente && actividadReciente.length > 0,
        hasPendingRenuncias: renunciasPendientes.length > 0,
        activityCount: actividadReciente?.length || 0,
        renunciasCount: renunciasPendientes.length
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div className="min-w-0 flex-1">
                    <h3 className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-100">
                        Actividad Reciente
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Últimos movimientos del sistema
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="p-2 md:p-3 rounded-full bg-orange-100 dark:bg-orange-900/30">
                        <TrendingUp className="text-orange-600 dark:text-orange-400" size={20} />
                    </div>
                    {(notificationsData.hasActivity || notificationsData.hasPendingRenuncias) && (
                        <div className="px-2 md:px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-xs font-medium">
                            {notificationsData.activityCount + notificationsData.renunciasCount} nuevo{notificationsData.activityCount + notificationsData.renunciasCount !== 1 ? 's' : ''}
                        </div>
                    )}
                </div>
            </div>

            {/* Renuncias pendientes destacadas */}
            {notificationsData.hasPendingRenuncias && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-red-800 dark:text-red-300 text-sm">
                            ⚠️ Renuncias Pendientes
                        </h4>
                        <Link
                            to="/renuncias"
                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 text-xs font-medium hover:underline"
                        >
                            Ver todas →
                        </Link>
                    </div>
                    <p className="text-red-700 dark:text-red-400 text-xs">
                        {notificationsData.renunciasCount} renuncia{notificationsData.renunciasCount !== 1 ? 's' : ''} requiere{notificationsData.renunciasCount === 1 ? '' : 'n'} tu atención
                    </p>
                </div>
            )}

            {/* Lista de actividad */}
            <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                {notificationsData.hasActivity ? (
                    actividadReciente.map((item) => (
                        <ActivityItem
                            key={`${item.tipo}-${item.id}`}
                            item={item}
                            clientes={clientes}
                        />
                    ))
                ) : (
                    <div className="text-center py-12">
                        <Activity size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            No hay actividad reciente
                        </p>
                        <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                            La actividad aparecerá aquí cuando se registren nuevos movimientos
                        </p>
                    </div>
                )}
            </div>

            {/* Footer con link para ver más */}
            {notificationsData.hasActivity && actividadReciente.length >= 5 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Link
                        to="/historial"
                        className="block text-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium hover:underline"
                    >
                        Ver historial completo →
                    </Link>
                </div>
            )}
        </div>
    );
};

export default SmartNotifications;