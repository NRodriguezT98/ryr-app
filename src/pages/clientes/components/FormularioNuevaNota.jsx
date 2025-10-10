// src/pages/clientes/components/FormularioNuevaNota.jsx
import React, { useState } from 'react';
import { MessageSquarePlus, Loader } from 'lucide-react';
import { addNotaToHistorial } from '../../../services/clienteService';
import { useAuth } from '../../../context/AuthContext';
import { useModernToast } from '../../../hooks/useModernToast.jsx';
import Button from '../../../components/Button';

const FormularioNuevaNota = ({ clienteId, onNotaAgregada }) => {
    const [nota, setNota] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { userData } = useAuth();
    const toast = useModernToast();
    const userName = `${userData.nombres} ${userData.apellidos}`;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!nota.trim()) {
            toast.warning("La nota no puede estar vacía", {
                title: 'Campo Requerido'
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const loadingToast = toast.loading('Guardando nota en el historial...');

            await addNotaToHistorial(clienteId, nota, userName);

            toast.dismiss(loadingToast);
            toast.successWithAction(
                "Nota agregada al historial exitosamente",
                "Ver historial",
                () => {
                    // Acción para ver historial - puedes implementar esto después
                    console.log("Ver historial clicked");
                },
                {
                    title: 'Nota Guardada',
                    actionIcon: 'view'
                }
            );

            setNota('');
            if (onNotaAgregada) onNotaAgregada();
        } catch (error) {
            toast.error("No se pudo agregar la nota al historial", {
                title: 'Error al Guardar'
            });
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mb-8 p-4 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
            <label htmlFor="nota-historial" className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">
                Agregar Nota al Historial
            </label>
            <textarea
                id="nota-historial"
                rows="3"
                className="w-full p-2 border rounded-md dark:bg-gray-900 dark:border-gray-600"
                placeholder="Escribe una observación, un recordatorio o el resumen de una llamada..."
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                disabled={isSubmitting}
            />
            <div className="text-right mt-2">
                <Button
                    type="submit"
                    variant="primary"
                    disabled={!nota.trim()}
                    isLoading={isSubmitting}
                    loadingText="Guardando..."
                    icon={!isSubmitting && <MessageSquarePlus size={16} />}
                >
                    {!isSubmitting && "Guardar Nota"}
                </Button>
            </div>
        </form>
    );
};

export default FormularioNuevaNota;