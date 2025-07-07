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