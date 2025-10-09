import React, { Fragment, memo } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { MoreVertical, Eye, Pencil, Trash, UserX, RefreshCw, Home, ArchiveRestore, Archive, AlertTriangle, DollarSign, MapPin, ArrowRightLeft, CreditCard, TrendingUp } from 'lucide-react';
import { getInitials, formatID, formatCurrency, toTitleCase } from '../../utils/textFormatters';
import Card from '../../components/Card';

const ClienteCard = ({ cardData, onEdit, onArchive, onDelete, onRenunciar, onReactivar, onRestaurar, onTransferir, nombreProyecto }) => {

    const {
        id, datosCliente, vivienda, clientStatus, isPagada,
        totalAbonado, porcentajePagado, puedeEditar, puedeRenunciar,
        status, puedeSerEliminado, tieneValorEscrituraDiferente,
        acciones,
        tieneAccionesDisponibles
    } = cardData;

    const enRenunciaPendiente = status === 'enProcesoDeRenuncia';

    return (
        <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${isPagada
            ? 'border-emerald-200 dark:border-emerald-700 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20'
            : enRenunciaPendiente
                ? 'border-amber-200 dark:border-amber-700 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20'
                : 'border-slate-200 dark:border-slate-700 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900'
            }`}>
            {/* Header con gradiente mejorado */}
            <div className={`relative p-6 ${isPagada
                ? 'bg-gradient-to-r from-emerald-500 to-green-500'
                : enRenunciaPendiente
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                    : 'bg-gradient-to-r from-indigo-600 to-slate-700'
                }`}>
                {/* Decoración de fondo */}
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>

                <div className="relative">
                    {/* Layout reorganizado para evitar truncate del nombre */}
                    <div className="flex flex-col space-y-4">
                        {/* Fila del avatar y nombre completo */}
                        <div className="flex items-start gap-4">
                            <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center font-bold text-xl text-white flex-shrink-0">
                                {getInitials(datosCliente?.nombres, datosCliente?.apellidos)}
                            </div>
                            <div className="flex-1 min-w-0">
                                {/* Nombres y apellidos en líneas separadas para evitar truncate */}
                                <div className="space-y-1">
                                    <h3 className="font-bold text-lg text-white leading-tight break-words">
                                        {toTitleCase(`${datosCliente?.nombres}`)}
                                    </h3>
                                    <p className="font-semibold text-white/90 leading-tight break-words">
                                        {toTitleCase(`${datosCliente?.apellidos}`)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Fila de la cédula */}
                        <div className="flex items-center gap-2">
                            <div className="bg-white/10 rounded-lg px-3 py-1.5">
                                <span className="text-white/80 text-sm font-medium">C.C. {formatID(datosCliente?.cedula)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="p-6 space-y-5 flex-grow">
                {/* Información de ubicación */}
                <div className="space-y-3">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                            <Home size={16} className="text-slate-600 dark:text-slate-400" />
                        </div>
                        {vivienda ? (
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                                    {status === 'enProcesoDeRenuncia' ? 'Renunció a' : 'Vivienda Asignada'}
                                </p>
                                <Link
                                    to={`/viviendas/detalle/${vivienda.id}`}
                                    className="text-lg font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors duration-200 flex items-center gap-2"
                                >
                                    {`Mz ${vivienda.manzana} - Casa ${vivienda.numeroCasa}`}
                                    {tieneValorEscrituraDiferente && (
                                        <div
                                            className="bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-700 p-1 rounded"
                                            data-tooltip-id="app-tooltip"
                                            data-tooltip-content="Valor de escritura diferente al comercial"
                                        >
                                            <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                                        </div>
                                    )}
                                </Link>
                            </div>
                        ) : (
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Vivienda</p>
                                <span className="text-slate-500 dark:text-slate-400 italic">Sin asignar</span>
                            </div>
                        )}
                    </div>

                    {nombreProyecto && (
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                                <MapPin size={16} className="text-slate-600 dark:text-slate-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Proyecto</p>
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{nombreProyecto}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Estado de proceso de renuncia */}
                {enRenunciaPendiente ? (
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 p-4 border border-amber-200 dark:border-amber-700">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                                <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <p className="font-semibold text-amber-800 dark:text-amber-200">Proceso de Renuncia</p>
                                <p className="text-xs text-amber-600 dark:text-amber-400">Estado: Activo</p>
                            </div>
                        </div>
                    </div>
                ) : vivienda && (
                    <div className="space-y-4">
                        {/* Progreso de pago integrado y compacto como en ViviendaCard */}
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700 space-y-3">
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

                        {/* Información financiera reorganizada igual que ViviendaCard */}
                        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700 space-y-3">
                            {/* Valor de la vivienda - línea completa y prominente */}
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-2 mb-1">
                                    <DollarSign size={14} className="text-slate-500" />
                                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Valor Vivienda</span>
                                </div>
                                <p className="text-lg font-bold text-slate-700 dark:text-slate-300">{formatCurrency(vivienda.valorTotal)}</p>
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
                                        <TrendingUp size={12} className={isPagada ? 'text-emerald-500' : 'text-red-500'} />
                                    </div>
                                    <p className={`text-sm font-bold ${isPagada
                                        ? 'text-emerald-600 dark:text-emerald-400'
                                        : 'text-red-600 dark:text-red-400'
                                        }`}>{formatCurrency(vivienda.saldoPendiente)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {/* Footer modernizado */}
            <div className="mt-auto p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <Link to={`/clientes/detalle/${id}`} state={{ defaultTab: 'proceso' }} className="flex">
                    <div className={`flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-full transition-all duration-200 hover:scale-105 hover:shadow-md ${clientStatus.color}`}>
                        <div className="w-2 h-2 rounded-full bg-current animate-pulse"></div>
                        {clientStatus.icon}
                        <span>{clientStatus.text}</span>
                    </div>
                </Link>

                {tieneAccionesDisponibles && (
                    <Menu as="div" className="relative">
                        <Menu.Button className="p-2.5 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all duration-200 hover:shadow-md hover:scale-105">
                            <MoreVertical size={18} />
                        </Menu.Button>
                        <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                            <Menu.Items className="absolute bottom-full right-0 mb-2 w-56 origin-bottom-right bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 divide-y divide-slate-100 dark:divide-slate-700 rounded-xl shadow-xl backdrop-blur-sm z-10 focus:outline-none">

                                {acciones.verDetalle.visible && (
                                    <div className="px-1 py-1">
                                        <Menu.Item>
                                            {({ active }) => (
                                                <Link to={`/clientes/detalle/${id}`} className={`${active ? 'bg-slate-100 dark:bg-slate-700' : ''} group flex rounded-lg items-center w-full px-3 py-2.5 text-sm text-slate-900 dark:text-slate-200 transition-colors`}>
                                                    <Eye className="w-4 h-4 mr-3 text-slate-500" /> Ver Detalle
                                                </Link>
                                            )}
                                        </Menu.Item>
                                    </div>
                                )}

                                {acciones.editar.visible && (
                                    <div className="px-1 py-1">
                                        <Menu.Item disabled={!acciones.editar.enabled}>
                                            {({ active, disabled }) => (
                                                <div data-tooltip-id="app-tooltip" data-tooltip-content={acciones.editar.tooltip}>
                                                    <button onClick={() => onEdit(cardData)} className={`${active ? 'bg-slate-100 dark:bg-slate-700' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} group flex rounded-lg items-center w-full px-3 py-2.5 text-sm text-slate-900 dark:text-slate-200 transition-colors`} disabled={disabled}>
                                                        <Pencil className="w-4 h-4 mr-3 text-slate-500" /> Editar
                                                    </button>
                                                </div>
                                            )}
                                        </Menu.Item>
                                    </div>
                                )}

                                {acciones.transferir.visible && (
                                    <div className="px-1 py-1">
                                        <Menu.Item disabled={!acciones.transferir.enabled}>
                                            {({ active, disabled }) => (
                                                <div data-tooltip-id="app-tooltip" data-tooltip-content={acciones.transferir.tooltip}>
                                                    <button onClick={() => onTransferir(cardData)} className={`${active ? 'bg-slate-100 dark:bg-slate-700' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} group flex rounded-lg items-center w-full px-3 py-2.5 text-sm text-slate-900 dark:text-slate-200 transition-colors`} disabled={disabled}>
                                                        <ArrowRightLeft className="w-4 h-4 mr-3 text-slate-500" /> Transferir Vivienda
                                                    </button>
                                                </div>
                                            )}
                                        </Menu.Item>
                                    </div>
                                )}

                                {acciones.renunciar.visible && (
                                    <div className="px-1 py-1">
                                        <Menu.Item disabled={!acciones.renunciar.enabled}>
                                            {({ active, disabled }) => (
                                                <div data-tooltip-id="app-tooltip" data-tooltip-content={acciones.renunciar.tooltip}>
                                                    <button onClick={() => onRenunciar(cardData)} className={`${active ? 'bg-slate-100 dark:bg-slate-700' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} group flex rounded-lg items-center w-full px-3 py-2.5 text-sm text-slate-900 dark:text-slate-200 transition-colors`} disabled={disabled}>
                                                        <UserX className="w-4 h-4 mr-3 text-slate-500" /> Renunciar
                                                    </button>
                                                </div>
                                            )}
                                        </Menu.Item>
                                    </div>
                                )}

                                {acciones.iniciarNuevoProceso.visible && (
                                    <div className="px-1 py-1">
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button onClick={() => onReactivar(cardData)} className={`${active ? 'bg-slate-100 dark:bg-slate-700' : ''} group flex rounded-lg items-center w-full px-3 py-2.5 text-sm text-slate-900 dark:text-slate-200 transition-colors`}>
                                                    <RefreshCw className="w-4 h-4 mr-3 text-slate-500" /> Iniciar Nuevo Proceso
                                                </button>
                                            )}
                                        </Menu.Item>
                                    </div>
                                )}

                                {acciones.archivar.visible && (
                                    <div className="px-1 py-1">
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button onClick={() => onArchive(cardData)} className={`${active ? 'bg-slate-100 dark:bg-slate-700' : ''} group flex rounded-lg items-center w-full px-3 py-2.5 text-sm text-slate-900 dark:text-slate-200 transition-colors`}>
                                                    <Archive className="w-4 h-4 mr-3 text-slate-500" /> Archivar
                                                </button>
                                            )}
                                        </Menu.Item>
                                    </div>
                                )}

                                {acciones.restaurar.visible && (
                                    <div className="px-1 py-1">
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button onClick={() => onRestaurar(cardData)} className={`${active ? 'bg-slate-100 dark:bg-slate-700' : ''} group flex rounded-lg items-center w-full px-3 py-2.5 text-sm text-slate-900 dark:text-slate-200 transition-colors`}>
                                                    <ArchiveRestore className="w-4 h-4 mr-3 text-slate-500" /> Restaurar Cliente
                                                </button>
                                            )}
                                        </Menu.Item>
                                    </div>
                                )}

                                {acciones.eliminar.visible && (
                                    <div className="px-1 py-1">
                                        <Menu.Item disabled={!acciones.eliminar.enabled}>
                                            {({ active, disabled }) => (
                                                <div data-tooltip-id="app-tooltip" data-tooltip-content={acciones.eliminar.tooltip}>
                                                    <button onClick={() => onDelete(cardData)} className={`${active ? 'bg-red-50 dark:bg-red-900/20' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} group flex rounded-lg items-center w-full px-3 py-2.5 text-sm text-red-600 dark:text-red-400 transition-colors`} disabled={disabled}>
                                                        <Trash className="w-4 h-4 mr-3" /> Eliminar Permanentemente
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

export default memo(ClienteCard);