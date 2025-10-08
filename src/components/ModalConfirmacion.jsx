// src/components/ModalConfirmacion.jsx (CÓDIGO FINAL Y VERIFICADO)
import React from 'react';
import { ArrowRight, AlertTriangle, Check, Info, ExternalLink, Download, FileText, UploadCloud, Trash2 } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import { formatCurrency } from '../utils/textFormatters';

const formatValue = (campo, valor) => {
    // Si el valor es indefinido o nulo, lo mostramos como 'N/A'
    if (valor === undefined || valor === null || valor === '') return 'N/A';

    // Lista de campos que deben ser formateados como moneda
    const camposMoneda = ['Valor Base', 'Recargo Esquinera', 'Valor Total', 'Gastos Notariales'];
    if (camposMoneda.includes(campo)) {
        return formatCurrency(Number(valor)); // Convertimos a número por seguridad
    }

    // Campo booleano que queremos como 'Sí' o 'No'
    if (campo === 'Esquinera') {
        // Maneja tanto el valor booleano 'true' como el string 'true'
        return valor === true || String(valor).toLowerCase() === 'true' ? 'Sí' : 'No';
    }

    // Para todos los demás campos, devolvemos el valor original
    return valor;
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
    const url = isNew ? cambio.fileChange?.newUrl : cambio.fileChange?.previousUrl;

    if (url) {
        const friendlyName = generateFriendlyFileName(cambio.campo, isNew);
        const colorClass = isNew
            ? 'text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700'
            : 'text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-700';

        return (
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm ${colorClass}`}>
                <span className="font-medium">{friendlyName}</span>
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

const THEMES = {
    warning: {
        icon: AlertTriangle,
        iconColor: 'text-red-600 dark:text-red-400',
        iconBg: 'bg-red-100 dark:bg-red-900/50',
        buttonVariant: 'danger',
    },
    info: {
        icon: Info,
        iconColor: 'text-blue-600 dark:text-blue-400',
        iconBg: 'bg-blue-100 dark:bg-blue-900/50',
        buttonVariant: 'primary',
    },
    success: {
        icon: Check,
        iconColor: 'text-green-600 dark:text-green-400',
        iconBg: 'bg-green-100 dark:bg-green-900/50',
        buttonVariant: 'success',
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
    size = 'lg',
    disabled = false
}) => {
    if (!isOpen) {
        return null;
    }

    const theme = THEMES[type] || THEMES.warning;
    const IconComponent = theme.icon;
    const hasCambios = cambios.length > 0;

    const footerContent = (
        <>
            <Button variant="secondary" onClick={onClose} disabled={isSubmitting} className="w-auto px-6">
                Cancelar
            </Button>
            <Button
                variant={theme.buttonVariant}
                onClick={onConfirm}
                isLoading={isSubmitting}
                disabled={disabled || isSubmitting}
                loadingText="Procesando..."
                className="w-auto px-6"
            >
                Confirmar
            </Button>
        </>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={titulo}
            size={size}
            footer={footerContent}
            icon={<IconComponent className={`h-6 w-6 ${theme.iconColor}`} aria-hidden="true" />}
        >
            <div className="text-left">
                {/* Cambiamos la etiqueta <p> por <div> para permitir contenido complejo */}
                <div className="text-base text-gray-600 dark:text-gray-300">
                    {hasCambios ? <p>Por favor, revisa y confirma los siguientes cambios:</p> : mensaje}
                </div>

                {hasCambios && (
                    <div className="mt-4 space-y-3 max-h-72 overflow-y-auto pr-2 text-left bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border dark:border-gray-200 dark:border-gray-700">
                        {cambios.map((cambio, index) => {
                            // Detectar si es un cambio de archivo
                            const isFileChange = cambio.fileChange || cambio.campo?.includes('Archivo') || cambio.campo?.includes('Carta Aprob') || cambio.campo?.includes('Cédula');

                            return (
                                <div key={index} className="p-2 border-b border-gray-200 dark:border-gray-600 last:border-b-0 animate-fade-in">
                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{cambio.campo}</p>

                                    {isFileChange ? (
                                        // Renderizado especial para archivos
                                        <div className="mt-2 space-y-2">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400">ANTES:</span>
                                                    <FileValueDisplay cambio={cambio} tipo="anterior" />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-semibold text-green-600 dark:text-green-400">AHORA:</span>
                                                    <FileValueDisplay cambio={cambio} tipo="nuevo" />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        // Renderizado normal para cambios de texto
                                        <div className="mt-1 flex flex-col items-start sm:flex-row sm:items-center sm:justify-between gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-semibold text-red-600 dark:text-red-400">ANTES:</span>
                                                <span className="text-sm text-gray-500 dark:text-gray-400 line-through">{formatValue(cambio.campo, cambio.anterior)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-semibold text-green-600 dark:text-green-400">AHORA:</span>
                                                <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{formatValue(cambio.campo, cambio.actual)}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default ModalConfirmacion;