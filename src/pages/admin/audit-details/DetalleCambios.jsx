// src/pages/admin/audit-details/DetalleCambios.jsx

import React from 'react';
import { ArrowRight, FileText, Hash, Home, Mail, Phone, ToggleLeft, ToggleRight, Trash2, UploadCloud, User as UserIcon } from 'lucide-react';
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
const ValorPill = ({ valor, tipo }) => {
    if (valor === 'Sí' || valor === 'No') {
        const Icono = valor === 'Sí' ? ToggleRight : ToggleLeft;
        const color = valor === 'Sí' ? 'text-green-500' : 'text-red-500';
        return (
            <span className={`flex items-center gap-1.5 text-sm font-medium ${color}`}>
                <Icono size={16} /> {valor}
            </span>
        );
    }

    if (valor?.includes('Archivo')) {
        let Icono = FileText;
        if (valor.includes('Nuevo')) Icono = UploadCloud;
        if (valor.includes('eliminado')) Icono = Trash2;
        return (
            <span className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                <Icono size={14} /> {valor}
            </span>
        )
    }

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
                                <ValorPill valor={valorAnteriorFormateado} tipo="anterior" />
                                <ArrowRight size={16} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
                                <ValorPill valor={valorActualFormateado} tipo="nuevo" />
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default DetalleCambios;