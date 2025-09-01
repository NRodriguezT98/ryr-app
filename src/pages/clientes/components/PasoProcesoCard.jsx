// src/pages/clientes/components/PasoProcesoCard.jsx

import React, { useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Lock, FileText, Calendar, AlertCircle, RotateCcw, Eye, Trash2, Replace, X, Pencil, Info, ChevronDown, History } from 'lucide-react';
import FileUpload from '../../../components/FileUpload';
import toast from 'react-hot-toast';
import { getTodayString, formatDisplayDate, parseDateAsUTC, normalizeDate } from '../../../utils/textFormatters';
import { uploadFile } from '../../../utils/storage';
import { usePermissions } from '../../../hooks/auth/usePermissions';

const EvidenciaItem = ({ evidencia, pasoKey, onUpdateEvidencia, clienteId, isPermanentlyLocked, esHito, isReadOnly }) => {
    const evidenciaData = evidencia.data || {};
    const fileInputRef = useRef(null);

    const handleUploadSuccess = (url) => {
        onUpdateEvidencia(pasoKey, evidencia.id, url);
    };

    const handleRemove = () => {
        if (esHito && isPermanentlyLocked) {
            toast.error("Las evidencias de un hito cerrado permanentemente no se pueden eliminar.");
            return;
        }
        onUpdateEvidencia(pasoKey, evidencia.id, null);
    };

    const handleFileChangeForReplace = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        toast.loading('Reemplazando archivo...');
        try {
            const downloadURL = await uploadFile(file, `documentos_proceso/${clienteId}/${pasoKey}-${evidencia.id}-${file.name}`);
            onUpdateEvidencia(pasoKey, evidencia.id, downloadURL);
            toast.dismiss();
            toast.success('¡Archivo reemplazado con éxito!');
        } catch (error) {
            toast.dismiss();
            toast.error("Error al reemplazar el archivo.");
            console.error("Error en handleFileChangeForReplace:", error);
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    return (
        <div className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700/50 rounded-md">
            <div className="flex items-center gap-2">
                <FileText size={16} className={evidenciaData.url ? "text-green-600 dark:text-green-400" : "text-gray-400"} />
                <span className="text-sm text-gray-700 dark:text-gray-300">{evidencia.label}</span>
            </div>
            <div>
                {evidenciaData.url ? (
                    <div className="flex items-center gap-3">
                        <a href={evidenciaData.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-semibold flex items-center gap-1"><Eye size={14} /> Ver</a>
                        {!isPermanentlyLocked && !isReadOnly && (
                            <>
                                <button onClick={() => fileInputRef.current?.click()} className="text-yellow-600 dark:text-yellow-400 hover:underline text-sm font-semibold flex items-center gap-1"><Replace size={14} /> Reemplazar</button>
                                <div
                                    data-tooltip-id="app-tooltip"
                                    data-tooltip-content={esHito && isPermanentlyLocked ? "No se puede eliminar la evidencia de un hito cerrado." : "Eliminar evidencia"}
                                >
                                    <button
                                        onClick={handleRemove}
                                        className="text-red-500 hover:underline text-sm font-semibold flex items-center gap-1 disabled:text-gray-400 disabled:cursor-not-allowed"
                                        disabled={esHito && isPermanentlyLocked}
                                    >
                                        <Trash2 size={14} /> Eliminar
                                    </button>
                                </div>
                                <input type="file" ref={fileInputRef} onChange={handleFileChangeForReplace} className="hidden" accept=".pdf,.png,.jpg,.jpeg" />
                            </>
                        )}
                    </div>
                ) : (
                    <FileUpload
                        label="Subir"
                        filePath={(fileName) => `documentos_proceso/${clienteId}/${pasoKey}-${evidencia.id}-${fileName}`}
                        onUploadSuccess={handleUploadSuccess}
                        isCompact={true}
                        disabled={isReadOnly}
                    />
                )}
            </div>
        </div>
    );
};


const generarTooltipInteligente = (data, formatDisplayDate) => {
    if (!data || !data.actividad || data.actividad.length === 0) {
        return ''; // No hay actividad, no hay tooltip.
    }

    // Obtenemos la información de la última acción registrada en el historial
    const ultimaActividad = data.actividad[data.actividad.length - 1];
    const autor = ultimaActividad.userName || 'Usuario Desconocido';

    // Escenario 1: El paso fue reabierto y esa fue la última gran modificación.
    if (data.motivoReapertura && data.motivoUltimoCambio === 'Paso reabierto') {
        const fechaModificacion = formatDisplayDate(normalizeDate(data.fechaUltimaModificacion)) || 'N/A';
        return `Reabierto por ${autor} el ${fechaModificacion}. Motivo: "${data.motivoReapertura}"`;
    }

    // Escenario 2: Se editó la fecha de un paso ya completado.
    if (data.motivoUltimoCambio && data.motivoUltimoCambio !== 'Paso reabierto') {
        const fechaModificacion = formatDisplayDate(normalizeDate(data.fechaUltimaModificacion)) || 'N/A';
        return `Fecha actualizada por ${autor} el ${fechaModificacion}. Motivo: "${data.motivoUltimoCambio}"`;
    }

    // Escenario 3: El paso fue completado (primera vez o re-completado) y no hay otro cambio posterior.
    if (data.completado && data.fecha) {
        // La fecha que el usuario seleccionó en el calendario para el paso.
        const fechaCompletado = formatDisplayDate(normalizeDate(data.fecha)) || 'N/A';

        // La fecha en que el usuario REALIZÓ la acción (el "hoy"). La tomamos del último registro del historial.
        const fechaDeLaAccion = formatDisplayDate(normalizeDate(ultimaActividad.fecha)) || 'N/A';

        // Construimos el mensaje con el formato exacto que deseas.
        return `El día ${fechaDeLaAccion}, ${autor} marcó como completado este paso con fecha de ${fechaCompletado}.`;
    }
    return ''; // Fallback por si no coincide ningún escenario.
};

const PasoProcesoCard = ({ paso, onUpdateEvidencia, onCompletarPaso, onIniciarReapertura, onDescartarCambios, onIniciarEdicionFecha, clienteId, isReadOnly }) => {
    const { key, label, data, isLocked, puedeCompletarse, evidenciasRequeridas, error, esSiguientePaso, isPermanentlyLocked, hayPasoEnReapertura, esHito, esAutomatico, facturaBloqueadaPorSaldo } = paso;
    const [fechaCompletado, setFechaCompletado] = useState(data?.fecha || getTodayString());
    const [fechaErrorLocal, setFechaErrorLocal] = useState(null);
    const [historialVisible, setHistorialVisible] = useState(false); // Estado para el historial
    const actividad = paso.data?.actividad || [];
    const { can } = usePermissions();

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

        // Validamos solo si el campo de fecha tiene un valor
        if (nuevaFecha) {
            const fechaSeleccionada = parseDateAsUTC(nuevaFecha);
            const fechaMinima = parseDateAsUTC(paso.minDate);
            const fechaMaxima = parseDateAsUTC(paso.maxDate);

            if (fechaSeleccionada < fechaMinima || fechaSeleccionada > fechaMaxima) {
                // 1. Si la fecha es inválida, establecemos el mensaje de error local.
                setFechaErrorLocal(`La fecha debe estar entre ${formatDisplayDate(paso.minDate)} y ${formatDisplayDate(paso.maxDate)}.`);
                // 2. IMPORTANTE: Detenemos la ejecución para no actualizar el estado con la fecha inválida.
                return;
            }
        }

        // 3. Si la fecha es válida (o el campo está vacío), nos aseguramos de limpiar cualquier error previo.
        setFechaErrorLocal(null);
        // 4. Y actualizamos el estado de la fecha.
        setFechaCompletado(nuevaFecha);
    };

    const handleCancelarCambios = () => {
        // Primero, limpiamos el error local para quitar el estilo rojo.
        setFechaErrorLocal(null);
        // Luego, llamamos a la función del hook para revertir los datos.
        onDescartarCambios(key);
    };

    const tooltipContent = generarTooltipInteligente(paso.data, formatDisplayDate);

    const cardClasses = `relative p-5 rounded-xl border-2 transition-all ${error || fechaErrorLocal ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
        data?.completado ? 'border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-800' :
            (isLocked && !facturaBloqueadaPorSaldo) ? 'border-gray-200 bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700 opacity-60' :
                esSiguientePaso ? 'border-blue-500 bg-white dark:bg-gray-700 shadow-lg dark:border-blue-500' : 'border-blue-200 bg-white dark:bg-gray-700 dark:border-gray-600'
        }`;

    return (
        <div className={cardClasses}>
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    {data?.completado ? <CheckCircle size={24} className="text-green-500 flex-shrink-0" /> : (isLocked || facturaBloqueadaPorSaldo) ? <Lock size={24} className="text-gray-400 flex-shrink-0" /> : <div className={`w-6 h-6 rounded-full text-white flex items-center justify-center font-bold text-sm flex-shrink-0 ${esSiguientePaso ? 'bg-blue-600 animate-pulse' : 'bg-blue-500'}`}>{paso.stepNumber}</div>}
                    <h3 className={`font-bold text-lg ${data?.completado ? 'text-gray-500 dark:text-gray-400 line-through' : 'text-gray-800 dark:text-gray-100'}`}>{label}</h3>
                </div>
                {data?.completado && (
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-gray-500 dark:text-gray-400" />
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{formatDisplayDate(normalizeDate(data.fecha))}</p>
                            {tooltipContent && (
                                <div data-tooltip-id="app-tooltip" data-tooltip-content={tooltipContent}>
                                    <Info size={16} className="text-blue-500 dark:text-blue-400 cursor-help" />
                                </div>
                            )}
                        </div>
                        {isPermanentlyLocked ? (
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                                <Lock size={12} /> Cerrado
                            </span>
                        ) : (
                            // La parte 'else' del ternario ahora contiene las comprobaciones de permisos
                            <>
                                {/* Botón para Editar Fecha */}
                                {!isReadOnly && can('clientes', 'editarFechaProceso') && (
                                    <button
                                        onClick={() => onIniciarEdicionFecha(key)}
                                        disabled={hayPasoEnReapertura}
                                        className="p-1 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-full disabled:text-gray-300 disabled:cursor-not-allowed"
                                        data-tooltip-id="app-tooltip"
                                        data-tooltip-content="Editar fecha y motivo"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                )}

                                {/* Botón para Reabrir Paso */}
                                {!isReadOnly && can('clientes', 'reabrirProceso') && (
                                    <button
                                        onClick={() => onIniciarReapertura(key)}
                                        disabled={isLocked || hayPasoEnReapertura}
                                        className="p-1 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-full disabled:text-gray-300 disabled:cursor-not-allowed"
                                        data-tooltip-id="app-tooltip"
                                        data-tooltip-content="Reabrir este paso"
                                    >
                                        <RotateCcw size={16} />
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>

            {!data?.completado && !isLocked && !facturaBloqueadaPorSaldo && !esAutomatico && !isReadOnly && (
                <div className="mt-4 pl-9 space-y-3">
                    <div className="flex justify-between items-center"><p className="text-sm font-semibold text-gray-600 dark:text-gray-300">Evidencias Requeridas:</p><span className={`text-xs font-bold px-2 py-1 rounded-full ${evidenciasSubidas === totalEvidencias ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300' : 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300'}`}>{`${evidenciasSubidas} de ${totalEvidencias} subidas`}</span></div>
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
                    {puedeCompletarse && !isReadOnly && (
                        <div className="pt-3 border-t dark:border-gray-600">
                            <div className="flex items-center justify-end gap-3">
                                <button onClick={handleCancelarCambios} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 flex items-center gap-2">
                                    <X size={16} /> Cancelar
                                </button>
                                <input type="date" value={fechaCompletado} onChange={handleFechaChange} min={paso.minDate} max={paso.maxDate} className={`text-sm border p-1.5 rounded-md dark:bg-gray-700 ${fechaErrorLocal || error ? 'border-red-500' : 'dark:border-gray-600'}`} />
                                <button onClick={handleConfirmar} className="bg-green-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-700">Marcar como Completado</button>
                            </div>
                            {fechaErrorLocal && (
                                <div className="mt-2 text-right">
                                    <p className="inline-flex items-center gap-2 text-red-600 dark:text-red-400 text-sm font-semibold">
                                        <AlertCircle size={16} />
                                        {fechaErrorLocal}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {error && !fechaErrorLocal && <div className="mt-2 pl-9 flex items-center gap-2 text-red-600 dark:text-red-400 text-sm font-semibold"><AlertCircle size={14} /><p>{error}</p></div>}

            {/* Nueva sección para el historial de actividad */}
            {can('clientes', 'verHistorialProceso') && actividad.length > 0 && (
                <div className="mt-4 pt-4 border-t dark:border-gray-600">
                    <button
                        onClick={() => setHistorialVisible(!historialVisible)}
                        className="w-full flex justify-between items-center text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    >
                        <span className="flex items-center gap-2">
                            <History size={16} />
                            Historial de Actividad ({actividad.length})
                        </span>
                        <ChevronDown size={20} className={`transition-transform ${historialVisible ? 'rotate-180' : ''}`} />
                    </button>
                    {historialVisible && (
                        <div className="mt-3 pl-2 space-y-3 animate-fade-in">
                            {/* 👇 Mapeamos en orden cronológico y añadimos numeración */}
                            {actividad.map((item, index) => (
                                <div key={index} className="text-xs flex gap-2">
                                    <span className="font-bold text-gray-500">{index + 1}.</span>
                                    <div>
                                        <p className="text-gray-800 dark:text-gray-300">{item.mensaje}</p>
                                        <p className="text-gray-500 dark:text-gray-400">
                                            Esta acción se realizó el día {formatDisplayDate(normalizeDate(item.fecha)) || 'Fecha inválida'}
                                            {' por el usuario: '}
                                            <strong className="text-gray-600 dark:text-gray-300">{item.userName}</strong>
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