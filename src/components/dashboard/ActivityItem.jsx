import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { DollarSign, UserPlus, UserX } from 'lucide-react';
import { formatCurrency } from '../../utils/textFormatters';

const formatDate = (dateString) => {
    if (!dateString) return "Fecha inválida";
    try {
        const date = new Date(dateString);
        return format(date, "d 'de' MMMM", { locale: es });
    } catch (error) {
        return "Fecha inválida";
    }
};

const ActivityItem = ({ item, clientes }) => {

    const getConfig = () => {
        switch (item.tipo) {
            case 'abono':
                const clienteAbono = clientes.find(c => c.id === item.clienteId);
                return {
                    icon: <DollarSign className="text-green-600 dark:text-green-400" />,
                    bgColor: 'bg-green-100 dark:bg-green-900/50',
                    title: `Abono de ${clienteAbono?.datosCliente.nombres || 'Cliente Desconocido'}`,
                    value: `+ ${formatCurrency(item.monto)}`
                };
            case 'clienteNuevo':
                return {
                    icon: <UserPlus className="text-blue-600 dark:text-blue-400" />,
                    bgColor: 'bg-blue-100 dark:bg-blue-900/50',
                    title: `Nuevo Cliente: ${item.datosCliente.nombres}`,
                    value: `Se unió`
                };
            case 'renuncia':
                return {
                    icon: <UserX className="text-orange-600 dark:text-orange-400" />,
                    bgColor: 'bg-orange-100 dark:bg-orange-900/50',
                    title: `Renuncia de ${item.clienteNombre}`,
                    value: `Devolución: ${formatCurrency(item.monto)}`
                };
            default:
                return {
                    icon: '?',
                    bgColor: 'bg-gray-100 dark:bg-gray-700',
                    title: 'Actividad desconocida',
                    value: ''
                };
        }
    };

    const config = getConfig();

    return (
        <li className="flex items-center justify-between py-2">
            <div className="flex items-center min-w-0">
                <div className={`w-10 h-10 rounded-lg ${config.bgColor} flex items-center justify-center mr-4 flex-shrink-0`}>
                    {config.icon}
                </div>
                <div className="min-w-0">
                    <p className="font-medium text-gray-800 dark:text-gray-200 truncate">{config.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(item.fecha)}</p>
                </div>
            </div>
            <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm ml-2">{config.value}</p>
        </li>
    );
};

export default ActivityItem;