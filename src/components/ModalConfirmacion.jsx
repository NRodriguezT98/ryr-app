import React from 'react';
import ReactDOM from 'react-dom';

const ModalConfirmacion = ({ isOpen, onClose, onConfirm, titulo, mensaje, isSubmitting = false }) => {
    if (!isOpen) {
        return null;
    }

    // Usamos un portal para asegurar que el modal siempre se renderice en la capa superior
    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] animate-fade-in">
            <div className="bg-white p-7 rounded-2xl shadow-2xl max-w-sm w-full mx-4 flex flex-col">
                <h3 className="text-xl font-bold text-center mb-4 text-red-600">{titulo}</h3>

                <div className="text-center mb-8 text-gray-700 overflow-y-auto">
                    <p>{mensaje}</p>
                </div>

                <div className="flex justify-end gap-4 mt-auto">
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-5 py-2 rounded-full transition-colors duration-200 disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isSubmitting}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2 rounded-full shadow-md transition-colors duration-200 disabled:bg-gray-400"
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