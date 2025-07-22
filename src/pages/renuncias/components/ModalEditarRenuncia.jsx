import React, { useMemo, useEffect } from 'react';
// --- INICIO DE LA CORRECCIÓN ---
import Modal from '../../../components/Modal.jsx'; // Se añade la extensión .jsx explícitamente
// --- FIN DE LA CORRECCIÓN ---
import Select from 'react-select';
import { Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from '../../../hooks/useForm';
import { updateRenuncia } from '../../../utils/storage';
import { Tooltip } from 'react-tooltip';

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

    const { formData, setFormData, handleInputChange, handleSubmit, isSubmitting, initialData } = useForm({
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
        },
        options: { resetOnSuccess: false }
    });

    useEffect(() => {
        if (isOpen) {
            setFormData(initialState);
        }
    }, [isOpen, initialState, setFormData]);

    const hayCambios = useMemo(() => {
        if (!initialData) return false;
        return JSON.stringify(formData) !== JSON.stringify(initialData);
    }, [formData, initialData]);

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title="Editar Motivo de Renuncia"
                icon={<Edit size={28} className="text-orange-500" />}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <p className="text-center text-gray-600 dark:text-gray-400 -mt-4 mb-4">
                        Estás editando la renuncia de <strong className='text-gray-800 dark:text-gray-200'>{renuncia.clienteNombre}</strong>.
                    </p>
                    <div>
                        <label className="block font-medium mb-1 dark:text-gray-300">Motivo Principal</label>
                        <Select
                            options={motivosOptions}
                            value={motivosOptions.find(opt => opt.value === formData.motivo) || null}
                            onChange={(opt) => handleInputChange({ target: { name: 'motivo', value: opt.value } })}
                            placeholder="Selecciona un motivo..."
                            theme={(theme) => ({
                                ...theme,
                                colors: {
                                    ...theme.colors,
                                    primary: '#3b82f6',
                                    primary25: '#1e40af',
                                    neutral0: 'var(--color-bg-dark)',
                                    neutral80: 'var(--color-text-dark)',
                                },
                            })}
                            styles={{
                                control: (base) => ({ ...base, backgroundColor: 'var(--color-bg-dark)', borderColor: '#4b5563' }),
                                singleValue: (base) => ({ ...base, color: 'var(--color-text-dark)' }),
                                menu: (base) => ({ ...base, backgroundColor: 'var(--color-bg-dark)' }),
                                option: (base, state) => ({ ...base, backgroundColor: state.isFocused ? '#2563eb' : 'var(--color-bg-dark)', color: state.isFocused ? 'white' : 'var(--color-text-dark)' }),
                            }}
                        />
                    </div>

                    {formData.motivo === 'Otro' && (
                        <div className='animate-fade-in'>
                            <label className="block font-medium mb-1 dark:text-gray-300">Por favor, especifica el motivo</label>
                            <textarea
                                name="observacion"
                                value={formData.observacion}
                                onChange={handleInputChange}
                                rows="3"
                                className="w-full border p-2 rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                                placeholder="Detalla aquí la razón específica de la renuncia..."
                            />
                        </div>
                    )}

                    <div className="flex justify-end gap-4 pt-6 border-t dark:border-gray-700">
                        <button onClick={onClose} type="button" className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-6 py-2 rounded-lg transition">Cancelar</button>

                        <span
                            data-tooltip-id="app-tooltip"
                            data-tooltip-content={!hayCambios ? "No hay cambios para guardar" : ''}
                        >
                            <button
                                type="submit"
                                disabled={!hayCambios || isSubmitting}
                                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </span>
                    </div>
                </form>
            </Modal>
            <style>{`
                :root {
                  --color-bg-dark: #1f2937;
                  --color-text-dark: #d1d5db;
                }
            `}</style>
            <Tooltip id="app-tooltip" />
        </>
    );
};

export default ModalEditarRenuncia;