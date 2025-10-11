/**
 * @file routePreloader.js
 * @description Utilidad para precargar rutas lazy antes de navegación
 * Mejora UX: Navegación instantánea al precargar componentes en hover
 */

// Cache de componentes precargados
const preloadCache = new Map();

/**
 * Precarga un componente lazy
 * @param {Function} lazyComponent - Componente creado con lazy()
 * @param {string} key - Identificador único para cache
 */
export const preloadRoute = (lazyComponent, key) => {
    if (preloadCache.has(key)) {
        return preloadCache.get(key);
    }

    // Ejecuta el import() para descargar el chunk
    const promise = lazyComponent._payload._fn();
    preloadCache.set(key, promise);
    
    return promise;
};

/**
 * Hook de React para preload en hover
 * Uso: const handleMouseEnter = usePreloadRoute(DashboardPage, 'dashboard');
 */
export const createPreloadHandler = (importFn, key) => {
    return () => {
        if (!preloadCache.has(key)) {
            const promise = importFn();
            preloadCache.set(key, promise);
        }
    };
};

/**
 * Componente Link con preload automático en hover
 */
import { Link } from 'react-router-dom';
import { forwardRef } from 'react';

export const PreloadLink = forwardRef(({ to, preload, preloadKey, onMouseEnter, children, ...props }, ref) => {
    const handleMouseEnter = (e) => {
        if (preload && preloadKey) {
            createPreloadHandler(preload, preloadKey)();
        }
        onMouseEnter?.(e);
    };

    return (
        <Link
            ref={ref}
            to={to}
            onMouseEnter={handleMouseEnter}
            {...props}
        >
            {children}
        </Link>
    );
});

PreloadLink.displayName = 'PreloadLink';
