import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, DollarSign, Wallet, MessageSquare, Download, Home } from 'lucide-react';

const formatCurrency = (value) => (value || 0).toLocaleString("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 });

const formatDate = (dateString) => {
    if (!dateString) return "Fecha inválida";
    try {
        const date = new Date(dateString + 'T00:00:00');
        return format(date, "d 'de' MMMM 'de' yyyy", { locale: es });
    } catch (error) {
        return "Fecha inválida";
    }
};

const AbonoCard = ({ abono }) => {
    return (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-full">
                    <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div>
                    <p className="font-bold text-lg text-gray-800">{formatCurrency(abono.monto)}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                        <Wallet size={14} /> {abono.metodoPago || 'No especificado'}
                    </p>
                </div>
            </div>
            <div className="w-full sm:w-auto flex-grow pl-0 sm:pl-4">
                {abono.observacion && (
                    <p className="text-xs text-gray-600 italic flex items-start gap-2 mb-2">
                        <MessageSquare size={14} className="mt-0.5 flex-shrink-0" />
                        <span>{abono.observacion}</span>
                    </p>
                )}
                {abono.urlComprobante && (
                    <a
                        href={abono.urlComprobante}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs text-blue-600 hover:underline font-semibold"
                    >
                        <Download size={14} /> Ver Comprobante
                    </a>
                )}
            </div>
            <div className="text-right space-y-1">
                <div className="text-xs text-gray-500 flex items-center justify-end gap-2">
                    <Calendar size={14} /> {formatDate(abono.fechaPago)}
                </div>
                {/* --- CAMPO ACTUALIZADO AQUÍ --- */}
                <div className="text-xs text-gray-500 font-semibold flex items-center justify-end gap-2">
                    <Home size={14} /> {abono.clienteInfo}
                </div>
            </div>
        </div>
    );
};

export default AbonoCard;