import React, { useState, useEffect } from 'react';
import Modal from '../../../components/Modal';
import { Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import { parseDateAsUTC, formatDisplayDate } from '../../../utils/textFormatters';

const ModalEditarFechaProceso = ({ isOpen, onClose, onConfirm, pasoInfo }) => {
    const [nuevaFecha, setNuevaFecha] = useState('');
    const [motivo, setMotivo] = useState('');
    // --- INICIO DE LA MODIFICACIÓN ---
    // 1. Añadimos un estado para manejar el error del formulario
    const [errorFecha, setErrorFecha] = useState(null);
    // --- FIN DE LA MODIFICACIÓN ---

    useEffect(() => {
        if (pasoInfo) {
            setNuevaFecha(pasoInfo.fecha);
            setMotivo('');
            setErrorFecha(null); // Limpiamos errores al abrir el modal
        }
    }, [pasoInfo]);

    // Al cambiar la fecha, limpiamos el error para que el usuario pueda corregir
    const handleFechaChange = (e) => {
        setNuevaFecha(e.target.value);
        if (errorFecha) {
            setErrorFecha(null);
        }
    };

    const handleConfirmar = () => {
        // Validamos el motivo primero
        if (!motivo.trim()) {
            toast.error("Debes especificar un motivo para el cambio.");
            return;
        }

        // --- INICIO DE LA LÓGICA DE VALIDACIÓN ---
        if (!nuevaFecha) {
            setErrorFecha("Debes seleccionar una fecha válida.");
            return;
        }

        const fechaSeleccionada = parseDateAsUTC(nuevaFecha);
        const fechaMinima = parseDateAsUTC(pasoInfo.minDate);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        if (fechaSeleccionada > hoy) {
            setErrorFecha("La fecha no puede ser futura.");
            return;
        }

        if (fechaSeleccionada < fechaMinima) {
            setErrorFecha(`La fecha no puede ser anterior al ${formatDisplayDate(pasoInfo.minDate)}.`);
            return;
        }
        // --- FIN DE LA LÓGICA DE VALIDACIÓN ---

        // Si todo es válido, limpiamos cualquier error y confirmamos
        setErrorFecha(null);
        onConfirm(pasoInfo.key, nuevaFecha, motivo);
    };

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Editar Fecha del Paso"
            icon={<Pencil size={28} className="text-blue-500" />}
        >
            <div className="space-y-6">
                <p className="text-center text-gray-600 -mt-4">
                    Estás modificando el paso: <strong className='text-gray-800'>{pasoInfo.label}</strong>
                </p>
                <div>
                    <label className="block font-medium mb-1">Nueva Fecha</label>
                    <input
                        type="date"
                        value={nuevaFecha}
                        onChange={handleFechaChange} // Usamos el nuevo handler
                        min={pasoInfo.minDate}
                        max={pasoInfo.maxDate}
                        // Aplicamos un borde rojo si hay error
                        className={`w-full border p-2.5 rounded-lg ${errorFecha ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {/* Mostramos el mensaje de error directamente debajo del input */}
                    {errorFecha && <p className="text-red-600 text-sm mt-1">{errorFecha}</p>}
                </div>
                <div>
                    <label className="block font-medium mb-1">Motivo del Cambio (Obligatorio)</label>
                    <textarea
                        value={motivo}
                        onChange={(e) => setMotivo(e.target.value)}
                        rows="3"
                        className="w-full border p-2.5 rounded-lg text-sm"
                        placeholder="Ej: Corrección de error de digitación, retraso en la entrega de documentos por parte del cliente, etc."
                    />
                </div>
                <div className="flex justify-end gap-4 pt-6 border-t">
                    <button onClick={onClose} type="button" className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-6 py-2 rounded-lg transition">Cancelar</button>
                    <button onClick={handleConfirmar} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg">
                        Guardar Cambios
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ModalEditarFechaProceso;