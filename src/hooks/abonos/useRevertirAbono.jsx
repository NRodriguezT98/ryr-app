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
        // A diferencia de anular, para revertir no necesitamos buscar más datos.
        // El objeto abono ya tiene todo lo necesario.
        setAbonoARevertir(abono);
    };

    const cerrarReversion = () => {
        setAbonoARevertir(null);
    };

    const confirmarReversion = async () => {
        if (!abonoARevertir) return;

        setIsSubmitting(true);
        const userName = user?.displayName || 'Sistema';

        try {
            toast.loading('Revirtiendo anulación...');
            await revertirAnulacionAbono(abonoARevertir, userName);

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
        confirmarReversion,
    };
};