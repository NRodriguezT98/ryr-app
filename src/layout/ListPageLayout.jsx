// src/layout/ListPageLayout.jsx (NUEVO ARCHIVO)
import React from 'react';
import AnimatedPage from '../components/AnimatedPage';

const ListPageLayout = ({ icon, title, actionButton, filterControls, children }) => {
    return (
        <AnimatedPage>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* === ENCABEZADO ESTANDARIZADO === */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-4">
                        <div className="text-blue-600 dark:text-blue-400">
                            {React.cloneElement(icon, { size: 32, strokeWidth: 2.5 })}
                        </div>
                        <h1>
                            {title}
                        </h1>
                    </div>
                    {actionButton && <div className="w-full md:w-auto">{actionButton}</div>}
                </div>

                {/* === SECCIÓN DE FILTROS ESTANDARIZADA === */}
                {filterControls && (
                    <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        {filterControls}
                    </div>
                )}

                {/* === CONTENIDO PRINCIPAL DE LA PÁGINA === */}
                <main>
                    {children}
                </main>

            </div>
        </AnimatedPage>
    );
};

export default ListPageLayout;