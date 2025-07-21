import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { User, FileWarning, FileText } from 'lucide-react';

const getDocumentosFaltantes = (cliente) => {
    const faltantes = [];
    if (!cliente.datosCliente.urlCedula) {
        faltantes.push('Cédula');
    }
    if (cliente.financiero?.aplicaCredito && !cliente.financiero.credito.urlCartaAprobacion) {
        faltantes.push('Carta Aprob. Crédito');
    }
    if (cliente.financiero?.aplicaSubsidioVivienda && !cliente.financiero.subsidioVivienda.urlSoporte) {
        faltantes.push('Soporte Sub. Vivienda');
    }
    if (cliente.financiero?.aplicaSubsidioCaja && !cliente.financiero.subsidioCaja.urlCartaAprobacion) {
        faltantes.push('Soporte Sub. Caja');
    }
    if (cliente.financiero?.gastosNotariales && !cliente.financiero.gastosNotariales.urlSoportePago) {
        faltantes.push('Soporte Gastos Notariales');
    }
    return faltantes;
};


const DocumentosPendientes = ({ clientes }) => {

    const clientesConPendientes = useMemo(() => {
        return clientes
            .filter(cliente => cliente.status !== 'renunciado')
            .map(cliente => ({
                cliente,
                documentosFaltantes: getDocumentosFaltantes(cliente)
            }))
            .filter(item => item.documentosFaltantes.length > 0);
    }, [clientes]);


    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg h-full">
            <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
                <FileWarning className="text-orange-500" />
                Documentación Pendiente
            </h2>
            <div className='max-h-80 overflow-y-auto'>
                {clientesConPendientes.length > 0 ? (
                    <ul className="space-y-3">
                        {clientesConPendientes.map(({ cliente, documentosFaltantes }) => (
                            <li key={cliente.id}>
                                <Link to={`/clientes/detalle/${cliente.id}`} state={{ defaultTab: 'documentos' }} className="block p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-full">
                                                <User size={16} className="text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <p className="font-semibold text-gray-800 dark:text-gray-200">{cliente.datosCliente.nombres} {cliente.datosCliente.apellidos}</p>
                                        </div>
                                    </div>
                                    <div className='mt-2 pl-11 text-xs'>
                                        <p className='text-orange-700 dark:text-orange-400 font-semibold flex items-center gap-1.5'>
                                            <FileText size={14} />
                                            Falta: <span className='font-normal text-orange-600 dark:text-orange-500'>{documentosFaltantes.join(', ')}</span>
                                        </p>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-10">
                        <p className="text-gray-500 dark:text-gray-400">¡Felicidades!</p>
                        <p className="font-semibold text-green-600 dark:text-green-400 mt-1">Todos los clientes activos tienen su documentación completa.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DocumentosPendientes;