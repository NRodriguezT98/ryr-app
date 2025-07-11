import React from 'react';
import ReactDOM from 'react-dom';
import { ArrowRight, AlertTriangle } from 'lucide-react';

/**
 * Un modal de confirmación unificado que puede mostrar un mensaje simple o una lista detallada de cambios.
 * @param {object} props
 * @param {boolean} props.isOpen - Controla si el modal está abierto.
 * @param {function} props.onClose - Función para cerrar el modal.
 * @param {function} props.onConfirm - Función que se ejecuta al confirmar.
 * @param {string} props.titulo - El título del modal.
 * @param {string} [props.mensaje] - Un mensaje simple (opcional). Se usa si no hay 'cambios'.
 * @param {Array} [props.cambios] - Array de objetos de cambio para mostrar en detalle (opcional).
 * @param {boolean} [props.isSubmitting] - Controla el estado de carga del botón de confirmación.
 */
const ModalConfirmacion = ({
    isOpen,
    onClose,
    onConfirm,
    titulo,
    mensaje,
    cambios = [],
    isSubmitting = false
}) => {
    if (!isOpen) {
        return null;
    }

    const hasCambios = cambios.length > 0;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] animate-fade-in">
            <div className="bg-white p-7 rounded-2xl shadow-2xl max-w-md w-full mx-4 flex flex-col">
                <div className="flex flex-col items-center text-center mb-4">
                    <AlertTriangle className="w-12 h-12 text-red-500 mb-3" />
                    <h3 className="text-xl font-bold text-gray-800">{titulo}</h3>
                </div>

                {hasCambios ? (
                    <>
                        <p className="text-center text-gray-500 mb-6">Por favor, revisa y confirma los siguientes cambios:</p>
                        <div className="bg-gray-50 p-4 rounded-lg mb-6 max-h-60 overflow-y-auto">
                            <ul className="space-y-3">
                                {cambios.map((cambio, index) => (
                                    <li key={index} className="text-sm">
                                        <strong className="font-semibold text-gray-700 block mb-1">{cambio.campo}:</strong>
                                        <div className="flex items-center justify-between bg-white p-2 rounded-md border">
                                            <span className="text-red-600 bg-red-100 px-2 py-1 rounded-md text-xs font-mono truncate" title={String(cambio.anterior)}>
                                                {String(cambio.anterior) || 'Vacío'}
                                            </span>
                                            <ArrowRight className="w-4 h-4 text-gray-400 mx-2 flex-shrink-0" />
                                            <span className="text-green-700 bg-green-100 px-2 py-1 rounded-md text-xs font-mono truncate" title={String(cambio.actual)}>
                                                {String(cambio.actual) || 'Vacío'}
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </>
                ) : (
                    <p className="text-center text-gray-700 mb-8">{mensaje}</p>
                )}

                <div className="flex justify-end gap-4 mt-auto">
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-5 py-2 rounded-lg transition-colors duration-200 disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isSubmitting}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2 rounded-lg shadow-md transition-colors duration-200 disabled:bg-gray-400"
                    >
                        {isSubmitting ? 'Procesando...' : 'Confirmar'}
                    </button>
                </div>
            </div>
        </div>,
        document.getElementById('modal-portal')
    );
};

export default ModalConfirmacion;