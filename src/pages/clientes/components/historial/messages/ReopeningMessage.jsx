/**
 * Componente para mostrar mensajes de reapertura de paso
 */

import { Icons } from '../HistorialIcons';

export const ReopeningMessage = ({
    pasoNombre,
    numeroPaso,
    totalPasos,
    motivoReapertura,
    estadoAnterior,
    estadoFinal,
    cambioFecha,
    evidenciasReemplazadas,
    getEvidenciaUrl
}) => {
    return (
        <div className="space-y-4">
            {/* Header con iconos y badges inline */}
            <div className="flex items-start gap-2">
                <Icons.RotateCcw className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            Paso "{pasoNombre}"
                        </span>
                        <Icons.RotateCcw className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300">
                            reabierto
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">y</span>
                        <Icons.CheckCircle className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
                            completado
                        </span>
                        {numeroPaso && totalPasos && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                                Paso {numeroPaso}/{totalPasos}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Motivo de reapertura */}
            {motivoReapertura && (
                <div className="pl-8">
                    <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                        <p className="text-sm text-orange-900 dark:text-orange-200">
                            <span className="font-semibold">Motivo de reapertura:</span> {motivoReapertura}
                        </p>
                    </div>
                </div>
            )}

            {/* Cambios realizados */}
            {(cambioFecha || evidenciasReemplazadas.length > 0) && (
                <div className="pl-8 space-y-3">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <Icons.Edit3 className="w-4 h-4" />
                        Cambios realizados:
                    </p>

                    <div className="space-y-2">
                        {/* Cambio de fecha */}
                        {cambioFecha && estadoAnterior.fecha && estadoFinal.fecha && (
                            <div className="flex items-start gap-2 text-sm bg-blue-50 dark:bg-blue-900/20 p-2.5 rounded-lg border border-blue-200 dark:border-blue-800">
                                <Icons.Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="font-medium text-blue-900 dark:text-blue-200">Fecha modificada</p>
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className="text-blue-700 dark:text-blue-300 line-through">{estadoAnterior.fecha}</span>
                                        <span className="text-blue-500 dark:text-blue-400">→</span>
                                        <span className="text-blue-900 dark:text-blue-100 font-semibold">{estadoFinal.fecha}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Evidencias reemplazadas */}
                        {evidenciasReemplazadas.length > 0 && (
                            <div className="bg-amber-50 dark:bg-amber-900/20 p-2.5 rounded-lg border border-amber-200 dark:border-amber-800">
                                <div className="flex items-start gap-2 text-sm mb-2">
                                    <Icons.FolderOpen className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                                    <p className="font-medium text-amber-900 dark:text-amber-200">
                                        {evidenciasReemplazadas.length === 1 ? 'Evidencia reemplazada' : `${evidenciasReemplazadas.length} evidencias reemplazadas`}
                                    </p>
                                </div>
                                <ul className="space-y-2 pl-6">
                                    {evidenciasReemplazadas.map((ev, idx) => {
                                        console.log(`🔍 [ReopeningMessage] Evidencia ${idx}:`, ev);
                                        console.log(`  - antesUrl: ${ev.antesUrl}`);
                                        console.log(`  - despuesUrl: ${ev.despuesUrl}`);

                                        if (ev.antes && ev.despues) {
                                            // ✅ Usar URLs directamente desde el objeto
                                            const urlAntes = ev.antesUrl || getEvidenciaUrl(ev.antes);
                                            const urlDespues = ev.despuesUrl || getEvidenciaUrl(ev.despues);

                                            console.log(`  - urlAntes FINAL: ${urlAntes}`);
                                            console.log(`  - urlDespues FINAL: ${urlDespues}`);
                                            console.log(`  - SON IGUALES: ${urlAntes === urlDespues}`);

                                            return (
                                                <li key={idx} className="text-xs">
                                                    <div className="space-y-1">
                                                        {/* Evidencia anterior (tachada) */}
                                                        <div className="flex items-start gap-1.5">
                                                            <span className="text-red-500 dark:text-red-400 font-semibold mt-0.5">✗</span>
                                                            <div>
                                                                <span className="text-red-700 dark:text-red-400 text-[10px] uppercase font-semibold">Anterior:</span>
                                                                {urlAntes ? (
                                                                    <a
                                                                        href={urlAntes}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="ml-1 text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200 hover:underline line-through opacity-70 cursor-pointer transition-colors"
                                                                        title="Click para ver la evidencia anterior (reemplazada)"
                                                                    >
                                                                        {ev.antes}
                                                                    </a>
                                                                ) : (
                                                                    <span className="ml-1 text-amber-700 dark:text-amber-300 line-through opacity-70">{ev.antes}</span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Evidencia nueva */}
                                                        <div className="flex items-start gap-1.5">
                                                            <span className="text-green-600 dark:text-green-400 font-semibold mt-0.5">✓</span>
                                                            <div>
                                                                <span className="text-green-700 dark:text-green-400 text-[10px] uppercase font-semibold">Nueva:</span>
                                                                {urlDespues ? (
                                                                    <a
                                                                        href={urlDespues}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="ml-1 text-amber-900 dark:text-amber-100 hover:text-amber-800 dark:hover:text-amber-200 hover:underline font-semibold cursor-pointer transition-colors"
                                                                        title="Click para ver la evidencia nueva (actual)"
                                                                    >
                                                                        {ev.despues}
                                                                    </a>
                                                                ) : (
                                                                    <span className="ml-1 text-amber-900 dark:text-amber-100 font-semibold">{ev.despues}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </li>
                                            );
                                        } else {
                                            const url = getEvidenciaUrl(ev.nombre || '');
                                            const nombreMostrar = ev.nombre || `Evidencia ${idx + 1}`;

                                            return (
                                                <li key={idx} className="flex items-start gap-2 text-xs">
                                                    <span className="text-amber-400 mt-0.5">•</span>
                                                    {url ? (
                                                        <a
                                                            href={url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200 hover:underline cursor-pointer transition-colors"
                                                            title="Click para abrir la evidencia"
                                                        >
                                                            {nombreMostrar}
                                                        </a>
                                                    ) : (
                                                        <span className="text-amber-700 dark:text-amber-300">{nombreMostrar}</span>
                                                    )}
                                                </li>
                                            );
                                        }
                                    })}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
