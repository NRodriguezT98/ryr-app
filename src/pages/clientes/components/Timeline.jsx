// src/pages/clientes/components/Timeline.jsx

import React from 'react';
import PasoProcesoCard from './PasoProcesoCard';
import { Clock, Circle, CheckCircle } from 'lucide-react';

const DuracionConnector = ({ duracion, esPasoCompletado }) => {
    if (!duracion) return null;
    return (
        <div className="relative flex justify-center my-3">
            {/* Badge de duración sin línea atravesándolo */}
            <div className="relative z-10 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-850 rounded-full border-2 border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-all duration-200 backdrop-blur-sm">
                <div className={`p-1.5 rounded-full ${esPasoCompletado
                        ? 'bg-emerald-100 dark:bg-emerald-900/30'
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                    <Clock size={14} className={
                        esPasoCompletado
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-gray-500 dark:text-gray-400'
                    } />
                </div>
                <span className={`text-xs font-bold ${esPasoCompletado
                        ? 'text-emerald-700 dark:text-emerald-300'
                        : 'text-gray-600 dark:text-gray-300'
                    }`}>
                    {duracion}
                </span>
            </div>
        </div>
    );
};

//       👇 1. RECIBIMOS 'justSaved' de nuevo
const Timeline = ({ pasos, justSaved, onUpdateEvidencia, onCompletarPaso, onIniciarReapertura, onDescartarCambios, onIniciarEdicionFecha, clienteId, isReadOnly }) => {
    return (
        <div className="relative">
            {pasos.map((paso, index) => (
                <React.Fragment key={paso.key}>
                    {index > 0 && (
                        <DuracionConnector
                            duracion={paso.duracionDesdePasoAnterior}
                            esPasoCompletado={pasos[index - 1]?.completado}
                        />
                    )}

                    <div className="relative">
                        {/* Card del paso - Sin indicador circular */}
                        <div
                            className={`fadeIn ${index === 0 ? 'pt-6' : ''} py-3`}
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <PasoProcesoCard
                                paso={{ ...paso, stepNumber: index + 1 }}
                                // 👇 2. PASAMOS 'justSaved' a la tarjeta
                                justSaved={justSaved && paso.esSiguientePaso}
                                onUpdateEvidencia={onUpdateEvidencia}
                                onCompletarPaso={onCompletarPaso}
                                onIniciarReapertura={onIniciarReapertura}
                                onDescartarCambios={onDescartarCambios}
                                onIniciarEdicionFecha={onIniciarEdicionFecha}
                                clienteId={clienteId}
                                isReadOnly={isReadOnly}
                            />
                        </div>
                    </div>
                </React.Fragment>
            ))}
        </div>
    );
};

export default Timeline;
