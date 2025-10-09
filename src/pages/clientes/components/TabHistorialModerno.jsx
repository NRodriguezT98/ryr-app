// TabHistorialModerno.jsx - Versión completamente modernizada 🚀
import React, { useState, useImperativeHandle, forwardRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuditLogsForCliente } from '../../../services/auditService';
import { updateNotaHistorial } from '../../../services/clienteService';
import { useHistorialCliente } from '../../../hooks/clientes/useHistorialCliente';
import { useAuth } from '../../../context/AuthContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    Loader,
    Edit,
    UserPlus,
    FileText,
    UserX,
    RefreshCw,
    Archive,
    ArchiveRestore,
    CheckCircle,
    MessageSquareText,
    GitCommit,
    DollarSign,
    Unlock,
    Eye,
    FolderOpen,
    Clock,
    TrendingUp,
    BarChart3,
    Calendar,
    Activity,
    Sparkles,
    Filter,
    Search,
    User,
    Target,
    Zap
} from 'lucide-react';
import AnimatedPage from '../../../components/AnimatedPage';
import FormularioNuevaNota from './FormularioNuevaNota';
import ModalEditarNota from './ModalEditarNota';
import ModalConfirmacion from '../../../components/ModalConfirmacion';
import ModalAuditoriaArchivos from '../../../components/ModalAuditoriaArchivos';
import toast from 'react-hot-toast';
import { formatDisplayDate } from '../../../utils/textFormatters';
import { hasFileChanges } from '../../../utils/fileAuditHelper';

// Mapeo de acciones a configuraciones visuales
const getActionConfig = (action) => {
    const actionConfigs = {
        'ADD_NOTE': {
            icon: MessageSquareText,
            color: 'from-purple-500 to-pink-500',
            bgColor: 'bg-purple-100 dark:bg-purple-900/20',
            textColor: 'text-purple-700 dark:text-purple-300',
            label: 'Nota'
        },
        'CREATE_CLIENT': {
            icon: UserPlus,
            color: 'from-green-500 to-emerald-500',
            bgColor: 'bg-green-100 dark:bg-green-900/20',
            textColor: 'text-green-700 dark:text-green-300',
            label: 'Creación'
        },
        'UPDATE_CLIENT': {
            icon: Edit,
            color: 'from-blue-500 to-cyan-500',
            bgColor: 'bg-blue-100 dark:bg-blue-900/20',
            textColor: 'text-blue-700 dark:text-blue-300',
            label: 'Actualización'
        },
        'EDIT_NOTE': {
            icon: Edit,
            color: 'from-amber-500 to-orange-500',
            bgColor: 'bg-amber-100 dark:bg-amber-900/20',
            textColor: 'text-amber-700 dark:text-amber-300',
            label: 'Edición'
        },
        'UPDATE_PROCESO': {
            icon: GitCommit,
            color: 'from-indigo-500 to-purple-500',
            bgColor: 'bg-indigo-100 dark:bg-indigo-900/20',
            textColor: 'text-indigo-700 dark:text-indigo-300',
            label: 'Proceso'
        },
        'REGISTER_ABONO': {
            icon: DollarSign,
            color: 'from-green-500 to-teal-500',
            bgColor: 'bg-green-100 dark:bg-green-900/20',
            textColor: 'text-green-700 dark:text-green-300',
            label: 'Abono'
        },
        'REGISTER_DISBURSEMENT': {
            icon: DollarSign,
            color: 'from-emerald-500 to-green-500',
            bgColor: 'bg-emerald-100 dark:bg-emerald-900/20',
            textColor: 'text-emerald-700 dark:text-emerald-300',
            label: 'Desembolso'
        },
        'REGISTER_CREDIT_DISBURSEMENT': {
            icon: DollarSign,
            color: 'from-teal-500 to-cyan-500',
            bgColor: 'bg-teal-100 dark:bg-teal-900/20',
            textColor: 'text-teal-700 dark:text-teal-300',
            label: 'Crédito'
        },
        'VOID_ABONO': {
            icon: UserX,
            color: 'from-red-500 to-pink-500',
            bgColor: 'bg-red-100 dark:bg-red-900/20',
            textColor: 'text-red-700 dark:text-red-300',
            label: 'Anulación'
        },
        'REVERT_VOID_ABONO': {
            icon: RefreshCw,
            color: 'from-yellow-500 to-amber-500',
            bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
            textColor: 'text-yellow-700 dark:text-yellow-300',
            label: 'Reversión'
        },
        'CLIENT_RENOUNCE': {
            icon: UserX,
            color: 'from-gray-500 to-slate-500',
            bgColor: 'bg-gray-100 dark:bg-gray-900/20',
            textColor: 'text-gray-700 dark:text-gray-300',
            label: 'Renuncia'
        },
        'RESTART_CLIENT_PROCESS': {
            icon: RefreshCw,
            color: 'from-blue-500 to-indigo-500',
            bgColor: 'bg-blue-100 dark:bg-blue-900/20',
            textColor: 'text-blue-700 dark:text-blue-300',
            label: 'Reinicio'
        },
        'ARCHIVE_CLIENT': {
            icon: Archive,
            color: 'from-gray-500 to-gray-600',
            bgColor: 'bg-gray-100 dark:bg-gray-900/20',
            textColor: 'text-gray-700 dark:text-gray-300',
            label: 'Archivo'
        },
        'RESTORE_CLIENT': {
            icon: ArchiveRestore,
            color: 'from-green-500 to-lime-500',
            bgColor: 'bg-green-100 dark:bg-green-900/20',
            textColor: 'text-green-700 dark:text-green-300',
            label: 'Restauración'
        },
        'ANULAR_CIERRE_PROCESO': {
            icon: Unlock,
            color: 'from-orange-500 to-red-500',
            bgColor: 'bg-orange-100 dark:bg-orange-900/20',
            textColor: 'text-orange-700 dark:text-orange-300',
            label: 'Reapertura'
        },
        'DEFAULT': {
            icon: FileText,
            color: 'from-gray-400 to-gray-500',
            bgColor: 'bg-gray-100 dark:bg-gray-900/20',
            textColor: 'text-gray-700 dark:text-gray-300',
            label: 'Actividad'
        }
    };

    return actionConfigs[action] || actionConfigs['DEFAULT'];
};

// Componente de estadística para el historial
const HistoryStatCard = ({ icon: Icon, label, value, color = "blue", delay = 0 }) => {
    const colorVariants = {
        blue: "from-blue-500 to-blue-600",
        green: "from-green-500 to-green-600",
        purple: "from-purple-500 to-purple-600",
        orange: "from-orange-500 to-orange-600"
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
        >
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {value}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                        {label}
                    </div>
                </div>
                <div className={`p-3 rounded-lg bg-gradient-to-br ${colorVariants[color]} shadow-lg`}>
                    <Icon size={20} className="text-white" />
                </div>
            </div>
        </motion.div>
    );
};

// Componente de filtro moderno para historial
const HistoryFilterButton = ({ active, onClick, children, icon: Icon, count }) => (
    <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`
            flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all
            ${active
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }
        `}
    >
        <Icon size={14} />
        {children}
        {count !== undefined && (
            <span className={`
                px-1.5 py-0.5 rounded-full text-xs font-bold
                ${active ? 'bg-white/20' : 'bg-blue-500 text-white'}
            `}>
                {count}
            </span>
        )}
    </motion.button>
);

// Sub-componente modernizado para cada item del historial
const ModernLogItem = ({ log, index, onEdit, onViewFileAudit, isReadOnly }) => {
    const { userData } = useAuth();
    const actionConfig = getActionConfig(log.details?.action);
    const isNota = log.details?.action === 'ADD_NOTE';
    const timestamp = log.timestamp?.toDate ? log.timestamp.toDate() : new Date();
    const formattedDate = format(timestamp, "d 'de' MMMM, yyyy 'a las' h:mm a", { locale: es });
    const Icon = actionConfig.icon;

    const puedeEditar = !isReadOnly && isNota && log.userName === `${userData.nombres} ${userData.apellidos}`;
    const tieneArchivos = hasFileChanges(log);

    const cambiosProceso = log.details?.action === 'UPDATE_PROCESO' ? log.details.cambios : [];
    const messageContent = log.displayMessage;

    const renderCambiosProceso = () => {
        if (!cambiosProceso || cambiosProceso.length === 0) return null;
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3 pt-3 border-t border-dashed border-gray-300 dark:border-gray-600 space-y-2"
            >
                {cambiosProceso.map((cambio, cambioIndex) => (
                    <motion.div
                        key={cambioIndex}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: cambioIndex * 0.1 }}
                        className="flex items-center gap-2"
                    >
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
                                    'Se modificó:'}
                            <span className="font-semibold text-gray-700 dark:text-gray-100 ml-1">
                                {cambio.paso}
                            </span>
                        </span>
                    </motion.div>
                ))}
            </motion.div>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="relative"
        >
            {/* Línea conectora */}
            {index > 0 && (
                <div className="absolute left-6 -top-4 w-0.5 h-8 bg-gradient-to-b from-blue-200 to-purple-200 dark:from-blue-800 dark:to-purple-800" />
            )}

            <div className="flex gap-4">
                {/* Icono de timeline */}
                <div className="relative flex-shrink-0">
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        className={`
                            w-12 h-12 rounded-full bg-gradient-to-br ${actionConfig.color} 
                            flex items-center justify-center shadow-lg relative z-10
                        `}
                    >
                        <Icon size={20} className="text-white" />
                    </motion.div>
                </div>

                {/* Contenido de la card */}
                <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="flex-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-all duration-300"
                >
                    {/* Header de la card */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`
                                    px-2 py-1 rounded-lg text-xs font-semibold
                                    ${actionConfig.bgColor} ${actionConfig.textColor}
                                `}>
                                    {actionConfig.label}
                                </span>
                                {tieneArchivos && (
                                    <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 flex items-center gap-1">
                                        <FolderOpen size={10} />
                                        Con archivos
                                    </span>
                                )}
                                {log.editado && (
                                    <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                                        Editado
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <User size={14} />
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {log.userName}
                                </span>
                                <span>•</span>
                                <Clock size={14} />
                                <time>{formattedDate}</time>
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            {tieneArchivos && (
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => onViewFileAudit(log)}
                                    className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                                    title="Ver auditoría de archivos"
                                >
                                    <FolderOpen size={16} className="text-blue-600 dark:text-blue-400" />
                                </motion.button>
                            )}
                            {puedeEditar && (
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => onEdit(log)}
                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    title="Editar nota"
                                >
                                    <Edit size={16} className="text-gray-500 dark:text-gray-400" />
                                </motion.button>
                            )}
                        </div>
                    </div>

                    {/* Contenido del mensaje */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                            {messageContent}
                        </p>
                        {renderCambiosProceso()}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

// Componente principal modernizado
const TabHistorialModerno = forwardRef(({ cliente, isReadOnly }, ref) => {
    const { userData } = useAuth();
    const userName = `${userData.nombres} ${userData.apellidos}`;

    const { historial, loading, fetchHistorial } = useHistorialCliente(cliente?.id);
    const [filtroTipo, setFiltroTipo] = useState('todos');
    const [searchTerm, setSearchTerm] = useState('');

    useImperativeHandle(ref, () => ({
        fetchHistorial
    }));

    const [notaAEditar, setNotaAEditar] = useState(null);
    const [confirmacionCambios, setConfirmacionCambios] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [auditoriaArchivos, setAuditoriaArchivos] = useState(null);

    // Estadísticas del historial
    const stats = useMemo(() => {
        const total = historial.length;
        const notas = historial.filter(item => item.details?.action === 'ADD_NOTE').length;
        const acciones = total - notas;
        const ultimaActividad = total > 0 ? historial[0]?.timestamp?.toDate?.() : null;

        return { total, notas, acciones, ultimaActividad };
    }, [historial]);

    // Filtrado del historial
    const historialFiltrado = useMemo(() => {
        let filtered = historial;

        // Filtro por tipo
        if (filtroTipo === 'notas') {
            filtered = filtered.filter(item => item.details?.action === 'ADD_NOTE');
        } else if (filtroTipo === 'acciones') {
            filtered = filtered.filter(item => item.details?.action !== 'ADD_NOTE');
        }

        // Filtro por búsqueda
        if (searchTerm) {
            filtered = filtered.filter(item =>
                item.displayMessage?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.userName?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return filtered;
    }, [historial, filtroTipo, searchTerm]);

    if (!cliente) {
        return (
            <div className="flex justify-center items-center p-10">
                <Loader className="animate-spin text-blue-500" size={40} />
            </div>
        );
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
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                    <Loader className="text-blue-500" size={40} />
                </motion.div>
            </div>
        );
    }

    const puedeAnadirNotas = cliente.status === 'activo' || cliente.status === 'enProcesoDeRenuncia';

    return (
        <AnimatedPage>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
            >
                {/* Header moderno */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                    <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <Activity size={24} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">
                                        Historial de Actividad
                                    </h2>
                                    <p className="text-purple-100 text-sm">
                                        Registro completo de eventos y notas
                                    </p>
                                </div>
                            </div>
                            {stats.ultimaActividad && (
                                <div className="text-right">
                                    <div className="text-white/80 text-sm">Última actividad:</div>
                                    <div className="text-white font-semibold">
                                        {format(stats.ultimaActividad, "d MMM, yyyy", { locale: es })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <HistoryStatCard
                        icon={Activity}
                        label="Total Eventos"
                        value={stats.total}
                        color="blue"
                        delay={0.1}
                    />
                    <HistoryStatCard
                        icon={MessageSquareText}
                        label="Notas"
                        value={stats.notas}
                        color="purple"
                        delay={0.2}
                    />
                    <HistoryStatCard
                        icon={Zap}
                        label="Acciones"
                        value={stats.acciones}
                        color="green"
                        delay={0.3}
                    />
                </div>

                {/* Controles de filtrado */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
                >
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                        {/* Filtros por tipo */}
                        <div className="flex items-center gap-2">
                            <Filter size={20} className="text-gray-500 dark:text-gray-400" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">
                                Filtros:
                            </span>
                            <div className="flex gap-2">
                                <HistoryFilterButton
                                    active={filtroTipo === 'todos'}
                                    onClick={() => setFiltroTipo('todos')}
                                    icon={BarChart3}
                                    count={filtroTipo === 'todos' ? historialFiltrado.length : historial.length}
                                >
                                    Todos
                                </HistoryFilterButton>
                                <HistoryFilterButton
                                    active={filtroTipo === 'notas'}
                                    onClick={() => setFiltroTipo('notas')}
                                    icon={MessageSquareText}
                                    count={stats.notas}
                                >
                                    Notas
                                </HistoryFilterButton>
                                <HistoryFilterButton
                                    active={filtroTipo === 'acciones'}
                                    onClick={() => setFiltroTipo('acciones')}
                                    icon={Target}
                                    count={stats.acciones}
                                >
                                    Acciones
                                </HistoryFilterButton>
                            </div>
                        </div>

                        {/* Búsqueda */}
                        <div className="relative">
                            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar en historial..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Formulario para nuevas notas */}
                {puedeAnadirNotas && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <FormularioNuevaNota clienteId={clienteId} onNotaAgregada={fetchHistorial} />
                    </motion.div>
                )}

                {/* Timeline del historial */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="space-y-6"
                >
                    {historialFiltrado.length > 0 ? (
                        <AnimatePresence>
                            {historialFiltrado.map((item, index) => (
                                <ModernLogItem
                                    key={item.id}
                                    log={item}
                                    index={index}
                                    onEdit={handleIniciarEdicion}
                                    onViewFileAudit={handleVerAuditoriaArchivos}
                                    isReadOnly={isReadOnly}
                                />
                            ))}
                        </AnimatePresence>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-12"
                        >
                            <div className="flex flex-col items-center gap-4">
                                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full">
                                    <Activity size={32} className="text-gray-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                        No hay actividad
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        {searchTerm
                                            ? `No se encontró actividad que coincida con "${searchTerm}"`
                                            : "No hay historial de actividad para mostrar"
                                        }
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </motion.div>

                {/* Footer decorativo */}
                <motion.div
                    className="text-center py-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                >
                    <div className="flex items-center justify-center gap-2 text-gray-400 dark:text-gray-500 text-sm">
                        <Sparkles size={16} />
                        <span>Sistema de Historial RyR</span>
                        <Sparkles size={16} />
                    </div>
                </motion.div>
            </motion.div>

            {/* Modales */}
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

export default TabHistorialModerno;