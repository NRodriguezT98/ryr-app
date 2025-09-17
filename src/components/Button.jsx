// src/components/Button.jsx - Versión Mejorada 🚀
import React from 'react';

const Button = ({
    variant = 'primary',
    size = 'default',
    isLoading = false,
    loadingText = 'Procesando...',
    icon,
    className = '',
    children,
    disabled,
    ...rest
}) => {
    const isDisabled = isLoading || disabled;

    // 🎨 Estilos base mejorados con transiciones más suaves
    const baseClasses = `
        relative inline-flex items-center justify-center 
        font-medium transition-all duration-300 ease-out
        focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800
        transform hover:scale-[1.02] active:scale-[0.98]
        border border-transparent rounded-lg shadow-sm
        disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100
        overflow-hidden group
    `;

    // 🎨 Tamaños mejorados
    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm gap-1.5',
        default: 'px-4 py-2.5 text-sm gap-2',
        lg: 'px-6 py-3 text-base gap-2.5',
    };

    // 🎨 Variantes con gradientes y efectos modernos
    const variantClasses = {
        primary: `
            text-white bg-gradient-to-r from-blue-600 to-blue-700 
            hover:from-blue-700 hover:to-blue-800 
            focus:ring-blue-500 
            disabled:from-blue-400 disabled:to-blue-400
            shadow-lg hover:shadow-xl
            before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300
        `,
        secondary: `
            text-gray-700 bg-gradient-to-r from-gray-100 to-gray-200 
            hover:from-gray-200 hover:to-gray-300 
            focus:ring-gray-400 
            disabled:from-gray-50 disabled:to-gray-50
            dark:text-gray-100 dark:from-gray-600 dark:to-gray-700 
            dark:hover:from-gray-500 dark:hover:to-gray-600
            shadow hover:shadow-lg
        `,
        danger: `
            text-white bg-gradient-to-r from-red-600 to-red-700 
            hover:from-red-700 hover:to-red-800 
            focus:ring-red-500 
            disabled:from-red-400 disabled:to-red-400
            shadow-lg hover:shadow-xl
            before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300
        `,
        success: `
            text-white bg-gradient-to-r from-green-600 to-green-700 
            hover:from-green-700 hover:to-green-800 
            focus:ring-green-500 
            disabled:from-green-400 disabled:to-green-400
            shadow-lg hover:shadow-xl
            before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300
        `,
        outline: `
            text-blue-600 bg-transparent border-2 border-blue-600
            hover:bg-blue-50 hover:border-blue-700
            dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-900/20
            focus:ring-blue-500 
            disabled:text-blue-300 disabled:border-blue-300
        `,
        ghost: `
            text-gray-700 bg-transparent 
            hover:bg-gray-100 
            dark:text-gray-300 dark:hover:bg-gray-800
            focus:ring-gray-400 
            disabled:text-gray-400
        `
    };

    // 🎨 Estilos cuando está disabled/loading
    const disabledClasses = isDisabled ? 'opacity-60 cursor-not-allowed' : '';

    // 🌟 Spinner mejorado con animación más suave
    const Spinner = () => (
        <div className="relative">
            {/* Spinner exterior */}
            <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                />
                <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
            </svg>
            {/* Efecto de pulso */}
            <div className="absolute inset-0 rounded-full bg-current opacity-20 animate-pulse" />
        </div>
    );

    // 🎯 Texto de loading inteligente basado en la acción
    const getSmartLoadingText = () => {
        const text = children?.toString?.() || '';

        if (text.toLowerCase().includes('crear') || text.toLowerCase().includes('registrar')) {
            return 'Creando...';
        }
        if (text.toLowerCase().includes('guardar') || text.toLowerCase().includes('actualizar')) {
            return 'Guardando...';
        }
        if (text.toLowerCase().includes('eliminar') || text.toLowerCase().includes('borrar')) {
            return 'Eliminando...';
        }
        if (text.toLowerCase().includes('cargar') || text.toLowerCase().includes('buscar')) {
            return 'Cargando...';
        }
        if (text.toLowerCase().includes('enviar')) {
            return 'Enviando...';
        }
        if (text.toLowerCase().includes('confirmar')) {
            return 'Confirmando...';
        }

        return loadingText;
    };

    return (
        <button
            {...rest}
            disabled={isDisabled}
            className={`
                ${baseClasses} 
                ${sizeClasses[size]} 
                ${variantClasses[variant]} 
                ${disabledClasses}
                ${className}
            `}
        >
            {/* Contenido del botón */}
            <div className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? (
                    <>
                        <Spinner />
                        <span className="animate-pulse">
                            {getSmartLoadingText()}
                        </span>
                    </>
                ) : (
                    <>
                        {icon && <span className="flex-shrink-0">{icon}</span>}
                        <span>{children}</span>
                    </>
                )}
            </div>

            {/* Efecto de onda al hacer click (solo en variantes con color) */}
            {['primary', 'danger', 'success'].includes(variant) && (
                <div className="absolute inset-0 opacity-0 group-active:opacity-30 bg-white rounded-lg transition-opacity duration-150" />
            )}
        </button>
    );
};

export default Button;