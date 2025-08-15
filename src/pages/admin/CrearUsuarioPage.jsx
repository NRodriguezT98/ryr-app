import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import AnimatedPage from '../../components/AnimatedPage';
import { UserPlus, Loader2, ArrowLeft } from 'lucide-react';
import { useGestionUsuarios } from '../../hooks/admin/useGestionUsuarios';
import { useForm } from '../../hooks/useForm';
import Select from 'react-select';

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
});

const CrearUsuarioPage = () => {
    const { isSubmitting, crearNuevoUsuario } = useGestionUsuarios();
    const isDarkMode = document.documentElement.classList.contains('dark');

    const initialFormState = useMemo(() => ({
        nombres: '', apellidos: '', cedula: '', email: '', password: '', role: null
    }), []);

    const { formData, handleInputChange, handleSubmit, resetForm } = useForm({
        initialState: initialFormState,
        onSubmit: async (data) => {
            await crearNuevoUsuario(data, resetForm);
        }
    });

    return (
        <AnimatedPage>
            <div className="max-w-3xl mx-auto">
                <Link to="/admin" className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 inline-flex items-center gap-2 mb-6">
                    <ArrowLeft size={14} /> Volver al Panel de Administración
                </Link>
                <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md border dark:border-gray-700">
                    <h3 className="text-2xl font-bold flex items-center gap-3 mb-6 dark:text-gray-200"><UserPlus /> Crear Nuevo Usuario</h3>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium dark:text-gray-300">Nombres</label>
                                <input type="text" name="nombres" value={formData.nombres} onChange={handleInputChange} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium dark:text-gray-300">Apellidos</label>
                                <input type="text" name="apellidos" value={formData.apellidos} onChange={handleInputChange} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium dark:text-gray-300">Número de Cédula</label>
                            <input type="text" name="cedula" value={formData.cedula} onChange={handleInputChange} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium dark:text-gray-300">Correo Electrónico</label>
                            <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium dark:text-gray-300">Contraseña Temporal</label>
                                <input type="password" name="password" value={formData.password} onChange={handleInputChange} required className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium dark:text-gray-300">Rol</label>
                                <Select
                                    options={roleOptions}
                                    onChange={(option) => handleInputChange({ target: { name: 'role', value: option.value } })}
                                    value={roleOptions.find(option => option.value === formData.role) || null}
                                    placeholder="Seleccionar rol..."
                                    className="mt-1"
                                    styles={getSelectStyles(isDarkMode)}
                                />
                            </div>
                        </div>
                        <div className="pt-4">
                            <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition disabled:bg-gray-400 flex items-center justify-center gap-2">
                                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                                {isSubmitting ? 'Creando...' : 'Crear Usuario'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AnimatedPage>
    );
};

export default CrearUsuarioPage;