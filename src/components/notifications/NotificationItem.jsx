import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { DollarSign, UserPlus, UserX } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext'; // <-- 1. Importar el hook

const ICONS = {
    abono: <DollarSign className="w-5 h-5 text-green-500" />,
    cliente: <UserPlus className="w-5 h-5 text-blue-500" />,
    renuncia: <UserX className="w-5 h-5 text-orange-500" />,
};

const NotificationItem = ({ notification }) => {
    const { markAsRead } = useNotifications(); // <-- 2. Obtener la función del contexto

    const timeAgo = notification.timestamp?.toDate ?
        formatDistanceToNow(notification.timestamp.toDate(), { addSuffix: true, locale: es }) :
        'hace un momento';

    const handleClick = () => {
        // 3. Si la notificación no está leída, la marcamos como leída al hacer clic
        if (!notification.read) {
            markAsRead(notification.id);
        }
        // La navegación del <Link> continuará normalmente
    };

    return (
        <Link
            to={notification.link || '#'}
            onClick={handleClick} // <-- 4. Añadir el manejador de clic
            className={`block p-3 hover:bg-gray-100 rounded-lg transition-colors ${!notification.read ? 'bg-blue-50' : 'bg-white'}`}
        >
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                    {ICONS[notification.type] || <UserPlus className="w-5 h-5 text-gray-500" />}
                </div>
                <div className="flex-grow">
                    <p className="text-sm text-gray-800">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{timeAgo}</p>
                </div>
                {!notification.read && (
                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full flex-shrink-0 mt-2" title="No leído"></div>
                )}
            </div>
        </Link>
    );
};

export default NotificationItem;