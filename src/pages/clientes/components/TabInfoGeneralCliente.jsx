import React from 'react';
import { Link } from 'react-router-dom';
import { User, Phone, MapPin, Home, BadgePercent, CheckCircle, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatID } from '../../../utils/textFormatters';

const FuenteFinanciera = ({ titulo, montoPactado, abonos, fuente, banco = '' }) => {
    const totalAbonado = abonos.filter(a => a.fuente === fuente).reduce((sum, abono) => sum + abono.monto, 0);
    const saldoPendiente = montoPactado - totalAbonado;

    return (
        <div className="p-3 bg-gray-50 rounded-lg">
            <p className="font-semibold">{titulo}</p>
            <p className="text-sm text-gray-600">
                Pactado: {formatCurrency(montoPactado)} {banco && `(${banco})`}
            </p>
            <div className="mt-2 pt-2 border-t border-gray-200">
                {saldoPendiente <= 0 ? (
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-green-600">
                        <CheckCircle size={14} /> A paz y salvo
                    </p>
                ) : (
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-red-600">
                        <AlertTriangle size={14} /> Pendiente: {formatCurrency(saldoPendiente)}
                    </p>
                )}
            </div>
        </div>
    );
};

const TabInfoGeneralCliente = ({ cliente, vivienda, historialAbonos }) => {
    const { datosCliente, financiero } = cliente;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-5 rounded-xl border">
                    <h3 className="font-bold text-lg mb-4 border-b pb-2">Información Personal</h3>
                    <div className="space-y-3 text-sm">
                        <p className="flex items-center gap-3"><Phone className="text-gray-400" size={16} /> {datosCliente.telefono}</p>
                        <p className="flex items-center gap-3"><User className="text-gray-400" size={16} /> C.C. {formatID(datosCliente.cedula)}</p>
                        <p className="flex items-center gap-3"><MapPin className="text-gray-400" size={16} /> {datosCliente.direccion}</p>
                    </div>
                </div>
                {vivienda ? (
                    <div className="bg-white p-5 rounded-xl border">
                        <h3 className="font-bold text-lg mb-4 border-b pb-2">Vivienda Asignada</h3>
                        <Link to={`/viviendas/detalle/${vivienda.id}`} className="space-y-3 text-sm hover:bg-gray-50 -m-5 p-5 block rounded-xl">
                            <p className="flex items-center gap-3"><Home className="text-gray-400" size={16} /> {`Mz. ${vivienda.manzana} - Casa ${vivienda.numeroCasa}`}</p>
                            {vivienda.descuentoMonto > 0 && <p className="flex items-center gap-3 text-purple-600"><BadgePercent className="text-purple-400" size={16} /> ¡Con descuento aplicado!</p>}
                            <div className="pt-2 border-t text-right">
                                <p>Saldo Pendiente: <span className="font-bold text-red-600">{formatCurrency(vivienda.saldoPendiente)}</span></p>
                            </div>
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white p-5 rounded-xl border">
                        <h3 className="font-bold text-lg mb-4 border-b pb-2">Vivienda Asignada</h3>
                        <p className="text-sm text-gray-500">Este cliente no tiene una vivienda asignada actualmente.</p>
                    </div>
                )}
            </div>
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-5 rounded-xl border">
                    <h3 className="font-bold text-lg mb-4 border-b pb-2">Cierre Financiero</h3>
                    {Object.keys(financiero || {}).length > 0 ? (
                        <div className="space-y-4">
                            {financiero.aplicaCuotaInicial && <FuenteFinanciera titulo="Cuota Inicial" montoPactado={financiero.cuotaInicial.monto} abonos={historialAbonos} fuente="cuotaInicial" />}
                            {financiero.aplicaCredito && <FuenteFinanciera titulo="Crédito Hipotecario" montoPactado={financiero.credito.monto} abonos={historialAbonos} fuente="credito" banco={financiero.credito.banco} />}
                            {financiero.aplicaSubsidioVivienda && <FuenteFinanciera titulo="Subsidio Mi Casa Ya" montoPactado={financiero.subsidioVivienda.monto} abonos={historialAbonos} fuente="subsidioVivienda" />}
                            {financiero.aplicaSubsidioCaja && <FuenteFinanciera titulo="Subsidio Caja de Compensación" montoPactado={financiero.subsidioCaja.monto} abonos={historialAbonos} fuente="subsidioCaja" banco={financiero.subsidioCaja.caja} />}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">No se ha definido una estructura financiera para este cliente.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TabInfoGeneralCliente;