import React, { useState, useEffect } from 'react';
import Modal from '../../../components/Modal';
import { Pencil } from 'lucide-react';
import toast from 'react-hot-toast';

const ModalEditarFechaProceso = ({ isOpen, onClose, onConfirm, pasoInfo }) => {
    const [nuevaFecha, setNuevaFecha] = useState('');
    const [motivo, setMotivo] = useState('');

    useEffect(() => {
        if (pasoInfo) {
            setNuevaFecha(pasoInfo.fecha);
            setMotivo(''); // Reiniciar motivo cada vez que se abre
        }
    }, [pasoInfo]);

    const handleConfirmar = () => {
        if (!motivo.trim()) {
            toast.error("Debes especificar un motivo para el cambio.");
            return;
        }
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
                        onChange={(e) => setNuevaFecha(e.target.value)}
                        min={pasoInfo.minDate}
                        max={pasoInfo.maxDate}
                        className="w-full border p-2.5 rounded-lg"
                    />
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