// src/services/abonoService.js
import { db } from '../firebase/config';
import { collection, addDoc, doc, updateDoc, runTransaction, getDoc, query, where, getDocs } from "firebase/firestore";
import { formatCurrency, toTitleCase, formatDisplayDate } from '../utils/textFormatters';
import { FUENTE_PROCESO_MAP } from '../utils/procesoConfig.js';
import { createAuditLog } from './auditService';
import { createNotification } from './notificationService';

export const addAbonoAndUpdateProceso = async (abonoData, cliente, proyecto, userName) => {
    const viviendaRef = doc(db, "viviendas", abonoData.viviendaId);
    const clienteRef = doc(db, "clientes", abonoData.clienteId);
    const abonoRef = doc(collection(db, "abonos"));
    const contadorRef = doc(db, "counters", "abonos");

    const { viviendaData, clienteNombre, consecutivo } = await runTransaction(db, async (transaction) => {
        const contadorDoc = await transaction.get(contadorRef);
        if (!contadorDoc.exists()) {
            throw new Error("El documento contador de abonos no existe. Por favor, créalo en Firestore.");
        }
        const nuevoConsecutivo = contadorDoc.data().currentNumber + 1;

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

        const abonoParaGuardar = {
            ...abonoData, id: abonoRef.id,
            consecutivo: nuevoConsecutivo,
            estadoProceso: 'activo',
            timestampCreacion: new Date()
        };

        transaction.update(contadorRef, { currentNumber: nuevoConsecutivo });
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
            clienteNombre: toTitleCase(`${transClienteData.datosCliente.nombres} ${transClienteData.datosCliente.apellidos}`),
            consecutivo: nuevoConsecutivo
        };
    });
    const message = `Nuevo abono de ${formatCurrency(abonoData.monto)} para la vivienda Mz ${viviendaData.manzana} - Casa ${viviendaData.numeroCasa}`;
    await createNotification('abono', message, `/viviendas/detalle/${abonoData.viviendaId}`);

    const esCuotaInicial = abonoData.fuente === 'cuotaInicial';
    const verbo = esCuotaInicial ? 'Abono' : 'Desembolso';
    const mensajeAuditoria = `Registró ${verbo} de "${abonoData.metodoPago}" para ${clienteNombre} por valor de ${formatCurrency(abonoData.monto)}`;

    await createAuditLog(
        mensajeAuditoria,
        {
            action: esCuotaInicial ? 'REGISTER_ABONO' : 'REGISTER_DISBURSEMENT',
            clienteId: abonoData.clienteId, // <-- AÑADIMOS EL CAMPO CLAVE PARA EL HISTORIAL
            cliente: { id: abonoData.clienteId, nombre: clienteNombre },
            vivienda: { id: abonoData.viviendaId, display: `Mz ${viviendaData.manzana} - Casa ${viviendaData.numeroCasa}` },
            proyecto: { id: proyecto.id, nombre: proyecto.nombre },
            abono: {
                monto: formatCurrency(abonoData.monto),
                fechaPago: formatDisplayDate(abonoData.fechaPago),
                fuente: abonoData.fuente,
                consecutivo: String(consecutivo).padStart(4, '0')
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
    if (!abonoAAnular || !abonoAAnular.id || !abonoAAnular.viviendaId) {
        throw new Error("Datos del abono a anular incompletos.");
    }

    const abonoRef = doc(db, "abonos", String(abonoAAnular.id));
    const viviendaRef = doc(db, "viviendas", String(abonoAAnular.viviendaId));
    const clienteRef = doc(db, "clientes", String(abonoAAnular.clienteId));

    const motivoFinal = String(motivo || '');

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
        transaction.update(abonoRef, {
            estadoProceso: 'anulado',
            motivoAnulacion: motivoFinal
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

    const datosParaAuditoria = {
        cliente: {
            id: clienteSnap.id,
            nombre: toTitleCase(`${clienteData.datosCliente.nombres} ${clienteData.datosCliente.apellidos}`)
        },
        vivienda: {
            id: viviendaSnap.id,
            display: `Mz ${viviendaData.manzana} - Casa ${viviendaData.numeroCasa}`
        },
        proyecto: {
            id: viviendaData.proyectoId,
            nombre: proyectoData.nombre
        },
        abono: {
            monto: formatCurrency(abonoAAnular.monto),
            fechaPago: formatDisplayDate(abonoAAnular.fechaPago),
            fuente: abonoAAnular.fuente,
            motivo: motivoFinal
        }
    };

    await createAuditLog(
        `Anuló un abono de ${datosParaAuditoria.abono.monto} para ${datosParaAuditoria.cliente.nombre}`,
        {
            action: 'VOID_ABONO',
            ...datosParaAuditoria
        }
    );
};

export const revertirAnulacionAbono = async (abonoARevertir, userName) => {
    const viviendaRef = doc(db, "viviendas", abonoARevertir.viviendaId);
    const clienteRef = doc(db, "clientes", abonoARevertir.clienteId);
    const abonoRef = doc(db, "abonos", abonoARevertir.id);
    const abonosCollectionRef = collection(db, "abonos");

    let datosParaAuditoria = {};

    await runTransaction(db, async (transaction) => {
        const abonoDoc = await transaction.get(abonoRef);
        if (!abonoDoc.exists()) throw "El abono que intentas revertir no existe.";
        if (abonoDoc.data().estadoProceso !== 'anulado') {
            throw new Error("Solo se puede revertir la anulación de un abono que esté anulado.");
        }
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

        const proyectoRef = doc(db, "proyectos", viviendaData.proyectoId);
        const proyectoDoc = await getDoc(proyectoRef);
        const proyectoData = proyectoDoc.exists() ? proyectoDoc.data() : { nombre: 'No encontrado' };

        datosParaAuditoria = {
            cliente: {
                // ✅ Se usa `clienteDoc.id` en lugar de `clienteData.id`
                id: clienteDoc.id,
                nombre: toTitleCase(`${clienteData.datosCliente.nombres} ${clienteData.datosCliente.apellidos}`)
            },
            vivienda: {
                // ✅ Se usa `viviendaDoc.id` en lugar de `viviendaData.id`
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
                fuente: abonoARevertir.fuente
            }
        };
    });

    await createAuditLog(
        `Revirtió la anulación de un abono de ${datosParaAuditoria.abono.monto} para ${datosParaAuditoria.cliente.nombre}`,
        {
            action: 'REVERT_VOID_ABONO',
            ...datosParaAuditoria
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