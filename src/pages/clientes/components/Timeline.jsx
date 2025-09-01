// src/pages/clientes/components/Timeline.jsx

import React from 'react';
import { motion } from 'framer-motion';
import PasoProcesoCard from './PasoProcesoCard';
import { Clock } from 'lucide-react'; // 👈 Asegúrate de que esta importación esté presente

// ==================================================================
// 👇 1. NUEVO COMPONENTE AUXILIAR PARA LA DURACIÓN 👇
// ==================================================================
const DuracionConnector = ({ duracion }) => {
    // Si no hay duración calculada, no renderizamos nada.
    if (!duracion) return null;

    return (
        // Contenedor que centra la "píldora" de duración
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
// ==================================================================


// ==================================================================
// 👇 2. TU COMPONENTE TIMELINE ACTUALIZADO 👇
// ==================================================================
const Timeline = ({ pasos, justSaved, onUpdateEvidencia, onCompletarPaso, onIniciarReapertura, onDescartarCambios, onIniciarEdicionFecha, clienteId, isReadOnly }) => {
    return (
        <div className="relative">
            {/* Opcional: una línea vertical para dar la sensación de línea de tiempo */}
            <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

            {pasos.map((paso, index) => (
                <div key={paso.key} className="relative pl-14 py-2">

                    {/* --- INICIO DE LA MODIFICACIÓN --- */}
                    {/* Renderizamos el conector de duración para todos los pasos excepto el primero */}
                    {index > 0 && (
                        <div className="absolute -top-1 left-0 w-14 flex justify-center">
                            {/* Este div ayuda a alinear el conector con la línea vertical */}
                        </div>
                    )}
                    <DuracionConnector duracion={paso.duracionDesdePasoAnterior} />
                    {/* --- FIN DE LA MODIFICACIÓN --- */}

                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                    >
                        <PasoProcesoCard
                            paso={{
                                ...paso,
                                stepNumber: index + 1
                            }}
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
                </div>
            ))}
        </div>
    );
};

export default Timeline;