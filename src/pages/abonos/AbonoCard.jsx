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
        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-md border ${cardBorder} p-4 flex items-start gap-4 transition-all`}>
            <div className={`${iconBg} p-3 rounded-full flex-shrink-0 mt-1`}>
                <Icon className={`w-6 h-6 ${iconColor}`} />
            </div>

            <div className="flex-grow">
                <div className="flex flex-col sm:flex-row justify-between items-start">
                    <div className="flex-grow">
                        <div className="flex items-center gap-3 mb-1">
                            <p className="font-bold text-lg text-gray-800 dark:text-gray-100">{formatCurrency(abono.monto)}</p>

                            {/* Si el abono tiene un consecutivo, lo mostramos en un badge */}
                            {abono.consecutivo && (
                                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 px-2.5 py-1 rounded-full flex items-center gap-1">
                                    <Hash size={12} />
                                    {String(abono.consecutivo).padStart(4, '0')}
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                            <Wallet size={14} />
                            {/* --- INICIO DE LA MODIFICACIÓN --- */}
                            {/* Se muestra el texto especial para la condonación */}
                            {abono.metodoPago === 'Condonación de Saldo' ? `Cuota Inicial (Condonación)` : abono.metodoPago || 'No especificado'}
                            {/* --- FIN DE LA MODIFICACIÓN --- */}
                        </p>
                        {abono.observacion && (
                            <p className="text-xs text-gray-600 dark:text-gray-300 italic flex items-start gap-2 mt-2">
                                <MessageSquare size={14} className="mt-0.5 flex-shrink-0" />
                                <span>{abono.observacion}</span>
                            </p>
                        )}
                        {abono.urlComprobante && (
                            <a
                                href={abono.urlComprobante}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold mt-2"
                            >
                                <Download size={14} /> Ver Comprobante
                            </a>
                        )}
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0 mt-2 sm:mt-0">
                        <div className="text-right space-y-1">
                            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-end gap-2">
                                <Calendar size={14} /> {formatDisplayDate(abono.fechaPago)}
                            </div>
                            {/* --- INICIO DE LA MODIFICACIÓN --- */}
                            {/* Se muestra el nombre del cliente y la vivienda */}
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold flex items-center justify-end gap-2">
                                <Home size={14} /> {clienteYViviendaText}
                            </div>
                            {/* --- FIN DE LA MODIFICACIÓN --- */}
                            {label && (
                                <div className="flex justify-end mt-1">
                                    {/* Si el abono está anulado Y tiene un motivo, mostramos el badge con tooltip */}
                                    {abono.estadoProceso === 'anulado' && abono.motivoAnulacion ? (
                                        <div className="relative group flex items-center">
                                            {/* Badge "ANULADO" */}
                                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${iconBg} ${iconColor} flex items-center gap-1`}>
                                                <Icon size={12} />
                                                {label}
                                            </span>
                                            {/* Ícono de Info que activa el tooltip */}
                                            <Info size={14} className="ml-1.5 text-gray-400 dark:text-gray-500 cursor-help" />
                                            {/* El Tooltip (aparece al hacer hover) */}
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs bg-gray-800 text-white text-xs rounded py-1.5 px-2.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                                <span className="font-bold">Motivo:</span> {abono.motivoAnulacion}
                                            </div>
                                        </div>
                                    ) : (
                                        // Para todos los demás estados, mostramos el badge normal
                                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${iconBg} ${iconColor} flex items-center gap-1`}>
                                            <Icon size={12} />
                                            {label}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                        {!isReadOnly && tieneAccionesDisponibles && !abono.procesoClienteFinalizado && (
                            <Menu as="div" className="relative">
                                <Menu.Button className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full disabled:opacity-50 disabled:cursor-not-allowed">
                                    <MoreVertical size={20} />
                                </Menu.Button>
                                <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                                    <Menu.Items className="absolute bottom-full right-0 mb-2 w-48 origin-bottom-right bg-white dark:bg-gray-800 divide-y dark:divide-gray-700 rounded-md shadow-lg ring-1 ring-black dark:ring-gray-700 ring-opacity-5 z-10 focus:outline-none">
                                        {can('abonos', 'editar') && abono.estadoProceso === 'activo' && !abono.procesoClienteFinalizado && (
                                            <div className="px-1 py-1">
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <button
                                                            onClick={() => onEdit(abono)}
                                                            disabled={!canDoActions}
                                                            className={`${active ? 'bg-blue-500 text-white' : 'text-gray-900 dark:text-gray-200'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                                                        >
                                                            <Pencil className="w-5 h-5 mr-2" /> Editar
                                                        </button>
                                                    )}
                                                </Menu.Item>
                                            </div>
                                        )}
                                        {can('abonos', 'anular') && abono.estadoProceso === 'activo' && !abono.procesoClienteFinalizado && (
                                            <div className="px-1 py-1"><Menu.Item>{({ active }) => (<button onClick={() => onAnular(abono)} disabled={!canDoActions} className={`${active ? 'bg-red-500 text-white' : 'text-gray-900 dark:text-gray-200'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}><Trash className="w-5 h-5 mr-2" /> Anular</button>)}</Menu.Item></div>
                                        )}
                                        {can('abonos', 'revertirAnulacion') && abono.estadoProceso === 'anulado' && (
                                            <div className="px-1 py-1"><Menu.Item>{({ active }) => (<button onClick={() => onRevertir(abono)} className={`${active ? 'bg-green-500 text-white' : 'text-gray-900 dark:text-gray-200'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}><Undo2 className="w-5 h-5 mr-2" /> Revertir Anulación</button>)}</Menu.Item></div>
                                        )}
                                    </Menu.Items>
                                </Transition>
                            </Menu>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default memo(AbonoCard);