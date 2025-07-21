/**
 * --- FUNCIÓN NUEVA Y CORREGIDA ---
 * Obtiene la fecha local actual en formato YYYY-MM-DD.
 * Esta función evita los problemas de conversión a UTC.
 * @returns {string} La fecha de hoy en el formato correcto.
 */
export const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Convierte un string a "Sentence case".
 */
export const toSentenceCase = (str) => {
    if (!str || typeof str !== 'string') return '';
    const lower = str.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
};

/**
 * Convierte un string a "Title Case".
 */
export const toTitleCase = (str) => {
    if (!str) return '';
    return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

/**
 * Formatea un valor numérico como moneda colombiana (COP).
 */
export const formatCurrency = (value) => {
    return (value || 0).toLocaleString("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0
    });
};

/**
 * Formatea un número de cédula con separadores de miles.
 */
export const formatID = (cedula) => {
    if (!cedula) return '';
    return Number(cedula).toLocaleString("es-CO");
};

/**
 * Parsea un string de fecha 'YYYY-MM-DD' como si fuera UTC.
 */
export const parseDateAsUTC = (dateString) => {
    if (!dateString) return null;
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
};

/**
 * Formatea un string de fecha (YYYY-MM-DD) a un formato legible.
 */
export const formatDisplayDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = parseDateAsUTC(dateString);
    if (!date) return 'N/A';
    return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
    });
};

/**
 * Obtiene las iniciales de un nombre y un apellido.
 */
export const getInitials = (nombres = '', apellidos = '') => {
    const n = nombres.charAt(0) || '';
    const a = apellidos.charAt(0) || '';
    return `${n}${a}`.toUpperCase();
};