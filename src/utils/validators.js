/**
 * @file validators.js
 * @description Utilidades de validación para formularios
 */

/**
 * Valida formato de email
 * @param {string} email 
 * @returns {{isValid: boolean, error: string}}
 */
export const validateEmail = (email) => {
    if (!email) {
        return { isValid: false, error: 'El correo es requerido' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        return { isValid: false, error: 'El formato del correo no es válido' };
    }

    // Validaciones adicionales
    if (email.length > 254) {
        return { isValid: false, error: 'El correo es demasiado largo' };
    }

    const [localPart, domain] = email.split('@');

    if (localPart.length > 64) {
        return { isValid: false, error: 'El correo es demasiado largo' };
    }

    if (domain.length > 253) {
        return { isValid: false, error: 'El dominio del correo es demasiado largo' };
    }

    return { isValid: true, error: '' };
};

/**
 * Valida contraseña
 * @param {string} password 
 * @returns {{isValid: boolean, error: string, strength: string}}
 */
export const validatePassword = (password) => {
    if (!password) {
        return { isValid: false, error: 'La contraseña es requerida', strength: 'none' };
    }

    if (password.length < 6) {
        return {
            isValid: false,
            error: 'La contraseña debe tener al menos 6 caracteres',
            strength: 'weak'
        };
    }

    // Calcular fortaleza
    let strength = 'weak';
    let strengthScore = 0;

    if (password.length >= 8) strengthScore++;
    if (password.length >= 12) strengthScore++;
    if (/[a-z]/.test(password)) strengthScore++;
    if (/[A-Z]/.test(password)) strengthScore++;
    if (/[0-9]/.test(password)) strengthScore++;
    if (/[^a-zA-Z0-9]/.test(password)) strengthScore++;

    if (strengthScore >= 5) strength = 'strong';
    else if (strengthScore >= 3) strength = 'medium';

    return {
        isValid: true,
        error: '',
        strength,
        score: strengthScore
    };
};

/**
 * Valida que las contraseñas coincidan
 * @param {string} password 
 * @param {string} confirmPassword 
 * @returns {{isValid: boolean, error: string}}
 */
export const validatePasswordMatch = (password, confirmPassword) => {
    if (password !== confirmPassword) {
        return { isValid: false, error: 'Las contraseñas no coinciden' };
    }
    return { isValid: true, error: '' };
};

/**
 * Debounce function para validaciones
 * @param {Function} func 
 * @param {number} wait 
 * @returns {Function}
 */
export const debounce = (func, wait = 300) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

export default {
    validateEmail,
    validatePassword,
    validatePasswordMatch,
    debounce
};
