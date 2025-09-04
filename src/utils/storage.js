import { db, auth } from '../firebase/config';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, runTransaction, getDoc, writeBatch, setDoc, query, where, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { toSentenceCase, formatCurrency, toTitleCase, getTodayString, formatDisplayDate } from './textFormatters';
import { PROCESO_CONFIG, FUENTE_PROCESO_MAP } from './procesoConfig.js';
import { DOCUMENTACION_CONFIG } from './documentacionConfig.js';

export const createNotification = async (type, message, link = '#') => {
    const notificationsCol = collection(db, 'notifications');
    try {
        await addDoc(notificationsCol, {
            type,
            message,
            link,
            read: false,
            timestamp: serverTimestamp()
        });
    } catch (error) {
        console.error("Error al crear la notificación:", error);
    }
};

const getData = async (collectionName) => {
    const collectionRef = collection(db, collectionName);
    const querySnapshot = await getDocs(collectionRef);
    const data = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    return data;
};

export const getViviendas = () => getData("viviendas");
export const getClientes = () => getData("clientes");
export const getAbonos = () => getData("abonos");
export const getRenuncias = () => getData("renuncias");
export const getProyectos = () => getData("proyectos");

const storage = getStorage();

export const uploadFile = (file, path, onProgress) => {
    return new Promise((resolve, reject) => {
        const storageRef = ref(storage, path);
        const uploadTask = uploadBytesResumable(storageRef, file);
        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                if (onProgress) onProgress(progress);
            },
            (error) => {
                console.error("Error al subir archivo:", error);
                reject(error);
            },
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(downloadURL);
            }
        );
    });
};

export const deleteFile = async (filePath) => {
    const fileRef = ref(storage, filePath);
    await deleteObject(fileRef);
};

export const addVivienda = async (viviendaData) => {
    const valorTotalFinal = viviendaData.valorTotal;
    const nuevaVivienda = {
        ...viviendaData,
        status: 'disponible',
        nomenclatura: toSentenceCase(viviendaData.nomenclatura),
        linderoNorte: toSentenceCase(viviendaData.linderoNorte),
        linderoSur: toSentenceCase(viviendaData.linderoSur),
        linderoOriente: toSentenceCase(viviendaData.linderoOriente),
        linderoOccidente: toSentenceCase(viviendaData.linderoOccidente),
        areaLote: parseFloat(String(viviendaData.areaLote).replace(',', '.')) || 0,
        areaConstruida: parseFloat(String(viviendaData.areaConstruida).replace(',', '.')) || 0,
        clienteId: null,
        clienteNombre: "",
        totalAbonado: 0,
        saldoPendiente: valorTotalFinal,
        valorFinal: valorTotalFinal,
    };
    await addDoc(collection(db, "viviendas"), nuevaVivienda);
};

export const archiveVivienda = async (vivienda, nombreProyecto) => {
    if (vivienda.clienteId) {
        throw new Error("No se puede archivar una vivienda que está asignada a un cliente.");
    }

    const viviendaRef = doc(db, "viviendas", vivienda.id);

    await updateDoc(viviendaRef, {
        status: 'archivada',
        fechaArchivado: new Date().toISOString()
    });

    const nombreVivienda = `Mz ${vivienda.manzana} - Casa ${vivienda.numeroCasa}`;
    await createAuditLog(
        `Archivó la vivienda ${nombreVivienda} del proyecto ${nombreProyecto}`,
        {
            action: 'ARCHIVE_VIVIENDA',
            viviendaId: vivienda.id,
            viviendaNombre: nombreVivienda,
            proyectoNombre: nombreProyecto, // <-- Agregamos el nombre del proyecto
            details: 'La vivienda fue marcada como archivada y no será visible en la lista principal.'
        }
    );
};

export const restoreVivienda = async (vivienda, nombreProyecto) => {
    // Regla de negocio: solo se pueden restaurar viviendas archivadas.
    if (vivienda.status !== 'archivada') {
        throw new Error("Esta vivienda no está archivada y no puede ser restaurada.");
    }

    const viviendaRef = doc(db, "viviendas", vivienda.id);

    // Actualizamos el estado de la vivienda a 'disponible'
    await updateDoc(viviendaRef, {
        status: 'disponible',
        fechaRestaurado: new Date().toISOString()
    });

    // Creamos el registro de auditoría
    const nombreVivienda = `Mz ${vivienda.manzana} - Casa ${vivienda.numeroCasa}`;
    await createAuditLog(
        `Restauró la vivienda ${nombreVivienda} del proyecto ${nombreProyecto} `,
        {
            action: 'RESTORE_VIVIENDA',
            viviendaId: vivienda.id,
            viviendaNombre: nombreVivienda,
            proyectoNombre: nombreProyecto,
            details: 'La vivienda fue restaurada y ahora está disponible en la lista principal.'
        }
    );
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

export const addProyecto = async (proyectoData) => {
    const proyectoParaGuardar = {
        nombre: toTitleCase(proyectoData.nombre),
        fechaCreacion: serverTimestamp(),
    };

    // 1. Se crea el documento del proyecto en Firestore
    const docRef = await addDoc(collection(db, "proyectos"), proyectoParaGuardar);

    // --- INICIO DE LA MODIFICACIÓN ---
    // 2. Se crea el registro de auditoría inmediatamente después
    await createAuditLog(
        `Creó el proyecto "${proyectoParaGuardar.nombre}"`,
        {
            action: 'CREATE_PROJECT',
            proyectoId: docRef.id, // Guardamos el ID del nuevo proyecto
            proyectoNombre: proyectoParaGuardar.nombre
        }
    );
    // --- FIN DE LA MODIFICACIÓN ---
};

// src/utils/storage.js

export const updateProyecto = async (proyectoId, datosNuevos) => {
    const proyectoRef = doc(db, "proyectos", proyectoId);

    // 1. Extraemos el nombre y los cambios del objeto que recibimos.
    const { nombre, cambios } = datosNuevos;

    // 2. Actualizamos el documento con el nuevo nombre.
    await updateDoc(proyectoRef, {
        nombre: toTitleCase(nombre)
    });

    // 3. Creamos el registro de auditoría con los cambios.
    await createAuditLog(
        `Actualizó el proyecto "${toTitleCase(nombre)}"`,
        {
            action: 'UPDATE_PROJECT',
            proyectoId: proyectoId,
            cambios: cambios
        }
    );
};

export const deleteProyecto = async (proyectoId, viviendas) => {
    // Regla de negocio: Verificar si hay viviendas asociadas a este proyecto
    const viviendasEnProyecto = viviendas.filter(v => v.proyectoId === proyectoId);
    if (viviendasEnProyecto.length > 0) {
        // Si hay viviendas, lanzamos un error para detener la eliminación
        throw new Error('PROYECTO_CON_VIVIENDAS');
    }

    // Si no hay viviendas, procedemos a eliminar
    const proyectoRef = doc(db, "proyectos", proyectoId);
    const proyectoSnap = await getDoc(proyectoRef);
    const proyectoData = proyectoSnap.data();

    await deleteDoc(proyectoRef);

    await createAuditLog(
        `Eliminó permanentemente el proyecto "${proyectoData.nombre}"`,
        {
            action: 'DELETE_PROJECT',
            proyectoId: proyectoId,
            proyectoNombre: proyectoData.nombre
        }
    );
};

export const addAbonoAndUpdateProceso = async (abonoData, cliente, proyecto, userName) => {
    const viviendaRef = doc(db, "viviendas", abonoData.viviendaId);
    const clienteRef = doc(db, "clientes", abonoData.clienteId);
    const abonoRef = doc(collection(db, "abonos"));

    const { viviendaData, clienteNombre } = await runTransaction(db, async (transaction) => {
        const viviendaDoc = await transaction.get(viviendaRef);
        const clienteDoc = await transaction.get(clienteRef);
        if (!viviendaDoc.exists() || !clienteDoc.exists()) throw new Error("El cliente o la vivienda ya no existen.");

        const transViviendaData = viviendaDoc.data();
        const transClienteData = clienteDoc.data();

        const pasoConfig = FUENTE_PROCESO_MAP[abonoData.fuente];
        if (pasoConfig) {
            const solicitudKey = pasoConfig.solicitudKey;
            const pasoSolicitud = transClienteData.proceso?.[solicitudKey];
            if (pasoSolicitud && !pasoSolicitud.completado) throw new Error('SOLICITUD_PENDIENTE');
        }

        const nuevoTotalAbonado = (transViviendaData.totalAbonado || 0) + abonoData.monto;
        const nuevoSaldo = transViviendaData.valorFinal - nuevoTotalAbonado;

        const abonoParaGuardar = { ...abonoData, id: abonoRef.id, estadoProceso: 'activo', timestampCreacion: new Date() };

        transaction.update(viviendaRef, { totalAbonado: nuevoTotalAbonado, saldoPendiente: nuevoSaldo });
        transaction.set(abonoRef, abonoParaGuardar);

        if (pasoConfig) {
            const desembolsoKey = pasoConfig.desembolsoKey;
            const evidenciaId = pasoConfig.evidenciaId;
            const nuevoProceso = { ...transClienteData.proceso };

            if (!nuevoProceso[desembolsoKey]) nuevoProceso[desembolsoKey] = { evidencias: {}, actividad: [] };
            if (!nuevoProceso[desembolsoKey].evidencias) nuevoProceso[desembolsoKey].evidencias = {};
            if (!nuevoProceso[desembolsoKey].actividad) nuevoProceso[desembolsoKey].actividad = [];

            nuevoProceso[desembolsoKey].completado = true;
            nuevoProceso[desembolsoKey].fecha = abonoData.fechaPago;
            nuevoProceso[desembolsoKey].evidencias[evidenciaId] = { url: abonoData.urlComprobante, estado: 'subido' };

            const entradaHistorial = {
                mensaje: `Desembolso registrado por ${formatCurrency(abonoData.monto)}. El paso se completó automáticamente.`,
                userName: userName || 'Sistema',
                fecha: new Date()
            };
            nuevoProceso[desembolsoKey].actividad.push(entradaHistorial);
            transaction.update(clienteRef, { proceso: nuevoProceso });
        }
        return {
            viviendaData: transViviendaData,
            clienteNombre: toTitleCase(`${transClienteData.datosCliente.nombres} ${transClienteData.datosCliente.apellidos}`)
        };
    });
    const message = `Nuevo abono de ${formatCurrency(abonoData.monto)} para la vivienda Mz ${viviendaData.manzana} - Casa ${viviendaData.numeroCasa}`;
    await createNotification('abono', message, `/viviendas/detalle/${abonoData.viviendaId}`);

    await createAuditLog(
        `Registró desembolso de "${abonoData.metodoPago}" para ${clienteNombre}`,
        {
            action: 'REGISTER_DISBURSEMENT',
            cliente: { id: abonoData.clienteId, nombre: clienteNombre },
            vivienda: { id: viviendaData.id, display: `Mz ${viviendaData.manzana} - Casa ${viviendaData.numeroCasa}` },
            proyecto: { id: proyecto.id, nombre: proyecto.nombre },
            abono: { monto: formatCurrency(abonoData.monto), fechaPago: formatDisplayDate(abonoData.fechaPago), fuente: abonoData.fuente }
        }
    );
};

export const updateVivienda = async (id, datosActualizados, auditContext) => {
    const viviendaRef = doc(db, "viviendas", String(id));
    const viviendaSnap = await getDoc(viviendaRef);

    if (!viviendaSnap.exists()) {
        throw new Error("La vivienda no existe.");
    }

    const viviendaOriginal = viviendaSnap.data();

    // --- INICIO DE LA REFRACTORIZACIÓN ---
    // 1. Preparamos un único objeto 'datosFinales' con todas las transformaciones.
    let datosFinales = { ...datosActualizados };

    // Regla de negocio: Protección de campos financieros si ya tiene un cliente.
    if (viviendaOriginal.clienteId) {
        datosFinales.valorBase = viviendaOriginal.valorBase;
        datosFinales.recargoEsquinera = viviendaOriginal.recargoEsquinera;
        datosFinales.valorTotal = viviendaOriginal.valorTotal;

        if (datosFinales.proyectoId !== viviendaOriginal.proyectoId) {
            console.warn("Intento de cambio de proyecto bloqueado para vivienda asignada.");
            datosFinales.proyectoId = viviendaOriginal.proyectoId;
        }
    }

    // Conversión de tipos y cálculos necesarios.
    if (datosFinales.areaLote !== undefined) {
        datosFinales.areaLote = parseFloat(String(datosFinales.areaLote).replace(',', '.')) || 0;
    }
    if (datosFinales.areaConstruida !== undefined) {
        datosFinales.areaConstruida = parseFloat(String(datosFinales.areaConstruida).replace(',', '.')) || 0;
    }
    if (datosFinales.valorTotal !== undefined || datosFinales.descuentoMonto !== undefined) {
        const nuevoValorTotal = datosFinales.valorTotal !== undefined ? datosFinales.valorTotal : viviendaOriginal.valorTotal;
        const nuevoDescuento = datosFinales.descuentoMonto !== undefined ? datosFinales.descuentoMonto : (viviendaOriginal.descuentoMonto || 0);
        datosFinales.valorFinal = nuevoValorTotal - nuevoDescuento;
        datosFinales.saldoPendiente = datosFinales.valorFinal - (viviendaOriginal.totalAbonado || 0);
    }

    const cambios = [];

    const formatAuditValue = (key, value) => {
        if (value === null || typeof value === 'undefined') return 'No definido';
        if (key === 'esEsquinera') return value ? 'Sí' : 'No';
        if (key === 'urlCertificadoTradicion') return value ? 'Documento Anexado' : 'Sin Documento';
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
    };

    Object.keys(datosFinales).forEach(key => {
        if (viviendaOriginal[key] !== datosFinales[key]) {
            // 👇 3. Lógica especial para el proyecto usando el contexto
            if (key === 'proyectoId') {
                cambios.push({
                    campo: 'Proyecto', // Usamos un nombre legible directamente
                    anterior: auditContext.proyectoAnteriorNombre,
                    actual: auditContext.proyectoActualNombre
                });
            } else {
                cambios.push({
                    campo: key,
                    anterior: formatAuditValue(key, viviendaOriginal[key]),
                    actual: formatAuditValue(key, datosFinales[key])
                });
            }
        }
    });

    await updateDoc(viviendaRef, datosFinales);


    if (cambios.length > 0) {
        const nombreVivienda = `Mz ${viviendaOriginal.manzana} - Casa ${viviendaOriginal.numeroCasa}`;
        await createAuditLog(
            `Actualizó la vivienda ${nombreVivienda} del proyecto "${auditContext.proyectoActualNombre}"`,
            {
                action: 'UPDATE_VIVIENDA',
                viviendaId: id,
                viviendaNombre: nombreVivienda,
                cambios: cambios
            }
        );
    }
};

export const deleteViviendaPermanently = async (vivienda, nombreProyecto) => {
    // 1. Recibimos el objeto 'vivienda' completo y el 'nombreProyecto'.
    const viviendaRef = doc(db, "viviendas", vivienda.id);
    const nombreVivienda = `Mz ${vivienda.manzana} - Casa ${vivienda.numeroCasa}`;

    const batch = writeBatch(db);

    // 2. Buscamos y añadimos al batch la eliminación de renuncias asociadas.
    const renunciasQuery = query(collection(db, "renuncias"), where("viviendaId", "==", vivienda.id));
    const renunciasSnapshot = await getDocs(renunciasQuery);
    renunciasSnapshot.forEach(doc => {
        batch.delete(doc.ref);
    });

    // 3. Añadimos la eliminación de la propia vivienda al batch.
    batch.delete(viviendaRef);

    // 4. Ejecutamos todas las eliminaciones en una sola operación atómica.
    await batch.commit();

    // 5. Creamos el registro de auditoría con la "ficha técnica" completa.
    await createAuditLog(
        `Eliminó permanentemente la vivienda ${nombreVivienda} del proyecto "${nombreProyecto}"`,
        {
            action: 'DELETE_VIVIENDA',
            viviendaId: vivienda.id,
            viviendaNombre: nombreVivienda,
            proyectoNombre: nombreProyecto,
            // Snapshot de la ficha técnica al momento de la eliminación
            snapshotVivienda: {
                matricula: vivienda.matricula,
                nomenclatura: vivienda.nomenclatura,
                areaLote: `${vivienda.areaLote} m²`,
                areaConstruida: `${vivienda.areaConstruida} m²`,
                linderoNorte: vivienda.linderoNorte,
                linderoSur: vivienda.linderoSur,
                linderoOriente: vivienda.linderoOriente,
                linderoOccidente: vivienda.linderoOccidente,
            }
        }
    );
};

// 🔽 COPIA Y REEMPLAZA LA FUNCIÓN ENTERA CON ESTE CÓDIGO 🔽

// 🔽 COPIA Y REEMPLAZA LA FUNCIÓN ENTERA CON ESTE CÓDIGO ACTUALIZADO 🔽

// 🔽 REEMPLAZA LA FUNCIÓN ENTERA CON ESTE CÓDIGO 🔽
export const generarActividadProceso = (procesoOriginal, procesoActual, userName) => {
    const nuevoProcesoConActividad = JSON.parse(JSON.stringify(procesoActual));

    PROCESO_CONFIG.forEach(pasoConfig => {
        const key = pasoConfig.key;
        const pasoOriginal = procesoOriginal[key] || {};
        const pasoActual = nuevoProcesoConActividad[key];

        if (!pasoActual) return;
        if (!pasoActual.actividad) {
            pasoActual.actividad = pasoOriginal.actividad || [];
        }

        const crearEntrada = (mensaje) => ({
            mensaje,
            userName,
            fecha: new Date()
        });

        // 1. Manejo del "Super-Caso": Reabrir, modificar y volver a completar
        if (pasoOriginal.completado && pasoActual.completado) {
            let accionDeFecha = null;
            let accionesDeEvidencia = [];

            if (pasoOriginal.fecha !== pasoActual.fecha) {
                accionDeFecha = `modificó la fecha de completado a ${formatDisplayDate(pasoActual.fecha)}`;
            }

            pasoConfig.evidenciasRequeridas.forEach(ev => {
                const idEvidencia = ev.id;
                const urlOriginal = pasoOriginal.evidencias?.[idEvidencia]?.url;
                const urlActual = pasoActual.evidencias?.[idEvidencia]?.url;
                if (urlOriginal !== urlActual) {
                    accionesDeEvidencia.push(urlActual ? `se reemplazó la evidencia '${ev.label}'` : `eliminó la evidencia '${ev.label}'`);
                }
            });

            // Si hay un motivo de reapertura, o algún cambio, generamos un log unificado.
            if (pasoActual.motivoReapertura || accionDeFecha || accionesDeEvidencia.length > 0) {
                const partesDelMensaje = [];
                if (accionesDeEvidencia.length > 0) {
                    partesDelMensaje.push(accionesDeEvidencia.join(', '));
                }
                if (accionDeFecha) {
                    partesDelMensaje.push(accionDeFecha);
                }

                let mensajeInicial = 'Se actualizó el paso:';
                if (pasoActual.motivoReapertura) {
                    mensajeInicial = `Se reabrió el paso por el motivo: "${pasoActual.motivoReapertura}". Posteriormente,`;
                }

                const mensajeCompleto = `${mensajeInicial} ${partesDelMensaje.join(' y ')}.`;
                pasoActual.actividad.push(crearEntrada(mensajeCompleto.trim()));

                // Solución Bug #1: Limpiamos la propiedad temporal para evitar el doble guardado.
                delete pasoActual.motivoReapertura;
                return;
            }
        }

        // 2. Lógica para los demás casos (se mantiene igual)
        let seCompletoEnEsteCambio = !pasoOriginal.completado && pasoActual.completado;
        // ... (el resto de la función se mantiene exactamente igual que antes)

        let evidenciasSubidasMsg = [];

        pasoConfig.evidenciasRequeridas.forEach(ev => {
            const idEvidencia = ev.id;
            const urlOriginal = pasoOriginal.evidencias?.[idEvidencia]?.url;
            const urlActual = pasoActual.evidencias?.[idEvidencia]?.url;
            if (urlActual && !urlOriginal) {
                evidenciasSubidasMsg.push(`'${ev.label}'`);
            }
        });

        if (seCompletoEnEsteCambio) {
            let msg = `Paso completado con fecha ${formatDisplayDate(pasoActual.fecha)}.`;
            if (evidenciasSubidasMsg.length > 0) {
                msg = `Se subió la evidencia ${evidenciasSubidasMsg.join(', ')} y se completó el paso con fecha ${formatDisplayDate(pasoActual.fecha)}.`;
            }
            pasoActual.actividad.push(crearEntrada(msg));
        } else if (evidenciasSubidasMsg.length > 0) {
            pasoActual.actividad.push(crearEntrada(`Se subió la evidencia ${evidenciasSubidasMsg.join(', ')}.`));
        } else if (pasoOriginal.completado && !pasoActual.completado) {
            let mensaje = 'Paso reabierto.';
            if (pasoActual.motivoReapertura) {
                mensaje += ` Motivo: "${pasoActual.motivoReapertura}"`;
                delete pasoActual.motivoReapertura; // Limpiamos también aquí por consistencia
            }
            pasoActual.actividad.push(crearEntrada(mensaje));
        }
    });

    return nuevoProcesoConActividad;
};
export const updateCliente = async (clienteId, clienteActualizado, viviendaOriginalId, auditDetails = {}) => {
    const clienteRef = doc(db, "clientes", String(clienteId));

    const clienteOriginalSnap = await getDoc(clienteRef);
    if (!clienteOriginalSnap.exists()) {
        throw new Error("El cliente que intentas actualizar no existe.");
    }
    const clienteOriginal = clienteOriginalSnap.data();

    // Lógica de seguridad para la fecha de ingreso
    const fechaOriginal = clienteOriginal.datosCliente.fechaIngreso;
    const fechaNueva = clienteActualizado.datosCliente.fechaIngreso;

    if (fechaOriginal !== fechaNueva) {
        // Obtenemos los abonos para verificar la primera condición
        const abonosQuery = query(collection(db, "abonos"), where("clienteId", "==", clienteId));
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
        await createAuditLog(
            `Inició un nuevo proceso para el cliente ${clienteNombreCompleto}`,
            {
                action: 'RESTART_CLIENT_PROCESS',
                clienteId: clienteId,
                clienteNombre: clienteNombreCompleto,
                nombreNuevaVivienda: nombreNuevaVivienda || 'No especificado',
                snapshotCompleto: snapshotCompleto
            }
        );
    } else {
        await createAuditLog(
            `Actualizó los datos del cliente ${clienteNombreCompleto} (C.C. ${clienteId})`,
            {
                action: 'UPDATE_CLIENT',
                clienteId: clienteId,
                clienteNombre: clienteNombreCompleto,
                cambios: cambios || []
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

export const renunciarAVivienda = async (clienteId, motivo, observacion = '', fechaRenuncia, penalidadMonto = 0, penalidadMotivo = '') => {
    const clienteRef = doc(db, "clientes", clienteId);
    let clienteNombre = '';
    let viviendaInfoParaLog = '';
    let renunciaIdParaNotificacion = '';

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
        const estadoInicialRenuncia = totalADevolver > 0 ? 'Pendiente' : 'Cerrada';

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
            registroRenuncia.fechaDevolucion = new Date().toISOString();
            transaction.update(renunciaRef, { fechaDevolucion: registroRenuncia.fechaDevolucion });
            abonosDelCiclo.forEach(abono => {
                transaction.update(doc(db, "abonos", abono.id), { estadoProceso: 'archivado' });
            });
        }
    });

    await createAuditLog(
        `Registró la renuncia del cliente ${toTitleCase(clienteNombre)} a la vivienda ${viviendaInfoParaLog}`,
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

export const marcarDevolucionComoPagada = async (renunciaId, datosDevolucion) => {
    const renunciaRef = doc(db, "renuncias", renunciaId);
    await runTransaction(db, async (transaction) => {
        const renunciaDoc = await transaction.get(renunciaRef);
        if (!renunciaDoc.exists()) throw new Error("El registro de renuncia no existe.");
        const renunciaData = renunciaDoc.data();
        transaction.update(renunciaRef, { estadoDevolucion: 'Cerrada', ...datosDevolucion });
        if (renunciaData.clienteId) {
            const clienteRef = doc(db, "clientes", renunciaData.clienteId);
            transaction.update(clienteRef, {
                status: 'renunciado',
                viviendaId: null,
                proceso: {},
                financiero: {}
            });
        }
        (renunciaData.historialAbonos || []).forEach(abono => {
            transaction.update(doc(db, "abonos", abono.id), { estadoProceso: 'archivado' });
        });
    });
};


export const updateRenuncia = async (renunciaId, datosParaActualizar) => {
    const renunciaRef = doc(db, "renuncias", renunciaId);
    await updateDoc(renunciaRef, datosParaActualizar);
};

export const cancelarRenuncia = async (renuncia) => {
    const clienteRef = doc(db, "clientes", renuncia.clienteId);
    const viviendaRef = doc(db, "viviendas", renuncia.viviendaId);
    const renunciaRef = doc(db, "renuncias", renuncia.id);
    await runTransaction(db, async (transaction) => {
        const viviendaDoc = await transaction.get(viviendaRef);
        if (!viviendaDoc.exists()) throw new Error("La vivienda original ya no existe.");
        if (viviendaDoc.data().clienteId) {
            throw new Error("VIVIENDA_NO_DISPONIBLE");
        }
        transaction.update(viviendaRef, {
            clienteId: renuncia.clienteId,
            clienteNombre: renuncia.clienteNombre,
            totalAbonado: renuncia.totalAbonadoOriginal,
            saldoPendiente: viviendaDoc.data().valorFinal - renuncia.totalAbonadoOriginal
        });
        transaction.update(clienteRef, {
            viviendaId: renuncia.viviendaId,
            status: 'activo',
            financiero: renuncia.financieroArchivado,
            proceso: renuncia.procesoArchivado || {}
        });
        renuncia.historialAbonos.forEach(abono => {
            transaction.update(doc(db, "abonos", abono.id), { estadoProceso: 'activo' });
        });
        transaction.delete(renunciaRef);
    });
};

export const updateAbono = async (abonoId, datosNuevos, abonoOriginal) => {
    if (!abonoOriginal.viviendaId) throw new Error("El abono original no tiene una vivienda asociada.");
    const abonoRef = doc(db, "abonos", String(abonoId));
    const viviendaRef = doc(db, "viviendas", String(abonoOriginal.viviendaId));
    await runTransaction(db, async (transaction) => {
        const viviendaDoc = await transaction.get(viviendaRef);
        if (!viviendaDoc.exists()) throw "La vivienda de este abono no existe.";
        const viviendaData = viviendaDoc.data();
        const diferenciaMonto = datosNuevos.monto - abonoOriginal.monto;
        const nuevoTotalAbonado = (viviendaData.totalAbonado || 0) + diferenciaMonto;
        const nuevoSaldo = viviendaData.valorFinal - nuevoTotalAbonado;
        transaction.update(viviendaRef, { totalAbonado: nuevoTotalAbonado, saldoPendiente: nuevoSaldo });
        transaction.update(abonoRef, datosNuevos);
    });
};

export const anularAbono = async (abonoAAnular, userName) => {
    if (!abonoAAnular || !abonoAAnular.id || !abonoAAnular.viviendaId) {
        throw new Error("Datos del abono a anular incompletos.");
    }

    const abonoRef = doc(db, "abonos", String(abonoAAnular.id));
    const viviendaRef = doc(db, "viviendas", String(abonoAAnular.viviendaId));
    const clienteRef = doc(db, "clientes", String(abonoAAnular.clienteId));

    await runTransaction(db, async (transaction) => {
        const viviendaDoc = await transaction.get(viviendaRef);
        const clienteDoc = await transaction.get(clienteRef);
        if (!viviendaDoc.exists() || !clienteDoc.exists()) throw new Error("Cliente o vivienda no encontrados.");

        const viviendaData = viviendaDoc.data();
        const clienteData = clienteDoc.data();

        // 1. Verificar que el proceso no esté cerrado
        if (clienteData.proceso?.facturaVenta?.completado) {
            throw new Error("No se puede anular un abono de un proceso ya facturado.");
        }

        // 2. Revertir el impacto financiero
        const montoAAnular = abonoAAnular.monto || 0;
        const nuevoTotalAbonado = (viviendaData.totalAbonado || 0) - montoAAnular;
        const nuevoSaldo = viviendaData.valorFinal - nuevoTotalAbonado;
        transaction.update(viviendaRef, { totalAbonado: nuevoTotalAbonado, saldoPendiente: nuevoSaldo });

        // 3. Reabrir el paso del proceso si es un desembolso
        const pasoConfig = FUENTE_PROCESO_MAP[abonoAAnular.fuente];
        if (pasoConfig && pasoConfig.desembolsoKey) {
            const nuevoProceso = { ...clienteData.proceso };
            const pasoKey = pasoConfig.desembolsoKey;
            if (nuevoProceso[pasoKey]) {
                nuevoProceso[pasoKey].completado = false;

                const entradaHistorial = {
                    mensaje: `Abono de ${formatCurrency(montoAAnular)} anulado. El paso se reabrió automáticamente.`,
                    userName: userName || 'Sistema',
                    fecha: new Date()
                };
                if (!nuevoProceso[pasoKey].actividad) nuevoProceso[pasoKey].actividad = [];
                nuevoProceso[pasoKey].actividad.push(entradaHistorial);

                transaction.update(clienteRef, { proceso: nuevoProceso });
            }
        }

        // 4. Marcar el abono como anulado
        transaction.update(abonoRef, { estadoProceso: 'anulado' });
    });

    const clienteNombre = toTitleCase(`${(await getDoc(clienteRef)).data().datosCliente.nombres} ${(await getDoc(clienteRef)).data().datosCliente.apellidos}`);
    await createAuditLog(
        `Anuló un abono de ${formatCurrency(abonoAAnular.monto)} para ${clienteNombre}`,
        {
            action: 'VOID_ABONO',
            clienteId: abonoAAnular.clienteId,
            abonoId: abonoAAnular.id,
            monto: formatCurrency(abonoAAnular.monto),
            fuente: abonoAAnular.fuente
        }
    );
};

// AÑADE ESTA FUNCIÓN NUEVA:
export const revertirAnulacionAbono = async (abonoARevertir, userName) => {
    const viviendaRef = doc(db, "viviendas", abonoARevertir.viviendaId);
    const clienteRef = doc(db, "clientes", abonoARevertir.clienteId);
    const abonoRef = doc(db, "abonos", abonoARevertir.id);
    const abonosCollectionRef = collection(db, "abonos");

    await runTransaction(db, async (transaction) => {
        const viviendaDoc = await transaction.get(viviendaRef);
        const clienteDoc = await transaction.get(clienteRef);
        if (!viviendaDoc.exists() || !clienteDoc.exists()) throw new Error("Cliente o vivienda no encontrados.");

        const viviendaData = viviendaDoc.data();
        const clienteData = clienteDoc.data();

        // VALIDACIÓN 1: ANTI-SOBREPAGO
        if (abonoARevertir.monto > viviendaData.saldoPendiente) {
            throw new Error(`No se puede revertir. El monto (${formatCurrency(abonoARevertir.monto)}) es mayor al saldo pendiente (${formatCurrency(viviendaData.saldoPendiente)}).`);
        }

        // VALIDACIÓN 2: UNICIDAD DE DESEMBOLSO (solo para desembolsos)
        const pasoConfig = FUENTE_PROCESO_MAP[abonoARevertir.fuente];
        if (pasoConfig) {
            const q = query(abonosCollectionRef, where("clienteId", "==", abonoARevertir.clienteId), where("fuente", "==", abonoARevertir.fuente), where("estadoProceso", "==", "activo"));
            const abonosActivosExistentes = await transaction.get(q);
            if (!abonosActivosExistentes.empty) {
                throw new Error(`No se puede revertir. Ya existe otro desembolso activo para la fuente "${abonoARevertir.fuente}".`);
            }
        }

        // --- Si las validaciones pasan, se procede con la reversión ---
        const nuevoTotalAbonado = viviendaData.totalAbonado + abonoARevertir.monto;
        const nuevoSaldo = viviendaData.saldoPendiente - abonoARevertir.monto;

        transaction.update(abonoRef, { estadoProceso: 'activo' });
        transaction.update(viviendaRef, { totalAbonado: nuevoTotalAbonado, saldoPendiente: nuevoSaldo });

        if (pasoConfig) {
            const desembolsoKey = pasoConfig.desembolsoKey;
            const nuevoProceso = { ...clienteData.proceso };
            if (nuevoProceso[desembolsoKey]) {
                nuevoProceso[desembolsoKey].completado = true;
                const entradaHistorial = {
                    mensaje: `Se revirtió la anulación de un abono de ${formatCurrency(abonoARevertir.monto)}. El paso se completó de nuevo.`,
                    userName: userName || 'Sistema',
                    fecha: new Date()
                };
                if (!nuevoProceso[desembolsoKey].actividad) nuevoProceso[desembolsoKey].actividad = [];
                nuevoProceso[desembolsoKey].actividad.push(entradaHistorial);
                transaction.update(clienteRef, { proceso: nuevoProceso });
            }
        }
    });

    const clienteNombre = toTitleCase(`${(await getDoc(clienteRef)).data().datosCliente.nombres} ${(await getDoc(clienteRef)).data().datosCliente.apellidos}`);
    await createAuditLog(
        `Revirtió la anulación de un abono para ${clienteNombre}`,
        {
            action: 'REVERT_VOID_ABONO',
            clienteId: abonoARevertir.clienteId,
            abonoId: abonoARevertir.id,
            monto: formatCurrency(abonoARevertir.monto),
            fuente: abonoARevertir.fuente
        }
    );
};

export const registrarDesembolsoCredito = async (clienteId, viviendaId, desembolsoData, proyecto, userName) => {
    const viviendaRef = doc(db, "viviendas", viviendaId);
    const clienteRef = doc(db, "clientes", clienteId);
    const abonoRef = doc(collection(db, "abonos"));

    const { clienteNombre, viviendaData, montoADesembolsar } = await runTransaction(db, async (transaction) => {
        const clienteDoc = await transaction.get(clienteRef);
        const viviendaDoc = await transaction.get(viviendaRef);
        if (!clienteDoc.exists() || !viviendaDoc.exists()) throw new Error("El cliente o la vivienda no existen.");

        const transClienteData = clienteDoc.data();
        const transViviendaData = viviendaDoc.data();
        const transClienteNombre = toTitleCase(`${transClienteData.datosCliente.nombres} ${transClienteData.datosCliente.apellidos}`);

        const pasoConfig = FUENTE_PROCESO_MAP['credito'];
        if (pasoConfig) {
            const pasoSolicitud = transClienteData.proceso?.[pasoConfig.solicitudKey];
            if (!pasoSolicitud?.completado) throw new Error("Debe completar la solicitud de desembolso del crédito.");
        }

        const montoCreditoPactado = transClienteData.financiero?.credito?.monto || 0;
        const abonosPreviosSnapshot = await getDocs(query(collection(db, "abonos"), where("clienteId", "==", clienteId), where("fuente", "==", "credito")));
        const totalAbonadoCredito = abonosPreviosSnapshot.docs.reduce((sum, doc) => sum + doc.data().monto, 0);
        const transMontoADesembolsar = montoCreditoPactado - totalAbonadoCredito;
        if (transMontoADesembolsar <= 0) throw new Error("El crédito para este cliente ya ha sido completamente desembolsado.");

        const abonoParaGuardar = { ...desembolsoData, monto: transMontoADesembolsar, fuente: 'credito', metodoPago: 'Desembolso Bancario', clienteId, viviendaId, id: abonoRef.id, estadoProceso: 'activo', timestampCreacion: new Date() };

        const nuevoTotalAbonado = (transViviendaData.totalAbonado || 0) + transMontoADesembolsar;
        const nuevoSaldo = transViviendaData.valorFinal - nuevoTotalAbonado;

        transaction.update(viviendaRef, { totalAbonado: nuevoTotalAbonado, saldoPendiente: nuevoSaldo });
        transaction.set(abonoRef, abonoParaGuardar);

        if (pasoConfig) {
            const desembolsoKey = pasoConfig.desembolsoKey;
            const nuevoProceso = { ...transClienteData.proceso };
            if (!nuevoProceso[desembolsoKey]) nuevoProceso[desembolsoKey] = { actividad: [] };
            if (!nuevoProceso[desembolsoKey].actividad) nuevoProceso[desembolsoKey].actividad = [];

            nuevoProceso[desembolsoKey] = { ...nuevoProceso[desembolsoKey], completado: true, fecha: desembolsoData.fechaPago, evidencias: { ...nuevoProceso[desembolsoKey]?.evidencias, [pasoConfig.evidenciaId]: { url: desembolsoData.urlComprobante, estado: 'subido' } } };

            const entradaHistorial = {
                mensaje: `Desembolso de crédito registrado por ${formatCurrency(transMontoADesembolsar)}. El paso se completó automáticamente.`,
                userName: userName || 'Sistema',
                fecha: new Date()
            };
            nuevoProceso[desembolsoKey].actividad.push(entradaHistorial);
            transaction.update(clienteRef, { proceso: nuevoProceso });
        }
        return { clienteNombre: transClienteNombre, viviendaData: transViviendaData, montoADesembolsar: transMontoADesembolsar };
    });

    const message = `Se registró el desembolso del crédito hipotecario para ${clienteNombre}`;
    await createNotification('abono', message, `/clientes/detalle/${clienteId}`);

    await createAuditLog(
        `Registró desembolso de Crédito Hipotecario para ${clienteNombre}`,
        {
            action: 'REGISTER_CREDIT_DISBURSEMENT',
            cliente: { id: clienteId, nombre: clienteNombre },
            vivienda: { id: viviendaId, display: `Mz ${viviendaData.manzana} - Casa ${viviendaData.numeroCasa}` },
            proyecto: { id: proyecto.id, nombre: proyecto.nombre },
            abono: { monto: formatCurrency(montoADesembolsar), fechaPago: formatDisplayDate(desembolsoData.fechaPago), fuente: 'credito' }
        }
    );
};

export const anularCierreProceso = async (clienteId) => {
    const clienteRef = doc(db, "clientes", clienteId);

    await runTransaction(db, async (transaction) => {
        const clienteDoc = await transaction.get(clienteRef);
        if (!clienteDoc.exists()) {
            throw new Error("El cliente no existe.");
        }

        const clienteData = clienteDoc.data();
        const procesoActual = clienteData.proceso || {};

        // Verificamos si el paso 'facturaVenta' existe y está completado
        if (procesoActual.facturaVenta && procesoActual.facturaVenta.completado) {
            const nuevoProceso = {
                ...procesoActual,
                facturaVenta: {
                    ...procesoActual.facturaVenta,
                    completado: false,
                    fecha: null,
                    motivoUltimoCambio: 'Cierre anulado por administrador',
                    fechaUltimaModificacion: getTodayString()
                }
            };
            transaction.update(clienteRef, { proceso: nuevoProceso });
        } else {
            // Esto es una salvaguarda por si se intenta anular un proceso que no está cerrado.
            throw new Error("El proceso no se puede anular porque no está completado.");
        }
    });
};

// --- INICIO DE LA MODIFICACIÓN ---

/**
 * Crea un registro en el log de auditoría.
 * @param {string} message - El mensaje descriptivo de la acción (ej: "Creó al cliente Pedro Suarez").
 * @param {object} details - Un objeto con detalles relevantes sobre el evento (ej: { cambios: [...] }).
 */
export const createAuditLog = async (message, details = {}) => {
    try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            console.warn("Intento de registro de auditoría sin usuario autenticado.");
            return;
        }

        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        const userName = userDocSnap.exists()
            ? toTitleCase(`${userDocSnap.data().nombres} ${userDocSnap.data().apellidos}`)
            : currentUser.email;

        const auditCollectionRef = collection(db, "audits");

        await addDoc(auditCollectionRef, {
            timestamp: serverTimestamp(),
            userId: currentUser.uid,
            userName: userName,
            message: message,
            details: details // Se añade el nuevo campo de detalles
        });

    } catch (error) {
        console.error("Error al crear el registro de auditoría:", error);
    }
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