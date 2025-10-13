// src/pages/clientes/components/PasoProcesoCard.jsx
// 🎨 DISEÑO MODERNO COMPLETAMENTE REDISEÑADO

import React, { useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    CheckCircle, Lock, FileText, Calendar, AlertCircle, RotateCcw, Eye,
    Trash2, Replace, X, Pencil, Info, ChevronDown, History, Wallet,
    Upload, Clock, CheckCheck, Circle, Sparkles, TrendingUp
} from 'lucide-react';
import FileUpload from '../../../components/FileUpload';
import { useModernToast } from '../../../hooks/useModernToast';
import { getTodayString, formatDisplayDate, parseDateAsUTC, normalizeDate, formatCurrency } from '../../../utils/textFormatters';
import { uploadFile } from "../../../services/fileService";
import { usePermissions } from '../../../hooks/auth/usePermissions';

// ═══════════════════════════════════════════════════════════════
// 📄 COMPONENTE: EvidenciaItem (Rediseñado con glassmorphism)
// ═══════════════════════════════════════════════════════════════
const EvidenciaItem = ({ evidencia, pasoKey, onUpdateEvidencia, clienteId, isPermanentlyLocked, esHito, isReadOnly }) => {
    const evidenciaData = evidencia.data || {};
    const fileInputRef = useRef(null);
    const toast = useModernToast();
    const [isUploading, setIsUploading] = useState(false);

    const generateUniqueFilePath = (fileName) => {
        const timestamp = Date.now();
        return `documentos_proceso/${clienteId}/${evidencia.id}-${timestamp}-${fileName}`;
    };

    const handleUploadSuccess = (url) => {
        onUpdateEvidencia(pasoKey, evidencia.id, url);
    };

    const handleRemove = () => {
        if (esHito && isPermanentlyLocked) {
            toast.error(
                "Las evidencias de un hito cerrado permanentemente no se pueden eliminar.",
                { icon: '🔒' }
            );
            return;
        }
        onUpdateEvidencia(pasoKey, evidencia.id, null);
    };

    const handleFileChangeForReplace = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsUploading(true); // 🔒 Bloquear botones y mostrar overlay

        try {
            const filePath = generateUniqueFilePath(file.name);
            const downloadURL = await uploadFile(file, filePath);
            onUpdateEvidencia(pasoKey, evidencia.id, downloadURL);

            // Solo mostrar toast de éxito
            toast.success('¡Archivo reemplazado con éxito!', {
                icon: '✅',
                description: 'La evidencia se actualizó correctamente'
            });
        } catch (error) {
            // Solo mostrar toast de error
            toast.error("Error al reemplazar el archivo.", {
                icon: '❌',
                description: 'Por favor, intenta nuevamente'
            });
            console.error("Error en handleFileChangeForReplace:", error);
        } finally {
            setIsUploading(false); // 🔓 Desbloquear botones y ocultar overlay
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    return (
        <div className="group relative">
            {/* Overlay de carga con glassmorphism */}
            {isUploading && (
                <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl z-10 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3 p-4">
                        <div className="relative">
                            {/* Spinner con gradiente */}
                            <div className="w-12 h-12 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Upload className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-pulse" />
                            </div>
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-bold text-blue-700 dark:text-blue-300">
                                Subiendo archivo...
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                Por favor espera
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className={`flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 ${evidenciaData.url
                    ? 'bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200 dark:border-emerald-700/50 hover:shadow-lg hover:shadow-emerald-100 dark:hover:shadow-emerald-900/20'
                    : 'bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md'
                }`}>
                {/* Lado izquierdo - Label con icono */}
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl transition-all ${evidenciaData.url
                            ? 'bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/40'
                            : 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600'
                        }`}>
                        {evidenciaData.url ? (
                            <CheckCheck size={20} className="text-white" />
                        ) : (
                            <FileText size={20} className="text-gray-400 dark:text-gray-500" />
                        )}
                    </div>
                    <div>
                        <span className={`text-sm font-semibold ${evidenciaData.url
                                ? 'text-gray-800 dark:text-gray-100'
                                : 'text-gray-600 dark:text-gray-400'
                            }`}>
                            {evidencia.label}
                        </span>
                        {evidenciaData.url && evidenciaData.fechaSubida && (
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5 font-medium">
                                <Clock size={12} />
                                Subido el {formatDisplayDate(evidenciaData.fechaSubida)}
                            </p>
                        )}
                    </div>
                </div>

                {/* Lado derecho - Acciones */}
                <div className="flex items-center gap-2">
                    {evidenciaData.url ? (
                        <>
                            {/* Botón Ver */}
                            <a
                                href={evidenciaData.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg transition-all shadow-md ${isUploading
                                        ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed pointer-events-none'
                                        : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 hover:shadow-lg transform hover:scale-105'
                                    }`}
                                onClick={(e) => isUploading && e.preventDefault()}
                            >
                                <Eye size={14} /> Ver
                            </a>

                            {!isPermanentlyLocked && !isReadOnly && (
                                <>
                                    {/* Botón Reemplazar */}
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploading}
                                        className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg transition-all shadow-md ${isUploading
                                                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 dark:from-amber-600 dark:to-orange-600 dark:hover:from-amber-700 dark:hover:to-orange-700 hover:shadow-lg transform hover:scale-105'
                                            }`}
                                    >
                                        <Replace size={14} /> Cambiar
                                    </button>

                                    {/* Botón Eliminar */}
                                    <button
                                        onClick={handleRemove}
                                        disabled={isUploading || (esHito && isPermanentlyLocked)}
                                        className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg transition-all shadow-md ${isUploading || (esHito && isPermanentlyLocked)
                                                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600 dark:from-red-600 dark:to-rose-600 dark:hover:from-red-700 dark:hover:to-rose-700 hover:shadow-lg transform hover:scale-105'
                                            }`}
                                        data-tooltip-id="app-tooltip"
                                        data-tooltip-content={
                                            isUploading
                                                ? "Espera a que termine la subida"
                                                : esHito && isPermanentlyLocked
                                                    ? "No se puede eliminar la evidencia de un hito cerrado."
                                                    : "Eliminar evidencia"
                                        }
                                    >
                                        <Trash2 size={14} /> Eliminar
                                    </button>

                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChangeForReplace}
                                        className="hidden"
                                        accept=".pdf,.png,.jpg,.jpeg"
                                        disabled={isUploading}
                                    />
                                </>
                            )}
                        </>
                    ) : (
                        <FileUpload
                            label={<span className="flex items-center gap-1.5 font-bold"><Upload size={14} /> Subir Archivo</span>}
                            filePath={generateUniqueFilePath}
                            onUploadSuccess={handleUploadSuccess}
                            isCompact={false}
                            disabled={isReadOnly}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════
// 🔔 COMPONENTE: Avisos (Rediseñados)
// ═══════════════════════════════════════════════════════════════
const AvisoPasoAutomatico = ({ clienteId }) => (
    <div className="mt-5">
        <div className="relative p-4 bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50 dark:from-blue-900/30 dark:via-cyan-900/20 dark:to-blue-900/30 border border-blue-200 dark:border-blue-700/50 rounded-2xl shadow-lg shadow-blue-100 dark:shadow-blue-900/20">
            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-blue-400 to-cyan-500 rounded-l-2xl"></div>
            <div className="pl-4 flex items-start gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-800/50 rounded-xl">
                    <Sparkles size={20} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                    <h4 className="font-bold text-blue-900 dark:text-blue-100 text-sm mb-1">✨ Paso Automático</h4>
                    <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                        Este paso se completará automáticamente cuando registres el abono o desembolso desde el{' '}
                        <Link to={`/abonos/gestionar/${clienteId}`} className="font-bold underline hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                            Módulo de Abonos
                        </Link>.
                    </p>
                </div>
            </div>
        </div>
    </div>
);

const AvisoSaldoPendiente = ({ clienteId, saldoPendiente }) => (
    <div className="mt-5">
        <div className="relative p-4 bg-gradient-to-br from-orange-50 via-amber-50 to-orange-50 dark:from-orange-900/30 dark:via-amber-900/20 dark:to-orange-900/30 border border-orange-200 dark:border-orange-700/50 rounded-2xl shadow-lg shadow-orange-100 dark:shadow-orange-900/20">
            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-orange-400 to-amber-500 rounded-l-2xl"></div>
            <div className="pl-4 flex items-start gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-800/50 rounded-xl">
                    <Wallet size={20} className="text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1">
                    <h4 className="font-bold text-orange-900 dark:text-orange-100 text-sm mb-1">⚠️ Acción Requerida</h4>
                    <p className="text-xs text-orange-700 dark:text-orange-300 leading-relaxed mb-2">
                        Este paso se habilitará automáticamente una vez que el cliente esté a paz y salvo.
                    </p>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-orange-200 dark:border-orange-800">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Saldo pendiente:</span>
                        <strong className="text-sm font-bold text-red-600 dark:text-red-400">{formatCurrency(saldoPendiente)}</strong>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// ═══════════════════════════════════════════════════════════════
// 🎯 FUNCIÓN HELPER: Generar Tooltip Inteligente
// ═══════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════
// 🎴 COMPONENTE PRINCIPAL: PasoProcesoCard (Completamente Rediseñado)
// ═══════════════════════════════════════════════════════════════
const PasoProcesoCard = ({ paso, onUpdateEvidencia, onCompletarPaso, onIniciarReapertura, onDescartarCambios, onIniciarEdicionFecha, clienteId, isReadOnly }) => {
    const { key, label, data, isLocked, puedeCompletarse, evidenciasRequeridas, error, esSiguientePaso, isPermanentlyLocked, hayPasoEnReapertura, esHito, esAutomatico, facturaBloqueadaPorSaldo, saldoPendiente } = paso;
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
    const progreso = totalEvidencias > 0 ? (evidenciasSubidas / totalEvidencias) * 100 : 0;

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

    // Clases dinámicas para el card
    const getCardClasses = () => {
        if (error || fechaErrorLocal) {
            return 'relative overflow-hidden bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-2 border-red-300 dark:border-red-700 shadow-xl shadow-red-100 dark:shadow-red-900/20';
        }
        if (data?.completado) {
            return 'relative overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-900/20 dark:via-teal-900/10 dark:to-cyan-900/20 border-2 border-emerald-300 dark:border-emerald-700/50 shadow-xl shadow-emerald-100 dark:shadow-emerald-900/20';
        }
        if (isLocked && !facturaBloqueadaPorSaldo) {
            return 'relative overflow-hidden bg-gray-50/50 dark:bg-gray-800/30 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 opacity-60';
        }
        if (esSiguientePaso) {
            return 'relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 dark:from-blue-900/30 dark:via-indigo-900/20 dark:to-violet-900/30 border-2 border-blue-400 dark:border-blue-500 shadow-2xl shadow-blue-200 dark:shadow-blue-900/30 ring-4 ring-blue-100 dark:ring-blue-900/20';
        }
        return 'relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 shadow-lg hover:shadow-xl transition-all duration-300';
    };

    return (
        <div className={`${getCardClasses()} rounded-2xl p-6 transition-all duration-300 group`}>
            {/* Barra de acento superior (solo para paso siguiente) */}
            {esSiguientePaso && !data?.completado && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-violet-500 animate-pulse"></div>
            )}

            {/* Header del Paso */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                    {/* Indicador de Estado (Icono/Número) */}
                    <div className="relative">
                        {data?.completado ? (
                            <div className="relative">
                                <div className="absolute inset-0 bg-emerald-400 rounded-full blur-md opacity-50"></div>
                                <div className="relative p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full shadow-lg">
                                    <CheckCircle size={28} className="text-white" />
                                </div>
                            </div>
                        ) : (isLocked || facturaBloqueadaPorSaldo) ? (
                            <div className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full shadow-md">
                                <Lock size={28} className="text-gray-400 dark:text-gray-500" />
                            </div>
                        ) : (
                            <div className="relative">
                                {esSiguientePaso && (
                                    <div className="absolute inset-0 bg-blue-400 rounded-full blur-md opacity-50 animate-pulse"></div>
                                )}
                                <div className={`relative w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg ${esSiguientePaso
                                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white ring-4 ring-blue-200 dark:ring-blue-800 animate-pulse'
                                        : 'bg-gradient-to-br from-blue-400 to-blue-600 text-white'
                                    }`}>
                                    {paso.stepNumber}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Título del Paso */}
                    <div>
                        <h3 className={`font-bold text-xl mb-1 ${data?.completado
                                ? 'text-gray-500 dark:text-gray-400 line-through'
                                : esSiguientePaso
                                    ? 'text-blue-900 dark:text-blue-100'
                                    : 'text-gray-800 dark:text-gray-100'
                            }`}>
                            {label}
                        </h3>
                        {esSiguientePaso && !data?.completado && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full shadow-lg">
                                <TrendingUp size={12} />
                                Siguiente Paso
                            </span>
                        )}
                    </div>
                </div>

                {/* Información de Completado y Acciones */}
                {data?.completado && (
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-xl border border-emerald-200 dark:border-emerald-700">
                            <Calendar size={18} className="text-emerald-600 dark:text-emerald-400" />
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                {formatDisplayDate(normalizeDate(data.fecha))}
                            </span>
                            {tooltipContent && (
                                <div data-tooltip-id="app-tooltip" data-tooltip-content={tooltipContent}>
                                    <Info size={16} className="text-blue-500 dark:text-blue-400 cursor-help" />
                                </div>
                            )}
                        </div>

                        {/* Badges y Botones de Acción */}
                        {isPermanentlyLocked ? (
                            <span className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-xl shadow-md">
                                <Lock size={14} /> Cerrado Permanentemente
                            </span>
                        ) : (
                            <div className="flex items-center gap-2">
                                {!isReadOnly && can('clientes', 'editarFechaProceso') && (
                                    <button
                                        onClick={() => onIniciarEdicionFecha(key)}
                                        disabled={hayPasoEnReapertura}
                                        className="p-2.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl transition-all disabled:text-gray-300 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                                        data-tooltip-id="app-tooltip"
                                        data-tooltip-content="Editar fecha y motivo"
                                    >
                                        <Pencil size={18} />
                                    </button>
                                )}

                                {!isReadOnly && can('clientes', 'reabrirProceso') && (
                                    <button
                                        onClick={() => onIniciarReapertura(key)}
                                        disabled={isLocked || hayPasoEnReapertura}
                                        className="p-2.5 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-xl transition-all disabled:text-gray-300 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                                        data-tooltip-id="app-tooltip"
                                        data-tooltip-content="Reabrir este paso"
                                    >
                                        <RotateCcw size={18} />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Contenido del Paso */}
            {facturaBloqueadaPorSaldo ? (
                <AvisoSaldoPendiente clienteId={clienteId} saldoPendiente={saldoPendiente} />
            ) : PASOS_AUTOMATICOS.includes(key) && !data?.completado && !isLocked ? (
                <AvisoPasoAutomatico clienteId={clienteId} />
            ) : (
                !data?.completado && !isLocked && !facturaBloqueadaPorSaldo && !esAutomatico && !isReadOnly && (
                    <div className="space-y-4">
                        {/* Progreso de Evidencias */}
                        <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                    📎 Evidencias Requeridas
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${evidenciasSubidas === totalEvidencias
                                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                                            : 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg'
                                        }`}>
                                        {evidenciasSubidas} de {totalEvidencias}
                                    </span>
                                </div>
                            </div>
                            {/* Barra de Progreso */}
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${progreso === 100
                                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                                            : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                                        }`}
                                    style={{ width: `${progreso}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Lista de Evidencias */}
                        <div className="space-y-3">
                            {evidenciasRequeridas.map(ev => (
                                <EvidenciaItem
                                    key={ev.id}
                                    evidencia={{ ...ev, data: data?.evidencias?.[ev.id] }}
                                    pasoKey={key}
                                    onUpdateEvidencia={onUpdateEvidencia}
                                    clienteId={clienteId}
                                    isPermanentlyLocked={isPermanentlyLocked}
                                    esHito={esHito}
                                    isReadOnly={isReadOnly}
                                />
                            ))}
                        </div>

                        {/* Botones de Acción para Completar */}
                        {puedeCompletarse && !isReadOnly && (
                            <div className="pt-4 border-t-2 border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-end gap-3">
                                    <button
                                        onClick={handleCancelarCambios}
                                        className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold px-5 py-2.5 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                                    >
                                        <X size={18} /> Cancelar
                                    </button>

                                    <input
                                        type="date"
                                        value={fechaCompletado}
                                        onChange={handleFechaChange}
                                        min={paso.minDate}
                                        max={paso.maxDate}
                                        className={`text-sm font-semibold border-2 px-4 py-2.5 rounded-xl dark:bg-gray-700 dark:text-gray-200 transition-all shadow-md ${fechaErrorLocal || error
                                                ? 'border-red-500 dark:border-red-500'
                                                : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-500'
                                            }`}
                                    />

                                    <button
                                        onClick={handleConfirmar}
                                        className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold px-6 py-2.5 rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                                    >
                                        <CheckCircle size={18} /> Marcar como Completado
                                    </button>
                                </div>

                                {fechaErrorLocal && (
                                    <div className="mt-3 text-right">
                                        <p className="inline-flex items-center gap-2 text-red-600 dark:text-red-400 text-sm font-bold bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg">
                                            <AlertCircle size={16} />
                                            {fechaErrorLocal}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )
            )}

            {/* Error Global */}
            {error && !fechaErrorLocal && (
                <div className="mt-3 flex items-center gap-2 text-red-600 dark:text-red-400 text-sm font-bold bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-xl">
                    <AlertCircle size={18} />
                    <p>{error}</p>
                </div>
            )}

            {/* Historial de Actividad */}
            {can('clientes', 'verHistorialProceso') && actividad.length > 0 && (
                <div className="mt-6 pt-6 border-t-2 border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setHistorialVisible(!historialVisible)}
                        className="w-full flex justify-between items-center text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                        <span className="flex items-center gap-2">
                            <History size={18} />
                            Historial de Actividad
                            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full text-xs font-bold">
                                {actividad.length}
                            </span>
                        </span>
                        <ChevronDown size={22} className={`transition-transform duration-300 ${historialVisible ? 'rotate-180' : ''}`} />
                    </button>

                    {historialVisible && (
                        <div className="mt-4 space-y-3 animate-fade-in">
                            {actividad.map((item, index) => (
                                <div key={index} className="flex gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <span className="flex items-center justify-center w-6 h-6 font-bold text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 rounded-full flex-shrink-0">
                                        {index + 1}
                                    </span>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-800 dark:text-gray-200 font-medium mb-1">{item.mensaje}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            📅 {formatDisplayDate(normalizeDate(item.fecha)) || 'Fecha inválida'}
                                            {' • '}
                                            👤 <strong className="text-gray-700 dark:text-gray-300">{item.userName}</strong>
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PasoProcesoCard;
