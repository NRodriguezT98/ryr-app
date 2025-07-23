import React from 'react';
import { useDocumentacion } from '../../../hooks/clientes/useDocumentacion';
import DocumentoRow from '../../../components/documentos/DocumentoRow';
import { UserX } from 'lucide-react'; // Importamos el ícono
import { Link } from 'react-router-dom'; // Importamos Link

const TabDocumentacionCliente = ({ cliente }) => {
    const { filtro, setFiltro, documentosFiltrados } = useDocumentacion(cliente);

    // --- INICIO DE LA MODIFICACIÓN ---
    if (cliente.status === 'renunciado') {
        return (
            <div className="animate-fade-in text-center p-8 bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed dark:border-gray-700">
                <UserX size={48} className="mx-auto text-orange-400" />
                <h3 className="mt-4 text-xl font-bold text-gray-800 dark:text-gray-100">Documentación Archivada</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Los documentos asociados al proceso de venta anterior de este cliente han sido archivados.
                </p>
                <Link to="/renuncias" className="mt-6 inline-flex items-center text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                    Consultar el Historial de Renuncias
                </Link>
            </div>
        );
    }
    // --- FIN DE LA MODIFICACIÓN ---

    return (
        <div className="animate-fade-in bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-sm">
            <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                <h3 className="font-bold text-lg dark:text-gray-200">Repositorio de Documentos</h3>
                <div className="flex-shrink-0 bg-gray-100 dark:bg-gray-700/50 p-1 rounded-lg">
                    <button onClick={() => setFiltro('importantes')} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${filtro === 'importantes' ? 'bg-white dark:bg-gray-900 shadow text-blue-600' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>Importantes</button>
                    <button onClick={() => setFiltro('todos')} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${filtro === 'todos' ? 'bg-white dark:bg-gray-900 shadow text-gray-800 dark:text-gray-100' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>Todos</button>
                </div>
            </div>
            <div className="divide-y dark:divide-gray-700">
                {documentosFiltrados.length > 0 ? (
                    documentosFiltrados.map(doc => (
                        <DocumentoRow
                            key={doc.id}
                            label={doc.label}
                            isRequired={true}
                            currentFileUrl={doc.url}
                            estado={doc.estado}
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