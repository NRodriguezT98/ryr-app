/**
 * --- FUNCIÓN CORREGIDA Y DEFINITIVA ---
 * Obtiene la fecha actual en la zona horaria de Colombia (America/Bogota) 
 * y la devuelve en formato YYYY-MM-DD.
 * Esta versión utiliza la API Intl.DateTimeFormat para obtener las partes de la fecha
 * de forma explícita y segura, evitando errores de parsing de strings.
 * @returns {string} La fecha de hoy en Colombia en el formato correcto.
 */
export const getTodayString = () => {
    // Para depuración, podemos ver qué se está ejecutando.
    const today = new Date();

    const options = {
        timeZone: 'America/Bogota',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    };

    // Usamos un formatter para obtener las partes de la fecha (año, mes, día)
    // de forma individual para la zona horaria de Colombia.
    const formatter = new Intl.DateTimeFormat('en-US', options);
    const parts = formatter.formatToParts(today);

    // Encontramos cada parte y la extraemos.
    const year = parts.find(part => part.type === 'year').value;
    const month = parts.find(part => part.type === 'month').value;
    const day = parts.find(part => part.type === 'day').value;

    // Construimos el string final en el formato YYYY-MM-DD.
    const finalDate = `${year}-${month}-${day}`;
    return finalDate;
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
 * Parsea un string de fecha 'YYYY-MM-DD' como si fuera UTC para evitar desfases.
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