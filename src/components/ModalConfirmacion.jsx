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
    type = 'info',
    size = 'lg',
    disabled = false
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
                disabled={disabled || isSubmitting}
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
            size={size}
            footer={footerContent}
            icon={<IconComponent className={`h-6 w-6 ${theme.iconColor}`} aria-hidden="true" />}
        >
            <div className="text-left">
                {/* Cambiamos la etiqueta <p> por <div> para permitir contenido complejo */}
                <div className="text-base text-gray-600 dark:text-gray-300">
                    {hasCambios ? <p>Por favor, revisa y confirma los siguientes cambios:</p> : mensaje}
                </div>

                {hasCambios && (
                    <div className="mt-4 space-y-3 max-h-72 overflow-y-auto pr-2 text-left bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border dark:border-gray-200 dark:border-gray-700">
                        {cambios.map((cambio, index) => (
                            <div key={index} className="p-2 border-b border-gray-200 dark:border-gray-600 last:border-b-0 animate-fade-in">
                                <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{cambio.campo}</p>
                                <div className="mt-1 flex flex-col items-start sm:flex-row sm:items-center sm:justify-between gap-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-red-600 dark:text-red-400">ANTES:</span>
                                        <span className="text-sm text-gray-500 dark:text-gray-400 line-through">{String(cambio.anterior) || 'Vacío'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-green-600 dark:text-green-400">AHORA:</span>
                                        <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{String(cambio.actual) || 'Vacío'}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default ModalConfirmacion;