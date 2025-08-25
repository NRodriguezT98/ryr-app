// src/pages/admin/components/ModalEditarProyecto.jsx

import React from 'react';
import { Edit } from 'lucide-react';
import Modal from '../../../components/Modal';
import FormularioProyecto from './FormularioProyecto';
import { useEditarProyecto } from '../../../hooks/admin/useEditarProyecto';

// Cambiamos 'onSave' por 'onSaveSuccess' para que sea más claro
const ModalEditarProyecto = ({ isOpen, onClose, onSaveSuccess, proyecto }) => {
    const { formData, errors, isSubmitting, handlers } = useEditarProyecto(proyecto, isOpen, onSaveSuccess);

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Editar Proyecto: ${proyecto.nombre}`}
            icon={<Edit size={28} className="text-blue-600" />}
        >
            <FormularioProyecto
                formData={formData}
                handleInputChange={handlers.handleInputChange}
                onSaveClick={handlers.handleSubmit} // El botón de guardar llama directamente a handleSubmit
                errors={errors}
                isSubmitting={isSubmitting}
                isEditing={true}
            />
        </Modal>
    );
};

export default ModalEditarProyecto;