import React from 'react';
import { formatCurrency } from '../../../utils/textFormatters';

const BreakdownRow = ({ label, value }) => (
    <div className="flex justify-between items-center text-xs">
        <span className="text-gray-600">{label}:</span>
        <span className="font-medium text-gray-800">{formatCurrency(value)}</span>
    </div>
);

const FinancialBreakdownCard = ({ title, total, items = [], colorClass }) => {
    return (
        <div className="bg-white p-4 rounded-lg border flex flex-col">
            <p className="text-sm font-medium text-gray-500 text-center mb-2">{title}</p>
            {/* El desglose ahora va primero y ocupa el espacio disponible */}
            <div className="space-y-1 flex-grow mb-2">
                {items.map(item => (
                    item.value > 0 && <BreakdownRow key={item.label} label={item.label} value={item.value} />
                ))}
            </div>
            {/* La línea y el total ahora van al final */}
            <div className="border-t mt-auto pt-2">
                <p className={`text-2xl font-bold text-center ${colorClass}`}>{formatCurrency(total)}</p>
            </div>
        </div>
    );
};

export default FinancialBreakdownCard;