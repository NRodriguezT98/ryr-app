// src/pages/admin/CrearProyecto.jsx

import React from 'react';
import { useCrearProyecto } from '../../hooks/admin/useCrearProyecto';
import ResourcePageLayout from '../../layout/ResourcePageLayout';
import FormularioProyecto from './components/FormularioProyecto';
import { FolderPlus } from 'lucide-react';

const CrearProyecto = () => {
    const { formData, handleInputChange, handleSubmit, errors, isSubmitting } = useCrearProyecto();

    return (
        <ResourcePageLayout
            title="Crear Nuevo Proyecto"
            icon={<FolderPlus size={40} />}
            color="#0284c7"
            backLink="/admin/proyectos"
        >
            <div className="max-w-2xl mx-auto">
                <FormularioProyecto
                    formData={formData}
                    handleInputChange={handleInputChange}
                    // --- INICIO DE LA CORRECCIÓN ---
                    // Cambiamos el nombre de la prop a 'onSaveClick'
                    onSaveClick={handleSubmit}
                    // --- FIN DE LA CORRECCIÓN ---
                    errors={errors}
                    isSubmitting={isSubmitting}
                />
            </div>
        </ResourcePageLayout>
    );
};

export default CrearProyecto;