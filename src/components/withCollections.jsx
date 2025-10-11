/**
 * @file withCollections.jsx
 * @description Higher-Order Component para cargar colecciones automáticamente
 * Uso: export default withCollections(MiComponente, ['viviendas', 'clientes'])
 */

import React, { useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Loader, Sparkles } from 'lucide-react';

/**
 * HOC que carga colecciones necesarias antes de renderizar el componente
 * @param {React.Component} Component - Componente a envolver
 * @param {Array<string>} requiredCollections - Colecciones necesarias ['viviendas', 'clientes', etc]
 * @param {Object} options - Opciones de configuración
 * @param {boolean} options.showLoader - Si muestra loader mientras carga (default: true)
 * @param {React.Component} options.LoaderComponent - Componente loader personalizado
 * @returns {React.Component} Componente envuelto
 */
export const withCollections = (Component, requiredCollections = [], options = {}) => {
    const {
        showLoader = true,
        LoaderComponent = DefaultLoader
    } = options;

    return function WithCollectionsWrapper(props) {
        const { loadCollection, hasLoaded, loadingStates } = useData();

        // Cargar colecciones necesarias al montar
        useEffect(() => {
            requiredCollections.forEach(collectionName => {
                if (!hasLoaded[collectionName]) {
                    loadCollection(collectionName);
                }
            });
        }, [loadCollection, hasLoaded]);

        // Verificar si todas las colecciones están cargadas
        const allLoaded = requiredCollections.every(name => hasLoaded[name]);
        const anyLoading = requiredCollections.some(name => loadingStates[name]);

        // Mostrar loader si está configurado y aún carga
        if (showLoader && (!allLoaded || anyLoading)) {
            return <LoaderComponent collections={requiredCollections} />;
        }

        // Renderizar componente cuando todo está listo
        return <Component {...props} />;
    };
};

/**
 * Loader por defecto
 */
const DefaultLoader = ({ collections }) => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
            <div className="relative">
                <Loader className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
                <Sparkles className="w-8 h-8 text-purple-500 absolute -top-2 -right-2 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                Cargando Datos
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
                Preparando {collections.join(', ')}...
            </p>
        </div>
    </div>
);

/**
 * Hook alternativo para cargar colecciones en componentes funcionales
 * Uso: const { isReady } = useLoadCollections(['viviendas', 'clientes'])
 */
export const useLoadCollections = (requiredCollections = []) => {
    const { loadCollection, hasLoaded, loadingStates } = useData();

    useEffect(() => {
        requiredCollections.forEach(collectionName => {
            if (!hasLoaded[collectionName]) {
                loadCollection(collectionName);
            }
        });
    }, [loadCollection, hasLoaded, requiredCollections]);

    const allLoaded = requiredCollections.every(name => hasLoaded[name]);
    const anyLoading = requiredCollections.some(name => loadingStates[name]);
    const isReady = allLoaded && !anyLoading;

    return {
        isReady,
        hasLoaded,
        loadingStates,
        allLoaded,
        anyLoading
    };
};
