import React from 'react';
import { Link } from 'react-router-dom';
import AnimatedPage from '../../components/AnimatedPage';
import { ShieldCheck, ArrowLeft, PlusCircle, Pencil, Loader2 } from 'lucide-react';
import { useGestionRoles } from '../../hooks/admin/useGestionRoles';
import Modal from '../../components/Modal';
import RoleForm from './components/RoleForm';

const GestionRolesPage = () => {
    const { roles, isLoading, isSubmitting, roleToEdit, setRoleToEdit, saveRole } = useGestionRoles();

    return (
        <AnimatedPage>
            <div className="max-w-7xl mx-auto">
                <Link to="/admin" className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 inline-flex items-center gap-2 mb-6">
                    <ArrowLeft size={14} /> Volver al Panel de Administración
                </Link>
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <ShieldCheck size={40} className="text-green-600" />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Gestión de Roles</h1>
                            <p className="text-gray-500 dark:text-gray-400">Crea y modifica los roles y sus permisos en el sistema.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setRoleToEdit({})} // Abre el modal para crear un nuevo rol
                        className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg flex items-center justify-center gap-2"
                    >
                        <PlusCircle size={18} />
                        Crear Nuevo Rol
                    </button>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border dark:border-gray-700">
                    <h3 className="text-xl font-bold mb-4 dark:text-gray-200">Roles Actuales</h3>
                    <div className="space-y-3">
                        {isLoading ? (
                            <div className="text-center p-4"><Loader2 className="animate-spin inline-block" /></div>
                        ) : (
                            roles.map(role => (
                                <div key={role.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <span className="font-semibold text-gray-800 dark:text-gray-200">{role.nombre}</span>
                                    <button
                                        onClick={() => setRoleToEdit(role)}
                                        className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Modal para Crear/Editar Rol */}
            <Modal
                isOpen={!!roleToEdit}
                onClose={() => setRoleToEdit(null)}
                title={roleToEdit?.id ? `Editar Rol: ${roleToEdit.nombre}` : 'Crear Nuevo Rol'}
                size="4xl"
            >
                <RoleForm
                    initialData={roleToEdit}
                    onSubmit={saveRole}
                    isSubmitting={isSubmitting}
                    onCancel={() => setRoleToEdit(null)}
                />
            </Modal>
        </AnimatedPage>
    );
};

export default GestionRolesPage;