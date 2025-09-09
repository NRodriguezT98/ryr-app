// src/pages/admin/audit-details/components/DetalleDatosClave.jsx

import React from 'react';
import DetailRow from './DetailRow'; // Importamos nuestro ladrillo fundamental
import { User, DollarSign, Home, Tag, Hash, HandCoins, CalendarCheck, CalendarClock, Phone, IdCard } from 'lucide-react'; // Importamos algunos iconos comunes

// Función para normalizar el texto
const normalizeText = (text) => {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

// Un mapa para asignar iconos a etiquetas comunes
const getIconForLabel = (label) => {

    // Usamos la función para limpiar el texto antes de comparar
    const normalizedLabel = normalizeText(label.toLowerCase());
    const lowerLabel = label.toLowerCase();
    if (normalizedLabel.includes('cedula')) return <IdCard size={14} />;
    if (normalizedLabel.includes('telefono')) return <Phone size={14} />;
    if (normalizedLabel.includes('cuota inicial')) return <HandCoins size={14} />;
    if (normalizedLabel.includes('consecutivo')) return <Hash size={14} />;
    if (normalizedLabel.includes('fuente de pago')) return <HandCoins size={14} />;
    if (normalizedLabel.includes('fecha del pago')) return <CalendarCheck size={14} />;
    if (normalizedLabel.includes('fecha y hora de registro de la accion')) return <CalendarClock size={14} />;
    if (normalizedLabel.includes('cliente') || lowerLabel.includes('nombre')) return <User size={14} />;
    if (normalizedLabel.includes('monto') || lowerLabel.includes('valor')) return <DollarSign size={14} />;
    if (normalizedLabel.includes('vivienda')) return <Home size={14} />;
    // ... puedes añadir más mapeos aquí
    return <Tag size={14} />;
};

const DetalleDatosClave = ({ titulo, datos, icon }) => {
    console.log("Datos recibidos en DetalleDatosClave:", datos);
    return (
        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-3">
            <h4 className="font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-2 mb-2">
                {icon} {titulo}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(datos).map(([label, value]) => (
                    <DetailRow
                        key={label}
                        icon={getIconForLabel(label)}
                        label={label}
                        value={String(value) || 'N/A'}
                    />
                ))}
            </div>
        </div>
    );
};

export default DetalleDatosClave;