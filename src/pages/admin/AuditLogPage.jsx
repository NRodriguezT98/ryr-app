import React, { useState } from 'react'; // 1. Importar useState
import { Link } from 'react-router-dom';
import AnimatedPage from '../../components/AnimatedPage';
import { History, ArrowLeft, Loader2, Eye } from 'lucide-react'; // 2. Importar Eye
import { useAuditLog } from '../../hooks/admin/useAuditLog';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import ModalAuditDetails from '../../components/admin/ModalAuditDetails'; // 3. Importar el nuevo Modal

// El componente AuditLogRow ahora recibe un manejador para el botón
const AuditLogRow = ({ log, onVerDetalles }) => {
    const formattedDate = log.timestamp?.toDate()
        ? format(log.timestamp.toDate(), "dd MMMM yyyy, hh:mm a", { locale: es })
        : 'Fecha no disponible';

    return (
        <tr className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{log.userName}</td>
            <td className="px-6 py-4">{log.message}</td>
            <td className="px-6 py-4 whitespace-nowrap">{formattedDate}</td>
            <td className="px-6 py-4 text-center">
                <button
                    onClick={() => onVerDetalles(log)}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                >
                    <Eye size={16} />
                    Ver
                </button>
            </td>
        </tr>
    );
};

const AuditLogPage = () => {
    const { logs, isLoading, hasMore, fetchMoreLogs } = useAuditLog();
    const [logSeleccionado, setLogSeleccionado] = useState(null); // 4. Estado para el log seleccionado

    return (
        <AnimatedPage>
            <div className="max-w-7xl mx-auto">
                <Link to="/admin" className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 inline-flex items-center gap-2 mb-6">
                    <ArrowLeft size={14} /> Volver al Panel de Administración
                </Link>
                <div className="flex items-center gap-4 mb-8">
                    <History size={40} className="text-gray-500" />
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Registro de Auditoría</h1>
                        <p className="text-gray-500 dark:text-gray-400">Un registro de todas las acciones importantes realizadas en el sistema.</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border dark:border-gray-700">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Usuario</th>
                                    <th scope="col" className="px-6 py-3 w-1/2">Acción Realizada</th>
                                    <th scope="col" className="px-6 py-3">Fecha y Hora</th>
                                    <th scope="col" className="px-6 py-3">Detalles</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map(log => (
                                    <AuditLogRow
                                        key={log.id}
                                        log={log}
                                        onVerDetalles={setLogSeleccionado} // 5. Pasar la función para abrir el modal
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {isLoading && (
                        <div className="text-center p-4"><Loader2 className="animate-spin inline-block" /></div>
                    )}

                    {!isLoading && hasMore && (
                        <div className="mt-6 text-center">
                            <button
                                onClick={fetchMoreLogs}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg transition"
                            >
                                Cargar más registros
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* 6. Renderizar el modal si hay un log seleccionado */}
            {logSeleccionado && (
                <ModalAuditDetails
                    log={logSeleccionado}
                    onClose={() => setLogSeleccionado(null)}
                />
            )}
        </AnimatedPage>
    );
};

export default AuditLogPage;