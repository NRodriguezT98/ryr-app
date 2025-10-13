/**
 * TabHistorial REFACTORIZADO - Versión modular y mantenible
 * 
 * Características:
 * - Diseñado específicamente para el nuevo sistema de auditoría
 * - Arquitectura modular con responsabilidad única
 * - Componentes reutilizables y testeables
 * - Fácil de mantener y extender
 */

import React from 'react';
import { HistoryItem } from './historial/HistoryItem';
import { useClientHistory } from './historial/useClientHistory';
import { Icons } from './historial/HistorialIcons';

const NewTabHistorial = ({ cliente }) => {
    const { logs, loading, error, refetch } = useClientHistory(cliente?.id);

    // Estado de carga
    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
                    <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Cargando historial...</p>
                </div>
            </div>
        );
    }

    // Estado de error
    if (error) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center max-w-md">
                    <Icons.XCircle className="mx-auto h-12 w-12 text-red-500" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                        Error al cargar el historial
                    </h3>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{error}</p>
                    <button
                        onClick={refetch}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    // Estado vacío
    if (logs.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center max-w-md">
                    <Icons.Archive className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                        Sin actividad registrada
                    </h3>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        No hay actividad registrada para este cliente todavía.
                    </p>
                </div>
            </div>
        );
    }

    // Renderizar historial
    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Historial de Actividad
                </h3>
                <button
                    onClick={refetch}
                    className="px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors flex items-center gap-2"
                    title="Actualizar historial"
                >
                    <Icons.RefreshCw className="w-4 h-4" />
                    Actualizar
                </button>
            </div>

            {/* Timeline de actividades */}
            <div className="relative">
                {logs.map((log, index) => (
                    <HistoryItem
                        key={log.id}
                        log={log}
                        index={index}
                    />
                ))}
            </div>

            {/* Indicador de fin */}
            <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <div className="h-px w-12 bg-gray-300 dark:bg-gray-700"></div>
                    <span>Inicio del historial</span>
                    <div className="h-px w-12 bg-gray-300 dark:bg-gray-700"></div>
                </div>
            </div>
        </div>
    );
};

export default NewTabHistorial;
