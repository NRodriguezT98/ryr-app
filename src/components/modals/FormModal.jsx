// src/components/modals/FormModal.jsx
// Modal optimizada para formularios

import React from 'react';
import ModernModal from './ModernModal';
import Button from '../Button';

/**
 * FormModal - Modal optimizada para formularios
 * 
 * Features:
 * - Auto-manejo de submit con Enter
 * - Previene cierre accidental durante edición
 * - Botones de acción inteligentes
 * - Footer personalizable
 * 
 * @param {boolean} isOpen - Estado de visibilidad
 * @param {function} onClose - Callback al cancelar
 * @param {function} onSubmit - Callback al guardar (opcional si se pasa footer)
 * @param {string} title - Título del modal
 * @param {React.ReactNode} icon - Icono del header
 * @param {React.ReactNode} children - Contenido del formulario
 * @param {string} submitText - Texto del botón submit
 * @param {string} cancelText - Texto del botón cancelar
 * @param {boolean} isSubmitting - Estado de carga
 * @param {boolean} disabled - Deshabilitar submit
 * @param {string} size - Tamaño del modal
 * @param {string} variant - Variante visual
 * @param {boolean} isDirty - Indica si el formulario tiene cambios sin guardar
 * @param {string} maxHeight - Altura máxima del contenido
 * @param {React.ReactNode} extraActions - Acciones adicionales en el footer
 * @param {React.ReactNode} footer - Footer completamente personalizado (anula footer por defecto)
 */
const FormModal = ({
    isOpen,
    onClose,
    onSubmit,
    title,
    icon,
    children,
    submitText = 'Guardar',
    cancelText = 'Cancelar',
    isSubmitting = false,
    disabled = false,
    size = 'xl',
    variant = 'primary',
    isDirty = false,
    maxHeight = 'max-h-[calc(100vh-12rem)]',
    extraActions,
    footer: customFooter
}) => {
    const handleClose = () => {
        // Si hay cambios sin guardar y no está en proceso de envío, confirmar
        if (isDirty && !isSubmitting) {
            const confirmClose = window.confirm(
                '¿Estás seguro de que quieres cerrar? Los cambios no guardados se perderán.'
            );
            if (!confirmClose) return;
        }
        onClose();
    };

    // Solo crear handlers de submit si hay onSubmit y no hay footer customizado
    const hasCustomFooter = Boolean(customFooter);

    const handleSubmit = (e) => {
        e?.preventDefault();
        if (!hasCustomFooter && onSubmit && !disabled && !isSubmitting) {
            onSubmit();
        }
    };

    const handleKeyDown = (e) => {
        // Submit con Ctrl/Cmd + Enter (solo si no hay footer customizado)
        if (!hasCustomFooter && onSubmit && (e.ctrlKey || e.metaKey) && e.key === 'Enter' && !disabled && !isSubmitting) {
            e.preventDefault();
            onSubmit();
        }
    };

    // Usar footer customizado o crear footer por defecto
    const footer = customFooter || (
        <>
            {extraActions}
            <div className="flex-1" /> {/* Spacer */}
            <Button
                variant="secondary"
                onClick={handleClose}
                disabled={isSubmitting}
                className="min-w-[100px]"
            >
                {cancelText}
            </Button>
            <Button
                variant="primary"
                onClick={handleSubmit}
                isLoading={isSubmitting}
                disabled={disabled || isSubmitting}
                className="min-w-[120px]"
            >
                {submitText}
            </Button>
        </>
    );

    return (
        <ModernModal
            isOpen={isOpen}
            onClose={handleClose}
            title={title}
            size={size}
            variant={variant}
            footer={footer}
            icon={icon}
            maxHeight={maxHeight}
            closeOnBackdrop={!isDirty} // No cerrar con backdrop si hay cambios
        >
            <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
                {children}
            </form>

            {/* Hint de atajo de teclado (solo si no hay footer customizado) */}
            {!hasCustomFooter && !disabled && !isSubmitting && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                        💡 Tip: Presiona <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 text-xs font-mono">Ctrl+Enter</kbd> para guardar rápidamente
                    </p>
                </div>
            )}
        </ModernModal>
    );
};

export default FormModal;
