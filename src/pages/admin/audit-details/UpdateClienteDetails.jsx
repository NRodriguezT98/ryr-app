import React from 'react';
import DetalleCambios from './DetalleCambios'; // 1. Importamos nuestro nuevo bloque

const UpdateClienteDetails = ({ log }) => {
    // 2. Obtenemos los datos necesarios del log
    const cambios = log.details?.cambios || [];

    // 3. Simplemente usamos el bloque, pasándole los datos. ¡Y ya está!
    return (
        <div className="space-y-4">
            <DetalleCambios cambios={cambios} titulo="Cambios en Datos del Cliente" />
        </div>
    );
};

export default UpdateClienteDetails;