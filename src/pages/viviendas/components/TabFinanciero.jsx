import React from 'react';
import FinancialBreakdownCard from './FinancialBreakdownCard';
import FuenteDePagoCard from '../../abonos/FuenteDePagoCard';
import AbonoCard from '../../abonos/AbonoCard';
import { formatCurrency } from '../../../utils/textFormatters';
import { CheckCircle } from 'lucide-react';

const TabFinanciero = ({ datosDetalle, recargarDatos }) => {
    const { vivienda, cliente, historialAbonos, fuentes, desgloseValorVivienda, desgloseTotalAbonado } = datosDetalle;

    return (
        <div className="animate-fade-in space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FinancialBreakdownCard title="Valor Final de Venta" total={vivienda.valorFinal} items={desgloseValorVivienda} colorClass="text-blue-600" />
                <FinancialBreakdownCard title="Total Abonado" total={vivienda.totalAbonado} items={desgloseTotalAbonado} colorClass="text-green-600" />
                <div className={`bg-white p-4 rounded-lg border text-center flex flex-col justify-center ${vivienda.saldoPendiente <= 0 && vivienda.clienteId ? 'border-green-300' : 'border-gray-200'}`}>
                    <p className="text-sm font-medium text-gray-500">Saldo Pendiente</p>
                    <p className={`text-3xl font-bold ${vivienda.saldoPendiente <= 0 && vivienda.clienteId ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(vivienda.saldoPendiente)}
                    </p>
                    {vivienda.saldoPendiente <= 0 && vivienda.clienteId && (
                        <div className="mt-2 flex items-center justify-center gap-2 text-sm font-bold text-green-700 bg-green-100 p-2 rounded-md">
                            <CheckCircle size={16} /><span>¡A Paz y Salvo!</span>
                        </div>
                    )}
                </div>
            </div>
            <div className="pt-6 border-t">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Seguimiento por Fuente de Pago</h3>
                {fuentes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {fuentes.map(fuente => (<FuenteDePagoCard key={fuente.fuente} {...fuente} vivienda={vivienda} cliente={cliente} onAbonoRegistrado={recargarDatos} />))}
                    </div>
                ) : (<div className="bg-white p-6 rounded-xl border text-center text-gray-500">Esta vivienda no tiene un cliente con estructura financiera asignada.</div>)}
            </div>
            <div className="mt-6 pt-6 border-t">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Historial de Abonos Realizados</h3>
                {historialAbonos.length > 0 ? (
                    <div className="space-y-4">{historialAbonos.map(abono => <AbonoCard key={abono.id} abono={abono} isReadOnly={true} />)}</div>
                ) : (<div className="bg-white p-6 rounded-xl border text-center text-gray-500">No se han registrado abonos para esta vivienda.</div>)}
            </div>
        </div>
    );
};

export default TabFinanciero;