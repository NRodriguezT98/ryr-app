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
            'TRANSFER_CLIENT': this.interpretTransferClient,
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
        const { tipoActualizacion, camposEditados, cambios } = actionData;

        // INFORMACIÓN DEL CLIENTE Y VIVIENDA
        const clienteNombre = context?.cliente?.nombre || 'Cliente';
        const clienteDocumento = context?.cliente?.documento || 'Sin documento';
        const viviendaManzana = context?.vivienda?.manzana || '?';
        const viviendaCasa = context?.vivienda?.numeroCasa || '?';

        // NUEVO FORMATO DE ENCABEZADO CON MARCADORES DE ICONOS
        let message = `${auditLog.userName} actualizó la información del cliente:\n`;
        message += `\n[ICON:USER] **Cliente:** ${clienteNombre}`;
        message += `\n[ICON:FILE] **Número de Cédula:** ${clienteDocumento}`;
        message += `\n[ICON:HOME] **Vivienda:** Manzana ${viviendaManzana} - Casa ${viviendaCasa}`;

        // PRIORIDAD 1: Si hay array 'cambios' del nuevo sistema, mostrar TODOS los cambios organizados
        if (cambios && Array.isArray(cambios) && cambios.length > 0) {
            message += '\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

            // Separar cambios regulares de archivos
            const cambiosRegulares = cambios.filter(c => !c.fileChange);
            const cambiosArchivos = cambios.filter(c => c.fileChange);

            // Mostrar cambios regulares con iconos apropiados
            if (cambiosRegulares.length > 0) {
                message += '\n[ICON:PENCIL] **Datos modificados:**';
                cambiosRegulares.forEach((cambio, index) => {
                    const fieldName = ClientHistoryAuditInterpreter.formatFieldNames([cambio.campo]);
                    const anterior = cambio.anterior || '(vacío)';
                    const actual = cambio.actual || '(vacío)';

                    message += `\n  ${index + 1}. **${fieldName}**`;
                    message += `\n     [ICON:ARROW] Anterior: "${anterior}"`;
                    message += `\n     [ICON:ARROW] Nuevo: "${actual}"`;
                });
            }

            // Mostrar cambios de archivos con iconos y enlaces
            if (cambiosArchivos.length > 0) {
                message += '\n\n[ICON:PAPERCLIP] **Archivos modificados:**';
                cambiosArchivos.forEach((cambio, index) => {
                    const fieldName = ClientHistoryAuditInterpreter.formatFieldNames([cambio.campo]);

                    if (cambio.accion === 'agregado') {
                        message += `\n  ${index + 1}. **${fieldName}** [ICON:CHECK-GREEN] Archivo agregado`;
                        message += `\n     [ICON:ARROW] "${cambio.nombreArchivo}"`;
                        if (cambio.urlNuevo) {
                            message += ` [Ver archivo](${cambio.urlNuevo})`;
                        }
                    } else if (cambio.accion === 'reemplazado') {
                        message += `\n  ${index + 1}. **${fieldName}** [ICON:REFRESH] Archivo reemplazado`;
                        if (cambio.urlAnterior && cambio.nombreArchivoAnterior) {
                            message += `\n     [ICON:X-RED] Anterior: [${cambio.nombreArchivoAnterior}](${cambio.urlAnterior})`;
                        }
                        if (cambio.urlNuevo && cambio.nombreArchivo) {
                            message += `\n     [ICON:CHECK-GREEN] Nuevo: [${cambio.nombreArchivo}](${cambio.urlNuevo})`;
                        }
                    } else if (cambio.accion === 'eliminado') {
                        message += `\n  ${index + 1}. **${fieldName}** [ICON:X-RED] Archivo eliminado`;
                        message += `\n     [ICON:ARROW] "${cambio.nombreArchivo}"`;
                        if (cambio.urlAnterior) {
                            message += ` [Ver eliminado](${cambio.urlAnterior})`;
                        }
                    }
                });
            }

            message += '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

            return message;
        }

        // FALLBACK 1: Mostrar campos específicos si están disponibles
        if (camposEditados && camposEditados.length > 0) {
            const camposFormateados = ClientHistoryAuditInterpreter.formatFieldNames(camposEditados);
            message += `\n\n📝 Campos modificados: ${camposFormateados}`;
        }

        // FALLBACK 2: Agregar información de cambios si está disponible (formato antiguo)
        if (auditLog.changes && auditLog.changes.fields && auditLog.changes.fields.length > 0) {
            const changeDetails = ClientHistoryAuditInterpreter.formatDetailedChanges(auditLog.changes);
            if (changeDetails) {
                message += `\n\n${changeDetails}`;
            }
        }

        return message;
    }

    static interpretTransferClient(context, actionData, auditLog) {
        // Retornar datos estructurados para el componente TransferMessage
        return {
            __renderAsComponent: 'TransferMessage',
            clienteNombre: context?.cliente?.nombre || 'Cliente',
            clienteDocumento: actionData?.cedula || actionData?.numeroDocumento || context?.cliente?.documento || 'Sin documento',
            viviendaActual: {
                manzana: context?.vivienda?.manzana || '?',
                numeroCasa: context?.vivienda?.numeroCasa || '?'
            },
            motivo: actionData?.motivo || null,
            viviendaAnterior: actionData?.viviendaAnterior || null,
            viviendaNueva: actionData?.viviendaNueva || null,
            planAnterior: actionData?.planFinanciero?.anterior || null,
            planNuevo: actionData?.planFinanciero?.nuevo || null,
            abonosSincronizados: actionData?.abonosSincronizados || null,
            procesoReseteado: actionData?.procesoReseteado || false,
            pasosNuevoProceso: actionData?.pasosNuevoProceso || null
        };
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
        // Si tiene actionData completo, usar componente estructurado (FASE 2)
        if (actionData && actionData.motivo && actionData.viviendaInfo) {
            return {
                __renderAsComponent: 'RenounceMessage',
                motivo: actionData.motivo,
                observacion: actionData.observacion,
                fechaRenuncia: actionData.fechaRenuncia,
                viviendaInfo: actionData.viviendaInfo,
                totalAbonado: actionData.totalAbonado || 0,
                penalidadMonto: actionData.penalidadMonto || 0,
                penalidadMotivo: actionData.penalidadMotivo || '',
                totalADevolver: actionData.totalADevolver || 0,
                estadoDevolucion: actionData.estadoDevolucion || 'Pendiente',
                historialAbonos: actionData.historialAbonos || [],
                documentosArchivados: actionData.documentosArchivados || []
            };
        }

        // Fallback para logs antiguos sin actionData completo (FASE 1)
        const { motivo, fechaRenuncia, montoDevolucion } = actionData || {};

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
            // Datos personales
            'nombres': 'Nombres',
            'apellidos': 'Apellidos',
            'tipoDocumento': 'Tipo de Documento',
            'numeroDocumento': 'Número de Documento',
            'cedula': 'Número de Documento',
            'telefono': 'Teléfono',
            'email': 'Correo Electrónico',
            'correo': 'Correo Electrónico',
            'fechaNacimiento': 'Fecha de Nacimiento',
            'genero': 'Género',
            'direccion': 'Dirección',

            // Datos financieros
            'cuotaInicial': 'Cuota Inicial',
            'credito': 'Crédito',
            'totalAPagar': 'Total a Pagar',
            'saldoCuotaInicial': 'Saldo Cuota Inicial',
            'saldoCredito': 'Saldo Crédito',

            // Fuentes de pago
            'Crédito Hipotecario': 'Crédito Hipotecario',
            'Crédito Hipotecario - Banco': 'Banco (Crédito Hipotecario)',
            'Crédito Hipotecario - Monto': 'Monto (Crédito Hipotecario)',
            'Crédito Hipotecario - Referencia': 'Referencia (Crédito Hipotecario)',
            'Carta Aprob. Crédito': 'Carta de Aprobación (Crédito)',

            'Subsidio de Caja': 'Subsidio de Caja',
            'Subsidio de Caja - Caja': 'Caja (Subsidio)',
            'Subsidio de Caja - Monto': 'Monto (Subsidio)',
            'Subsidio de Caja - Referencia': 'Referencia (Subsidio)',
            'Carta Aprob. Caja': 'Carta de Aprobación (Subsidio)',

            'Crédito Constructor': 'Crédito Constructor',
            'Crédito Constructor - Monto': 'Monto (Crédito Constructor)',

            // Archivos
            'cedulaCiudadania': 'Copia de la Cédula',
            'Copia de la Cédula': 'Copia de la Cédula',
            'fotoCasa': 'Foto de la Casa',
            'certificadoTradicionLibertad': 'Certificado de Tradición y Libertad',
            'escrituras': 'Escrituras',

            // Otros
            'estado': 'Estado',
            'estadoProceso': 'Estado del Proceso',
            'vivienda': 'Vivienda',
            'fechaIngreso': 'Fecha de Ingreso'
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