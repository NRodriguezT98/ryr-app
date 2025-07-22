import React from 'react';
import { Link } from 'react-router-dom';
import { User, Phone, MapPin, Home, BadgePercent, CheckCircle, AlertTriangle, FileText } from 'lucide-react';
import { formatCurrency, formatID } from '../../../utils/textFormatters';

const FuenteFinanciera = ({ titulo, montoPactado, abonos, fuente, banco = '', caso = '' }) => {
    const totalAbonado = abonos.filter(a => a.fuente === fuente).reduce((sum, abono) => sum + abono.monto, 0);
    const saldoPendiente = montoPactado - totalAbonado;

    return (
        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="font-semibold dark:text-gray-200">{titulo}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
                Pactado: {formatCurrency(montoPactado)} {banco && `(${banco})`}
            </p>
            {caso && (
                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1">
                    Caso SIB: {caso}
                </p>
            )}
            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600 flex justify-between items-center">
                {saldoPendiente <= 0 ? (
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-green-600 dark:text-green-400">
                        <CheckCircle size={14} /> A paz y salvo
                    </p>
                ) : (
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-400">
                        <AlertTriangle size={14} /> Pendiente: {formatCurrency(saldoPendiente)}
                    </p>
                )}
            </div>
        </div>
    );
};

const TabInfoGeneralCliente = ({ cliente, vivienda, historialAbonos }) => {
    const { datosCliente, financiero } = cliente;

    // Se determina si la vivienda está pagada para cambiar el color del saldo
    const isPagada = vivienda && vivienda.saldoPendiente <= 0;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border dark:border-gray-700">
                    <h3 className="font-bold text-lg mb-4 border-b dark:border-gray-700 pb-2 dark:text-gray-200">Información Personal</h3>
                    <div className="space-y-3 text-sm">
                        <p className="flex items-center gap-3 dark:text-gray-300"><Phone className="text-gray-400" size={16} /> {datosCliente.telefono}</p>
                        <p className="flex items-center gap-3 dark:text-gray-300"><User className="text-gray-400" size={16} /> C.C. {formatID(datosCliente.cedula)}</p>
                        <p className="flex items-center gap-3 dark:text-gray-300"><MapPin className="text-gray-400" size={16} /> {datosCliente.direccion}</p>
                    </div>
                </div>
                {vivienda ? (
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border dark:border-gray-700">
                        <h3 className="font-bold text-lg mb-4 border-b dark:border-gray-700 pb-2 dark:text-gray-200">Vivienda Asignada</h3>
                        <Link to={`/viviendas/detalle/${vivienda.id}`} className="space-y-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 -m-5 p-5 block rounded-xl">
                            <p className="flex items-center gap-3 dark:text-gray-300"><Home className="text-gray-400" size={16} /> {`Mz. ${vivienda.manzana} - Casa ${vivienda.numeroCasa}`}</p>
                            {vivienda.descuentoMonto > 0 && <p className="flex items-center gap-3 text-purple-600 dark:text-purple-400"><BadgePercent className="text-purple-400" size={16} /> ¡Con descuento aplicado!</p>}
                            <div className="pt-2 border-t dark:border-gray-700 text-right">
                                <p className='dark:text-gray-300'>Saldo Pendiente: <span className={`font-bold ${isPagada ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{formatCurrency(vivienda.saldoPendiente)}</span></p>
                            </div>
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border dark:border-gray-700">
                        <h3 className="font-bold text-lg mb-4 border-b dark:border-gray-700 pb-2 dark:text-gray-200">Vivienda Asignada</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Este cliente no tiene una vivienda asignada actualmente.</p>
                    </div>
                )}
            </div>
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border dark:border-gray-700">
                    <h3 className="font-bold text-lg mb-4 border-b dark:border-gray-700 pb-2 dark:text-gray-200">Cierre Financiero</h3>
                    {Object.keys(financiero || {}).length > 0 ? (
                        <div className="space-y-4">
                            {financiero.aplicaCuotaInicial && <FuenteFinanciera titulo="Cuota Inicial" montoPactado={financiero.cuotaInicial.monto} abonos={historialAbonos} fuente="cuotaInicial" />}
                            {financiero.aplicaCredito && <FuenteFinanciera titulo="Crédito Hipotecario" montoPactado={financiero.credito.monto} abonos={historialAbonos} fuente="credito" banco={financiero.credito.banco} caso={financiero.credito.caso} />}
                            {financiero.aplicaSubsidioVivienda && <FuenteFinanciera titulo="Subsidio Mi Casa Ya" montoPactado={financiero.subsidioVivienda.monto} abonos={historialAbonos} fuente="subsidioVivienda" />}
                            {financiero.aplicaSubsidioCaja && <FuenteFinanciera titulo="Subsidio Caja de Compensación" montoPactado={financiero.subsidioCaja.monto} abonos={historialAbonos} fuente="subsidioCaja" banco={financiero.subsidioCaja.caja} />}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">No se ha definido una estructura financiera para este cliente.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TabInfoGeneralCliente;