import React, { useState, useRef } from 'react';
import {
    UploadCloud,
    Loader,
    CheckCircle2,
    FileText,
    Trash2,
    Replace,
    Download,
    ExternalLink,
    Eye,
    AlertTriangle
} from 'lucide-react';
import { uploadFile } from '../services/fileService';
import { useModernToast } from '../hooks/useModernToast.jsx';

/**
 * Componente universal para manejo de archivos
 * Unifica todos los patrones de subida/gestión de archivos en la aplicación
 * 
 * @param {Object} props
 * @param {string} props.label - Etiqueta para el componente
 * @param {string|Function} props.filePath - Ruta del archivo o función que genera la ruta
 * @param {string} props.currentFileUrl - URL del archivo actual (si existe)
 * @param {Function} props.onUploadSuccess - Callback cuando se sube exitosamente
 * @param {Function} props.onDelete - Callback cuando se elimina el archivo
 * @param {boolean} props.disabled - Si el componente está deshabilitado
 * @param {boolean} props.readonly - Si el componente es solo lectura
 * @param {boolean} props.required - Si el archivo es requerido
 * @param {'compact'|'normal'|'card'} props.variant - Variante de visualización
 * @param {boolean} props.showDownload - Mostrar botón de descarga
 * @param {boolean} props.showPreview - Mostrar botón de vista previa
 * @param {string} props.acceptedTypes - Tipos de archivo aceptados
 * @param {number} props.maxSizeMB - Tamaño máximo en MB
 * @param {string} props.disabledTooltip - Mensaje tooltip cuando está deshabilitado
 * @param {string} props.helpText - Texto de ayuda general
 */
const UniversalFileManager = ({
    label = "Subir archivo",
    filePath,
    currentFileUrl = null,
    onUploadSuccess,
    onDelete,
    disabled = false,
    readonly = false,
    required = false,
    variant = 'normal', // 'compact', 'normal', 'card'
    showDownload = true,
    showPreview = true,
    acceptedTypes = ".pdf,.png,.jpg,.jpeg",
    maxSizeMB = 10,
    className = "",
    disabledTooltip = "",
    helpText = ""
}) => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [uploadComplete, setUploadComplete] = useState(false);
    const [replacing, setReplacing] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const fileInputRef = useRef(null);
    const replaceInputRef = useRef(null);
    const toast = useModernToast();

    // Estados derivados
    const hasFile = Boolean(currentFileUrl);
    // const isDisabled = disabled || readonly || uploading || replacing || deleting; // Ya no se usa

    // Validación de archivo
    const validateFile = (file) => {
        if (!file) return { valid: false, error: 'No se seleccionó ningún archivo' };

        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        if (file.size > maxSizeBytes) {
            return { valid: false, error: `El archivo no puede ser mayor a ${maxSizeMB}MB` };
        }

        const allowedTypes = acceptedTypes.split(',').map(type => type.trim().toLowerCase());
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        if (!allowedTypes.includes(fileExtension)) {
            return { valid: false, error: 'Tipo de archivo no permitido' };
        }

        return { valid: true };
    };

    // Manejo de subida
    const handleFileUpload = async (file, isReplace = false) => {
        const validation = validateFile(file);
        if (!validation.valid) {
            toast.error(validation.error, {
                title: "Archivo Inválido"
            });
            return;
        }

        const setState = isReplace ? setReplacing : setUploading;

        setState(true);
        setProgress(0);
        setUploadComplete(false);

        try {
            let finalPath;
            if (typeof filePath === 'function') {
                finalPath = filePath(file.name);
            } else if (filePath) {
                const timestamp = Date.now();
                const uniqueFileName = `${timestamp}-${file.name}`;
                finalPath = `${filePath}/${uniqueFileName}`;
            } else {
                throw new Error('FilePath no proporcionado');
            }

            // ⚠️ IMPORTANTE: Cuando es reemplazo, NO eliminamos el archivo anterior
            // Razón: Los links del historial de auditoría deben permanecer funcionales
            // Los URLs guardados en logs históricos seguirán funcionando correctamente
            // Esto garantiza trazabilidad y acceso a versiones anteriores de documentos

            const downloadURL = await uploadFile(file, finalPath, (p) => setProgress(p));

            setUploadComplete(true);
            setTimeout(() => {
                onUploadSuccess?.(downloadURL);
                toast.success(isReplace ? '¡Archivo reemplazado exitosamente!' : '¡Archivo subido exitosamente!', {
                    title: isReplace ? "¡Archivo Actualizado!" : "¡Subida Exitosa!"
                });
                setUploadComplete(false);
            }, 800);
        } catch (error) {
            console.error('Error al subir archivo:', error);
            toast.error(isReplace ? 'Error al reemplazar el archivo' : 'Error al subir el archivo', {
                title: isReplace ? "Error de Reemplazo" : "Error de Subida"
            });
            setUploadComplete(false);
        } finally {
            setState(false);
            setProgress(0);
            if (fileInputRef.current) fileInputRef.current.value = "";
            if (replaceInputRef.current) replaceInputRef.current.value = "";
        }
    };

    // Handlers
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) handleFileUpload(file, false);
    };

    const handleReplaceChange = (event) => {
        const file = event.target.files[0];
        if (file) handleFileUpload(file, true);
    };

    const handleDelete = async () => {
        if (!onDelete || disabled || readonly || uploading || replacing || deleting) return;

        setDeleting(true);
        try {
            await onDelete();
        } catch (error) {
            toast.error('Error al eliminar el archivo', {
                title: "Error de Eliminación"
            });
        } finally {
            setDeleting(false);
        }
    };

    const handleSelectFile = () => {
        if (disabled || readonly || uploading || replacing || deleting) return;
        fileInputRef.current?.click();
    };

    const handleReplaceFile = () => {
        if (disabled || readonly || uploading || replacing || deleting) return;
        replaceInputRef.current?.click();
    };

    // Obtener nombre del archivo
    const getFileName = (maxLength = 40) => {
        if (!currentFileUrl) return 'Documento';
        try {
            const urlObj = new URL(currentFileUrl);
            const pathname = urlObj.pathname;
            const segments = pathname.split('/');
            let fileName = segments[segments.length - 1];
            fileName = decodeURIComponent(fileName);

            // Remover prefijos comunes de Firebase Storage y otros patrones
            fileName = fileName.replace(/^\d+-/, ''); // Remover timestamp al inicio
            fileName = fileName.replace(/^documentos_clientes\/[^\/]+\/[^-]+-/, ''); // Remover ruta y prefijo del documento
            fileName = fileName.replace(/^(cedula|carta-aprobacion|promesa|correo)-/, ''); // Remover prefijos específicos

            // Si el nombre sigue siendo muy largo, extraer el nombre original si tiene un patrón reconocible
            if (fileName.includes('-')) {
                const parts = fileName.split('-');
                // Si hay múltiples partes separadas por guión, tomar las que no sean códigos/hashes
                const meaningfulParts = parts.filter(part =>
                    !part.match(/^[a-f0-9]{8,}$/i) && // No es hash hexadecimal
                    !part.match(/^\d{8,}$/) && // No es timestamp largo
                    part.length > 2 // Tiene más de 2 caracteres
                );
                if (meaningfulParts.length > 0) {
                    fileName = meaningfulParts.join('-');
                }
            }

            // Truncar si es necesario
            if (fileName.length > maxLength) {
                const extension = fileName.includes('.') ? fileName.split('.').pop() : '';
                if (extension) {
                    const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
                    const truncatedName = nameWithoutExt.substring(0, maxLength - extension.length - 4);
                    fileName = `${truncatedName}...${extension}`;
                } else {
                    fileName = fileName.substring(0, maxLength - 3) + '...';
                }
            }

            return fileName || 'Documento';
        } catch {
            return 'Documento';
        }
    };

    // Renderizado según variante
    if (variant === 'compact') {
        return (
            <div className={`flex items-center gap-2 ${className}`}>
                {hasFile ? (
                    <>
                        <div className="flex items-center gap-1 text-green-700 dark:text-green-300">
                            <FileText size={16} />
                            {showPreview ? (
                                <a
                                    href={currentFileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:underline max-w-[120px] truncate text-sm"
                                    title={getFileName(100)}
                                >
                                    {getFileName(20)}
                                </a>
                            ) : (
                                <span className="text-sm max-w-[120px] truncate" title={getFileName(100)}>
                                    {getFileName(20)}
                                </span>
                            )}
                        </div>

                        {!readonly && (
                            <div className="flex items-center gap-1">
                                {replacing ? (
                                    <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-900/30">
                                        <Loader className="animate-spin text-blue-500" size={14} />
                                        <span className="text-xs text-blue-600 dark:text-blue-400">
                                            {Math.round(progress)}%
                                        </span>
                                    </div>
                                ) : uploadComplete ? (
                                    <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-green-50 dark:bg-green-900/30">
                                        <CheckCircle2 className="text-green-500" size={14} />
                                        <span className="text-xs text-green-600 dark:text-green-400">¡Listo!</span>
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            type="button"
                                            onClick={handleReplaceFile}
                                            disabled={disabled || replacing || uploading || deleting}
                                            className="flex items-center gap-1 px-2 py-1 rounded text-yellow-600 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors disabled:opacity-50 text-xs font-medium"
                                            title="Reemplazar archivo"
                                        >
                                            <Replace size={12} />
                                            Reemplazar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleDelete}
                                            disabled={deleting || disabled || replacing || uploading}
                                            className="flex items-center gap-1 px-2 py-1 rounded text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50 text-xs font-medium"
                                            title="Eliminar archivo"
                                        >
                                            {deleting ? <Loader className="animate-spin" size={12} /> : <Trash2 size={12} />}
                                            {deleting ? 'Eliminando...' : 'Eliminar'}
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <button
                            type="button"
                            onClick={handleSelectFile}
                            disabled={disabled || readonly || uploading || replacing || deleting}
                            className={`text-sm font-semibold transition-colors duration-200 ${(disabled || readonly || uploading || replacing || deleting) ? 'text-gray-400 cursor-not-allowed' :
                                uploading ? 'text-orange-600 dark:text-orange-400' :
                                    'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline'
                                }`}
                            title={disabled && disabledTooltip ? disabledTooltip : undefined}
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
                    </>
                )}

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept={acceptedTypes}
                    disabled={disabled || readonly}
                />
                <input
                    type="file"
                    ref={replaceInputRef}
                    onChange={handleReplaceChange}
                    className="hidden"
                    accept={acceptedTypes}
                    disabled={disabled || readonly}
                />

                {/* Mostrar helpText si existe */}
                {helpText && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {helpText}
                    </p>
                )}
            </div>
        );
    }

    if (variant === 'card') {
        const statusInfo = hasFile
            ? { text: "Subido", icon: <CheckCircle2 className="text-green-500" />, color: "border-green-300 bg-green-50 dark:bg-green-900/20" }
            : required
                ? { text: "Requerido", icon: <AlertTriangle className="text-orange-500" />, color: "border-orange-300 bg-orange-50 dark:bg-orange-900/20" }
                : { text: "Opcional", icon: <FileText className="text-gray-400" />, color: "border-gray-300 bg-gray-50 dark:bg-gray-800" };

        return (
            <div className={`p-5 rounded-xl border-2 ${statusInfo.color} transition-all flex flex-col ${className}`}>
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">{label}</h3>
                    <span className={`flex items-center gap-2 font-semibold text-sm px-3 py-1 rounded-full ${hasFile ? 'bg-green-200 text-green-800 dark:bg-green-800/50 dark:text-green-200' :
                        required ? 'bg-orange-200 text-orange-800 dark:bg-orange-800/50 dark:text-orange-200' :
                            'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                        {statusInfo.icon}
                        {statusInfo.text}
                    </span>
                </div>

                <div className="mt-4 flex-grow flex flex-col justify-center">
                    {hasFile ? (
                        <div className="space-y-3">
                            <div className="flex items-center justify-center gap-4">
                                {showPreview && (
                                    <a
                                        href={currentFileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                                    >
                                        <Eye size={16} /> Ver
                                    </a>
                                )}
                                {showDownload && (
                                    <a
                                        href={currentFileUrl}
                                        download
                                        className="flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold hover:underline"
                                    >
                                        <Download size={16} /> Descargar
                                    </a>
                                )}
                            </div>

                            {!readonly && (
                                <div className="border-t pt-3 mt-3 flex justify-between items-center">
                                    <button
                                        type="button"
                                        onClick={handleReplaceFile}
                                        disabled={replacing || disabled || uploading || deleting}
                                        className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 font-semibold text-sm hover:underline disabled:opacity-50"
                                    >
                                        {replacing ? <Loader className="animate-spin" size={14} /> : <Replace size={14} />}
                                        {replacing ? 'Reemplazando...' : 'Reemplazar'}
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        disabled={deleting || disabled || replacing || uploading}
                                        className="flex items-center gap-2 text-red-500 font-semibold text-sm hover:underline disabled:opacity-50"
                                    >
                                        {deleting ? <Loader className="animate-spin" size={14} /> : <Trash2 size={14} />}
                                        {deleting ? 'Eliminando...' : 'Eliminar'}
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center">
                            {uploading ? (
                                <div>
                                    <Loader className="animate-spin text-blue-500 mb-3 mx-auto" size={28} />
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
                                <div>
                                    <CheckCircle2 className="text-green-500 mb-2 mx-auto" size={28} />
                                    <p className="text-sm font-medium text-green-600 dark:text-green-400">
                                        ¡Archivo subido exitosamente!
                                    </p>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleSelectFile}
                                    disabled={disabled || readonly || uploading || replacing || deleting}
                                    className={`w-full py-4 border-2 border-dashed rounded-lg transition-all duration-200 ${(disabled || readonly || uploading || replacing || deleting)
                                        ? 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 cursor-not-allowed'
                                        : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer'
                                        }`}
                                    title={disabled && disabledTooltip ? disabledTooltip : undefined}
                                >
                                    <UploadCloud className={`mx-auto mb-2 ${(disabled || readonly || uploading || replacing || deleting) ? 'text-gray-300 dark:text-gray-600' : 'text-gray-400 dark:text-gray-500'
                                        }`} size={32} />
                                    <p className={`text-sm font-medium ${(disabled || readonly || uploading || replacing || deleting) ? 'text-gray-400 dark:text-gray-600' : 'text-gray-600 dark:text-gray-300'
                                        }`}>
                                        {label}
                                    </p>
                                    <p className={`text-xs mt-1 ${(disabled || readonly || uploading || replacing || deleting) ? 'text-gray-300 dark:text-gray-700' : 'text-gray-500 dark:text-gray-400'
                                        }`}>
                                        {acceptedTypes.replace(/\./g, '').toUpperCase()} (Max {maxSizeMB}MB)
                                    </p>
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept={acceptedTypes}
                    disabled={disabled || readonly}
                />
                <input
                    type="file"
                    ref={replaceInputRef}
                    onChange={handleReplaceChange}
                    className="hidden"
                    accept={acceptedTypes}
                    disabled={disabled || readonly}
                />

                {/* Mostrar helpText si existe */}
                {helpText && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 px-1">
                        {helpText}
                    </p>
                )}
            </div>
        );
    }

    // Variant normal (default)
    return (
        <div className={className}>
            {hasFile ? (
                <div className={`rounded-lg border-2 transition-all duration-300 ${replacing
                    ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-600'
                    : uploadComplete
                        ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-600'
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-600'
                    }`}>
                    {replacing && (
                        <div className="p-3 border-b border-slate-200 dark:border-slate-600">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Loader className="animate-spin text-indigo-500" size={16} />
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Reemplazando archivo...
                                    </span>
                                </div>
                                <span className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                                    {Math.round(progress)}%
                                </span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                <div
                                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {uploadComplete && (
                        <div className="p-3 border-b border-slate-200 dark:border-slate-600">
                            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                <CheckCircle2 size={16} className="text-indigo-600 dark:text-indigo-400" />
                                <span className="text-sm font-medium">¡Archivo reemplazado exitosamente!</span>
                            </div>
                        </div>
                    )}

                    <div className="p-4">
                        <div className="flex items-center gap-3">
                            <FileText className="text-slate-600 dark:text-slate-400 flex-shrink-0" size={20} />
                            <div className="min-w-0 flex-1">
                                <p className="font-medium text-slate-900 dark:text-slate-100 truncate" title={getFileName(100)}>
                                    {getFileName(35)}
                                </p>
                                <div className="flex items-center gap-3 mt-1">
                                    {showPreview && (
                                        <a
                                            href={currentFileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                                        >
                                            <ExternalLink size={14} />
                                            Abrir en nueva pestaña
                                        </a>
                                    )}
                                    {showDownload && (
                                        <a
                                            href={currentFileUrl}
                                            download
                                            className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-300 transition-colors"
                                        >
                                            <Download size={14} />
                                            Descargar
                                        </a>
                                    )}
                                </div>

                                {!readonly && (
                                    <div className="flex items-center gap-2 mt-2">
                                        <button
                                            type="button"
                                            onClick={handleReplaceFile}
                                            disabled={replacing || uploadComplete || disabled || uploading || deleting}
                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-200 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200 dark:border-slate-600"
                                            title="Reemplazar documento"
                                        >
                                            <Replace size={12} />
                                            <span>Reemplazar</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleDelete}
                                            disabled={deleting || replacing || uploadComplete || disabled || uploading}
                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-800/50 transition-all duration-200 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed border border-rose-200 dark:border-rose-700"
                                            title="Eliminar documento"
                                        >
                                            {deleting ? <Loader className="animate-spin" size={12} /> : <Trash2 size={12} />}
                                            <span>{deleting ? 'Eliminando...' : 'Eliminar'}</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <input
                        type="file"
                        ref={replaceInputRef}
                        onChange={handleReplaceChange}
                        className="hidden"
                        accept={acceptedTypes}
                        disabled={disabled || readonly}
                    />
                </div>
            ) : (
                <div className={`w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-4 relative transition-all duration-300 ${(disabled || readonly || uploading || replacing || deleting)
                    ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 cursor-not-allowed'
                    : uploading
                        ? 'border-indigo-400 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : uploadComplete
                            ? 'border-indigo-400 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                            : 'border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:border-indigo-400 dark:hover:border-indigo-500'
                    }`}>
                    {uploading ? (
                        <div className="text-center">
                            <Loader className="animate-spin text-indigo-500 mb-3" size={28} />
                            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-2">
                                Subiendo archivo...
                            </p>
                            <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2 mb-2">
                                <div
                                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                                <span>{Math.round(progress)}%</span>
                                <span>Completado</span>
                            </div>
                        </div>
                    ) : uploadComplete ? (
                        <div className="text-center">
                            <CheckCircle2 className="text-indigo-500 mb-2 mx-auto" size={28} />
                            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                                ¡Archivo subido exitosamente!
                            </p>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={handleSelectFile}
                            disabled={disabled || readonly || uploading || replacing || deleting}
                            className={`text-center w-full h-full flex flex-col items-center justify-center relative group ${(disabled || readonly || uploading || replacing || deleting) ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-105 transition-transform duration-200'
                                }`}
                            title={disabled && disabledTooltip ? disabledTooltip : undefined}
                        >
                            <UploadCloud className={`mx-auto mb-2 ${(disabled || readonly || uploading || replacing || deleting) ? 'text-slate-300 dark:text-slate-600' : 'text-slate-500 dark:text-slate-400'
                                }`} size={32} />
                            <p className={`text-sm font-medium ${(disabled || readonly || uploading || replacing || deleting) ? 'text-slate-400 dark:text-slate-600' : 'text-slate-700 dark:text-slate-300'
                                }`}>
                                {label}
                            </p>
                            <p className={`text-xs mt-1 ${(disabled || readonly || uploading || replacing || deleting) ? 'text-slate-300 dark:text-slate-600' : 'text-slate-500 dark:text-slate-400'
                                }`}>
                                {acceptedTypes.replace(/\./g, '').toUpperCase()} (Max {maxSizeMB}MB)
                            </p>
                        </button>
                    )}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept={acceptedTypes}
                        disabled={disabled || readonly}
                    />
                </div>
            )}

            {/* Mostrar helpText si existe */}
            {helpText && (
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                    {helpText}
                </p>
            )}
        </div>
    );
};

export default UniversalFileManager;