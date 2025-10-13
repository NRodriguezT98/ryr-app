// src/components/modals/ModernModal.jsx
// 🚀 Modal System Moderno - Performance Optimizado con Lazy Rendering

import React, { Fragment, useEffect, useState, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Loader2 } from 'lucide-react';

/**
 * Sistema de tamaños responsive
 */
const SIZE_CLASSES = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full mx-4'
};

/**
 * Sistema de variantes visuales
 */
const VARIANTS = {
    default: {
        headerBg: 'bg-gradient-to-r from-slate-50 to-gray-50 dark:from-gray-800 dark:to-gray-850',
        headerBorder: 'border-b border-gray-200 dark:border-gray-700',
        bodyBg: 'bg-white dark:bg-gray-800',
        footerBg: 'bg-gray-50 dark:bg-gray-800/50'
    },
    primary: {
        headerBg: 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
        headerBorder: 'border-b border-blue-200 dark:border-blue-700',
        bodyBg: 'bg-white dark:bg-gray-800',
        footerBg: 'bg-blue-50/50 dark:bg-blue-900/10'
    },
    success: {
        headerBg: 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
        headerBorder: 'border-b border-green-200 dark:border-green-700',
        bodyBg: 'bg-white dark:bg-gray-800',
        footerBg: 'bg-green-50/50 dark:bg-green-900/10'
    },
    warning: {
        headerBg: 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20',
        headerBorder: 'border-b border-yellow-200 dark:border-yellow-700',
        bodyBg: 'bg-white dark:bg-gray-800',
        footerBg: 'bg-yellow-50/50 dark:bg-yellow-900/10'
    },
    danger: {
        headerBg: 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20',
        headerBorder: 'border-b border-red-200 dark:border-red-700',
        bodyBg: 'bg-white dark:bg-gray-800',
        footerBg: 'bg-red-50/50 dark:bg-red-900/10'
    },
    glass: {
        headerBg: 'backdrop-blur-xl bg-white/70 dark:bg-gray-800/70',
        headerBorder: 'border-b border-white/20 dark:border-gray-700/50',
        bodyBg: 'backdrop-blur-xl bg-white/70 dark:bg-gray-800/70',
        footerBg: 'backdrop-blur-xl bg-white/50 dark:bg-gray-800/50'
    }
};

/**
 * ModernModal - Componente base optimizado
 * 
 * Performance Features:
 * - Lazy rendering del contenido (solo renderiza cuando está visible)
 * - Backdrop sin blur (mejor performance)
 * - Transiciones suaves pero rápidas
 * - Auto-scroll management
 * 
 * @param {boolean} isOpen - Estado de visibilidad
 * @param {function} onClose - Callback al cerrar
 * @param {string} title - Título del modal
 * @param {React.ReactNode} icon - Icono opcional para el header
 * @param {React.ReactNode} children - Contenido del modal
 * @param {React.ReactNode} footer - Footer con botones
 * @param {string} size - Tamaño del modal (xs, sm, md, lg, xl, 2xl, 3xl, 4xl, 5xl, 6xl, 7xl, full)
 * @param {string} variant - Variante visual (default, primary, success, warning, danger, glass)
 * @param {boolean} hideCloseButton - Ocultar botón de cerrar
 * @param {boolean} closeOnBackdrop - Cerrar al hacer click en backdrop
 * @param {boolean} showDividers - Mostrar divisores entre secciones
 * @param {string} maxHeight - Altura máxima del body (ej: 'max-h-96', 'max-h-[600px]')
 * @param {boolean} isLoading - Mostrar estado de carga
 * @param {string} loadingText - Texto del estado de carga
 */
const ModernModal = ({
    isOpen,
    onClose,
    title,
    icon,
    children,
    footer,
    size = 'lg',
    variant = 'default',
    hideCloseButton = false,
    closeOnBackdrop = true,
    showDividers = true,
    maxHeight,
    isLoading = false,
    loadingText = 'Cargando...',
    className = ''
}) => {
    // 🔥 OPTIMIZACIÓN: Lazy rendering - solo renderizar contenido cuando modal está visible
    const [shouldRender, setShouldRender] = useState(false);
    const previousScrollY = useRef(0);

    useEffect(() => {
        if (isOpen) {
            // Guardar posición de scroll actual
            previousScrollY.current = window.scrollY;

            // Activar renderizado después de un frame para suavizar la apertura
            requestAnimationFrame(() => {
                setShouldRender(true);
            });

            // Prevenir scroll del body cuando modal está abierto
            document.body.style.overflow = 'hidden';
        } else {
            // Restaurar scroll del body
            document.body.style.overflow = '';

            // Delay para desmontar después de que termine la animación de cierre
            const timer = setTimeout(() => {
                setShouldRender(false);
            }, 200); // Duración de la transición de salida

            return () => clearTimeout(timer);
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const variantStyles = VARIANTS[variant] || VARIANTS.default;

    const handleClose = () => {
        if (closeOnBackdrop && !isLoading) {
            onClose();
        }
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog
                as="div"
                className="relative z-50"
                onClose={handleClose}
            >
                {/* Backdrop optimizado - Sin blur para mejor performance */}
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gradient-to-br from-gray-900/80 via-slate-900/70 to-gray-900/80" />
                </Transition.Child>

                {/* Container del modal */}
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-6">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-200"
                            enterFrom="opacity-0 scale-95 translate-y-4"
                            enterTo="opacity-100 scale-100 translate-y-0"
                            leave="ease-in duration-150"
                            leaveFrom="opacity-100 scale-100 translate-y-0"
                            leaveTo="opacity-0 scale-95 translate-y-4"
                        >
                            <Dialog.Panel
                                className={`
                                    w-full ${SIZE_CLASSES[size]} 
                                    transform overflow-hidden rounded-2xl 
                                    ${variantStyles.bodyBg}
                                    text-left align-middle 
                                    shadow-2xl shadow-black/20
                                    ring-1 ring-black/5 dark:ring-white/10
                                    transition-all 
                                    flex flex-col
                                    ${className}
                                `}
                            >
                                {/* Header */}
                                <div className={`
                                    flex items-center justify-between 
                                    px-6 py-4
                                    ${variantStyles.headerBg}
                                    ${showDividers ? variantStyles.headerBorder : ''}
                                `}>
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        {icon && (
                                            <div className="flex-shrink-0">
                                                {icon}
                                            </div>
                                        )}
                                        <Dialog.Title
                                            as="h3"
                                            className="text-lg font-bold leading-6 text-gray-900 dark:text-gray-100 truncate"
                                        >
                                            {title}
                                        </Dialog.Title>
                                    </div>

                                    {!hideCloseButton && (
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            disabled={isLoading}
                                            className={`
                                                flex-shrink-0 ml-4 p-2 rounded-lg
                                                text-gray-500 dark:text-gray-400
                                                hover:bg-gray-100 dark:hover:bg-gray-700/50
                                                hover:text-gray-700 dark:hover:text-gray-200
                                                transition-all duration-150
                                                disabled:opacity-50 disabled:cursor-not-allowed
                                                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800
                                            `}
                                            aria-label="Cerrar modal"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>

                                {/* Body Content - Con lazy rendering */}
                                <div
                                    className={`
                                        px-6 py-6 
                                        ${maxHeight || 'max-h-[calc(100vh-16rem)]'}
                                        overflow-y-auto
                                        scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600
                                        scrollbar-track-transparent
                                    `}
                                >
                                    {isLoading ? (
                                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                            <Loader2 className="w-10 h-10 text-blue-500 dark:text-blue-400 animate-spin" />
                                            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                                {loadingText}
                                            </p>
                                        </div>
                                    ) : shouldRender ? (
                                        children
                                    ) : null}
                                </div>

                                {/* Footer - Solo renderizar si existe */}
                                {footer && (
                                    <div className={`
                                        px-6 py-4 
                                        ${variantStyles.footerBg}
                                        ${showDividers ? 'border-t border-gray-200 dark:border-gray-700' : ''}
                                        flex items-center justify-end gap-3
                                        flex-wrap
                                    `}>
                                        {footer}
                                    </div>
                                )}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default ModernModal;
