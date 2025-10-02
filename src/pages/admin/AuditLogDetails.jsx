// src/pages/admin/AuditLogDetails.jsx (VERSIÓN FINAL UNIFICADA)
import React from 'react';
import { User, Home, Building2, Banknote, DollarSign, FileWarning, BadgeInfo, RefreshCw, Edit3 } from 'lucide-react';

// 1. Importamos nuestros bloques de construcción reutilizables
import DetalleSujeto from './audit-details/components/DetalleSujeto';
import DetalleDatosClave from './audit-details/components/DetalleDatosClave';
import DetalleCambios from './audit-details/DetalleCambios';
import ResumenDeCambios from './audit-details/components/ResumenDeCambios';
import ResumenCambiosProceso from './audit-details/components/ResumenCambiosProceso';
import { NOMBRE_FUENTE_PAGO } from '../../utils/procesoConfig';
import ContenedorAccion from './audit-details/components/ContenedorAccion';
import { formatDisplayDateWithTime, normalizeDate, formatDisplayDate, formatCurrency } from '../../utils/textFormatters';


const AuditLogDetails = ({ log }) => {
    const { details } = log;
    if (!details) return <p className="text-sm text-gray-500">No hay detalles disponibles.</p>;

    const { action, cliente, vivienda, proyecto, cambios, snapshotCliente, abono } = details;

    // 2. El "Arquitecto" decide qué bloques específicos mostrar
    let contenidoEspecifico;
    let modalSize = "md";

    switch (action) {
        case 'REGISTER_ABONO':
        case 'REGISTER_DISBURSEMENT':
        case 'REGISTER_CREDIT_DISBURSEMENT': {
            const nombreFuente = NOMBRE_FUENTE_PAGO[abono.fuente] || abono.fuente;
            const fechaHoraAccion = formatDisplayDateWithTime(normalizeDate(log.timestamp));
            const datosDelAbono = {
                "N° de Consecutivo": abono.consecutivo || 'N/A',
                "Fuente de Pago": nombreFuente,
                "Monto Registrado": abono.monto,
                "Fecha del Pago": abono.fechaPago,
                "Fecha y Hora de Registro de la Acción": fechaHoraAccion,
            };
            const titulo = action === 'REGISTER_ABONO' ? 'Información del Abono' : 'Información del Desembolso';
            contenidoEspecifico = <DetalleDatosClave icon={<Banknote size={16} />} titulo={titulo} datos={datosDelAbono} />;
            break;
        }

        case 'CREATE_CLIENT': {
            // 1. Preparamos los objetos de datos, igual que en tu componente viejo
            const datosPersonales = {
                "Nombre Completo": snapshotCliente.nombreCompleto,
                "Cédula": snapshotCliente.cedula,
                "Teléfono": snapshotCliente.telefono,
                "Correo": snapshotCliente.correo,
                "Dirección": snapshotCliente.direccion,
                "Fecha de Ingreso": formatDisplayDate(snapshotCliente.fechaIngreso),
            };
            const datosPropiedad = {
                "Vivienda Asignada": snapshotCliente.viviendaAsignada,
                "Cédula Adjuntada": snapshotCliente.cedulaAdjuntada,
                "Promesa Adjuntada": snapshotCliente.promesaAdjuntada,
                "Correo Adjuntado": snapshotCliente.correoAdjuntado,
            };
            const datosFinancieros = {
                ...snapshotCliente.fuentesDePago.reduce((acc, fuente) => {
                    acc[fuente.nombre] = formatCurrency(fuente.monto);
                    return acc;
                }, {}),
                "Valor Total Vivienda": formatCurrency(snapshotCliente.valorVivienda),
                "Valor Diferente en Escritura": snapshotCliente.usaValorEscrituraDiferente ? `Sí (${formatCurrency(snapshotCliente.valorEscritura)})` : 'No',
            };

            // 2. Usamos nuestros bloques reutilizables para construir la vista
            contenidoEspecifico = (
                <>
                    <DetalleDatosClave icon={<User size={16} />} titulo="Datos Personales" datos={datosPersonales} />
                    <DetalleDatosClave icon={<Home size={16} />} titulo="Propiedad y Documentos" datos={datosPropiedad} />
                    <DetalleDatosClave icon={<DollarSign size={16} />} titulo="Información Financiera" datos={datosFinancieros} />
                </>
            );
            break;
        }
        case 'UPDATE_PROCESO': {
            // Ahora envolvemos todo en nuestro contenedor estándar
            return (
                <ContenedorAccion
                    usuario={log.userName}
                    descripcion={log.message} // El mensaje principal de la acción
                >
                    {/* Y adentro ponemos los detalles específicos */}
                    <ResumenCambiosProceso cambios={cambios} />
                </ContenedorAccion>
            );
        }

        case 'EDIT_NOTE': {
            contenidoEspecifico = <ResumenDeCambios titulo="Cambios en la Nota" cambios={cambios} />;
            modalSize = "xl";
            break;
        }

        case 'UPDATE_CLIENT': {
            const cambios = details.cambios || [];
            const nombreCliente = details.clienteNombre || 'No disponible';
            const idCliente = details.clienteId;

            return (
                <div className="space-y-4">
                    <DetalleSujeto
                        icon={<User size={16} />}
                        titulo="Cliente Afectado"
                        nombre={nombreCliente}
                        enlace={idCliente ? `/clientes/detalle/${idCliente}` : undefined}
                    />
                    <DetalleCambios
                        icon={<Edit3 size={16} />}
                        titulo="Cambios Realizados"
                        cambios={cambios}
                    />
                </div>
            );
        }

        case 'UPDATE_VIVIENDA': {
            const titulo = action === 'UPDATE_CLIENT' ? "Cambios en Datos del Cliente" : "Cambios en Datos de la Vivienda";
            contenidoEspecifico = <ResumenDeCambios titulo={titulo} cambios={cambios} />;
            break;
        }

        case 'VOID_ABONO': {
            const abonoAnulado = details.abono || {}; // Aseguramos que abono exista
            const datosAnulacion = {
                "Numero Abono Anulado": abonoAnulado.consecutivo || 'No disponible',
                "Monto Anulado": abonoAnulado.monto || 'No disponible',
                "Fecha del Abono": abonoAnulado.fechaPago || 'No disponible',
                "Fuente de pago": NOMBRE_FUENTE_PAGO[abonoAnulado.fuente] || abonoAnulado.fuente || 'No disponible',
                "Motivo de Anulación": abonoAnulado.motivo || 'No especificado',
                "Fecha y Hora de Anulación": formatDisplayDateWithTime(normalizeDate(log.timestamp)),
            };
            return (
                <>
                    <div className="space-y-4">
                        <DetalleSujeto icon={<User size={16} />} titulo="Cliente Afectado" nombre={details.cliente?.nombre} enlace={`/clientes/detalle/${details.cliente?.id}`} />
                        {details.vivienda && <DetalleSujeto icon={<Home size={16} />} titulo="Vivienda Relacionada" nombre={details.vivienda?.display} enlace={`/viviendas/detalle/${details.vivienda?.id}`} />}
                        {details.proyecto && <DetalleSujeto icon={<Building2 size={16} />} titulo="Proyecto" nombre={details.proyecto?.nombre} />}
                        <DetalleDatosClave icon={<FileWarning size={16} />} titulo="Información de la Anulación" datos={datosAnulacion} />
                    </div>
                </>
            );
        }

        case 'REVERT_VOID_ABONO': {
            const abonoRevertido = details.abono || {};
            const datosReversion = {
                "Numero Abono Revertido": abonoRevertido.consecutivo || 'No disponible',
                "Monto Revertido": abonoRevertido.monto || 'No disponible',
                "Fecha del pago original": abonoRevertido.fechaPago || 'No disponible',
                "Fuente de pago": NOMBRE_FUENTE_PAGO[abonoRevertido.fuente] || abonoRevertido.fuente || 'No disponible',
                // --- INICIO DE LA MODIFICACIÓN ---
                "Motivo de Reversión": abonoRevertido.motivoReversion || 'No especificado', // <-- Línea añadida
                // --- FIN DE LA MODIFICACIÓN ---
                "Fecha y Hora de Reversión": formatDisplayDateWithTime(normalizeDate(log.timestamp)),
            };
            return (
                <div className="space-y-4">
                    <DetalleSujeto icon={<User size={16} />} titulo="Cliente Afectado" nombre={details.cliente?.nombre} enlace={`/clientes/detalle/${details.cliente?.id}`} />
                    {details.vivienda && <DetalleSujeto icon={<Home size={16} />} titulo="Vivienda Relacionada" nombre={details.vivienda?.display} enlace={`/viviendas/detalle/${details.vivienda?.id}`} />}
                    {details.proyecto && <DetalleSujeto icon={<Building2 size={16} />} titulo="Proyecto" nombre={details.proyecto?.nombre} />}
                    <DetalleDatosClave icon={<RefreshCw size={16} />} titulo="Información de la Reversión" datos={datosReversion} />
                </div>
            );
        }

        default:
            contenidoEspecifico = (
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        No hay una vista de detalle específica para esta acción.
                    </p>
                </div>
            );
            break;
    }

    return (
        <div className="space-y-4">
            {/* 3. Los sujetos afectados se renderizan siempre, usando el bloque universal */}
            {cliente && <DetalleSujeto icon={<User size={16} />} titulo="Cliente Afectado" nombre={cliente.nombre} enlace={`/clientes/detalle/${cliente.id}`} />}
            {vivienda && <DetalleSujeto icon={<Home size={16} />} titulo="Vivienda Relacionada" nombre={vivienda.display} enlace={`/viviendas/detalle/${vivienda.id}`} />}
            {proyecto && <DetalleSujeto icon={<Building2 size={16} />} titulo="Proyecto" nombre={proyecto.nombre} enlace="#" />}

            {contenidoEspecifico}
        </div>
    );
};

export default AuditLogDetails;