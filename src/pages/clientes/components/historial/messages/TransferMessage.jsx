/**
 * Componente para mostrar mensajes de transferencia de vivienda
 * Basado en el estilo visual de ReopeningMessage pero con colores azul/verde
 */

import { Icons } from '../HistorialIcons';
import { formatCurrency } from '@/utils/textFormatters';

export const TransferMessage = ({
    clienteNombre,
    clienteDocumento,
    viviendaActual,
    motivo,
    viviendaAnterior,
    viviendaNueva,
    planAnterior,
    planNuevo,
    abonosSincronizados,
    procesoReseteado,
    pasosNuevoProceso
}) => {
    // Helper para formatear fuente de pago
    const formatFuentePago = (fuente) => {
        if (!fuente) return null;
        const map = {
            'subsidio': 'Subsidio',
            'banco': 'Banco',
            'directo': 'Pago Directo'
        };
        return map[fuente] || fuente;
    };

    return (
        <div className="space-y-4">
            {/* Header con iconos y badges inline */}
            <div className="flex items-start gap-2">
                <Icons.ArrowRightLeft className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            Cliente transferido a nueva vivienda
                        </span>
                    </div>
                </div>
            </div>

            {/* Motivo de la transferencia - PRIMERO */}
            {motivo && (
                <div className="pl-8">
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg border border-blue-200 dark:border-blue-800/50">
                        <p className="text-sm text-blue-900 dark:text-blue-50">
                            <span className="font-semibold flex items-center gap-2 mb-1">
                                <Icons.Info className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                                Motivo de la transferencia:
                            </span>
                            <span className="block pl-6 italic text-blue-800 dark:text-blue-100">"{motivo}"</span>
                        </p>
                    </div>
                </div>
            )}

            {/* Detalles de la transferencia */}
            <div className="pl-8 space-y-3">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Icons.Edit3 className="w-4 h-4" />
                    Detalles de la transferencia:
                </p>

                <div className="space-y-3">
                    {/* Vivienda Anterior con Plan Anterior */}
                    {viviendaAnterior?.id && (
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700/50">
                            <div className="flex items-start gap-2 text-sm mb-3">
                                <Icons.Home className="w-4 h-4 text-slate-600 dark:text-slate-300 flex-shrink-0 mt-0.5" />
                                <p className="font-semibold text-slate-900 dark:text-slate-50">Vivienda Anterior</p>
                            </div>
                            <div className="pl-6 space-y-1.5 text-xs">
                                <p className="text-slate-700 dark:text-slate-200">
                                    • Ubicación: Manzana {viviendaAnterior.manzana} - Casa {viviendaAnterior.numeroCasa}
                                </p>
                                {viviendaAnterior.valorTotal && (
                                    <p className="text-slate-700 dark:text-slate-200">
                                        • Valor: {formatCurrency(viviendaAnterior.valorTotal)}
                                    </p>
                                )}

                                {/* Plan anterior */}
                                {planAnterior && (
                                    <div className="mt-3 pt-3 border-t border-slate-300 dark:border-slate-600/50">
                                        <p className="text-slate-700 dark:text-slate-100 font-semibold mb-2">Plan Financiero Anterior:</p>

                                        {/* Cuota Inicial */}
                                        {planAnterior.aplicaCuotaInicial && planAnterior.cuotaInicial?.monto > 0 && (
                                            <p className="text-slate-700 dark:text-slate-200">
                                                • Cuota Inicial: {formatCurrency(planAnterior.cuotaInicial.monto)}
                                            </p>
                                        )}

                                        {/* Subsidio Mi Casa Ya */}
                                        {planAnterior.aplicaSubsidioVivienda && planAnterior.subsidioVivienda?.monto > 0 && (
                                            <p className="text-slate-700 dark:text-slate-200">
                                                • Subsidio Mi Casa Ya: {formatCurrency(planAnterior.subsidioVivienda.monto)}
                                            </p>
                                        )}

                                        {/* Subsidio Caja de Compensación */}
                                        {planAnterior.aplicaSubsidioCaja && planAnterior.subsidioCaja?.monto > 0 && (
                                            <p className="text-slate-700 dark:text-slate-200">
                                                • Subsidio Caja
                                                {planAnterior.subsidioCaja.caja && ` (${planAnterior.subsidioCaja.caja})`}: {formatCurrency(planAnterior.subsidioCaja.monto)}
                                            </p>
                                        )}

                                        {/* Crédito Bancario */}
                                        {planAnterior.aplicaCredito && planAnterior.credito?.monto > 0 && (
                                            <>
                                                <p className="text-slate-700 dark:text-slate-200">
                                                    • Crédito Bancario
                                                    {planAnterior.credito.banco && ` (${planAnterior.credito.banco})`}: {formatCurrency(planAnterior.credito.monto)}
                                                </p>
                                                {planAnterior.credito.cuotas && (
                                                    <p className="text-slate-600 dark:text-slate-300 pl-4 text-[11px]">
                                                        ◦ {planAnterior.credito.cuotas} cuotas
                                                        {planAnterior.credito.valorCuota && ` de ${formatCurrency(planAnterior.credito.valorCuota)}`}
                                                    </p>
                                                )}
                                            </>
                                        )}

                                        {/* Total del Plan Financiero Anterior */}
                                        {planAnterior.valorInicial && (
                                            <p className="text-slate-800 dark:text-slate-100 font-semibold mt-2 pt-2 border-t border-slate-300 dark:border-slate-600/50">
                                                Total Plan Financiero Anterior: {formatCurrency(planAnterior.valorInicial)}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Nueva Vivienda con Nuevo Plan */}
                    {viviendaNueva && (
                        <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-lg border border-emerald-200 dark:border-emerald-800/50">
                            <div className="flex items-start gap-2 text-sm mb-3">
                                <Icons.Home className="w-4 h-4 text-emerald-600 dark:text-emerald-300 flex-shrink-0 mt-0.5" />
                                <p className="font-semibold text-emerald-900 dark:text-emerald-50">Nueva Vivienda</p>
                            </div>
                            <div className="pl-6 space-y-1.5 text-xs">
                                <p className="text-emerald-800 dark:text-emerald-100">
                                    • Ubicación: Manzana {viviendaNueva.manzana} - Casa {viviendaNueva.numeroCasa}
                                </p>
                                {viviendaNueva.valorTotal && (
                                    <p className="text-emerald-800 dark:text-emerald-100">
                                        • Valor: {formatCurrency(viviendaNueva.valorTotal)}
                                    </p>
                                )}

                                {/* Nuevo Plan */}
                                {planNuevo && (
                                    <div className="mt-3 pt-3 border-t border-emerald-300 dark:border-emerald-700/50">
                                        <p className="text-emerald-800 dark:text-emerald-50 font-semibold mb-2">Plan Financiero Nuevo:</p>

                                        {/* Cuota Inicial */}
                                        {planNuevo.aplicaCuotaInicial && planNuevo.cuotaInicial?.monto > 0 && (
                                            <p className="text-emerald-800 dark:text-emerald-100">
                                                • Cuota Inicial: {formatCurrency(planNuevo.cuotaInicial.monto)}
                                            </p>
                                        )}

                                        {/* Subsidio Mi Casa Ya */}
                                        {planNuevo.aplicaSubsidioVivienda && planNuevo.subsidioVivienda?.monto > 0 && (
                                            <p className="text-emerald-800 dark:text-emerald-100">
                                                • Subsidio Mi Casa Ya: {formatCurrency(planNuevo.subsidioVivienda.monto)}
                                            </p>
                                        )}

                                        {/* Subsidio Caja de Compensación */}
                                        {planNuevo.aplicaSubsidioCaja && planNuevo.subsidioCaja?.monto > 0 && (
                                            <p className="text-emerald-800 dark:text-emerald-100">
                                                • Subsidio Caja
                                                {planNuevo.subsidioCaja.caja && ` (${planNuevo.subsidioCaja.caja})`}: {formatCurrency(planNuevo.subsidioCaja.monto)}
                                            </p>
                                        )}

                                        {/* Crédito Bancario */}
                                        {planNuevo.aplicaCredito && planNuevo.credito?.monto > 0 && (
                                            <>
                                                <p className="text-emerald-800 dark:text-emerald-100">
                                                    • Crédito Bancario
                                                    {planNuevo.credito.banco && ` (${planNuevo.credito.banco})`}: {formatCurrency(planNuevo.credito.monto)}
                                                </p>
                                                {planNuevo.credito.cuotas && (
                                                    <p className="text-emerald-700 dark:text-emerald-200 pl-4 text-[11px]">
                                                        ◦ {planNuevo.credito.cuotas} cuotas
                                                        {planNuevo.credito.valorCuota && ` de ${formatCurrency(planNuevo.credito.valorCuota)}`}
                                                    </p>
                                                )}
                                            </>
                                        )}

                                        {/* Total del Plan Financiero Nuevo */}
                                        {planNuevo.valorInicial && (
                                            <p className="text-emerald-900 dark:text-emerald-50 font-semibold mt-2 pt-2 border-t border-emerald-300 dark:border-emerald-700/50">
                                                Total Plan Financiero Nuevo: {formatCurrency(planNuevo.valorInicial)}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Abonos Sincronizados */}
                    {abonosSincronizados?.cantidad > 0 && (
                        <div className="bg-teal-50 dark:bg-teal-950/40 p-4 rounded-lg border border-teal-200 dark:border-teal-800/50">
                            <div className="flex items-start gap-2 text-sm">
                                <Icons.CheckCircle className="w-4 h-4 text-teal-600 dark:text-teal-300 flex-shrink-0 mt-0.5" />
                                <p className="text-teal-900 dark:text-teal-50">
                                    <span className="font-semibold">Abonos Transferidos: </span>
                                    <span className="text-teal-800 dark:text-teal-100">
                                        {abonosSincronizados.cantidad} abono{abonosSincronizados.cantidad > 1 ? 's' : ''} sincronizado{abonosSincronizados.cantidad > 1 ? 's' : ''}
                                    </span>
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Proceso Reseteado */}
                    {procesoReseteado && (
                        <div className="bg-violet-50 dark:bg-violet-950/40 p-4 rounded-lg border border-violet-200 dark:border-violet-800/50">
                            <div className="flex items-start gap-2 text-sm">
                                <Icons.RotateCcw className="w-4 h-4 text-violet-600 dark:text-violet-300 flex-shrink-0 mt-0.5" />
                                <div className="space-y-1.5">
                                    <p className="font-semibold text-violet-900 dark:text-violet-50">Proceso de Compra Reiniciado</p>
                                    <p className="text-xs text-violet-800 dark:text-violet-100">
                                        • El proceso para este cliente fue completamente reiniciado
                                    </p>
                                    {pasosNuevoProceso?.length > 0 && (
                                        <>
                                            <p className="text-xs text-violet-800 dark:text-violet-100">
                                                • Se configuraron {pasosNuevoProceso.length} pasos según el nuevo plan financiero
                                            </p>
                                            <p className="text-xs text-violet-800 dark:text-violet-100 font-semibold">
                                                • Por favor diríjase a la pestaña "Proceso" de la vista de "ver detalle" del cliente para completar el primer paso 'Promesa de Compraventa Enviada'
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
