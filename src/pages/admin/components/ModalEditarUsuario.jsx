import React, { useMemo } from 'react';
import Modal from '../../../components/Modal';
import { UserCog, Loader2 } from 'lucide-react';
import Select from 'react-select';
import { useForm } from '../../../hooks/useForm';

const roleOptions = [
    { value: 'admin', label: 'Admin' },
    { value: 'contabilidad', label: 'Contabilidad' },
    { value: 'obra', label: 'Obra' },
];

const getSelectStyles = (isDarkMode) => ({
    control: (base, state) => ({
        ...base,
        backgroundColor: isDarkMode ? '#374151' : '#FFFFFF',
        borderColor: state.isFocused ? '#3b82f6' : (isDarkMode ? '#4b5563' : '#d1d5db'),
        '&:hover': { borderColor: '#3b82f6' },
        boxShadow: 'none',
        padding: '0.1rem',
    }),
    singleValue: (base) => ({ ...base, color: isDarkMode ? '#d1d5db' : '#111827' }),
    menu: (base) => ({ ...base, backgroundColor: isDarkMode ? '#374151' : '#FFFFFF' }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isFocused ? '#2563eb' : (isDarkMode ? '#374151' : '#FFFFFF'),
        color: state.isFocused ? 'white' : (isDarkMode ? '#d1d5db' : '#111827'),
    }),
    input: (base) => ({ ...base, color: isDarkMode ? '#d1d5db' : '#111827' }),
    menuPortal: base => ({ ...base, zIndex: 9999 }) // Asegura que el menú se muestre sobre otros elementos
});

const ModalEditarUsuario = ({ isOpen, onClose, onSave, userToEdit, isSubmitting }) => {
    const isDarkMode = document.documentElement.classList.contains('dark');

    const initialFormState = useMemo(() => userToEdit, [userToEdit]);

    const { formData, errors, handleInputChange, handleSubmit, dispatch } = useForm({
        initialState: initialFormState,
        onSubmit: (data, { setErrors }) => {
            // Se extraen solo los campos que se pueden editar para enviar a la función de guardado
            const dataToUpdate = {
                nombres: data.nombres,
                apellidos: data.apellidos,
                cedula: data.cedula,
                role: data.role
            };
            onSave(data.uid, dataToUpdate, setErrors);
        }
    });

    const handleRoleChange = (option) => {
        dispatch({ type: 'SET_ERRORS', payload: { role: null } });
        dispatch({ type: 'SET_FIELD', payload: { field: 'role', value: option?.value || null } });
    };

    if (!formData) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Editar Usuario: ${formData.nombres}`}
            size="2xl"
            icon={<UserCog className="text-blue-600" />}
        >
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium dark:text-gray-300">Nombres</label>
                        <input type="text" name="nombres" value={formData.nombres} onChange={handleInputChange} required className={`mt-1 w-full p-2 border rounded-md dark:bg-gray-700 ${errors.nombres ? 'border-red-500' : 'dark:border-gray-600'}`} />
                        {errors.nombres && <p className="text-red-500 text-xs mt-1">{errors.nombres}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium dark:text-gray-300">Apellidos</label>
                        <input type="text" name="apellidos" value={formData.apellidos} onChange={handleInputChange} required className={`mt-1 w-full p-2 border rounded-md dark:bg-gray-700 ${errors.apellidos ? 'border-red-500' : 'dark:border-gray-600'}`} />
                        {errors.apellidos && <p className="text-red-500 text-xs mt-1">{errors.apellidos}</p>}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium dark:text-gray-300">Correo Electrónico (No se puede cambiar)</label>
                    <input type="email" value={formData.email} disabled className="mt-1 w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:border-gray-600 cursor-not-allowed" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium dark:text-gray-300">Número de Cédula</label>
                        <input type="text" name="cedula" value={formData.cedula} onChange={handleInputChange} required className={`mt-1 w-full p-2 border rounded-md dark:bg-gray-700 ${errors.cedula ? 'border-red-500' : 'dark:border-gray-600'}`} />
                        {errors.cedula && <p className="text-red-500 text-xs mt-1">{errors.cedula}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium dark:text-gray-300">Rol</label>
                        <Select
                            options={roleOptions}
                            value={roleOptions.find(option => option.value === formData.role)}
                            onChange={handleRoleChange}
                            className="mt-1"
                            styles={getSelectStyles(isDarkMode)}
                            menuPortalTarget={document.body}
                        />
                        {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
                    </div>
                </div>
                <div className="flex justify-end gap-4 pt-4 border-t dark:border-gray-700">
                    <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-6 py-2 rounded-lg transition">Cancelar</button>
                    <button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition disabled:bg-gray-400 flex items-center justify-center gap-2">
                        {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                        {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default ModalEditarUsuario;