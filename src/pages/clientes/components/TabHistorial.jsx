import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { getAuditLogsForCliente } from '../../../services/auditService';
import { updateNotaHistorial } from '../../../services/clienteService';
import { useHistorialCliente } from '../../../hooks/clientes/useHistorialCliente';
import { useAuth } from '../../../context/AuthContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Loader, Edit, UserPlus, FileText, UserX, RefreshCw, Archive, ArchiveRestore, CheckCircle, MessageSquareText, GitCommit, DollarSign, Unlock, Eye, FolderOpen } from 'lucide-react';
import AnimatedPage from '../../../components/AnimatedPage';
import FormularioNuevaNota from './FormularioNuevaNota';
import ModalEditarNota from './ModalEditarNota';
import ModalConfirmacion from '../../../components/ModalConfirmacion';
import ModalAuditoriaArchivos from '../../../components/ModalAuditoriaArchivos';
import toast from 'react-hot-toast';
import { formatDisplayDate } from '../../../utils/textFormatters';
import { hasFileChanges } from '../../../utils/fileAuditHelper';

// Helper para asignar un ícono a cada tipo de acción
const getActionIcon = (action) => {
    const iconMap = {
        'ADD_NOTE': <MessageSquareText className="w-4 h-4 text-white" />,
        'CREATE_CLIENT': <UserPlus className="w-4 h-4 text-white" />,
        'UPDATE_CLIENT': <Edit className="w-4 h-4 text-white" />,
        'EDIT_NOTE': <Edit className="w-4 h-4 text-white" />,
        'UPDATE_PROCESO': <GitCommit className="w-4 h-4 text-white" />,
        'REGISTER_ABONO': <DollarSign className="w-4 h-4 text-white" />,
        'REGISTER_DISBURSEMENT': <DollarSign className="w-4 h-4 text-white" />,
        'REGISTER_CREDIT_DISBURSEMENT': <DollarSign className="w-4 h-4 text-white" />,
        'VOID_ABONO': <UserX className="w-4 h-4 text-white" />,
        'REVERT_VOID_ABONO': <RefreshCw className="w-4 h-4 text-white" />,
        'CLIENT_RENOUNCE': <UserX className="w-4 h-4 text-white" />,
        'RESTART_CLIENT_PROCESS': <RefreshCw className="w-4 h-4 text-white" />,
        'ARCHIVE_CLIENT': <Archive className="w-4 h-4 text-white" />,
        'RESTORE_CLIENT': <ArchiveRestore className="w-4 h-4 text-white" />,
        'ANULAR_CIERRE_PROCESO': <Unlock className="w-4 h-4 text-white" />,
        'DEFAULT': <FileText className="w-4 h-4 text-white" />,
    };
    if (!action) return iconMap['DEFAULT'];
    return iconMap[action] || iconMap['DEFAULT'];
};

// Sub-componente para renderizar cada item del historial
const LogItem = ({ log, onEdit, onViewFileAudit, isReadOnly }) => {
    const { userData } = useAuth();
    const isNota = log.details?.action === 'ADD_NOTE';
    const timestamp = log.timestamp?.toDate ? log.timestamp.toDate() : new Date();
    const formattedDate = format(timestamp, "d 'de' MMMM, yyyy 'a las' h:mm a", { locale: es });
    const icon = getActionIcon(log.details?.action);

    const puedeEditar = !isReadOnly && isNota && log.userName === `${userData.nombres} ${userData.apellidos}`;
    const tieneArchivos = hasFileChanges(log);

    // Extraemos los detalles relevantes de forma segura
    const cambiosProceso = log.details?.action === 'UPDATE_PROCESO' ? log.details.cambios : [];
    // Usar el mensaje procesado por el hook (el mismo que auditoría)
    const messageContent = log.displayMessage;

    // Mejorar visualización de cambios de proceso (reabrió/completó)
    const renderCambiosProceso = () => {
        if (!cambiosProceso || cambiosProceso.length === 0) return null;
        return (
            <div className="mt-2 pt-2 border-t border-dashed dark:border-gray-500 space-y-1">
                {cambiosProceso.map((cambio, index) => (
                    <div key={index} className="flex items-center gap-2">
                        {cambio.accion === 'completó' ? (
                            <CheckCircle size={14} className="text-green-500" />
                        ) : cambio.accion === 'reabrió' ? (
                            <RefreshCw size={14} className="text-yellow-500" />
                        ) : (
                            <Edit size={14} className="text-blue-500" />
                        )}
                        <span className="text-xs">
                            {cambio.accion === 'completó' ? 'Se completó:' :
                                cambio.accion === 'reabrió' ? 'Se reabrió:' :
                                    'Se modificó:'} <span className="font-semibold text-gray-700 dark:text-gray-100">{cambio.paso}</span>
                        </span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <li className="mb-10 ms-6">
            <span className={`absolute flex items-center justify-center w-8 h-8 rounded-full -start-4 ring-4 ring-white dark:ring-gray-800 ${isNota ? 'bg-purple-500' : 'bg-blue-500'}`}>
                {icon}
            </span>
            <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-700 dark:border-gray-600">
                <div className="items-center justify-between mb-3 sm:flex">
                    <div className="text-sm font-normal text-gray-500 dark:text-gray-300">
                        {isNota ? 'Nota añadida por' : 'Acción realizada por'} <span className="font-semibold text-gray-900 dark:text-white">{log.userName}</span>
                        {tieneArchivos && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
                                <FolderOpen size={10} className="mr-1" />
                                Con archivos
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {log.editado && <span className="text-xs text-gray-400 italic">(editado)</span>}
                        <time className="mb-1 text-xs font-normal text-gray-400 sm:order-last sm:mb-0">{formattedDate}</time>
                    </div>
                </div>
                <div className="relative p-3 text-sm text-gray-500 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300">
                    <div className="absolute top-1 right-1 flex gap-1">
                        {tieneArchivos && (
                            <button
                                onClick={() => onViewFileAudit(log)}
                                className="p-1 rounded-full hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
                                title="Ver auditoría de archivos"
                            >
                                <FolderOpen size={14} className="text-blue-600 dark:text-blue-400" />
                            </button>
                        )}
                        {puedeEditar && (
                            <button onClick={() => onEdit(log)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors">
                                <Edit size={14} className="text-gray-500 dark:text-gray-400" />
                            </button>
                        )}
                    </div>

                    <p className="italic whitespace-pre-wrap pr-8">{messageContent}</p>
                    {renderCambiosProceso()}
                </div>
            </div>
        </li>
    );
};

// Componente principal de la pestaña
const TabHistorial = forwardRef(({ cliente, isReadOnly }, ref) => {
    const { userData } = useAuth();
    const userName = `${userData.nombres} ${userData.apellidos}`;

    const { historial, loading, fetchHistorial } = useHistorialCliente(cliente?.id);

    useImperativeHandle(ref, () => ({
        fetchHistorial
    }));

    const [notaAEditar, setNotaAEditar] = useState(null);
    const [confirmacionCambios, setConfirmacionCambios] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [auditoriaArchivos, setAuditoriaArchivos] = useState(null);

    if (!cliente) {
        // Esto previene el error y muestra un estado de carga o nulo si los datos no han llegado.
        return <div className="p-10 text-center">Cargando datos del cliente...</div>;
    }

    const clienteId = cliente.id;

    const handleIniciarEdicion = (nota) => {
        setNotaAEditar(nota);
    };

    const handleGuardarEdicion = (nuevoTexto) => {
        const cambios = [{
            campo: "Contenido de la Nota",
            anterior: notaAEditar.message,
            actual: nuevoTexto
        }];
        setConfirmacionCambios({
            cambios,
            nuevoTexto,
            notaOriginal: notaAEditar
        });
        setNotaAEditar(null);
    };

    const handleConfirmarGuardado = async () => {
        if (!confirmacionCambios) return;
        setIsSubmitting(true);
        try {
            const { notaOriginal, nuevoTexto } = confirmacionCambios;
            await updateNotaHistorial(notaOriginal, nuevoTexto, userName);
            toast.success("Nota actualizada con éxito.");
            fetchHistorial();
        } catch (error) {
            console.error("Error DETALLADO al actualizar la nota:", error);
            toast.error("No se pudo actualizar la nota.");
        } finally {
            setIsSubmitting(false);
            setConfirmacionCambios(null);
        }
    };

    const handleVerAuditoriaArchivos = (log) => {
        setAuditoriaArchivos(log);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-10">
                <Loader className="animate-spin text-blue-500" size={40} />
            </div>
        );
    }


    const puedeAnadirNotas = cliente.status === 'activo' || cliente.status === 'enProcesoDeRenuncia';

    return (
        <AnimatedPage>
            {/* El formulario para añadir notas solo aparece si el cliente no ha renunciado */}
            {puedeAnadirNotas && (
                <FormularioNuevaNota clienteId={clienteId} onNotaAgregada={fetchHistorial} />
            )}

            {historial.length > 0 ? (
                <ol className="relative border-s border-gray-200 dark:border-gray-600">
                    {historial.map(item =>
                        <LogItem
                            key={item.id}
                            log={item}
                            onEdit={handleIniciarEdicion}
                            onViewFileAudit={handleVerAuditoriaArchivos}
                            isReadOnly={isReadOnly}
                        />
                    )}
                </ol>
            ) : (
                <div className="text-center py-10">
                    <p className="text-gray-500 dark:text-gray-400">No hay historial de actividad para este cliente.</p>
                </div>
            )}

            <ModalEditarNota
                isOpen={!!notaAEditar}
                onClose={() => setNotaAEditar(null)}
                onSave={handleGuardarEdicion}
                notaAEditar={notaAEditar}
            />
            <ModalConfirmacion
                isOpen={!!confirmacionCambios}
                onClose={() => setConfirmacionCambios(null)}
                onConfirm={handleConfirmarGuardado}
                titulo="Confirmar Cambios en la Nota"
                cambios={confirmacionCambios?.cambios || []}
                isSubmitting={isSubmitting}
                size="xl"
            />
            <ModalAuditoriaArchivos
                isOpen={!!auditoriaArchivos}
                onClose={() => setAuditoriaArchivos(null)}
                auditLog={auditoriaArchivos}
            />
        </AnimatedPage>
    );
});

export default TabHistorial;