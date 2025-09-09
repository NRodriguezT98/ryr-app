import React, { useState, useEffect } from 'react';
import { getAuditLogsForCliente } from '../../../services/auditService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Loader, Edit, UserPlus, FileText, UserX, RefreshCw, Archive, ArchiveRestore } from 'lucide-react';
import AnimatedPage from '../../../components/AnimatedPage';

// Pequeño helper para asignar un ícono a cada tipo de acción
const getActionIcon = (action) => {
    const iconMap = {
        CREATE_CLIENT: <UserPlus className="w-4 h-4 text-white" />,
        UPDATE_CLIENT: <Edit className="w-4 h-4 text-white" />,
        UPLOAD_EVIDENCE: <FileText className="w-4 h-4 text-white" />,
        PROCESS_RENUNCIA: <UserX className="w-4 h-4 text-white" />,
        RESTART_CLIENT_PROCESS: <RefreshCw className="w-4 h-4 text-white" />,
        ARCHIVE_CLIENT: <Archive className="w-4 h-4 text-white" />,
        RESTORE_CLIENT: <ArchiveRestore className="w-4 h-4 text-white" />,
        DEFAULT: <Edit className="w-4 h-4 text-white" />,
    };
    if (!action) return iconMap['DEFAULT'];
    if (action.includes('UPDATE')) return iconMap['UPDATE_CLIENT'];
    if (action.includes('CREATE')) return iconMap['CREATE_CLIENT'];

    return iconMap[action] || iconMap['DEFAULT'];
};

const LogItem = ({ log }) => {
    const timestamp = log.timestamp?.toDate ? log.timestamp.toDate() : new Date();
    const formattedDate = format(timestamp, "d 'de' MMMM, yyyy 'a las' h:mm a", { locale: es });
    const icon = getActionIcon(log.details?.action);

    return (
        <li className="mb-10 ms-6">
            <span className="absolute flex items-center justify-center w-8 h-8 bg-blue-500 rounded-full -start-4 ring-4 ring-white dark:ring-gray-800">
                {icon}
            </span>
            <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-700 dark:border-gray-600">
                <div className="items-center justify-between mb-3 sm:flex">
                    <div className="text-sm font-normal text-gray-500 dark:text-gray-300">
                        Acción realizada por <span className="font-semibold text-gray-900 dark:text-white">{log.userName}</span>
                    </div>
                    <time className="mb-1 text-xs font-normal text-gray-400 sm:order-last sm:mb-0">{formattedDate}</time>
                </div>
                <div className="p-3 text-sm italic font-normal text-gray-500 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300">
                    {log.message}
                </div>
            </div>
        </li>
    );
};

const TabHistorial = ({ clienteId }) => {
    const [historial, setHistorial] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHistorial = async () => {
            if (!clienteId) {
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const logs = await getAuditLogsForCliente(clienteId);
                setHistorial(logs);
            } catch (err) {
                console.error("Error al cargar el historial:", err);
                setError("No se pudo cargar el historial de actividad.");
            } finally {
                setLoading(false);
            }
        };

        fetchHistorial();
    }, [clienteId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center p-10">
                <Loader className="animate-spin text-blue-500" size={40} />
            </div>
        );
    }

    if (error) {
        return <p className="text-center text-red-500">{error}</p>;
    }

    return (
        <AnimatedPage>
            {historial.length > 0 ? (
                <ol className="relative border-s border-gray-200 dark:border-gray-600">
                    {historial.map(log => <LogItem key={log.id} log={log} />)}
                </ol>
            ) : (
                <div className="text-center py-10">
                    <p className="text-gray-500 dark:text-gray-400">No hay historial de actividad para este cliente.</p>
                </div>
            )}
        </AnimatedPage>
    );
};

export default TabHistorial;