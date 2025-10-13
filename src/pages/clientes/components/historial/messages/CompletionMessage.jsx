/**
 * Componente para mostrar mensajes de paso completado
 */

import { Icons } from '../HistorialIcons';

export const CompletionMessage = ({
    pasoNombre,
    numeroPaso,
    totalPasos,
    isAutoCompletion,
    fecha,
    evidencias,
    evidenciasConUrl,
    getEvidenciaUrl,
    getEvidenciaDisplayName
}) => {
    return (
        <div className="space-y-3">
            <div className="flex items-start gap-2">
                <Icons.CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            Paso "{pasoNombre}"
                        </span>
                        <Icons.CheckCircle className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
                            completado
                        </span>
                        {isAutoCompletion && (
                            <>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                                    automáticamente
                                </span>
                            </>
                        )}
                        {numeroPaso && totalPasos && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                                Paso {numeroPaso}/{totalPasos}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {fecha && (
                <div className="flex items-center gap-2 pl-8">
                    <Icons.Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        Se indicó como fecha de completado: <span className="font-medium text-gray-800 dark:text-gray-200">{fecha}</span>
                    </span>
                </div>
            )}

            {evidencias.length > 0 && (
                <div className="pl-8 space-y-2">
                    <div className="flex items-center gap-2">
                        <Icons.FolderOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {evidencias.length === 1 ? 'Evidencia adjuntada:' : `${evidencias.length} evidencias adjuntadas:`}
                        </span>
                    </div>
                    <ul className="space-y-1.5 pl-6">
                        {evidencias.map((ev, idx) => {
                            const nombreEvidencia = getEvidenciaDisplayName(idx);
                            const url = evidenciasConUrl[idx]?.url || getEvidenciaUrl(ev);

                            return (
                                <li key={idx} className="flex items-start gap-2 text-sm">
                                    <span className="text-gray-400 mt-0.5">•</span>
                                    {url ? (
                                        <a
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline cursor-pointer transition-colors"
                                            title="Click para abrir la evidencia"
                                        >
                                            {nombreEvidencia}
                                        </a>
                                    ) : (
                                        <span className="text-gray-600 dark:text-gray-400">{nombreEvidencia}</span>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
};
