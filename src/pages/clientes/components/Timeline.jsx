// src/pages/clientes/components/Timeline.jsx

import React from 'react';
import { motion } from 'framer-motion';
import PasoProcesoCard from './PasoProcesoCard';
import { Clock } from 'lucide-react';

const DuracionConnector = ({ duracion }) => {
    if (!duracion) return null;
    return (
        <div className="flex justify-center my-2">
            <motion.div
                className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full border border-dashed dark:border-gray-600"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <Clock size={14} className="text-gray-500 dark:text-gray-400" />
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">{duracion}</span>
            </motion.div>
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
                    <motion.div
                        className="py-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
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
                    </motion.div>
                </React.Fragment>
            ))}
        </div>
    );
};

export default Timeline;