import { db } from '../firebase/config';
import { collection, doc, updateDoc, deleteDoc, getDoc, writeBatch, setDoc, query, where, getDocs, addDoc, runTransaction, serverTimestamp } from "firebase/firestore";
import { toTitleCase, formatDisplayDate, getTodayString } from '../utils/textFormatters';
import { PROCESO_CONFIG } from '../utils/procesoConfig.js';
import { DOCUMENTACION_CONFIG } from '../utils/documentacionConfig.js';
import { createAuditLog, createAuditLogWithBuilder } from './auditService';
import { createClientAuditLog, ACTION_TYPES } from './unifiedAuditService';
import { deleteFile } from './fileService';

// Funciones helper para generar mensajes de auditoría específicos

const obtenerNombreEvidencia = (evidenciaId, evidencia, pasoConfig) => {
    // PRIORIDAD: Buscar el label en DOCUMENTACION_CONFIG
    const docConfig = DOCUMENTACION_CONFIG.find(doc => doc.id === evidenciaId);
    if (docConfig) {
        return docConfig.label;
    }

    // Fallback al nombre de la configuración del proceso
    const evidenciaConfig = pasoConfig.evidenciasRequeridas?.find(ev => ev.id === evidenciaId);
    if (evidenciaConfig && evidenciaConfig.nombre) {
        return evidenciaConfig.nombre;
    }

    // Último fallback
    return evidencia?.nombre || evidencia?.name || evidencia?.originalName || evidenciaId;
};

const construirListaEvidencias = (evidencias, pasoConfig) => {
    if (!evidencias || Object.keys(evidencias).length === 0) return { texto: '', cantidad: 0 };

    const evidenciasAdjuntas = [];
    Object.entries(evidencias).forEach(([evidenciaId, evidencia]) => {
        if (evidencia && (evidencia.url || evidencia.nombre || evidencia.originalName)) {
            const nombreEvidencia = obtenerNombreEvidencia(evidenciaId, evidencia, pasoConfig);
            if (nombreEvidencia) {
                evidenciasAdjuntas.push(nombreEvidencia);
            }
        }
    });

    let texto = '';
    if (evidenciasAdjuntas.length > 0) {
        if (evidenciasAdjuntas.length === 1) {
            texto = `\n   • ${evidenciasAdjuntas[0]}`;
        } else {
            texto = `\n   • ${evidenciasAdjuntas.join('\n   • ')}`;
        }
    }

    return { texto, cantidad: evidenciasAdjuntas.length };
};

const generarMensajeComplecion = (pasoNombre, pasoData, pasoConfig) => {
    const { texto: evidenciasTexto, cantidad } = construirListaEvidencias(pasoData.evidencias, pasoConfig);
    const fechaFormulario = pasoData.fecha;

    if (evidenciasTexto) {
        const iconoEvidencia = cantidad === 1 ? '📄' : '📋';
        const textoEvidencias = cantidad === 1 ? 'se adjuntó la evidencia' : `se adjuntaron ${cantidad} evidencias`;

        return `🎉 ¡Paso completado con éxito!

📋 Paso: "${pasoNombre}"
${iconoEvidencia} Evidencias: ${textoEvidencias}:${evidenciasTexto}
📅 Fecha de completado: ${formatDisplayDate(fechaFormulario)}`;
    } else {
        return `🎉 ¡Paso completado con éxito!

📋 Paso: "${pasoNombre}"
📝 Sin evidencias adjuntas
📅 Fecha de completado: ${formatDisplayDate(fechaFormulario)}`;
    }
};

const generarMensajeReapertura = (pasoNombre, pasoOriginal, pasoActual) => {
    const motivo = pasoActual.motivoReapertura || 'No especificado';
    const fechaOriginal = formatDisplayDate(pasoOriginal.fecha);

    return `🔄 Reapertura de paso

📋 Paso: "${pasoNombre}"
⚠️  Motivo: ${motivo}
📅 Fecha original de completado: ${fechaOriginal}
🔓 El paso fue marcado como pendiente nuevamente`;
};

export const addClienteAndAssignVivienda = async (clienteData, auditMessage, auditDetails) => {
    const newClienteRef = doc(db, "clientes", clienteData.datosCliente.cedula);
    const clienteParaGuardar = {
        ...clienteData,
        id: newClienteRef.id,
        status: 'activo',
        fechaCreacion: clienteData.datosCliente.fechaIngreso,
        fechaInicioProceso: clienteData.datosCliente.fechaIngreso
    };
    if (clienteData.viviendaId) {
        const viviendaRef = doc(db, "viviendas", String(clienteData.viviendaId));
        const batch = writeBatch(db);
        batch.set(newClienteRef, clienteParaGuardar);
        batch.update(viviendaRef, {
            clienteId: newClienteRef.id,
            clienteNombre: `${clienteData.datosCliente.nombres} ${clienteData.datosCliente.apellidos}`.trim()
        });
        await batch.commit();

        if (auditMessage && auditDetails) {
            await createAuditLog(auditMessage, auditDetails);
        }
        // AUDITORÍA: Se registra la creación del cliente

    } else {
        await setDoc(newClienteRef, clienteParaGuardar);
    }
};

export const updateCliente = async (clienteId, clienteActualizado, viviendaOriginalId, auditDetails = {}) => {
    const clienteRef = doc(db, "clientes", String(clienteId));

    const clienteOriginalSnap = await getDoc(clienteRef);
    if (!clienteOriginalSnap.exists()) {
        throw new Error("El cliente que intentas actualizar no existe.");
    }
    const clienteOriginal = clienteOriginalSnap.data();

    const viviendaIdOriginal = clienteOriginal.viviendaId;
    const viviendaIdNueva = clienteActualizado.viviendaId;

    if (viviendaIdOriginal !== viviendaIdNueva) {
        const abonosQuery = query(collection(db, "abonos"), where("clienteId", "==", clienteId), where("estadoProceso", "==", "activo"));
        const abonosSnap = await getDocs(abonosQuery);

        if (abonosSnap.size > 0) {
            // Si hay un intento de cambio y existen abonos, lanzamos el error.
            // La variable 'isEditing' fue eliminada porque es redundante en esta función.
            throw new Error("No se puede cambiar la vivienda de un cliente con abonos. Use la opción 'Transferir Vivienda'.");
        }
    }

    // Lógica de seguridad para la fecha de ingreso
    const fechaOriginal = clienteOriginal.datosCliente.fechaIngreso;
    const fechaNueva = clienteActualizado.datosCliente.fechaIngreso;

    if (fechaOriginal !== fechaNueva) {
        // Obtenemos los abonos para verificar la primera condición
        const abonosQuery = query(collection(db, "abonos"), where("clienteId", "==", clienteId), where("estadoProceso", "==", "activo"));
        const abonosSnap = await getDocs(abonosQuery);

        // Verificamos si hay más de un paso completado
        const procesoOriginal = clienteOriginal.proceso || {};
        const otrosPasosCompletados = Object.keys(procesoOriginal).filter(key =>
            procesoOriginal[key]?.completado && key !== 'promesaEnviada'
        ).length;

        // Si alguna de las condiciones de bloqueo se cumple, revertimos el cambio.
        if (abonosSnap.size > 0 || otrosPasosCompletados > 0) {
            console.warn("Intento de cambio de fecha de ingreso bloqueado para cliente con proceso avanzado.");
            // Revertimos silenciosamente el cambio de fecha al valor original
            clienteActualizado.datosCliente.fechaIngreso = fechaOriginal;
            // También revertimos la fecha sincronizada del proceso si existe
            if (clienteActualizado.proceso?.promesaEnviada) {
                clienteActualizado.proceso.promesaEnviada.fecha = fechaOriginal;
            }
        }
    }


    // 1. Lógica para sincronizar el proceso del cliente
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
                completado: false, fecha: null, evidencias, archivado: false
            };
        }
        if (existeEnProceso && aplicaAhora && existeEnProceso.archivado) {
            procesoSincronizado[pasoConfig.key].archivado = false;
        }
    });

    const datosFinales = { ...clienteActualizado, proceso: procesoSincronizado };

    // 2. Lógica para actualizar las viviendas
    const batch = writeBatch(db);
    batch.update(clienteRef, datosFinales);
    const nuevaViviendaId = datosFinales.viviendaId;
    const nombreCompleto = `${datosFinales.datosCliente.nombres} ${datosFinales.datosCliente.apellidos}`.trim();
    if (viviendaOriginalId !== nuevaViviendaId) {
        if (viviendaOriginalId) {
            batch.update(doc(db, "viviendas", String(viviendaOriginalId)), { clienteId: null, clienteNombre: "" });
        }
        if (nuevaViviendaId) {
            batch.update(doc(db, "viviendas", String(nuevaViviendaId)), { clienteId: clienteId, clienteNombre: nombreCompleto });
        }
    } else if (nuevaViviendaId) {
        batch.update(doc(db, "viviendas", String(nuevaViviendaId)), { clienteNombre: nombreCompleto });
    }

    // 3. Se ejecuta la escritura en la base de datos
    await batch.commit();

    // 4. Lógica de auditoría centralizada
    const { action, cambios, snapshotCompleto, nombreNuevaVivienda } = auditDetails;
    const clienteNombreCompleto = toTitleCase(`${clienteActualizado.datosCliente.nombres} ${clienteActualizado.datosCliente.apellidos}`);

    if (action === 'RESTART_CLIENT_PROCESS') {
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
    } else {
        // Separar cambios regulares de cambios de archivos para mejor auditoría
        const cambiosRegulares = [];
        const cambiosArchivos = [];

        (cambios || []).forEach(cambio => {
            if (cambio.fileChange) {
                cambiosArchivos.push({
                    ...cambio,
                    // Información adicional para auditoría de archivos
                    fileAuditInfo: {
                        documentType: cambio.campo,
                        changeType: cambio.fileChange.type,
                        previousUrl: cambio.fileChange.previousUrl,
                        newUrl: cambio.fileChange.newUrl,
                        timestamp: cambio.fileChange.timestamp,
                        // Hash de los archivos si fuera necesario en el futuro
                        metadata: {
                            previousExists: !!cambio.fileChange.previousUrl,
                            newExists: !!cambio.fileChange.newUrl
                        }
                    }
                });
            } else {
                cambiosRegulares.push(cambio);
            }
        });

        await createAuditLog(
            `Actualizó los datos del cliente ${clienteNombreCompleto} (C.C. ${clienteId})`,
            {
                action: 'UPDATE_CLIENT',
                clienteId: clienteId,
                clienteNombre: clienteNombreCompleto,
                cambios: cambios || [], // Cambios originales para TabHistorial
                // Información detallada para auditoría avanzada
                auditDetails: {
                    cambiosRegulares: cambiosRegulares,
                    cambiosArchivos: cambiosArchivos,
                    totalCambios: (cambios || []).length,
                    tieneArchivos: cambiosArchivos.length > 0
                }
            }
        );
    }
};

export const deleteCliente = async (clienteId) => {
    await deleteDoc(doc(db, "clientes", String(clienteId)));
};

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

export const restaurarCliente = async (clienteId) => {
    // Obtenemos los datos del cliente ANTES de restaurarlo para la auditoría.
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

    // Creamos el registro de auditoría
    await createAuditLog(
        `Restauró al cliente ${toTitleCase(nombreCompleto)} (C.C. ${clienteId})`,
        {
            action: 'RESTORE_CLIENT', // Nuevo tipo de acción
            clienteId: clienteId,
            clienteNombre: nombreCompleto,
        }
    );

};

export const deleteClientePermanently = async (clienteId) => {
    // Obtenemos los datos del cliente ANTES de que sea eliminado.
    const clienteRef = doc(db, "clientes", clienteId);
    const clienteSnap = await getDoc(clienteRef);
    const clienteData = clienteSnap.exists() ? clienteSnap.data() : null;
    const clienteNombre = clienteData ? toTitleCase(`${clienteData.datosCliente.nombres} ${clienteData.datosCliente.apellidos}`) : `C.C. ${clienteId}`;

    const renunciasQuery = query(collection(db, "renuncias"), where("clienteId", "==", clienteId));
    const renunciasSnapshot = await getDocs(renunciasQuery);
    const renunciasCliente = renunciasSnapshot.docs.map(doc => doc.data());
    const batch = writeBatch(db);

    // Eliminar archivos de Storage
    for (const renuncia of renunciasCliente) {
        if (renuncia.documentosArchivados && renuncia.documentosArchivados.length > 0) {
            for (const docInfo of renuncia.documentosArchivados) {
                if (docInfo.url) {
                    try {
                        const fileRef = ref(storage, docInfo.url);
                        await deleteObject(fileRef);
                    } catch (error) {
                        if (error.code !== 'storage/object-not-found') {
                            console.error("Error al eliminar archivo de Storage:", error);
                        }
                    }
                }
            }
        }
    }

    // 2. Eliminar documentos de Firestore
    renunciasSnapshot.forEach(doc => {
        batch.delete(doc.ref);
    });
    batch.delete(doc(db, "clientes", clienteId));


    await batch.commit();

    // Creamos el registro de auditoría después de confirmar la eliminación.
    await createAuditLog(
        `Eliminó permanentemente al cliente ${clienteNombre}`,
        {
            action: 'DELETE_CLIENT_PERMANENTLY',
            clienteId: clienteId,
            clienteNombre: clienteNombre,
            // Guardamos una copia completa de los datos por si se necesita para una futura revisión.
            clienteDataBackup: clienteData
        }
    );
};

export const generarActividadProceso = (procesoOriginal, procesoActual, userName) => {
    const original = JSON.parse(JSON.stringify(procesoOriginal || {}));
    const actual = JSON.parse(JSON.stringify(procesoActual || {}));
    const nuevoProcesoConActividad = JSON.parse(JSON.stringify(procesoActual));

    PROCESO_CONFIG.forEach(pasoConfig => {
        const key = pasoConfig.key;
        const pasoOriginalData = procesoOriginal[key] || {};
        const pasoActualData = nuevoProcesoConActividad[key];

        if (!pasoActualData) return;
        if (!pasoActualData.actividad) {
            pasoActualData.actividad = pasoOriginalData.actividad || [];
        }

        const crearEntrada = (mensaje) => ({ mensaje, userName, fecha: new Date() });

        const seCompletoEnEsteCambio = !pasoOriginalData.completado && pasoActualData.completado;
        const fueReabiertoEnEsteCambio = pasoOriginalData.completado && !pasoActualData.completado;
        const fechaCambio = pasoOriginalData.fecha !== pasoActualData.fecha;

        if (JSON.stringify(pasoOriginalData) !== JSON.stringify(pasoActualData)) {
            console.log(`DEBUG Servicio [${pasoConfig.key}]: Se completó: ${seCompletoEnEsteCambio}, Fue reabierto: ${fueReabiertoEnEsteCambio}, Fecha cambió: ${fechaCambio}`);
        }

        const evidenciasCambiadas = [];
        pasoConfig.evidenciasRequeridas.forEach(ev => {
            const idEvidencia = ev.id;
            const urlOriginal = pasoOriginalData.evidencias?.[idEvidencia]?.url;
            const urlActual = pasoActualData.evidencias?.[idEvidencia]?.url;
            if (urlActual !== urlOriginal) {
                evidenciasCambiadas.push({
                    label: ev.label,
                    accion: urlActual ? (urlOriginal ? 'reemplazó' : 'subió') : 'eliminó'
                });
            }
        });

        // --- INICIO DE LA LÓGICA CORREGIDA ---

        // CASO 1: El paso ya estaba completado y su fecha se modificó. Esta es una acción prioritaria.
        if (pasoOriginalData.completado && pasoActualData.completado && fechaCambio) {
            const motivo = pasoActualData.motivoUltimoCambio || 'No se especificó motivo.';
            const msg = `Se modificó la fecha de completado de ${formatDisplayDate(pasoOriginalData.fecha)} a ${formatDisplayDate(pasoActualData.fecha)}. Motivo: "${motivo}"`;
            pasoActualData.actividad.push(crearEntrada(msg));
            // Limpiamos el motivo para que no se vuelva a procesar en otras condiciones.
            delete pasoActualData.motivoUltimoCambio;
        }
        // CASO 2: El paso FUE REABIERTO.
        else if (pasoActualData.motivoReapertura) {
            let mensaje = `Se reabrió el paso indicando el siguiente Motivo: "${pasoActualData.motivoReapertura}".`;
            const accionesPosteriores = [];

            if (evidenciasCambiadas.length > 0) {
                const textoEvidencia = evidenciasCambiadas.map(ev => `se ${ev.accion} la evidencia '${ev.label}'`).join(' y ');
                accionesPosteriores.push(textoEvidencia);
            }
            // Ya no verificamos 'fechaCambio' aquí porque se maneja en el CASO 1.

            if (accionesPosteriores.length > 0) {
                mensaje += ` Posteriormente, ${accionesPosteriores.join(' y ')}.`;
            }

            if (seCompletoEnEsteCambio) {
                mensaje += ` Finalmente, el paso fue marcado como completado.`
            }

            pasoActualData.actividad.push(crearEntrada(mensaje));
            delete pasoActualData.motivoReapertura;
        }
        // CASO 3: El paso se completó en esta acción.
        else if (seCompletoEnEsteCambio) {
            let msg = `Se completó el paso con fecha ${formatDisplayDate(pasoActualData.fecha)}.`;
            if (evidenciasCambiadas.length > 0) {
                const accionesEvidenciaTexto = evidenciasCambiadas.map(ev => `se ${ev.accion} la evidencia '${ev.label}'`).join(' y ');
                msg = `${accionesEvidenciaTexto.charAt(0).toUpperCase() + accionesEvidenciaTexto.slice(1)} y se completó el paso con fecha ${formatDisplayDate(pasoActualData.fecha)}.`;
            }
            pasoActualData.actividad.push(crearEntrada(msg));
        }
        // CASO 4: El paso fue reabierto (como única acción).
        else if (fueReabiertoEnEsteCambio) {
            pasoActualData.actividad.push(crearEntrada('Paso reabierto.'));
        }
        // CASO 5: Solo cambiaron las evidencias en un paso no completado.
        else if (evidenciasCambiadas.length > 0) {
            const accionesEvidenciaTexto = evidenciasCambiadas.map(ev => `Se ${ev.accion} la evidencia '${ev.label}'`).join(', ');
            pasoActualData.actividad.push(crearEntrada(accionesEvidenciaTexto + '.'));
        }
        // --- FIN DE LA LÓGICA CORREGIDA ---
    });

    return nuevoProcesoConActividad;
};

export const renunciarAVivienda = async (clienteId, motivo, observacion = '', fechaRenuncia, penalidadMonto = 0, penalidadMotivo = '') => {
    const clienteRef = doc(db, "clientes", clienteId);
    let clienteNombre = '';
    let viviendaInfoParaLog = '';
    let renunciaIdParaNotificacion = '';
    let estadoInicialRenuncia;

    await runTransaction(db, async (transaction) => {
        const clienteDoc = await transaction.get(clienteRef);
        if (!clienteDoc.exists()) throw new Error("El cliente ya no existe.");

        const clienteData = clienteDoc.data();
        const viviendaId = clienteData.viviendaId;
        if (!viviendaId) throw new Error("El cliente no tiene una vivienda asignada para renunciar.");

        const viviendaRef = doc(db, "viviendas", viviendaId);
        const viviendaDoc = await transaction.get(viviendaRef);
        if (!viviendaDoc.exists()) throw new Error("La vivienda ya no existe.");

        const viviendaData = viviendaDoc.data();
        clienteNombre = `${clienteData.datosCliente.nombres} ${clienteData.datosCliente.apellidos}`.trim();
        viviendaInfoParaLog = `Mz ${viviendaData.manzana} - Casa ${viviendaData.numeroCasa}`; // Guardamos info para el log

        const abonosActivosQuery = query(collection(db, "abonos"), where("clienteId", "==", clienteId), where("viviendaId", "==", viviendaId), where("estadoProceso", "==", "activo"));
        const abonosSnapshot = await getDocs(abonosActivosQuery);
        const abonosDelCiclo = abonosSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        const abonosRealesDelCliente = abonosDelCiclo.filter(abono => abono.metodoPago !== 'Condonación de Saldo');
        const totalAbonadoReal = abonosRealesDelCliente.reduce((sum, abono) => sum + abono.monto, 0);
        const totalADevolver = totalAbonadoReal - penalidadMonto;

        estadoInicialRenuncia = totalADevolver > 0 ? 'Pendiente' : 'Cerrada';

        const renunciaRef = doc(collection(db, "renuncias"));
        renunciaIdParaNotificacion = renunciaRef.id;

        // --- INICIO DE LA CORRECCIÓN ---
        // Se restaura la lógica para recolectar todos los documentos del cliente.
        const documentosArchivados = [];
        DOCUMENTACION_CONFIG.forEach(docConfig => {
            if (docConfig.selector) {
                const docData = docConfig.selector(clienteData);
                const url = docData?.url || (typeof docData === 'string' ? docData : null);
                if (url) {
                    documentosArchivados.push({ label: docConfig.label, url: url });
                }
            }
        });
        // --- FIN DE LA CORRECCIÓN ---

        const registroRenuncia = {
            id: renunciaRef.id, clienteId, clienteNombre, viviendaId,
            viviendaInfo: `Mz. ${viviendaData.manzana} - Casa ${viviendaData.numeroCasa}`,
            fechaRenuncia, totalAbonadoOriginal: totalAbonadoReal, penalidadMonto, penalidadMotivo,
            totalAbonadoParaDevolucion: totalADevolver, estadoDevolucion: estadoInicialRenuncia,
            motivo, observacion, historialAbonos: abonosDelCiclo,
            documentosArchivados,
            financieroArchivado: clienteData.financiero || {},
            procesoArchivado: clienteData.proceso || {},
            viviendaArchivada: {
                id: viviendaId,
                manzana: viviendaData.manzana,
                numeroCasa: viviendaData.numeroCasa,
                descuentoMonto: viviendaData.descuentoMonto || 0,
                saldoPendiente: viviendaData.saldoPendiente ?? 0
            },
            timestamp: serverTimestamp()
        };

        transaction.set(renunciaRef, registroRenuncia);
        transaction.update(viviendaRef, { clienteId: null, clienteNombre: "", totalAbonado: 0, saldoPendiente: viviendaData.valorTotal });

        if (estadoInicialRenuncia === 'Pendiente') {
            transaction.update(clienteRef, { status: 'enProcesoDeRenuncia' });
        } else {
            transaction.update(clienteRef, { viviendaId: null, proceso: {}, financiero: {}, status: 'renunciado' });
            transaction.update(renunciaRef, { fechaDevolucion: fechaRenuncia });

            abonosDelCiclo.forEach(abono => {
                transaction.update(doc(db, "abonos", abono.id), { estadoProceso: 'archivado' });
            });
        }
    });

    let auditMessage = `Registró la renuncia del cliente ${toTitleCase(clienteNombre)} a la vivienda ${viviendaInfoParaLog}, con fecha ${formatDisplayDate(fechaRenuncia)}, indicando el motivo "${motivo}"`;

    if (estadoInicialRenuncia === 'Cerrada') {
        auditMessage += '. Este proceso de renuncia queda cerrado automáticamente ya que el cliente no cuenta con abonos pendientes por devolución.';
    }

    await createAuditLog(
        auditMessage,
        {
            action: 'CLIENT_RENOUNCE',
            clienteId: clienteId,
            clienteNombre: toTitleCase(clienteNombre),
            viviendaInfo: viviendaInfoParaLog,
            motivoRenuncia: motivo,
            observaciones: observacion,
            penalidadAplicada: penalidadMonto > 0,
            montoPenalidad: penalidadMonto,
            motivoPenalidad: penalidadMotivo
        }
    );

    return { renunciaId: renunciaIdParaNotificacion, clienteNombre };
};

export const anularCierreProceso = async (clienteId, userName, motivo) => {
    const clienteRef = doc(db, "clientes", clienteId);

    const clienteDocInicial = await getDoc(clienteRef);
    if (!clienteDocInicial.exists()) {
        throw new Error("El cliente no existe.");
    }
    const clienteDataInicial = clienteDocInicial.data();
    const clienteNombre = toTitleCase(`${clienteDataInicial.datosCliente.nombres} ${clienteDataInicial.datosCliente.apellidos}`);

    await runTransaction(db, async (transaction) => {
        const clienteDoc = await transaction.get(clienteRef);
        const clienteData = clienteDoc.data();
        const procesoActual = clienteData.proceso || {};

        if (procesoActual.facturaVenta && procesoActual.facturaVenta.completado) {
            const pasoFacturaVenta = procesoActual.facturaVenta;

            // --- INICIO DE LA SOLUCIÓN ---
            // 1. Preparamos la nueva entrada para el historial del paso
            const nuevaEntradaHistorial = {
                mensaje: `Cierre anulado por el Administrador → ${userName}, se reabre el ultimo paso 'Factura de Venta' por el siguiente Motivo: "${motivo}"`,
                userName: userName,
                fecha: new Date()
            };

            // 2. Nos aseguramos de que el array de actividad exista
            const actividadExistente = pasoFacturaVenta.actividad || [];
            // --- FIN DE LA SOLUCIÓN ---

            const nuevoProceso = {
                ...procesoActual,
                facturaVenta: {
                    ...pasoFacturaVenta,
                    completado: false,
                    fecha: null,
                    fechaUltimaModificacion: getTodayString(),
                    actividad: [...actividadExistente, nuevaEntradaHistorial]
                }
            };
            transaction.update(clienteRef, { proceso: nuevoProceso });
        } else {
            throw new Error("El proceso no se puede anular porque no está completado.");
        }
    });

    // La lógica de la auditoría general se mantiene
    await createAuditLog(
        `Anuló el cierre del proceso para el cliente ${clienteNombre}`,
        {
            action: 'ANULAR_CIERRE_PROCESO',
            clienteId: clienteId,
            clienteNombre: clienteNombre,
        }
    );
};

export const getClienteProceso = async (clienteId) => {
    const clienteRef = doc(db, "clientes", String(clienteId));
    const clienteSnap = await getDoc(clienteRef);
    if (!clienteSnap.exists()) {
        // Lanzamos un error específico que podemos capturar si es necesario
        throw new Error("CLIENT_NOT_FOUND");
    }
    // Devolvemos solo el objeto 'proceso' o un objeto vacío si no existe
    return clienteSnap.data().proceso || {};
};

const generarMensajeReCompletado = (pasoNombre, pasoOriginal, pasoActual, pasoConfig) => {
    const motivoReapertura = pasoActual.motivoReapertura || 'No especificado';
    const estadoAnterior = pasoActual.estadoAnterior || {};

    // Analizar los cambios realizados
    const cambios = [];

    // 1. Comparar fechas
    const fechaAnterior = estadoAnterior.fecha;
    const fechaNueva = pasoActual.fecha;
    if (fechaAnterior !== fechaNueva) {
        cambios.push({
            tipo: 'fecha',
            anterior: formatDisplayDate(fechaAnterior),
            nueva: formatDisplayDate(fechaNueva)
        });
    }

    // 2. Comparar evidencias
    const evidenciasAnteriores = estadoAnterior.evidencias || {};
    const evidenciasNuevas = pasoActual.evidencias || {};

    const { texto: textoEvidenciasAnteriores, cantidad: cantidadAnterior } = construirListaEvidencias(evidenciasAnteriores, pasoConfig);
    const { texto: textoEvidenciasNuevas, cantidad: cantidadNueva } = construirListaEvidencias(evidenciasNuevas, pasoConfig);

    const evidenciasCambiaron = JSON.stringify(evidenciasAnteriores) !== JSON.stringify(evidenciasNuevas);

    if (evidenciasCambiaron) {
        cambios.push({
            tipo: 'evidencias',
            anteriores: { texto: textoEvidenciasAnteriores, cantidad: cantidadAnterior },
            nuevas: { texto: textoEvidenciasNuevas, cantidad: cantidadNueva }
        });
    }

    // Construir el mensaje integral
    let mensaje = `🔄➡️✅ Paso re-completado después de reapertura

📋 Paso: "${pasoNombre}"
⚠️  Motivo de reapertura: ${motivoReapertura}`;

    // Agregar información de cambios realizados
    if (cambios.length > 0) {
        mensaje += `\n\n🔧 Cambios realizados al re-completar:`;

        cambios.forEach(cambio => {
            if (cambio.tipo === 'fecha') {
                mensaje += `\n📅 Fecha modificada:`;
                mensaje += `\n   • Anterior: ${cambio.anterior}`;
                mensaje += `\n   • Nueva: ${cambio.nueva}`;
            } else if (cambio.tipo === 'evidencias') {
                mensaje += `\n📄 Evidencias modificadas:`;
                if (cambio.anteriores.cantidad > 0) {
                    mensaje += `\n   Anteriores (${cambio.anteriores.cantidad}):${cambio.anteriores.texto}`;
                } else {
                    mensaje += `\n   Anteriores: Ninguna`;
                }
                if (cambio.nuevas.cantidad > 0) {
                    mensaje += `\n   Nuevas (${cambio.nuevas.cantidad}):${cambio.nuevas.texto}`;
                } else {
                    mensaje += `\n   Nuevas: Ninguna`;
                }
            }
        });
    } else {
        // No hubo cambios adicionales
        mensaje += `\n\n✅ Se re-completó sin cambios adicionales`;
        if (cantidadNueva > 0) {
            mensaje += `\n📄 Evidencias mantenidas (${cantidadNueva}):${textoEvidenciasNuevas}`;
        }
    }

    mensaje += `\n\n📅 Fecha final de completado: ${formatDisplayDate(fechaNueva)}`;

    return mensaje;
};

const generarMensajeReaperturaIntegral = (pasoNombre, pasoOriginal, pasoActual, pasoConfig) => {
    const motivo = pasoActual.motivoReapertura || 'No especificado';
    const fechaOriginal = formatDisplayDate(pasoOriginal.fecha);

    let mensaje = `🔄 Reapertura completa de paso

📋 Paso: "${pasoNombre}"
⚠️  Motivo: ${motivo}
📅 Fecha original de completado: ${fechaOriginal}`;

    // Analizar cambios realizados durante la reapertura
    const cambios = [];

    // Verificar cambio de fecha
    if (pasoOriginal.fecha !== pasoActual.fecha && pasoActual.fecha) {
        cambios.push({
            tipo: 'fecha',
            anterior: formatDisplayDate(pasoOriginal.fecha),
            nueva: formatDisplayDate(pasoActual.fecha)
        });
    }

    // Verificar cambio de evidencias
    const evidenciasOriginales = pasoOriginal.evidencias || {};
    const evidenciasNuevas = pasoActual.evidencias || {};

    if (JSON.stringify(evidenciasOriginales) !== JSON.stringify(evidenciasNuevas)) {
        const { texto: textoOriginales, cantidad: cantidadOriginal } = construirListaEvidencias(evidenciasOriginales, pasoConfig);
        const { texto: textoNuevas, cantidad: cantidadNueva } = construirListaEvidencias(evidenciasNuevas, pasoConfig);

        cambios.push({
            tipo: 'evidencias',
            anteriores: { texto: textoOriginales, cantidad: cantidadOriginal },
            nuevas: { texto: textoNuevas, cantidad: cantidadNueva }
        });
    }

    // Agregar información de cambios si los hay
    if (cambios.length > 0) {
        mensaje += `\n\n🔧 Cambios realizados durante la reapertura:`;

        cambios.forEach(cambio => {
            if (cambio.tipo === 'fecha') {
                mensaje += `\n📅 Fecha de completado modificada:`;
                mensaje += `\n   • De: ${cambio.anterior}`;
                mensaje += `\n   • A: ${cambio.nueva}`;
            } else if (cambio.tipo === 'evidencias') {
                mensaje += `\n📄 Evidencias modificadas:`;
                if (cambio.anteriores.cantidad > 0) {
                    mensaje += `\n   Anteriores (${cambio.anteriores.cantidad}):${cambio.anteriores.texto}`;
                } else {
                    mensaje += `\n   Anteriores: Ninguna`;
                }
                if (cambio.nuevas.cantidad > 0) {
                    mensaje += `\n   Nuevas (${cambio.nuevas.cantidad}):${cambio.nuevas.texto}`;
                } else {
                    mensaje += `\n   Nuevas: Ninguna`;
                }
            }
        });

        mensaje += `\n\n🔓 El paso permanece abierto para revisión`;
    } else {
        mensaje += `\n\n🔓 El paso fue reabierto sin cambios adicionales`;
    }

    return mensaje;
};

const generarMensajeModificacionIntegral = (pasoNombre, pasoOriginal, pasoActual, pasoConfig, tiposCambios) => {
    let mensaje = `🔧 Modificación de paso completado

📋 Paso: "${pasoNombre}"`;

    tiposCambios.forEach(tipoCambio => {
        if (tipoCambio === 'fecha') {
            mensaje += `\n📅 Fecha modificada:`;
            mensaje += `\n   • Anterior: ${formatDisplayDate(pasoOriginal.fecha)}`;
            mensaje += `\n   • Nueva: ${formatDisplayDate(pasoActual.fecha)}`;
        } else if (tipoCambio === 'evidencias') {
            const { texto: textoOriginales, cantidad: cantidadOriginal } = construirListaEvidencias(pasoOriginal.evidencias || {}, pasoConfig);
            const { texto: textoNuevas, cantidad: cantidadNueva } = construirListaEvidencias(pasoActual.evidencias || {}, pasoConfig);

            mensaje += `\n📄 Evidencias modificadas:`;
            if (cantidadOriginal > 0) {
                mensaje += `\n   Anteriores (${cantidadOriginal}):${textoOriginales}`;
            } else {
                mensaje += `\n   Anteriores: Ninguna`;
            }
            if (cantidadNueva > 0) {
                mensaje += `\n   Nuevas (${cantidadNueva}):${textoNuevas}`;
            } else {
                mensaje += `\n   Nuevas: Ninguna`;
            }
        }
    });

    return mensaje;
};

// Nueva función específica para manejar la reapertura de pasos
export const reabrirPasoProceso = async (clienteId, pasoKey, motivoReapertura) => {
    const clienteRef = doc(db, "clientes", String(clienteId));

    // Obtener el estado actual del cliente
    const clienteSnap = await getDoc(clienteRef);
    if (!clienteSnap.exists()) {
        throw new Error("El cliente no existe.");
    }

    const clienteData = clienteSnap.data();
    const procesoActual = clienteData.proceso || {};
    const pasoActual = procesoActual[pasoKey] || {};

    // Obtener información del paso
    const pasoConfig = PROCESO_CONFIG.find(p => p.key === pasoKey);
    const pasoNombre = pasoConfig ? pasoConfig.label.substring(pasoConfig.label.indexOf('.') + 1).trim() : pasoKey;
    const clienteNombre = toTitleCase(`${clienteData.datosCliente.nombres} ${clienteData.datosCliente.apellidos}`);

    // Crear el nuevo estado del paso (reabierto)
    const nuevoPaso = {
        ...pasoActual,
        completado: false,
        fechaReapertura: new Date().toISOString(),
        motivoReapertura: motivoReapertura,
        estadoAnterior: {
            completado: pasoActual.completado,
            fecha: pasoActual.fecha,
            evidencias: pasoActual.evidencias || {}
        }
    };

    // Actualizar el proceso
    const procesoActualizado = {
        ...procesoActual,
        [pasoKey]: nuevoPaso
    };

    await updateDoc(clienteRef, {
        proceso: procesoActualizado
    });

    // Crear log de auditoría para la reapertura
    const fechaOriginal = formatDisplayDate(pasoActual.fecha);
    const mensajeReapertura = `🔄 Reapertura de paso

📋 Paso: "${pasoNombre}"
⚠️  Motivo: ${motivoReapertura}
📅 Fecha original de completado: ${fechaOriginal}
🔓 El paso fue marcado como pendiente para su revisión`;

    await createAuditLog(mensajeReapertura, {
        action: 'REOPEN_PROCESS_STEP',
        category: 'clientes',
        clienteId: clienteId,
        clienteNombre: clienteNombre,
        pasoReabierto: pasoNombre,
        fechaOriginal: pasoActual.fecha,
        motivoReapertura: motivoReapertura,
        scenario: 'STEP_REOPENED'
    });

    return procesoActualizado;
};

// NUEVA FUNCIÓN CON SISTEMA UNIFICADO
export const updateClienteProcesoUnified = async (clienteId, nuevoProceso, auditMessage, auditDetails) => {
    const clienteRef = doc(db, "clientes", String(clienteId));

    // Obtener el estado original del cliente para comparar el proceso
    const clienteOriginalSnap = await getDoc(clienteRef);
    const clienteOriginal = clienteOriginalSnap.exists() ? clienteOriginalSnap.data() : {};
    const procesoOriginal = clienteOriginal.proceso || {};

    // Actualizar el documento
    await updateDoc(clienteRef, {
        proceso: nuevoProceso
    });

    // Preparar datos contextuales para audit
    const clienteData = {
        id: clienteId,
        nombres: clienteOriginal.datosCliente?.nombres,
        apellidos: clienteOriginal.datosCliente?.apellidos,
        nombre: toTitleCase(`${clienteOriginal.datosCliente?.nombres} ${clienteOriginal.datosCliente?.apellidos}`)
    };

    // Obtener datos de vivienda y proyecto si existen
    let viviendaData = {};
    let proyectoData = {};

    if (clienteOriginal.viviendaId) {
        const viviendaRef = doc(db, "viviendas", String(clienteOriginal.viviendaId));
        const viviendaSnap = await getDoc(viviendaRef);
        if (viviendaSnap.exists()) {
            viviendaData = viviendaSnap.data();

            if (viviendaData.proyectoId) {
                const proyectoRef = doc(db, "proyectos", String(viviendaData.proyectoId));
                const proyectoSnap = await getDoc(proyectoRef);
                if (proyectoSnap.exists()) {
                    proyectoData = proyectoSnap.data();
                }
            }
        }
    }

    // Revisar cada paso del proceso para detectar cambios
    let stepCompletionLogged = false;

    for (const pasoConfig of PROCESO_CONFIG) {
        const key = pasoConfig.key;
        const pasoOriginalData = procesoOriginal[key] || {};
        const pasoActualData = nuevoProceso[key] || {};
        const pasoNombre = pasoConfig.label.substring(pasoConfig.label.indexOf('.') + 1).trim();

        // Verificar si hubo algún cambio en este paso
        const huboComplecion = !pasoOriginalData.completado && pasoActualData.completado;
        const huboReapertura = pasoOriginalData.completado && !pasoActualData.completado;
        const huboCambioFecha = pasoOriginalData.completado && pasoActualData.completado &&
            pasoOriginalData.fecha !== pasoActualData.fecha;
        const huboCambioEvidencias = pasoOriginalData.completado && pasoActualData.completado &&
            JSON.stringify(pasoOriginalData.evidencias || {}) !== JSON.stringify(pasoActualData.evidencias || {});

        // Si no hay cambios, continuar al siguiente paso
        if (!huboComplecion && !huboReapertura && !huboCambioFecha && !huboCambioEvidencias) {
            continue;
        }

        // Mapear evidencias para el audit log
        const mapEvidencias = (evidencias) => {
            if (!evidencias) return [];
            return Object.entries(evidencias).map(([id, evidencia]) => ({
                id,
                nombre: obtenerNombreEvidencia(id, evidencia, pasoConfig),
                displayName: evidencia.displayName || evidencia.nombre,
                tipo: evidencia.tipo || 'archivo',
                url: evidencia.url
            }));
        };

        // Determinar el escenario y crear audit log con estructura unificada
        const tieneMetadatosReapertura = pasoActualData.fechaReapertura || pasoActualData.motivoReapertura || pasoActualData.estadoAnterior;

        let actionType;
        let actionData = {
            pasoId: key,
            pasoNombre: pasoNombre,
            procesoId: pasoConfig.proceso || 'general',
            procesoNombre: 'Proceso de Cliente',
            fechaComplecion: pasoActualData.fecha,
            evidenciasAntes: mapEvidencias(pasoOriginalData.evidencias),
            evidenciasDespues: mapEvidencias(pasoActualData.evidencias),
            esReComplecion: false,
            esPrimeraComplecion: false,
            fechaAnterior: pasoOriginalData.fecha,
            cambioSoloFecha: false,
            cambioSoloEvidencias: false
        };

        if (huboComplecion) {
            // Escenario: Completado por primera vez o re-completado
            const esReCompletado = pasoActualData.estadoAnterior && pasoActualData.fechaReapertura;

            actionType = ACTION_TYPES.CLIENTES.COMPLETE_PROCESS_STEP;
            actionData.esReComplecion = esReCompletado;
            actionData.esPrimeraComplecion = !esReCompletado;

            if (esReCompletado) {
                actionData.motivoReapertura = pasoActualData.motivoReapertura;
                actionData.fechaReapertura = pasoActualData.fechaReapertura;
                actionData.estadoAnterior = pasoActualData.estadoAnterior;
            }

        } else if (huboReapertura) {
            actionType = ACTION_TYPES.CLIENTES.REOPEN_PROCESS_STEP;

        } else if (huboCambioFecha && !huboCambioEvidencias) {
            actionType = ACTION_TYPES.CLIENTES.CHANGE_COMPLETION_DATE;
            actionData.cambioSoloFecha = true;

        } else if (huboCambioEvidencias && !huboCambioFecha) {
            actionType = ACTION_TYPES.CLIENTES.CHANGE_STEP_EVIDENCE;
            actionData.cambioSoloEvidencias = true;

        } else {
            // Cambios múltiples en paso completado
            actionType = ACTION_TYPES.CLIENTES.COMPLETE_PROCESS_STEP;
            actionData.esReComplecion = true;
        }

        // Crear el audit log con estructura unificada
        await createClientAuditLog(
            actionType,
            clienteData,
            {
                viviendaId: clienteOriginal.viviendaId,
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
                actionData: actionData
            }
        );

        stepCompletionLogged = true;
    }

    // Solo crear log general si NO se completó ningún paso (evitar duplicados)
    if (auditMessage && auditDetails && !stepCompletionLogged) {
        await createAuditLog(auditMessage, auditDetails);
    }
};

// FUNCIÓN ORIGINAL (mantener por compatibilidad)
export const updateClienteProceso = async (clienteId, nuevoProceso, auditMessage, auditDetails) => {
    const clienteRef = doc(db, "clientes", String(clienteId));

    // Obtener el estado original del cliente para comparar el proceso
    const clienteOriginalSnap = await getDoc(clienteRef);
    const clienteOriginal = clienteOriginalSnap.exists() ? clienteOriginalSnap.data() : {};
    const procesoOriginal = clienteOriginal.proceso || {};

    // 1. Actualizamos solo el campo 'proceso' del cliente
    await updateDoc(clienteRef, {
        proceso: nuevoProceso
    });

    // 2. Lógica de Auditoría Mejorada
    const clienteNombre = toTitleCase(`${clienteOriginal.datosCliente.nombres} ${clienteOriginal.datosCliente.apellidos}`);

    // Revisar cada paso del proceso para detectar cambios de manera integral
    let stepCompletionLogged = false;

    for (const pasoConfig of PROCESO_CONFIG) {
        const key = pasoConfig.key;
        const pasoOriginalData = procesoOriginal[key] || {};
        const pasoActualData = nuevoProceso[key] || {};
        const pasoNombre = pasoConfig.label.substring(pasoConfig.label.indexOf('.') + 1).trim();

        // Verificar si hubo algún cambio en este paso
        const huboComplecion = !pasoOriginalData.completado && pasoActualData.completado;
        const huboReapertura = pasoOriginalData.completado && !pasoActualData.completado;
        const huboCambioFecha = pasoOriginalData.completado && pasoActualData.completado &&
            pasoOriginalData.fecha !== pasoActualData.fecha;
        const huboCambioEvidencias = pasoOriginalData.completado && pasoActualData.completado &&
            JSON.stringify(pasoOriginalData.evidencias || {}) !== JSON.stringify(pasoActualData.evidencias || {});

        // Si no hay cambios, continuar al siguiente paso
        if (!huboComplecion && !huboReapertura && !huboCambioFecha && !huboCambioEvidencias) {
            continue;
        }

        // Determinar el escenario principal y generar mensaje integral
        let mensajeAuditoria;
        let actionType;
        let scenario;
        let auditDetails = {
            category: 'clientes',
            clienteId: clienteId,
            clienteNombre: clienteNombre,
        };

        // Verificar si el paso tiene metadatos de reapertura (indica que fue reabierto previamente)
        const tieneMetadatosReapertura = pasoActualData.fechaReapertura || pasoActualData.motivoReapertura || pasoActualData.estadoAnterior;

        if (huboComplecion) {
            // ESCENARIO: Completado por primera vez O Re-completado después de reapertura
            const esReCompletado = pasoActualData.estadoAnterior && pasoActualData.fechaReapertura;

            if (esReCompletado) {
                mensajeAuditoria = generarMensajeReCompletado(pasoNombre, pasoOriginalData, pasoActualData, pasoConfig);
                actionType = 'RECOMPLETE_PROCESS_STEP';
                scenario = 'STEP_RECOMPLETED';
                auditDetails = {
                    ...auditDetails,
                    pasoCompletado: pasoNombre,
                    completionDate: pasoActualData.fecha,
                    evidenciasAdjuntas: pasoActualData.evidencias || {},
                    motivoReapertura: pasoActualData.motivoReapertura,
                    fechaReapertura: pasoActualData.fechaReapertura,
                    estadoAnterior: pasoActualData.estadoAnterior,
                    scenario: scenario
                };
            } else {
                mensajeAuditoria = generarMensajeComplecion(pasoNombre, pasoActualData, pasoConfig);
                actionType = 'COMPLETE_PROCESS_STEP';
                scenario = 'FIRST_COMPLETION';
                auditDetails = {
                    ...auditDetails,
                    pasoCompletado: pasoNombre,
                    completionDate: pasoActualData.fecha,
                    evidenciasAdjuntas: pasoActualData.evidencias || {},
                    scenario: scenario
                };
            }
        }
        else if (huboReapertura) {
            // ESCENARIO: Reapertura integral (puede incluir múltiples cambios)
            mensajeAuditoria = generarMensajeReaperturaIntegral(pasoNombre, pasoOriginalData, pasoActualData, pasoConfig);
            actionType = 'REOPEN_PROCESS_STEP_COMPLETE';
            scenario = 'STEP_REOPENED_WITH_CHANGES';
            auditDetails = {
                ...auditDetails,
                pasoReabierto: pasoNombre,
                fechaOriginal: pasoOriginalData.fecha,
                motivoReapertura: pasoActualData.motivoReapertura || 'No especificado',
                cambiosRealizados: {
                    fechaCambio: huboCambioFecha,
                    evidenciasCambio: huboCambioEvidencias
                },
                scenario: scenario
            };
        }
        else if (tieneMetadatosReapertura && (huboCambioFecha || huboCambioEvidencias)) {
            // ESCENARIO: Cambios realizados durante reapertura (tiene metadatos de reapertura)
            const resultadoMensaje = generarMensajeReaperturaConCambios(pasoNombre, pasoOriginalData, pasoActualData, pasoConfig);
            mensajeAuditoria = resultadoMensaje.mensaje || `Se realizó reapertura del paso '${pasoNombre}'`;
            actionType = 'REOPEN_PROCESS_STEP_COMPLETE';
            scenario = 'STEP_REOPENED_WITH_CHANGES';

            // Construir evidenciasAcceso de forma segura
            const evidenciasAcceso = construirAccesoEvidencias(pasoOriginalData.evidencias || {}, pasoActualData.evidencias || {}, pasoConfig);

            auditDetails = {
                ...auditDetails,
                pasoReabierto: pasoNombre,
                fechaOriginal: pasoOriginalData.fecha || '',
                fechaNueva: pasoActualData.fecha || '',
                motivoReapertura: pasoActualData.motivoReapertura || 'No especificado',
                cambiosRealizados: {
                    fechaCambio: huboCambioFecha,
                    evidenciasCambio: huboCambioEvidencias
                },
                evidenciasDetalladas: {
                    originales: pasoOriginalData.evidencias || {},
                    actuales: pasoActualData.evidencias || {}
                },
                scenario: scenario
            };

            // Agregar campos opcionales solo si existen
            if (resultadoMensaje.iconData) {
                auditDetails.iconData = resultadoMensaje.iconData;
            }

            if (evidenciasAcceso && evidenciasAcceso.length > 0) {
                auditDetails.evidenciasAcceso = evidenciasAcceso;
            }
        }
        else if (huboCambioFecha || huboCambioEvidencias) {
            // ESCENARIO: Modificaciones en paso ya completado (cambio de fecha o evidencias)
            const cambios = [];
            if (huboCambioFecha) cambios.push('fecha');
            if (huboCambioEvidencias) cambios.push('evidencias');

            // Determinar el tipo específico de modificación
            if (huboCambioFecha && !huboCambioEvidencias) {
                // Solo cambio de fecha
                const resultadoMensaje = generarMensajeCambioFecha(pasoNombre, pasoOriginalData, pasoActualData, pasoConfig);
                mensajeAuditoria = resultadoMensaje.mensaje;
                actionType = 'CHANGE_COMPLETION_DATE';
                scenario = 'DATE_MODIFIED';
                if (resultadoMensaje.iconData) {
                    auditDetails.iconData = resultadoMensaje.iconData;
                }
            } else if (!huboCambioFecha && huboCambioEvidencias) {
                // Solo cambio de evidencias
                const resultadoMensaje = generarMensajeCambioEvidencias(pasoNombre, pasoOriginalData, pasoActualData, pasoConfig);
                mensajeAuditoria = resultadoMensaje.mensaje;
                actionType = 'CHANGE_STEP_EVIDENCE';
                scenario = 'EVIDENCE_MODIFIED';
                if (resultadoMensaje.iconData) {
                    auditDetails.iconData = resultadoMensaje.iconData;
                }
            } else {
                // Cambio de fecha Y evidencias
                mensajeAuditoria = generarMensajeModificacionIntegral(pasoNombre, pasoOriginalData, pasoActualData, pasoConfig, cambios);
                actionType = 'MODIFY_COMPLETED_STEP';
                scenario = 'STEP_MODIFIED';
            }

            auditDetails = {
                ...auditDetails,
                pasoModificado: pasoNombre,
                cambiosRealizados: cambios,
                fechaOriginal: pasoOriginalData.fecha || '',
                fechaNueva: pasoActualData.fecha || '',
                evidenciasOriginales: pasoOriginalData.evidencias || {},
                evidenciasNuevas: pasoActualData.evidencias || {},
                scenario: scenario
            };

            // Agregar acceso a evidencias si hay cambios
            if (huboCambioEvidencias) {
                const evidenciasAcceso = construirAccesoEvidencias(pasoOriginalData.evidencias || {}, pasoActualData.evidencias || {}, pasoConfig);
                if (evidenciasAcceso && evidenciasAcceso.length > 0) {
                    auditDetails.evidenciasAcceso = evidenciasAcceso;
                }
            }
        }

        await createAuditLog(mensajeAuditoria, auditDetails);
        stepCompletionLogged = true;
    }

    // Solo crear log general si NO se completó ningún paso (evitar duplicados)
    if (auditMessage && auditDetails && !stepCompletionLogged) {
        await createAuditLog(auditMessage, auditDetails);
    }
};

export const addNotaToHistorial = async (clienteId, nota, userName) => {
    if (!nota || !nota.trim()) {
        throw new Error("La nota no puede estar vacía.");
    }

    // Obtenemos los datos del cliente para el mensaje de auditoría
    const clienteRef = doc(db, "clientes", clienteId);
    const clienteSnap = await getDoc(clienteRef);
    const clienteNombre = clienteSnap.exists() ? toTitleCase(`${clienteSnap.data().datosCliente.nombres} ${clienteSnap.data().datosCliente.apellidos}`) : '';

    // 1. Creamos un mensaje CORTO para el log general
    const auditMessage = `Añadió una nota al historial del cliente ${clienteNombre}`;

    // 2. Guardamos la NOTA COMPLETA dentro de los detalles
    await createAuditLog(
        auditMessage,
        {
            action: 'ADD_NOTE',
            clienteId: clienteId,
            clienteNombre: clienteNombre,
            nota: nota, // <-- Aquí guardamos el contenido de la nota
        }
    );
};

export const updateNotaHistorial = async (notaOriginal, nuevoTexto, userName) => {
    // La 'notaOriginal' es el objeto 'log' completo
    const notaRef = doc(db, "audits", notaOriginal.id);

    // 1. Actualizamos el mensaje de la nota original y añadimos la marca de edición
    await updateDoc(notaRef, {
        message: nuevoTexto,
        editado: true,
        fechaEdicion: new Date(),
        editadoPor: userName
    });

    const clienteNombre = notaOriginal.details.clienteNombre || '[Cliente no encontrado]';

    // Creamos el nuevo registro de auditoría para la acción de editar.
    await createAuditLog(
        `Editó una nota en el historial del cliente ${clienteNombre}`,
        {
            action: 'EDIT_NOTE',
            clienteId: notaOriginal.details.clienteId,
            notaId: notaOriginal.id,
            cambios: [{
                campo: "Contenido de la Nota",
                anterior: notaOriginal.message,
                actual: nuevoTexto
            }]
        }
    );
};

/**
 * Transfiere un cliente de una vivienda a otra, actualizando todos los registros implicados.
 * @param {object} params - Parámetros para la transferencia.
 * @param {string} params.clienteId - ID del cliente a transferir.
 * @param {string} params.viviendaOriginalId - ID de la vivienda que el cliente deja.
 * @param {string} params.nuevaViviendaId - ID de la nueva vivienda que ocupará el cliente.
 * @param {string} params.motivo - Razón de negocio para la transferencia.
 * @param {object} params.nuevoPlanFinanciero - El nuevo objeto financiero para el cliente.
 * @param {string} params.nombreCliente - Nombre completo del cliente para el log.
 */
export const transferirViviendaCliente = async ({ clienteId, viviendaOriginalId, nuevaViviendaId, motivo, nuevoPlanFinanciero, nombreCliente }) => {
    try {
        const clienteRef = doc(db, 'clientes', clienteId);
        const nuevaViviendaRef = doc(db, 'viviendas', nuevaViviendaId);

        // --- INICIO DE LA MODIFICACIÓN 1: Leer datos originales del cliente ---
        // Necesitamos el estado del cliente ANTES de hacer cualquier cambio.
        const clienteOriginalSnap = await getDoc(clienteRef);
        if (!clienteOriginalSnap.exists()) {
            throw new Error("El cliente a transferir no existe.");
        }
        const clienteOriginal = clienteOriginalSnap.data();
        // --- FIN DE LA MODIFICACIÓN 1 ---

        const nuevaViviendaSnap = await getDoc(nuevaViviendaRef);

        if (!nuevaViviendaSnap.exists()) {
            throw new Error("La nueva vivienda seleccionada no existe.");
        }
        if (nuevaViviendaSnap.data().clienteId) {
            throw new Error("Esta vivienda ya fue ocupada por otro cliente. Por favor, refresque y seleccione otra.");
        }
        const nuevaViviendaData = nuevaViviendaSnap.data();

        const abonosQuery = query(
            collection(db, "abonos"),
            where("clienteId", "==", clienteId),
            where("estadoProceso", "==", "activo")
        );
        const abonosASincronizar = await getDocs(abonosQuery);

        const nuevoProceso = {};
        PROCESO_CONFIG.forEach(paso => {
            if (paso.aplicaA(nuevoPlanFinanciero)) {
                const evidencias = {};
                paso.evidenciasRequeridas.forEach(ev => {
                    evidencias[ev.id] = { url: null, estado: 'pendiente' };
                });
                nuevoProceso[paso.key] = { completado: false, fecha: null, evidencias, archivado: false };
            }
        });

        const batch = writeBatch(db);

        batch.update(clienteRef, {
            viviendaId: nuevaViviendaId,
            financiero: nuevoPlanFinanciero,
            proceso: nuevoProceso
        });

        if (viviendaOriginalId) {
            const viviendaOriginalRef = doc(db, 'viviendas', viviendaOriginalId);
            batch.update(viviendaOriginalRef, { clienteId: null, clienteNombre: "" });
        }

        batch.update(nuevaViviendaRef, {
            clienteId: clienteId,
            clienteNombre: nombreCliente
        });

        abonosASincronizar.forEach((abonoDoc) => {
            batch.update(abonoDoc.ref, { viviendaId: nuevaViviendaId });
        });

        await batch.commit();

        const auditMessage = `Transfirió al cliente ${nombreCliente} a una nueva vivienda.`;
        const auditDetails = {
            action: 'TRANSFER_CLIENT',
            clienteId: clienteId,
            clienteNombre: nombreCliente,
            motivo,
            viviendaAnterior: viviendaOriginalId || 'Ninguna',
            viviendaNueva: {
                id: nuevaViviendaId,
                ubicacion: `Mz ${nuevaViviendaData.manzana} - Casa ${nuevaViviendaData.numeroCasa}`,
            },
            // --- INICIO DE LA MODIFICACIÓN 2: Guardar ambos planes financieros ---
            snapshotAntiguoPlanFinanciero: clienteOriginal.financiero || {},
            snapshotNuevoPlanFinanciero: nuevoPlanFinanciero
            // --- FIN DE LA MODIFICACIÓN 2 ---
        };
        await createAuditLog(auditMessage, auditDetails);

    } catch (error) {
        console.error("Error en la operación de transferencia de vivienda: ", error);
        throw error;
    }
};

// Helper: Generar mensaje para cambio de fecha en paso completado
const generarMensajeCambioFecha = (pasoNombre, pasoOriginal, pasoActual, pasoConfig) => {
    const fechaOriginal = formatDisplayDate(pasoOriginal.fecha);
    const fechaNueva = formatDisplayDate(pasoActual.fecha);

    let mensaje = `Se modificó la fecha de completado del paso '${pasoNombre}'`;
    mensaje += `\n\nFecha de completado: ${fechaOriginal} → ${fechaNueva}`;

    const evidencias = pasoActual.evidencias || {};
    const { texto: listaEvidencias } = construirListaEvidencias(evidencias, pasoConfig);
    if (listaEvidencias) {
        mensaje += `\nEvidencias: ${listaEvidencias}`;
    }

    return {
        mensaje,
        iconData: {
            mainIcon: 'Calendar',
            sections: {
                fecha: 'Calendar',
                evidencias: 'FileText'
            }
        }
    };
};

// Helper: Generar mensaje para cambio de evidencias en paso completado
const generarMensajeCambioEvidencias = (pasoNombre, pasoOriginal, pasoActual, pasoConfig) => {
    const fecha = formatDisplayDate(pasoActual.fecha);

    let mensaje = `Se modificaron las evidencias del paso completado '${pasoNombre}'`;
    mensaje += `\n\nFecha de completado: ${fecha}`;

    // Analizar cambios específicos en evidencias
    const cambiosEvidencias = analizarCambiosEvidenciasSinEmojis(pasoOriginal.evidencias || {}, pasoActual.evidencias || {}, pasoConfig);
    if (cambiosEvidencias.length > 0) {
        mensaje += `\n\nCambios en evidencias:\n${cambiosEvidencias.join('\n')}`;
    }

    return {
        mensaje,
        iconData: {
            mainIcon: 'FileText',
            sections: {
                fecha: 'Calendar',
                evidencias: 'FileText'
            }
        }
    };
};

// Helper: Generar mensaje para reapertura con cambios posteriores
const generarMensajeReaperturaConCambios = (pasoNombre, pasoOriginal, pasoActual, pasoConfig) => {
    const fechaOriginal = formatDisplayDate(pasoOriginal.fecha);
    const fechaNueva = formatDisplayDate(pasoActual.fecha);

    let mensaje = `Se realizó reapertura del paso '${pasoNombre}'`;

    // Indicar motivo de reapertura
    if (pasoActual.motivoReapertura) {
        mensaje += `\n\nMotivo de reapertura: ${pasoActual.motivoReapertura}`;
    }

    // Mostrar cambios específicos
    const cambios = [];

    if (pasoOriginal.fecha !== pasoActual.fecha) {
        cambios.push(`Fecha de paso completado: ${fechaOriginal} → ${fechaNueva}`);
    }

    const evidenciasOriginales = pasoOriginal.evidencias || {};
    const evidenciasActuales = pasoActual.evidencias || {};

    if (JSON.stringify(evidenciasOriginales) !== JSON.stringify(evidenciasActuales)) {
        // Analizar cambios específicos en evidencias para auditoría detallada
        const cambiosEvidencias = analizarCambiosEvidenciasSinEmojis(evidenciasOriginales, evidenciasActuales, pasoConfig);
        if (cambiosEvidencias.length > 0) {
            cambios.push(`Evidencias modificadas:\n${cambiosEvidencias.join('\n')}`);
        }
    }

    if (cambios.length > 0) {
        mensaje += `\n\nCambios realizados en la reapertura del paso:\n${cambios.join('\n')}`;
    }

    return {
        mensaje,
        iconData: {
            mainIcon: 'RotateCcw',
            sections: {
                motivo: 'AlertTriangle',
                cambios: 'Settings',
                fecha: 'Calendar',
                evidencias: 'FileText'
            }
        }
    };
};

// Helper: Analizar cambios específicos en evidencias para auditoría detallada con acceso completo a archivos
const analizarCambiosEvidenciasDetallado = (evidenciasOriginales, evidenciasActuales, pasoConfig) => {
    const cambios = [];
    const tiposOriginales = Object.keys(evidenciasOriginales);
    const tiposActuales = Object.keys(evidenciasActuales);
    const todosTipos = [...new Set([...tiposOriginales, ...tiposActuales])];

    todosTipos.forEach(tipo => {
        const evidenciaOriginal = evidenciasOriginales[tipo];
        const evidenciaActual = evidenciasActuales[tipo];
        const nombreTipo = obtenerNombreEvidencia(tipo, evidenciaActual || evidenciaOriginal, pasoConfig);

        if (!evidenciaOriginal && evidenciaActual) {
            // Evidencia añadida
            const detalleNueva = construirDetalleEvidencia(evidenciaActual);
            cambios.push(`   ➕ Agregada: ${nombreTipo}`);
            cambios.push(`      📄 Nueva: ${detalleNueva}`);
        } else if (evidenciaOriginal && !evidenciaActual) {
            // Evidencia eliminada
            const detalleAnterior = construirDetalleEvidencia(evidenciaOriginal);
            cambios.push(`   ➖ Eliminada: ${nombreTipo}`);
            cambios.push(`      📄 Anterior: ${detalleAnterior}`);
        } else if (evidenciaOriginal && evidenciaActual) {
            // Verificar si el archivo cambió (comparando propiedades detalladas)
            const cambioDetectado = detectarCambioEvidencia(evidenciaOriginal, evidenciaActual);

            if (cambioDetectado) {
                const detalleAnterior = construirDetalleEvidencia(evidenciaOriginal);
                const detalleNuevo = construirDetalleEvidencia(evidenciaActual);

                cambios.push(`   🔄 Reemplazada: ${nombreTipo}`);
                cambios.push(`      📋 Anterior: ${detalleAnterior}`);
                cambios.push(`      📑 Nueva: ${detalleNuevo}`);
            }
        }
    });

    return cambios;
};

// Helper: Analizar cambios específicos en evidencias SIN EMOJIS (para renderizado con iconos React)
const analizarCambiosEvidenciasSinEmojis = (evidenciasOriginales, evidenciasActuales, pasoConfig) => {
    const cambios = [];
    const tiposOriginales = Object.keys(evidenciasOriginales);
    const tiposActuales = Object.keys(evidenciasActuales);
    const todosTipos = [...new Set([...tiposOriginales, ...tiposActuales])];

    todosTipos.forEach(tipo => {
        const evidenciaOriginal = evidenciasOriginales[tipo];
        const evidenciaActual = evidenciasActuales[tipo];
        const nombreTipo = obtenerNombreEvidencia(tipo, evidenciaActual || evidenciaOriginal, pasoConfig);

        if (!evidenciaOriginal && evidenciaActual) {
            // Evidencia añadida
            const detalleNueva = construirDetalleEvidencia(evidenciaActual);
            cambios.push(`   Agregada: ${nombreTipo}`);
            cambios.push(`      Nueva: ${detalleNueva}`);
        } else if (evidenciaOriginal && !evidenciaActual) {
            // Evidencia eliminada
            const detalleAnterior = construirDetalleEvidencia(evidenciaOriginal);
            cambios.push(`   Eliminada: ${nombreTipo}`);
            cambios.push(`      Anterior: ${detalleAnterior}`);
        } else if (evidenciaOriginal && evidenciaActual) {
            // Verificar si el archivo cambió (comparando propiedades detalladas)
            const cambioDetectado = detectarCambioEvidencia(evidenciaOriginal, evidenciaActual);

            if (cambioDetectado) {
                const detalleAnterior = construirDetalleEvidencia(evidenciaOriginal);
                const detalleNuevo = construirDetalleEvidencia(evidenciaActual);

                cambios.push(`   Reemplazada: ${nombreTipo}`);
                cambios.push(`      Anterior: ${detalleAnterior}`);
                cambios.push(`      Nueva: ${detalleNuevo}`);
            }
        }
    });

    return cambios;
};

// Helper: Construir detalle completo de evidencia para auditoría
const construirDetalleEvidencia = (evidencia) => {
    if (!evidencia) return 'Sin evidencia';

    const nombre = evidencia.nombre || evidencia.fileName || 'Archivo sin nombre';
    const tamaño = evidencia.size ? `(${formatearTamañoArchivo(evidencia.size)})` : '';
    const tipo = evidencia.type || (evidencia.fileName ? evidencia.fileName.split('.').pop()?.toUpperCase() : '');
    const fecha = evidencia.lastModified ? ` - ${formatDisplayDate(new Date(evidencia.lastModified))}` : '';

    return `${nombre} ${tipo ? `[${tipo}]` : ''} ${tamaño}${fecha}`.trim();
};

// Helper: Detectar si hubo cambio real en evidencia
const detectarCambioEvidencia = (evidenciaOriginal, evidenciaActual) => {
    const propiedadesAComparar = ['nombre', 'fileName', 'size', 'type', 'lastModified', 'url', 'downloadURL'];

    return propiedadesAComparar.some(prop => {
        return evidenciaOriginal[prop] !== evidenciaActual[prop];
    });
};

// Helper: Formatear tamaño de archivo
const formatearTamañoArchivo = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Helper para filtrar propiedades undefined de un objeto
const limpiarObjetoPropiedades = (obj) => {
    const objetoLimpio = {};
    for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined && value !== null) {
            objetoLimpio[key] = value;
        }
    }
    return objetoLimpio;
};

// Helper: Construir acceso directo a evidencias para componente frontend
const construirAccesoEvidencias = (evidenciasOriginales, evidenciasActuales, pasoConfig) => {
    try {
        const accesos = [];
        const tiposOriginales = Object.keys(evidenciasOriginales || {});
        const tiposActuales = Object.keys(evidenciasActuales || {});
        const todosTipos = [...new Set([...tiposOriginales, ...tiposActuales])];

        todosTipos.forEach(tipo => {
            const evidenciaOriginal = evidenciasOriginales?.[tipo];
            const evidenciaActual = evidenciasActuales?.[tipo];
            const nombreTipo = obtenerNombreEvidencia(tipo, evidenciaActual || evidenciaOriginal, pasoConfig) || 'Evidencia';

            if (!evidenciaOriginal && evidenciaActual) {
                // Evidencia añadida - solo nueva disponible
                const archivoNuevo = limpiarObjetoPropiedades({
                    nombre: evidenciaActual.nombre || evidenciaActual.fileName || 'Archivo nuevo',
                    url: evidenciaActual.downloadURL || evidenciaActual.url,
                    size: evidenciaActual.size,
                    type: evidenciaActual.type,
                    lastModified: evidenciaActual.lastModified
                });

                if (archivoNuevo.url) { // Solo agregar si hay URL válida
                    accesos.push({
                        tipo: 'AGREGADA',
                        tipoEvidencia: tipo || 'unknown',
                        nombreTipo,
                        archivoNuevo,
                        archivoAnterior: null
                    });
                }
            } else if (evidenciaOriginal && !evidenciaActual) {
                // Evidencia eliminada - solo anterior disponible
                const archivoAnterior = limpiarObjetoPropiedades({
                    nombre: evidenciaOriginal.nombre || evidenciaOriginal.fileName || 'Archivo anterior',
                    url: evidenciaOriginal.downloadURL || evidenciaOriginal.url,
                    size: evidenciaOriginal.size,
                    type: evidenciaOriginal.type,
                    lastModified: evidenciaOriginal.lastModified
                });

                if (archivoAnterior.url) { // Solo agregar si hay URL válida
                    accesos.push({
                        tipo: 'ELIMINADA',
                        tipoEvidencia: tipo || 'unknown',
                        nombreTipo,
                        archivoNuevo: null,
                        archivoAnterior
                    });
                }
            } else if (evidenciaOriginal && evidenciaActual) {
                // Verificar si realmente cambió
                const cambioDetectado = detectarCambioEvidencia(evidenciaOriginal, evidenciaActual);

                if (cambioDetectado) {
                    const archivoNuevo = limpiarObjetoPropiedades({
                        nombre: evidenciaActual.nombre || evidenciaActual.fileName || 'Archivo nuevo',
                        url: evidenciaActual.downloadURL || evidenciaActual.url,
                        size: evidenciaActual.size,
                        type: evidenciaActual.type,
                        lastModified: evidenciaActual.lastModified
                    });

                    const archivoAnterior = limpiarObjetoPropiedades({
                        nombre: evidenciaOriginal.nombre || evidenciaOriginal.fileName || 'Archivo anterior',
                        url: evidenciaOriginal.downloadURL || evidenciaOriginal.url,
                        size: evidenciaOriginal.size,
                        type: evidenciaOriginal.type,
                        lastModified: evidenciaOriginal.lastModified
                    });

                    // Solo agregar si al menos uno de los archivos tiene URL
                    if (archivoNuevo.url || archivoAnterior.url) {
                        accesos.push({
                            tipo: 'REEMPLAZADA',
                            tipoEvidencia: tipo || 'unknown',
                            nombreTipo,
                            archivoNuevo: archivoNuevo.url ? archivoNuevo : null,
                            archivoAnterior: archivoAnterior.url ? archivoAnterior : null
                        });
                    }
                }
            }
        });

        return accesos;
    } catch (error) {
        console.error('Error construyendo acceso a evidencias:', error);
        return []; // Devolver array vacío en caso de error
    }
};

