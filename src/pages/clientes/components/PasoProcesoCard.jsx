// src/pages/clientes/components/PasoProcesoCardModerno.jsx

import React, { useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle,
    Lock,
    FileText,
    Calendar,
    AlertCircle,
    RotateCcw,
    Eye,
    Trash2,
    Replace,
    X,
    Pencil,
    Info,
    ChevronDown,
    History,
    Wallet,
    Upload,
    Clock,
    Shield,
    Star,
    Zap,
    Target
} from 'lucide-react';
import FileUpload from '../../../components/FileUpload';
import { useModernToast } from '../../../hooks/useModernToast.jsx';
import { getTodayString, formatDisplayDate, parseDateAsUTC, normalizeDate, formatCurrency } from '../../../utils/textFormatters';
import { uploadFile } from "../../../services/fileService";
import { usePermissions } from '../../../hooks/auth/usePermissions';

// Componente modernizado para elementos de evidencia
const ModernEvidenciaItem = ({ evidencia, pasoKey, onUpdateEvidencia, clienteId, isPermanentlyLocked, esHito, isReadOnly }) => {
    const evidenciaData = evidencia.data || {};
    const fileInputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);
    const toast = useModernToast();

    const generateUniqueFilePath = (fileName) => {
        const timestamp = Date.now();
        return `documentos_proceso/${clienteId}/${evidencia.id}-${timestamp}-${fileName}`;
    };

    const handleUploadSuccess = (url) => {
        onUpdateEvidencia(pasoKey, evidencia.id, url);
        setIsUploading(false);
    };

    const handleRemove = () => {
        if (esHito && isPermanentlyLocked) {
            toast.error("Las evidencias de un hito cerrado permanentemente no se pueden eliminar.", {
                title: "Acción No Permitida"
            });
            return;
        }
        onUpdateEvidencia(pasoKey, evidencia.id, null);
    };

    const handleFileChangeForReplace = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const loadingToast = toast.loading('Reemplazando archivo...');

        try {
            const filePath = generateUniqueFilePath(file.name);
            const downloadURL = await uploadFile(file, filePath);

            onUpdateEvidencia(pasoKey, evidencia.id, downloadURL);
            toast.dismiss(loadingToast);
            toast.success('¡Archivo reemplazado con éxito!', {
                title: "¡Archivo Actualizado!"
            });
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error("Error al reemplazar el archivo.", {
                title: "Error de Reemplazo"
            });
            console.error("Error en handleFileChangeForReplace:", error);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-300"
        >
            <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                    <div className={`
                        relative flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300
                        ${evidenciaData.url
                            ? 'bg-green-500 dark:bg-green-600'
                            : 'bg-gray-400 dark:bg-gray-600'}
                    `}>
                        <FileText size={16} className="text-white" />
                        {evidenciaData.url && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"
                            />
                        )}
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">
                        {evidencia.label}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    {evidenciaData.url ? (
                        <motion.div
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-2"
                        >
                            <motion.a
                                href={evidenciaData.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all"
                            >
                                <Eye size={12} /> Ver
                            </motion.a>

                            {!isPermanentlyLocked && !isReadOnly && (
                                <>
                                    <motion.button
                                        onClick={() => fileInputRef.current?.click()}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        disabled={isUploading}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 rounded-md hover:bg-yellow-100 dark:hover:bg-yellow-900/50 transition-all disabled:opacity-50"
                                    >
                                        {isUploading ? (
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                className="w-3 h-3 border border-current border-t-transparent rounded-full"
                                            />
                                        ) : (
                                            <Replace size={12} />
                                        )}
                                        {isUploading ? 'Subiendo...' : 'Reemplazar'}
                                    </motion.button>

                                    <motion.button
                                        onClick={handleRemove}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-500 bg-red-50 dark:bg-red-900/30 rounded-md hover:bg-red-100 dark:hover:bg-red-900/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={esHito && isPermanentlyLocked}
                                        data-tooltip-id="app-tooltip"
                                        data-tooltip-content={esHito && isPermanentlyLocked ? "No se puede eliminar la evidencia de un hito cerrado." : "Eliminar evidencia"}
                                    >
                                        <Trash2 size={12} /> Eliminar
                                    </motion.button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChangeForReplace}
                                        className="hidden"
                                        accept=".pdf,.png,.jpg,.jpeg"
                                    />
                                </>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <FileUpload
                                label="Subir"
                                filePath={generateUniqueFilePath}
                                onUploadSuccess={handleUploadSuccess}
                                isCompact={true}
                                disabled={isReadOnly}
                            />
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

// Componente modernizado para avisos de pasos automáticos
const ModernAvisoPasoAutomatico = ({ clienteId }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 pl-9"
    >
        <div className="rounded-lg bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700">
            <div className="p-4 flex items-start gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-500 dark:bg-blue-600 rounded-lg">
                    <Zap size={20} className="text-white" />
                </div>
                <div className="flex-1">
                    <h4 className="font-bold text-blue-900 dark:text-blue-100 text-sm mb-1">
                        Paso Automático
                    </h4>
                    <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                        Se marcará como completado cuando registres el abono o desembolso correspondiente desde el
                        <Link
                            to={`/abonos/gestionar/${clienteId}`}
                            className="font-bold underline hover:text-blue-500 mx-1"
                        >
                            Módulo de Abonos
                        </Link>.
                    </p>
                </div>
            </div>
        </div>
    </motion.div>
);

// Componente modernizado para avisos de saldo pendiente
const ModernAvisoSaldoPendiente = ({ clienteId, saldoPendiente }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 pl-9"
    >
        <div className="rounded-lg bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-700">
            <div className="p-4 flex items-start gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-orange-500 dark:bg-orange-600 rounded-lg">
                    <Wallet size={20} className="text-white" />
                </div>
                <div className="flex-1">
                    <h4 className="font-bold text-orange-900 dark:text-orange-100 text-sm mb-1">
                        Acción Requerida
                    </h4>
                    <p className="text-xs text-orange-700 dark:text-orange-300 mb-2 leading-relaxed">
                        Este paso se habilitará automáticamente una vez que el cliente esté a paz y salvo.
                    </p>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 dark:bg-red-900/30 rounded-lg">
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
                            Saldo pendiente:
                        </span>
                        <strong className="text-sm font-bold text-red-600 dark:text-red-400">
                            {formatCurrency(saldoPendiente)}
                        </strong>
                    </div>
                </div>
            </div>
        </div>
    </motion.div>
);

const generarTooltipInteligente = (data, formatDisplayDate) => {
    if (!data || !data.actividad || data.actividad.length === 0) {
        return '';
    }

    const ultimaActividad = data.actividad[data.actividad.length - 1];
    const autor = ultimaActividad.userName || 'Usuario Desconocido';

    if (data.motivoReapertura && data.motivoUltimoCambio === 'Paso reabierto') {
        const fechaModificacion = formatDisplayDate(normalizeDate(data.fechaUltimaModificacion)) || 'N/A';
        return `Reabierto por ${autor} el ${fechaModificacion}. Motivo: "${data.motivoReapertura}"`;
    }

    if (data.motivoUltimoCambio && data.motivoUltimoCambio !== 'Paso reabierto') {
        const fechaModificacion = formatDisplayDate(normalizeDate(data.fechaUltimaModificacion)) || 'N/A';
        return `Fecha actualizada por ${autor} el ${fechaModificacion}. Motivo: "${data.motivoUltimoCambio}"`;
    }

    if (data.completado && data.fecha) {
        const fechaCompletado = formatDisplayDate(normalizeDate(data.fecha)) || 'N/A';
        const fechaDeLaAccion = formatDisplayDate(normalizeDate(ultimaActividad.fecha)) || 'N/A';
        return `El día ${fechaDeLaAccion}, ${autor} marcó como completado este paso con fecha de ${fechaCompletado}.`;
    }
    return '';
};

const PasoProcesoCardModerno = ({ paso, onUpdateEvidencia, onCompletarPaso, onIniciarReapertura, onDescartarCambios, onIniciarEdicionFecha, clienteId, isReadOnly }) => {
    const {
        key,
        label,
        data,
        isLocked,
        puedeCompletarse,
        evidenciasRequeridas,
        error,
        esSiguientePaso,
        isPermanentlyLocked,
        hayPasoEnReapertura,
        esHito,
        esAutomatico,
        facturaBloqueadaPorSaldo,
        saldoPendiente
    } = paso;

    const [fechaCompletado, setFechaCompletado] = useState(data?.fecha || getTodayString());
    const [fechaErrorLocal, setFechaErrorLocal] = useState(null);
    const [historialVisible, setHistorialVisible] = useState(false);
    const actividad = paso.data?.actividad || [];
    const { can } = usePermissions();
    const PASOS_AUTOMATICOS = ['desembolsoCredito', 'desembolsoMCY', 'desembolsoCaja'];

    const evidenciasSubidas = useMemo(() => {
        if (!data?.evidencias) return 0;
        return Object.values(data.evidencias).filter(ev => ev.url).length;
    }, [data]);

    const totalEvidencias = evidenciasRequeridas.length;

    const handleConfirmar = () => {
        if (!fechaCompletado) {
            setFechaErrorLocal("Debes seleccionar una fecha.");
            return;
        }
        const fechaSeleccionada = parseDateAsUTC(fechaCompletado);
        const fechaMinima = parseDateAsUTC(paso.minDate);
        const hoy = parseDateAsUTC(getTodayString());
        if (fechaSeleccionada > hoy) {
            setFechaErrorLocal("La fecha no puede ser futura.");
            return;
        }
        if (fechaSeleccionada < fechaMinima) {
            setFechaErrorLocal(`La fecha no puede ser anterior al último paso válido (${formatDisplayDate(paso.minDate)}).`);
            return;
        }
        setFechaErrorLocal(null);
        onCompletarPaso(key, fechaCompletado);
    };

    const handleFechaChange = (e) => {
        const nuevaFecha = e.target.value;

        if (nuevaFecha) {
            const fechaSeleccionada = parseDateAsUTC(nuevaFecha);
            const fechaMinima = parseDateAsUTC(paso.minDate);
            const fechaMaxima = parseDateAsUTC(paso.maxDate);

            if (fechaSeleccionada < fechaMinima || fechaSeleccionada > fechaMaxima) {
                setFechaErrorLocal(`La fecha debe estar entre ${formatDisplayDate(paso.minDate)} y ${formatDisplayDate(paso.maxDate)}.`);
                return;
            }
        }

        setFechaErrorLocal(null);
        setFechaCompletado(nuevaFecha);
    };

    const handleCancelarCambios = () => {
        setFechaErrorLocal(null);
        onDescartarCambios(key);
    };

    const tooltipContent = generarTooltipInteligente(paso.data, formatDisplayDate);

    // Determinamos el estado visual de la card
    const getCardState = () => {
        if (error || fechaErrorLocal) return 'error';
        if (data?.completado) return 'completed';
        if (isLocked && !facturaBloqueadaPorSaldo) return 'locked';
        if (esSiguientePaso) return 'active';
        return 'default';
    };

    const cardState = getCardState();

    // Clases CSS que se adaptan automáticamente al tema
    const cardClasses = {
        error: 'bg-white dark:bg-gray-800 border-red-300 dark:border-red-600 shadow-sm',
        completed: 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-600 shadow-sm',
        locked: 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-70',
        active: 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600 shadow-md',
        default: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            whileHover={{ scale: cardState === 'active' ? 1.02 : 1.01 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`relative overflow-hidden rounded-xl border transition-all duration-300 ${cardClasses[cardState]}`}
        >
            {/* Header de la card */}
            <div className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        {/* Indicador de estado */}
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            className="relative flex items-center justify-center"
                        >
                            {data?.completado ? (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
                                    className="relative"
                                >
                                    <CheckCircle size={28} className="text-green-500 dark:text-green-400" />
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.4 }}
                                        className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 dark:bg-green-300 rounded-full border-2 border-white dark:border-gray-800"
                                    />
                                </motion.div>
                            ) : (isLocked || facturaBloqueadaPorSaldo) ? (
                                <div className="flex items-center justify-center w-10 h-10 bg-gray-400 dark:bg-gray-600 rounded-lg">
                                    <Lock size={20} className="text-white" />
                                </div>
                            ) : (
                                <motion.div
                                    animate={esSiguientePaso ? {
                                        boxShadow: [
                                            "0 0 0 0 rgba(59, 130, 246, 0.3)",
                                            "0 0 0 8px rgba(59, 130, 246, 0)",
                                        ]
                                    } : {}}
                                    transition={esSiguientePaso ? { duration: 2, repeat: Infinity } : {}}
                                    className={`
                                        flex items-center justify-center w-10 h-10 rounded-lg text-white font-bold
                                        ${esSiguientePaso
                                            ? 'bg-blue-500 dark:bg-blue-400'
                                            : 'bg-blue-400 dark:bg-blue-500'
                                        }
                                    `}
                                >
                                    {esHito ? <Star size={20} /> : paso.stepNumber}
                                </motion.div>
                            )}
                        </motion.div>

                        {/* Título del paso */}
                        <div>
                            <motion.h3
                                className={`
                                    text-lg font-bold transition-colors
                                    ${data?.completado
                                        ? 'text-gray-500 dark:text-gray-400 line-through'
                                        : 'text-gray-800 dark:text-gray-100'
                                    }
                                `}
                            >
                                {label}
                            </motion.h3>
                            {esHito && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-center gap-1 mt-1"
                                >
                                    <Target size={12} className="text-amber-500" />
                                    <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                                        Hito Importante
                                    </span>
                                </motion.div>
                            )}
                        </div>
                    </div>

                    {/* Acciones y estado */}
                    {data?.completado && (
                        <motion.div
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-3"
                        >
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                                <Calendar size={14} className="text-gray-500 dark:text-gray-400" />
                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    {formatDisplayDate(normalizeDate(data.fecha))}
                                </p>
                                {tooltipContent && (
                                    <div data-tooltip-id="app-tooltip" data-tooltip-content={tooltipContent}>
                                        <Info size={14} className="text-blue-500 dark:text-blue-400 cursor-help" />
                                    </div>
                                )}
                            </div>

                            {isPermanentlyLocked ? (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-full"
                                >
                                    <Shield size={12} /> Cerrado
                                </motion.span>
                            ) : (
                                <div className="flex items-center gap-2">
                                    {!isReadOnly && can('clientes', 'editarFechaProceso') && (
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => onIniciarEdicionFecha(key)}
                                            disabled={hayPasoEnReapertura}
                                            className="p-2 text-gray-500 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                            data-tooltip-id="app-tooltip"
                                            data-tooltip-content="Editar fecha y motivo"
                                        >
                                            <Pencil size={14} />
                                        </motion.button>
                                    )}

                                    {!isReadOnly && can('clientes', 'reabrirProceso') && (
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => onIniciarReapertura(key)}
                                            disabled={isLocked || hayPasoEnReapertura}
                                            className="p-2 text-gray-500 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                            data-tooltip-id="app-tooltip"
                                            data-tooltip-content="Reabrir este paso"
                                        >
                                            <RotateCcw size={14} />
                                        </motion.button>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Contenido principal */}
            <AnimatePresence>
                {facturaBloqueadaPorSaldo ? (
                    <ModernAvisoSaldoPendiente clienteId={clienteId} saldoPendiente={saldoPendiente} />
                ) : PASOS_AUTOMATICOS.includes(key) && !data?.completado && !isLocked ? (
                    <ModernAvisoPasoAutomatico clienteId={clienteId} />
                ) : (
                    !data?.completado && !isLocked && !facturaBloqueadaPorSaldo && !esAutomatico && !isReadOnly && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="px-6 pb-6 space-y-4"
                        >
                            {/* Header de evidencias */}
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Upload size={16} className="text-gray-500" />
                                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                                        Evidencias Requeridas
                                    </p>
                                </div>
                                <motion.span
                                    animate={{
                                        scale: evidenciasSubidas === totalEvidencias ? [1, 1.1, 1] : 1
                                    }}
                                    transition={{ duration: 0.5 }}
                                    className={`
                                        text-xs font-bold px-3 py-1 rounded-full text-white
                                        ${evidenciasSubidas === totalEvidencias
                                            ? 'bg-green-500 dark:bg-green-600'
                                            : 'bg-amber-500 dark:bg-amber-600'
                                        }
                                    `}
                                >
                                    {evidenciasSubidas} de {totalEvidencias}
                                </motion.span>
                            </div>

                            {/* Lista de evidencias */}
                            <div className="space-y-3">
                                {evidenciasRequeridas.map((ev, index) => (
                                    <motion.div
                                        key={ev.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <ModernEvidenciaItem
                                            evidencia={{ ...ev, data: data?.evidencias?.[ev.id] }}
                                            pasoKey={key}
                                            onUpdateEvidencia={onUpdateEvidencia}
                                            clienteId={clienteId}
                                            isPermanentlyLocked={isPermanentlyLocked}
                                            esHito={esHito}
                                            isReadOnly={isReadOnly}
                                        />
                                    </motion.div>
                                ))}
                            </div>

                            {/* Sección de confirmación */}
                            {puedeCompletarse && !isReadOnly && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="pt-4 border-t border-gray-200 dark:border-gray-600"
                                >
                                    <div className="flex items-center justify-end gap-3">
                                        <motion.button
                                            onClick={handleCancelarCambios}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 border border-gray-300 dark:border-gray-500 transition-all"
                                        >
                                            <X size={16} /> Cancelar
                                        </motion.button>

                                        <motion.input
                                            type="date"
                                            value={fechaCompletado}
                                            onChange={handleFechaChange}
                                            min={paso.minDate}
                                            max={paso.maxDate}
                                            whileFocus={{ scale: 1.02 }}
                                            className={`
                                                px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-800 transition-all
                                                ${fechaErrorLocal || error
                                                    ? 'border-red-500 focus:ring-red-500'
                                                    : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                                                }
                                            `}
                                        />

                                        <motion.button
                                            onClick={handleConfirmar}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="flex items-center gap-2 px-4 py-2 bg-green-500 dark:bg-green-600 text-white font-semibold rounded-lg hover:bg-green-600 dark:hover:bg-green-500 transition-all"
                                        >
                                            <CheckCircle size={16} /> Marcar como Completado
                                        </motion.button>
                                    </div>

                                    <AnimatePresence>
                                        {fechaErrorLocal && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="mt-3 text-right"
                                            >
                                                <div className="inline-flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                                                    <AlertCircle size={16} className="text-red-500" />
                                                    <p className="text-red-600 dark:text-red-400 text-sm font-semibold">
                                                        {fechaErrorLocal}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            )}
                        </motion.div>
                    )
                )}
            </AnimatePresence>

            {/* Error global */}
            <AnimatePresence>
                {error && !fechaErrorLocal && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mx-6 mb-4"
                    >
                        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                            <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                            <p className="text-red-600 dark:text-red-400 text-sm font-semibold">{error}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Historial de actividad */}
            {can('clientes', 'verHistorialProceso') && actividad.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mx-6 mb-6 pt-4 border-t border-gray-200 dark:border-gray-600"
                >
                    <motion.button
                        onClick={() => setHistorialVisible(!historialVisible)}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="w-full flex justify-between items-center p-3 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-600/50 rounded-lg transition-all"
                    >
                        <span className="flex items-center gap-2">
                            <History size={16} />
                            Historial de Actividad ({actividad.length})
                        </span>
                        <motion.div
                            animate={{ rotate: historialVisible ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ChevronDown size={20} />
                        </motion.div>
                    </motion.button>

                    <AnimatePresence>
                        {historialVisible && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                            >
                                <div className="mt-3 pl-2 space-y-3">
                                    {actividad.map((item, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="flex gap-3 p-3 bg-gray-100 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-600"
                                        >
                                            <div className="flex items-center justify-center w-6 h-6 bg-blue-500 dark:bg-blue-600 text-white text-xs font-bold rounded-full flex-shrink-0">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-800 dark:text-gray-300 font-medium mb-1">
                                                    {item.mensaje}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {formatDisplayDate(normalizeDate(item.fecha)) || 'Fecha inválida'} por{' '}
                                                    <strong className="text-gray-600 dark:text-gray-300">
                                                        {item.userName}
                                                    </strong>
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}
        </motion.div>
    );
};

export default PasoProcesoCardModerno;