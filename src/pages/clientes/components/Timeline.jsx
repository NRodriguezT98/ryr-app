// src/pages/clientes/components/Timeline.jsx

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';
import PasoProcesoCard from './PasoProcesoCard';

// Subcomponente para un solo item de la línea de tiempo
const TimelineItem = ({ paso, isCompleted, isCurrent, isLast, ...handlers }) => {
    return (
        <div className="flex gap-4">
            {/* Decorador: El punto y la línea vertical */}
            <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300
                    ${isCompleted ? 'bg-green-500 border-green-500 text-white' : ''}
                    ${isCurrent ? 'border-blue-500 ring-4 ring-blue-200 dark:ring-blue-500/30' : ''}
                    ${!isCompleted && !isCurrent ? 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600' : ''}
                `}>
                    {isCompleted ? <Check size={18} /> : <span className={`text-sm font-bold ${isCurrent ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>{paso.stepNumber}</span>}
                </div>
                {!isLast && <div className="w-px flex-grow bg-gray-300 dark:bg-gray-600 my-2"></div>}
            </div>

            {/* Contenido del paso (tu tarjeta existente) */}
            <div className="flex-grow pb-8">
                <PasoProcesoCard paso={paso} {...handlers} />
            </div>
        </div>
    );
};

// Componente principal de la Línea de Tiempo
const Timeline = ({ pasos, ...handlers }) => {

    return (
        <div className="space-y-0">
            <AnimatePresence>
                {pasos.map((paso, index) => {
                    // 👇 INICIO DE LA CORRECCIÓN 👇
                    // Ahora usamos las propiedades que ya vienen calculadas desde el hook
                    const isCompleted = paso.data.completado;
                    const isCurrent = paso.esSiguientePaso;
                    // 👆 FIN DE LA CORRECCIÓN 👆

                    return (
                        <motion.div
                            key={paso.key}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, transition: { duration: 0.2 } }}
                        >
                            <TimelineItem
                                paso={paso}
                                isCompleted={isCompleted}
                                isCurrent={isCurrent}
                                isLast={index === pasos.length - 1}
                                {...handlers}
                            />
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
};

export default Timeline;