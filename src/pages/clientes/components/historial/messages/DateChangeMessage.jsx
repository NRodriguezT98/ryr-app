/**
 * Componente para mostrar mensajes de cambio de fecha
 */

import { Icons } from '../HistorialIcons';

export const DateChangeMessage = ({
    pasoNombre,
    numeroPaso,
    totalPasos,
    fechaAnterior,
    fechaNueva
}) => {
    return (
        <div className="space-y-3">
            <div className="flex items-start gap-2">
                <Icons.Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            Paso "{pasoNombre}"
                        </span>
                        <Icons.Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                            fecha modificada
                        </span>
                        {numeroPaso && totalPasos && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                                Paso {numeroPaso}/{totalPasos}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {fechaAnterior && fechaNueva && (
                <div className="pl-8 space-y-2">
                    <div className="flex items-start gap-2 text-sm">
                        <span className="text-gray-500 dark:text-gray-400 min-w-[70px]">Anterior:</span>
                        <span className="text-gray-600 dark:text-gray-400 line-through">{fechaAnterior}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                        <span className="text-gray-500 dark:text-gray-400 min-w-[70px]">Nueva:</span>
                        <span className="text-gray-900 dark:text-gray-100 font-medium">{fechaNueva}</span>
                    </div>
                </div>
            )}
        </div>
    );
};
