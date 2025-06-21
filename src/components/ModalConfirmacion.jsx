import React from 'react';

/**
 * Un modal reutilizable para confirmar acciones peligrosas como eliminar.
 * @param {object} props
 * @param {boolean} props.isOpen - Controla si el modal está visible.
 * @param {function} props.onClose - Función a llamar para cerrar el modal (botón Cancelar).
 * @param {function} props.onConfirm - Función a llamar cuando se confirma la acción.
 * @param {string} props.titulo - El título del modal.
 * @param {string|React.ReactNode} props.mensaje - El cuerpo o mensaje del modal.
 */
const ModalConfirmacion = ({ isOpen, onClose, onConfirm, titulo, mensaje }) => {
    if (!isOpen) {
        return null;
    }

    return (
        // Overlay que cubre toda la pantalla
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
            {/* Contenedor del Modal */}
            <div className="bg-white p-7 rounded-2xl shadow-2xl max-w-sm w-full mx-4">
                <h3 className="text-xl font-bold text-center mb-4 text-red-600">{titulo}</h3>
                <div className="text-center mb-8 text-gray-700">
                    {mensaje}
                </div>
                <div className="flex justify-end gap-4">
                    <button
                        onClick={onClose}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-5 py-2 rounded-full transition-colors duration-200"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2 rounded-full shadow-md transition-colors duration-200"
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalConfirmacion;