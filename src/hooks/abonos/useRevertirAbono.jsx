// src/hooks/abonos/useRevertirAbono.jsx

import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { revertirAnulacionAbono } from '../../services/abonoService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export const useRevertirAbono = (onActionCompleta) => {
    const { user } = useAuth();
    const { recargarDatos } = useData();
    const [abonoARevertir, setAbonoARevertir] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const iniciarReversion = (abono) => {
        setAbonoARevertir(abono);
    };

    const cerrarReversion = () => {
        setAbonoARevertir(null);
    };

    // --- INICIO DE LA MODIFICACIÓN ---
    // La función ahora acepta el 'motivo' como argumento.
    const confirmarReversion = async (motivo) => {
        // --- FIN DE LA MODIFICACIÓN ---
        if (!abonoARevertir) return;

        // Validamos que el motivo venga con datos.
        if (!motivo || motivo.trim().length < 10) {
            toast.error("El motivo es obligatorio y debe tener al menos 10 caracteres.");
            return;
        }

        setIsSubmitting(true);
        const userName = user?.displayName || 'Sistema';

        try {
            toast.loading('Revirtiendo anulación...');

            // --- INICIO DE LA MODIFICACIÓN ---
            // Pasamos el 'motivo' a la función del servicio.
            await revertirAnulacionAbono(abonoARevertir, userName, motivo);
            // --- FIN DE LA MODIFICACIÓN ---

            toast.dismiss();
            toast.success('¡Anulación revertida con éxito!');

            recargarDatos();
            if (onActionCompleta) onActionCompleta();
            cerrarReversion();
        } catch (error) {
            toast.dismiss();
            console.error("Error al revertir la anulación:", error);
            toast.error(`Error al revertir: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        isRevertirModalOpen: !!abonoARevertir,
        abonoParaRevertir: abonoARevertir,
        isRevirtiendo: isSubmitting,
        iniciarReversion,
        cerrarReversion,
        confirmarReversion, // Esta función ahora espera el 'motivo'
    };
};