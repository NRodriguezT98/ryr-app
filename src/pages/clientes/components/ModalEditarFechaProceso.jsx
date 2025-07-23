import React, { useState, useEffect } from 'react';
import Modal from '../../../components/Modal';
import { Pencil, AlertCircle } from 'lucide-react';
import { parseDateAsUTC, formatDisplayDate } from '../../../utils/textFormatters';

const ModalEditarFechaProceso = ({ isOpen, onClose, onConfirm, pasoInfo }) => {
    const [nuevaFecha, setNuevaFecha] = useState('');
    const [motivo, setMotivo] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (pasoInfo) {
            setNuevaFecha(pasoInfo.data.fecha || '');
            setMotivo('');
            setError('');
        }
    }, [pasoInfo]);

    const handleConfirmar = () => {
        if (!motivo.trim()) {
            setError("El motivo del cambio es obligatorio.");
            return;
        }

        if (!nuevaFecha) {
            setError("Debes seleccionar una fecha válida.");
            return;
        }

        const fechaSeleccionada = parseDateAsUTC(nuevaFecha);
        const fechaMinima = parseDateAsUTC(pasoInfo.minDate);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        if (fechaSeleccionada > hoy) {
            setError("La fecha no puede ser futura.");
            return;
        }

        if (fechaSeleccionada < fechaMinima) {
            setError(`La fecha no puede ser anterior al último paso válido (${formatDisplayDate(pasoInfo.minDate)}).`);
            return;
        }

        setError('');
        onConfirm(pasoInfo.key, nuevaFecha, motivo);
    };

    const handleDateChange = (e) => {
        setNuevaFecha(e.target.value);
        if (error) setError('');
    };

    const handleMotivoChange = (e) => {
        setMotivo(e.target.value);
        if (error) setError('');
    };

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Editar Fecha y Motivo"
            icon={<Pencil size={28} className="text-blue-500" />}
        >
            <div className="space-y-6">
                <p className="text-center text-gray-600 dark:text-gray-400 -mt-4 mb-4">
                    Estás modificando el paso: <strong className='text-gray-800 dark:text-gray-200'>{pasoInfo.label}</strong>.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block font-medium mb-1 dark:text-gray-300" htmlFor="nuevaFecha">Nueva Fecha</label>
                        <input
                            type="date"
                            id="nuevaFecha"
                            value={nuevaFecha}
                            onChange={handleDateChange}
                            min={pasoInfo.minDate}
                            max={pasoInfo.maxDate}
                            className={`w-full border p-2.5 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white ${error && error.includes('fecha') ? 'border-red-500' : 'border-gray-300'}`}
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block font-medium mb-1 dark:text-gray-300" htmlFor="motivo">Motivo del Cambio (Obligatorio)</label>
                        <textarea
                            id="motivo"
                            value={motivo}
                            onChange={handleMotivoChange}
                            rows="3"
                            className={`w-full border p-2.5 rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white ${error && error.includes('motivo') ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Ej: Corrección de fecha por retraso en la notaría..."
                        />
                    </div>
                </div>

                {error && (
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm font-semibold">
                        <AlertCircle size={16} />
                        <p>{error}</p>
                    </div>
                )}

                <div className="flex justify-end gap-4 pt-6 border-t dark:border-gray-700">
                    <button onClick={onClose} type="button" className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-semibold px-6 py-2 rounded-lg transition">Cancelar</button>
                    <button onClick={handleConfirmar} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg">
                        Guardar Cambios
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ModalEditarFechaProceso;