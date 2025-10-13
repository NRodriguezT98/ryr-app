/**
 * Módulo CRUD básico para clientes
 * 🔥 REFACTORIZACIÓN: Extraído de clienteService.js
 * Funciones: Crear, Actualizar, Eliminar, Archivar, Restaurar
 */

import { db, auth } from '../../firebase/config';
import {
    doc,
    updateDoc,
    deleteDoc,
    getDoc,
    writeBatch,
    setDoc,
    query,
    where,
    getDocs,
    collection
} from "firebase/firestore";
import { toTitleCase } from '../../utils/textFormatters';
import { PROCESO_CONFIG } from '../../utils/procesoConfig';
import { createAuditLog, createAuditLogWithBuilder } from '../auditService';
import { createClientAuditLog } from '../unifiedAuditService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Crea un nuevo cliente y lo asigna a una vivienda
 * También genera los logs de auditoría correspondientes
 */
export const addClienteAndAssignVivienda = async (clienteData, auditMessage, auditDetails) => {
    const newClienteRef = doc(db, "clientes", clienteData.datosCliente.cedula);
    const clienteParaGuardar = {
        ...clienteData,
        id: newClienteRef.id,
        status: 'activo',
        fechaCreacion: clienteData.datosCliente.fechaIngreso,
        fechaInicioProceso: clienteData.datosCliente.fechaIngreso
    };

    // Preparar datos del cliente para auditoría
    const clienteNombreCompleto = toTitleCase(
        `${clienteData.datosCliente.nombres} ${clienteData.datosCliente.apellidos}`
    );

    // Obtener datos de vivienda y proyecto
    let viviendaData = {};
    let proyectoData = {};

    if (clienteData.viviendaId) {
        const viviendaRef = doc(db, "viviendas", String(clienteData.viviendaId));
        const viviendaSnap = await getDoc(viviendaRef);

        if (!viviendaSnap.exists()) {
            throw new Error("La vivienda seleccionada no existe.");
        }

        viviendaData = viviendaSnap.data();

        // ✅ VALIDACIÓN CRÍTICA: Verificar que la vivienda no esté ocupada
        if (viviendaData.clienteId) {
            throw new Error(`Esta vivienda ya está ocupada por el cliente ${viviendaData.clienteNombre || viviendaData.clienteId}. Por favor, seleccione otra vivienda o actualice la lista.`);
        }

        if (viviendaData.proyectoId) {
            const proyectoRef = doc(db, "proyectos", String(viviendaData.proyectoId));
            const proyectoSnap = await getDoc(proyectoRef);

            if (proyectoSnap.exists()) {
                proyectoData = proyectoSnap.data();
            }
        }

        // Ejecutar batch para crear cliente y actualizar vivienda
        const batch = writeBatch(db);
        batch.set(newClienteRef, clienteParaGuardar);
        batch.update(viviendaRef, {
            clienteId: newClienteRef.id,
            clienteNombre: clienteNombreCompleto
        });
        await batch.commit();
    } else {
        await setDoc(newClienteRef, clienteParaGuardar);
    }

    // 🔥 NUEVO: Generar logs de auditoría unificados
    // 1. Log de creación del cliente
    const fechaIngresoFormateada = format(new Date(clienteData.datosCliente.fechaIngreso), "d 'de' MMMM, yyyy", { locale: es });

    // Formatear información financiera con desglose de fuentes
    const financiero = clienteData.financiero || {};

    // El valor de la vivienda viene del documento de vivienda (usar valorTotal que incluye gastos notariales)
    const valorVivienda = parseFloat(viviendaData?.valorTotal || viviendaData?.valorBase || 0);

    // Construir lista de fuentes de pago (SIN EMOJIS - se agregan como iconos en el frontend)
    const fuentesPago = [];
    let totalFuentes = 0;

    // 1. CUOTA INICIAL
    if (financiero.aplicaCuotaInicial && financiero.cuotaInicial?.monto) {
        const valorCuota = parseFloat(financiero.cuotaInicial.monto);
        if (valorCuota > 0) {
            fuentesPago.push(`Cuota Inicial: $${new Intl.NumberFormat('es-CO').format(valorCuota)}`);
            totalFuentes += valorCuota;
        }
    }

    // 2. CRÉDITO HIPOTECARIO
    if (financiero.aplicaCredito && financiero.credito?.monto) {
        const valorCredito = parseFloat(financiero.credito.monto);
        const banco = financiero.credito.banco || 'Banco no especificado';
        if (valorCredito > 0) {
            fuentesPago.push(`Crédito Hipotecario (${banco}): $${new Intl.NumberFormat('es-CO').format(valorCredito)}`);
            totalFuentes += valorCredito;
        }
    }

    // 3. SUBSIDIO MI CASA YA
    if (financiero.aplicaSubsidioVivienda && financiero.subsidioVivienda?.monto) {
        const valorMCY = parseFloat(financiero.subsidioVivienda.monto);
        if (valorMCY > 0) {
            fuentesPago.push(`Subsidio de Vivienda MCY: $${new Intl.NumberFormat('es-CO').format(valorMCY)}`);
            totalFuentes += valorMCY;
        }
    }

    // 4. SUBSIDIO CAJA DE COMPENSACIÓN
    if (financiero.aplicaSubsidioCaja && financiero.subsidioCaja?.monto) {
        const valorCaja = parseFloat(financiero.subsidioCaja.monto);
        const caja = financiero.subsidioCaja.caja || 'Caja no especificada';
        if (valorCaja > 0) {
            fuentesPago.push(`Subsidio Caja de Compensación (${caja}): $${new Intl.NumberFormat('es-CO').format(valorCaja)}`);
            totalFuentes += valorCaja;
        }
    }

    const fuentesPagoTexto = fuentesPago.length > 0
        ? fuentesPago.map(f => `   ${f}`).join('\n')
        : '   No especificado';

    const totalFuentesTexto = fuentesPago.length > 0
        ? `\n   ────────────────────────────────────────\n   📊 Total Fuentes: $${new Intl.NumberFormat('es-CO').format(totalFuentes)}`
        : '';

    // Solo mostrar sección financiera si hay datos significativos
    const seccionFinanciera = (valorVivienda > 0 || fuentesPago.length > 0)
        ? `\n💰 INFORMACIÓN FINANCIERA
   🏡 Valor de la Vivienda: $${new Intl.NumberFormat('es-CO').format(valorVivienda)}
   
   Fuentes de Financiamiento:
${fuentesPagoTexto}${totalFuentesTexto}\n`
        : '';

    const mensajeCreacion = `╔════════════════════════════════════════════════════════════════╗
║  ✨  NUEVO CLIENTE REGISTRADO                                 ║
╚════════════════════════════════════════════════════════════════╝

👤 DATOS DEL CLIENTE
   Nombre: ${clienteNombreCompleto}
   Identificación: ${clienteData.datosCliente.cedula}
   Teléfono: ${clienteData.datosCliente.telefono || 'No registrado'}
   Email: ${clienteData.datosCliente.email || 'No registrado'}

🏠 VIVIENDA ASIGNADA
   Proyecto: ${proyectoData.nombre || 'No asignado'}
   Manzana: ${viviendaData.manzana || 'N/A'}
   Casa: ${viviendaData.numeroCasa || 'N/A'}

📅 FECHA DE INGRESO
   ${fechaIngresoFormateada}
${seccionFinanciera}
╔════════════════════════════════════════════════════════════════╗
║  ✅ Cliente creado exitosamente en el sistema                 ║
╚════════════════════════════════════════════════════════════════╝`;

    // Guardar log de creación con timestamp específico
    const timestampCreacion = new Date();

    await createClientAuditLog(
        'CREATE_CLIENT',
        {
            id: newClienteRef.id,
            nombre: clienteNombreCompleto,
            nombres: clienteData.datosCliente.nombres,
            apellidos: clienteData.datosCliente.apellidos
        },
        {
            viviendaId: clienteData.viviendaId,
            proyectoId: proyectoData.id,
            vivienda: {
                id: viviendaData.id,
                manzana: viviendaData.manzana,
                numeroCasa: viviendaData.numeroCasa,
                proyecto: proyectoData.nombre
            },
            proyecto: {
                id: proyectoData.id,
                nombre: proyectoData.nombre
            },
            actionData: {
                cedula: clienteData.datosCliente.cedula,
                telefono: clienteData.datosCliente.telefono,
                email: clienteData.datosCliente.email,
                fechaIngreso: clienteData.datosCliente.fechaIngreso,
                financiero: clienteData.financiero
            }
        },
        {
            message: mensajeCreacion,
            timestamp: timestampCreacion
        }
    );

    // 2. Log de completado del primer paso (si tiene evidencias)
    const primerPaso = clienteData.proceso?.promesaEnviada;
    if (primerPaso && primerPaso.completado && primerPaso.evidencias) {
        const pasoConfig = PROCESO_CONFIG.find(p => p.key === 'promesaEnviada');

        // Calcular número del paso y total de pasos
        const pasosAplicables = PROCESO_CONFIG.filter(p =>
            typeof p.aplicaA === 'function' ? p.aplicaA(clienteData.financiero) : true
        );
        const numeroPaso = pasosAplicables.findIndex(p => p.key === 'promesaEnviada') + 1;
        const totalPasos = pasosAplicables.length;

        const evidenciasArray = Object.entries(primerPaso.evidencias)
            .filter(([_, ev]) => ev && ev.url) // Solo evidencias con archivo válido
            .map(([id, ev]) => {
                // CORRECCIÓN: Buscar el label de la evidencia en la configuración del paso
                const evidenciaConfig = pasoConfig?.evidenciasRequeridas?.find(e => e.id === id);
                const displayName = evidenciaConfig?.label || ev.displayName || ev.nombre || ev.name || `Evidencia ${id}`;

                return {
                    id,
                    nombre: displayName,
                    displayName: displayName,
                    tipo: ev.tipo || ev.type || 'archivo',
                    url: ev.url
                };
            });

        if (evidenciasArray.length > 0) {
            const evidenciasLista = evidenciasArray
                .map((ev, idx) => `   ${idx + 1}. ${ev.displayName}`)
                .join('\n');

            const mensajePrimerPaso = `╔════════════════════════════════════════════════════════════════╗
║  🎉  PASO COMPLETADO AUTOMÁTICAMENTE (${numeroPaso}/${totalPasos})${' '.repeat(Math.max(0, 20 - numeroPaso.toString().length - totalPasos.toString().length))}║
╚════════════════════════════════════════════════════════════════╝

📋 PASO DEL PROCESO
   "${pasoConfig?.label || 'Promesa Enviada'}"
   
ℹ️  CONTEXTO
   Este paso se completó automáticamente al crear el cliente

📅 FECHA DE COMPLETADO
   ${fechaIngresoFormateada}

📄 EVIDENCIAS ADJUNTAS
   Se adjuntó${evidenciasArray.length === 1 ? '' : 'aron'} ${evidenciasArray.length} evidencia${evidenciasArray.length === 1 ? '' : 's'}:
${evidenciasLista}

╔════════════════════════════════════════════════════════════════╗
║  ✅ Este paso ha sido marcado como completado exitosamente   ║
╚════════════════════════════════════════════════════════════════╝`;

            // Timestamp 1 segundo después del log de creación
            const timestampPasoCompletado = new Date(timestampCreacion.getTime() + 1000);

            await createClientAuditLog(
                'COMPLETE_PROCESS_STEP',
                {
                    id: newClienteRef.id,
                    nombre: clienteNombreCompleto,
                    nombres: clienteData.datosCliente.nombres,
                    apellidos: clienteData.datosCliente.apellidos
                },
                {
                    viviendaId: clienteData.viviendaId,
                    proyectoId: proyectoData.id,
                    vivienda: {
                        id: viviendaData.id,
                        manzana: viviendaData.manzana,
                        numeroCasa: viviendaData.numeroCasa,
                        proyecto: proyectoData.nombre
                    },
                    proyecto: {
                        id: proyectoData.id,
                        nombre: proyectoData.nombre
                    },
                    actionData: {
                        pasoId: 'promesaEnviada',
                        pasoNombre: pasoConfig?.label?.split('.')[1]?.trim() || 'Promesa Enviada',
                        procesoId: pasoConfig?.proceso || 'general',
                        procesoNombre: 'Proceso de Cliente',
                        fechaComplecion: primerPaso.fecha,
                        evidenciasAntes: [],
                        evidenciasDespues: evidenciasArray,
                        esReComplecion: false,
                        esPrimeraComplecion: true
                    }
                },
                {
                    message: mensajePrimerPaso,
                    timestamp: timestampPasoCompletado
                }
            );
        }
    }

    // Mantener sistema legacy si se proporciona
    if (auditMessage && auditDetails) {
        await createAuditLog(auditMessage, auditDetails);
    }
};

/**
 * Actualiza los datos de un cliente existente
 */
export const updateCliente = async (clienteId, clienteActualizado, viviendaOriginalId, auditDetails = {}) => {
    const clienteRef = doc(db, "clientes", String(clienteId));

    const clienteOriginalSnap = await getDoc(clienteRef);
    if (!clienteOriginalSnap.exists()) {
        throw new Error("El cliente que intentas actualizar no existe.");
    }
    const clienteOriginal = clienteOriginalSnap.data();

    const viviendaIdOriginal = clienteOriginal.viviendaId;
    const viviendaIdNueva = clienteActualizado.viviendaId;

    // Validar cambio de vivienda
    if (viviendaIdOriginal !== viviendaIdNueva) {
        const abonosQuery = query(
            collection(db, "abonos"),
            where("clienteId", "==", clienteId),
            where("estadoProceso", "==", "activo")
        );
        const abonosSnap = await getDocs(abonosQuery);

        if (abonosSnap.size > 0) {
            throw new Error("No se puede cambiar la vivienda de un cliente con abonos. Use la opción 'Transferir Vivienda'.");
        }
    }

    // Lógica de seguridad para la fecha de ingreso
    const fechaOriginal = clienteOriginal.datosCliente.fechaIngreso;
    const fechaNueva = clienteActualizado.datosCliente.fechaIngreso;

    if (fechaOriginal !== fechaNueva) {
        const abonosQuery = query(
            collection(db, "abonos"),
            where("clienteId", "==", clienteId),
            where("estadoProceso", "==", "activo")
        );
        const abonosSnap = await getDocs(abonosQuery);

        const procesoOriginal = clienteOriginal.proceso || {};
        const otrosPasosCompletados = Object.keys(procesoOriginal).filter(key =>
            procesoOriginal[key]?.completado && key !== 'promesaEnviada'
        ).length;

        if (abonosSnap.size > 0 || otrosPasosCompletados > 0) {
            console.warn("Intento de cambio de fecha de ingreso bloqueado para cliente con proceso avanzado.");
            clienteActualizado.datosCliente.fechaIngreso = fechaOriginal;
            if (clienteActualizado.proceso?.promesaEnviada) {
                clienteActualizado.proceso.promesaEnviada.fecha = fechaOriginal;
            }
        }
    }

    // Sincronizar proceso del cliente
    const procesoSincronizado = { ...(clienteActualizado.proceso || {}) };
    PROCESO_CONFIG.forEach(pasoConfig => {
        const aplicaAhora = pasoConfig.aplicaA(clienteActualizado.financiero || {});
        const existeEnProceso = procesoSincronizado[pasoConfig.key];

        if (existeEnProceso && !aplicaAhora) {
            procesoSincronizado[pasoConfig.key].archivado = true;
        }
        if (!existeEnProceso && aplicaAhora) {
            const evidencias = {};
            pasoConfig.evidenciasRequeridas.forEach(ev => {
                evidencias[ev.id] = { url: null, estado: 'pendiente' };
            });
            procesoSincronizado[pasoConfig.key] = {
                completado: false,
                fecha: null,
                evidencias,
                archivado: false
            };
        }
        if (existeEnProceso && aplicaAhora && existeEnProceso.archivado) {
            procesoSincronizado[pasoConfig.key].archivado = false;
        }
    });

    const datosFinales = { ...clienteActualizado, proceso: procesoSincronizado };

    // Actualizar viviendas
    const batch = writeBatch(db);
    batch.update(clienteRef, datosFinales);

    const nuevaViviendaId = datosFinales.viviendaId;
    const nombreCompleto = `${datosFinales.datosCliente.nombres} ${datosFinales.datosCliente.apellidos}`.trim();

    if (viviendaOriginalId !== nuevaViviendaId) {
        if (viviendaOriginalId) {
            batch.update(doc(db, "viviendas", String(viviendaOriginalId)), {
                clienteId: null,
                clienteNombre: ""
            });
        }
        if (nuevaViviendaId) {
            batch.update(doc(db, "viviendas", String(nuevaViviendaId)), {
                clienteId: clienteId,
                clienteNombre: nombreCompleto
            });
        }
    } else if (nuevaViviendaId) {
        batch.update(doc(db, "viviendas", String(nuevaViviendaId)), {
            clienteNombre: nombreCompleto
        });
    }

    await batch.commit();

    // 🔥 AUDITORÍA - Sistema Unificado
    console.log('🎬 [updateCliente - clienteCRUD.js] INICIO AUDITORÍA');
    const { action, cambios, snapshotCompleto, nombreNuevaVivienda } = auditDetails;
    console.log('  - action:', action);
    console.log('  - cambios:', cambios);
    console.log('  - cambios.length:', cambios?.length);

    const clienteNombreCompleto = toTitleCase(`${clienteActualizado.datosCliente.nombres} ${clienteActualizado.datosCliente.apellidos}`);

    if (action === 'RESTART_CLIENT_PROCESS') {
        console.log('  → Caso: RESTART_CLIENT_PROCESS (sistema viejo)');
        await createAuditLogWithBuilder(
            'RESTART_CLIENT_PROCESS',
            {
                category: 'clientes',
                clienteId: clienteId,
                clienteNombre: clienteNombreCompleto,
                nombreNuevaVivienda: nombreNuevaVivienda || 'No especificado',
                snapshotCompleto: snapshotCompleto
            }
        );
    } else if (action === 'UPDATE_CLIENT' && cambios && cambios.length > 0) {
        console.log('  → Caso: UPDATE_CLIENT con cambios - usando sistema NUEVO');

        // Separar cambios regulares de cambios de archivos
        const cambiosRegulares = [];
        const cambiosArchivos = [];

        cambios.forEach(cambio => {
            if (cambio.fileChange) {
                cambiosArchivos.push(cambio);
            } else {
                cambiosRegulares.push(cambio);
            }
        });

        console.log('  - cambiosRegulares:', cambiosRegulares.length);
        console.log('  - cambiosArchivos:', cambiosArchivos.length);

        // Extraer nombres de campos para camposEditados (requerido por interpretador)
        const camposEditados = cambios.map(c => c.campo);
        console.log('  - camposEditados:', camposEditados);

        // 🆕 Obtener información de la vivienda para el contexto
        let viviendaInfo = {};
        if (clienteActualizado.viviendaId) {
            try {
                const viviendaRef = doc(db, "viviendas", String(clienteActualizado.viviendaId));
                const viviendaSnap = await getDoc(viviendaRef);
                if (viviendaSnap.exists()) {
                    const viviendaData = viviendaSnap.data();
                    viviendaInfo = {
                        id: viviendaSnap.id,
                        manzana: viviendaData.manzana,
                        numeroCasa: viviendaData.numeroCasa,
                        proyectoId: viviendaData.proyectoId
                    };
                    console.log('✅ Vivienda info obtenida:', viviendaInfo);
                }
            } catch (error) {
                console.warn('⚠️ No se pudo obtener info de vivienda:', error);
            }
        }

        try {
            // 🆕 Obtener nombre del usuario actual
            let userName = 'Usuario';
            if (auth.currentUser) {
                try {
                    const userDocRef = doc(db, "users", auth.currentUser.uid);
                    const userDocSnap = await getDoc(userDocRef);
                    if (userDocSnap.exists()) {
                        const userData = userDocSnap.data();
                        userName = toTitleCase(`${userData.nombres} ${userData.apellidos}`);
                    } else {
                        userName = auth.currentUser.email || 'Usuario';
                    }
                } catch (error) {
                    console.warn('⚠️ No se pudo obtener nombre de usuario:', error);
                    userName = auth.currentUser.email || 'Usuario';
                }
            }

            // 🆕 Generar mensaje pre-formateado con iconos ANTES de guardar
            const { interpretAuditForClientHistory } = await import('../../utils/clientHistoryAuditInterpreter');

            // Crear un objeto temporal de log para generar el mensaje
            const tempLog = {
                actionType: 'UPDATE_CLIENT',
                userName: userName,
                context: {
                    cliente: {
                        nombre: clienteNombreCompleto,
                        documento: clienteId
                    },
                    vivienda: viviendaInfo
                },
                actionData: {
                    tipoActualizacion: 'EDIT_DATA',
                    cambios: cambios,
                    cambiosRegulares: cambiosRegulares,
                    cambiosArchivos: cambiosArchivos,
                    camposEditados: camposEditados,
                    totalCambios: cambios.length,
                    tieneArchivos: cambiosArchivos.length > 0
                }
            };

            const mensajePreGenerado = interpretAuditForClientHistory(tempLog);
            console.log('✅ [updateCliente] Mensaje pre-generado:', mensajePreGenerado.substring(0, 100) + '...');

            const result = await createClientAuditLog(
                'UPDATE_CLIENT',
                {
                    id: clienteId,
                    nombre: clienteNombreCompleto,
                    numeroDocumento: clienteId
                },
                {
                    viviendaId: clienteActualizado.viviendaId,
                    vivienda: viviendaInfo, // 🆕 Agregar info de vivienda al contexto
                    actionData: {
                        tipoActualizacion: 'EDIT_DATA',
                        cambios: cambios,
                        cambiosRegulares: cambiosRegulares,
                        cambiosArchivos: cambiosArchivos,
                        camposEditados: camposEditados, // ✅ Agregado para interpretador
                        totalCambios: cambios.length,
                        tieneArchivos: cambiosArchivos.length > 0
                    }
                },
                {
                    message: mensajePreGenerado // ✅ Pasar mensaje pre-generado
                }
            );
            console.log('✅ [updateCliente] Audit log creado:', result);
        } catch (error) {
            console.error('❌ [updateCliente] Error creando audit log:', error);
        }
    } else {
        console.log('⚠️ [updateCliente] NO se creó audit log:');
        console.log('  - action:', action);
        console.log('  - cambios:', cambios);
        console.log('  - cambios.length:', cambios?.length);
    }
};

/**
 * Elimina un cliente (soft delete - no implementado, usa inactivarCliente)
 */
export const deleteCliente = async (clienteId) => {
    await deleteDoc(doc(db, "clientes", String(clienteId)));
};

/**
 * Archiva un cliente (cambia status a inactivo)
 */
export const inactivarCliente = async (clienteId, clienteNombre) => {
    await updateDoc(doc(db, "clientes", String(clienteId)), {
        status: 'inactivo',
        fechaInactivacion: new Date().toISOString()
    });

    await createAuditLog(
        `Archivó al cliente ${toTitleCase(clienteNombre)} (C.C. ${clienteId})`,
        {
            action: 'ARCHIVE_CLIENT',
            clienteId: clienteId,
            clienteNombre: toTitleCase(clienteNombre)
        }
    );
};

/**
 * Restaura un cliente archivado
 */
export const restaurarCliente = async (clienteId) => {
    const clienteRef = doc(db, "clientes", String(clienteId));
    const clienteSnap = await getDoc(clienteRef);

    if (!clienteSnap.exists()) {
        throw new Error("El cliente no existe.");
    }

    const clienteData = clienteSnap.data();
    const nombreCompleto = `${clienteData.datosCliente.nombres} ${clienteData.datosCliente.apellidos}`;

    await updateDoc(doc(db, "clientes", String(clienteId)), {
        status: 'renunciado'
    });

    await createAuditLog(
        `Restauró al cliente ${toTitleCase(nombreCompleto)} (C.C. ${clienteId})`,
        {
            action: 'RESTORE_CLIENT',
            clienteId: clienteId,
            clienteNombre: nombreCompleto,
        }
    );
};

/**
 * Elimina permanentemente un cliente y todas sus renuncias asociadas
 */
export const deleteClientePermanently = async (clienteId) => {
    const clienteRef = doc(db, "clientes", clienteId);
    const clienteSnap = await getDoc(clienteRef);
    const clienteData = clienteSnap.exists() ? clienteSnap.data() : null;
    const clienteNombre = clienteData
        ? toTitleCase(`${clienteData.datosCliente.nombres} ${clienteData.datosCliente.apellidos}`)
        : `C.C. ${clienteId}`;

    const renunciasQuery = query(collection(db, "renuncias"), where("clienteId", "==", clienteId));
    const renunciasSnapshot = await getDocs(renunciasQuery);
    const renunciasCliente = renunciasSnapshot.docs.map(doc => doc.data());

    const batch = writeBatch(db);

    // Eliminar archivos de Storage (si existen)
    for (const renuncia of renunciasCliente) {
        if (renuncia.documentosArchivados && renuncia.documentosArchivados.length > 0) {
            for (const docInfo of renuncia.documentosArchivados) {
                if (docInfo.url) {
                    try {
                        // Importar dinámicamente si se necesita
                        const { deleteFile } = await import('../fileService');
                        await deleteFile(docInfo.url);
                    } catch (error) {
                        console.error("Error al eliminar archivo:", error);
                    }
                }
            }
        }
    }

    // Eliminar documentos de Firestore
    renunciasSnapshot.forEach(doc => {
        batch.delete(doc.ref);
    });
    batch.delete(doc(db, "clientes", clienteId));

    await batch.commit();

    // Migrar a sistema nuevo
    await createClientAuditLog(
        'DELETE_CLIENT',
        {
            id: clienteId,
            nombre: clienteNombre,
            numeroDocumento: clienteId
        },
        {
            actionData: {
                eliminacionPermanente: true,
                snapshotCliente: clienteData
            }
        }
    );
};

