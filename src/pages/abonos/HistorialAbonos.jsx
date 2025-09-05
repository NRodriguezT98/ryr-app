// En: src/pages/abonos/HistorialAbonos.jsx

import React from 'react';
// ... otros imports
import AbonoCard from './AbonoCard';
import { useAbonoActions } from '../../hooks/abonos/useAbonoActions'; // <-- ¡Importa tu nuevo hook!
import { useAbonosFilters } from '../../hooks/abonos/useAbonosFilters';

const HistorialAbonos = () => {
    const {
        filteredAbonos,
        // Suponiendo que tu hook de filtros tiene una función para recargar, si no, impleméntala
        refetchAbonos
    } = useAbonosFilters();

    // --- INICIO DE LA SOLUCIÓN ---
    // ¡Toda la lógica compleja ahora está en una sola línea!
    const { handleEdit, handleAnular, handleRevertir, AbonoActionModals } = useAbonoActions(refetchAbonos);
    // --- FIN DE LA SOLUCIÓN ---

    return (
        <div /* ... */ >
            {/* ... Tu JSX de filtros y cabecera ... */}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAbonos.map(abono => (
                    <AbonoCard
                        key={abono.id}
                        abono={abono}
                        // Las funciones vienen directamente del hook
                        onEdit={() => handleEdit(abono)}
                        onAnular={() => handleAnular(abono)}
                        onRevertir={() => handleRevertir(abono)}
                    />
                ))}
            </div>

            {/* --- INICIO DE LA SOLUCIÓN --- */}
            {/* Simplemente renderiza el componente que devuelve el hook */}
            <AbonoActionModals />
            {/* --- FIN DE LA SOLUCIÓN --- */}
        </div>
    );
};

export default HistorialAbonos;