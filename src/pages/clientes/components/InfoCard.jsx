<InfoCard
    icon={<GitCommit size={24} />}
    title="Estado del Proceso"
    variant={pasoActualLabel === 'Completado' ? 'success' : 'info'}
>
    {pasoActualLabel === 'Completado' ? (
        <div className="space-y-3">
            <div className="flex items-center gap-3">
                <CheckCircle size={24} className="text-green-500 dark:text-green-400 flex-shrink-0" />
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                    ¡Proceso Finalizado!
                </p>
            </div>
            {/* Barra de progreso al 100% */}
            <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Progreso</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">100%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                        className="bg-gradient-to-r from-green-500 to-emerald-500 dark:from-green-400 dark:to-emerald-400 h-full rounded-full transition-all duration-500"
                        style={{ width: '100%' }}
                    ></div>
                </div>
            </div>
        </div>
    ) : (
        <div className="space-y-3">
            <div className="space-y-2">
                {/* AQUÍ ESTÁ EL CAMBIO PRINCIPAL - LED verde parpadeando + "Completado:" */}
                <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mt-1.5 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                        <span className="text-xs text-gray-500 dark:text-gray-400 block">Completado:</span>
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 block truncate" title={ultimoPasoCompletadoLabel}>
                            {ultimoPasoCompletadoLabel}
                        </span>
                    </div>
                </div>

                <div className="flex items-start gap-2">
                    <ChevronRight size={16} className="text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                        <span className="text-xs text-gray-500 dark:text-gray-400 block">Siguiente:</span>
                        <span className="text-base font-bold text-blue-600 dark:text-blue-400 block truncate" title={pasoActualLabel}>
                            {pasoActualLabel}
                        </span>
                    </div>
                </div>
            </div>

            {/* Barra de progreso dinámica */}
            <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Progreso</span>
                    <span className="font-semibold">65%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-blue-400 dark:to-indigo-400 h-full rounded-full transition-all duration-500"
                        style={{ width: '65%' }}
                    ></div>
                </div>
            </div>
        </div>
    )}
</InfoCard>