import { formatCurrency, toTitleCase } from './textFormatters';

// Mapeo de claves a nombres legibles (se mantiene tu función original)
const FIELD_NAMES = {
    nombres: 'Nombres',
    apellidos: 'Apellidos',
    cedula: 'Cédula',
    telefono: 'Teléfono',
    correo: 'Correo',
    direccion: 'Dirección',
};

// Función para dar formato a los valores (se mantiene tu función original)
const formatValue = (key, value) => {
    if (typeof value === 'boolean') return value ? 'Sí' : 'No';
    if (key.toLowerCase().includes('monto')) return formatCurrency(value);
    if (typeof value === 'string') return toTitleCase(value);
    return value;
};

// TU FUNCIÓN ORIGINAL (la dejamos por si la usas en otros módulos)
export const generateChangesArray = (oldData, newData) => {
    const changes = [];
    const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);

    allKeys.forEach(key => {
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


// ✨ FUNCIÓN NUEVA Y CORREGIDA PARA ABONOS ✨
// Esta es la función que exportaremos y usaremos en el modal de edición.
// Produce el formato de objeto correcto: { campo, anterior, actual }
export const encontrarCambiosAbono = (original, actualizado) => {
    const cambios = [];
    const labels = {
        monto: 'Monto',
        fechaPago: 'Fecha de Pago',
        observacion: 'Observación',
        urlComprobante: 'Comprobante'
    };

    const originalSeguro = original || {};

    Object.keys(labels).forEach(key => {
        const valorOriginal = originalSeguro[key] || '';
        const valorActualizado = actualizado[key] || '';

        // Comparamos los valores como strings para evitar problemas de tipo
        if (String(valorOriginal) !== String(valorActualizado)) {
            cambios.push({
                // La clave 'campo' ahora coincide con lo que espera el modal
                campo: labels[key],
                anterior: key === 'monto'
                    ? formatCurrency(valorOriginal || 0)
                    : (key === 'urlComprobante' ? (valorOriginal ? 'Archivo existente' : 'Sin archivo') : (valorOriginal || 'Vacío')),
                actual: key === 'monto'
                    ? formatCurrency(valorActualizado || 0)
                    : (key === 'urlComprobante' ? (valorActualizado ? 'Nuevo archivo' : 'Sin archivo') : (valorActualizado || 'Vacío')),
            });
        }
    });

    return cambios;
};