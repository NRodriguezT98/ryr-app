import { formatCurrency, toTitleCase } from './textFormatters';

// Mapeo de claves a nombres legibles para los reportes de auditoría
const FIELD_NAMES = {
    nombres: 'Nombres',
    apellidos: 'Apellidos',
    cedula: 'Cédula',
    telefono: 'Teléfono',
    correo: 'Correo',
    direccion: 'Dirección',
    // ... puedes añadir más campos aquí
};

// Función para dar formato a los valores para que se vean bien en el reporte
const formatValue = (key, value) => {
    if (typeof value === 'boolean') return value ? 'Sí' : 'No';
    if (key.toLowerCase().includes('monto')) return formatCurrency(value);
    if (typeof value === 'string') return toTitleCase(value);
    return value;
};

export const generateChangesArray = (oldData, newData) => {
    const changes = [];
    const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);

    allKeys.forEach(key => {
        // Ignoramos la comparación de objetos complejos por ahora
        if (typeof oldData[key] === 'object' || typeof newData[key] === 'object') {
            return;
        }

        if (oldData[key] !== newData[key]) {
            changes.push({
                field: FIELD_NAMES[key] || toTitleCase(key),
                oldValue: formatValue(key, oldData[key] || 'Vacío'),
                newValue: formatValue(key, newData[key] || 'Vacío'),
            });
        }
    });
    return changes;
};