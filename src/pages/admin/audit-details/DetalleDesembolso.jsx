// src/pages/admin/audit-details/DetalleDesembolso.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { User, Home, Building2, Banknote, Calendar, Landmark, Clock } from 'lucide-react';
import DetalleSujeto from './DetalleSujeto';
import DetalleDatosClave from './DetalleDatosClave';
// 👇 1. IMPORTAMOS NUESTRO NUEVO MAPA DE NOMBRES 👇
import { NOMBRE_FUENTE_PAGO } from '../../../utils/procesoConfig';
import { normalizeDate, formatDisplayDateWithTime } from '../../../utils/textFormatters';

const DetalleDesembolso = ({ log, action }) => {
    const details = log?.details;
    const esAbono = action === 'REGISTER_ABONO';
    const titulo = esAbono ? "Información del Abono" : "Información del Desembolso";

    if (!details) return <p className="text-sm text-gray-500">No hay detalles disponibles.</p>;

    const { cliente, vivienda, proyecto, abono } = details;

    // --- Lógica para preparar los datos ---

    // 👇 2. TRADUCIMOS LA FUENTE USANDO EL NUEVO MAPA 👇
    const nombreFuente = NOMBRE_FUENTE_PAGO[abono.fuente] || abono.fuente; // Usa el nombre del mapa, o la clave como respaldo.

    const fechaHoraAccion = formatDisplayDateWithTime(normalizeDate(log.timestamp));

    const datosDelAbono = {
        "N° de Consecutivo": abono.consecutivo || 'N/A', // Se muestra el consecutivo
        "Fuente": nombreFuente,
        "Monto Registrado": abono.monto,
        "Fecha del Pago": abono.fechaPago,
        "Fecha y Hora de Registro": fechaHoraAccion,
    };

    // --- Construimos la vista combinando los bloques ---
    return (
        <div className="space-y-4">
            <DetalleSujeto
                icon={<User size={16} />}
                titulo="Cliente Afectado"
                nombre={cliente.nombre}
                enlace={`/clientes/detalle/${cliente.id}`}
            />
            <DetalleSujeto
                icon={<Home size={16} />}
                titulo="Vivienda Relacionada"
                nombre={vivienda.display}
                enlace={`/viviendas/detalle/${vivienda.id}`}
            />
            <DetalleSujeto
                icon={<Building2 size={16} />}
                titulo="Proyecto"
                nombre={proyecto.nombre}
                enlace="#"
            />
            <DetalleDatosClave
                icon={<Banknote size={16} />}
                titulo={titulo}
                datos={datosDelAbono}
            />
        </div>
    );
};

export default DetalleDesembolso;