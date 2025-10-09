import React, { Fragment, memo } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Menu, Transition } from '@headlessui/react';
import { Calendar, DollarSign, Wallet, MessageSquare, Download, Home, MoreVertical, Pencil, Trash, AlertTriangle, Archive, HandCoins, Undo2, Info, Hash } from 'lucide-react';
import { formatCurrency, formatDisplayDate, toTitleCase } from '../../utils/textFormatters';
import { usePermissions } from '../../hooks/auth/usePermissions';
import { useData } from '../../context/DataContext';

const AbonoCard = ({ abono, onEdit, onAnular, onRevertir, isReadOnly = false }) => {

    const { can } = usePermissions();
    const { clientes, viviendas } = useData();

    const cliente = clientes.find(c => c.id === abono.clienteId);
    const vivienda = viviendas.find(v => v.id === abono.viviendaId);

    const clienteInfoText = cliente ? `${toTitleCase(cliente.datosCliente.nombres)} ${toTitleCase(cliente.datosCliente.apellidos)}` : 'Cliente no encontrado';
    const viviendaInfoText = vivienda ? `Mz ${vivienda.manzana} - Casa ${vivienda.numeroCasa}` : 'Vivienda no encontrada';
    const clienteYViviendaText = `${viviendaInfoText} - ${clienteInfoText}`;

    const getStatusInfo = () => {
        if (abono.estadoProceso === 'archivado') {
            return {
                cardBorder: 'border-gray-200 dark:border-gray-700 opacity-75',
                iconBg: 'bg-gray-100 dark:bg-gray-700',
                iconColor: 'text-gray-500 dark:text-gray-400',
                Icon: Archive,
                label: 'Venta Cancelada',
                montoClasses: ''
            };
        }
        if (abono.estadoProceso === 'anulado') {
            return {
                cardBorder: 'border-gray-300 dark:border-gray-700 opacity-60',
                iconBg: 'bg-gray-100 dark:bg-gray-700',
                iconColor: 'text-gray-500 dark:text-gray-400',
                Icon: Archive,
                label: 'ANULADO',
                montoClasses: 'line-through' // Clase para tachar el monto
            };
        }
        // --- INICIO DE LA MODIFICACIÓN ---
        // Lógica para el estilo especial de Condonación
        if (abono.metodoPago === 'Condonación de Saldo') {
            return {
                cardBorder: 'border-indigo-300 dark:border-indigo-600',
                iconBg: 'bg-indigo-100 dark:bg-indigo-900/50',
                iconColor: 'text-indigo-600 dark:text-indigo-400',
                Icon: HandCoins,
                label: null,
                montoClasses: ''
            };
        }
        // --- FIN DE LA MODIFICACIÓN ---
        if (abono.tieneRenunciaPendiente) {
            return {
                cardBorder: 'border-orange-300 dark:border-orange-600',
                iconBg: 'bg-orange-100 dark:bg-orange-900/50',
                iconColor: 'text-orange-600 dark:text-orange-400',
                Icon: AlertTriangle,
                label: 'Proceso de Renuncia',
                montoClasses: ''
            };
        }
        return {
            cardBorder: 'border-gray-100 dark:border-gray-700',
            iconBg: 'bg-green-100 dark:bg-green-900/50', // <-- Define un fondo verde claro
            iconColor: 'text-green-600 dark:text-green-400', // <-- Define el color del icono
            Icon: DollarSign,
            label: null,
            montoClasses: ''
        };
    };

    const { cardBorder, iconBg, iconColor, Icon, label, montoClasses } = getStatusInfo();
    const canDoActions = abono.estadoProceso === 'activo' && !abono.tieneRenunciaPendiente;
    const tieneAccionesDisponibles = can('abonos', 'editar') || can('abonos', 'anular') || can('abonos', 'revertirAnulacion');

    return (
        <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-lg border ${cardBorder} transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden group`}>
            {/* Header con información principal */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-start justify-between">
                    {/* Lado izquierdo - Monto y método de pago */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className={`${iconBg} p-3 rounded-xl flex-shrink-0 transition-all duration-300 group-hover:scale-110`}>
                            <Icon className={`w-6 h-6 ${iconColor}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <p className={`font-bold text-2xl text-slate-800 dark:text-slate-100 ${montoClasses} transition-colors duration-200`}>
                                    {formatCurrency(abono.monto)}
                                </p>
                                {/* Consecutivo modernizado */}
                                {abono.consecutivo && (
                                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-gradient-to-r from-indigo-100 to-blue-100 dark:from-indigo-900/50 dark:to-blue-900/50 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                                        <Hash size={12} />
                                        #{String(abono.consecutivo).padStart(4, '0')}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                <Wallet size={14} className="text-slate-500" />
                                <span className="font-medium">
                                    {abono.metodoPago === 'Condonación de Saldo' ? 'Cuota Inicial (Condonación)' : abono.metodoPago || 'No especificado'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Lado derecho - Fecha y estado */}
                    <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="text-right space-y-2">
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                <Calendar size={14} />
                                <span className="font-medium">{formatDisplayDate(abono.fechaPago)}</span>
                            </div>
                            {label && (
                                <div className="flex justify-end">
                                    {abono.estadoProceso === 'anulado' && abono.motivoAnulacion ? (
                                        <div className="relative group flex items-center">
                                            <span className={`px-3 py-1.5 text-xs font-bold rounded-full ${iconBg} ${iconColor} flex items-center gap-1.5`}>
                                                <Icon size={12} />
                                                {label}
                                            </span>
                                            <Info size={14} className="ml-1.5 text-slate-400 cursor-help hover:text-slate-600 transition-colors" />
                                            <div className="absolute bottom-full right-0 mb-2 w-max max-w-xs bg-slate-800 text-white text-xs rounded-lg py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl">
                                                <span className="font-bold">Motivo:</span> {abono.motivoAnulacion}
                                            </div>
                                        </div>
                                    ) : (
                                        <span className={`px-3 py-1.5 text-xs font-bold rounded-full ${iconBg} ${iconColor} flex items-center gap-1.5`}>
                                            <Icon size={12} />
                                            {label}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                        {!isReadOnly && tieneAccionesDisponibles && !abono.procesoClienteFinalizado && (
                            <Menu as="div" className="relative">
                                <Menu.Button className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                    <MoreVertical size={18} />
                                </Menu.Button>
                                <Transition as={Fragment} enter="transition ease-out duration-200" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-150" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                                    <Menu.Items className="absolute bottom-full right-0 mb-2 w-48 origin-bottom-right bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-600 divide-y divide-slate-100 dark:divide-slate-700 z-20 focus:outline-none">
                                        {can('abonos', 'editar') && abono.estadoProceso === 'activo' && !abono.procesoClienteFinalizado && (
                                            <div className="p-1">
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <button
                                                            onClick={() => onEdit(abono)}
                                                            disabled={!canDoActions}
                                                            className={`${active ? 'bg-indigo-50 dark:bg-indigo-900/50' : ''} flex items-center w-full px-3 py-2 text-sm text-slate-700 dark:text-slate-200 rounded-lg transition-colors`}
                                                        >
                                                            <Pencil className="w-4 h-4 mr-3" /> Editar
                                                        </button>
                                                    )}
                                                </Menu.Item>
                                            </div>
                                        )}
                                        {can('abonos', 'anular') && abono.estadoProceso === 'activo' && !abono.procesoClienteFinalizado && (
                                            <div className="p-1">
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <button
                                                            onClick={() => onAnular(abono)}
                                                            disabled={!canDoActions}
                                                            className={`${active ? 'bg-red-50 dark:bg-red-900/50' : ''} flex items-center w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 rounded-lg transition-colors`}
                                                        >
                                                            <Trash className="w-4 h-4 mr-3" /> Anular
                                                        </button>
                                                    )}
                                                </Menu.Item>
                                            </div>
                                        )}
                                        {can('abonos', 'revertirAnulacion') && abono.estadoProceso === 'anulado' && (
                                            <div className="p-1">
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <button
                                                            onClick={() => onRevertir(abono)}
                                                            className={`${active ? 'bg-green-50 dark:bg-green-900/50' : ''} flex items-center w-full px-3 py-2 text-sm text-green-600 dark:text-green-400 rounded-lg transition-colors`}
                                                        >
                                                            <Undo2 className="w-4 h-4 mr-3" /> Revertir Anulación
                                                        </button>
                                                    )}
                                                </Menu.Item>
                                            </div>
                                        )}
                                    </Menu.Items>
                                </Transition>
                            </Menu>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer con información del cliente/vivienda */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 min-w-0 flex-1">
                        <Home size={16} className="text-slate-500 flex-shrink-0" />
                        <span className="font-medium truncate" title={clienteYViviendaText}>
                            {clienteYViviendaText}
                        </span>
                    </div>
                    {abono.urlComprobante && (
                        <a
                            href={abono.urlComprobante}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors flex-shrink-0 ml-4"
                        >
                            <Download size={14} />
                            <span>Ver Comprobante</span>
                        </a>
                    )}
                </div>

                {/* Observación si existe */}
                {abono.observacion && (
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                            <MessageSquare size={14} className="mt-0.5 flex-shrink-0 text-slate-500" />
                            <span className="italic">{abono.observacion}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default memo(AbonoCard);