import React, { useState, useMemo, useEffect } from 'react';
import Modal from '../../../components/Modal';
import Select from 'react-select';
import { UserX, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from '../../../hooks/useForm';
import { updateRenuncia } from '../../../utils/storage';

const motivosOptions = [
    { value: 'Crédito Negado', label: 'Crédito Negado por el Banco' },
    { value: 'Subsidio Insuficiente', label: 'Subsidio Insuficiente o No Aprobado' },
    { value: 'Motivos Personales', label: 'Motivos Personales del Cliente' },
    { value: 'Incumplimiento de Pagos', label: 'Incumplimiento en el Plan de Pagos' },
    { value: 'Otro', label: 'Otro Motivo...' }
];

const ModalEditarRenuncia = ({ isOpen, onClose, onSave, renuncia }) => {

    const initialState = useMemo(() => ({
        motivo: renuncia?.motivo || '',
        observacion: renuncia?.observacion || ''
    }), [renuncia]);

    const { formData, setFormData, handleInputChange, handleSubmit, isSubmitting } = useForm({
        initialState,
        onSubmit: async (data) => {
            try {
                await updateRenuncia(renuncia.id, data);
                toast.success('Motivo de renuncia actualizado.');
                onSave();
                onClose();
            } catch (error) {
                toast.error('No se pudo actualizar el motivo.');
                console.error("Error al editar renuncia:", error);
            }
        }
    });

    useEffect(() => {
        if (isOpen) {
            setFormData(initialState);
        }
    }, [isOpen, initialState, setFormData]);

    const portalStyles = {
        menuPortal: base => ({ ...base, zIndex: 9999 })
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Editar Motivo de Renuncia"
            icon={<Edit size={28} className="text-orange-500" />}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-center text-gray-600 -mt-4 mb-4">
                    Estás editando la renuncia de <strong className='text-gray-800'>{renuncia.clienteNombre}</strong>.
                </p>
                <div>
                    <label className="block font-medium mb-1">Motivo Principal</label>
                    <Select
                        options={motivosOptions}
                        value={motivosOptions.find(opt => opt.value === formData.motivo) || null}
                        onChange={(opt) => handleInputChange({ target: { name: 'motivo', value: opt.value } })}
                        placeholder="Selecciona un motivo..."
                        menuPortalTarget={document.body}
                        styles={portalStyles}
                    />
                </div>

                {formData.motivo === 'Otro' && (
                    <div className='animate-fade-in'>
                        <label className="block font-medium mb-1">Por favor, especifica el motivo</label>
                        <textarea
                            name="observacion"
                            value={formData.observacion}
                            onChange={handleInputChange}
                            rows="3"
                            className="w-full border p-2 rounded-lg text-sm"
                            placeholder="Detalla aquí la razón específica de la renuncia..."
                        />
                    </div>
                )}

                <div className="flex justify-end gap-4 pt-6 border-t">
                    <button onClick={onClose} type="button" className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-6 py-2 rounded-lg transition">Cancelar</button>
                    <button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg disabled:bg-gray-300">
                        {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default ModalEditarRenuncia;