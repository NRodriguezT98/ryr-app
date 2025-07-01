import React from 'react';
import ReactDOM from 'react-dom'; // <-- IMPORTAMOS ReactDOM para usar el portal
import { ArrowRight } from 'lucide-react';

const ModalConfirmacionCambios = ({ isOpen, onClose, onConfirm, titulo, cambios, isSaving }) => {
    if (!isOpen) return null;

    // Usamos ReactDOM.createPortal para renderizar este modal en el #modal-portal
    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] animate-fade-in">
            <div className="bg-white p-7 rounded-2xl shadow-2xl max-w-md w-full mx-4 flex flex-col">
                <h3 className="text-xl font-bold text-center mb-4 text-gray-800">{titulo}</h3>
                <p className="text-center text-gray-500 mb-6">Por favor, revisa y confirma los siguientes cambios:</p>

                <div className="bg-gray-50 p-4 rounded-lg mb-6 max-h-60 overflow-y-auto">
                    <ul className="space-y-3">
                        {cambios.map((cambio, index) => (
                            <li key={index} className="text-sm">
                                <strong className="font-semibold text-gray-700 block mb-1">{cambio.campo}:</strong>
                                <div className="flex items-center justify-between bg-white p-2 rounded-md border">
                                    <span className="text-red-600 bg-red-100 px-2 py-1 rounded-md text-xs font-mono truncate" title={cambio.anterior}>
                                        {cambio.anterior || 'Vacío'}
                                    </span>
                                    <ArrowRight className="w-4 h-4 text-gray-400 mx-2 flex-shrink-0" />
                                    <span className="text-green-700 bg-green-100 px-2 py-1 rounded-md text-xs font-mono truncate" title={cambio.actual}>
                                        {cambio.actual || 'Vacío'}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="flex justify-end gap-4 mt-auto">
                    <button
                        onClick={onClose}
                        disabled={isSaving}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-5 py-2 rounded-lg transition-colors duration-200 disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isSaving}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded-lg shadow-md transition-colors duration-200 disabled:bg-gray-400"
                    >
                        {isSaving ? 'Guardando...' : 'Confirmar y Guardar'}
                    </button>
                </div>
            </div>
        </div>,
        document.getElementById('modal-portal') // <-- Le decimos dónde renderizarse
    );
};

export default ModalConfirmacionCambios;