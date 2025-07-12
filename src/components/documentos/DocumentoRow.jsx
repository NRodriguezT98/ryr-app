import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle, FileWarning, Eye, UploadCloud, Trash2, Loader } from 'lucide-react';
import { uploadFile } from '../../utils/storage';

const DocumentoRow = ({ label, isRequired, currentFileUrl, filePath, onUploadSuccess, onRemove }) => {

    if (!isRequired) {
        return null;
    }

    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = React.useRef(null);
    const isUploaded = !!currentFileUrl;

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const downloadURL = await uploadFile(file, filePath(file.name), null);
            onUploadSuccess(downloadURL);
            toast.success('¡Archivo subido con éxito!');
        } catch (error) {
            toast.error("Error al subir el archivo.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const statusInfo = isUploaded
        ? { text: "Subido", icon: <CheckCircle className="text-green-500" />, textColor: "text-green-600" }
        : { text: "Pendiente", icon: <FileWarning className="text-orange-500" />, textColor: "text-orange-600" };

    return (
        <div className="flex items-center justify-between p-3 border-b hover:bg-gray-50 transition-colors">
            {/* Columna de Nombre y Estado */}
            <div className="flex-1 flex flex-col">
                <span className="font-semibold text-gray-800">{label}</span>
                <div className={`flex items-center gap-1.5 text-xs font-medium ${statusInfo.textColor}`}>
                    {statusInfo.icon}
                    <span>{statusInfo.text}</span>
                </div>
            </div>

            {/* Columna de Acciones */}
            <div className="flex-none flex items-center gap-4 ml-4">
                {isUploaded ? (
                    <>
                        <a href={currentFileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-blue-600 hover:underline text-sm">
                            <Eye size={16} /> Ver
                        </a>
                        <button onClick={onRemove} className="flex items-center gap-1.5 text-red-500 hover:underline text-sm">
                            <Trash2 size={16} /> Eliminar
                        </button>
                    </>
                ) : (
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="flex items-center gap-1.5 bg-blue-500 text-white px-3 py-1.5 rounded-md text-sm hover:bg-blue-600 disabled:bg-gray-400"
                    >
                        {isUploading ? <Loader size={16} className="animate-spin" /> : <UploadCloud size={16} />}
                        {isUploading ? 'Subiendo...' : 'Subir'}
                    </button>
                )}
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.png,.jpg,.jpeg" />
            </div>
        </div>
    );
};

export default DocumentoRow;