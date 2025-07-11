import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle, FileWarning, Eye, Download, Trash2, Loader } from 'lucide-react';
import FileUpload from '../FileUpload';

const DocumentoCard = ({ label, isRequired, currentFileUrl, filePath, onUploadSuccess, onRemove }) => {

    if (!isRequired) {
        return null;
    }

    const [isDownloading, setIsDownloading] = useState(false);
    const isUploaded = !!currentFileUrl;

    const handleDownload = async () => {
        if (!currentFileUrl) return;
        setIsDownloading(true);
        toast('Iniciando descarga...', { icon: '⏳' });
        try {
            // Fetch del archivo
            const response = await fetch(currentFileUrl);
            const blob = await response.blob();

            // Crear un enlace temporal para la descarga
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            // Extraer o generar un nombre de archivo
            const fileName = currentFileUrl.split('/').pop().split('?')[0].split('%2F').pop() || `documento-${label.replace(' ', '_')}`;
            link.setAttribute('download', fileName);

            // Simular clic para descargar
            document.body.appendChild(link);
            link.click();

            // Limpiar
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error("Error al descargar el archivo:", error);
            toast.error("No se pudo descargar el archivo.");
        } finally {
            setIsDownloading(false);
        }
    };

    const statusInfo = isUploaded
        ? { text: "Subido", icon: <CheckCircle className="text-green-500" />, color: "border-green-300 bg-green-50" }
        : { text: "Pendiente", icon: <FileWarning className="text-orange-500" />, color: "border-orange-300 bg-orange-50" };

    return (
        <div className={`p-5 rounded-xl border-2 ${statusInfo.color} transition-all flex flex-col`}>
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg text-gray-800">{label}</h3>
                <span className={`flex items-center gap-2 font-semibold text-sm px-3 py-1 rounded-full ${isUploaded ? 'bg-green-200 text-green-800' : 'bg-orange-200 text-orange-800'}`}>
                    {statusInfo.icon}
                    {statusInfo.text}
                </span>
            </div>

            <div className="mt-4 flex-grow flex flex-col justify-center">
                {isUploaded ? (
                    <div className="space-y-3">
                        <div className="flex items-center justify-center gap-4">
                            <a href={currentFileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 font-semibold hover:underline">
                                <Eye size={16} /> Ver
                            </a>
                            <button onClick={handleDownload} disabled={isDownloading} className="flex items-center gap-2 text-green-600 font-semibold hover:underline disabled:text-gray-400 disabled:cursor-wait">
                                {isDownloading ? <Loader size={16} className="animate-spin" /> : <Download size={16} />}
                                {isDownloading ? 'Descargando...' : 'Descargar'}
                            </button>
                        </div>
                        <div className="border-t pt-3 mt-3 flex justify-between items-center">
                            <FileUpload
                                label="Reemplazar"
                                filePath={filePath}
                                onUploadSuccess={onUploadSuccess}
                                isCompact={true}
                            />
                            <button onClick={onRemove} className="flex items-center gap-2 text-red-500 font-semibold text-sm hover:underline">
                                <Trash2 size={14} /> Eliminar
                            </button>
                        </div>
                    </div>
                ) : (
                    <FileUpload
                        label="Subir Documento"
                        filePath={filePath}
                        onUploadSuccess={onUploadSuccess}
                    />
                )}
            </div>
        </div>
    );
};

export default DocumentoCard;