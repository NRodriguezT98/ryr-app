// src/pages/admin/ListarProyectos.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useListarProyectos } from '../../hooks/admin/useListarProyectos';
import { usePermissions } from '../../hooks/auth/usePermissions';
import ListPageLayout from '../../layout/ListPageLayout.jsx';
import Button from '../../components/Button.jsx';
import { FolderKanban, FolderPlus, Edit, Trash2, Home, Loader } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import ModalEditarProyecto from './components/ModalEditarProyecto';
import ModalConfirmacion from '../../components/ModalConfirmacion';

const ListarProyectos = () => {
    const { can } = usePermissions();
    const {
        proyectos, viviendas, isSubmitting,
        proyectoAEditar, setProyectoAEditar,
        proyectoAEliminar, setProyectoAEliminar,
        confirmarEliminacion
    } = useListarProyectos();

    const contarViviendas = (proyectoId) => {
        return viviendas.filter(v => v.proyectoId === proyectoId).length;
    };

    return (
        <ListPageLayout
            icon={<FolderKanban />}
            title="Gestionar Proyectos"
            actionButton={
                can('admin', 'crearProyectos') && (
                    <Link to="/admin/proyectos/crear">
                        <Button variant="primary">
                            <FolderPlus size={18} className="mr-2" />
                            Crear Nuevo Proyecto
                        </Button>
                    </Link>
                )
            }
        >
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border dark:border-gray-700">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300">
                            <tr>
                                <th scope="col" className="px-6 py-3">Nombre del Proyecto</th>
                                <th scope="col" className="px-6 py-3">Viviendas Vinculadas</th>
                                <th scope="col" className="px-6 py-3">Fecha de Creación</th>
                                <th scope="col" className="px-6 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {proyectos.map(proyecto => (
                                <tr key={proyecto.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{proyecto.nombre}</td>
                                    <td className="px-6 py-4">
                                        <span className="flex items-center gap-2">
                                            <Home size={16} /> {contarViviendas(proyecto.id)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {proyecto.fechaCreacion ? format(proyecto.fechaCreacion.toDate(), 'dd/MM/yyyy', { locale: es }) : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 flex justify-end gap-2">
                                        {can('admin', 'editarProyecto') && (
                                            <button onClick={() => setProyectoAEditar(proyecto)} className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                                                <Edit size={16} />
                                            </button>
                                        )}
                                        {can('admin', 'eliminarProyecto') && (
                                            <button onClick={() => setProyectoAEliminar(proyecto)} className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {proyectoAEditar && (
                <ModalEditarProyecto
                    isOpen={!!proyectoAEditar}
                    onClose={() => setProyectoAEditar(null)}
                    onSaveSuccess={() => setProyectoAEditar(null)}
                    proyecto={proyectoAEditar}
                />
            )}

            {proyectoAEliminar && (
                <ModalConfirmacion
                    isOpen={!!proyectoAEliminar}
                    onClose={() => setProyectoAEliminar(null)}
                    onConfirm={confirmarEliminacion}
                    titulo="¿Eliminar Proyecto?"
                    mensaje={`¿Estás seguro de que quieres eliminar el proyecto "${proyectoAEliminar.nombre}"? Esta acción es irreversible.`}
                    isSubmitting={isSubmitting}
                />
            )}
        </ListPageLayout>
    );
};

export default ListarProyectos;