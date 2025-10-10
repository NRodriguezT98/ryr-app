import React from 'react';
import { motion } from 'framer-motion';

/**
 * Toggle Switch moderno y accesible
 * @param {boolean} checked - Estado del toggle
 * @param {function} onChange - Callback cuando cambia el estado
 * @param {boolean} disabled - Si está deshabilitado
 * @param {string} color - Color del tema: 'emerald' | 'blue' | 'purple' | 'amber' | 'gray'
 * @param {string} size - Tamaño: 'sm' | 'md' | 'lg'
 * @param {string} label - Label opcional para accesibilidad
 */
const ToggleSwitch = ({
    checked = false,
    onChange,
    disabled = false,
    color = 'emerald',
    size = 'md',
    label = '',
    className = ''
}) => {
    const colorClasses = {
        emerald: {
            active: 'bg-emerald-500',
            ring: 'focus-visible:ring-emerald-200 dark:focus-visible:ring-emerald-800'
        },
        blue: {
            active: 'bg-blue-500',
            ring: 'focus-visible:ring-blue-200 dark:focus-visible:ring-blue-800'
        },
        purple: {
            active: 'bg-purple-500',
            ring: 'focus-visible:ring-purple-200 dark:focus-visible:ring-purple-800'
        },
        amber: {
            active: 'bg-amber-500',
            ring: 'focus-visible:ring-amber-200 dark:focus-visible:ring-amber-800'
        },
        gray: {
            active: 'bg-gray-500',
            ring: 'focus-visible:ring-gray-200 dark:focus-visible:ring-gray-800'
        }
    };

    const sizeClasses = {
        sm: { track: 'w-10 h-5', thumb: 'w-4 h-4', translate: 'translate-x-5' },
        md: { track: 'w-14 h-7', thumb: 'w-6 h-6', translate: 'translate-x-7' },
        lg: { track: 'w-16 h-8', thumb: 'w-7 h-7', translate: 'translate-x-8' }
    };

    const colors = colorClasses[color] || colorClasses.emerald;
    const sizes = sizeClasses[size] || sizeClasses.md;

    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            onClick={() => !disabled && onChange?.({ target: { checked: !checked } })}
            disabled={disabled}
            className={`
                relative inline-flex items-center rounded-full transition-all duration-300
                ${sizes.track}
                ${checked ? colors.active : 'bg-gray-300 dark:bg-gray-600'}
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-md'}
                ${colors.ring}
                focus:outline-none focus-visible:ring-4
                shadow-inner
                ${className}
            `}
        >
            <motion.span
                initial={false}
                animate={{
                    x: checked ? sizes.translate : '0.125rem'
                }}
                transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 30
                }}
                className={`
                    ${sizes.thumb}
                    bg-white rounded-full shadow-lg
                    flex items-center justify-center
                `}
            >
                {/* Icono opcional de check cuando está activo */}
                {checked && (
                    <motion.svg
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-3 h-3 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </motion.svg>
                )}
            </motion.span>
        </button>
    );
};

export default ToggleSwitch;
