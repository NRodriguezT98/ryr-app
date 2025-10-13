/**
 * clienteTransferencia.js
 * 
 * Módulo para gestión de transferencia de viviendas entre clientes.
 * Maneja la actualización de cliente, viviendas (original y nueva) y abonos asociados.
 */

import { doc, getDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { createClientAuditLog } from '../unifiedAuditService';
import { PROCESO_CONFIG } from '../../utils/procesoConfig';
import { AuditMessageBuilder } from '../../utils/auditMessageBuilder';
import { formatCurrency } from '../../utils/textFormatters';

/**
 * Convierte el plan financiero del formato de formulario al formato normalizado
 * para guardar en el cliente y en la auditoría
 * 
 * IMPORTANTE: Mantiene TODOS los datos originales del formulario para preservar
 * información detallada como banco, caja, URLs de cartas, etc.
 */
const normalizarPlanFinanciero = (planFormulario, valorVivienda) => {
    // Si es null o undefined, retornar null
    if (!planFormulario) return null;

    // Determinar fuente de pago principal
    let fuenteDePago = 'directo';
    if (planFormulario.aplicaSubsidioVivienda || planFormulario.aplicaSubsidioCaja) {
        fuenteDePago = 'subsidio';
    } else if (planFormulario.aplicaCredito) {
        fuenteDePago = 'banco';
    }

    // Calcular totales para resumen
    const totalAporte = planFormulario.aplicaCuotaInicial ? (planFormulario.cuotaInicial?.monto || 0) : 0;
    const totalBanco = planFormulario.aplicaCredito ? (planFormulario.credito?.monto || 0) : 0;

    // CORRECCIÓN: Calcular subsidios por separado para el total, pero mantener individuales
    const montoSubsidioVivienda = planFormulario.aplicaSubsidioVivienda ? (planFormulario.subsidioVivienda?.monto || 0) : 0;
    const montoSubsidioCaja = planFormulario.aplicaSubsidioCaja ? (planFormulario.subsidioCaja?.monto || 0) : 0;
    const totalBonos = montoSubsidioVivienda + montoSubsidioCaja;

    // Retornar plan normalizado completo con TODOS los detalles originales
    return {
        // Campos normalizados/calculados (para resumen y comparaciones)
        fuenteDePago,
        valorInicial: valorVivienda || 0,
        totalAporte,
        totalBanco,
        totalBonos,

        // Detalles de crédito (si aplica)
        cuotasMensuales: planFormulario.aplicaCredito ? (planFormulario.credito?.cuotas || 0) : 0,
        valorCuotaMensual: planFormulario.aplicaCredito ? (planFormulario.credito?.valorCuota || 0) : 0,

        // PRESERVAR TODOS los datos originales del formulario
        // Esto incluye: banco, caja, URLs de cartas, casos, etc.
        aplicaCuotaInicial: planFormulario.aplicaCuotaInicial,
        cuotaInicial: planFormulario.cuotaInicial,

        aplicaCredito: planFormulario.aplicaCredito,
        credito: planFormulario.credito, // Incluye: banco, monto, caso, urlCartaAprobacion, cuotas, valorCuota

        aplicaSubsidioVivienda: planFormulario.aplicaSubsidioVivienda,
        subsidioVivienda: planFormulario.subsidioVivienda, // Incluye: monto

        aplicaSubsidioCaja: planFormulario.aplicaSubsidioCaja,
        subsidioCaja: planFormulario.subsidioCaja, // Incluye: caja, monto, urlCartaAprobacion

        usaValorEscrituraDiferente: planFormulario.usaValorEscrituraDiferente,
        valorEscritura: planFormulario.valorEscritura
    };
};

/**
 * Transfiere un cliente de una vivienda a otra.
 * 
 * Realiza las siguientes operaciones en batch:
 * - Actualiza cliente con nueva vivienda y plan financiero
 * - Resetea proceso del cliente según nuevo plan financiero
 * - Desasigna vivienda original (si existe)
 * - Asigna nueva vivienda al cliente
 * - Sincroniza todos los abonos activos con nueva vivienda
 * - Registra auditoría con snapshot de ambos planes financieros
 * 
 * @param {object} params - Parámetros de transferencia.
 * @param {string} params.clienteId - ID del cliente a transferir.
 * @param {string|null} params.viviendaOriginalId - ID de la vivienda actual (puede ser null si es primera asignación).
 * @param {string} params.nuevaViviendaId - ID de la nueva vivienda.
 * @param {string} params.motivo - Motivo de la transferencia (para auditoría).
 * @param {object} params.nuevoPlanFinanciero - Nuevo plan financiero del cliente.
 * @param {string} params.nombreCliente - Nombre completo del cliente (para auditoría y vivienda).
 * 
 * @throws {Error} Si el cliente no existe.
 * @throws {Error} Si la nueva vivienda no existe.
 * @throws {Error} Si la nueva vivienda ya está ocupada.
 * 
 * @example
 * await transferirViviendaCliente({
 *   clienteId: 'cliente123',
 *   viviendaOriginalId: 'vivienda456',
 *   nuevaViviendaId: 'vivienda789',
 *   motivo: 'Cliente solicitó cambio por mejor ubicación',
 *   nuevoPlanFinanciero: {
 *     fuenteDePago: 'subsidio',
 *     valorInicial: 50000000,
 *     totalBonos: 45000000,
 *     totalBanco: 0,
 *     totalAporte: 5000000
 *   },
 *   nombreCliente: 'Juan Pérez'
 * });
 */
export const transferirViviendaCliente = async ({
    clienteId,
    viviendaOriginalId,
    nuevaViviendaId,
    motivo,
    nuevoPlanFinanciero,
    nombreCliente
}) => {
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

        // Validar que el cliente esté activo
        if (clienteOriginal.status !== 'activo') {
            throw new Error("Solo se pueden transferir clientes con estado 'activo'. Estado actual: " + (clienteOriginal.status || 'indefinido'));
        }
        // --- FIN DE LA MODIFICACIÓN 1 ---

        // Validar nueva vivienda
        const nuevaViviendaSnap = await getDoc(nuevaViviendaRef);

        if (!nuevaViviendaSnap.exists()) {
            throw new Error("La nueva vivienda seleccionada no existe.");
        }
        if (nuevaViviendaSnap.data().clienteId) {
            throw new Error("Esta vivienda ya fue ocupada por otro cliente. Por favor, refresque y seleccione otra.");
        }
        const nuevaViviendaData = nuevaViviendaSnap.data();

        // Normalizar el plan financiero del formulario al formato estándar
        const planFinancieroNormalizado = normalizarPlanFinanciero(nuevoPlanFinanciero, nuevaViviendaData.valorTotal);

        // Leer datos de la vivienda anterior (si existe) para auditoría
        let viviendaAnteriorData = null;
        if (viviendaOriginalId) {
            const viviendaOriginalRef = doc(db, 'viviendas', viviendaOriginalId);
            const viviendaOriginalSnap = await getDoc(viviendaOriginalRef);
            if (viviendaOriginalSnap.exists()) {
                viviendaAnteriorData = viviendaOriginalSnap.data();
            }
        }

        // Buscar abonos activos que deben sincronizarse con la nueva vivienda
        const abonosQuery = query(
            collection(db, "abonos"),
            where("clienteId", "==", clienteId),
            where("estadoProceso", "==", "activo")
        );
        const abonosASincronizar = await getDocs(abonosQuery);

        // Generar nuevo proceso según el plan financiero
        const nuevoProceso = {};
        PROCESO_CONFIG.forEach(paso => {
            if (paso.aplicaA(planFinancieroNormalizado)) {
                const evidencias = {};
                paso.evidenciasRequeridas.forEach(ev => {
                    evidencias[ev.id] = { url: null, estado: 'pendiente' };
                });
                nuevoProceso[paso.key] = {
                    completado: false,
                    fecha: null,
                    evidencias,
                    archivado: false
                };
            }
        });

        // Batch write para atomicidad
        const batch = writeBatch(db);

        // Actualizar cliente con nueva vivienda, plan financiero normalizado y proceso reseteado
        batch.update(clienteRef, {
            viviendaId: nuevaViviendaId,
            financiero: planFinancieroNormalizado,
            proceso: nuevoProceso
        });

        // Desasignar vivienda original (si existe)
        if (viviendaOriginalId) {
            const viviendaOriginalRef = doc(db, 'viviendas', viviendaOriginalId);
            batch.update(viviendaOriginalRef, {
                clienteId: null,
                clienteNombre: ""
            });
        }

        // Asignar nueva vivienda al cliente
        batch.update(nuevaViviendaRef, {
            clienteId: clienteId,
            clienteNombre: nombreCliente
        });

        // Sincronizar todos los abonos activos con la nueva vivienda
        abonosASincronizar.forEach((abonoDoc) => {
            batch.update(abonoDoc.ref, { viviendaId: nuevaViviendaId });
        });

        await batch.commit();

        // Construir mensaje de auditoría con el builder
        const viviendaAnteriorDisplay = viviendaOriginalId
            ? `Vivienda anterior (ID: ${viviendaOriginalId})`
            : null;

        const viviendaNuevaDisplay = `Mz ${nuevaViviendaData.manzana} - Casa ${nuevaViviendaData.numeroCasa}`;

        // Detectar cambios en el plan financiero
        const planAnterior = clienteOriginal.financiero || {};
        const cambiosPlan = {};

        if (planAnterior.valorInicial !== planFinancieroNormalizado.valorInicial) {
            cambiosPlan.valorTotal = formatCurrency(planFinancieroNormalizado.valorInicial);
        }

        if (planAnterior.totalAporte !== planFinancieroNormalizado.totalAporte) {
            cambiosPlan.cuotaInicial = formatCurrency(planFinancieroNormalizado.totalAporte);
        }

        if (planAnterior.totalBanco !== planFinancieroNormalizado.totalBanco) {
            cambiosPlan.credito = formatCurrency(planFinancieroNormalizado.totalBanco);
        }

        const totalAbonos = abonosASincronizar.size;

        // Registrar auditoría con estructura unificada (PATRÓN ESTÁNDAR)
        await createClientAuditLog(
            'TRANSFER_CLIENT',
            {
                id: clienteId,
                nombre: nombreCliente
            },
            {
                viviendaId: nuevaViviendaId,
                vivienda: {
                    id: nuevaViviendaId,
                    manzana: nuevaViviendaData.manzana,
                    numeroCasa: nuevaViviendaData.numeroCasa
                },
                actionData: {
                    // Documento del cliente
                    cedula: clienteOriginal.datosCliente?.cedula,
                    numeroDocumento: clienteOriginal.datosCliente?.cedula,

                    // Vivienda anterior
                    viviendaAnterior: viviendaOriginalId ? {
                        id: viviendaOriginalId,
                        manzana: viviendaAnteriorData?.manzana,
                        numeroCasa: viviendaAnteriorData?.numeroCasa,
                        valorTotal: viviendaAnteriorData?.valorTotal
                    } : null,

                    // Vivienda nueva
                    viviendaNueva: {
                        id: nuevaViviendaId,
                        ubicacion: viviendaNuevaDisplay,
                        manzana: nuevaViviendaData.manzana,
                        numeroCasa: nuevaViviendaData.numeroCasa,
                        valorTotal: nuevaViviendaData.valorTotal
                    },

                    // Motivo
                    motivo,

                    // Plan financiero
                    planFinanciero: {
                        anterior: planAnterior,
                        nuevo: planFinancieroNormalizado,
                        cambios: cambiosPlan
                    },

                    // Abonos
                    abonosSincronizados: {
                        cantidad: totalAbonos,
                        ids: abonosASincronizar.docs.map(doc => doc.id)
                    },

                    // Proceso
                    procesoReseteado: true,
                    pasosNuevoProceso: Object.keys(nuevoProceso)
                }
            }
        );

    } catch (error) {
        console.error("Error en la operación de transferencia de vivienda: ", error);
        throw error;
    }
};
