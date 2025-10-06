// src/pages/admin/AuditLogDetails.jsx (VERSIÓN FINAL UNIFICADA)
import React from 'react';
import { User, Home, Building2, Banknote, DollarSign, FileWarning, BadgeInfo, RefreshCw, Edit3, Ruler, Trash2, Archive, Info } from 'lucide-react';

// 1. Importamos nuestros bloques de construcción reutilizables
import DetalleSujeto from './audit-details/components/DetalleSujeto';
import DetalleDatosClave from './audit-details/components/DetalleDatosClave';
import DetalleCambios from './audit-details/DetalleCambios';
import ResumenDeCambios from './audit-details/components/ResumenDeCambios';
import ResumenCambiosProceso from './audit-details/components/ResumenCambiosProceso';
import AuditLogModalLayout from './audit-details/components/AuditLogModalLayout';
import { NOMBRE_FUENTE_PAGO } from '../../utils/procesoConfig';
import { formatDisplayDateWithTime, normalizeDate, formatDisplayDate, formatCurrency } from '../../utils/textFormatters';
import UpdateViviendaDetails from './audit-details/components/UpdateViviendaDetails';


const AuditLogDetails = ({ log }) => {
    const { details } = log;
    if (!details) return <p className="text-sm text-gray-500">No hay detalles disponibles.</p>;

    const { action, cliente, vivienda, proyecto, cambios, snapshotCliente, abono } = details;

    // 2. El "Arquitecto" decide qué bloques específicos mostrar
    let contenidoEspecifico;
    let modalSize = "md";

    switch (action) {
        case 'CREATE_VIVIENDA': {
            // Grupo 1: Datos Principales de la Vivienda
            const datosPrincipales = {
                "Ubicación": `Mz. ${details.manzana} - Casa ${details.numeroCasa}`,
                "Matrícula Inm.": details.matricula,
                "Nomenclatura": details.nomenclatura,
            };

            // Grupo 2: Características Físicas y Linderos
            const datosFisicos = {
                "Área Construida": `${details.areaConstruida} m²`,
                "Área del Lote": `${details.areaLote} m²`,
                "Tipo de Vivienda": details.tipoVivienda,
                "Lindero Norte": details.linderoNorte,
                "Lindero Sur": details.linderoSur,
                "Lindero Oriente": details.linderoOriente,
                "Lindero Occidente": details.linderoOccidente,
            };

            // Grupo 3: Información Financiera y Documentos
            const datosFinancieros = {
                "Valor Vivienda Base": formatCurrency(details.valorBase),
                "Es Esquinera": details.esEsquinera,
                "Recargo por Esquinera": formatCurrency(details.recargoEsquinera),
                "Valor Total": formatCurrency(details.valorTotal),
                "Certificado de Tradición Anexado": details.certificadoTradicionAnexado,
            };

            contenidoEspecifico = (
                <>
                    <DetalleDatosClave
                        icon={<Home size={16} />}
                        titulo="Datos Principales"
                        datos={datosPrincipales}
                    />
                    <DetalleDatosClave
                        icon={<Ruler size={16} />} // Ícono para medidas y linderos
                        titulo="Características Físicas"
                        datos={datosFisicos}
                    />
                    <DetalleDatosClave
                        icon={<DollarSign size={16} />}
                        titulo="Información Financiera"
                        datos={datosFinancieros}
                    />
                </>
            );
            break;
        }

        case 'DELETE_VIVIENDA': {
            // Extraemos el snapshot para facilitar la lectura
            const snapshot = details.snapshotVivienda;

            // Grupo de datos de la "Ficha Técnica"
            const datosFichaTecnica = {
                "Matrícula": snapshot.matricula,
                "Nomenclatura": snapshot.nomenclatura,
                "Área del Lote": snapshot.areaLote,
                "Área Construida": snapshot.areaConstruida,
                "Lindero Norte": snapshot.linderoNorte,
                "Lindero Sur": snapshot.linderoSur,
                "Lindero Oriente": snapshot.linderoOriente,
                "Lindero Occidente": snapshot.linderoOccidente,
            };

            contenidoEspecifico = (
                <>
                    {/* Primero mostramos las entidades principales afectadas */}
                    <DetalleSujeto
                        icon={<Building2 size={16} />}
                        titulo="Proyecto Afectado"
                        nombre={details.proyectoNombre}
                    />
                    <DetalleSujeto
                        icon={<Trash2 size={16} className="text-red-500" />} // Ícono de eliminación
                        titulo="Vivienda Eliminada"
                        nombre={details.viviendaNombre}
                    />

                    {/* Luego, mostramos la ficha técnica que se guardó como snapshot */}
                    <DetalleDatosClave
                        icon={<Ruler size={16} />}
                        titulo="Ficha Técnica (al momento de la eliminación)"
                        datos={datosFichaTecnica}
                    />
                </>
            );
            break;
        }

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
            return (
                <div className="space-y-3">
                    {/* Directamente los sujetos afectados */}
                    {details.cliente && <DetalleSujeto icon={<User size={16} />} titulo="Cliente Afectado" nombre={details.cliente?.nombre} enlace={`/clientes/detalle/${details.cliente?.id}`} />}
                    {details.vivienda && <DetalleSujeto icon={<Home size={16} />} titulo="Vivienda Relacionada" nombre={details.vivienda?.display} enlace={`/viviendas/detalle/${details.vivienda?.id}`} />}
                    {details.proyecto && <DetalleSujeto icon={<Building2 size={16} />} titulo="Proyecto" nombre={details.proyecto?.nombre} />}

                    {/* Y la lista de cambios en el proceso */}
                    <ResumenCambiosProceso cambios={cambios} />
                </div>
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
            // Usamos un return directo para tener control total sobre esta vista
            return (
                <div className="space-y-4">

                    {/* 1. Muestra el Cliente Afectado (solo si existe en el log) */}
                    {details.cliente && (
                        <DetalleSujeto
                            icon={<User size={16} />}
                            titulo="Cliente Afectado"
                            nombre={details.cliente.nombre}
                            enlace={`/clientes/detalle/${details.cliente.id}`}
                        />
                    )}

                    {/* 2. Muestra la Vivienda Modificada (el sujeto principal de la acción) */}
                    <DetalleSujeto
                        icon={<Home size={16} />}
                        titulo="Vivienda Modificada"
                        nombre={details.viviendaNombre}
                        enlace={`/viviendas/detalle/${details.viviendaId}`}
                    />

                    {/* 3. Muestra el Proyecto */}
                    <DetalleSujeto
                        icon={<Building2 size={16} />}
                        titulo="Proyecto"
                        nombre={details.proyecto?.nombre}
                    />

                    {/* 4. Muestra el componente con la lista de cambios, que ya funcionaba bien */}
                    <UpdateViviendaDetails details={details} />

                </div>
            );
        }

        case 'RESTORE_VIVIENDA': {
            const snapshot = details.snapshotVivienda || {};

            // Grupo 1: Datos Principales
            const datosPrincipales = {
                "Ubicación": `Mz. ${snapshot.manzana} - Casa ${snapshot.numeroCasa}`,
                "Matrícula Inm.": snapshot.matricula,
                "Nomenclatura": snapshot.nomenclatura,
            };

            // Grupo 2: Características Físicas
            const datosFisicos = {
                "Área Construida": `${snapshot.areaConstruida} m²`,
                "Área del Lote": `${snapshot.areaLote} m²`,
                "Tipo de Vivienda": snapshot.tipoVivienda,
                "Lindero Norte": snapshot.linderoNorte,
                "Lindero Sur": snapshot.linderoSur,
                "Lindero Oriente": snapshot.linderoOriente,
                "Lindero Occidente": snapshot.linderoOccidente,
            };

            // Grupo 3: Información Financiera
            const datosFinancieros = {
                "Valor Vivienda Base": formatCurrency(snapshot.valorBase),
                "Es Esquinera": snapshot.esEsquinera,
                "Recargo por Esquinera": formatCurrency(snapshot.recargoEsquinera),
                "Valor Total": formatCurrency(snapshot.valorTotal),
                "Certificado de Tradición Anexado": snapshot.certificadoTradicionAnexado,
            };

            return (
                <div className="space-y-4">
                    <DetalleSujeto
                        icon={<Building2 size={16} />}
                        titulo="Proyecto"
                        nombre={details.proyecto?.nombre}
                    />
                    <DetalleSujeto
                        icon={<RefreshCw size={16} className="text-blue-500" />}
                        titulo="Vivienda Restaurada"
                        nombre={details.viviendaNombre}
                        enlace={`/viviendas/detalle/${details.viviendaId}`}
                    />
                    <DetalleDatosClave
                        icon={<Home size={16} />}
                        titulo="Datos Principales"
                        datos={datosPrincipales}
                    />
                    <DetalleDatosClave
                        icon={<Ruler size={16} />}
                        titulo="Características Físicas"
                        datos={datosFisicos}
                    />
                    <DetalleDatosClave
                        icon={<DollarSign size={16} />}
                        titulo="Información Financiera"
                        datos={datosFinancieros}
                    />
                </div>
            );
        }

        case 'ARCHIVE_VIVIENDA': {
            const snapshot = details.snapshotVivienda || {};

            // Creamos el objeto con TODOS los datos del snapshot
            const datosArchivados = {
                "Matrícula": snapshot.matricula,
                "Nomenclatura": snapshot.nomenclatura,
                "Área del Lote": snapshot.areaLote,
                "Área Construida": snapshot.areaConstruida,
                "Valor Total Vivienda": formatCurrency(snapshot.valorTotal),
                "Es Esquinera": snapshot.esEsquinera,
                "Lindero Norte": snapshot.linderoNorte,
                "Lindero Sur": snapshot.linderoSur,
                "Lindero Oriente": snapshot.linderoOriente,
                "Lindero Occidente": snapshot.linderoOccidente,
            };

            // Usamos un return directo para tener control total
            return (
                <div className="space-y-4">
                    <DetalleSujeto
                        icon={<Building2 size={16} />}
                        titulo="Proyecto"
                        nombre={details.proyecto?.nombre}
                    />
                    <DetalleSujeto
                        icon={<Archive size={16} className="text-orange-500" />}
                        titulo="Vivienda Archivada"
                        nombre={details.viviendaNombre}
                        enlace={`/viviendas/detalle/${details.viviendaId}`}
                    />
                    <DetalleDatosClave
                        icon={<Info size={16} />}
                        titulo="Información de la Vivienda (al archivar)"
                        datos={datosArchivados}
                    />
                </div>
            );
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
                "Monto Revertido": formatCurrency(abonoRevertido.monto), // <-- Añadido formato de moneda
                "Fecha del pago original": formatDisplayDate(abonoRevertido.fechaPago), // <-- Añadido formato de fecha
                "Fuente de pago": NOMBRE_FUENTE_PAGO[abonoRevertido.fuente] || abonoRevertido.fuente || 'No disponible',
                "Motivo de Reversión": abonoRevertido.motivoReversion || 'No especificado',
                "Fecha y Hora de Reversión": formatDisplayDateWithTime(normalizeDate(log.timestamp)),
            };

            // Asignamos el contenido específico, sin los detalles del sujeto
            contenidoEspecifico = <DetalleDatosClave icon={<RefreshCw size={16} />} titulo="Información de la Reversión" datos={datosReversion} />;
            break; // <-- Se añade el break
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