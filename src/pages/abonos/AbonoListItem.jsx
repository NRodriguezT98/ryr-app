// src/pages/abonos/components/AbonoListItem.jsx

import React from 'react';
import { formatCurrency, formatDisplayDate, toTitleCase } from '../../utils/textFormatters';
import { Calendar, FileText, Hash, User, Home, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const InfoRow = ({ icon, children }) => (
    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        {icon}
        <span className="truncate">{children}</span>
    </div>
);

const AbonoListItem = ({ abono, cliente, vivienda, proyecto }) => {
    return (
        <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border dark:border-gray-600">
            <div className="flex justify-between items-start">
                <div>
                    <p className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                        <Hash size={12} />
                        <span>Recibo N° {String(abono.consecutivo).padStart(4, '0')}</span>
                    </p>
                    <p className="font-bold text-lg text-green-600 dark:text-green-400">
                        {formatCurrency(abono.monto)}
                    </p>
                </div>
                <a
                    href={abono.urlComprobante}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 px-2 py-1 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/50"
                >
                    <FileText size={14} />
                    Ver Soporte
                </a>
            </div>
            <div className="mt-2 pt-2 border-t border-dashed dark:border-gray-600 space-y-1.5">
                <InfoRow icon={<Calendar size={12} />}>
                    Pagado el: <span className="font-semibold text-gray-700 dark:text-gray-300">{formatDisplayDate(abono.fechaPago)}</span>
                </InfoRow>
                <InfoRow icon={<User size={12} />}>
                    <Link to={`/clientes/detalle/${cliente.id}`} className="hover:underline font-semibold text-gray-700 dark:text-gray-300" title={toTitleCase(`${cliente.datosCliente.nombres} ${cliente.datosCliente.apellidos}`)}>
                        {toTitleCase(`${cliente.datosCliente.nombres} ${cliente.datosCliente.apellidos}`)}
                    </Link>
                </InfoRow>
                <InfoRow icon={<Home size={12} />}>
                    <Link to={`/viviendas/detalle/${vivienda.id}`} className="hover:underline font-semibold text-gray-700 dark:text-gray-300">
                        {`Mz ${vivienda.manzana} - Casa ${vivienda.numeroCasa}`}
                    </Link>
                </InfoRow>
                <InfoRow icon={<Building2 size={12} />}>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{proyecto.nombre}</span>
                </InfoRow>
            </div>
        </div>
    );
};

export default AbonoListItem;