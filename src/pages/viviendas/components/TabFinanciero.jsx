import React from 'react';
import FuenteDePagoCard from '../../abonos/FuenteDePagoCard';
import AbonoCard from '../../abonos/AbonoCard';

const TabFinanciero = ({ vivienda, cliente, fuentes, historialAbonos, onAbonoRegistrado, onCondonarSaldo }) => {
    return (
        <div className="animate-fade-in space-y-8">
            <div>
                <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Fuentes de Pago</h3>
                <div className="space-y-4">
                    {fuentes.map(fuente => (
                        <FuenteDePagoCard
                            key={fuente.fuente}
                            {...fuente}
                            vivienda={vivienda}
                            cliente={cliente}
                            onAbonoRegistrado={onAbonoRegistrado}
                            onCondonarSaldo={() => onCondonarSaldo({ ...fuente, saldoPendiente: fuente.montoPactado - fuente.abonos.reduce((sum, a) => sum + a.monto, 0), vivienda, cliente })}
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