// TabProcesoClienteModerno.jsx - Versión completamente modernizada 🚀
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProcesoLogic } from '../../../hooks/clientes/useProcesoLogic';
import { useAuth } from '../../../context/AuthContext';
import { useAudit } from '../../../context/AuditContext';
import { Tooltip } from 'react-tooltip';
import ModalConfirmacion from '../../../components/ModalConfirmacion';
import ModalEditarFechaProceso from './ModalEditarFechaProceso';
import {
    PartyPopper,
    Unlock,
    CheckCircle,
    Clock,
    TrendingUp,
    Zap,
    Target,
    Award,
    Sparkles,
    ArrowRight,
    PlayCircle,
    Shield,
    Rocket,
    Crown
} from 'lucide-react';
import ClienteEstadoView from './ClienteEstadoView';
import Timeline from './Timeline';
import TimelineSkeleton from './TimelineSkeleton';
import ModalMotivoReapertura from './ModalMotivoReapertura';
import { usePermissions } from '../../../hooks/auth/usePermissions';
import Button from '../../../components/Button';

// Componente de progreso circular animado
const CircularProgressRing = ({ percentage, size = 120, strokeWidth = 8 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative">
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background ring */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="none"
                    className="text-gray-200 dark:text-gray-700"
                />
                {/* Progress ring */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="url(#gradient)"
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 2, ease: "easeOut" }}
                />
                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3B82F6" />
                        <stop offset="100%" stopColor="#8B5CF6" />
                    </linearGradient>
                </defs>
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 1, type: "spring", stiffness: 200 }}
                        className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                    >
                        {Math.round(percentage)}%
                    </motion.div>
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">
                        Completado
                    </div>
                </div>
            </div>
        </div>
    );
};

// Componente de estadística moderna
const ModernStatCard = ({ icon: Icon, label, value, color = "blue", delay = 0 }) => {
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
            transition={{ duration: 0.6, delay }}
            className="relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 p-4 shadow-lg hover:shadow-xl transition-all duration-300"
        >
            {/* Gradient background */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colorVariants[color]}`} />

            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${colorVariants[color]}`}>
                    <Icon size={20} className="text-white" />
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
                </div>
            </div>

            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-200%] hover:translate-x-[200%] transition-transform duration-1000" />
        </motion.div>
    );
};

// Header hero modernizado
const ModernProgressHeader = ({ progreso, procesoCompletado, porcentajeProgreso }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900 p-8 mb-8 border border-white/20 dark:border-gray-700/20 shadow-xl"
        >
            {/* Background effects */}
            <div className="absolute -top-4 -right-4 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-tr from-purple-500/10 to-pink-500/10 rounded-full blur-2xl" />

            <div className="relative z-10">
                {procesoCompletado ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <div className="flex items-center justify-center gap-4 mb-6">
                            <motion.div
                                animate={{
                                    rotate: [0, 10, -10, 0],
                                    scale: [1, 1.1, 1]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    repeatType: "reverse"
                                }}
                            >
                                <Crown size={48} className="text-yellow-500" />
                            </motion.div>
                            <div>
                                <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                    ¡Proceso Completado!
                                </h2>
                                <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
                                    Todos los pasos se han ejecutado exitosamente
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <CircularProgressRing percentage={100} />
                        </div>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        {/* Left side - Progress info */}
                        <div>
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                    Progreso del Proceso
                                </h2>
                                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                                    Seguimiento detallado de cada etapa
                                </p>
                            </motion.div>

                            <div className="grid grid-cols-2 gap-4">
                                <ModernStatCard
                                    icon={CheckCircle}
                                    label="Completados"
                                    value={progreso.completados}
                                    color="green"
                                    delay={0.3}
                                />
                                <ModernStatCard
                                    icon={Target}
                                    label="Total"
                                    value={progreso.total}
                                    color="blue"
                                    delay={0.4}
                                />
                            </div>
                        </div>

                        {/* Right side - Circular progress */}
                        <div className="flex justify-center">
                            <CircularProgressRing percentage={porcentajeProgreso} />
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

// Botón de guardar modernizado
const ModernSaveButton = ({ onClick, disabled, isLoading, tooltipMessage, hayCambios }) => {
    if (!hayCambios) return null;

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex justify-end mb-6"
        >
            <span data-tooltip-id="app-tooltip" data-tooltip-content={tooltipMessage}>
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Button
                        onClick={onClick}
                        disabled={disabled}
                        isLoading={isLoading}
                        loadingText="Guardando..."
                        className="shadow-lg shadow-blue-500/25 px-6 py-3 text-base font-semibold"
                        icon={<Zap size={18} />}
                    >
                        Guardar Cambios
                    </Button>
                </motion.div>
            </span>
        </motion.div>
    );
};

// Componente principal modernizado
const TabProcesoClienteModerno = ({ cliente, renuncia, onDatosRecargados, onHayCambiosChange, isReadOnly: isReadOnlyFromStatus }) => {
    const { userData } = useAuth();
    const { can } = usePermissions();
    const isReadOnly = isReadOnlyFromStatus || !can('clientes', 'actualizarPasos');
    const [isLoading, setIsLoading] = useState(true);

    const {
        isSubmitting,
        isLoadingProceso,
        pasosRenderizables,
        progreso,
        hayPasoEnReapertura,
        reaperturaInfo,
        pasoAEditarFecha,
        cierreAAnular,
        justSaved,
        isSaveDisabled,
        tooltipMessage,
        hayCambiosSinGuardar,
        procesoCompletado,
        handlers,
    } = useProcesoLogic(cliente, onDatosRecargados, onDatosRecargados);

    const isMotivoModalOpen = !!reaperturaInfo || !!cierreAAnular;
    const motivoModalData = reaperturaInfo || cierreAAnular;

    const handleCloseMotivoModal = () => {
        if (reaperturaInfo) handlers.cancelarReapertura();
        if (cierreAAnular) handlers.cancelarAnulacionCierre();
    };

    const handleConfirmMotivoModal = (motivo) => {
        if (reaperturaInfo) handlers.confirmarReapertura(motivo);
        if (cierreAAnular) handlers.confirmarAnulacionCierre(motivo);
    };

    useEffect(() => {
        onHayCambiosChange(hayCambiosSinGuardar);
    }, [hayCambiosSinGuardar, onHayCambiosChange]);

    useEffect(() => {
        if (pasosRenderizables && pasosRenderizables.length > 0) {
            setIsLoading(false);
        }
    }, [pasosRenderizables]);

    const pasoAReabrirInfo = reaperturaInfo ? pasosRenderizables.find(p => p.key === reaperturaInfo.key) : null;
    const nombrePaso = cierreAAnular ? "Factura de Venta" : (pasoAReabrirInfo ? `"${pasoAReabrirInfo.label.substring(pasoAReabrirInfo.label.indexOf('.') + 1).trim()}"` : '');
    const porcentajeProgreso = progreso.total > 0 ? (progreso.completados / progreso.total) * 100 : 0;

    return (
        <div className="space-y-8">
            {/* Header modernizado con progreso */}
            <ModernProgressHeader
                progreso={progreso}
                procesoCompletado={procesoCompletado}
                porcentajeProgreso={porcentajeProgreso}
            />

            {/* Botón de anular cierre para admin */}
            <AnimatePresence>
                {procesoCompletado && !hayCambiosSinGuardar && userData?.role === 'admin' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-2xl p-6 border border-red-200 dark:border-red-700"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/50">
                                <Shield size={24} className="text-red-600 dark:text-red-400" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-red-800 dark:text-red-200 mb-1">
                                    Acciones de Administrador
                                </h4>
                                <p className="text-sm text-red-700 dark:text-red-300">
                                    Como administrador, puedes anular el cierre de este proceso completado
                                </p>
                            </div>
                            <Button
                                variant="danger"
                                onClick={handlers.iniciarAnulacionCierre}
                                icon={<Unlock size={16} />}
                                size="sm"
                            >
                                Anular Cierre
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Save button section */}
            <AnimatePresence>
                <ModernSaveButton
                    onClick={handlers.handleSaveChanges}
                    disabled={isSaveDisabled}
                    isLoading={isSubmitting}
                    tooltipMessage={tooltipMessage}
                    hayCambios={hayCambiosSinGuardar}
                />
            </AnimatePresence>

            {/* Timeline Section */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="relative"
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500">
                        <PlayCircle size={20} className="text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Línea de Tiempo del Proceso
                    </h3>
                </div>

                {isLoadingProceso ? (
                    <TimelineSkeleton />
                ) : (
                    <div className="relative">
                        <Timeline
                            pasos={pasosRenderizables}
                            justSaved={justSaved}
                            onUpdateEvidencia={handlers.handleUpdateEvidencia}
                            onCompletarPaso={handlers.handleCompletarPaso}
                            onIniciarReapertura={handlers.iniciarReapertura}
                            onDescartarCambios={handlers.descartarCambiosEnPaso}
                            onIniciarEdicionFecha={handlers.iniciarEdicionFecha}
                            clienteId={cliente.id}
                            isReadOnly={isReadOnly}
                        />
                    </div>
                )}
            </motion.div>



            {/* Footer decorativo */}
            <motion.div
                className="text-center py-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
            >
                <div className="flex items-center justify-center gap-2 text-gray-400 dark:text-gray-500 text-sm">
                    <Sparkles size={16} />
                    <span>Gestión de Procesos RyR</span>
                    <Sparkles size={16} />
                </div>
            </motion.div>

            {/* Modals - manteniendo funcionalidad original */}
            <ModalMotivoReapertura
                isOpen={isMotivoModalOpen}
                onClose={handleCloseMotivoModal}
                onConfirm={handleConfirmMotivoModal}
                titulo={cierreAAnular ? "Justificar Anulación de Cierre" : "Justificar Reapertura de Paso"}
                nombrePaso={nombrePaso}
            />

            <ModalEditarFechaProceso
                isOpen={!!pasoAEditarFecha}
                onClose={handlers.cancelarEdicionFecha}
                onConfirm={handlers.confirmarEdicionFecha}
                pasoInfo={pasoAEditarFecha ? {
                    ...pasoAEditarFecha,
                    ...pasosRenderizables.find(p => p.key === pasoAEditarFecha.key)
                } : null}
            />
        </div>
    );
};

export default TabProcesoClienteModerno;