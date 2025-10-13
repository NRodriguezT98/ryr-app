// src/components/modals/ConfirmModal.jsx
// Modal de confirmación optimizada y moderna

import React from 'react';
import { AlertTriangle, Info, CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import ModernModal from './ModernModal';
import Button from '../Button';

const CONFIRM_TYPES = {
    danger: {
        icon: AlertTriangle,
        iconBg: 'bg-red-100 dark:bg-red-900/30',
        iconColor: 'text-red-600 dark:text-red-400',
        variant: 'danger',
        confirmVariant: 'danger'
    },
    warning: {
        icon: AlertTriangle,
        iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
        iconColor: 'text-yellow-600 dark:text-yellow-400',
        variant: 'warning',
        confirmVariant: 'warning'
    },
    info: {
        icon: Info,
        iconBg: 'bg-blue-100 dark:bg-blue-900/30',
        iconColor: 'text-blue-600 dark:text-blue-400',
        variant: 'primary',
        confirmVariant: 'primary'
    },
    success: {
        icon: CheckCircle,
        iconBg: 'bg-green-100 dark:bg-green-900/30',
        iconColor: 'text-green-600 dark:text-green-400',
        variant: 'success',
        confirmVariant: 'success'
    },
    question: {
        icon: HelpCircle,
        iconBg: 'bg-purple-100 dark:bg-purple-900/30',
        iconColor: 'text-purple-600 dark:text-purple-400',
        variant: 'primary',
        confirmVariant: 'primary'
    }
};

/**
 * ConfirmModal - Modal de confirmación moderna
 * 
 * @param {boolean} isOpen - Estado de visibilidad
 * @param {function} onClose - Callback al cancelar
 * @param {function} onConfirm - Callback al confirmar
 * @param {string} title - Título del modal
 * @param {string|React.ReactNode} message - Mensaje principal
 * @param {string} type - Tipo de confirmación (danger, warning, info, success, question)
 * @param {string} confirmText - Texto del botón confirmar
 * @param {string} cancelText - Texto del botón cancelar
 * @param {boolean} isSubmitting - Estado de carga
 * @param {boolean} disabled - Deshabilitar confirmación
 * @param {string} size - Tamaño del modal
 * @param {React.ReactNode} extraContent - Contenido adicional (ej: lista de cambios)
 */
const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    type = 'info',
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    isSubmitting = false,
    disabled = false,
    size = 'md',
    extraContent
}) => {
    const config = CONFIRM_TYPES[type] || CONFIRM_TYPES.info;
    const Icon = config.icon;

    const footer = (
        <>
            <Button
                variant="secondary"
                onClick={onClose}
                disabled={isSubmitting}
                className="min-w-[100px]"
            >
                {cancelText}
            </Button>
            <Button
                variant={config.confirmVariant}
                onClick={onConfirm}
                isLoading={isSubmitting}
                disabled={disabled || isSubmitting}
                className="min-w-[100px]"
            >
                {confirmText}
            </Button>
        </>
    );

    return (
        <ModernModal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            size={size}
            variant={config.variant}
            footer={footer}
            icon={
                <div className={`w-10 h-10 rounded-xl ${config.iconBg} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${config.iconColor}`} />
                </div>
            }
        >
            <div className="space-y-4">
                {/* Mensaje principal */}
                <div className="text-base text-gray-700 dark:text-gray-300">
                    {typeof message === 'string' ? (
                        <p className="leading-relaxed">{message}</p>
                    ) : (
                        message
                    )}
                </div>

                {/* Contenido extra (ej: lista de cambios, warnings, etc) */}
                {extraContent && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        {extraContent}
                    </div>
                )}
            </div>
        </ModernModal>
    );
};

export default ConfirmModal;
