import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import AnimatedPage from '../../components/AnimatedPage';
import { UserPlus, Loader2, ArrowLeft } from 'lucide-react';
import { useGestionUsuarios } from '../../hooks/admin/useGestionUsuarios';
import { useForm } from '../../hooks/useForm';
import Select from 'react-select';
import { validateUsuario } from '../../utils/userValidation';

const getSelectStyles = (isDarkMode, hasError) => ({
    control: (base, state) => ({
        ...base,
        backgroundColor: isDarkMode ? '#374151' : '#FFFFFF',
        borderColor: hasError ? '#ef4444' : (state.isFocused ? '#3b82f6' : (isDarkMode ? '#4b5563' : '#d1d5db')),
        '&:hover': { borderColor: hasError ? '#ef4444' : '#3b82f6' },
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
    menuPortal: base => ({ ...base, zIndex: 9999 })
});

const CrearUsuarioPage = () => {
    const { isSubmitting, isLoading, crearNuevoUsuario, roles } = useGestionUsuarios();
    const isDarkMode = document.documentElement.classList.contains('dark');

    const initialFormState = useMemo(() => ({
        nombres: '', apellidos: '', cedula: '', email: '', password: '', role: null
    }), []);

    const { formData, errors, handleInputChange, handleSubmit, dispatch } = useForm({
        initialState: initialFormState,
        validate: validateUsuario,
        onSubmit: async (data) => {
            await crearNuevoUsuario(data);
        },
        options: { resetOnSuccess: true }
    });

    const handleRoleChange = (option) => {
        dispatch({ type: 'SET_ERRORS', payload: { role: null } });
        // Usamos 'UPDATE_FIELD' que es la acción correcta en tu reducer
        dispatch({ type: 'UPDATE_FIELD', payload: { name: 'role', value: option ? option.value : null } });
    };

    return (
        <AnimatedPage>
            <div className="max-w-3xl mx-auto">
                <Link to="/admin" className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 inline-flex items-center gap-2 mb-6">
                    <ArrowLeft size={14} /> Volver al Panel de Administración
                </Link>
                <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md border dark:border-gray-700">
                    <h3 className="text-2xl font-bold flex items-center gap-3 mb-6 dark:text-gray-200"><UserPlus /> Crear Nuevo Usuario</h3>
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
                            <label className="block text-sm font-medium dark:text-gray-300">Número de Cédula</label>
                            <input type="text" name="cedula" value={formData.cedula} onChange={handleInputChange} required className={`mt-1 w-full p-2 border rounded-md dark:bg-gray-700 ${errors.cedula ? 'border-red-500' : 'dark:border-gray-600'}`} />
                            {errors.cedula && <p className="text-red-500 text-xs mt-1">{errors.cedula}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium dark:text-gray-300">Correo Electrónico</label>
                            <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className={`mt-1 w-full p-2 border rounded-md dark:bg-gray-700 ${errors.email ? 'border-red-500' : 'dark:border-gray-600'}`} />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium dark:text-gray-300">Contraseña Temporal</label>
                                <input type="password" name="password" value={formData.password} onChange={handleInputChange} required className={`mt-1 w-full p-2 border rounded-md dark:bg-gray-700 ${errors.password ? 'border-red-500' : 'dark:border-gray-600'}`} />
                                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium dark:text-gray-300">Rol</label>
                                <Select
                                    options={roles} // 3. Usamos los roles dinámicos
                                    onChange={handleRoleChange} // 4. Usamos el manejador especial
                                    value={roles.find(option => option.value === formData.role) || null} // 5. Se asegura que el valor seleccionado se muestre
                                    placeholder="Seleccionar rol..."
                                    className="mt-1"
                                    styles={getSelectStyles(isDarkMode, !!errors.role)}
                                    isLoading={isLoading}
                                />
                                {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
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