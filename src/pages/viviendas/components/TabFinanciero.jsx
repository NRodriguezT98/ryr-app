import React from 'react';
import FuenteDePagoCard from '../../abonos/FuenteDePagoCard';
import AbonoCard from '../../abonos/AbonoCard';
import { usePermissions } from '../../../hooks/auth/usePermissions';
import { Lock } from 'lucide-react';

const TabFinanciero = ({ vivienda, cliente, fuentes, historialAbonos, onAbonoRegistrado, onCondonarSaldo, onRegistrarDesembolso }) => {
    const { can } = usePermissions(); // <-- 2. Obtenemos la función de verificación
    const tienePermisoParaCrear = can('abonos', 'crear');

    return (
        <div className="animate-fade-in space-y-8">
            <div>
                <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Fuentes de Pago</h3>

                {/* Mensaje para usuarios sin permisos */}
                {!tienePermisoParaCrear && (
                    <div className="p-3 mb-4 bg-yellow-50 dark:bg-yellow-900/50 border-l-4 border-yellow-400 text-yellow-700 dark:text-yellow-300 rounded-r-lg">
                        <div className="flex items-center gap-3">
                            <Lock size={16} />
                            <p className="text-sm font-semibold">Modo de solo lectura. No tienes permisos para registrar pagos.</p>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    {fuentes.map(fuente => (
                        <FuenteDePagoCard
                            key={fuente.fuente}
                            {...fuente}
                            vivienda={vivienda}
                            cliente={cliente}
                            onAbonoRegistrado={tienePermisoParaCrear ? onAbonoRegistrado : null}
                            onCondonarSaldo={tienePermisoParaCrear ? () => onCondonarSaldo({ ...fuente, saldoPendiente: fuente.montoPactado - fuente.abonos.reduce((sum, a) => sum + a.monto, 0), vivienda, cliente }) : null}
                            onRegistrarDesembolso={tienePermisoParaCrear ? onRegistrarDesembolso : null}
                        />
                    ))}
                </div>
            </div>
            <div className="mt-12 pt-6 border-t dark:border-gray-700">
                <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Historial de Abonos</h3>
                {historialAbonos.length > 0 ? (
                    <div className="space-y-4">
                        {historialAbonos.map(abono => (
                            <AbonoCard key={abono.id} abono={abono} isReadOnly={true} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <p className="text-gray-500 dark:text-gray-400">Este cliente aún no ha realizado abonos.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TabFinanciero;