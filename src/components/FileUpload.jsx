import React, { useState, useRef } from 'react';
import { UploadCloud, Loader } from 'lucide-react';
import { uploadFile } from "../services/fileService";;
import toast from 'react-hot-toast';

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
            let finalPath;
            if (typeof filePath === 'function') {
                // CASO 1: Si nos pasan una función, la ejecutamos para obtener la ruta completa.
                // Esto es lo que necesita PasoProcesoCard.
                finalPath = filePath(file.name);
            } else {
                // CASO 2: Si nos pasan una cadena de texto, la tratamos como un directorio.
                // Esto da flexibilidad para otros usos en tu app.
                const timestamp = Date.now();
                const uniqueFileName = `${timestamp}-${file.name}`;
                finalPath = `${filePath}${uniqueFileName}`;
            }
            const downloadURL = await uploadFile(file, finalPath, (p) => setProgress(p));
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
                    className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline disabled:text-gray-400"
                >
                    {uploading ? 'Subiendo...' : label}
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.png,.jpg,.jpeg" />
            </>
        );
    }

    return (
        <div>
            <div className="w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-4 relative hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors dark:border-gray-600">
                {uploading ? (
                    <>
                        <Loader className="animate-spin text-blue-500 mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">Subiendo...</p>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 mt-2">
                            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                        </div>
                    </>
                ) : (
                    <button type="button" onClick={handleSelectFileClick} className="text-center">
                        <UploadCloud className="mx-auto text-gray-400" size={32} />
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{label}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">PDF, PNG, JPG</p>
                    </button>
                )}
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.png,.jpg,.jpeg" />
            </div>
        </div>
    );
};

export default FileUpload;