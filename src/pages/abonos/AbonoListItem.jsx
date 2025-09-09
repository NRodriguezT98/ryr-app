// src/pages/abonos/components/AbonoListItem.jsx

import React from 'react';
import { formatCurrency, formatDisplayDate } from '../../utils/textFormatters';
import { Calendar, FileText, Hash } from 'lucide-react';

const AbonoListItem = ({ abono }) => {
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
            <div className="mt-2 pt-2 border-t border-dashed dark:border-gray-600 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <Calendar size={12} />
                <span>Pagado el: {formatDisplayDate(abono.fechaPago)}</span>
            </div>
        </div>
    );
};

export default AbonoListItem;