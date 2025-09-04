import React from 'react';
import { Link } from 'react-router-dom';
import { User, Home, Building2, Trash2 } from 'lucide-react';
import DetalleSujeto from './DetalleSujeto';
import DetalleDatosClave from './DetalleDatosClave';
import { NOMBRE_FUENTE_PAGO } from '../../../utils/procesoConfig';
import { normalizeDate, formatDisplayDateWithTime } from '../../../utils/textFormatters';

const AnularAbonoDetails = ({ log }) => {
    const details = log?.details;
    if (!details) return <p className="text-sm text-gray-500">No hay detalles disponibles.</p>;

    // Lógica para ser compatible con registros antiguos y nuevos
    const isNewStructure = !!details.abono;
    const cliente = isNewStructure ? details.cliente : { nombre: `Cliente ID: ${details.clienteId}`, id: details.clienteId };
    const vivienda = isNewStructure ? details.vivienda : null;
    const proyecto = isNewStructure ? details.proyecto : null;
    const abonoInfo = isNewStructure ? details.abono : details;

    const nombreFuente = NOMBRE_FUENTE_PAGO[abonoInfo.fuente] || abonoInfo.fuente;
    const fechaHoraAccion = formatDisplayDateWithTime(normalizeDate(log.timestamp));

    const datosDeLaAnulacion = {
        "Fuente": nombreFuente,
        "Monto Anulado": abonoInfo.monto,
        "Fecha del pago": abonoInfo.fechaPago || 'No registrada',
        // ✨ Punto Clave: Buscamos el motivo en el lugar correcto.
        // Si no existe (en un log antiguo), muestra el texto por defecto.
        "Motivo de Anulación": abonoInfo.motivo || 'No especificado',
        "Fecha y Hora de Anulación": fechaHoraAccion,
    };

    return (
        <div className="space-y-4">
            <DetalleSujeto
                icon={<User size={16} />}
                titulo="Cliente Afectado"
                nombre={cliente.nombre}
                enlace={cliente.id ? `/clientes/detalle/${cliente.id}` : undefined}
            />
            {vivienda && (
                <DetalleSujeto
                    icon={<Home size={16} />}
                    titulo="Vivienda Relacionada"
                    nombre={vivienda.display}
                    enlace={`/viviendas/detalle/${vivienda.id}`}
                />
            )}
            {proyecto && (
                <DetalleSujeto
                    icon={<Building2 size={16} />}
                    titulo="Proyecto"
                    nombre={proyecto.nombre}
                    enlace="#"
                />
            )}
            <DetalleDatosClave
                icon={<Trash2 size={16} />}
                titulo="Información de la Anulación"
                datos={datosDeLaAnulacion}
            />
        </div>
    );
};

export default AnularAbonoDetails;