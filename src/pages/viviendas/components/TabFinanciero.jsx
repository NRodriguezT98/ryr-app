// src/pages/viviendas/components/TabFinanciero.jsx (VERSIÓN SIMPLIFICADA)

import React from 'react';
import FuenteDePagoCard from '../../abonos/FuenteDePagoCard';
import { usePermissions } from '../../../hooks/auth/usePermissions';
import { Lock } from 'lucide-react';

// Ya no necesitamos 'historialAbonos', la información está en 'fuentes'.
const TabFinanciero = ({ vivienda, cliente, proyecto, fuentes, onAbonoRegistrado, onCondonarSaldo, onRegistrarDesembolso }) => {
    const { can } = usePermissions();
    const tienePermisoParaCrear = can('abonos', 'crear');

    return (
        <div className="animate-fade-in space-y-8">
            <div>
                <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Fuentes de Pago</h3>

                {!tienePermisoParaCrear && (
                    <div className="p-3 mb-4 bg-yellow-50 dark:bg-yellow-900/50 ...">
                        {/* ... Mensaje de solo lectura ... */}
                    </div>
                )}

                {/* --- SECCIÓN ÚNICA Y SIMPLIFICADA --- */}
                {/* Ahora solo nos preocupamos por renderizar las fuentes. */}
                <div className="space-y-4">
                    {fuentes.map(fuente => (
                        <FuenteDePagoCard
                            key={fuente.fuente}
                            {...fuente}
                            vivienda={vivienda}
                            cliente={cliente}
                            proyecto={proyecto}
                            onAbonoRegistrado={tienePermisoParaCrear ? onAbonoRegistrado : null}
                            onCondonarSaldo={tienePermisoParaCrear ? () => onCondonarSaldo({ ...fuente, saldoPendiente: fuente.montoPactado - fuente.abonos.reduce((sum, a) => sum + a.monto, 0), vivienda, cliente }) : null}
                            onRegistrarDesembolso={tienePermisoParaCrear ? onRegistrarDesembolso : null}
                        />
                    ))}
                </div>
            </div>
            {/* --- SECCIÓN DE HISTORIAL ELIMINADA --- */}
            {/* Ya no es necesaria, porque cada FuenteDePagoCard mostrará sus propios abonos. */}
        </div>
    );
};

export default TabFinanciero;