import React, { useState, useRef } from 'react';
import { UploadCloud, Loader } from 'lucide-react';
import { uploadFile } from '../utils/storage';
import toast from 'react-hot-toast';

/**
 * Componente genérico para manejar la selección y subida de un archivo.
 * @param {object} props
 * @param {string} props.label - El texto que se muestra en el botón/área de carga.
 * @param {function} props.filePath - Función que genera la ruta de almacenamiento.
 * @param {function} props.onUploadSuccess - Callback que se ejecuta con la URL tras una subida exitosa.
 * @param {boolean} [props.isCompact=false] - Si es true, muestra una versión más pequeña del botón.
 */
const FileUpload = ({ label, filePath, onUploadSuccess, isCompact = false }) => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef(null);

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setUploading(true);
        setProgress(0);

        try {
            const downloadURL = await uploadFile(file, filePath(file.name), (p) => setProgress(p));
            onUploadSuccess(downloadURL);
            toast.success('¡Archivo subido con éxito!');
        } catch (error) {
            toast.error("Error al subir el archivo.");
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleSelectFileClick = () => {
        fileInputRef.current?.click();
    };

    if (isCompact) {
        return (
            <>
                <button
                    type="button"
                    onClick={handleSelectFileClick}
                    disabled={uploading}
                    className="text-sm font-semibold text-blue-600 hover:underline disabled:text-gray-400"
                >
                    {uploading ? 'Subiendo...' : label}
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.png,.jpg,.jpeg" />
            </>
        );
    }

    return (
        <div>
            <div className="w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-4 relative hover:bg-gray-50 transition-colors">
                {uploading ? (
                    <>
                        <Loader className="animate-spin text-blue-500 mb-2" />
                        <p className="text-sm text-gray-500">Subiendo...</p>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                        </div>
                    </>
                ) : (
                    <button type="button" onClick={handleSelectFileClick} className="text-center">
                        <UploadCloud className="mx-auto text-gray-400" size={32} />
                        <p className="mt-2 text-sm text-gray-600">{label}</p>
                        <p className="text-xs text-gray-500">PDF, PNG, JPG</p>
                    </button>
                )}
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.png,.jpg,.jpeg" />
            </div>
        </div>
    );
};

export default FileUpload;