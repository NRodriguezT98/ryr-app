// src/components/ModalConfirmacion.jsx (SISTEMA MODERNO)
import React from 'react';
import {
    ArrowRight, AlertTriangle, Check, Info, ExternalLink, Download, FileText,
    UploadCloud, Trash2, Home, DollarSign, User, CreditCard, Building2,
    FileCheck, Briefcase, Receipt, TrendingUp, Percent, Calendar, Hash
} from 'lucide-react';
import { ConfirmModal } from './modals';
import { formatCurrency } from '../utils/textFormatters';

const formatValue = (campo, valor) => {
    if (valor === undefined || valor === null || valor === '') return 'N/A';

    const camposMoneda = ['Valor Base', 'Recargo Esquinera', 'Valor Total', 'Gastos Notariales'];
    if (camposMoneda.includes(campo)) {
        return formatCurrency(Number(valor));
    }

    if (campo === 'Esquinera') {
        return valor === true || String(valor).toLowerCase() === 'true' ? 'Sí' : 'No';
    }

    return valor;
};

// Función para obtener el icono y color según el tipo de campo (MODERNIZADO)
const getFieldIcon = (campo) => {
    // Vivienda
    if (campo.includes('Vivienda') || campo.includes('Manzana') || campo.includes('Casa')) {
        return {
            Icon: Home,
            color: 'text-sky-600 dark:text-sky-400',
            bg: 'bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950/40 dark:to-blue-950/40',
            border: 'border-sky-200 dark:border-sky-800/50'
        };
    }

    // Datos personales
    if (campo.includes('Nombres') || campo.includes('Apellidos') || campo.includes('Documento') ||
        campo.includes('Teléfono') || campo.includes('Correo') || campo.includes('Dirección') ||
        campo.includes('Género') || campo.includes('Fecha de Nacimiento')) {
        return {
            Icon: User,
            color: 'text-violet-600 dark:text-violet-400',
            bg: 'bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/40 dark:to-purple-950/40',
            border: 'border-violet-200 dark:border-violet-800/50'
        };
    }

    // Archivos / Documentos
    if (campo.includes('Cédula') || campo.includes('Carta de Aprobación')) {
        return {
            Icon: FileCheck,
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40',
            border: 'border-emerald-200 dark:border-emerald-800/50'
        };
    }

    // Datos financieros - Montos
    if (campo.includes('Cuota Inicial') || campo.includes('Cuota Mensual') || campo.includes('Monto')) {
        return {
            Icon: DollarSign,
            color: 'text-green-600 dark:text-green-400',
            bg: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/40',
            border: 'border-green-200 dark:border-green-800/50'
        };
    }

    // Crédito
    if (campo.includes('Crédito Hipotecario')) {
        return {
            Icon: CreditCard,
            color: 'text-indigo-600 dark:text-indigo-400',
            bg: 'bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-blue-950/40',
            border: 'border-indigo-200 dark:border-indigo-800/50'
        };
    }

    // Subsidios
    if (campo.includes('Subsidio')) {
        return {
            Icon: Building2,
            color: 'text-cyan-600 dark:text-cyan-400',
            bg: 'bg-gradient-to-br from-cyan-50 to-sky-50 dark:from-cyan-950/40 dark:to-sky-950/40',
            border: 'border-cyan-200 dark:border-cyan-800/50'
        };
    }

    // Banco / Caja
    if (campo.includes('Banco') || campo.includes('Caja')) {
        return {
            Icon: Briefcase,
            color: 'text-amber-600 dark:text-amber-400',
            bg: 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40',
            border: 'border-amber-200 dark:border-amber-800/50'
        };
    }

    // Tasa de interés
    if (campo.includes('Tasa')) {
        return {
            Icon: Percent,
            color: 'text-rose-600 dark:text-rose-400',
            bg: 'bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/40 dark:to-pink-950/40',
            border: 'border-rose-200 dark:border-rose-800/50'
        };
    }

    // Plazo
    if (campo.includes('Plazo')) {
        return {
            Icon: Calendar,
            color: 'text-teal-600 dark:text-teal-400',
            bg: 'bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/40 dark:to-cyan-950/40',
            border: 'border-teal-200 dark:border-teal-800/50'
        };
    }

    // Referencia
    if (campo.includes('Referencia')) {
        return {
            Icon: Hash,
            color: 'text-slate-600 dark:text-slate-400',
            bg: 'bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-950/40 dark:to-gray-950/40',
            border: 'border-slate-200 dark:border-slate-800/50'
        };
    }

    // Default
    return {
        Icon: TrendingUp,
        color: 'text-gray-600 dark:text-gray-400',
        bg: 'bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-950/40 dark:to-slate-950/40',
        border: 'border-gray-200 dark:border-gray-800/50'
    };
};

// Función helper para generar nombres amigables de archivos
const generateFriendlyFileName = (documentType, isNew = true) => {
    const prefix = isNew ? 'nuevo' : 'anterior';

    const documentNames = {
        'Cédula (Archivo)': { name: 'cédula', emoji: '🆔' },
        'Carta Aprob. Crédito': { name: 'carta de aprobación de crédito', emoji: '🏦' },
        'Carta Aprob. Subsidio': { name: 'carta de aprobación de subsidio', emoji: '🏠' },
        'Promesa Firmada': { name: 'promesa de compraventa', emoji: '📋' },
        'Minuta Firmada': { name: 'minuta firmada', emoji: '📄' },
        'Escritura': { name: 'escritura', emoji: '📜' },
        'Factura de Venta': { name: 'factura de venta', emoji: '🧾' }
    };

    const docInfo = documentNames[documentType] || { name: documentType.toLowerCase(), emoji: '📎' };
    return `${docInfo.emoji} ${docInfo.name.charAt(0).toUpperCase() + docInfo.name.slice(1)} ${prefix}`;
};

// Componente para mostrar archivos con enlaces
const FileValueDisplay = ({ cambio, tipo }) => {
    const isNew = tipo === 'nuevo';
    // Soportar ambos formatos: directo (urlNuevo/urlAnterior) o anidado (fileChange)
    const url = isNew
        ? (cambio.urlNuevo || cambio.fileChange?.newUrl)
        : (cambio.urlAnterior || cambio.fileChange?.previousUrl);

    // Obtener nombre del archivo si está disponible
    const nombreArchivo = isNew
        ? (cambio.nombreArchivo || cambio.fileChange?.newFileName)
        : (cambio.nombreArchivoAnterior || cambio.fileChange?.previousFileName);

    if (url) {
        // Si tenemos nombre de archivo, usarlo; si no, generar nombre amigable
        const displayName = nombreArchivo || generateFriendlyFileName(cambio.campo, isNew);
        const colorClass = isNew
            ? 'text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700'
            : 'text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-700';

        return (
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm ${colorClass}`}>
                <span className="font-medium">{displayName}</span>
                <div className="flex gap-1">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            window.open(url, '_blank');
                        }}
                        className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors"
                        title="Abrir archivo"
                    >
                        <ExternalLink size={10} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `${cambio.campo}_${tipo}_${new Date().toISOString().split('T')[0]}`;
                            link.target = '_blank';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                        }}
                        className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors"
                        title="Descargar archivo"
                    >
                        <Download size={10} />
                    </button>
                </div>
            </div>
        );
    }

    // Fallback para archivos sin URL
    const valor = isNew ? cambio.actual : cambio.anterior;
    let Icon = FileText;
    if (valor?.includes('Nuevo')) Icon = UploadCloud;
    if (valor?.includes('eliminado')) Icon = Trash2;

    return (
        <span className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
            <Icon size={12} />
            {valor}
        </span>
    );
};

// Componente para renderizar mensaje con links interactivos a archivos
const MessageWithFileLinks = ({ mensaje, urlAnterior, urlNueva, urlNuevo }) => {
    // Soportar ambos: urlNueva (antiguo) y urlNuevo (nuevo)
    const urlNew = urlNuevo || urlNueva;

    // Función para abrir archivo en nueva pestaña
    const openFile = (url, e) => {
        e.preventDefault();
        if (url) {
            window.open(url, '_blank');
        }
    };

    // Si no hay URLs, mostrar mensaje simple
    if (!urlAnterior && !urlNew) {
        return <p className="text-sm text-gray-600 dark:text-gray-400 italic leading-relaxed">{mensaje}</p>;
    }

    // Renderizar mensaje con links interactivos para reemplazo
    if (mensaje.includes('antigua por la nueva adjuntada')) {
        return (
            <p className="text-sm text-gray-600 dark:text-gray-400 italic leading-relaxed">
                {mensaje.split(' antigua por la nueva adjuntada')[0]}{' '}
                {urlAnterior && (
                    <button
                        onClick={(e) => openFile(urlAnterior, e)}
                        className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 font-semibold hover:underline hover:text-red-700 dark:hover:text-red-300 transition-colors"
                        title="Abrir archivo anterior"
                    >
                        <ExternalLink size={12} />
                        antigua
                    </button>
                )}
                {' por la '}
                {urlNew && (
                    <button
                        onClick={(e) => openFile(urlNew, e)}
                        className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 font-semibold hover:underline hover:text-green-700 dark:hover:text-green-300 transition-colors"
                        title="Abrir archivo nuevo"
                    >
                        <ExternalLink size={12} />
                        nueva adjuntada
                    </button>
                )}
            </p>
        );
    }

    // Caso: Agregar archivo
    if (mensaje.includes('Se agregará') && urlNew) {
        return (
            <p className="text-sm text-gray-600 dark:text-gray-400 italic leading-relaxed">
                {mensaje}{' '}
                <button
                    onClick={(e) => openFile(urlNew, e)}
                    className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 font-semibold hover:underline hover:text-green-700 dark:hover:text-green-300 transition-colors"
                    title="Ver archivo nuevo"
                >
                    <ExternalLink size={12} />
                    (Ver archivo)
                </button>
            </p>
        );
    }

    // Caso: Eliminar archivo
    if (mensaje.includes('Se eliminará') && urlAnterior) {
        return (
            <p className="text-sm text-gray-600 dark:text-gray-400 italic leading-relaxed">
                {mensaje}{' '}
                <button
                    onClick={(e) => openFile(urlAnterior, e)}
                    className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 font-semibold hover:underline hover:text-red-700 dark:hover:text-red-300 transition-colors"
                    title="Ver archivo a eliminar"
                >
                    <ExternalLink size={12} />
                    (Ver archivo)
                </button>
            </p>
        );
    }

    // Fallback: mensaje simple
    return <p className="text-sm text-gray-600 dark:text-gray-400 italic leading-relaxed">{mensaje}</p>;
};

const THEMES = {
    warning: {
        type: 'warning',
        confirmVariant: 'danger',
    },
    info: {
        type: 'info',
        confirmVariant: 'primary',
    },
    success: {
        type: 'success',
        confirmVariant: 'success',
    }
};

const ModalConfirmacion = ({
    isOpen,
    onClose,
    onConfirm,
    titulo,
    mensaje,
    cambios = [],
    isSubmitting = false,
    type = 'info',
    size = '3xl', // ✨ Tamaño aumentado por defecto
    disabled = false
}) => {
    if (!isOpen) {
        return null;
    }

    const theme = THEMES[type] || THEMES.info;
    const hayCambios = cambios.length > 0;

    // Estadísticas de cambios
    const cambiosStats = hayCambios ? {
        total: cambios.length,
        archivos: cambios.filter(c => c.fileChange || c.mensaje).length,
        campos: cambios.filter(c => !c.fileChange && !c.mensaje).length
    } : null;

    // Contenido de cambios para extraContent (DISEÑO MODERNIZADO)
    const cambiosContent = hayCambios ? (
        <div className="space-y-4">
            {/* Estadísticas de Cambios */}
            <div className="grid grid-cols-3 gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl p-3 border border-blue-200/50 dark:border-blue-800/30">
                    <div className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1">
                        Total Cambios
                    </div>
                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                        {cambiosStats.total}
                    </div>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-xl p-3 border border-emerald-200/50 dark:border-emerald-800/30">
                    <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-1">
                        Archivos
                    </div>
                    <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                        {cambiosStats.archivos}
                    </div>
                </div>
                <div className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 rounded-xl p-3 border border-violet-200/50 dark:border-violet-800/30">
                    <div className="text-xs font-medium text-violet-600 dark:text-violet-400 uppercase tracking-wide mb-1">
                        Datos
                    </div>
                    <div className="text-2xl font-bold text-violet-700 dark:text-violet-300">
                        {cambiosStats.campos}
                    </div>
                </div>
            </div>

            {/* Lista de Cambios Modernizada */}
            <div className="space-y-3 max-h-[28rem] overflow-y-auto pr-2 custom-scrollbar">
                {cambios.map((cambio, index) => {
                    const isFileChange = cambio.fileChange || cambio.mensaje;
                    const { Icon, color, bg, border } = getFieldIcon(cambio.campo);

                    return (
                        <div
                            key={index}
                            className={`group relative ${bg} rounded-xl border-2 ${border} 
                                hover:shadow-lg hover:scale-[1.01] transition-all duration-300 overflow-hidden`}
                        >
                            {/* Header con icono y nombre del campo */}
                            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/50 dark:border-gray-800/50">
                                <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-white/80 dark:bg-gray-900/80 
                                    flex items-center justify-center shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                                    <Icon className={`w-6 h-6 ${color}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">
                                        {cambio.campo}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                                            ${isFileChange
                                                ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                                                : 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                                            }`}>
                                            {isFileChange ? '📎 Archivo' : '📝 Dato'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Contenido del cambio */}
                            <div className="px-4 py-4">
                                {cambio.mensaje ? (
                                    <MessageWithFileLinks
                                        mensaje={cambio.mensaje}
                                        urlAnterior={cambio.urlAnterior}
                                        urlNuevo={cambio.urlNuevo}
                                    />
                                ) : isFileChange ? (
                                    <div className="space-y-3">
                                        {/* Anterior */}
                                        <div className="bg-red-50/50 dark:bg-red-950/20 rounded-lg p-3 border border-red-200/50 dark:border-red-800/30">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="px-2 py-0.5 rounded-md bg-red-100 dark:bg-red-900/50 
                                                    text-red-700 dark:text-red-300 text-xs font-bold uppercase tracking-wider">
                                                    Anterior
                                                </div>
                                            </div>
                                            <FileValueDisplay cambio={cambio} tipo="anterior" />
                                        </div>

                                        {/* Flecha de transición */}
                                        <div className="flex items-center justify-center">
                                            <div className="flex items-center gap-2 px-4 py-2 rounded-full 
                                                bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md">
                                                <ArrowRight className="w-4 h-4" />
                                                <span className="text-xs font-bold">CAMBIO</span>
                                                <ArrowRight className="w-4 h-4" />
                                            </div>
                                        </div>

                                        {/* Nuevo */}
                                        <div className="bg-green-50/50 dark:bg-green-950/20 rounded-lg p-3 border border-green-200/50 dark:border-green-800/30">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="px-2 py-0.5 rounded-md bg-green-100 dark:bg-green-900/50 
                                                    text-green-700 dark:text-green-300 text-xs font-bold uppercase tracking-wider">
                                                    Nuevo
                                                </div>
                                            </div>
                                            <FileValueDisplay cambio={cambio} tipo="nuevo" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Valor Anterior */}
                                        <div className="bg-red-50/50 dark:bg-red-950/20 rounded-lg p-4 border border-red-200/50 dark:border-red-800/30">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="px-2 py-0.5 rounded-md bg-red-100 dark:bg-red-900/50 
                                                    text-red-700 dark:text-red-300 text-xs font-bold uppercase tracking-wider">
                                                    Anterior
                                                </div>
                                            </div>
                                            <div className="text-base font-medium text-gray-600 dark:text-gray-400 line-through decoration-2">
                                                {formatValue(cambio.campo, cambio.anterior)}
                                            </div>
                                        </div>

                                        {/* Valor Nuevo */}
                                        <div className="bg-green-50/50 dark:bg-green-950/20 rounded-lg p-4 border border-green-200/50 dark:border-green-800/30">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="px-2 py-0.5 rounded-md bg-green-100 dark:bg-green-900/50 
                                                    text-green-700 dark:text-green-300 text-xs font-bold uppercase tracking-wider">
                                                    Nuevo
                                                </div>
                                            </div>
                                            <div className="text-base font-bold text-gray-900 dark:text-white">
                                                {formatValue(cambio.campo, cambio.actual)}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Número de cambio (badge) */}
                            <div className="absolute top-3 right-3">
                                <div className="w-7 h-7 rounded-full bg-white dark:bg-gray-900 
                                    shadow-md ring-2 ring-gray-200 dark:ring-gray-700
                                    flex items-center justify-center">
                                    <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                                        #{index + 1}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    ) : null;

    // Mensaje principal
    const messageContent = hayCambios ? (
        <p className="text-base text-gray-600 dark:text-gray-300">
            Por favor, revisa y confirma los siguientes cambios:
        </p>
    ) : mensaje;

    return (
        <ConfirmModal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={onConfirm}
            title={titulo}
            message={messageContent}
            type={theme.type}
            size={size}
            isSubmitting={isSubmitting}
            disabled={disabled}
            confirmText="Confirmar"
            cancelText="Cancelar"
            extraContent={cambiosContent}
        />
    );
};

export default ModalConfirmacion;
