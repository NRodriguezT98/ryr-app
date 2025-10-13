// src/components/modals/DetailModal.jsx
// Modal optimizada para mostrar detalles e información

import React from 'react';
import ModernModal from './ModernModal';
import Button from '../Button';
import { X } from 'lucide-react';

/**
 * DetailModal - Modal para mostrar información detallada
 * 
 * Perfect for:
 * - Ver detalles de un registro
 * - Mostrar auditoría
 * - Preview de documentos
 * - Información read-only
 * 
 * @param {boolean} isOpen - Estado de visibilidad
 * @param {function} onClose - Callback al cerrar
 * @param {string} title - Título del modal
 * @param {React.ReactNode} icon - Icono del header
 * @param {React.ReactNode} children - Contenido
 * @param {string} size - Tamaño del modal
 * @param {string} variant - Variante visual
 * @param {React.ReactNode} actions - Acciones personalizadas en footer
 * @param {boolean} showFooter - Mostrar footer (por defecto true si hay actions)
 * @param {string} closeText - Texto del botón cerrar
 */
const DetailModal = ({
    isOpen,
    onClose,
    title,
    icon,
    children,
    size = '2xl',
    variant = 'default',
    actions,
    showFooter = true,
    closeText = 'Cerrar'
}) => {
    const footer = showFooter ? (
        <>
            {actions}
            <div className="flex-1" /> {/* Spacer */}
            <Button
                variant="secondary"
                onClick={onClose}
                icon={<X size={16} />}
            >
                {closeText}
            </Button>
        </>
    ) : null;

    return (
        <ModernModal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            size={size}
            variant={variant}
            footer={footer}
            icon={icon}
            maxHeight="max-h-[calc(100vh-10rem)]"
        >
            {children}
        </ModernModal>
    );
};

/**
 * DetailSection - Componente helper para secciones dentro del DetailModal
 */
export const DetailSection = ({ title, icon, children, className = '' }) => (
    <div className={`space-y-3 ${className}`}>
        {title && (
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                {icon && <div className="text-blue-600 dark:text-blue-400">{icon}</div>}
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                    {title}
                </h4>
            </div>
        )}
        <div className="space-y-2">
            {children}
        </div>
    </div>
);

/**
 * DetailRow - Componente helper para filas de información
 */
export const DetailRow = ({ label, value, icon, valueClassName = '' }) => (
    <div className="flex items-start gap-3 py-2">
        {icon && (
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center text-gray-600 dark:text-gray-400">
                {icon}
            </div>
        )}
        <div className="flex-1 min-w-0">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {label}
            </dt>
            <dd className={`text-base text-gray-900 dark:text-gray-100 ${valueClassName}`}>
                {value || <span className="text-gray-400 dark:text-gray-500 italic">No especificado</span>}
            </dd>
        </div>
    </div>
);

/**
 * DetailGrid - Layout en grid para DetailModal
 */
export const DetailGrid = ({ children, cols = 2 }) => (
    <div className={`grid grid-cols-1 ${cols === 2 ? 'md:grid-cols-2' : `md:grid-cols-${cols}`} gap-6`}>
        {children}
    </div>
);

export default DetailModal;
