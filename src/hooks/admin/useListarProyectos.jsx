// src/hooks/admin/useListarProyectos.jsx

import { useState, useCallback } from 'react';
import { useData } from '../../context/DataContext';
import { updateProyecto, deleteProyecto } from "../../services/proyectoService";
import toast from 'react-hot-toast';

export const useListarProyectos = () => {
    const { proyectos, viviendas, recargarDatos } = useData();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [proyectoAEditar, setProyectoAEditar] = useState(null);
    const [proyectoAEliminar, setProyectoAEliminar] = useState(null);

    const handleGuardarEdicion = async (datosEditados) => {
        setIsSubmitting(true);
        try {
            await updateProyecto(proyectoAEditar.id, datosEditados);
            toast.success("Proyecto actualizado con éxito.");
            await recargarDatos();
            setProyectoAEditar(null);
        } catch (error) {
            toast.error("No se pudo actualizar el proyecto.");
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmarEliminacion = async () => {
        if (!proyectoAEliminar) return;
        setIsSubmitting(true);
        try {
            await deleteProyecto(proyectoAEliminar.id, viviendas);
            toast.success("Proyecto eliminado con éxito.");
            await recargarDatos();
            setProyectoAEliminar(null);
        } catch (error) {
            if (error.message === 'PROYECTO_CON_VIVIENDAS') {
                toast.error("No se puede eliminar. El proyecto tiene viviendas asignadas.");
            } else {
                toast.error("No se pudo eliminar el proyecto.");
            }
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        proyectos,
        viviendas,
        isSubmitting,
        proyectoAEditar,
        setProyectoAEditar,
        proyectoAEliminar,
        setProyectoAEliminar,
        handleGuardarEdicion,
        confirmarEliminacion
    };
};