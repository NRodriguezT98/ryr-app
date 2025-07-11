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
    if (cliente.financiero?.aplicaSubsidioCaja && !cliente.financiero.subsidioCaja.urlSoporte) {
        faltantes.push('Soporte Sub. Caja');
    }
    if (cliente.financiero?.aplicaCuotaInicial && !cliente.financiero.cuotaInicial.urlSoportePago) {
        faltantes.push('Soporte Cuota Inicial');
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
        <div className="bg-white p-6 rounded-xl shadow-lg h-full">
            <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
                <FileWarning className="text-orange-500" />
                Documentación Pendiente
            </h2>
            <div className='max-h-80 overflow-y-auto'>
                {clientesConPendientes.length > 0 ? (
                    <ul className="space-y-3">
                        {clientesConPendientes.map(({ cliente, documentosFaltantes }) => (
                            <li key={cliente.id}>
                                <Link
                                    to={`/clientes/detalle/${cliente.id}`}
                                    state={{ defaultTab: 'documentos' }} // <-- AÑADIMOS ESTADO AL ENLACE
                                    className="block p-3 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-blue-100 p-2 rounded-full">
                                                <User size={16} className="text-blue-600" />
                                            </div>
                                            <p className="font-semibold text-gray-800">{cliente.datosCliente.nombres} {cliente.datosCliente.apellidos}</p>
                                        </div>
                                    </div>
                                    <div className='mt-2 pl-11 text-xs'>
                                        <p className='text-orange-700 font-semibold flex items-center gap-1.5'>
                                            <FileText size={14} />
                                            Falta: <span className='font-normal text-orange-600'>{documentosFaltantes.join(', ')}</span>
                                        </p>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-10">
                        <p className="text-gray-500">¡Felicidades!</p>
                        <p className="font-semibold text-green-600 mt-1">Todos los clientes activos tienen su documentación completa.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DocumentosPendientes;