// src/pages/viviendas/components/ConfirmacionEliminarVivienda.jsx
import React, { useState, useEffect } from 'react';
import { AlertTriangle, Home, Building2 } from 'lucide-react';

const ConfirmacionEliminarVivienda = ({ datosParaEliminar, onValidationChange }) => {
    const [confirmText, setConfirmText] = useState('');

    // Cada vez que el componente se renderiza, comunicamos si la validación pasa o no.
    useEffect(() => {
        const shouldBeDisabled = confirmText !== 'ELIMINAR';

        onValidationChange(shouldBeDisabled);
    }, [confirmText, onValidationChange]);

    if (!datosParaEliminar) return null;

    return (
        <div className="text-sm text-left text-gray-500 dark:text-gray-400 space-y-4">
            <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                    <h4 className="font-bold text-red-800 dark:text-red-200">Esta acción es permanente e irreversible.</h4>
                    <p className="text-red-700 dark:text-red-300">Toda la información asociada a esta vivienda será eliminada.</p>
                </div>
            </div>

            <div className="my-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Se eliminará la siguiente vivienda:</p>
                <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-2">
                        <Home size={14} className="text-gray-500" />
                        <span className="font-semibold text-gray-600 dark:text-gray-300">
                            Vivienda: {`Mz ${datosParaEliminar.vivienda.manzana} - Casa ${datosParaEliminar.vivienda.numeroCasa}`}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Building2 size={14} className="text-gray-500" />
                        <span className="font-semibold text-gray-600 dark:text-gray-300">
                            Del Proyecto: {datosParaEliminar.nombreProyecto}
                        </span>
                    </div>
                </div>
            </div>

            <div>
                <label htmlFor="confirm-delete-input" className="block font-semibold text-gray-700 dark:text-gray-200">
                    Para confirmar, escribe <span className="font-bold text-red-500">ELIMINAR</span> abajo:
                </label>
                <input
                    id="confirm-delete-input"
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-900 rounded-lg text-center font-bold tracking-widest"
                    autoComplete="off"
                />
            </div>
        </div>
    );
};

export default ConfirmacionEliminarVivienda;