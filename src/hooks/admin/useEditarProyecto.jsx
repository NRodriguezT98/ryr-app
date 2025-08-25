// src/hooks/admin/useEditarProyecto.jsx

import { useState, useEffect, useMemo } from 'react';
import { useForm } from '../useForm';
import { useData } from '../../context/DataContext';
import { validateProyecto } from '../../utils/validation';
import { updateProyecto } from '../../utils/storage';
import toast from 'react-hot-toast';

export const useEditarProyecto = (proyectoAEditar, isOpen, onSaveSuccess) => {
    const { proyectos, recargarDatos } = useData();
    const [initialData, setInitialData] = useState({});

    const {
        formData,
        errors,
        isSubmitting,
        handleInputChange,
        handleSubmit,
        setFormData,
        setErrors
    } = useForm({
        initialState: { nombre: '' },
        validate: (data) => validateProyecto(data, proyectos, proyectoAEditar?.id),
        onSubmit: async (data) => {
            const cambiosDetectados = [];
            if (data.nombre !== initialData.nombre) {
                cambiosDetectados.push({
                    campo: 'Nombre',
                    anterior: initialData.nombre,
                    actual: data.nombre
                });
            }

            if (cambiosDetectados.length === 0) {
                toast.error("No hay cambios para guardar.");
                return;
            }

            try {
                await updateProyecto(proyectoAEditar.id, {
                    nombre: data.nombre,
                    cambios: cambiosDetectados
                });

                toast.success('¡Proyecto actualizado con éxito!');
                await recargarDatos();
                onSaveSuccess(); // Llama a la función para cerrar el modal
            } catch (error) {
                console.error("Error al actualizar el proyecto:", error);
                toast.error('No se pudo actualizar el proyecto.');
            }
        }
    });

    useEffect(() => {
        if (isOpen && proyectoAEditar) {
            const initialValues = { nombre: proyectoAEditar.nombre || '' };
            setFormData(initialValues);
            setInitialData(initialValues);
            setErrors({});
        }
    }, [isOpen, proyectoAEditar, setFormData, setErrors]);

    return {
        formData,
        errors,
        isSubmitting,
        handlers: {
            handleInputChange,
            handleSubmit
        }
    };
};