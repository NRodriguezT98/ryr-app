// src/pages/clientes/components/FormularioNuevaNota.jsx
import React, { useState } from 'react';
import { MessageSquarePlus, Loader } from 'lucide-react';
import { addNotaToHistorial } from '../../../services/clienteService';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';

const FormularioNuevaNota = ({ clienteId, onNotaAgregada }) => {
    const [nota, setNota] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { userData } = useAuth();
    const userName = `${userData.nombres} ${userData.apellidos}`;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!nota.trim()) {
            toast.error("La nota no puede estar vacía.");
            return;
        }
        setIsSubmitting(true);
        try {
            await addNotaToHistorial(clienteId, nota, userName);
            toast.success("Nota agregada al historial.");
            setNota('');
            onNotaAgregada(); // Avisamos al padre para que recargue el historial
        } catch (error) {
            toast.error("No se pudo agregar la nota.");
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
                <button type="submit" disabled={!nota.trim() || isSubmitting} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2">
                    {isSubmitting ? <Loader size={16} className="animate-spin" /> : <MessageSquarePlus size={16} />}
                    {isSubmitting ? "Guardando..." : "Guardar Nota"}
                </button>
            </div>
        </form>
    );
};

export default FormularioNuevaNota;