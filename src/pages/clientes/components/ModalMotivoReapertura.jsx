// src/pages/clientes/components/ModalMotivoReapertura.jsx

import React, { useState, useEffect } from 'react';
// Asegúrate de tener 'lucide-react' instalado o importa un ícono similar
import { AlertTriangle } from 'lucide-react';
// Asegúrate que la ruta a tu componente Modal genérico sea correcta
import Modal from '../../../components/Modal';
import Button from '../../../components/Button';

const ModalMotivoReapertura = ({ isOpen, onClose, onConfirm, titulo, nombrePaso }) => {
    const [motivo, setMotivo] = useState('');
    const MIN_CHARS = 15;
    const MAX_CHARS = 250;

    useEffect(() => {
        if (isOpen) {
            setMotivo(''); // Resetea el motivo cada vez que se abre el modal
        }
    }, [isOpen]);

    const handleConfirm = () => {
        onConfirm(motivo);
        onClose();
    };

    const isConfirmDisabled = motivo.trim().length < MIN_CHARS;
    const charsLeftColor = motivo.length > MAX_CHARS ? 'text-red-500' : 'text-gray-400';

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            {/* Contenedor principal con división estructural */}
            <div className="flex flex-col">

                {/* 1. Encabezado de Alerta */}
                <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-t-lg">
                    <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                            <AlertTriangle className="w-6 h-6 text-yellow-500 dark:text-yellow-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{titulo}</h3>
                            <p className="text-sm text-yellow-800 dark:text-yellow-300">
                                Esta es una acción importante y quedará registrada.
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2. Cuerpo del Modal */}
                <div className="p-6 space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Estás a punto de reabrir el paso: <strong>{nombrePaso}</strong>. Por favor, explica claramente el motivo de esta acción.
                    </p>

                    <div>
                        <label htmlFor="motivo-reapertura" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Motivo (obligatorio)
                        </label>
                        <textarea
                            id="motivo-reapertura"
                            value={motivo}
                            onChange={(e) => setMotivo(e.target.value)}
                            rows={4}
                            maxLength={MAX_CHARS}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-500 transition"
                            placeholder="Ej: El cliente solicitó un cambio en la cláusula 4. Se debe reemplazar el documento..."
                        />
                        <div className="mt-1 flex justify-between items-center text-xs">
                            {isConfirmDisabled && isOpen
                                ? <span className="text-yellow-600 dark:text-yellow-400">Mínimo {MIN_CHARS} caracteres.</span>
                                : <span>&nbsp;</span> // Espacio para evitar que el layout salte
                            }
                            <span className={charsLeftColor}>{motivo.length} / {MAX_CHARS}</span>
                        </div>
                    </div>
                </div>

                {/* 3. Pie de Página con Acciones */}
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 rounded-b-lg flex justify-end gap-3 border-t dark:border-gray-700">
                    <Button variant="secondary" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleConfirm}
                        disabled={isConfirmDisabled}
                    >
                        Confirmar Reapertura
                    </Button>
                </div>

            </div>
        </Modal>
    );
};

export default ModalMotivoReapertura;