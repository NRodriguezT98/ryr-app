import { useState, useEffect } from 'react';

/**
 * Hook para debouncing de valores
 * Retrasa la actualización del valor hasta que el usuario deje de escribir
 * 
 * @param {any} value - Valor a debounce
 * @param {number} delay - Delay en ms (default: 300)
 * @returns {any} Valor debounced
 */
export const useDebounce = (value, delay = 300) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};
