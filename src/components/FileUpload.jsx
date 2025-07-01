import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, XCircle, Loader } from 'lucide-react';
import { uploadFile } from '../utils/storage';
import toast from 'react-hot-toast'; // <-- IMPORTACIÓN AÑADIDA AQUÍ

const FileUpload = ({ label, filePath, currentFileUrl, onUploadSuccess, onRemove }) => {
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
        }
    };

    const handleSelectFileClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div>
            <label className="block font-semibold mb-2 text-gray-700">{label}</label>
            <div className="w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-4 relative">
                {uploading ? (
                    <>
                        <Loader className="animate-spin text-blue-500 mb-2" />
                        <p className="text-sm text-gray-500">Subiendo...</p>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                        </div>
                    </>
                ) : currentFileUrl ? (
                    <>
                        <div className='flex items-center gap-2 text-green-700'>
                            <FileText />
                            <a href={currentFileUrl} target="_blank" rel="noopener noreferrer" className="font-bold hover:underline">
                                Ver Documento Actual
                            </a>
                        </div>
                        <button
                            type="button"
                            onClick={onRemove}
                            className="absolute top-1 right-1 p-0.5 bg-red-100 text-red-500 rounded-full hover:bg-red-200"
                            title="Eliminar documento"
                        >
                            <XCircle size={20} />
                        </button>
                        <button type="button" onClick={handleSelectFileClick} className="text-sm text-blue-600 hover:underline mt-2">Reemplazar</button>
                    </>
                ) : (
                    <button type="button" onClick={handleSelectFileClick} className="text-center">
                        <UploadCloud className="mx-auto text-gray-400" size={32} />
                        <p className="mt-2 text-sm text-gray-600">
                            Haz clic para seleccionar un archivo
                        </p>
                        <p className="text-xs text-gray-500">PDF, PNG, JPG</p>
                    </button>
                )}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.png,.jpg,.jpeg"
                />
            </div>
        </div>
    );
};

export default FileUpload;