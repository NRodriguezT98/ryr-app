import { useMemo, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useForm } from '../useForm';
import { updateRenuncia } from '../../utils/storage';

export const useEditarRenuncia = (renuncia, isOpen, onSave, onClose) => {
    const initialState = useMemo(() => ({
        motivo: renuncia?.motivo || '',
        observacion: renuncia?.observacion || ''
    }), [renuncia]);

    const {
        formData,
        setFormData,
        handleInputChange,
        handleSubmit,
        isSubmitting,
        initialData
    } = useForm({
        initialState,
        onSubmit: async (data) => {
            try {
                await updateRenuncia(renuncia.id, data);
                toast.success('Motivo de renuncia actualizado.');
                onSave();
                onClose();
            } catch (error) {
                toast.error('No se pudo actualizar el motivo.');
                console.error("Error al editar renuncia:", error);
            }
        },
        options: { resetOnSuccess: false }
    });

    useEffect(() => {
        if (isOpen) {
            setFormData(initialState);
        }
    }, [isOpen, initialState, setFormData]);

    const hayCambios = useMemo(() => {
        if (!initialData) return false;
        return JSON.stringify(formData) !== JSON.stringify(initialData);
    }, [formData, initialData]);

    const handleMotivoChange = useCallback((selectedOption) => {
        const newValue = selectedOption ? selectedOption.value : '';
        setFormData(prev => ({ ...prev, motivo: newValue }));
    }, [setFormData]);

    return {
        formData,
        hayCambios,
        isSubmitting,
        handlers: {
            handleInputChange,
            handleSubmit,
            handleMotivoChange
        }
    };
};