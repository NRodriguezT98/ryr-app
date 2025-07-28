import React from 'react';
import { Link } from 'react-router-dom';
import { User, Phone, MapPin, Home, HelpCircle, CheckCircle, AlertTriangle, Archive, UserX } from 'lucide-react';
import { formatCurrency, formatID } from '../../../utils/textFormatters';
import ClienteEstadoView from './ClienteEstadoView';

const FuenteFinanciera = ({ titulo, montoPactado, abonos, fuente, banco = '', caso = '' }) => {
    const totalAbonado = (abonos || []).filter(a => a.fuente === fuente).reduce((sum, abono) => sum + abono.monto, 0);
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

const TabInfoGeneralCliente = ({ cliente, renuncia }) => {
    const { datosCliente, status, tieneRenunciaPendiente, vivienda, financiero, historialAbonos } = cliente;
    const isArchivado = status === 'inactivo';
    const isRenunciado = status === 'renunciado';

    if (isArchivado || isRenunciado) {
        return <ClienteEstadoView cliente={cliente} renuncia={renuncia} contexto="infoGeneral" />;
    }

    return (
        <div className="animate-fade-in space-y-6">
            {tieneRenunciaPendiente && renuncia && (
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-400 dark:border-orange-500 rounded-r-lg flex items-center gap-4">
                    <AlertTriangle size={32} className="text-orange-500 dark:text-orange-400 flex-shrink-0" />
                    <div>
                        <h4 className="font-bold text-orange-800 dark:text-orange-200">Renuncia en Proceso</h4>
                        <p className="text-sm text-orange-700 dark:text-orange-300">
                            Este cliente tiene una renuncia pendiente. La información es de solo lectura hasta que se cierre el caso.
                        </p>
                        <Link to={`/renuncias/detalle/${renuncia.id}`} className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline mt-1 block">
                            Ir a Gestionar Renuncia
                        </Link>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border dark:border-gray-700">
                        <h3 className="font-bold text-lg mb-4 border-b dark:border-gray-700 pb-2 dark:text-gray-200">Información Personal</h3>
                        <div className="space-y-3 text-sm">
                            <p className="flex items-center gap-3 dark:text-gray-300"><Phone className="text-gray-400" size={16} /> {datosCliente.telefono}</p>
                            <p className="flex items-center gap-3 dark:text-gray-300"><User className="text-gray-400" size={16} /> C.C. {formatID(datosCliente.cedula)}</p>
                            <p className="flex items-center gap-3 dark:text-gray-300"><MapPin className="text-gray-400" size={16} /> {datosCliente.direccion}</p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border dark:border-gray-700">
                        <h3 className="font-bold text-lg mb-4 border-b dark:border-gray-700 pb-2 dark:text-gray-200">
                            {tieneRenunciaPendiente ? 'Vivienda a la cual renunció' : 'Vivienda Asignada'}
                        </h3>
                        {vivienda ? (
                            <div className="space-y-3 text-sm">
                                <p className="flex items-center gap-3 dark:text-gray-300 font-semibold"><Home className="text-gray-400" size={16} /> {`Mz. ${vivienda.manzana} - Casa ${vivienda.numeroCasa}`}</p>
                                {tieneRenunciaPendiente && (
                                    <div className="mt-4 pt-4 border-t dark:border-gray-600 space-y-3 text-gray-600 dark:text-gray-300">
                                        <HelpCircle size={32} className="mx-auto text-blue-500" />
                                        <p className="text-center">Si esta renuncia fue un error, puedes cancelarla desde el módulo de "Renuncias".</p>
                                        <p className="text-xs text-center text-gray-400">Si la vivienda sigue disponible, será reasignada, de lo contrario tendra que terminar el proceso de renuncia e iniciar un nuevo proceso.</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">Este cliente no tiene una vivienda asignada.</p>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border dark:border-gray-700">
                        <h3 className="font-bold text-lg mb-4 border-b dark:border-gray-700 pb-2 dark:text-gray-200">
                            {tieneRenunciaPendiente ? 'Cierre Financiero (Congelado)' : 'Cierre Financiero'}
                        </h3>
                        {Object.keys(financiero || {}).length > 0 ? (
                            <div className="space-y-4">
                                {financiero.aplicaCuotaInicial && <FuenteFinanciera titulo="Cuota Inicial" montoPactado={financiero.cuotaInicial.monto} abonos={historialAbonos} fuente="cuotaInicial" />}
                                {financiero.aplicaCredito && <FuenteFinanciera titulo="Crédito Hipotecario" montoPactado={financiero.credito.monto} abonos={historialAbonos} fuente="credito" banco={financiero.credito.banco} caso={financiero.credito.caso} />}
                                {financiero.aplicaSubsidioVivienda && <FuenteFinanciera titulo="Subsidio Mi Casa Ya" montoPactado={financiero.subsidioVivienda.monto} abonos={historialAbonos} fuente="subsidioVivienda" />}
                                {financiero.aplicaSubsidioCaja && <FuenteFinanciera titulo="Subsidio Caja de Compensación" montoPactado={financiero.subsidioCaja.monto} abonos={historialAbonos} fuente="subsidioCaja" banco={financiero.subsidioCaja.caja} />}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                No se ha definido una estructura financiera para este cliente.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TabInfoGeneralCliente;