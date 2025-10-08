// src/pages/admin/audit-details/DetalleCambios.jsx

import React from 'react';
import { ArrowRight, FileText, Hash, Home, Mail, Phone, ToggleLeft, ToggleRight, Trash2, UploadCloud, User as UserIcon, Download, ExternalLink } from 'lucide-react';
import { formatCurrency } from '../../../utils/textFormatters';

// Componente para dar estilo a los valores (anterior vs. nuevo)
const formatValue = (key, valor) => {
    // Si el valor ya viene formateado como 'Sí' o 'No' desde el servicio, lo dejamos pasar
    if (valor === 'Sí' || valor === 'No' || valor === 'N/A' || valor === 'No definido') return valor;
    // Si no tiene valor, lo estandarizamos
    if (valor === undefined || valor === null || valor === '') return 'N/A';

    // Lista de campos (keys) que deben ser formateados como moneda
    const camposMoneda = ['valorBase', 'recargoEsquinera', 'valorTotal', 'gastosNotariales', 'valorFinal', 'saldoPendiente'];
    if (camposMoneda.includes(key)) {
        // Limpiamos el valor por si viene con símbolos y lo convertimos a número
        const valorNumerico = Number(String(valor).replace(/[^\d.-]/g, ''));
        return formatCurrency(valorNumerico);
    }

    // Campo booleano que queremos como 'Sí' o 'No'
    if (key === 'esEsquinera') {
        return valor === true || String(valor).toLowerCase() === 'true' ? 'Sí' : 'No';
    }

    return valor; // Devuelve el valor original si no hay regla de formato
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

const ValorPill = ({ valor, tipo, cambio }) => {
    // Manejar valores booleanos
    if (valor === 'Sí' || valor === 'No') {
        const Icono = valor === 'Sí' ? ToggleRight : ToggleLeft;
        const color = valor === 'Sí' ? 'text-green-500' : 'text-red-500';
        return (
            <span className={`flex items-center gap-1.5 text-sm font-medium ${color}`}>
                <Icono size={16} /> {valor}
            </span>
        );
    }

    // Manejar archivos con URLs disponibles para auditoría
    if (cambio?.fileChange) {
        const isNew = tipo === 'nuevo';
        const url = isNew ? cambio.fileChange.newUrl : cambio.fileChange.previousUrl;

        if (url) {
            const friendlyName = generateFriendlyFileName(cambio.campo, isNew);
            const pillColor = tipo === 'anterior'
                ? 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300'
                : 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300';

            return (
                <div className={`px-3 py-2 rounded-lg border ${pillColor} text-sm`}>
                    <div className="flex items-center justify-between gap-2">
                        <span className="font-medium">{friendlyName}</span>
                        <div className="flex gap-1">
                            <button
                                onClick={() => window.open(url, '_blank')}
                                className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors"
                                title="Abrir archivo"
                            >
                                <ExternalLink size={12} />
                            </button>
                            <button
                                onClick={() => {
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
                                <Download size={12} />
                            </button>
                        </div>
                    </div>
                </div>
            );
        } else {
            // No hay URL disponible, mostrar mensaje genérico
            let Icono = FileText;
            let mensaje = valor;

            if (valor?.includes('Nuevo')) Icono = UploadCloud;
            if (valor?.includes('eliminado')) Icono = Trash2;

            return (
                <span className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                    <Icono size={14} /> {mensaje}
                </span>
            );
        }
    }

    // Manejar archivos legacy (sin información de fileChange)
    if (valor?.includes('Archivo')) {
        let Icono = FileText;
        if (valor.includes('Nuevo')) Icono = UploadCloud;
        if (valor.includes('eliminado')) Icono = Trash2;
        return (
            <span className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                <Icono size={14} /> {valor}
            </span>
        );
    }

    // Valores normales
    const pillColor = tipo === 'anterior'
        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 line-through'
        : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-sm font-medium ${pillColor}`}>
            {valor}
        </span>
    );
};

// Mapa para asignar íconos a cada campo y hacer la UI más intuitiva
const CAMPO_ICONOS = {
    'Nombres': UserIcon, 'Apellidos': UserIcon, 'Teléfono': Phone, 'Correo': Mail,
    'Dirección': Home, 'Vivienda Asignada': Home, 'Monto': Hash,
    'default': FileText
};

const getIconoParaCampo = (campo) => {
    const campoNormalizado = campo.toLowerCase();
    for (const key in CAMPO_ICONOS) {
        if (campoNormalizado.includes(key.toLowerCase())) return CAMPO_ICONOS[key];
    }
    return CAMPO_ICONOS.default;
};

// El componente principal rediseñado
const DetalleCambios = ({ icon: TitleIcon, titulo, cambios }) => {
    if (!cambios || cambios.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-3">
                    <div className="text-gray-400 dark:text-gray-500">{TitleIcon}</div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">{titulo}</h3>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 pl-9">
                    No se registraron cambios específicos para esta acción.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-4">
                <div className="text-gray-400 dark:text-gray-500">{TitleIcon}</div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">{titulo}</h3>
            </div>
            <ul className="space-y-3 pl-9">
                {cambios.map((cambio, index) => {
                    const IconoCampo = getIconoParaCampo(cambio.campo);
                    const valorAnteriorFormateado = formatValue(cambio.campo, cambio.anterior);
                    const valorActualFormateado = formatValue(cambio.campo, cambio.actual);
                    return (
                        <li key={index} className="grid grid-cols-3 items-center gap-4 text-sm">
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 col-span-1">
                                <IconoCampo size={14} className="text-gray-400 flex-shrink-0" />
                                <span className="font-semibold capitalize">{cambio.campo.replace(/_/g, ' ')}</span>
                            </div>
                            <div className="flex items-center gap-2 col-span-2">
                                <ValorPill valor={valorAnteriorFormateado} tipo="anterior" cambio={cambio} />
                                <ArrowRight size={16} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
                                <ValorPill valor={valorActualFormateado} tipo="nuevo" cambio={cambio} />
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default DetalleCambios;