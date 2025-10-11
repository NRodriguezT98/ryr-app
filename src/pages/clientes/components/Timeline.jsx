// src/pages/clientes/components/Timeline.jsx

import React from 'react';
import PasoProcesoCard from './PasoProcesoCard';
import { Clock } from 'lucide-react';

const DuracionConnector = ({ duracion }) => {
    if (!duracion) return null;
    return (
        <div className="flex justify-center my-2">
            <div
                className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full border border-dashed dark:border-gray-600 fadeIn"
            >
                <Clock size={14} className="text-gray-500 dark:text-gray-400" />
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">{duracion}</span>
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
                    {index > 0 && <DuracionConnector duracion={paso.duracionDesdePasoAnterior} />}
                    <div
                        className="py-2 fadeIn"
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
                </React.Fragment>
            ))}
        </div>
    );
};

export default Timeline;
