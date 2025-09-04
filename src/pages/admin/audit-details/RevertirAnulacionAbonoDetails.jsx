// src/pages/admin/audit-details/RevertirAnulacionAbonoDetails.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { User, Home, Building2, Undo2 } from 'lucide-react';
import DetalleSujeto from './DetalleSujeto';
import DetalleDatosClave from './DetalleDatosClave';
import { NOMBRE_FUENTE_PAGO } from '../../../utils/procesoConfig';
import { normalizeDate, formatDisplayDateWithTime } from '../../../utils/textFormatters';

const RevertirAnulacionAbonoDetails = ({ log }) => {
    const details = log?.details;
    if (!details) {
        return <p className="text-sm text-gray-500">No hay detalles disponibles.</p>;
    }

    // --- 1. Detección de estructura y extracción segura de datos ---
    const isNewStructure = !!details.abono;

    const cliente = isNewStructure ? details.cliente : {
        // Para logs antiguos, intentamos usar clienteInfo, si no, el ID.
        nombre: details.clienteInfo || `Cliente ID: ${details.clienteId}` || 'No disponible',
        id: details.clienteId
    };

    // Para logs antiguos, estos datos no existen, por eso se mostrará un valor por defecto.
    const vivienda = isNewStructure ? details.vivienda : null;
    const proyecto = isNewStructure ? details.proyecto : null;
    const abonoInfo = isNewStructure ? details.abono : details;

    // --- 2. Preparación de datos y corrección de etiquetas ---
    const nombreFuente = NOMBRE_FUENTE_PAGO[abonoInfo.fuente] || abonoInfo.fuente;
    const fechaHoraAccion = formatDisplayDateWithTime(normalizeDate(log.timestamp));

    const datosDeLaReversion = {
        // Etiquetas corregidas para coincidir con el estándar
        "Fuente": nombreFuente,
        "Monto Reactivado": abonoInfo.monto,
        // Para logs antiguos, la fecha no se guardaba, por eso se muestra "No registrada".
        // Los nuevos logs creados con el 'storage.js' actualizado sí la mostrarán.
        "Fecha del Abono": abonoInfo.fechaPago || 'No registrada',
        "Fecha y Hora de la Reversión": fechaHoraAccion,
    };

    // --- 3. Construcción de la vista estándar ---
    return (
        <div className="space-y-4">
            {cliente && (
                <DetalleSujeto
                    icon={<User size={16} />}
                    titulo="Cliente Afectado"
                    nombre={cliente.nombre}
                    enlace={cliente.id ? `/clientes/detalle/${cliente.id}` : undefined}
                />
            )}

            {/* Se mostrará la vivienda si existe en el log (solo para los nuevos) */}
            {vivienda && vivienda.id && (
                <DetalleSujeto
                    icon={<Home size={16} />}
                    titulo="Vivienda Relacionada"
                    nombre={vivienda.display}
                    enlace={`/viviendas/detalle/${vivienda.id}`}
                />
            )}

            {/* Se mostrará el proyecto si existe en el log (solo para los nuevos) */}
            {proyecto && proyecto.id && (
                <DetalleSujeto
                    icon={<Building2 size={16} />}
                    titulo="Proyecto"
                    nombre={proyecto.nombre}
                    enlace="#" // Los proyectos no tienen página de detalle
                />
            )}

            <DetalleDatosClave
                icon={<Undo2 size={16} />}
                titulo="Información de la Reversión"
                datos={datosDeLaReversion}
            />
        </div>
    );
};

export default RevertirAnulacionAbonoDetails;