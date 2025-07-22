import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { DollarSign, UserPlus, UserX } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

const ICONS = {
    abono: <DollarSign className="w-5 h-5 text-green-500 dark:text-green-400" />,
    cliente: <UserPlus className="w-5 h-5 text-blue-500 dark:text-blue-400" />,
    renuncia: <UserX className="w-5 h-5 text-orange-500 dark:text-orange-400" />,
};

const NotificationItem = ({ notification }) => {
    const { markAsRead } = useNotifications();

    const timeAgo = notification.timestamp?.toDate ?
        formatDistanceToNow(notification.timestamp.toDate(), { addSuffix: true, locale: es }) :
        'hace un momento';

    const handleClick = () => {
        if (!notification.read) {
            markAsRead(notification.id);
        }
    };

    return (
        <Link
            to={notification.link || '#'}
            onClick={handleClick}
            className={`block p-3 rounded-lg transition-colors ${!notification.read
                    ? 'bg-blue-50 dark:bg-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900'
                    : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
        >
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                    {ICONS[notification.type] || <UserPlus className="w-5 h-5 text-gray-500" />}
                </div>
                <div className="flex-grow">
                    <p className="text-sm text-gray-800 dark:text-gray-200">{notification.message}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{timeAgo}</p>
                </div>
                {!notification.read && (
                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full flex-shrink-0 mt-2" title="No leído"></div>
                )}
            </div>
        </Link>
    );
};

export default NotificationItem;