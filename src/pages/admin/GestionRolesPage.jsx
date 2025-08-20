import React from 'react';
import { Link } from 'react-router-dom';
import AnimatedPage from '../../components/AnimatedPage';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

const GestionRolesPage = () => {
    return (
        <AnimatedPage>
            <div className="max-w-7xl mx-auto">
                <Link to="/admin" className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 inline-flex items-center gap-2 mb-6">
                    <ArrowLeft size={14} /> Volver al Panel de Administración
                </Link>
                <div className="flex items-center gap-4 mb-8">
                    <ShieldCheck size={40} className="text-green-600" />
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Gestión de Roles</h1>
                        <p className="text-gray-500 dark:text-gray-400">Crea y modifica los roles y sus permisos en el sistema.</p>
                    </div>
                </div>

                {/* Aquí construiremos la lista de roles y el formulario de creación/edición */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border dark:border-gray-700">
                    <p className="text-center text-gray-500">El gestor de roles se construirá aquí.</p>
                </div>
            </div>
        </AnimatedPage>
    );
};

export default GestionRolesPage;