import React from 'react';

const ModalConfirmacion = ({ isOpen, onClose, onConfirm, titulo, mensaje }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
            {/* --- LÍNEA MODIFICADA --- */}
            <div className="bg-white p-7 rounded-2xl shadow-2xl max-w-sm w-full mx-4 flex flex-col max-h-[90vh]">
                <h3 className="text-xl font-bold text-center mb-4 text-red-600">{titulo}</h3>

                {/* El div del mensaje ahora se encarga del scroll si es necesario */}
                <div className="text-center mb-8 text-gray-700 overflow-y-auto">
                    {mensaje}
                </div>

                {/* mt-auto empuja los botones al final si el contenido es corto */}
                <div className="flex justify-end gap-4 mt-auto">
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