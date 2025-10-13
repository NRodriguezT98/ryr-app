// src/utils/auditMessageBuilder.js
import { formatCurrency, formatDisplayDate, toTitleCase } from './textFormatters';
import { NOMBRE_FUENTE_PAGO } from './procesoConfig';

/**
 * Sistema de plantillas para mensajes de auditoría estandarizados
 * Proporciona consistencia y facilita el mantenimiento
 */

export class AuditMessageBuilder {

    /**
     * Plantillas de mensajes por tipo de acción
     */
    static templates = {

        // === GESTIÓN DE CLIENTES ===
        CREATE_CLIENT: ({ cliente, vivienda }) => ({
            message: `Registró al cliente ${cliente.nombre} y lo asignó a la vivienda ${vivienda?.display || 'no especificada'}`,
            shortMessage: `Registró cliente ${cliente.nombre}`,
            category: 'cliente'
        }),

        UPDATE_CLIENT: ({ cliente, cambiosCount, hasFiles }) => ({
            message: `Actualizó ${cambiosCount} dato${cambiosCount > 1 ? 's' : ''} del cliente ${cliente.nombre}${hasFiles ? ' (incluye archivos)' : ''}`,
            shortMessage: `Actualizó ${cliente.nombre}`,
            category: 'cliente'
        }),

        ARCHIVE_CLIENT: ({ cliente }) => ({
            message: `Archivó al cliente ${cliente.nombre}`,
            shortMessage: `Archivó ${cliente.nombre}`,
            category: 'cliente'
        }),

        RESTORE_CLIENT: ({ cliente }) => ({
            message: `Restauró al cliente ${cliente.nombre}`,
            shortMessage: `Restauró ${cliente.nombre}`,
            category: 'cliente'
        }),

        RESTART_CLIENT_PROCESS: ({ cliente, vivienda }) => ({
            message: `Reinició el proceso del cliente ${cliente.nombre} con nueva vivienda ${vivienda?.display}`,
            shortMessage: `Reinició proceso de ${cliente.nombre}`,
            category: 'proceso'
        }),

        TRANSFER_CLIENT: ({ cliente, viviendaAnterior, viviendaNueva, motivo, cambiosPlan, totalAbonos }) => {
            let message = `Transfirió a ${cliente.nombre} `;

            if (viviendaAnterior && viviendaAnterior !== 'Ninguna') {
                message += `desde ${viviendaAnterior} `;
            }

            message += `hacia ${viviendaNueva.display}`;

            if (cambiosPlan) {
                const detalles = [];
                if (cambiosPlan.valorTotal) detalles.push(`nuevo valor ${cambiosPlan.valorTotal}`);
                if (cambiosPlan.cuotaInicial) detalles.push(`cuota inicial ${cambiosPlan.cuotaInicial}`);
                if (cambiosPlan.credito) detalles.push(`crédito ${cambiosPlan.credito}`);

                if (detalles.length > 0) {
                    message += ` (${detalles.join(', ')})`;
                }
            }

            if (totalAbonos > 0) {
                message += `. Se sincronizaron ${totalAbonos} abono${totalAbonos > 1 ? 's' : ''} activo${totalAbonos > 1 ? 's' : ''}`;
            }

            if (motivo) {
                message += `. Motivo: ${motivo}`;
            }

            return {
                message,
                shortMessage: `🔄 Transfirió ${cliente.nombre}`,
                category: 'cliente'
            };
        },

        // === GESTIÓN DE PROCESO ===
        UPDATE_PROCESO: ({ cliente, paso, accion, fecha, motivo }) => {
            let baseMessage = '';

            switch (accion) {
                case 'completó':
                    baseMessage = `Completó el paso "${paso}" para ${cliente.nombre}`;
                    if (fecha && fecha !== 'no especificada') {
                        baseMessage += ` con fecha ${fecha}`;
                    }
                    break;

                case 'reabrió':
                    baseMessage = `Reabrió el paso "${paso}" para ${cliente.nombre}`;
                    if (motivo) {
                        baseMessage += `. Motivo: ${motivo}`;
                    }
                    break;

                default:
                    baseMessage = `Modificó el paso "${paso}" para ${cliente.nombre}`;
            }

            return {
                message: baseMessage,
                shortMessage: `${accion === 'completó' ? '✓' : '↻'} ${paso}`,
                category: 'proceso'
            };
        },

        // === GESTIÓN FINANCIERA ===
        REGISTER_ABONO: ({ cliente, abono, vivienda, pasoCompletado }) => {
            let message = `Registró abono N°${abono.consecutivo} para ${cliente.nombre} por ${abono.monto} vía ${abono.metodoPago}`;

            if (pasoCompletado) {
                message += ` (completó automáticamente "${pasoCompletado}")`;
            }

            return {
                message,
                shortMessage: `💰 Abono ${abono.consecutivo}`,
                category: 'financiero'
            };
        },

        REGISTER_DISBURSEMENT: ({ cliente, abono, vivienda, pasoCompletado }) => {
            const fuente = NOMBRE_FUENTE_PAGO[abono.fuente] || abono.fuente;
            let message = `Registró desembolso de "${fuente}" N°${abono.consecutivo} para ${cliente.nombre} por ${abono.monto}`;

            if (pasoCompletado) {
                message += ` (completó automáticamente "${pasoCompletado}")`;
            }

            return {
                message,
                shortMessage: `💳 Desembolso ${abono.consecutivo}`,
                category: 'financiero'
            };
        },

        VOID_ABONO: ({ cliente, abono, motivo }) => ({
            message: `Anuló ${abono.tipo || 'abono'} N°${abono.consecutivo} de ${cliente.nombre} por ${abono.monto}. Motivo: ${motivo || 'No especificado'}`,
            shortMessage: `❌ Anuló ${abono.consecutivo}`,
            category: 'financiero'
        }),

        REVERT_VOID_ABONO: ({ cliente, abono, motivo }) => ({
            message: `Revirtió anulación del ${abono.tipo || 'abono'} N°${abono.consecutivo} de ${cliente.nombre}. Motivo: ${motivo || 'No especificado'}`,
            shortMessage: `🔄 Revirtió ${abono.consecutivo}`,
            category: 'financiero'
        }),

        // === GESTIÓN DE VIVIENDAS ===
        CREATE_VIVIENDA: ({ vivienda, proyecto }) => ({
            message: `Registró la vivienda ${vivienda.display} en ${proyecto.nombre} por valor de ${formatCurrency(vivienda.valor)}`,
            shortMessage: `🏠 Registró ${vivienda.display}`,
            category: 'vivienda'
        }),

        UPDATE_VIVIENDA: ({ vivienda, cambiosCount, hasFinancialChanges }) => ({
            message: `Actualizó ${cambiosCount} dato${cambiosCount > 1 ? 's' : ''} de la vivienda ${vivienda.display}${hasFinancialChanges ? ' (incluye cambios financieros)' : ''}`,
            shortMessage: `📝 Actualizó ${vivienda.display}`,
            category: 'vivienda'
        }),

        DELETE_VIVIENDA: ({ vivienda, proyecto }) => ({
            message: `Eliminó la vivienda ${vivienda.display} de ${proyecto.nombre}`,
            shortMessage: `🗑️ Eliminó ${vivienda.display}`,
            category: 'vivienda'
        }),

        RESTORE_VIVIENDA: ({ vivienda, proyecto }) => ({
            message: `Restauró la vivienda ${vivienda.display} en ${proyecto.nombre}`,
            shortMessage: `🔄 Restauró ${vivienda.display}`,
            category: 'vivienda'
        }),

        ARCHIVE_VIVIENDA: ({ vivienda, proyecto }) => ({
            message: `Archivó la vivienda ${vivienda.display} de ${proyecto.nombre}`,
            shortMessage: `📦 Archivó ${vivienda.display}`,
            category: 'vivienda'
        }),

        // === GESTIÓN DE PROYECTOS ===
        CREATE_PROJECT: ({ proyecto }) => ({
            message: `Creó el proyecto "${proyecto.nombre}"`,
            shortMessage: `🏗️ Proyecto ${proyecto.nombre}`,
            category: 'proyecto'
        }),

        UPDATE_PROJECT: ({ proyecto, cambiosCount }) => ({
            message: `Actualizó ${cambiosCount} dato${cambiosCount > 1 ? 's' : ''} del proyecto "${proyecto.nombre}"`,
            shortMessage: `📝 Actualizó ${proyecto.nombre}`,
            category: 'proyecto'
        }),

        DELETE_PROJECT: ({ proyecto }) => ({
            message: `Eliminó el proyecto "${proyecto.nombre}"`,
            shortMessage: `🗑️ Eliminó ${proyecto.nombre}`,
            category: 'proyecto'
        }),

        // === GESTIÓN DE NOTAS ===
        ADD_NOTE: ({ cliente, nota }) => ({
            message: `Agregó una nota al cliente ${cliente.nombre}: "${nota.length > 50 ? nota.substring(0, 50) + '...' : nota}"`,
            shortMessage: `📝 Nota para ${cliente.nombre}`,
            category: 'cliente'
        }),

        EDIT_NOTE: ({ cliente, cambiosCount }) => ({
            message: `Editó una nota del cliente ${cliente.nombre}`,
            shortMessage: `✏️ Editó nota de ${cliente.nombre}`,
            category: 'cliente'
        })
    };

    /**
     * Construye un mensaje usando la plantilla apropiada
     */
    static buildMessage(actionType, context, options = {}) {
        const template = this.templates[actionType];

        if (!template) {
            console.warn(`No template found for action type: ${actionType}`);
            return this.buildFallbackMessage(actionType, context);
        }

        try {
            const result = template(context);

            // Agregar timestamp si se solicita
            if (options.includeTimestamp) {
                result.timestamp = new Date().toISOString();
            }

            // Agregar información del usuario si se proporciona
            if (options.userName) {
                result.userName = options.userName;
            }

            return result;
        } catch (error) {
            console.error(`Error building message for ${actionType}:`, error);
            return this.buildFallbackMessage(actionType, context);
        }
    }

    /**
     * Construye un mensaje de respaldo cuando falla la plantilla
     */
    static buildFallbackMessage(actionType, context) {
        return {
            message: `Realizó la acción: ${actionType}`,
            shortMessage: actionType,
            category: 'sistema'
        };
    }

    /**
     * Extrae información contextual de los detalles del log
     */
    static extractContext(details) {
        const context = {};

        // Información del cliente
        if (details.clienteId || details.cliente) {
            context.cliente = {
                id: details.clienteId || details.cliente?.id,
                nombre: details.clienteNombre || details.cliente?.nombre
            };
        }

        // Información de la vivienda
        if (details.viviendaId || details.vivienda) {
            context.vivienda = {
                id: details.viviendaId || details.vivienda?.id,
                display: details.viviendaNombre || details.vivienda?.display
            };
        }

        // Información del proyecto
        if (details.proyecto) {
            context.proyecto = {
                id: details.proyecto.id,
                nombre: details.proyecto.nombre
            };
        }

        // Información del abono
        if (details.abono) {
            context.abono = {
                consecutivo: details.abono.consecutivo,
                monto: details.abono.monto,
                fuente: details.abono.fuente,
                metodoPago: details.abono.metodoPago,
                tipo: details.abono.tipo
            };
        }

        // Información de cambios en proceso
        if (details.cambios && details.cambios.length > 0) {
            const cambio = details.cambios[0];
            context.paso = cambio.paso;
            context.accion = cambio.accion;
            context.fecha = cambio.fecha;
            context.motivo = cambio.motivo;
        }

        // Conteo de cambios
        context.cambiosCount = details.cambios?.length || 0;

        // Información sobre archivos
        context.hasFiles = details.auditDetails?.tieneArchivos || false;
        context.hasFinancialChanges = details.cambios?.some(c =>
            ['valorBase', 'valorTotal', 'recargoEsquinera'].includes(c.campo)
        ) || false;

        // Paso completado automáticamente
        context.pasoCompletado = details.pasoCompletado;

        return context;
    }

    /**
     * Construye mensaje automáticamente desde detalles del log
     */
    static buildFromDetails(actionType, details, options = {}) {
        const context = this.extractContext(details);
        return this.buildMessage(actionType, context, options);
    }

    /**
     * Valida que el contexto tenga la información mínima requerida
     */
    static validateContext(actionType, context) {
        const requirements = {
            CREATE_CLIENT: ['cliente'],
            UPDATE_CLIENT: ['cliente', 'cambiosCount'],
            REGISTER_ABONO: ['cliente', 'abono'],
            UPDATE_PROCESO: ['cliente', 'paso', 'accion'],
            CREATE_VIVIENDA: ['vivienda', 'proyecto'],
            // ... más validaciones según necesidad
        };

        const required = requirements[actionType] || [];
        const missing = required.filter(field => !context[field]);

        if (missing.length > 0) {
            console.warn(`Missing required context for ${actionType}:`, missing);
            return false;
        }

        return true;
    }

    /**
     * Obtiene todas las categorías disponibles
     */
    static getCategories() {
        const categories = new Set();

        Object.values(this.templates).forEach(template => {
            try {
                const result = template({});
                if (result.category) {
                    categories.add(result.category);
                }
            } catch (e) {
                // Ignorar errores en plantillas que requieren contexto
            }
        });

        return Array.from(categories);
    }

    /**
     * Obtiene iconos sugeridos por categoría
     */
    static getCategoryIcons() {
        return {
            cliente: '👤',
            proceso: '⚙️',
            financiero: '💰',
            vivienda: '🏠',
            proyecto: '🏗️',
            sistema: '🔧'
        };
    }
}

/**
 * Función de conveniencia para uso directo
 */
export const buildAuditMessage = (actionType, context, options) => {
    return AuditMessageBuilder.buildMessage(actionType, context, options);
};

/**
 * Función para construir mensaje desde detalles de log
 */
export const buildMessageFromDetails = (actionType, details, options) => {
    return AuditMessageBuilder.buildFromDetails(actionType, details, options);
};

export default AuditMessageBuilder;