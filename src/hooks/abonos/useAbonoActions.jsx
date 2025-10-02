// En: src/hooks/abonos/useAbonoActions.jsx

import React, { useState } from 'react';
import EditarAbonoModal from '../../pages/abonos/EditarAbonoModal';
import ModalAnularAbono from '../../pages/abonos/components/ModalAnularAbono';
// --- INICIO DE LA MODIFICACIÓN ---
// 1. Importamos nuestra nueva modal y el hook especializado para revertir.
import ModalRevertirAbono from '../../pages/abonos/components/ModalRevertirAbono';
import { useRevertirAbono } from './useRevertirAbono';
// --- FIN DE LA MODIFICACIÓN ---

export const useAbonoActions = (onActionSuccess) => {
    // La lógica de anular y editar se mantiene igual
    const [abonoToEdit, setAbonoToEdit] = useState(null);
    const [abonoToAnular, setAbonoToAnular] = useState(null);

    // --- INICIO DE LA MODIFICACIÓN ---
    // 2. Usamos el hook que ya preparamos en el Paso 2.
    // Le pasamos la función onActionSuccess para que se ejecute al terminar.
    const {
        isRevirtiendo,
        confirmarReversion,
        abonoParaRevertir,
        iniciarReversion,
        cerrarReversion
    } = useRevertirAbono(onActionSuccess);
    // --- FIN DE LA MODIFICACIÓN ---

    const handleEdit = (abono) => setAbonoToEdit(abono);
    const handleAnular = (abono) => setAbonoToAnular(abono);

    // --- INICIO DE LA MODIFICACIÓN ---
    // 3. handleRevertir ahora simplemente llama a la función para iniciar el proceso.
    const handleRevertir = (abono) => {
        iniciarReversion(abono);
    };
    // --- FIN DE LA MODIFICACIÓN ---


    // El componente que renderiza todos los modales necesarios.
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
                // ... (las props de la modal de anular se mantienen igual)
                />
            )}

            {/* --- INICIO DE LA MODIFICACIÓN --- */}
            {/* 4. Reemplazamos ModalConfirmacion por nuestra nueva ModalRevertirAbono */}
            {abonoParaRevertir && (
                <ModalRevertirAbono
                    isOpen={!!abonoParaRevertir}
                    onClose={cerrarReversion}
                    onConfirm={confirmarReversion} // Esta función ya espera el motivo
                    isSubmitting={isRevirtiendo}
                    abonoARevertir={abonoParaRevertir}
                />
            )}
            {/* --- FIN DE LA MODIFICACIÓN --- */}
        </>
    );

    // El hook devuelve las mismas funciones, pero 'handleRevertir' ahora tiene un nuevo comportamiento.
    return {
        handleEdit,
        handleAnular,
        handleRevertir,
        AbonoActionModals,
    };
};