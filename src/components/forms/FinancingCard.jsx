import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ToggleSwitch from './ToggleSwitch';

/**
 * Card expandible para fuentes de financiamiento
 * @param {string} title - Título de la card
 * @param {string} subtitle - Subtítulo descriptivo
 * @param {Component} icon - Icono de lucide-react
 * @param {boolean} isActive - Si está activo
 * @param {function} onToggle - Callback cuando se activa/desactiva
 * @param {string} color - Color del tema
 * @param {ReactNode} children - Contenido de la card
 * @param {boolean} disabled - Si está deshabilitado
 */
const FinancingCard = ({
    title,
    subtitle,
    icon: Icon,
    isActive,
    onToggle,
    color = 'emerald',
    children,
    disabled = false
}) => {
    const colorThemes = {
        emerald: {
            gradient: 'from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950 dark:via-green-950 dark:to-teal-950',
            border: 'border-emerald-300 dark:border-emerald-700',
            shadow: 'shadow-emerald-100 dark:shadow-emerald-900/50',
            iconBg: 'from-emerald-500 to-teal-600',
            iconColor: 'text-white',
            divider: 'border-emerald-200 dark:border-emerald-800',
            activeBg: 'bg-emerald-50/30 dark:bg-emerald-950/30'
        },
        blue: {
            gradient: 'from-blue-50 via-indigo-50 to-sky-50 dark:from-blue-950 dark:via-indigo-950 dark:to-sky-950',
            border: 'border-blue-300 dark:border-blue-700',
            shadow: 'shadow-blue-100 dark:shadow-blue-900/50',
            iconBg: 'from-blue-500 to-indigo-600',
            iconColor: 'text-white',
            divider: 'border-blue-200 dark:border-blue-800',
            activeBg: 'bg-blue-50/30 dark:bg-blue-950/30'
        },
        purple: {
            gradient: 'from-purple-50 via-fuchsia-50 to-pink-50 dark:from-purple-950 dark:via-fuchsia-950 dark:to-pink-950',
            border: 'border-purple-300 dark:border-purple-700',
            shadow: 'shadow-purple-100 dark:shadow-purple-900/50',
            iconBg: 'from-purple-500 to-fuchsia-600',
            iconColor: 'text-white',
            divider: 'border-purple-200 dark:border-purple-800',
            activeBg: 'bg-purple-50/30 dark:bg-purple-950/30'
        },
        amber: {
            gradient: 'from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950 dark:via-orange-950 dark:to-yellow-950',
            border: 'border-amber-300 dark:border-amber-700',
            shadow: 'shadow-amber-100 dark:shadow-amber-900/50',
            iconBg: 'from-amber-500 to-orange-600',
            iconColor: 'text-white',
            divider: 'border-amber-200 dark:border-amber-800',
            activeBg: 'bg-amber-50/30 dark:bg-amber-950/30'
        }
    };

    const theme = colorThemes[color] || colorThemes.emerald;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="group relative"
        >
            {/* Efecto de glow sutil - simplificado */}
            {isActive && (
                <div className={`absolute -inset-0.5 bg-gradient-to-br ${theme.gradient} rounded-2xl opacity-20 blur-sm`} />
            )}

            <div className={`
                relative overflow-hidden rounded-xl border-2 transition-all duration-200
                ${isActive
                    ? `bg-gradient-to-br ${theme.gradient} ${theme.border} shadow-lg`
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md'
                }
            `}>
                {/* Header */}
                <div className="p-6">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                            {/* Icono */}
                            <div
                                className={`
                                    w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                                    ${isActive
                                        ? `bg-gradient-to-br ${theme.iconBg} shadow-md`
                                        : 'bg-gray-100 dark:bg-gray-700'
                                    }
                                    transition-all duration-200
                                `}
                            >
                                <Icon className={`w-6 h-6 ${isActive ? theme.iconColor : 'text-gray-500 dark:text-gray-400'} transition-colors duration-200`} />
                            </div>

                            {/* Texto */}
                            <div className="flex-1 min-w-0">
                                <h3 className="text-base font-bold text-gray-900 dark:text-white truncate">
                                    {title}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                    {subtitle}
                                </p>
                            </div>
                        </div>

                        {/* Toggle */}
                        <div className="flex-shrink-0">
                            <ToggleSwitch
                                checked={isActive}
                                onChange={(e) => onToggle(e.target.checked)}
                                disabled={disabled}
                                color={color}
                                size="md"
                                label={`Activar ${title}`}
                            />
                        </div>
                    </div>
                </div>

                {/* Contenido expandible con animación optimizada */}
                <AnimatePresence mode="wait">
                    {isActive && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                            className="overflow-hidden"
                        >
                            <div className={`border-t-2 ${theme.divider} px-6 pb-6 pt-6 ${theme.activeBg}`}>
                                <div className="space-y-5">
                                    {children}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default FinancingCard;
