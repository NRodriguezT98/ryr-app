// src/hooks/admin/useCrearProyecto.jsx

import { useForm } from '../useForm';
import { useData } from '../../context/DataContext';
import { validateProyecto } from '../../utils/validation';
import { addProyecto } from "../../services/proyectoService";
import { useModernToast } from '../useModernToast.jsx';
import { useNavigate } from 'react-router-dom';

const initialState = {
    nombre: '',
};

export const useCrearProyecto = () => {
    const navigate = useNavigate();
    const { proyectos, recargarDatos } = useData();
    const toast = useModernToast();

    const {
        formData,
        errors,
        isSubmitting,
        handleInputChange,
        handleSubmit,
    } = useForm({
        initialState,
        validate: (data) => validateProyecto(data, proyectos),
        onSubmit: async (data) => {
            try {
                await addProyecto(data);
                toast.success('¡Proyecto creado con éxito!', {
                    title: "¡Proyecto Creado!"
                });
                await recargarDatos(); // Actualizamos la lista de proyectos en la app
                navigate('/admin/proyectos'); // Navegamos a la lista (la crearemos después)
            } catch (error) {
                console.error("Error al crear el proyecto:", error);
                toast.error('No se pudo crear el proyecto.', {
                    title: "Error de Creación"
                });
            }
        },
    });

    return {
        formData,
        errors,
        isSubmitting,
        handleInputChange,
        handleSubmit,
    };
};