// src/pages/admin/audit-details/components/DetalleAccion.jsx

import React from 'react';
import ResumenDeCambios from './ResumenDeCambios'; // Reutilizamos nuestro bloque de cambios
import DetalleDatosClave from './DetalleDatosClave'; // Reutilizamos nuestro bloque de datos
import { Banknote } from 'lucide-react';

const DetalleAccion = ({ log }) => {
    const { message, details } = log;

    // Extraemos los datos que podríamos querer mostrar de forma especial
    const { action, cambios, abono } = details;

    // Preparamos los datos clave de un abono para mostrarlos, si existen
    const datosDelAbono = abono ? {
        "Fuente": abono.fuente,
        "Monto": abono.monto,
        "Fecha del Pago": abono.fechaPago,
    } : null;

    return (
        <div className="p-4 border rounded-lg bg-white dark:bg-gray-700/50 dark:border-gray-700">
            {/* 1. Mensaje Principal: El resumen de la acción */}
            <p className="font-bold text-gray-800 dark:text-gray-200">{message}</p>

            <div className="mt-3 pl-4 border-l-2 border-gray-200 dark:border-gray-600 space-y-3">
                {/* 2. Mostramos el bloque de cambios si la acción es una actualización */}
                {cambios && cambios.length > 0 && (
                    <ResumenDeCambios titulo="Campos Modificados" cambios={cambios} />
                )}

                {/* 3. Mostramos los datos de un abono si la acción es un registro */}
                {datosDelAbono && (
                    <DetalleDatosClave icon={<Banknote size={16} />} titulo="Detalles del Registro" datos={datosDelAbono} />
                )}

                {/* Puedes añadir más condiciones aquí para otros tipos de detalles */}
            </div>
        </div>
    );
};

export default DetalleAccion;