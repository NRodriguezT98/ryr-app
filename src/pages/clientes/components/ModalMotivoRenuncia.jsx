import React, { useState } from 'react';
import Modal from '../../../components/Modal';
import Select from 'react-select';
import { UserX } from 'lucide-react';
import toast from 'react-hot-toast';

// --- LISTA DE MOTIVOS ACTUALIZADA Y ESTRATÉGICA ---
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

const ModalMotivoRenuncia = ({ isOpen, onClose, onConfirm, cliente }) => {
    const [motivo, setMotivo] = useState(null);
    const [observacion, setObservacion] = useState('');

    const handleConfirmar = () => {
        if (!motivo) {
            toast.error("Por favor, selecciona un motivo.");
            return;
        }
        if (motivo.value === 'Otro' && !observacion.trim()) {
            toast.error("Por favor, especifica el motivo en el campo de observación.");
            return;
        }
        onConfirm(motivo.value, observacion);
    };

    const portalStyles = {
        menuPortal: base => ({ ...base, zIndex: 9999 })
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Registrar Motivo de Renuncia"
            icon={<UserX size={28} className="text-orange-500" />}
        >
            <div className="space-y-4">
                <p className="text-center text-gray-600 -mt-4 mb-4">
                    Estás iniciando el proceso de renuncia para el cliente <strong className='text-gray-800'>{cliente?.datosCliente?.nombres} {cliente?.datosCliente?.apellidos}</strong>.
                </p>
                <div>
                    <label className="block font-medium mb-1">Motivo Principal</label>
                    <Select
                        options={motivosOptions}
                        value={motivo}
                        onChange={setMotivo}
                        placeholder="Selecciona un motivo..."
                        menuPortalTarget={document.body}
                        styles={portalStyles}
                    />
                </div>

                {motivo?.value === 'Otro' && (
                    <div className='animate-fade-in'>
                        <label className="block font-medium mb-1">Por favor, especifica el motivo</label>
                        <textarea
                            value={observacion}
                            onChange={(e) => setObservacion(e.target.value)}
                            rows="3"
                            className="w-full border p-2 rounded-lg text-sm"
                            placeholder="Detalla aquí la razón específica de la renuncia..."
                        />
                    </div>
                )}

                <div className="flex justify-end gap-4 pt-6 border-t">
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