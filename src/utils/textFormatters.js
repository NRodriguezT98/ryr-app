/**
 * Convierte un string a "Sentence case".
 * Toma un texto (posiblemente en mayúsculas), lo convierte a minúsculas
 * y luego pone en mayúscula solo la primera letra.
 * @param {string} str - El string a formatear.
 * @returns {string} El string formateado.
 */
export const toSentenceCase = (str) => {
    if (!str || typeof str !== 'string') return '';
    const lower = str.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
};

/**
 * Formatea un valor numérico como moneda colombiana (COP).
 * @param {number} value - El valor a formatear.
 * @returns {string} El valor formateado como string de moneda.
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
 * @param {string | number} cedula - El número de cédula.
 * @returns {string} La cédula formateada.
 */
export const formatID = (cedula) => {
    if (!cedula) return '';
    return Number(cedula).toLocaleString("es-CO");
};