import React, { Fragment, memo } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Menu, Transition } from '@headlessui/react';
import { Calendar, DollarSign, Wallet, MessageSquare, Download, Home, MoreVertical, Pencil, Trash, AlertTriangle, Archive } from 'lucide-react';
import { formatCurrency } from '../../utils/textFormatters';

const formatDate = (dateString) => {
    if (!dateString) return "Fecha inválida";
    try {
        const date = new Date(dateString + 'T00:00:00');
        return format(date, "d 'de' MMMM 'de' yyyy", { locale: es });
    } catch (error) {
        return "Fecha inválida";
    }
};

const AbonoCard = ({ abono, onEdit, onDelete, isReadOnly = false }) => {

    const getStatusInfo = () => {
        if (abono.estadoProceso === 'archivado') {
            return {
                cardBorder: 'border-gray-200 dark:border-gray-700 opacity-75',
                iconBg: 'bg-gray-100 dark:bg-gray-700',
                iconColor: 'text-gray-500 dark:text-gray-400',
                Icon: Archive,
                label: 'Venta Cancelada'
            };
        }
        if (abono.tieneRenunciaPendiente) {
            return {
                cardBorder: 'border-orange-300 dark:border-orange-600',
                iconBg: 'bg-orange-100 dark:bg-orange-900/50',
                iconColor: 'text-orange-600 dark:text-orange-400',
                Icon: AlertTriangle,
                label: 'Proceso de Renuncia'
            };
        }
        return {
            cardBorder: 'border-gray-100 dark:border-gray-700',
            iconBg: 'bg-green-100 dark:bg-green-900/50',
            iconColor: 'text-green-600 dark:text-green-400',
            Icon: DollarSign,
            label: null
        };
    };

    const { cardBorder, iconBg, iconColor, Icon, label } = getStatusInfo();
    const canEditOrDelete = abono.estadoProceso === 'activo' && !abono.tieneRenunciaPendiente;

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-md border ${cardBorder} p-4 flex items-start gap-4 transition-all`}>
            <div className={`${iconBg} p-3 rounded-full flex-shrink-0 mt-1`}>
                <Icon className={`w-6 h-6 ${iconColor}`} />
            </div>

            <div className="flex-grow">
                <div className="flex flex-col sm:flex-row justify-between items-start">
                    <div className="flex-grow">
                        <p className="font-bold text-lg text-gray-800 dark:text-gray-100">{formatCurrency(abono.monto)}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                            <Wallet size={14} /> {abono.metodoPago || 'No especificado'}
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
                                <Calendar size={14} /> {formatDate(abono.fechaPago)}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold flex items-center justify-end gap-2">
                                <Home size={14} /> {abono.clienteInfo}
                            </div>
                            {label && (
                                <div className="flex justify-end mt-1">
                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${iconBg} ${iconColor} flex items-center gap-1`}>
                                        <Icon size={12} />
                                        {label}
                                    </span>
                                </div>
                            )}
                        </div>
                        {!isReadOnly && (
                            <Menu as="div" className="relative">
                                <Menu.Button className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full disabled:opacity-50 disabled:cursor-not-allowed" disabled={!canEditOrDelete}>
                                    <MoreVertical size={20} />
                                </Menu.Button>
                                <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                                    <Menu.Items className="absolute bottom-full right-0 mb-2 w-40 origin-bottom-right bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700 rounded-md shadow-lg ring-1 ring-black dark:ring-gray-700 ring-opacity-5 z-10 focus:outline-none">
                                        <div className="px-1 py-1"><Menu.Item>{({ active }) => (<button onClick={() => onEdit(abono)} className={`${active ? 'bg-blue-500 text-white' : 'text-gray-900 dark:text-gray-200'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}><Pencil className="w-5 h-5 mr-2" /> Editar</button>)}</Menu.Item></div>
                                        <div className="px-1 py-1"><Menu.Item>{({ active }) => (<button onClick={() => onDelete(abono)} className={`${active ? 'bg-red-500 text-white' : 'text-gray-900 dark:text-gray-200'} group flex rounded-md items-center w-full px-2 py-2 text-sm`}><Trash className="w-5 h-5 mr-2" /> Eliminar</button>)}</Menu.Item></div>
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