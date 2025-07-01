import React from 'react';
import { Link } from 'react-router-dom';
import { User, AlertCircle, FileWarning } from 'lucide-react';

const DocumentosPendientes = ({ clientes }) => {
    const clientesConDocumentosPendientes = clientes.filter(cliente => {
        if (!cliente.datosCliente.urlCedula) return true;
        if (cliente.financiero.aplicaCredito && !cliente.financiero.credito.urlCartaAprobacion) return true;
        if (cliente.financiero.aplicaSubsidioVivienda && !cliente.financiero.subsidioVivienda.urlSoporte) return true;
        if (cliente.financiero.aplicaSubsidioCaja && !cliente.financiero.subsidioCaja.urlSoporte) return true;
        if (cliente.financiero.aplicaCuotaInicial && !cliente.financiero.cuotaInicial.urlSoportePago) return true;
        return false;
    });

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg h-full">
            <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
                <FileWarning className="text-orange-500" />
                Documentación Pendiente
            </h2>
            {clientesConDocumentosPendientes.length > 0 ? (
                <ul className="space-y-3">
                    {clientesConDocumentosPendientes.map(cliente => (
                        <li key={cliente.id}>
                            <Link to={`/clientes/detalle/${cliente.id}`} className="block p-3 rounded-lg hover:bg-gray-100 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-100 p-2 rounded-full">
                                            <User size={16} className="text-blue-600" />
                                        </div>
                                        <p className="font-semibold text-gray-800">{cliente.datosCliente.nombres} {cliente.datosCliente.apellidos}</p>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-orange-600 font-semibold">
                                        <AlertCircle size={14} />
                                        <span>Revisar</span>
                                    </div>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="text-center py-10">
                    <p className="text-gray-500">¡Felicidades!</p>
                    <p className="font-semibold text-green-600 mt-1">Todos los clientes tienen su documentación completa.</p>
                </div>
            )}
        </div>
    );
};

export default DocumentosPendientes;