import React from 'react';
import { Link } from 'react-router-dom';
import AnimatedPage from '../../components/AnimatedPage';
import { ShieldCheck, UserPlus, Users, Loader2, Pencil, History } from 'lucide-react'; // 1. Se importa el ícono History
import { useGestionUsuarios } from '../../hooks/admin/useGestionUsuarios';
import { toTitleCase } from '../../utils/textFormatters';

const AdminPage = () => {
    const { users, isLoading, userToEdit } = useGestionUsuarios();

    return (
        <AnimatedPage>
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <ShieldCheck size={40} className="text-purple-600" />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Panel de Administración</h1>
                            <p className="text-gray-500 dark:text-gray-400">Gestiona los usuarios y los roles del sistema.</p>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                        <Link to="/admin/crear-usuario" className="w-full">
                            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg flex items-center justify-center gap-2">
                                <UserPlus size={18} />
                                Crear Nuevo Usuario
                            </button>
                        </Link>
                        {/* --- INICIO DE LA MODIFICACIÓN --- */}
                        {/* 2. Se añade el nuevo botón */}
                        <Link to="/admin/auditoria" className="w-full">
                            <button className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-5 rounded-lg flex items-center justify-center gap-2">
                                <History size={18} />
                                Ver Auditoría
                            </button>
                        </Link>
                        {/* --- FIN DE LA MODIFICACIÓN --- */}
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border dark:border-gray-700">
                    <h3 className="text-xl font-bold flex items-center gap-2 mb-4 dark:text-gray-200"><Users /> Usuarios del Sistema</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Nombre</th>
                                    <th scope="col" className="px-6 py-3">Cédula</th>
                                    <th scope="col" className="px-6 py-3">Correo Electrónico</th>
                                    <th scope="col" className="px-6 py-3">Rol</th>
                                    <th scope="col" className="px-6 py-3">Editar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr><td colSpan="4" className="text-center p-4"><Loader2 className="animate-spin inline-block" /></td></tr>
                                ) : (
                                    users.map(user => (
                                        <tr key={user.uid} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{toTitleCase(`${user.nombres} ${user.apellidos}`)}</td>
                                            <td className="px-6 py-4">{user.cedula}</td>
                                            <td className="px-6 py-4">{user.email}</td>
                                            <td className="px-6 py-4"><span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">{user.role}</span></td>
                                            <td className="px-6 py-4">
                                                <button onClick={() => setUserToEdit(user)} className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                                                    <Pencil size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {
                userToEdit && (
                    <ModalEditarUsuario
                        isOpen={!!userToEdit}
                        onClose={() => setUserToEdit(null)}
                        onSave={updateUser}
                        userToEdit={userToEdit}
                        isSubmitting={isSubmitting}
                    />
                )
            }

        </AnimatedPage >
    );
};

export default AdminPage;