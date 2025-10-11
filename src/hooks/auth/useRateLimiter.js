/**
 * @file useRateLimiter.js
 * @description Hook para implementar rate limiting en el cliente
 */

import { useState, useCallback, useRef } from 'react';

/**
 * Hook para limitar la cantidad de intentos en un período de tiempo
 * @param {number} maxAttempts - Número máximo de intentos permitidos
 * @param {number} windowMs - Ventana de tiempo en milisegundos
 * @returns {Object} - Funciones y estado del rate limiter
 */
export const useRateLimiter = (maxAttempts = 5, windowMs = 60000) => {
    const [isBlocked, setIsBlocked] = useState(false);
    const [remainingTime, setRemainingTime] = useState(0);
    const [attemptsLeft, setAttemptsLeft] = useState(maxAttempts);

    const attemptsRef = useRef([]);
    const blockTimeoutRef = useRef(null);

    /**
     * Limpia intentos antiguos fuera de la ventana de tiempo
     */
    const cleanOldAttempts = useCallback(() => {
        const now = Date.now();
        attemptsRef.current = attemptsRef.current.filter(
            timestamp => now - timestamp < windowMs
        );
    }, [windowMs]);

    /**
     * Registra un nuevo intento
     * @returns {boolean} - true si el intento es permitido, false si está bloqueado
     */
    const registerAttempt = useCallback(() => {
        cleanOldAttempts();

        if (attemptsRef.current.length >= maxAttempts) {
            const oldestAttempt = attemptsRef.current[0];
            const blockDuration = windowMs - (Date.now() - oldestAttempt);

            setIsBlocked(true);
            setRemainingTime(Math.ceil(blockDuration / 1000));

            // Countdown timer
            const interval = setInterval(() => {
                setRemainingTime(prev => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        reset();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            blockTimeoutRef.current = interval;
            return false;
        }

        attemptsRef.current.push(Date.now());
        setAttemptsLeft(maxAttempts - attemptsRef.current.length);
        return true;
    }, [maxAttempts, windowMs, cleanOldAttempts]);

    /**
     * Resetea el rate limiter
     */
    const reset = useCallback(() => {
        attemptsRef.current = [];
        setIsBlocked(false);
        setRemainingTime(0);
        setAttemptsLeft(maxAttempts);

        if (blockTimeoutRef.current) {
            clearInterval(blockTimeoutRef.current);
            blockTimeoutRef.current = null;
        }
    }, [maxAttempts]);

    /**
     * Verifica si actualmente está bloqueado
     * @returns {boolean}
     */
    const checkIsBlocked = useCallback(() => {
        cleanOldAttempts();
        return attemptsRef.current.length >= maxAttempts;
    }, [maxAttempts, cleanOldAttempts]);

    return {
        isBlocked,
        remainingTime,
        attemptsLeft,
        registerAttempt,
        reset,
        checkIsBlocked
    };
};

export default useRateLimiter;
