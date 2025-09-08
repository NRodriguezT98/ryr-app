// src/pages/admin/CrearProyecto.jsx

import React from 'react';
import { useCrearProyecto } from '../../hooks/admin/useCrearProyecto';
import FormularioProyecto from './components/FormularioProyecto';
import { FolderPlus, ArrowLeft } from 'lucide-react';
import AnimatedPage from '../../components/AnimatedPage';
import { Link } from 'react-router-dom';

const CrearProyecto = () => {
    const { formData, handleInputChange, handleSubmit, errors, isSubmitting } = useCrearProyecto();

    return (
        <AnimatedPage>
            <div className="max-w-3xl mx-auto py-8 px-4">
                <div className="mb-6">
                    <Link to="/admin/proyectos" className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-semibold">
                        <ArrowLeft size={20} />
                        Volver a Proyectos
                    </Link>
                </div>

                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="text-sky-600 dark:text-sky-400">
                            <FolderPlus size={32} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                            Crear Nuevo Proyecto
                        </h1>
                    </div>

                    <FormularioProyecto
                        formData={formData}
                        handleInputChange={handleInputChange}
                        onSaveClick={handleSubmit}
                        errors={errors}
                        isSubmitting={isSubmitting}
                    />
                </div>
            </div>
        </AnimatedPage>
    );
};

export default CrearProyecto;