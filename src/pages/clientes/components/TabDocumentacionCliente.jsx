import React from 'react';
import { FileText, Eye, Calendar } from 'lucide-react';
import { formatDisplayDate } from '../../../utils/textFormatters';
import { useDocumentacion } from '../../../hooks/clientes/useDocumentacion'; // <-- 1. Importamos el nuevo hook

const DocumentoItem = ({ documento }) => (
    <div className="flex items-center justify-between p-4 border-b last:border-b-0">
        <div className="flex items-center gap-4">
            <FileText size={24} className="text-gray-400 flex-shrink-0" />
            <div>
                <p className="font-semibold text-gray-800">{documento.label}</p>
                <p className="text-xs text-gray-500">{`Paso del proceso: "${documento.pasoLabel}"`}</p>
                {documento.fechaSubida && (
                    <p className="text-xs text-blue-600 font-semibold flex items-center gap-1.5 mt-1">
                        <Calendar size={12} />
                        {`Subido el ${formatDisplayDate(documento.fechaSubida)}`}
                    </p>
                )}
            </div>
        </div>
        <a
            href={documento.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-blue-100 text-blue-700 font-semibold px-3 py-1.5 rounded-lg text-sm hover:bg-blue-200 transition-colors"
        >
            <Eye size={16} />
            Ver Documento
        </a>
    </div>
);

const TabDocumentacionCliente = ({ cliente }) => {
    // --- 2. El componente ahora solo consume el hook ---
    const { filtro, setFiltro, documentosFiltrados } = useDocumentacion(cliente);

    return (
        <div className="animate-fade-in bg-white border rounded-xl shadow-sm">
            <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-bold text-lg">Repositorio de Documentos</h3>
                <div className="flex-shrink-0 bg-gray-100 p-1 rounded-lg">
                    <button onClick={() => setFiltro('importantes')} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${filtro === 'importantes' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:bg-gray-200'}`}>Importantes</button>
                    <button onClick={() => setFiltro('todos')} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${filtro === 'todos' ? 'bg-white shadow text-gray-800' : 'text-gray-600 hover:bg-gray-200'}`}>Todos</button>
                </div>
            </div>
            <div>
                {documentosFiltrados.length > 0 ? (
                    documentosFiltrados.map(doc => <DocumentoItem key={doc.id} documento={doc} />)
                ) : (
                    <p className="p-8 text-center text-gray-500">
                        No hay documentos que coincidan con el filtro actual.
                    </p>
                )}
            </div>
        </div>
    );
};

export default TabDocumentacionCliente;