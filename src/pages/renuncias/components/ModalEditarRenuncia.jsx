import React from 'react';
import Modal from '../../../components/Modal.jsx';
import Select from 'react-select';
import { Edit } from 'lucide-react';
import { Tooltip } from 'react-tooltip';
import { useEditarRenuncia } from '../../../hooks/renuncias/useEditarRenuncia';

// Una lista de motivos de renuncia más completa y categorizada.
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

// Estilos mejorados para el componente Select que funcionan bien en ambos modos.
const getSelectStyles = (isDarkMode) => ({
    control: (base, state) => ({
        ...base,
        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
        borderColor: state.isFocused ? '#3b82f6' : (isDarkMode ? '#4b5563' : '#d1d5db'),
        '&:hover': { borderColor: '#3b82f6' },
        boxShadow: 'none',
        padding: '0.1rem',
    }),
    singleValue: (base) => ({ ...base, color: isDarkMode ? '#d1d5db' : '#111827' }),
    menu: (base) => ({ ...base, backgroundColor: isDarkMode ? '#1f2937' : '#ffffff', zIndex: 50 }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isFocused ? '#2563eb' : (isDarkMode ? '#1f2937' : '#ffffff'),
        color: state.isFocused ? 'white' : (isDarkMode ? '#d1d5db' : '#111827'),
        '&:active': { backgroundColor: isDarkMode ? '#374151' : '#f3f4f6' },
    }),
    input: (base) => ({ ...base, color: isDarkMode ? '#d1d5db' : '#111827' }),
    placeholder: (base) => ({ ...base, color: isDarkMode ? '#6b7280' : '#9ca3af' }),
});

const ModalEditarRenuncia = ({ isOpen, onClose, onSave, renuncia }) => {
    const { formData, hayCambios, isSubmitting, handlers } = useEditarRenuncia(renuncia, isOpen, onSave, onClose);
    const isDarkMode = document.documentElement.classList.contains('dark');

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title="Editar Motivo de Renuncia"
                icon={<Edit size={28} className="text-orange-500" />}
                size="2xl" // Hacemos el modal más ancho para mejorar la visualización.
            >
                <form onSubmit={handlers.handleSubmit} className="space-y-4">
                    <p className="text-center text-gray-600 dark:text-gray-400 -mt-4 mb-4">
                        Estás editando la renuncia de <strong className='text-gray-800 dark:text-gray-200'>{renuncia.clienteNombre}</strong>.
                    </p>
                    <div>
                        <label className="block font-medium mb-1 dark:text-gray-300">Motivo Principal</label>
                        <Select
                            options={motivosOptions}
                            value={motivosOptions.flatMap(g => g.options).find(opt => opt.value === formData.motivo) || null}
                            onChange={handlers.handleMotivoChange} // Usamos el nuevo manejador del hook.
                            placeholder="Selecciona un motivo..."
                            styles={getSelectStyles(isDarkMode)}
                        />
                    </div>

                    {formData.motivo === 'Otro' && (
                        <div className='animate-fade-in'>
                            <label className="block font-medium mb-1 dark:text-gray-300">Por favor, especifica el motivo</label>
                            <textarea
                                name="observacion"
                                value={formData.observacion}
                                onChange={handlers.handleInputChange}
                                rows="3"
                                className="w-full border p-2 rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                                placeholder="Detalla aquí la razón específica de la renuncia..."
                            />
                        </div>
                    )}

                    <div className="flex justify-end gap-4 pt-6 border-t dark:border-gray-700">
                        <button onClick={onClose} type="button" className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-semibold px-6 py-2 rounded-lg transition">Cancelar</button>
                        <span
                            data-tooltip-id="app-tooltip"
                            data-tooltip-content={!hayCambios ? "No hay cambios para guardar" : ''}
                        >
                            <button
                                type="submit"
                                disabled={!hayCambios || isSubmitting}
                                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </span>
                    </div>
                </form>
            </Modal>
            <Tooltip id="app-tooltip" />
        </>
    );
};

export default ModalEditarRenuncia;