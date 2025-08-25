import React from 'react';
import { formatCurrency } from '../../../utils/textFormatters';
import { Home, TrendingUp, User, Landmark, Building, PiggyBank, Award, FileSignature } from 'lucide-react';

const DetailRow = ({ label, value }) => (
    <div>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-gray-800 dark:text-gray-200">{value || 'No especificado'}</p>
    </div>
);

const DetailSection = ({ icon, title, children }) => (
    <div>
        <h4 className="font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-2 mb-2">
            {icon} {title}
        </h4>
        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-3">
            {children}
        </div>
    </div>
);

const RestartProcessDetails = ({ log }) => {
    const details = log.details || {};
    const { datosCliente, financiero } = details.snapshotCompleto || {};

    if (!datosCliente || !financiero) {
        return <p className="text-sm text-red-500">No se encontraron los datos del snapshot para este registro.</p>;
    }

    return (
        <div className="text-sm space-y-4">
            <DetailSection icon={<User size={16} />} title="Datos del Cliente">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <DetailRow label="Nombres" value={datosCliente.nombres} />
                    <DetailRow label="Apellidos" value={datosCliente.apellidos} />
                    <DetailRow label="Cédula" value={datosCliente.cedula} />
                    <DetailRow label="Teléfono" value={datosCliente.telefono} />
                    <DetailRow label="Correo" value={datosCliente.correo} />
                    <DetailRow label="Dirección" value={datosCliente.direccion} />
                </div>
            </DetailSection>

            <DetailSection icon={<Home size={16} />} title="Vivienda Asignada">
                <p className="text-gray-800 dark:text-gray-200">{details.nombreNuevaVivienda}</p>
            </DetailSection>

            <DetailSection icon={<TrendingUp size={16} />} title="Cierre Financiero">
                {financiero.aplicaCuotaInicial && <div className="flex items-center gap-2"><PiggyBank size={14} className="text-gray-500 flex-shrink-0" /> <DetailRow label="Cuota Inicial" value={formatCurrency(financiero.cuotaInicial.monto)} /></div>}
                {financiero.aplicaCredito && <div className="flex items-center gap-2"><Landmark size={14} className="text-gray-500 flex-shrink-0" /> <DetailRow label="Crédito Hipotecario" value={`${formatCurrency(financiero.credito.monto)} (${financiero.credito.banco})`} /></div>}
                {financiero.aplicaSubsidioVivienda && <div className="flex items-center gap-2"><Award size={14} className="text-gray-500 flex-shrink-0" /> <DetailRow label="Subsidio Mi Casa Ya" value={formatCurrency(financiero.subsidioVivienda.monto)} /></div>}
                {financiero.aplicaSubsidioCaja && <div className="flex items-center gap-2"><Building size={14} className="text-gray-500 flex-shrink-0" /> <DetailRow label="Subsidio Caja Comp." value={`${formatCurrency(financiero.subsidioCaja.monto)} (${financiero.subsidioCaja.caja})`} /></div>}
                {financiero.usaValorEscrituraDiferente && <div className="flex items-center gap-2"><FileSignature size={14} className="text-gray-500 flex-shrink-0" /> <DetailRow label="Valor Escritura" value={formatCurrency(financiero.valorEscritura)} /></div>}
            </DetailSection>
        </div>
    );
};

export default RestartProcessDetails;