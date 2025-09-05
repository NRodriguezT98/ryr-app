// En: src/hooks/abonos/useAbonoActions.jsx

import React, { useState } from 'react';
import EditarAbonoModal from '../../pages/abonos/EditarAbonoModal';
import ModalAnularAbono from '../../pages/abonos/components/ModalAnularAbono';
import ModalConfirmacion from '../../components/ModalConfirmacion';
import { revertirAnulacionAbono } from '../../services/abonoService';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../utils/textFormatters';
import { useAuth } from '../../context/AuthContext'; // Para obtener el userName

/**
 * Hook para gestionar las acciones de un abono (editar, anular, revertir).
 * @param {function} onActionSuccess - Callback a ejecutar cuando una acción tiene éxito (para refrescar datos).
 */
export const useAbonoActions = (onActionSuccess) => {
    const { user } = useAuth(); // Obtenemos el usuario para la auditoría
    const [abonoToEdit, setAbonoToEdit] = useState(null);
    const [abonoToAnular, setAbonoToAnular] = useState(null);
    const [abonoToRevertir, setAbonoToRevertir] = useState(null);

    const handleEdit = (abono) => setAbonoToEdit(abono);
    const handleAnular = (abono) => setAbonoToAnular(abono);
    const handleRevertir = (abono) => setAbonoToRevertir(abono);

    const handleConfirmRevertir = async () => {
        if (!abonoToRevertir) return;
        try {
            await revertirAnulacionAbono(abonoToRevertir, user.displayName);
            toast.success('Anulación revertida con éxito.');
            onActionSuccess?.(); // Llama al callback si existe
        } catch (error) {
            toast.error(error.message || 'No se pudo revertir la anulación.');
        } finally {
            setAbonoToRevertir(null);
        }
    };

    // Este componente renderiza todos los modales necesarios.
    // Es una forma elegante de devolver JSX desde un hook.
    const AbonoActionModals = () => (
        <>
            {abonoToEdit && (
                <EditarAbonoModal
                    isOpen={!!abonoToEdit}
                    onClose={() => setAbonoToEdit(null)}
                    onSave={() => {
                        setAbonoToEdit(null);
                        onActionSuccess?.();
                    }}
                    abonoAEditar={abonoToEdit}
                />
            )}
            {abonoToAnular && (
                <ModalAnularAbono
                    isOpen={!!abonoToAnular}
                    onClose={() => setAbonoToAnular(null)}
                    onAnulacionConfirmada={() => {
                        setAbonoToAnular(null);
                        onActionSuccess?.();
                    }}
                    abonoAAnular={abonoToAnular}
                />
            )}
            {abonoToRevertir && (
                <ModalConfirmacion
                    isOpen={!!abonoToRevertir}
                    onClose={() => setAbonoToRevertir(null)}
                    onConfirm={handleConfirmRevertir}
                    titulo="Confirmar Reversión"
                    isSubmitting={false} // Puedes añadir un estado de carga si lo deseas
                    cambios={[`¿Estás seguro de que quieres reactivar el abono de ${formatCurrency(abonoToRevertir.monto)}?`]}
                />
            )}
        </>
    );

    // El hook devuelve las funciones y el componente de modales.
    return {
        handleEdit,
        handleAnular,
        handleRevertir,
        AbonoActionModals, // Componente que contiene los modales
    };
};