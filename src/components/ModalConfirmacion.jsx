// src/components/ModalConfirmacion.jsx (CÓDIGO FINAL Y VERIFICADO)
import React from 'react';
import { ArrowRight, AlertTriangle, Check, Info } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

const THEMES = {
    warning: {
        icon: AlertTriangle,
        iconColor: 'text-red-600 dark:text-red-400',
        iconBg: 'bg-red-100 dark:bg-red-900/50',
        buttonVariant: 'danger',
    },
    info: {
        icon: Info,
        iconColor: 'text-blue-600 dark:text-blue-400',
        iconBg: 'bg-blue-100 dark:bg-blue-900/50',
        buttonVariant: 'primary',
    },
    success: {
        icon: Check,
        iconColor: 'text-green-600 dark:text-green-400',
        iconBg: 'bg-green-100 dark:bg-green-900/50',
        buttonVariant: 'success',
    }
};

const ModalConfirmacion = ({
    isOpen,
    onClose,
    onConfirm,
    titulo,
    mensaje,
    cambios = [],
    isSubmitting = false,
    type = 'info'
}) => {
    if (!isOpen) {
        return null;
    }

    const theme = THEMES[type] || THEMES.warning;
    const IconComponent = theme.icon;
    const hasCambios = cambios.length > 0;

    const footerContent = (
        <>
            <Button variant="secondary" onClick={onClose} disabled={isSubmitting} className="w-auto px-6">
                Cancelar
            </Button>
            <Button
                variant={theme.buttonVariant}
                onClick={onConfirm}
                isLoading={isSubmitting}
                loadingText="Procesando..."
                className="w-auto px-6"
            >
                Confirmar
            </Button>
        </>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={titulo}
            size="md"
            footer={footerContent}
            icon={<IconComponent className={`h-6 w-6 ${theme.iconColor}`} aria-hidden="true" />}
        >
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {hasCambios ? "Por favor, revisa y confirma los siguientes cambios:" : mensaje}
            </p>

            {hasCambios && (
                <div className="mt-4 space-y-2 max-h-60 overflow-y-auto pr-2 text-left bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border dark:border-gray-200 dark:border-gray-700">
                    {cambios.map((cambio, index) => (
                        <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between animate-fade-in">
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{cambio.campo}</p>
                            <div className="flex items-center gap-2 mt-1 sm:mt-0">
                                <span className="text-sm text-gray-500 dark:text-gray-400 line-through truncate" title={String(cambio.anterior)}>
                                    {String(cambio.anterior) || 'Vacío'}
                                </span>
                                <ArrowRight className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                <span className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate" title={String(cambio.actual)}>
                                    {String(cambio.actual) || 'Vacío'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Modal>
    );
};

export default ModalConfirmacion;