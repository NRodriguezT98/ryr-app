// src/components/ModalConfirmacion.jsx

import React from 'react';
import ReactDOM from 'react-dom';
import { ArrowRight, AlertTriangle, Check, Info, Loader } from 'lucide-react';

// Configuramos los estilos para cada tipo de modal
const THEMES = {
    warning: {
        icon: AlertTriangle,
        iconColor: 'text-red-600 dark:text-red-400',
        iconBg: 'bg-red-100 dark:bg-red-900/50',
        buttonClass: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    },
    info: {
        icon: Info,
        iconColor: 'text-blue-600 dark:text-blue-400',
        iconBg: 'bg-blue-100 dark:bg-blue-900/50',
        buttonClass: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
    },
    success: {
        icon: Check,
        iconColor: 'text-green-600 dark:text-green-400',
        iconBg: 'bg-green-100 dark:bg-green-900/50',
        buttonClass: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
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
    type = 'warning' // 'warning', 'info', or 'success'
}) => {
    if (!isOpen) {
        return null;
    }

    const theme = THEMES[type] || THEMES.warning;
    const IconComponent = theme.icon;
    const hasCambios = cambios.length > 0;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg mx-4 flex flex-col transform transition-all">

                {/* Encabezado */}
                <div className="p-6">
                    <div className="sm:flex sm:items-start">
                        <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${theme.iconBg} sm:mx-0 sm:h-10 sm:w-10`}>
                            <IconComponent className={`h-6 w-6 ${theme.iconColor}`} aria-hidden="true" />
                        </div>
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                            <h3 className="text-lg leading-6 font-bold text-gray-900 dark:text-gray-100" id="modal-title">
                                {titulo}
                            </h3>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {hasCambios ? "Por favor, revisa y confirma los siguientes cambios:" : mensaje}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cuerpo con la lista de cambios */}
                {hasCambios && (
                    <div className="px-6 pb-4 max-h-60 overflow-y-auto">
                        <div className="space-y-2">
                            {cambios.map((cambio, index) => (
                                <div key={index} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border dark:border-gray-200 dark:border-gray-700">
                                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">{cambio.campo}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500 dark:text-gray-400 line-through truncate" title={String(cambio.anterior)}>
                                            {String(cambio.anterior) || 'Vacío'}
                                        </span>
                                        <ArrowRight className="w-4 h-4 text-gray-400 mx-3 flex-shrink-0" />
                                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate" title={String(cambio.actual)}>
                                            {String(cambio.actual) || 'Vacío'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Pie con los botones */}
                <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 sm:flex sm:flex-row-reverse rounded-b-lg">
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isSubmitting}
                        className={`w-full inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${theme.buttonClass} sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {isSubmitting ? <Loader size={20} className="animate-spin" /> : <Check size={20} />}
                        <span className="ml-2">{isSubmitting ? 'Procesando...' : 'Confirmar'}</span>
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>,
        document.getElementById('modal-portal')
    );
};

export default ModalConfirmacion;