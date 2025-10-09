import React, { Fragment, memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { MoreVertical, Hash, Pencil, Trash, Eye, CheckCircle2, Star, Building, Ruler, User, Home, DollarSign, MapPin, Archive, ArchiveRestore, Tag, TrendingUp, CreditCard } from 'lucide-react';
import { formatCurrency, toTitleCase } from '../../utils/textFormatters';
import { usePermissions } from '../../hooks/auth/usePermissions';
import { useViviendaCardData } from '../../hooks/viviendas/useViviendaCardData';
import Card from '../../components/Card';

const ViviendaCard = ({ vivienda, onEdit, onDelete, nombreProyecto, onArchive, onRestore }) => {
    const { can } = usePermissions();

    // Usamos el hook para obtener todos los datos calculados y el estado de la vivienda
    const {
        manzana, numeroCasa, matricula, nomenclatura, valorFinal, totalAbonado,
        saldoPendiente, clienteNombre, clienteId, puedeEditar, puedeEliminar,
        tieneValorEscrituraDiferente, puedeArchivar, puedeRestaurar,
        porcentajePagado, isDisponible, isPagada, esEsquinera, tieneDescuento, esIrregular
    } = useViviendaCardData(vivienda);

    // Se determina si el usuario tiene permiso para alguna de las acciones del menú.
    const tieneAccionesDisponibles = useMemo(() => {
        return can('viviendas', 'editar') || can('viviendas', 'eliminar') || can('viviendas', 'verDetalle');
    }, [can]);

    return (
        <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${isPagada
            ? 'border-emerald-200 dark:border-emerald-700 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20'
            : isDisponible
                ? 'border-amber-200 dark:border-amber-700 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20'
                : 'border-indigo-200 dark:border-indigo-700 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20'
            }`}>
            {/* Header con gradiente mejorado */}
            <div className={`relative p-6 ${isPagada
                ? 'bg-gradient-to-r from-emerald-500 to-green-500'
                : isDisponible
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500'
                    : 'bg-gradient-to-r from-indigo-600 to-blue-600'
                }`}>
                {/* Decoración de fondo */}
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>

                <div className="relative flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-grow min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center flex-shrink-0">
                            <Home className="w-6 h-6 text-white" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-lg font-bold text-white truncate">
                                {`Mz. ${manzana} - Casa ${numeroCasa}`}
                            </h3>
                            <p className="text-white/80 text-sm">
                                {nombreProyecto || 'Sin proyecto'}
                            </p>
                        </div>
                    </div>

                    <div className='flex items-center gap-2 flex-shrink-0'>
                        {tieneValorEscrituraDiferente && (
                            <div
                                className="bg-white/20 backdrop-blur-sm border border-white/30 p-1.5 rounded-lg"
                                data-tooltip-id="app-tooltip"
                                data-tooltip-content="Valor de escritura diferente al comercial"
                            >
                                <DollarSign className="w-3 h-3 text-white" />
                            </div>
                        )}
                        {isPagada ? (
                            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 px-3 py-2 rounded-xl">
                                <CheckCircle2 size={16} className="text-white" />
                                <span className="text-white font-semibold text-sm">Pagada</span>
                            </div>
                        ) : (
                            <div className={`flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 px-3 py-2 rounded-xl`}>
                                <div className={`w-2 h-2 rounded-full ${isDisponible ? 'bg-amber-200' : 'bg-blue-200'} animate-pulse`}></div>
                                <span className="text-white font-semibold text-sm">
                                    {isDisponible ? 'Disponible' : 'Asignada'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-6 flex-grow">
                {/* Información de la propiedad reorganizada */}
                <div className='space-y-4'>
                    <div className="space-y-3">
                        {/* Matrícula en línea completa */}
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-2 mb-2">
                                <Building size={14} className="text-slate-500" />
                                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Matrícula Inmobiliaria</span>
                            </div>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{matricula}</p>
                        </div>

                        {/* Nomenclatura con badges integrados */}
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700 space-y-3">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <MapPin size={14} className="text-slate-500" />
                                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Nomenclatura</span>
                                    </div>
                                    {/* Badges de características al extremo derecho */}
                                    {(esEsquinera || esIrregular || tieneDescuento) && (
                                        <div className="flex items-center gap-1">
                                            {esEsquinera && (
                                                <div
                                                    className="bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 p-1 rounded"
                                                    data-tooltip-id="app-tooltip"
                                                    data-tooltip-content="Vivienda esquinera"
                                                >
                                                    <Star className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                                </div>
                                            )}
                                            {esIrregular && (
                                                <div
                                                    className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-700 p-1 rounded"
                                                    data-tooltip-id="app-tooltip"
                                                    data-tooltip-content="Vivienda irregular"
                                                >
                                                    <Ruler className="w-4 h-4 text-red-600 dark:text-red-400" />
                                                </div>
                                            )}
                                            {tieneDescuento && (
                                                <div
                                                    className="bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 p-1 rounded"
                                                    data-tooltip-id="app-tooltip"
                                                    data-tooltip-content="Vivienda con descuento"
                                                >
                                                    <Tag className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 break-words pr-16">{nomenclatura}</p>
                            </div>

                            {/* Progreso de pago más compacto */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp size={12} className="text-slate-500" />
                                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Progreso de pago</span>
                                    </div>
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${isPagada
                                        ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                                        : 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                                        }`}>
                                        {`${Math.round(porcentajePagado)}%`}
                                    </span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                                    <div className={`h-full rounded-full transition-all duration-500 ${isPagada
                                        ? 'bg-gradient-to-r from-emerald-500 to-green-500'
                                        : 'bg-gradient-to-r from-indigo-500 to-blue-500'
                                        }`} style={{ width: `${porcentajePagado}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Información financiera reorganizada */}
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700 space-y-3">
                    {/* Valor de la vivienda - línea completa y prominente */}
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <DollarSign size={14} className="text-slate-500" />
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Valor Vivienda</span>
                        </div>
                        <p className="text-lg font-bold text-slate-700 dark:text-slate-300">{formatCurrency(valorFinal)}</p>
                    </div>

                    {/* Abonado y Saldo lado a lado */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="text-left">
                            <div className="flex items-center gap-1 mb-1">
                                <CreditCard size={12} className="text-emerald-500" />
                                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Abonado</span>
                            </div>
                            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalAbonado)}</p>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center justify-end gap-1 mb-1">
                                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Saldo</span>
                                <TrendingUp size={12} className={saldoPendiente > 0 ? 'text-red-500' : 'text-emerald-500'} />
                            </div>
                            <p className={`text-sm font-bold ${saldoPendiente > 0
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-emerald-600 dark:text-emerald-400'
                                }`}>{formatCurrency(saldoPendiente)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer modernizado */}
            <div className="mt-auto p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm overflow-hidden">
                    {!isDisponible ? (
                        <Link
                            to={`/clientes/detalle/${clienteId}`}
                            className='flex items-center gap-3 font-bold text-slate-800 dark:text-slate-200 truncate hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200 group'
                            title={toTitleCase(clienteNombre)}
                        >
                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors duration-200">
                                <User size={14} className="text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                            </div>
                            <span className="truncate">{toTitleCase(clienteNombre)}</span>
                        </Link>
                    ) : (
                        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                <Home size={14} className="text-slate-400" />
                            </div>
                            <span className="text-sm font-medium">Sin asignar</span>
                        </div>
                    )}
                </div>

                {/* El menú de acciones ahora solo se renderiza si el usuario tiene permisos */}
                {tieneAccionesDisponibles && (
                    <Menu as="div" className="relative">
                        <Menu.Button className="p-2.5 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all duration-200 hover:shadow-md hover:scale-105">
                            <MoreVertical size={18} />
                        </Menu.Button>
                        <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                            <Menu.Items className="absolute bottom-full right-0 mb-2 w-56 origin-bottom-right bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 divide-y divide-slate-100 dark:divide-slate-700 rounded-xl shadow-xl backdrop-blur-sm z-10 focus:outline-none">
                                {can('viviendas', 'verDetalle') && (
                                    <div className="px-1 py-1">
                                        <Menu.Item>
                                            {({ active }) => (
                                                <Link to={`/viviendas/detalle/${vivienda.id}`} className={`${active ? 'bg-slate-100 dark:bg-slate-700' : ''} group flex rounded-lg items-center w-full px-3 py-2.5 text-sm text-slate-900 dark:text-slate-200 transition-colors`}>
                                                    <Eye className="w-4 h-4 mr-3 text-slate-500" /> Ver Detalle
                                                </Link>
                                            )}
                                        </Menu.Item>
                                    </div>
                                )}

                                {can('viviendas', 'editar') && (
                                    <div className="px-1 py-1">
                                        <Menu.Item disabled={!puedeEditar}>
                                            {({ active, disabled }) => (
                                                <div data-tooltip-id="app-tooltip" data-tooltip-content={disabled ? "No se puede editar una vivienda con proceso de cliente finalizado." : ''}>
                                                    <button onClick={() => onEdit(vivienda)} className={`${active ? 'bg-slate-100 dark:bg-slate-700' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} group flex rounded-lg items-center w-full px-3 py-2.5 text-sm text-slate-900 dark:text-slate-200 transition-colors`} disabled={!puedeEditar}>
                                                        <Pencil className="w-4 h-4 mr-3 text-slate-500" /> Editar Datos
                                                    </button>
                                                </div>
                                            )}
                                        </Menu.Item>
                                    </div>
                                )}
                                {can('viviendas', 'archivar') && puedeArchivar && (
                                    <div className="px-1 py-1">
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button onClick={() => onArchive(vivienda)} className={`${active ? 'bg-slate-100 dark:bg-slate-700' : ''} group flex rounded-lg items-center w-full px-3 py-2.5 text-sm text-slate-900 dark:text-slate-200 transition-colors`}>
                                                    <Archive className="w-4 h-4 mr-3 text-slate-500" /> Archivar
                                                </button>
                                            )}
                                        </Menu.Item>
                                    </div>
                                )}

                                {can('viviendas', 'restaurar') && puedeRestaurar && (
                                    <div className="px-1 py-1">
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button onClick={() => onRestore(vivienda)} className={`${active ? 'bg-slate-100 dark:bg-slate-700' : ''} group flex rounded-lg items-center w-full px-3 py-2.5 text-sm text-slate-900 dark:text-slate-200 transition-colors`}>
                                                    <ArchiveRestore className="w-4 h-4 mr-3 text-slate-500" /> Restaurar
                                                </button>
                                            )}
                                        </Menu.Item>
                                    </div>
                                )}

                                {can('viviendas', 'eliminar') && (
                                    <div className="px-1 py-1">
                                        <Menu.Item disabled={!puedeEliminar}>
                                            {({ active, disabled }) => (
                                                <div data-tooltip-id="app-tooltip" data-tooltip-content={disabled ? "No se puede eliminar una vivienda si tiene un cliente asignado o si tuvo abonos en el pasado." : ''}>
                                                    <button onClick={() => onDelete(vivienda)} className={`${active ? 'bg-red-50 dark:bg-red-900/20' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} group flex rounded-lg items-center w-full px-3 py-2.5 text-sm text-red-600 dark:text-red-400 transition-colors`} disabled={!puedeEliminar}>
                                                        <Trash className="w-4 h-4 mr-3" /> Eliminar
                                                    </button>
                                                </div>
                                            )}
                                        </Menu.Item>
                                    </div>
                                )}
                            </Menu.Items>
                        </Transition>
                    </Menu>
                )}
            </div>
        </Card>
    );
};

export default memo(ViviendaCard);