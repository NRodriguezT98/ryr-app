import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from '../../firebase/config';

/**
 * Valida que un cliente pueda ser actualizado
 */
export const validateClientUpdate = async (clienteOriginal, clienteActualizado) => {
    // Validar cambio de vivienda con abonos
    if (clienteOriginal.viviendaId !== clienteActualizado.viviendaId) {
        const abonosQuery = query(
            collection(db, "abonos"),
            where("clienteId", "==", clienteOriginal.id),
            where("estadoProceso", "==", "activo")
        );
        const abonosSnap = await getDocs(abonosQuery);

        if (abonosSnap.size > 0) {
            throw new Error(
                "No se puede cambiar la vivienda de un cliente con abonos. " +
                "Use la opción 'Transferir Vivienda'."
            );
        }
    }

    // Validar cambio de fecha de ingreso
    await validateFechaIngresoChange(clienteOriginal, clienteActualizado);
};

/**
 * Valida y protege la fecha de ingreso si el cliente tiene proceso avanzado
 */
export const validateFechaIngresoChange = async (clienteOriginal, clienteActualizado) => {
    const fechaOriginal = clienteOriginal.datosCliente.fechaIngreso;
    const fechaNueva = clienteActualizado.datosCliente.fechaIngreso;

    if (fechaOriginal === fechaNueva) return;

    // Verificar abonos
    const abonosQuery = query(
        collection(db, "abonos"),
        where("clienteId", "==", clienteOriginal.id),
        where("estadoProceso", "==", "activo")
    );
    const abonosSnap = await getDocs(abonosQuery);

    // Verificar pasos completados
    const procesoOriginal = clienteOriginal.proceso || {};
    const otrosPasosCompletados = Object.keys(procesoOriginal).filter(key =>
        procesoOriginal[key]?.completado && key !== 'promesaEnviada'
    ).length;

    // Si hay abonos o pasos completados, revertir cambio
    if (abonosSnap.size > 0 || otrosPasosCompletados > 0) {
        console.warn("⚠️ Cambio de fecha de ingreso bloqueado (proceso avanzado)");
        // Revertir fecha
        clienteActualizado.datosCliente.fechaIngreso = fechaOriginal;
        if (clienteActualizado.proceso?.promesaEnviada) {
            clienteActualizado.proceso.promesaEnviada.fecha = fechaOriginal;
        }
    }
};

/**
 * Sincroniza el proceso del cliente según el plan financiero
 */
export const sincronizarProcesoConFinanciero = (financiero, procesoActual = {}) => {
    const { PROCESO_CONFIG } = require('../../utils/procesoConfig');
    const procesoSincronizado = { ...procesoActual };

    PROCESO_CONFIG.forEach(pasoConfig => {
        const aplicaAhora = pasoConfig.aplicaA(financiero);
        const existeEnProceso = procesoSincronizado[pasoConfig.key];

        if (existeEnProceso && !aplicaAhora) {
            // Paso ya no aplica -> archivarlo
            procesoSincronizado[pasoConfig.key].archivado = true;
        }

        if (!existeEnProceso && aplicaAhora) {
            // Paso nuevo que aplica -> crearlo
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
            // Paso archivado que ahora aplica -> restaurarlo
            procesoSincronizado[pasoConfig.key].archivado = false;
        }
    });

    return procesoSincronizado;
};
