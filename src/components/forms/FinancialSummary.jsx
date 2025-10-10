import React from 'react';
import { motion } from 'framer-motion';
import { Home, TrendingUp, AlertCircle, CheckCircle2, Wallet } from 'lucide-react';
import { formatCurrency } from '../../utils/textFormatters';

/**
 * Componente de resumen financiero con indicadores visuales
 */
const FinancialSummary = ({ vivienda, resumen }) => {
    const { totalRecursos, totalAPagar, diferencia } = resumen;
    const porcentajeCubierto = totalAPagar > 0 ? (totalRecursos / totalAPagar) * 100 : 0;
    const estaBalanceado = Math.abs(diferencia) < 1;
    const faltaRecursos = diferencia > 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Valor Total */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="group relative"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative bg-white dark:bg-gray-800 p-5 rounded-xl border-2 border-blue-200 dark:border-blue-900 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                            <Home className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                                Valor Total
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                A pagar
                            </p>
                        </div>
                    </div>
                    <p className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3">
                        {formatCurrency(totalAPagar)}
                    </p>

                    {vivienda && (
                        <div className="space-y-1.5 pt-3 border-t border-gray-100 dark:border-gray-700">
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-600 dark:text-gray-400">Valor Base</span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {formatCurrency(vivienda.valorBase || 0)}
                                </span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-600 dark:text-gray-400">Separación</span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {formatCurrency(vivienda.valorSeparacion || 0)}
                                </span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-600 dark:text-gray-400">Gastos Notariales</span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {formatCurrency(vivienda.gastosNotariales || 0)}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Card 2: Recursos Disponibles */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="group relative"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative bg-white dark:bg-gray-800 p-5 rounded-xl border-2 border-emerald-200 dark:border-emerald-900 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
                            <Wallet className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                                Recursos
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Configurados
                            </p>
                        </div>
                    </div>
                    <p className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3">
                        {formatCurrency(totalRecursos)}
                    </p>

                    {/* Barra de progreso */}
                    <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-gray-600 dark:text-gray-400">Progreso</span>
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                {porcentajeCubierto.toFixed(1)}%
                            </span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(porcentajeCubierto, 100)}%` }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                                className={`h-full rounded-full ${porcentajeCubierto >= 100
                                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600'
                                        : 'bg-gradient-to-r from-amber-500 to-orange-600'
                                    }`}
                            />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Card 3: Balance */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="group relative"
            >
                <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity ${estaBalanceado
                        ? 'bg-gradient-to-br from-emerald-500/5 to-teal-500/5'
                        : 'bg-gradient-to-br from-amber-500/5 to-orange-500/5'
                    }`} />
                <div className={`relative bg-white dark:bg-gray-800 p-5 rounded-xl border-2 shadow-sm hover:shadow-md transition-all ${estaBalanceado
                        ? 'border-emerald-200 dark:border-emerald-900'
                        : faltaRecursos
                            ? 'border-red-200 dark:border-red-900'
                            : 'border-amber-200 dark:border-amber-900'
                    }`}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-md ${estaBalanceado
                                ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                                : faltaRecursos
                                    ? 'bg-gradient-to-br from-red-500 to-rose-600'
                                    : 'bg-gradient-to-br from-amber-500 to-orange-600'
                            }`}>
                            {estaBalanceado ? (
                                <CheckCircle2 className="w-5 h-5 text-white" />
                            ) : (
                                <AlertCircle className="w-5 h-5 text-white" />
                            )}
                        </div>
                        <div>
                            <p className={`text-xs font-bold uppercase tracking-wider ${estaBalanceado
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : faltaRecursos
                                        ? 'text-red-600 dark:text-red-400'
                                        : 'text-amber-600 dark:text-amber-400'
                                }`}>
                                {estaBalanceado ? 'Balanceado' : faltaRecursos ? 'Falta' : 'Excedente'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {estaBalanceado ? 'Cuadrado' : 'Diferencia'}
                            </p>
                        </div>
                    </div>
                    <p className={`text-2xl font-extrabold mb-3 ${estaBalanceado
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : faltaRecursos
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-amber-600 dark:text-amber-400'
                        }`}>
                        {estaBalanceado ? formatCurrency(0) : formatCurrency(Math.abs(diferencia))}
                    </p>

                    <div className={`pt-3 border-t ${estaBalanceado
                            ? 'border-emerald-100 dark:border-emerald-900'
                            : 'border-gray-100 dark:border-gray-700'
                        }`}>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            {estaBalanceado
                                ? '✓ El balance financiero está correcto'
                                : faltaRecursos
                                    ? '⚠️ Faltan recursos por configurar'
                                    : '⚠️ Hay recursos de más configurados'
                            }
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default FinancialSummary;
