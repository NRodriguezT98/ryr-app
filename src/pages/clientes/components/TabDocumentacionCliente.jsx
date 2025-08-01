import React from 'react';
import { useDocumentacion } from '../../../hooks/clientes/useDocumentacion';
import DocumentoRow from '../../../components/documentos/DocumentoRow';
import ClienteEstadoView from './ClienteEstadoView';
import { AlertTriangle } from 'lucide-react';

const TabDocumentacionCliente = ({ cliente, renuncia }) => {
    const { filtro, setFiltro, documentosFiltrados } = useDocumentacion(cliente);

    const isClientInactive = cliente.status === 'renunciado' || cliente.status === 'inactivo';
    if (isClientInactive) {
        return <ClienteEstadoView cliente={cliente} renuncia={renuncia} contexto="documentacion" />;
    }

    return (
        <div className="animate-fade-in bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-sm">
            <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                <h3 className="font-bold text-lg dark:text-gray-200">Repositorio de Documentos</h3>
                <div className="flex-shrink-0 bg-gray-100 dark:bg-gray-700/50 p-1 rounded-lg">
                    <button onClick={() => setFiltro('importantes')} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${filtro === 'importantes' ? 'bg-white dark:bg-gray-900 shadow text-blue-600' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>Importantes</button>
                    <button onClick={() => setFiltro('todos')} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${filtro === 'todos' ? 'bg-white dark:bg-gray-900 shadow text-gray-800 dark:text-gray-100' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>Todos</button>
                </div>
            </div>

            {cliente.tieneRenunciaPendiente && (
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border-b dark:border-gray-700 flex items-center gap-3">
                    <AlertTriangle size={20} className="text-orange-500" />
                    <p className="text-sm text-orange-700 dark:text-orange-300 font-semibold">
                        Modo de solo lectura: La gestión de documentos está pausada durante el proceso de renuncia.
                    </p>
                </div>
            )}

            <div className="divide-y dark:divide-gray-700">
                {documentosFiltrados.length > 0 ? (
                    documentosFiltrados.map(doc => (
                        <DocumentoRow
                            key={doc.id}
                            label={doc.label}
                            isRequired={true}
                            currentFileUrl={doc.url}
                            estado={doc.estado}
                            isReadOnly={cliente.tieneRenunciaPendiente}
                        />
                    ))
                ) : (
                    <p className="p-8 text-center text-gray-500 dark:text-gray-400">
                        No hay documentos que coincidan con el filtro actual.
                    </p>
                )}
            </div>
        </div>
    );
};

export default TabDocumentacionCliente;