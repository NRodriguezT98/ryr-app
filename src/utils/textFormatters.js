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
export const parseDateAsUTC = (dateInput) => {
    // Si la entrada es nula o indefinida, devolvemos null.
    if (!dateInput) return null;

    // Si ya es un objeto Date de JavaScript, lo devolvemos directamente.
    if (dateInput instanceof Date) {
        return dateInput;
    }

    // Si es un objeto Timestamp de Firestore, lo convertimos a Date.
    if (typeof dateInput.toDate === 'function') {
        return dateInput.toDate();
    }

    // Si es un string, lo procesamos como antes.
    if (typeof dateInput === 'string') {
        const parts = dateInput.split('-');
        if (parts.length !== 3) return null; // String con formato inválido
        const [year, month, day] = parts.map(Number);
        return new Date(Date.UTC(year, month - 1, day));
    }

    // Si no es ninguno de los anteriores, es un tipo no soportado.
    return null;
};

/**
 * Formatea un string de fecha (YYYY-MM-DD) a un formato legible.
 */
export const formatDisplayDate = (dateInput) => {
    if (!dateInput) return 'N/A';

    const date = parseDateAsUTC(dateInput);

    // Verificamos si la fecha resultante es válida antes de formatear.
    if (!date || isNaN(date.getTime())) {
        return 'Fecha inválida';
    }

    return new Intl.DateTimeFormat('es-CO', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC' // Usamos UTC para consistencia con parseDateAsUTC
    }).format(date);
};

/**
 * Obtiene las iniciales de un nombre y un apellido.
 */
export const getInitials = (nombres = '', apellidos = '') => {
    const n = nombres.charAt(0) || '';
    const a = apellidos.charAt(0) || '';
    return `${n}${a}`.toUpperCase();
};

export const normalizeDate = (dateInput) => {
    if (!dateInput) return null;

    // Caso 1: Es un Timestamp de Firestore con el método .toDate()
    if (typeof dateInput.toDate === 'function') {
        return dateInput.toDate();
    }

    // Caso 2: Es un objeto simple con 'seconds'
    if (typeof dateInput.seconds === 'number') {
        return new Date(dateInput.seconds * 1000);
    }

    // Caso 3: Ya es un objeto Date de JavaScript
    if (dateInput instanceof Date) {
        return dateInput;
    }

    // --- LA LÍNEA CLAVE QUE FALTABA ---
    // Caso 4: Es un string (ej: "2025-09-01")
    if (typeof dateInput === 'string') {
        // Reutilizamos la función que ya maneja strings y zonas horarias correctamente.
        return parseDateAsUTC(dateInput);
    }

    return null;
};