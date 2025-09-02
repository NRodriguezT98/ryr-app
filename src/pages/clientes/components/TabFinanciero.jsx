// src/pages/clientes/components/TabFinanciero.jsx
import React from 'react';
import { Wallet, AlertTriangle, Info } from 'lucide-react';
import { formatCurrency } from '../../../utils/textFormatters';

// Sub-componentes reutilizados de tu código
const InfoCard = ({ title, icon, children }) => (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border dark:border-gray-700 h-full">
        <h3 className="font-bold text-lg flex items-center gap-2 text-gray-700 dark:text-gray-200 mb-4 border-b dark:border-gray-600 pb-3">{icon} {title}</h3>
        <div className="text-sm">{children}</div>
    </div>
);
const InfoRow = ({ label, value }) => (
    <div className="flex justify-between items-center py-1"><span className="font-semibold text-gray-800 dark:text-gray-200">{label}:</span><span className="text-gray-600 dark:text-gray-300">{value}</span></div>
);
const FuenteFinancieraCard = ({ titulo, montoPactado, abonos, fuente }) => {
    const totalAbonado = (abonos || []).filter(a => a.fuente === fuente).reduce((sum, abono) => sum + abono.monto, 0);
    const isCompletada = totalAbonado >= montoPactado;
    return (
        <div className={`p-3 rounded-lg flex items-center justify-between ${isCompletada ? 'bg-green-50 dark:bg-green-900/30' : 'bg-gray-50 dark:bg-gray-700/50'}`}>
            <span className={`font-semibold ${isCompletada ? 'text-green-800 dark:text-green-300' : 'text-gray-700 dark:text-gray-200'}`}>{titulo}</span>
            <div className="text-right">
                <p className={`font-bold text-sm ${isCompletada ? 'text-green-700 dark:text-green-300' : 'text-gray-800 dark:text-gray-100'}`}>{formatCurrency(totalAbonado)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">de {formatCurrency(montoPactado)}</p>
            </div>
        </div>
    );
};

const TabFinanciero = ({ cliente, vivienda, historialAbonos }) => {
    const { financiero } = cliente;
    const mostrarAvisoValorEscritura = vivienda?.valorEscritura > 0 && vivienda?.valorEscritura !== vivienda?.valorFinal;

    return (
        <div className="animate-fade-in">
            <InfoCard title="Resumen de Cierre Financiero" icon={<Wallet size={20} />}>
                {mostrarAvisoValorEscritura && (
                    <div className="p-3 mb-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 rounded-r-lg">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="h-5 w-5 text-yellow-500" />
                            <div className="text-sm">
                                <p className="font-bold text-yellow-800 dark:text-yellow-200">Aviso: Valor de Escritura diferente al Comercial.</p>
                                <p className="text-xs text-yellow-700 dark:text-yellow-300">Escritura: {formatCurrency(vivienda.valorEscritura)}</p>
                            </div>
                        </div>
                    </div>
                )}
                {Object.keys(financiero || {}).length > 0 ? (
                    <div className="space-y-3">
                        {financiero.aplicaCuotaInicial && <FuenteFinancieraCard titulo="Cuota Inicial" montoPactado={financiero.cuotaInicial.monto} abonos={historialAbonos} fuente="cuotaInicial" />}
                        {financiero.aplicaCredito && <FuenteFinancieraCard titulo="Crédito Hipotecario" montoPactado={financiero.credito.monto} abonos={historialAbonos} fuente="credito" />}
                        {financiero.aplicaSubsidioVivienda && <FuenteFinancieraCard titulo="Subsidio Mi Casa Ya" montoPactado={financiero.subsidioVivienda.monto} abonos={historialAbonos} fuente="subsidioVivienda" />}
                        {financiero.aplicaSubsidioCaja && <FuenteFinancieraCard titulo="Subsidio Caja de Compensación" montoPactado={financiero.subsidioCaja.monto} abonos={historialAbonos} fuente="subsidioCaja" />}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No se ha definido una estructura financiera para este cliente.</p>
                )}
            </InfoCard>
        </div>
    );
};

export default TabFinanciero;