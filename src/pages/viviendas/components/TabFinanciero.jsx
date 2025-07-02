import React from 'react';
import FuenteDePagoCard from '../../abonos/FuenteDePagoCard';
import AbonoCard from '../../abonos/AbonoCard';

const TabFinanciero = ({ fuentes, historialAbonos, vivienda, cliente, onAbonoRegistrado }) => {
    return (
        <div className="animate-fade-in space-y-8">
            <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Seguimiento por Fuente de Pago</h3>
                {fuentes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {fuentes.map(fuente => (
                            <FuenteDePagoCard key={fuente.fuente} {...fuente} vivienda={vivienda} onAbonoRegistrado={onAbonoRegistrado} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white p-6 rounded-xl border text-center text-gray-500">
                        Esta vivienda no tiene un cliente con estructura financiera asignada.
                    </div>
                )}
            </div>
            <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Historial de Abonos Realizados</h3>
                {historialAbonos.length > 0 ? (
                    <div className="space-y-4">
                        {historialAbonos.map(abono => (
                            <AbonoCard key={abono.id} abono={{ ...abono, clienteNombre: cliente?.datosCliente?.nombres }} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white p-6 rounded-xl border text-center text-gray-500">
                        No se han registrado abonos para esta vivienda.
                    </div>
                )}
            </div>
        </div>
    );
};

export default TabFinanciero;