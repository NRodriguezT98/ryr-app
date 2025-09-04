import React from 'react';

const DetalleDatosClave = ({ icon, titulo, datos }) => {
    // La función 'datos' es un objeto: { "Etiqueta": "Valor", "Otra Etiqueta": "Otro Valor" }
    const entradas = Object.entries(datos);

    const DetailRow = ({ label, value }) => (
        <div className="py-1.5 flex">
            <div className="w-2/5 font-semibold text-gray-500 dark:text-gray-400">{label}:</div>
            <div className="w-3/5 text-gray-800 dark:text-gray-200 font-medium">{value}</div>
        </div>
    );

    return (
        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <h4 className="font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-2 mb-2">
                {icon} {titulo}
            </h4>
            <div className="divide-y dark:divide-gray-600">
                {entradas.map(([label, value]) => (
                    <DetailRow key={label} label={label} value={value} />
                ))}
            </div>
        </div>
    );
};

export default DetalleDatosClave;