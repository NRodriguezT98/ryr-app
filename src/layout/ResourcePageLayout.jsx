// src/layout/ResourcePageLayout.jsx

import React from 'react';
import AnimatedPage from '../components/AnimatedPage';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

// --- INICIO DE LA MODIFICACIÓN ---
// 1. Añadimos 'actionButton' y 'backLink' a las props que el componente acepta.
const ResourcePageLayout = ({ title, icon, color, filterControls, actionButton, backLink, children }) => {
    // --- FIN DE LA MODIFICACIÓN ---
    return (
        <AnimatedPage>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 relative">

                {/* 2. Reestructuramos la cabecera para incluir el botón de acción. */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
                    <div className="flex-grow">
                        {backLink && (
                            <Link to={backLink} className="text-sm text-gray-500 hover:text-blue-600 inline-flex items-center gap-2 mb-4">
                                <ArrowLeft size={14} /> Volver al listado
                            </Link>
                        )}
                        <div className="flex items-center gap-4">
                            <div style={{ color: color }}>{icon}</div>
                            <div>
                                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{title}</h2>
                            </div>
                        </div>
                    </div>
                    <div className="flex-shrink-0 mt-2 md:mt-0">
                        {actionButton} {/* 3. Aquí se renderiza el botón. */}
                    </div>
                </div>

                {filterControls && (
                    <div className="mb-8">
                        {filterControls}
                    </div>
                )}

                <div>
                    {children}
                </div>
            </div>
        </AnimatedPage>
    );
};

export default ResourcePageLayout;