/**
 * Intérprete de auditoría para el Panel de Administración
 * 
 * Propósito: Generar mensajes CORTOS y DESCRIPTIVOS para la lista del panel admin
 * Los usuarios podrán ver el detalle completo en la modal correspondiente
 */

import { formatCurrency } from './textFormatters';
import { formatDisplayDate } from '../services/dataService';

export class AdminPanelAuditInterpreter {

    /**
     * Método principal para interpretar un log de auditoría
     */
    static interpretLog(auditLog) {
        const { actionType, context, actionData } = auditLog;

        try {
            const interpreter = this.getInterpreter(actionType);
            if (!interpreter) {
                return `Acción: ${actionType}`;
            }

            return interpreter(context, actionData, auditLog);

        } catch (error) {
            console.error('Error interpretando log para admin panel:', error);
            return `Error interpretando acción: ${actionType}`;
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

            // === VIVIENDAS ===
            'CREATE_VIVIENDA': this.interpretCreateVivienda,
            'UPDATE_VIVIENDA': this.interpretUpdateVivienda,
            'ASSIGN_CLIENT_TO_VIVIENDA': this.interpretAssignClient,
            'UNASSIGN_CLIENT_FROM_VIVIENDA': this.interpretUnassignClient,

            // === ABONOS ===
            'REGISTER_ABONO': this.interpretRegisterAbono,
            'REGISTER_DISBURSEMENT': this.interpretRegisterDisbursement,
            'UPDATE_ABONO': this.interpretUpdateAbono,
            'ARCHIVE_ABONO': this.interpretArchiveAbono,

            // === RENUNCIAS ===
            'CREATE_RENUNCIA': this.interpretCreateRenuncia,
            'UPDATE_RENUNCIA': this.interpretUpdateRenuncia,
            'APPROVE_RENUNCIA': this.interpretApproveRenuncia,
            'REJECT_RENUNCIA': this.interpretRejectRenuncia,

            // === PROYECTOS ===
            'CREATE_PROYECTO': this.interpretCreateProyecto,
            'UPDATE_PROYECTO': this.interpretUpdateProyecto
        };

        return interpreters[actionType];
    }

    // ========== INTÉRPRETES PARA CLIENTES ==========

    static interpretCreateClient(context, actionData) {
        const clienteName = `${actionData.nombres} ${actionData.apellidos}`;
        return `Creó al cliente ${clienteName}`;
    }

    static interpretUpdateClient(context, actionData) {
        const clienteName = context.cliente.nombre;
        const tipoUpdate = actionData.tipoActualizacion;

        const tipos = {
            'PERSONAL_INFO': 'información personal',
            'FINANCIAL_INFO': 'información financiera',
            'CONTACT_INFO': 'información de contacto'
        };

        const tipoTexto = tipos[tipoUpdate] || 'información';
        return `Editó ${tipoTexto} de ${clienteName}`;
    }

    static interpretArchiveClient(context, actionData) {
        return `Archivó al cliente ${context.cliente.nombre}`;
    }

    static interpretRestoreClient(context, actionData) {
        return `Restauró al cliente ${context.cliente.nombre}`;
    }

    static interpretDeleteClient(context, actionData) {
        return `Eliminó permanentemente al cliente ${context.cliente.nombre}`;
    }

    static interpretCompleteStep(context, actionData) {
        const clienteName = context.cliente.nombre;
        const stepName = actionData.pasoNombre;

        if (actionData.esReComplecion) {
            return `Re-completó paso "${stepName}" de ${clienteName}`;
        } else {
            return `Completó paso "${stepName}" de ${clienteName}`;
        }
    }

    static interpretReopenStep(context, actionData) {
        return `Reabrió paso "${actionData.pasoNombre}" de ${context.cliente.nombre}`;
    }

    static interpretChangeDates(context, actionData) {
        return `Cambió fecha de "${actionData.pasoNombre}" de ${context.cliente.nombre}`;
    }

    static interpretChangeEvidence(context, actionData) {
        return `Modificó evidencias de "${actionData.pasoNombre}" de ${context.cliente.nombre}`;
    }

    static interpretClientRenounce(context, actionData) {
        return `Registró renuncia de ${context.cliente.nombre}`;
    }

    static interpretCancelClosure(context, actionData) {
        return `Anuló cierre de proceso de ${context.cliente.nombre}`;
    }

    // ========== INTÉRPRETES PARA VIVIENDAS ==========

    static interpretCreateVivienda(context, actionData) {
        const viviendaDisplay = `Mz ${context.vivienda.manzana} - Casa ${context.vivienda.numeroCasa}`;
        return `Creó vivienda ${viviendaDisplay}`;
    }

    static interpretUpdateVivienda(context, actionData) {
        const viviendaDisplay = `Mz ${context.vivienda.manzana} - Casa ${context.vivienda.numeroCasa}`;
        return `Editó vivienda ${viviendaDisplay}`;
    }

    static interpretAssignClient(context, actionData) {
        const viviendaDisplay = `Mz ${context.vivienda.manzana} - Casa ${context.vivienda.numeroCasa}`;
        return `Asignó ${context.cliente.nombre} a ${viviendaDisplay}`;
    }

    static interpretUnassignClient(context, actionData) {
        const viviendaDisplay = `Mz ${context.vivienda.manzana} - Casa ${context.vivienda.numeroCasa}`;
        return `Desasignó cliente de ${viviendaDisplay}`;
    }

    // ========== INTÉRPRETES PARA ABONOS ==========

    static interpretRegisterAbono(context, actionData) {
        const clienteName = context.cliente.nombre;
        const monto = actionData.montoFormateado || formatCurrency(actionData.monto);
        return `Registró pago de ${monto} para ${clienteName}`;
    }

    static interpretRegisterDisbursement(context, actionData) {
        const clienteName = context.cliente.nombre;
        const monto = actionData.montoFormateado || formatCurrency(actionData.monto);
        return `Registró desembolso de ${monto} para ${clienteName}`;
    }

    static interpretUpdateAbono(context, actionData) {
        const clienteName = context.cliente.nombre;
        const consecutivo = actionData.consecutivoFormateado || `#${actionData.consecutivo}`;
        return `Editó abono ${consecutivo} de ${clienteName}`;
    }

    static interpretArchiveAbono(context, actionData) {
        const consecutivo = actionData.consecutivoFormateado || `#${actionData.consecutivo}`;
        return `Archivó abono ${consecutivo}`;
    }

    // ========== INTÉRPRETES PARA RENUNCIAS ==========

    static interpretCreateRenuncia(context, actionData) {
        return `Creó solicitud de renuncia para ${context.cliente.nombre}`;
    }

    static interpretUpdateRenuncia(context, actionData) {
        return `Editó solicitud de renuncia de ${context.cliente.nombre}`;
    }

    static interpretApproveRenuncia(context, actionData) {
        return `Aprobó renuncia de ${context.cliente.nombre}`;
    }

    static interpretRejectRenuncia(context, actionData) {
        return `Rechazó renuncia de ${context.cliente.nombre}`;
    }

    // ========== INTÉRPRETES PARA PROYECTOS ==========

    static interpretCreateProyecto(context, actionData) {
        return `Creó proyecto "${context.proyecto.nombre}"`;
    }

    static interpretUpdateProyecto(context, actionData) {
        return `Editó proyecto "${context.proyecto.nombre}"`;
    }

    // ========== MÉTODOS AUXILIARES ==========

    /**
     * Obtiene un resumen de los campos cambiados (útil para acciones de edición)
     */
    static getChangeSummary(changes, maxFields = 3) {
        if (!changes || !changes.fields || changes.fields.length === 0) {
            return '';
        }

        const fieldNames = changes.fields.slice(0, maxFields);
        let summary = fieldNames.join(', ');

        if (changes.fields.length > maxFields) {
            const remaining = changes.fields.length - maxFields;
            summary += ` y ${remaining} más`;
        }

        return ` (${summary})`;
    }

    /**
     * Formatear lista de elementos para mostrar
     */
    static formatList(items, maxItems = 2) {
        if (!items || items.length === 0) return '';

        if (items.length <= maxItems) {
            return items.join(', ');
        }

        const visible = items.slice(0, maxItems);
        const remaining = items.length - maxItems;
        return `${visible.join(', ')} y ${remaining} más`;
    }
}

// Función de conveniencia para uso directo
export const interpretAuditForAdmin = (auditLog) => {
    return AdminPanelAuditInterpreter.interpretLog(auditLog);
};