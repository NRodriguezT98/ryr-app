import React from 'react';
import { getInitials } from '../../../utils/textFormatters';
import { determineClientStatus } from '../../../utils/statusHelper';

const ClienteListItem = ({ cliente, isSelected, onClick }) => {
    const { datosCliente } = cliente;
    const statusInfo = determineClientStatus(cliente);

    return (
        <button
            onClick={onClick}
            className={`w-full text-left flex items-center p-3 rounded-lg transition-colors duration-150 ${isSelected ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
        >
            <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-lg ${isSelected ? 'bg-blue-800 text-white' : 'bg-blue-100 text-blue-700'}`}>
                {getInitials(datosCliente.nombres, datosCliente.apellidos)}
            </div>
            <div className="ml-3 overflow-hidden">
                <p className={`font-semibold truncate ${isSelected ? 'text-white' : 'text-gray-800'}`}>
                    {datosCliente.nombres} {datosCliente.apellidos}
                </p>
                <p className={`text-xs truncate ${isSelected ? 'text-blue-200' : 'text-gray-500'}`}>
                    {statusInfo.text}
                </p>
            </div>
        </button>
    );
};

export default ClienteListItem;