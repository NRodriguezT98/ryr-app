// src/services/abonoService.js
import { db } from '../firebase/config';
import { collection, addDoc, doc, updateDoc, runTransaction, getDoc, query, where, getDocs } from "firebase/firestore";
import { formatCurrency, toTitleCase, formatDisplayDate } from '../utils/textFormatters';
import { FUENTE_PROCESO_MAP, PROCESO_CONFIG } from '../utils/procesoConfig.js';
import { createAbonoAuditLog } from './unifiedAuditService';
import { createNotification } from './notificationService';

export const addAbonoAndUpdateProceso = async (abonoData, cliente, proyecto, userName) => {

    let totalAbonadoPrevioCuotaInicial = 0;
    if (abonoData.fuente === 'cuotaInicial') {
        const abonosPreviosQuery = query(collection(db, "abonos"), where("clienteId", "==", abonoData.clienteId), where("fuente", "==", "cuotaInicial"), where("estadoProceso", "==", "activo"));
        const abonosPreviosSnapshot = await getDocs(abonosPreviosQuery);
        totalAbonadoPrevioCuotaInicial = abonosPreviosSnapshot.docs.reduce((sum, doc) => sum + doc.data().monto, 0);
    }

    const viviendaRef = doc(db, "viviendas", abonoData.viviendaId);
    const clienteRef = doc(db, "clientes", abonoData.clienteId);
    const abonoRef = doc(collection(db, "abonos"));
    const contadorRef = doc(db, "contadores", "abonos");

    const { viviendaData, clienteNombre, consecutivo, pasoCompletadoNombre, cuotaInicialCompletada } = await runTransaction(db, async (transaction) => {

        // PASO 1: LEER TODOS LOS DATOS
        const contadorDoc = await transaction.get(contadorRef);
        const viviendaDoc = await transaction.get(viviendaRef);
        const clienteDoc = await transaction.get(clienteRef);
        if (!viviendaDoc.exists() || !clienteDoc.exists()) throw new Error("El cliente o la vivienda ya no existen.");

        // PASO 2: REALIZAR TODOS LOS CÁLCULOS
        const transViviendaData = viviendaDoc.data();
        const transClienteData = clienteDoc.data();
        let nombrePasoCompletado = null;
        let isCuotaInicialCompletada = false;
        const nuevoConsecutivo = (contadorDoc.exists() ? contadorDoc.data().consecutivo : 0) + 1;

        if (abonoData.fuente === 'cuotaInicial') {
            const montoPactado = transClienteData.financiero?.cuotaInicial?.monto || 0;
            if (montoPactado > 0) {
                const totalConAbonoActual = totalAbonadoPrevioCuotaInicial + abonoData.monto;
                if (totalConAbonoActual >= montoPactado - 0.01) {
                    isCuotaInicialCompletada = true;
                }
            }
        }

        const pasoConfig = FUENTE_PROCESO_MAP[abonoData.fuente];
        if (pasoConfig) {
            const solicitudKey = pasoConfig.solicitudKey;
            const pasoSolicitud = transClienteData.proceso?.[solicitudKey];
            if (pasoSolicitud && !pasoSolicitud.completado) throw new Error('SOLICITUD_PENDIENTE');
        }

        const nuevoTotalAbonado = (transViviendaData.totalAbonado || 0) + abonoData.monto;
        const nuevoSaldo = transViviendaData.valorFinal - nuevoTotalAbonado;

        const abonoParaGuardar = {
            ...abonoData, id: abonoRef.id,
            consecutivo: nuevoConsecutivo,
            estadoProceso: 'activo',
            timestampCreacion: new Date()
        };

        // PASO 3: EJECUTAR TODAS LAS ESCRITURAS
        if (contadorDoc.exists()) {
            transaction.update(contadorRef, { consecutivo: nuevoConsecutivo });
        } else {
            transaction.set(contadorRef, { consecutivo: nuevoConsecutivo });
        }
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
            const configDelPaso = PROCESO_CONFIG.find(p => p.key === desembolsoKey);
            if (configDelPaso) {
                nombrePasoCompletado = configDelPaso.label.substring(configDelPaso.label.indexOf('.') + 1).trim();
            }
            transaction.update(clienteRef, { proceso: nuevoProceso });
        }

        return {
            viviendaData: transViviendaData,
            clienteNombre: toTitleCase(`${transClienteData.datosCliente.nombres} ${transClienteData.datosCliente.apellidos}`),
            consecutivo: nuevoConsecutivo,
            pasoCompletadoNombre: nombrePasoCompletado,
            cuotaInicialCompletada: isCuotaInicialCompletada
        };
    });

    const message = `Nuevo abono de ${formatCurrency(abonoData.monto)} para la vivienda Mz ${viviendaData.manzana} - Casa ${viviendaData.numeroCasa}`;
    await createNotification('abono', message, `/viviendas/detalle/${abonoData.viviendaId}`);
    const esCuotaInicial = abonoData.fuente === 'cuotaInicial';
    const verbo = esCuotaInicial ? 'Abono' : 'Desembolso';
    const consecutivoStr = `#${String(consecutivo).padStart(4, '0')}`;
    let mensajeAuditoria = `Registró ${verbo} de "${abonoData.metodoPago}" con el consecutivo N°${consecutivoStr} para el cliente: ${clienteNombre} por valor de ${formatCurrency(abonoData.monto)}`;
    if (esCuotaInicial && cuotaInicialCompletada) {
        mensajeAuditoria += ". Con este pago se completó el saldo de la Cuota Inicial.";
    }

    // 🔥 MIGRADO AL SISTEMA NUEVO
    await createAbonoAuditLog(
        esCuotaInicial ? 'REGISTER_ABONO' : 'REGISTER_DISBURSEMENT',
        {
            id: abonoRef.id,
            monto: abonoData.monto,
            fechaPago: abonoData.fechaPago,
            metodoPago: abonoData.metodoPago,
            fuente: abonoData.fuente
        },
        {
            clienteId: abonoData.clienteId,
            viviendaId: abonoData.viviendaId,
            proyectoId: proyecto.id,
            cliente: {
                id: abonoData.clienteId,
                nombre: clienteNombre
            },
            vivienda: {
                id: abonoData.viviendaId,
                manzana: viviendaData.manzana,
                numeroCasa: viviendaData.numeroCasa
            },
            proyecto: {
                id: proyecto.id,
                nombre: proyecto.nombre
            },
            actionData: {
                pasoCompletado: pasoCompletadoNombre,
                cuotaInicialCompletada: cuotaInicialCompletada,
                consecutivo: consecutivoStr,
                montoFormateado: formatCurrency(abonoData.monto),
                fechaFormateada: formatDisplayDate(abonoData.fechaPago)
            }
        }
    );
};

export const updateAbono = async (abonoId, datosNuevos, abonoOriginal) => {
    if (!abonoOriginal.viviendaId) throw new Error("El abono original no tiene una vivienda asociada.");
    const abonoRef = doc(db, "abonos", String(abonoId));
    const viviendaRef = doc(db, "viviendas", String(abonoOriginal.viviendaId));
    const clienteRef = doc(db, "clientes", String(abonoOriginal.clienteId)); // Necesitamos al cliente
    const abonosCollectionRef = collection(db, "abonos");
    await runTransaction(db, async (transaction) => {
        const abonoDoc = await transaction.get(abonoRef);
        if (!abonoDoc.exists()) throw "El abono que intentas editar no existe.";
        if (abonoDoc.data().estadoProceso !== 'activo') {
            throw new Error("No se puede editar un abono que no está activo.");
        }
        const viviendaDoc = await transaction.get(viviendaRef);
        const clienteDoc = await transaction.get(clienteRef);
        if (!viviendaDoc.exists()) throw "La vivienda de este abono no existe.";
        const viviendaData = viviendaDoc.data();
        const clienteData = clienteDoc.data();
        const fuente = abonoOriginal.fuente;

        const financiero = clienteData.financiero;
        let montoPactado = 0;
        if (fuente === 'cuotaInicial' && financiero.aplicaCuotaInicial) {
            montoPactado = financiero.cuotaInicial.monto;
        }
        else if (fuente === 'credito' && financiero.aplicaCredito) {
            montoPactado = financiero.credito.monto;
        }
        // 3. Busca el monto pactado para el Subsidio de Vivienda
        else if (fuente === 'subsidioVivienda' && financiero.aplicaSubsidioVivienda) {
            montoPactado = financiero.subsidioVivienda.monto;
        }
        // 4. Busca el monto pactado para el Subsidio de Caja de Compensación
        else if (fuente === 'subsidioCaja' && financiero.aplicaSubsidioCaja) {
            montoPactado = financiero.subsidioCaja.monto;
        }

        const q = query(abonosCollectionRef, where("clienteId", "==", abonoOriginal.clienteId), where("fuente", "==", fuente), where("estadoProceso", "==", "activo"));
        const abonosActivosSnap = await getDocs(q);
        const totalAbonadoFuente = abonosActivosSnap.docs.reduce((sum, doc) => sum + doc.data().monto, 0);

        const totalOtrosAbonos = totalAbonadoFuente - abonoOriginal.monto;

        if (datosNuevos.monto > (montoPactado - totalOtrosAbonos)) {
            throw new Error(`El monto excede lo pactado para la fuente ${fuente}.`);
        }

        const diferenciaMonto = datosNuevos.monto - abonoOriginal.monto;
        const nuevoTotalAbonado = (viviendaData.totalAbonado || 0) + diferenciaMonto;
        const nuevoSaldo = viviendaData.valorFinal - nuevoTotalAbonado;
        transaction.update(viviendaRef, { totalAbonado: nuevoTotalAbonado, saldoPendiente: nuevoSaldo });
        transaction.update(abonoRef, datosNuevos);
    });
};

export const anularAbono = async (abonoAAnular, userName, motivo) => {
    // --- DEBUG ---
    console.log("🕵️‍♂️ Motivo recibido en la función anularAbono:", motivo);
    // --- FIN DEBUG ---
    if (!abonoAAnular || !abonoAAnular.id || !abonoAAnular.viviendaId) {
        throw new Error("Datos del abono a anular incompletos.");
    }

    const abonoRef = doc(db, "abonos", String(abonoAAnular.id));
    const viviendaRef = doc(db, "viviendas", String(abonoAAnular.viviendaId));
    const clienteRef = doc(db, "clientes", String(abonoAAnular.clienteId));

    const motivoFinal = String(motivo || '');
    let pasoReabierto = null;

    // Ejecutamos la transacción solo con las operaciones de escritura críticas
    await runTransaction(db, async (transaction) => {
        const abonoDoc = await transaction.get(abonoRef);
        if (!abonoDoc.exists()) throw "El abono que intentas anular no existe.";
        if (abonoDoc.data().estadoProceso !== 'activo') {
            throw new Error("Este abono no se puede anular porque ya no está activo.");
        }
        const viviendaDoc = await transaction.get(viviendaRef);
        const clienteDoc = await transaction.get(clienteRef);
        if (!viviendaDoc.exists() || !clienteDoc.exists()) {
            throw new Error("Cliente o vivienda no encontrados.");
        }

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
                const consecutivoStr = String(abonoAAnular.consecutivo).padStart(4, '0');
                const fechaAbonoStr = formatDisplayDate(abonoAAnular.fechaPago);
                const entradaHistorial = {
                    mensaje: `Se ANULÓ Desembolso de Crédito Hipotecarío Consecutivo #${consecutivoStr} de la fecha "${fechaAbonoStr}" por valor de ${formatCurrency(montoAAnular)}. El paso 'Crédito Desembolsado' se reabrió automáticamente.`,
                    userName: userName,
                    fecha: new Date()
                };
                if (!nuevoProceso[pasoKey].actividad) nuevoProceso[pasoKey].actividad = [];
                nuevoProceso[pasoKey].actividad.push(entradaHistorial);
                transaction.update(clienteRef, { proceso: nuevoProceso });
                const configDelPaso = PROCESO_CONFIG.find(p => p.key === pasoKey);
                if (configDelPaso) {
                    pasoReabierto = configDelPaso.label.substring(configDelPaso.label.indexOf('.') + 1).trim();
                }
            }
        }

        // 4. Marcar el abono como anulado
        transaction.update(abonoRef, {
            estadoProceso: 'anulado',
            motivoAnulacion: motivoFinal,
            fechaAnulacion: new Date()
        });
    });

    // --- RECOPILAMOS DATOS PARA LA AUDITORÍA DESPUÉS DE LA TRANSACCIÓN EXITOSA ---
    const clienteSnap = await getDoc(clienteRef);
    const viviendaSnap = await getDoc(viviendaRef);
    const clienteData = clienteSnap.data();
    const viviendaData = viviendaSnap.data();
    const proyectoRef = doc(db, "proyectos", viviendaData.proyectoId);
    const proyectoSnap = await getDoc(proyectoRef);
    const proyectoData = proyectoSnap.exists() ? proyectoSnap.data() : { nombre: 'No encontrado' };

    const clienteNombreCompleto = toTitleCase(`${clienteData.datosCliente.nombres} ${clienteData.datosCliente.apellidos}`);
    const consecutivoStr = String(abonoAAnular.consecutivo).padStart(4, '0');

    // --- INICIO DE LA MODIFICACIÓN ---
    // Creamos el nuevo mensaje genérico, que ahora incluye la fecha.
    const mensajeAuditoria = `Anuló el abono N°${consecutivoStr} realizado el ${formatDisplayDate(abonoAAnular.fechaPago)} del cliente: ${clienteNombreCompleto} por valor de ${formatCurrency(abonoAAnular.monto)}`;
    // --- FIN DE LA MODIFICACIÓN ---

    await createAuditLog(
        mensajeAuditoria,
        {
            action: 'VOID_ABONO',
            clienteId: abonoAAnular.clienteId,
            cliente: { id: clienteSnap.id, nombre: clienteNombreCompleto },
            vivienda: { id: viviendaSnap.id, display: `Mz ${viviendaData.manzana} - Casa ${viviendaData.numeroCasa}` },
            proyecto: { id: viviendaData.proyectoId, nombre: proyectoData.nombre },
            abono: {
                monto: formatCurrency(abonoAAnular.monto),
                fechaPago: formatDisplayDate(abonoAAnular.fechaPago),
                fuente: abonoAAnular.fuente,
                motivo: motivoFinal, // El motivo se guarda en los detalles
                consecutivo: consecutivoStr
            },
            pasoReabierto: pasoReabierto
        }
    );
};

export const revertirAnulacionAbono = async (abonoARevertir, userName, motivo) => {
    const viviendaRef = doc(db, "viviendas", abonoARevertir.viviendaId);
    const clienteRef = doc(db, "clientes", abonoARevertir.clienteId);
    const abonoRef = doc(db, "abonos", abonoARevertir.id);
    const abonosCollectionRef = collection(db, "abonos");

    let datosParaAuditoria = {};

    await runTransaction(db, async (transaction) => {
        const abonoDoc = await transaction.get(abonoRef);
        if (!abonoDoc.exists()) throw new Error("El abono que intentas revertir no existe.");
        if (abonoDoc.data().estadoProceso !== 'anulado') {
            throw new Error("Solo se puede revertir la anulación de un abono que esté anulado.");
        }
        const viviendaDoc = await transaction.get(viviendaRef);
        const clienteDoc = await transaction.get(clienteRef);
        if (!viviendaDoc.exists() || !clienteDoc.exists()) throw new Error("Cliente o vivienda no encontrados.");

        const viviendaData = viviendaDoc.data();
        const clienteData = clienteDoc.data();

        if (clienteData.viviendaId !== abonoARevertir.viviendaId) {
            throw new Error("No se puede revertir un abono de una vivienda que ya no está asignada al cliente. Operación cancelada.");
        }

        // 1. Obtenemos el monto total pactado para la fuente específica del abono.
        const fuente = abonoARevertir.fuente;
        const financiero = clienteData.financiero;
        let montoPactadoFuente = 0;

        if (fuente === 'cuotaInicial' && financiero?.aplicaCuotaInicial) {
            montoPactadoFuente = financiero.cuotaInicial?.monto || 0;
        } else if (fuente === 'credito' && financiero?.aplicaCredito) {
            montoPactadoFuente = financiero.credito?.monto || 0;
        } else if (fuente === 'subsidioVivienda' && financiero?.aplicaSubsidioVivienda) {
            montoPactadoFuente = financiero.subsidioVivienda?.monto || 0;
        } else if (fuente === 'subsidioCaja' && financiero?.aplicaSubsidioCaja) {
            montoPactadoFuente = financiero.subsidioCaja?.monto || 0;
        }

        // 2. Calculamos cuánto se ha pagado a esa fuente con abonos activos.
        const qFuente = query(abonosCollectionRef,
            where("clienteId", "==", abonoARevertir.clienteId),
            where("fuente", "==", fuente),
            where("estadoProceso", "==", "activo")
        );
        const abonosActivosFuenteSnap = await getDocs(qFuente);
        const totalAbonadoFuente = abonosActivosFuenteSnap.docs.reduce((sum, doc) => sum + doc.data().monto, 0);

        // 3. Calculamos el saldo pendiente REAL de esa fuente.
        const saldoPendienteDeLaFuente = montoPactadoFuente - totalAbonadoFuente;

        // 4. Realizamos la validación CORRECTA.
        if (abonoARevertir.monto > saldoPendienteDeLaFuente) {
            throw new Error(`No se puede revertir. El monto del abono (${formatCurrency(abonoARevertir.monto)}) es mayor al saldo pendiente de la fuente "${fuente}" (${formatCurrency(saldoPendienteDeLaFuente)}).`);
        }

        // --- FIN DE LA LÓGICA DE VALIDACIÓN CORREGIDA ---

        // VALIDACIÓN 2: UNICIDAD DE DESEMBOLSO (esta se mantiene igual)
        const pasoConfig = FUENTE_PROCESO_MAP[abonoARevertir.fuente];
        if (pasoConfig) {
            const qUnicidad = query(abonosCollectionRef, where("clienteId", "==", abonoARevertir.clienteId), where("fuente", "==", abonoARevertir.fuente), where("estadoProceso", "==", "activo"));
            const abonosActivosExistentes = await getDocs(qUnicidad);
            if (!abonosActivosExistentes.empty) {
                throw new Error(`No se puede revertir. Ya existe otro desembolso activo para la fuente "${abonoARevertir.fuente}".`);
            }
        }

        // --- Si las validaciones pasan, se procede con la reversión ---
        const nuevoTotalAbonado = viviendaData.totalAbonado + abonoARevertir.monto;
        const nuevoSaldo = viviendaData.saldoPendiente - abonoARevertir.monto;

        transaction.update(abonoRef, {
            estadoProceso: 'activo',
            motivoAnulacion: null, // Limpiamos el motivo de la anulación original
            motivoReversion: motivo, // Guardamos el nuevo motivo de la reversión
            fechaReversion: new Date() // Opcional: guardamos la fecha en que se revirtió
        });
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

        const proyectoRef = doc(db, "proyectos", viviendaData.proyectoId);
        const proyectoDoc = await getDoc(proyectoRef);
        const proyectoData = proyectoDoc.exists() ? proyectoDoc.data() : { nombre: 'No encontrado' };

        const consecutivoStr = String(abonoARevertir.consecutivo).padStart(4, '0');

        datosParaAuditoria = {
            cliente: {
                id: clienteDoc.id,
                nombre: toTitleCase(`${clienteData.datosCliente.nombres} ${clienteData.datosCliente.apellidos}`)
            },
            vivienda: {
                id: viviendaDoc.id,
                display: `Mz ${viviendaData.manzana} - Casa ${viviendaData.numeroCasa}`
            },
            proyecto: {
                id: viviendaData.proyectoId,
                nombre: proyectoData.nombre
            },
            abono: {
                monto: formatCurrency(abonoARevertir.monto),
                fechaPago: formatDisplayDate(abonoARevertir.fechaPago),
                fuente: abonoARevertir.fuente,
                consecutivo: consecutivoStr,
                motivoReversion: motivo,
                motivoAnulacion: abonoARevertir.motivoAnulacion || 'No registrado',
                fechaAnulacion: abonoARevertir.fechaAnulacion ? formatDisplayDate(abonoARevertir.fechaAnulacion) : 'No registrada'
            }
        };
    });

    const mensajeAuditoria = `Revirtió la anulación del abono N°${datosParaAuditoria.abono.consecutivo} del ${datosParaAuditoria.abono.fechaPago} para ${datosParaAuditoria.cliente.nombre} por un valor de ${datosParaAuditoria.abono.monto}`;
    await createAuditLog(
        mensajeAuditoria,
        {
            action: 'REVERT_VOID_ABONO',
            clienteId: abonoARevertir.clienteId,
            ...datosParaAuditoria
        }
    );
};

export const registrarDesembolsoCredito = async (clienteId, viviendaId, desembolsoData, proyecto, userName) => {

    const abonosPreviosQuery = query(collection(db, "abonos"), where("clienteId", "==", clienteId), where("fuente", "==", "credito"), where("estadoProceso", "==", "activo"));
    const abonosPreviosSnapshot = await getDocs(abonosPreviosQuery);
    const totalAbonadoCredito = abonosPreviosSnapshot.docs.reduce((sum, doc) => sum + doc.data().monto, 0);

    const viviendaRef = doc(db, "viviendas", viviendaId);
    const clienteRef = doc(db, "clientes", clienteId);
    const abonoRef = doc(collection(db, "abonos"));
    const contadorRef = doc(db, "contadores", "abonos");

    const { clienteNombre, viviendaData, montoADesembolsar, pasoCompletadoNombre, consecutivo } = await runTransaction(db, async (transaction) => {
        // PASO 1: LEER
        const contadorDoc = await transaction.get(contadorRef);
        const clienteDoc = await transaction.get(clienteRef);
        const viviendaDoc = await transaction.get(viviendaRef);
        if (!clienteDoc.exists() || !viviendaDoc.exists()) throw new Error("El cliente o la vivienda no existen.");

        // PASO 2: CALCULAR
        const nuevoConsecutivo = (contadorDoc.exists() ? contadorDoc.data().consecutivo : 0) + 1;
        let nombrePasoCompletado = null;
        const transClienteData = clienteDoc.data();
        const transViviendaData = viviendaDoc.data();
        const transClienteNombre = toTitleCase(`${transClienteData.datosCliente.nombres} ${transClienteData.datosCliente.apellidos}`);

        const pasoConfig = FUENTE_PROCESO_MAP['credito'];
        if (pasoConfig) {
            const pasoSolicitud = transClienteData.proceso?.[pasoConfig.solicitudKey];
            if (!pasoSolicitud?.completado) throw new Error("Debe completar la solicitud de desembolso del crédito.");
        }

        const montoCreditoPactado = transClienteData.financiero?.credito?.monto || 0;
        const transMontoADesembolsar = montoCreditoPactado - totalAbonadoCredito;
        if (transMontoADesembolsar <= 0) throw new Error("El crédito para este cliente ya ha sido completamente desembolsado.");

        const abonoParaGuardar = { ...desembolsoData, consecutivo: nuevoConsecutivo, monto: transMontoADesembolsar, fuente: 'credito', metodoPago: 'Desembolso Bancario', clienteId, viviendaId, id: abonoRef.id, estadoProceso: 'activo', timestampCreacion: new Date() };
        const nuevoTotalAbonado = (transViviendaData.totalAbonado || 0) + transMontoADesembolsar;
        const nuevoSaldo = transViviendaData.valorFinal - nuevoTotalAbonado;


        const nuevoProceso = { ...transClienteData.proceso };

        if (pasoConfig && (totalAbonadoCredito + transMontoADesembolsar) >= montoCreditoPactado) {
            const pasoDesembolsoKey = pasoConfig.desembolsoKey; // ej: 'desembolsoCredito'
            if (pasoDesembolsoKey) {
                nombrePasoCompletado = PROCESO_CONFIG.find(p => p.key === pasoDesembolsoKey)?.label || pasoDesembolsoKey;

                nuevoProceso[pasoDesembolsoKey] = {
                    ...nuevoProceso[pasoDesembolsoKey],
                    completado: true,
                    fecha: desembolsoData.fechaPago // Usamos la fecha del desembolso
                };
            }
        }

        // PASO 3: ESCRIBIR
        if (contadorDoc.exists()) {
            transaction.update(contadorRef, { consecutivo: nuevoConsecutivo });
        } else {
            transaction.set(contadorRef, { consecutivo: nuevoConsecutivo });
        }
        transaction.update(viviendaRef, { totalAbonado: nuevoTotalAbonado, saldoPendiente: nuevoSaldo });
        transaction.set(abonoRef, abonoParaGuardar);

        if (pasoConfig) {
            const desembolsoKey = pasoConfig.desembolsoKey;
            const nuevoProceso = { ...transClienteData.proceso };
            if (!nuevoProceso[desembolsoKey]) nuevoProceso[desembolsoKey] = { actividad: [] };
            if (!nuevoProceso[desembolsoKey].actividad) nuevoProceso[desembolsoKey].actividad = [];

            nuevoProceso[desembolsoKey] = { ...nuevoProceso[desembolsoKey], completado: true, fecha: desembolsoData.fechaPago, evidencias: { ...nuevoProceso[desembolsoKey]?.evidencias, [pasoConfig.evidenciaId]: { url: desembolsoData.urlComprobante, estado: 'subido' } } };

            const configDelPaso = PROCESO_CONFIG.find(p => p.key === desembolsoKey);
            let nombreDelPaso = 'desconocido';
            if (configDelPaso) {
                nombreDelPaso = configDelPaso.label.substring(configDelPaso.label.indexOf('.') + 1).trim();
            }

            const entradaHistorial = {
                mensaje: `Desembolso de crédito registrado desde el módulo "Abonos", con Consecutivo #${String(nuevoConsecutivo).padStart(4, '0')} por valor de ${formatCurrency(transMontoADesembolsar)}. El paso "${nombreDelPaso}" se completó automáticamente.`,
                userName: userName || 'Sistema',
                fecha: new Date()
            };

            nuevoProceso[desembolsoKey].actividad.push(entradaHistorial);
            transaction.update(clienteRef, { proceso: nuevoProceso });
        }

        return {
            clienteNombre: transClienteNombre,
            viviendaData: transViviendaData,
            montoADesembolsar: transMontoADesembolsar,
            pasoCompletadoNombre: nombrePasoCompletado,
            consecutivo: nuevoConsecutivo
        };
    });

    const message = `Se registró el desembolso del crédito hipotecario para ${clienteNombre}`;
    await createNotification('abono', message, `/clientes/detalle/${clienteId}`);

    const consecutivoStr = String(consecutivo).padStart(4, '0');

    const mensajeAuditoria = `Registró desembolso de Crédito Hipotecario con el consecutivo #${consecutivoStr} para el cliente ${clienteNombre} por valor de ${formatCurrency(montoADesembolsar)}`;


    await createAuditLog(
        mensajeAuditoria,
        {
            action: 'REGISTER_CREDIT_DISBURSEMENT',
            clienteId: clienteId,
            pasoCompletado: pasoCompletadoNombre,
            cliente: { id: clienteId, nombre: clienteNombre },
            vivienda: { id: viviendaId, display: `Mz ${viviendaData.manzana} - Casa ${viviendaData.numeroCasa}` },
            proyecto: { id: proyecto.id, nombre: proyecto.nombre },
            abono: {
                monto: formatCurrency(montoADesembolsar),
                fechaPago: formatDisplayDate(desembolsoData.fechaPago),
                fuente: 'credito',
                consecutivo: consecutivoStr
            }
        }
    );
};

export const condonarSaldo = async (datosCondonacion, userName) => {
    const { vivienda, cliente, proyecto, monto, motivo, fechaCondonacion, urlSoporte, fuenteOriginal } = datosCondonacion;
    const viviendaRef = doc(db, "viviendas", vivienda.id);
    const abonoRef = doc(collection(db, "abonos"));
    const contadorRef = doc(db, "contadores", "abonos");

    const { clienteNombre, consecutivo } = await runTransaction(db, async (transaction) => {
        // PASO 1: LEER
        const contadorDoc = await transaction.get(contadorRef);
        const viviendaDoc = await transaction.get(viviendaRef);
        if (!viviendaDoc.exists()) throw new Error("La vivienda no existe.");

        // PASO 2: CALCULAR
        const viviendaData = viviendaDoc.data();
        const nuevoConsecutivo = (contadorDoc.exists() ? contadorDoc.data().consecutivo : 0) + 1;
        const nuevoTotalAbonado = (viviendaData.totalAbonado || 0) + monto;
        const nuevoSaldo = viviendaData.valorFinal - nuevoTotalAbonado;
        const abonoParaGuardar = {
            id: abonoRef.id,
            consecutivo: nuevoConsecutivo,
            clienteId: cliente.id,
            viviendaId: vivienda.id,
            monto: monto,
            fechaPago: fechaCondonacion,
            metodoPago: 'Condonación de Saldo',
            fuente: fuenteOriginal,
            observacion: `Condonación de saldo. Motivo: ${motivo}`,
            urlComprobante: urlSoporte,
            estadoProceso: 'activo',
            timestampCreacion: new Date()
        };

        // PASO 3: ESCRIBIR
        if (contadorDoc.exists()) {
            transaction.update(contadorRef, { consecutivo: nuevoConsecutivo });
        } else {
            transaction.set(contadorRef, { consecutivo: nuevoConsecutivo });
        }
        transaction.update(viviendaRef, { totalAbonado: nuevoTotalAbonado, saldoPendiente: nuevoSaldo });
        transaction.set(abonoRef, abonoParaGuardar);

        return {
            clienteNombre: toTitleCase(`${cliente.datosCliente.nombres} ${cliente.datosCliente.apellidos}`),
            consecutivo: nuevoConsecutivo
        };
    });

    const consecutivoStr = String(consecutivo).padStart(4, '0');
    const mensajeAuditoria = `Condonó el saldo restante de ${toTitleCase(fuenteOriginal)} con el consecutivo N°${consecutivoStr} para el cliente ${clienteNombre} por un valor de ${formatCurrency(monto)}`;

    await createAuditLog(
        mensajeAuditoria,
        {
            action: 'CONDONAR_SALDO',
            clienteId: cliente.id,
            cliente: { id: cliente.id, nombre: clienteNombre },
            vivienda: { id: vivienda.id, display: `Mz ${vivienda.manzana} - Casa ${vivienda.numeroCasa}` },
            proyecto: { id: proyecto.id, nombre: proyecto.nombre },
            abono: {
                monto: formatCurrency(monto),
                motivo: motivo,
                fuenteOriginal: fuenteOriginal,
                consecutivo: consecutivoStr
            }
        }
    );
};