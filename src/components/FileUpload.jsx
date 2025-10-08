import React, { useState, useRef } from 'react';
import { UploadCloud, Loader, CheckCircle2, FileText } from 'lucide-react';
import { uploadFile } from "../services/fileService";;
import toast from 'react-hot-toast';

const FileUpload = ({ label, filePath, onUploadSuccess, isCompact = false, disabled = false }) => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [uploadComplete, setUploadComplete] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setUploading(true);
        setProgress(0);
        setUploadComplete(false);

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

            // Simular un breve momento de éxito antes de llamar onUploadSuccess
            setUploadComplete(true);
            setTimeout(() => {
                onUploadSuccess(downloadURL);
                toast.success('¡Archivo subido con éxito!');
                setUploadComplete(false);
            }, 800);
        } catch (error) {
            console.error('Error al subir archivo:', error);
            toast.error("Error al subir el archivo.");
            setUploadComplete(false);
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleSelectFileClick = () => {
        if (disabled || uploading) return;
        fileInputRef.current?.click();
    };

    if (isCompact) {
        return (
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={handleSelectFileClick}
                    disabled={uploading || disabled}
                    className={`text-sm font-semibold transition-colors duration-200 ${disabled ? 'text-gray-400 cursor-not-allowed' :
                            uploading ? 'text-orange-600 dark:text-orange-400' :
                                'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline'
                        }`}
                >
                    {uploading ? (
                        <span className="flex items-center gap-2">
                            <Loader className="animate-spin" size={14} />
                            Subiendo...
                        </span>
                    ) : (
                        label
                    )}
                </button>
                {uploading && progress > 0 && (
                    <div className="flex-1 min-w-[80px]">
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                            <div
                                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{Math.round(progress)}%</span>
                    </div>
                )}
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.png,.jpg,.jpeg" />
            </div>
        );
    }

    return (
        <div>
            <div className={`w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-4 relative transition-all duration-300 ${disabled
                    ? 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 cursor-not-allowed'
                    : uploading
                        ? 'border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : uploadComplete
                            ? 'border-green-400 dark:border-green-500 bg-green-50 dark:bg-green-900/20'
                            : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-gray-400 dark:hover:border-gray-500'
                }`}>
                {uploading ? (
                    <div className="text-center">
                        <Loader className="animate-spin text-blue-500 mb-3" size={28} />
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">
                            Subiendo archivo...
                        </p>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                            <span>{Math.round(progress)}%</span>
                            <span>Completado</span>
                        </div>
                    </div>
                ) : uploadComplete ? (
                    <div className="text-center">
                        <CheckCircle2 className="text-green-500 mb-2 mx-auto" size={28} />
                        <p className="text-sm font-medium text-green-600 dark:text-green-400">
                            ¡Archivo subido exitosamente!
                        </p>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={handleSelectFileClick}
                        disabled={disabled}
                        className={`text-center w-full h-full flex flex-col items-center justify-center ${disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-105 transition-transform duration-200'
                            }`}
                    >
                        <UploadCloud className={`mx-auto mb-2 ${disabled ? 'text-gray-300 dark:text-gray-600' : 'text-gray-400 dark:text-gray-500'
                            }`} size={32} />
                        <p className={`text-sm font-medium ${disabled ? 'text-gray-400 dark:text-gray-600' : 'text-gray-600 dark:text-gray-300'
                            }`}>
                            {label}
                        </p>
                        <p className={`text-xs mt-1 ${disabled ? 'text-gray-300 dark:text-gray-700' : 'text-gray-500 dark:text-gray-400'
                            }`}>
                            PDF, PNG, JPG (Max 10MB)
                        </p>
                    </button>
                )}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.png,.jpg,.jpeg"
                    disabled={disabled}
                />
            </div>
        </div>
    );
};

export default FileUpload;