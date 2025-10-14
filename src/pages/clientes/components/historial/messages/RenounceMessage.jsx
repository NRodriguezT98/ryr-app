/**
 * Componente para mostrar mensajes de renuncia de cliente
 * Muestra todos los detalles de la renuncia: motivo, vivienda, abonos, devolución, penalidad
 */

import { Icons } from '../HistorialIcons';
import { formatCurrency } from '@/utils/textFormatters';

export const RenounceMessage = ({
    motivo,
    observacion,
    fechaRenuncia,
    viviendaInfo,
    totalAbonado,
    penalidadMonto,
    penalidadMotivo,
    totalADevolver,
    estadoDevolucion,
    historialAbonos,
    documentosArchivados
}) => {
    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start gap-2">
                <Icons.XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            Cliente renunció a la vivienda asignada
                        </span>
                    </div>
                </div>
            </div>

            {/* Motivo de la renuncia */}
            {motivo && (
                <div className="pl-8">
                    <div className="p-4 bg-red-50 dark:bg-red-950/50 rounded-lg border border-red-200 dark:border-red-800/50">
                        <p className="text-sm text-red-900 dark:text-red-50">
                            <span className="font-semibold flex items-center gap-2 mb-1">
                                <Icons.Info className="w-4 h-4 text-red-600 dark:text-red-300" />
                                Motivo de la renuncia:
                            </span>
                            <span className="block pl-6 italic text-red-800 dark:text-red-100">"{motivo}"</span>
                        </p>
                        {observacion && (
                            <p className="text-xs text-red-700 dark:text-red-200 pl-6 mt-2">
                                <span className="font-semibold">Observaciones: </span>
                                {observacion}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Detalles de la renuncia */}
            <div className="pl-8 space-y-3">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Icons.Edit3 className="w-4 h-4" />
                    Detalles de la renuncia:
                </p>

                <div className="space-y-3">
                    {/* Información de la vivienda */}
                    {viviendaInfo && (
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700/50">
                            <div className="flex items-start gap-2 text-sm mb-2">
                                <Icons.Home className="w-4 h-4 text-slate-600 dark:text-slate-300 flex-shrink-0 mt-0.5" />
                                <p className="font-semibold text-slate-900 dark:text-slate-50">Vivienda Renunciada</p>
                            </div>
                            <div className="pl-6 space-y-1 text-xs">
                                <p className="text-slate-700 dark:text-slate-200">
                                    • Ubicación: {viviendaInfo}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Resumen Financiero */}
                    <div className="bg-amber-50 dark:bg-amber-950/40 p-4 rounded-lg border border-amber-200 dark:border-amber-800/50">
                        <div className="flex items-start gap-2 text-sm mb-3">
                            <Icons.DollarSign className="w-4 h-4 text-amber-600 dark:text-amber-300 flex-shrink-0 mt-0.5" />
                            <p className="font-semibold text-amber-900 dark:text-amber-50">Resumen Financiero</p>
                        </div>
                        <div className="pl-6 space-y-1.5 text-xs">
                            <p className="text-amber-800 dark:text-amber-100">
                                • Total Abonado: <span className="font-semibold">{formatCurrency(totalAbonado)}</span>
                            </p>

                            {penalidadMonto > 0 && (
                                <>
                                    <p className="text-amber-800 dark:text-amber-100">
                                        • Penalidad Aplicada: <span className="font-semibold text-red-600 dark:text-red-400">-{formatCurrency(penalidadMonto)}</span>
                                    </p>
                                    {penalidadMotivo && (
                                        <p className="text-amber-700 dark:text-amber-200 pl-4 text-[11px] italic">
                                            ◦ Motivo: {penalidadMotivo}
                                        </p>
                                    )}
                                </>
                            )}

                            <p className="text-amber-900 dark:text-amber-50 font-semibold pt-2 border-t border-amber-300 dark:border-amber-700/50">
                                • Total a Devolver: {formatCurrency(totalADevolver)}
                            </p>

                            <p className="text-amber-700 dark:text-amber-200 pl-4 text-[11px]">
                                ◦ Estado: <span className={`font-semibold ${estadoDevolucion === 'Cerrada'
                                        ? 'text-green-600 dark:text-green-400'
                                        : 'text-orange-600 dark:text-orange-400'
                                    }`}>
                                    {estadoDevolucion}
                                </span>
                            </p>
                        </div>
                    </div>

                    {/* Historial de Abonos */}
                    {historialAbonos && historialAbonos.length > 0 && (
                        <div className="bg-blue-50 dark:bg-blue-950/40 p-4 rounded-lg border border-blue-200 dark:border-blue-800/50">
                            <div className="flex items-start gap-2 text-sm mb-3">
                                <Icons.FileText className="w-4 h-4 text-blue-600 dark:text-blue-300 flex-shrink-0 mt-0.5" />
                                <p className="font-semibold text-blue-900 dark:text-blue-50">
                                    Historial de Abonos ({historialAbonos.length})
                                </p>
                            </div>
                            <div className="pl-6 space-y-2 text-xs max-h-40 overflow-y-auto">
                                {historialAbonos.map((abono, index) => (
                                    <div key={index} className="text-blue-800 dark:text-blue-100 pb-2 border-b border-blue-200 dark:border-blue-800/50 last:border-0">
                                        <p className="font-semibold">
                                            {formatCurrency(abono.monto)} - {abono.metodoPago || 'Método no especificado'}
                                        </p>
                                        {abono.fechaPago && (
                                            <p className="text-[11px] text-blue-700 dark:text-blue-200">
                                                Fecha: {new Date(abono.fechaPago.seconds * 1000).toLocaleDateString('es-CO')}
                                            </p>
                                        )}
                                        {abono.consecutivo && (
                                            <p className="text-[11px] text-blue-700 dark:text-blue-200">
                                                Consecutivo: #{abono.consecutivo}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Documentos Archivados */}
                    {documentosArchivados && documentosArchivados.length > 0 && (
                        <div className="bg-violet-50 dark:bg-violet-950/40 p-4 rounded-lg border border-violet-200 dark:border-violet-800/50">
                            <div className="flex items-start gap-2 text-sm mb-3">
                                <Icons.Archive className="w-4 h-4 text-violet-600 dark:text-violet-300 flex-shrink-0 mt-0.5" />
                                <p className="font-semibold text-violet-900 dark:text-violet-50">
                                    Documentos Archivados ({documentosArchivados.length})
                                </p>
                            </div>
                            <div className="pl-6 space-y-1 text-xs">
                                {documentosArchivados.map((doc, index) => (
                                    <p key={index} className="text-violet-800 dark:text-violet-100">
                                        • {doc.label}
                                        {doc.url && (
                                            <a
                                                href={doc.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="ml-2 text-violet-600 dark:text-violet-300 hover:underline inline-flex items-center gap-1"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                Ver
                                                <Icons.ExternalLink className="w-3 h-3" />
                                            </a>
                                        )}
                                    </p>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Información del proceso */}
                    <div className="bg-gray-50 dark:bg-gray-900/40 p-4 rounded-lg border border-gray-200 dark:border-gray-700/50">
                        <div className="flex items-start gap-2 text-sm">
                            <Icons.Info className="w-4 h-4 text-gray-600 dark:text-gray-300 flex-shrink-0 mt-0.5" />
                            <div className="space-y-1.5">
                                <p className="font-semibold text-gray-900 dark:text-gray-50">Proceso de Renuncia</p>
                                <p className="text-xs text-gray-800 dark:text-gray-100">
                                    • El proceso de compra y todos los documentos fueron archivados
                                </p>
                                <p className="text-xs text-gray-800 dark:text-gray-100">
                                    • La vivienda fue liberada y está disponible para asignación
                                </p>
                                {estadoDevolucion === 'Pendiente' && totalADevolver > 0 && (
                                    <p className="text-xs text-gray-800 dark:text-gray-100 font-semibold">
                                        • El cliente quedará en estado "En Proceso de Renuncia" hasta que se complete la devolución
                                    </p>
                                )}
                                {estadoDevolucion === 'Cerrada' && (
                                    <p className="text-xs text-green-700 dark:text-green-300 font-semibold">
                                        • El proceso de renuncia fue cerrado automáticamente
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
