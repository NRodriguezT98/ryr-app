/**
 * Intérprete de auditoría para el Historial del Cliente
 * 
 * Propósito: Generar mensajes DETALLADOS y ESPECÍFICOS para el historial del cliente
 * Aquí NO hay modal, así que el mensaje debe contener toda la información relevante
 */

import { formatCurrency, formatDisplayDate } from './textFormatters';

export class ClientHistoryAuditInterpreter {

    /**
     * Método principal para interpretar un log de auditoría
     */
    static interpretLog(auditLog) {
        const { actionType, context, actionData, timestamp, userName } = auditLog;

        try {
            const interpreter = this.getInterpreter(actionType);
            if (!interpreter) {
                return `${userName} realizó la acción: ${actionType}`;
            }

            const message = interpreter(context, actionData, auditLog);

            // Agregar información temporal si es relevante
            const timeInfo = this.getTimeInfo(actionData, timestamp);

            return timeInfo ? `${message} ${timeInfo}` : message;

        } catch (error) {
            console.error('Error interpretando log para historial cliente:', error);
            return `${userName || 'Usuario'} realizó una acción (${actionType}) - Error al generar detalle`;
        }
    }

    /**
     * Obtiene el intérprete específico para cada tipo de acción
     */
    static getInterpreter(actionType) {
        const interpreters = {
            // === CLIENTES ===
            'CREATE_CLIENT': this.interpretCreateClient,
            'UPDATE_CLIENT': this.interpretUpdateClient,
            'ARCHIVE_CLIENT': this.interpretArchiveClient,
            'RESTORE_CLIENT': this.interpretRestoreClient,
            'DELETE_CLIENT_PERMANENTLY': this.interpretDeleteClient,
            'COMPLETE_PROCESS_STEP': this.interpretCompleteStep,
            'REOPEN_PROCESS_STEP': this.interpretReopenStep,
            'CHANGE_COMPLETION_DATE': this.interpretChangeDates,
            'CHANGE_STEP_EVIDENCE': this.interpretChangeEvidence,
            'CLIENT_RENOUNCE': this.interpretClientRenounce,
            'ANULAR_CIERRE_PROCESO': this.interpretCancelClosure,

            // === ABONOS (que afecten al cliente) ===
            'REGISTER_ABONO': this.interpretRegisterAbono,
            'REGISTER_DISBURSEMENT': this.interpretRegisterDisbursement,
            'UPDATE_ABONO': this.interpretUpdateAbono,
            'ARCHIVE_ABONO': this.interpretArchiveAbono,

            // === VIVIENDAS (que afecten al cliente) ===
            'ASSIGN_CLIENT_TO_VIVIENDA': this.interpretAssignClient,
            'UNASSIGN_CLIENT_FROM_VIVIENDA': this.interpretUnassignClient,

            // === RENUNCIAS ===
            'CREATE_RENUNCIA': this.interpretCreateRenuncia,
            'UPDATE_RENUNCIA': this.interpretUpdateRenuncia,
            'APPROVE_RENUNCIA': this.interpretApproveRenuncia,
            'REJECT_RENUNCIA': this.interpretRejectRenuncia
        };

        return interpreters[actionType];
    }

    // ========== INTÉRPRETES DETALLADOS PARA CLIENTES ==========

    static interpretCreateClient(context, actionData, auditLog) {
        const { nombres, apellidos, tipoDocumento, numeroDocumento, telefono, email, fechaNacimiento } = actionData;

        let message = `${auditLog.userName} creó tu perfil con la información: ${nombres} ${apellidos}`;

        // Agregar detalles adicionales
        const detalles = [];
        if (tipoDocumento && numeroDocumento) {
            detalles.push(`${tipoDocumento}: ${numeroDocumento}`);
        }
        if (telefono) {
            detalles.push(`Tel: ${telefono}`);
        }
        if (email) {
            detalles.push(`Email: ${email}`);
        }
        if (fechaNacimiento) {
            detalles.push(`Nacimiento: ${formatDisplayDate(fechaNacimiento)}`);
        }

        if (detalles.length > 0) {
            message += `. Datos registrados: ${detalles.join(', ')}`;
        }

        return message;
    }

    static interpretUpdateClient(context, actionData, auditLog) {
        const { tipoActualizacion, camposEditados } = actionData;

        let message = `${auditLog.userName} actualizó tu información`;

        // Especificar qué tipo de información
        const tipos = {
            'PERSONAL_INFO': 'personal',
            'FINANCIAL_INFO': 'financiera',
            'CONTACT_INFO': 'de contacto'
        };

        const tipoTexto = tipos[tipoActualizacion];
        if (tipoTexto) {
            message += ` ${tipoTexto}`;
        }

        // Mostrar campos específicos si están disponibles
        if (camposEditados && camposEditados.length > 0) {
            const camposFormateados = this.formatFieldNames(camposEditados);
            message += `. Campos modificados: ${camposFormateados}`;
        }

        // Agregar información de cambios si está disponible
        if (auditLog.changes && auditLog.changes.fields && auditLog.changes.fields.length > 0) {
            const changeDetails = this.formatDetailedChanges(auditLog.changes);
            if (changeDetails) {
                message += `. ${changeDetails}`;
            }
        }

        return message;
    }

    static interpretCompleteStep(context, actionData, auditLog) {
        const { pasoNombre, procesoNombre, fechaComplecion, evidenciasDespues, esReComplecion, esPrimeraComplecion, fechaAnterior, cambioSoloFecha, cambioSoloEvidencias } = actionData;

        let message = '';

        // Determinar el tipo de acción
        if (cambioSoloFecha && fechaAnterior) {
            message = `${auditLog.userName} cambió la fecha de completación del paso "${pasoNombre}" del proceso "${procesoNombre}"`;
            message += ` de ${formatDisplayDate(fechaAnterior)} a ${formatDisplayDate(fechaComplecion)}`;
        } else if (cambioSoloEvidencias) {
            message = `${auditLog.userName} modificó las evidencias del paso "${pasoNombre}" del proceso "${procesoNombre}"`;
        } else if (esReComplecion) {
            message = `${auditLog.userName} re-completó el paso "${pasoNombre}" del proceso "${procesoNombre}"`;
            if (fechaAnterior) {
                message += ` (anteriormente completado el ${formatDisplayDate(fechaAnterior)})`;
            }
        } else {
            message = `${auditLog.userName} completó el paso "${pasoNombre}" del proceso "${procesoNombre}"`;
        }

        // Agregar fecha si no se mencionó antes
        if (!cambioSoloFecha && fechaComplecion) {
            message += ` el ${formatDisplayDate(fechaComplecion)}`;
        }

        // Agregar información de evidencias
        if (evidenciasDespues && evidenciasDespues.length > 0) {
            const evidenciaNames = evidenciasDespues.map(e => e.nombre || e.displayName || 'Archivo').slice(0, 3);
            message += `. Evidencias adjuntas: ${evidenciaNames.join(', ')}`;
            if (evidenciasDespues.length > 3) {
                message += ` y ${evidenciasDespues.length - 3} más`;
            }
        }

        return message;
    }

    static interpretReopenStep(context, actionData, auditLog) {
        const { pasoNombre, procesoNombre, fechaComplecion, evidenciasAntes } = actionData;

        let message = `${auditLog.userName} reabrió el paso "${pasoNombre}" del proceso "${procesoNombre}"`;

        // Información del estado anterior
        if (fechaComplecion) {
            message += ` (que estaba completado desde el ${formatDisplayDate(fechaComplecion)})`;
        }

        // Mencionar evidencias que se perdieron
        if (evidenciasAntes && evidenciasAntes.length > 0) {
            message += `. Se removieron las evidencias asociadas: ${evidenciasAntes.map(e => e.nombre || e.displayName).join(', ')}`;
        }

        return message;
    }

    static interpretChangeDates(context, actionData, auditLog) {
        const { pasoNombre, fechaComplecion, fechaAnterior } = actionData;

        let message = `${auditLog.userName} cambió la fecha de completación del paso "${pasoNombre}"`;

        if (fechaAnterior && fechaComplecion) {
            message += ` de ${formatDisplayDate(fechaAnterior)} a ${formatDisplayDate(fechaComplecion)}`;
        } else if (fechaComplecion) {
            message += ` a ${formatDisplayDate(fechaComplecion)}`;
        }

        return message;
    }

    static interpretChangeEvidence(context, actionData, auditLog) {
        const { pasoNombre, evidenciasAntes = [], evidenciasDespues = [] } = actionData;

        let message = `${auditLog.userName} modificó las evidencias del paso "${pasoNombre}"`;

        // Analizar cambios en evidencias
        const evidenceChanges = this.analyzeEvidenceChanges(evidenciasAntes, evidenciasDespues);

        if (evidenceChanges.added.length > 0) {
            message += `. Agregó: ${evidenceChanges.added.join(', ')}`;
        }

        if (evidenceChanges.removed.length > 0) {
            message += `. Removió: ${evidenceChanges.removed.join(', ')}`;
        }

        if (evidenceChanges.added.length === 0 && evidenceChanges.removed.length === 0) {
            message += ` (reemplazó archivos existentes)`;
        }

        return message;
    }

    static interpretClientRenounce(context, actionData, auditLog) {
        const { motivo, fechaRenuncia, montoDevolucion } = actionData;

        let message = `${auditLog.userName} registró tu renuncia al proyecto`;

        if (fechaRenuncia) {
            message += ` con fecha ${formatDisplayDate(fechaRenuncia)}`;
        }

        if (motivo) {
            message += `. Motivo: "${motivo}"`;
        }

        if (montoDevolucion) {
            message += `. Monto de devolución: ${formatCurrency(montoDevolucion)}`;
        }

        return message;
    }

    // ========== INTÉRPRETES PARA ABONOS ==========

    static interpretRegisterAbono(context, actionData, auditLog) {
        const { monto, montoFormateado, metodoPago, fechaPago, fuente, consecutivoFormateado, completoCuotaInicial, pasoCompletado } = actionData;

        const montoDisplay = montoFormateado || formatCurrency(monto);

        let message = `${auditLog.userName} registró un pago de ${montoDisplay}`;

        if (metodoPago) {
            message += ` mediante ${metodoPago}`;
        }

        if (fechaPago) {
            message += ` con fecha ${formatDisplayDate(fechaPago)}`;
        }

        if (consecutivoFormateado) {
            message += ` (Consecutivo: ${consecutivoFormateado})`;
        }

        // Información adicional sobre el tipo de pago
        if (fuente === 'cuotaInicial') {
            message += ` aplicado a tu Cuota Inicial`;
            if (completoCuotaInicial) {
                message += `. ¡Con este pago se completó el saldo de tu Cuota Inicial!`;
            }
        } else if (fuente === 'credito') {
            message += ` aplicado a tu Crédito`;
        }

        // Información sobre pasos completados automáticamente
        if (pasoCompletado) {
            message += ` y se marcó como completado el paso "${pasoCompletado}"`;
        }

        return message;
    }

    static interpretRegisterDisbursement(context, actionData, auditLog) {
        const { monto, montoFormateado, metodoPago, fechaPago, consecutivoFormateado, descripcion } = actionData;

        const montoDisplay = montoFormateado || formatCurrency(monto);

        let message = `${auditLog.userName} registró un desembolso de ${montoDisplay}`;

        if (fechaPago) {
            message += ` con fecha ${formatDisplayDate(fechaPago)}`;
        }

        if (consecutivoFormateado) {
            message += ` (Consecutivo: ${consecutivoFormateado})`;
        }

        if (descripcion) {
            message += `. Descripción: "${descripcion}"`;
        }

        return message;
    }

    // ========== INTÉRPRETES PARA VIVIENDAS ==========

    static interpretAssignClient(context, actionData, auditLog) {
        const viviendaDisplay = `Mz ${context.vivienda.manzana} - Casa ${context.vivienda.numeroCasa}`;
        const proyecto = context.proyecto?.nombre || 'el proyecto';

        return `${auditLog.userName} te asignó la vivienda ${viviendaDisplay} en ${proyecto}`;
    }

    static interpretUnassignClient(context, actionData, auditLog) {
        const viviendaDisplay = `Mz ${context.vivienda.manzana} - Casa ${context.vivienda.numeroCasa}`;

        let message = `${auditLog.userName} removió tu asignación de la vivienda ${viviendaDisplay}`;

        if (actionData.motivo) {
            message += `. Motivo: "${actionData.motivo}"`;
        }

        return message;
    }

    // ========== MÉTODOS AUXILIARES ==========

    /**
     * Analiza cambios en evidencias
     */
    static analyzeEvidenceChanges(before, after) {
        const beforeNames = (before || []).map(e => e.nombre || e.displayName || 'Archivo');
        const afterNames = (after || []).map(e => e.nombre || e.displayName || 'Archivo');

        const added = afterNames.filter(name => !beforeNames.includes(name));
        const removed = beforeNames.filter(name => !afterNames.includes(name));

        return { added, removed };
    }

    /**
     * Formatea nombres de campos para mostrar
     */
    static formatFieldNames(fields) {
        const fieldTranslations = {
            'nombres': 'nombres',
            'apellidos': 'apellidos',
            'tipoDocumento': 'tipo de documento',
            'numeroDocumento': 'número de documento',
            'telefono': 'teléfono',
            'email': 'email',
            'fechaNacimiento': 'fecha de nacimiento',
            'genero': 'género',
            'cuotaInicial': 'cuota inicial',
            'credito': 'crédito'
        };

        return fields.map(field => fieldTranslations[field] || field).join(', ');
    }

    /**
     * Formatea cambios detallados
     */
    static formatDetailedChanges(changes) {
        if (!changes.before || !changes.after || !changes.fields) {
            return null;
        }

        const changeDescriptions = [];

        for (const field of changes.fields.slice(0, 3)) { // Limitar a 3 cambios
            const before = changes.before[field];
            const after = changes.after[field];

            if (before && after && before !== after) {
                const fieldName = this.formatFieldNames([field]);
                changeDescriptions.push(`${fieldName}: "${before}" → "${after}"`);
            }
        }

        let result = changeDescriptions.join(', ');

        if (changes.fields.length > 3) {
            result += ` y ${changes.fields.length - 3} cambios más`;
        }

        return result ? `Cambios: ${result}` : null;
    }

    /**
     * Obtiene información temporal relevante
     */
    static getTimeInfo(actionData, timestamp) {
        // Por ahora, no agregamos información temporal adicional
        // Esto se podría expandir para mostrar "hace X tiempo" o fechas específicas
        return null;
    }
}

// Función de conveniencia para uso directo
export const interpretAuditForClientHistory = (auditLog) => {
    return ClientHistoryAuditInterpreter.interpretLog(auditLog);
};