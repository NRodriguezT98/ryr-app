import React from 'react';

const formatCurrency = (value) => {
    if (typeof value !== 'number' || isNaN(value)) {
        return '$ 0';
    }
    return value.toLocaleString("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0
    });
};

/**
 * Componente de presentación para el resumen de abonos de una vivienda.
 * @param {object} props - Las propiedades del componente.
 * @param {object} props.resumen - El objeto con los datos del resumen.
 */
const ResumenAbonos = ({ resumen }) => {
    if (!resumen) {
        return null;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
                <p className="text-sm font-medium text-gray-600">Valor Total Vivienda</p>
                <p className="text-lg font-bold text-gray-800">
                    {formatCurrency(resumen.valorTotal)}
                </p>
            </div>
            <div>
                <p className="text-sm font-medium text-gray-600">Total Abonado</p>
                <p className="text-lg font-bold text-green-700">
                    {formatCurrency(resumen.totalAbonado)}
                </p>
            </div>
            <div>
                <p className="text-sm font-medium text-gray-600">Saldo Pendiente</p>
                <p className="text-lg font-bold text-red-600">
                    {formatCurrency(resumen.saldoPendiente)}
                </p>
            </div>
        </div>
    );
};

export default ResumenAbonos;