import React, { useState, useRef } from 'react';
import { FileText, Trash2, Replace, Loader, CheckCircle2, Download, ExternalLink } from 'lucide-react';
import { uploadFile } from '../services/fileService';
import toast from 'react-hot-toast';

const EnhancedFileDisplayActions = ({
    url,
    onReplace,
    onDelete,
    isLocked = false,
    filePath,
    compact = false,
    showDownload = true
}) => {
    const [replacing, setReplacing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [replaceComplete, setReplaceComplete] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const replaceInputRef = useRef(null);

    const handleReplaceClick = () => {
        if (replacing || isLocked) return;
        replaceInputRef.current?.click();
    };

    const handleFileReplace = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setReplacing(true);
        setProgress(0);
        setReplaceComplete(false);

        try {
            let finalPath;
            if (typeof filePath === 'function') {
                finalPath = filePath(file.name);
            } else if (filePath) {
                const timestamp = Date.now();
                const uniqueFileName = `${timestamp}-${file.name}`;
                finalPath = `${filePath}${uniqueFileName}`;
            } else {
                throw new Error('FilePath no proporcionado');
            }

            const downloadURL = await uploadFile(file, finalPath, (p) => setProgress(p));

            // Mostrar éxito brevemente
            setReplaceComplete(true);
            setTimeout(() => {
                onReplace(downloadURL);
                toast.success('¡Archivo reemplazado con éxito!');
                setReplaceComplete(false);
            }, 800);
        } catch (error) {
            console.error('Error al reemplazar archivo:', error);
            toast.error('Error al reemplazar el archivo.');
            setReplaceComplete(false);
        } finally {
            setReplacing(false);
            if (replaceInputRef.current) {
                replaceInputRef.current.value = "";
            }
        }
    };

    const handleDelete = async () => {
        if (deleting || isLocked) return;

        setDeleting(true);
        try {
            await onDelete();
        } finally {
            setDeleting(false);
        }
    };

    const getFileName = () => {
        if (!url) return 'Documento';
        try {
            const urlObj = new URL(url);
            const pathname = urlObj.pathname;
            const segments = pathname.split('/');
            let fileName = segments[segments.length - 1];

            // Decodificar URL encoding
            fileName = decodeURIComponent(fileName);

            // Remover prefijos de timestamp si existen
            fileName = fileName.replace(/^\d+-/, '');

            return fileName || 'Documento';
        } catch {
            return 'Documento';
        }
    };

    if (compact) {
        return (
            <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center gap-1 text-green-700 dark:text-green-300">
                    <FileText size={16} />
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline max-w-[150px] truncate"
                        title={getFileName()}
                    >
                        {getFileName()}
                    </a>
                </div>

                {!isLocked && (
                    <div className="flex items-center gap-1">
                        {replacing ? (
                            <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-900/30">
                                <Loader className="animate-spin text-blue-500" size={14} />
                                <span className="text-xs text-blue-600 dark:text-blue-400">
                                    {Math.round(progress)}%
                                </span>
                            </div>
                        ) : replaceComplete ? (
                            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-green-50 dark:bg-green-900/30">
                                <CheckCircle2 className="text-green-500" size={14} />
                                <span className="text-xs text-green-600 dark:text-green-400">¡Listo!</span>
                            </div>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={handleReplaceClick}
                                    className="p-1 rounded text-yellow-600 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
                                    title="Reemplazar archivo"
                                >
                                    <Replace size={14} />
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="p-1 rounded text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
                                    title="Eliminar archivo"
                                >
                                    {deleting ? <Loader className="animate-spin" size={14} /> : <Trash2 size={14} />}
                                </button>
                            </>
                        )}
                    </div>
                )}

                <input
                    type="file"
                    ref={replaceInputRef}
                    onChange={handleFileReplace}
                    className="hidden"
                    accept=".pdf,.png,.jpg,.jpeg"
                    disabled={replacing || isLocked}
                />
            </div>
        );
    }

    return (
        <div className={`rounded-lg border-2 transition-all duration-300 ${replacing
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
                : replaceComplete
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                    : 'bg-green-50 dark:bg-green-900/50 border-green-200 dark:border-green-700'
            }`}>
            {replacing && (
                <div className="p-3 border-b border-blue-200 dark:border-blue-700">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Loader className="animate-spin text-blue-500" size={16} />
                            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                Reemplazando archivo...
                            </span>
                        </div>
                        <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                            {Math.round(progress)}%
                        </span>
                    </div>
                    <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            {replaceComplete && (
                <div className="p-3 border-b border-green-200 dark:border-green-700">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                        <CheckCircle2 size={16} />
                        <span className="text-sm font-medium">¡Archivo reemplazado exitosamente!</span>
                    </div>
                </div>
            )}

            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <FileText className="text-green-600 dark:text-green-400 flex-shrink-0" size={20} />
                    <div className="min-w-0 flex-1">
                        <p className="font-medium text-green-800 dark:text-green-200 truncate">
                            {getFileName()}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                            <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-sm text-green-700 dark:text-green-300 hover:text-green-900 dark:hover:text-green-100 transition-colors"
                            >
                                <ExternalLink size={14} />
                                Abrir en nueva pestaña
                            </a>
                            {showDownload && (
                                <a
                                    href={url}
                                    download
                                    className="flex items-center gap-1 text-sm text-green-700 dark:text-green-300 hover:text-green-900 dark:hover:text-green-100 transition-colors"
                                >
                                    <Download size={14} />
                                    Descargar
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {!isLocked && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                            type="button"
                            onClick={handleReplaceClick}
                            disabled={replacing || replaceComplete}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-yellow-800 dark:text-yellow-200 bg-yellow-100 dark:bg-yellow-900/50 hover:bg-yellow-200 dark:hover:bg-yellow-800/70 transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed border border-yellow-200 dark:border-yellow-800"
                            title="Reemplazar documento"
                        >
                            <Replace size={16} />
                            Reemplazar
                        </button>
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={deleting || replacing || replaceComplete}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-800 dark:text-red-200 bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-800/70 transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed border border-red-200 dark:border-red-800"
                            title="Eliminar documento"
                        >
                            {deleting ? <Loader className="animate-spin" size={16} /> : <Trash2 size={16} />}
                            {deleting ? 'Eliminando...' : 'Eliminar'}
                        </button>
                    </div>
                )}
            </div>

            <input
                type="file"
                ref={replaceInputRef}
                onChange={handleFileReplace}
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg"
                disabled={replacing || isLocked}
            />
        </div>
    );
};

export default EnhancedFileDisplayActions;