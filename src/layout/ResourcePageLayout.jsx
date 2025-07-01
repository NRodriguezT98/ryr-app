import React from 'react';
import AnimatedPage from '../components/AnimatedPage';

const ResourcePageLayout = ({ title, icon, color, filterControls, children }) => {
    return (
        <AnimatedPage>
            <div className="bg-white p-6 rounded-2xl shadow-2xl relative">
                {/* Encabezado Dinámico */}
                <div className="text-center mb-10">
                    <h2
                        className="text-4xl font-extrabold uppercase font-poppins inline-flex items-center gap-4"
                        style={{ color: color }} // Usamos el color pasado como prop
                    >
                        {icon} {/* Renderizamos el ícono pasado como prop */}
                        <span>{title}</span>
                    </h2>
                    <div
                        className="w-24 h-1 mx-auto rounded-full mt-2"
                        style={{ backgroundColor: color }} // Y aquí también
                    ></div>
                </div>

                {/* Controles de Filtro y Búsqueda */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                    {filterControls}
                </div>

                {/* Contenido Principal (la cuadrícula de tarjetas) */}
                <div>
                    {children}
                </div>
            </div>
        </AnimatedPage>
    );
};

export default ResourcePageLayout;