import React, { useState } from 'react';
import Modal from '../../../components/Modal';
import Select from 'react-select';
import { UserX } from 'lucide-react';
import toast from 'react-hot-toast';

const motivosOptions = [
    {
        label: "Motivos Financieros",
        options: [
            { value: 'Crédito Negado', label: 'Crédito Negado por el Banco' },
            { value: 'Subsidio Insuficiente', label: 'Subsidio Insuficiente o No Aprobado' }
        ]
    },
    {
        label: "Decisión del Cliente",
        options: [
            { value: 'Desistimiento Voluntario', label: 'Desistimiento Voluntario del Cliente' },
            { value: 'Cambio de Circunstancias Personales', label: 'Cambio en Circunstancias Personales' },
            { value: 'Encontró otra Propiedad', label: 'Encontró otra Propiedad' }
        ]
    },
    {
        label: "Motivos Operativos (Constructora)",
        options: [
            { value: 'Incumplimiento de Pagos', label: 'Incumplimiento en el Plan de Pagos' },
            { value: 'Retrasos en la Entrega', label: 'Retrasos en la Entrega de la Vivienda' },
            { value: 'Inconformidad con el Inmueble', label: 'Inconformidad con el Inmueble' }
        ]
    },
    {
        label: "Otro",
        options: [
            { value: 'Otro', label: 'Otro Motivo (Especificar abajo)' }
        ]
    }
];

const getTodayString = () => new Date().toISOString().split('T')[0];

const ModalMotivoRenuncia = ({ isOpen, onClose, onConfirm, cliente }) => {
    const [motivo, setMotivo] = useState(null);
    const [observacion, setObservacion] = useState('');
    const [fechaRenuncia, setFechaRenuncia] = useState(getTodayString());

    const handleConfirmar = () => {
        if (!motivo) {
            toast.error("Por favor, selecciona un motivo.");
            return;
        }
        if (motivo.value === 'Otro' && !observacion.trim()) {
            toast.error("Por favor, especifica el motivo en el campo de observación.");
            return;
        }
        if (!fechaRenuncia) {
            toast.error("Por favor, selecciona una fecha de renuncia.");
            return;
        }
        onConfirm(motivo.value, observacion, fechaRenuncia);
    };

    const minDate = cliente?.fechaCreacion ? cliente.fechaCreacion.split('T')[0] : null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Registrar Motivo de Renuncia"
            icon={<UserX size={28} className="text-orange-500" />}
        >
            <style>{`
                :root {
                  --color-bg-form: ${document.documentElement.classList.contains('dark') ? '#374151' : '#ffffff'};
                  --color-text-form: ${document.documentElement.classList.contains('dark') ? '#ffffff' : '#1f2937'};
                }
            `}</style>
            <div className="space-y-4">
                <p className="text-center text-gray-600 dark:text-gray-400 -mt-4 mb-4">
                    Estás iniciando el proceso de renuncia para el cliente <strong className='text-gray-800 dark:text-gray-200'>{cliente?.datosCliente?.nombres} {cliente?.datosCliente?.apellidos}</strong>.
                </p>
                <div>
                    <label className="block font-medium mb-1 dark:text-gray-200">Fecha de Renuncia</label>
                    <input
                        type="date"
                        value={fechaRenuncia}
                        onChange={(e) => setFechaRenuncia(e.target.value)}
                        min={minDate}
                        max={getTodayString()}
                        className="w-full border p-2 rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    />
                </div>
                <div>
                    <label className="block font-medium mb-1 dark:text-gray-200">Motivo Principal</label>
                    <Select
                        options={motivosOptions}
                        value={motivo}
                        onChange={setMotivo}
                        placeholder="Selecciona un motivo..."
                        styles={{
                            control: (base, state) => ({ ...base, backgroundColor: 'var(--color-bg-form)', borderColor: state.isFocused ? '#3b82f6' : '#4b5563' }),
                            singleValue: (base) => ({ ...base, color: 'var(--color-text-form)' }),
                            menu: (base) => ({ ...base, backgroundColor: 'var(--color-bg-form)' }),
                            option: (base, state) => ({ ...base, backgroundColor: state.isFocused ? '#2563eb' : 'var(--color-bg-form)', color: state.isFocused ? 'white' : 'var(--color-text-form)' }),
                            input: (base) => ({ ...base, color: 'var(--color-text-form)' }),
                        }}
                    />
                </div>

                {motivo?.value === 'Otro' && (
                    <div className='animate-fade-in'>
                        <label className="block font-medium mb-1 dark:text-gray-200">Especifica el motivo</label>
                        <textarea
                            value={observacion}
                            onChange={(e) => setObservacion(e.target.value)}
                            rows="3"
                            className="w-full border p-2 rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600"
                            placeholder="Detalla aquí la razón específica de la renuncia..."
                        />
                    </div>
                )}

                <div className="flex justify-end gap-4 pt-6 border-t dark:border-gray-700">
                    <button onClick={onClose} type="button" className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-6 py-2 rounded-lg transition">Cancelar</button>
                    <button onClick={handleConfirmar} disabled={!motivo} className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-lg disabled:bg-gray-300">
                        Continuar
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ModalMotivoRenuncia;