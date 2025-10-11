/**
 * @file authService.js
 * @description Servicio centralizado para operaciones de autenticación
 * Maneja login, logout, reset password y caché de sesión
 */

import {
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from '../firebase/config';
import { authLogger } from '../utils/logger';

// Constantes para caché
const CACHE_KEYS = {
    USER_DATA: 'ryr_user_data',
    PERMISSIONS: 'ryr_permissions',
    CACHE_TIMESTAMP: 'ryr_cache_timestamp'
};

const CACHE_DURATION = 60 * 60 * 1000; // 1 hora en milisegundos

/**
 * Clase para manejar el caché de usuario
 */
class UserCache {
    static set(userData, permissions) {
        try {
            localStorage.setItem(CACHE_KEYS.USER_DATA, JSON.stringify(userData));
            localStorage.setItem(CACHE_KEYS.PERMISSIONS, JSON.stringify(permissions));
            localStorage.setItem(CACHE_KEYS.CACHE_TIMESTAMP, Date.now().toString());
            // Cache guardado silenciosamente
        } catch (error) {
            authLogger.warn('Error guardando caché', error);
        }
    }

    static get() {
        try {
            const timestamp = localStorage.getItem(CACHE_KEYS.CACHE_TIMESTAMP);
            if (!timestamp) return null;

            const age = Date.now() - parseInt(timestamp);
            if (age > CACHE_DURATION) {
                this.clear();
                return null;
            }

            const userData = localStorage.getItem(CACHE_KEYS.USER_DATA);
            const permissions = localStorage.getItem(CACHE_KEYS.PERMISSIONS);

            if (!userData || !permissions) return null;

            return {
                userData: JSON.parse(userData),
                permissions: JSON.parse(permissions)
            };
        } catch (error) {
            authLogger.warn('Error leyendo caché', error);
            return null;
        }
    }

    static clear() {
        localStorage.removeItem(CACHE_KEYS.USER_DATA);
        localStorage.removeItem(CACHE_KEYS.PERMISSIONS);
        localStorage.removeItem(CACHE_KEYS.CACHE_TIMESTAMP);
    }

    static isValid() {
        const timestamp = localStorage.getItem(CACHE_KEYS.CACHE_TIMESTAMP);
        if (!timestamp) return false;

        const age = Date.now() - parseInt(timestamp);
        return age <= CACHE_DURATION;
    }
}

/**
 * Obtiene los datos del usuario y sus permisos desde Firestore
 * Ahora con permisos denormalizados para una sola llamada
 * @param {string} uid - ID del usuario
 * @returns {Promise<{userData: Object, permissions: Object}>}
 */
export const fetchUserData = async (uid) => {
    try {
        // Intentar obtener del caché primero
        const cached = UserCache.get();
        if (cached) {
            return cached;
        }

        const userDocRef = doc(db, "users", uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
            throw new Error('Usuario no encontrado en la base de datos');
        }

        const userData = userDocSnap.data();
        let permissions = null;

        // Primero intentar obtener permisos denormalizados (optimización futura)
        if (userData.permissions) {
            permissions = userData.permissions;
        }
        // Fallback: obtener del documento de rol (método actual)
        else if (userData.role) {
            const roleDocRef = doc(db, "roles", userData.role);
            const roleDocSnap = await getDoc(roleDocRef);

            if (roleDocSnap.exists()) {
                permissions = roleDocSnap.data().permissions;
            }
        }

        // Guardar en caché
        UserCache.set(userData, permissions);

        return { userData, permissions };
    } catch (error) {
        authLogger.error('Error obteniendo datos de usuario', error);
        throw error;
    }
};

/**
 * Inicia sesión con email y contraseña
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<UserCredential>}
 */
export const login = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential;
    } catch (error) {
        throw parseAuthError(error);
    }
};

/**
 * Cierra sesión y limpia caché
 * @returns {Promise<void>}
 */
export const logout = async () => {
    try {
        UserCache.clear();
        await signOut(auth);
    } catch (error) {
        authLogger.error('Error en logout', error);
        throw error;
    }
};

/**
 * Envía email de recuperación de contraseña
 * @param {string} email 
 * @returns {Promise<void>}
 */
export const resetPassword = async (email) => {
    try {
        await sendPasswordResetEmail(auth, email);
    } catch (error) {
        throw parseAuthError(error);
    }
};

/**
 * Parsea errores de Firebase a mensajes amigables
 * @param {Error} error 
 * @returns {Error}
 */
const parseAuthError = (error) => {
    const errorMessages = {
        'auth/invalid-email': 'El correo electrónico no es válido',
        'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
        'auth/user-not-found': 'No existe una cuenta con este correo',
        'auth/wrong-password': 'La contraseña es incorrecta',
        'auth/invalid-credential': 'Credenciales inválidas. Verifica tu email y contraseña',
        'auth/too-many-requests': 'Demasiados intentos fallidos. Intenta más tarde',
        'auth/network-request-failed': 'Error de conexión. Verifica tu internet',
        'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
        'auth/email-already-in-use': 'Este correo ya está registrado',
        'auth/operation-not-allowed': 'Operación no permitida',
        'auth/requires-recent-login': 'Por seguridad, vuelve a iniciar sesión'
    };

    const message = errorMessages[error.code] || 'Error al procesar la solicitud. Intenta nuevamente';

    // Solo loguear en desarrollo
    if (import.meta.env.MODE === 'development') {
        authLogger.warn('Error de autenticación', { code: error.code, message });
    }

    const customError = new Error(message);
    customError.code = error.code;
    customError.originalError = error;

    return customError;
};

/**
 * Limpia el caché manualmente (útil para logout o cambios de rol)
 */
export const clearAuthCache = () => {
    UserCache.clear();
};

/**
 * Verifica si el caché es válido
 */
export const isCacheValid = () => {
    return UserCache.isValid();
};

export default {
    login,
    logout,
    resetPassword,
    fetchUserData,
    clearAuthCache,
    isCacheValid
};
