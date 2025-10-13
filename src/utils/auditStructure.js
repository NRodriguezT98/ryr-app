/**
 * Nueva estructura unificada de auditoría
 * 
 * Filosofía:
 * 1. Capturamos TODA la información cruda de la acción
 * 2. NO generamos mensajes al momento de crear el log
 * 3. Cada vista (Admin Panel vs Historial Cliente) tiene su propio intérprete
 * 4. Los intérpretes procesan los datos crudos según el contexto
 */

/**
 * Estructura base para todos los logs de auditoría
 */
export const AUDIT_STRUCTURE = {
    // Metadatos básicos (siempre presentes)
    timestamp: null,
    userId: null,
    userName: null,

    // Identificación de la acción
    actionType: null,      // Ej: 'COMPLETE_PROCESS_STEP', 'UPDATE_CLIENT', 'REGISTER_ABONO'
    module: null,          // Ej: 'CLIENTES', 'VIVIENDAS', 'ABONOS', 'RENUNCIAS'

    // Mensaje pre-generado (opcional, para usar plantillas FASE 2)
    message: null,         // Mensaje espectacular generado por las plantillas

    // Entidades afectadas (IDs para relaciones)
    entities: {
        clienteId: null,
        viviendaId: null,
        abonoId: null,
        renunciaId: null,
        proyectoId: null
    },

    // Datos contextuales de las entidades (para mostrar sin consultas adicionales)
    context: {
        cliente: {
            id: null,
            nombre: null,
            documento: null
        },
        vivienda: {
            id: null,
            manzana: null,
            numeroCasa: null,
            proyecto: null
        },
        proyecto: {
            id: null,
            nombre: null
        }
    },

    // Datos específicos de la acción (raw data)
    actionData: {
        // Aquí va toda la información específica de cada tipo de acción
        // Sin procesar, sin formatear, tal como viene
    },

    // Cambios realizados (para acciones de edición)
    changes: {
        before: null,   // Estado anterior
        after: null,    // Estado nuevo
        fields: []      // Array de campos que cambiaron
    }
};

/**
 * Definiciones de tipos de acciones por módulo
 */
export const ACTION_TYPES = {
    CLIENTES: {
        CREATE_CLIENT: 'CREATE_CLIENT',
        UPDATE_CLIENT: 'UPDATE_CLIENT',
        TRANSFER_CLIENT: 'TRANSFER_CLIENT',
        ARCHIVE_CLIENT: 'ARCHIVE_CLIENT',
        RESTORE_CLIENT: 'RESTORE_CLIENT',
        DELETE_CLIENT: 'DELETE_CLIENT_PERMANENTLY',
        COMPLETE_PROCESS_STEP: 'COMPLETE_PROCESS_STEP',
        REOPEN_PROCESS_STEP: 'REOPEN_PROCESS_STEP',
        CHANGE_COMPLETION_DATE: 'CHANGE_COMPLETION_DATE',
        CHANGE_STEP_EVIDENCE: 'CHANGE_STEP_EVIDENCE',
        CLIENT_RENOUNCE: 'CLIENT_RENOUNCE',
        CANCEL_PROCESS_CLOSURE: 'ANULAR_CIERRE_PROCESO'
    },
    VIVIENDAS: {
        CREATE_VIVIENDA: 'CREATE_VIVIENDA',
        UPDATE_VIVIENDA: 'UPDATE_VIVIENDA',
        ARCHIVE_VIVIENDA: 'ARCHIVE_VIVIENDA',
        RESTORE_VIVIENDA: 'RESTORE_VIVIENDA',
        DELETE_VIVIENDA: 'DELETE_VIVIENDA_PERMANENTLY',
        ASSIGN_CLIENT: 'ASSIGN_CLIENT_TO_VIVIENDA',
        UNASSIGN_CLIENT: 'UNASSIGN_CLIENT_FROM_VIVIENDA'
    },
    ABONOS: {
        REGISTER_ABONO: 'REGISTER_ABONO',
        REGISTER_DISBURSEMENT: 'REGISTER_DISBURSEMENT',
        UPDATE_ABONO: 'UPDATE_ABONO',
        ARCHIVE_ABONO: 'ARCHIVE_ABONO',
        RESTORE_ABONO: 'RESTORE_ABONO',
        DELETE_ABONO: 'DELETE_ABONO_PERMANENTLY'
    },
    RENUNCIAS: {
        CREATE_RENUNCIA: 'CREATE_RENUNCIA',
        UPDATE_RENUNCIA: 'UPDATE_RENUNCIA',
        APPROVE_RENUNCIA: 'APPROVE_RENUNCIA',
        REJECT_RENUNCIA: 'REJECT_RENUNCIA',
        ARCHIVE_RENUNCIA: 'ARCHIVE_RENUNCIA'
    },
    PROYECTOS: {
        CREATE_PROYECTO: 'CREATE_PROYECTO',
        UPDATE_PROYECTO: 'UPDATE_PROYECTO',
        ARCHIVE_PROYECTO: 'ARCHIVE_PROYECTO'
    }
};

/**
 * Función helper para crear la estructura base de un log
 */
export const createBaseAuditStructure = (actionType, module) => {
    return {
        ...AUDIT_STRUCTURE,
        actionType,
        module,
        timestamp: new Date(),
        entities: { ...AUDIT_STRUCTURE.entities },
        context: {
            cliente: { ...AUDIT_STRUCTURE.context.cliente },
            vivienda: { ...AUDIT_STRUCTURE.context.vivienda },
            proyecto: { ...AUDIT_STRUCTURE.context.proyecto }
        },
        actionData: {},
        changes: {
            before: null,
            after: null,
            fields: []
        }
    };
};

/**
 * Plantillas específicas para cada tipo de acción
 */
export const AUDIT_TEMPLATES = {

    // === CLIENTES ===
    COMPLETE_PROCESS_STEP: (baseStructure) => ({
        ...baseStructure,
        actionData: {
            pasoId: null,
            pasoNombre: null,
            procesoId: null,
            procesoNombre: null,
            fechaComplecion: null,
            evidenciasAntes: [],
            evidenciasDespues: [],
            esReComplecion: false,
            esPrimeraComplecion: false,
            fechaAnterior: null,
            cambioSoloFecha: false,
            cambioSoloEvidencias: false
        }
    }),

    UPDATE_CLIENT: (baseStructure) => ({
        ...baseStructure,
        actionData: {
            tipoActualizacion: null, // 'PERSONAL_INFO', 'FINANCIAL_INFO', 'CONTACT_INFO'
            camposEditados: [],
            validationErrors: []
        }
    }),

    REGISTER_ABONO: (baseStructure) => ({
        ...baseStructure,
        actionData: {
            monto: null,
            montoFormateado: null,
            metodoPago: null,
            fechaPago: null,
            fuente: null, // 'cuotaInicial', 'credito'
            consecutivo: null,
            consecutivoFormateado: null,
            completoCuotaInicial: false,
            pasoCompletado: null
        }
    }),

    CREATE_CLIENT: (baseStructure) => ({
        ...baseStructure,
        actionData: {
            tipoDocumento: null,
            numeroDocumento: null,
            nombres: null,
            apellidos: null,
            telefono: null,
            email: null,
            fechaNacimiento: null,
            genero: null
        }
    })

    // ... más plantillas según necesitemos
};

/**
 * Factory function para crear logs específicos
 */
export const createAuditLog = (actionType, module, data = {}) => {
    const baseStructure = createBaseAuditStructure(actionType, module);

    // 🆕 FASE 1: Debug - verificar si structured viene en data
    if (data.structured) {
        console.log('🔍 [auditStructure.js] Structured data recibido:', {
            type: data.structured.type,
            step: data.structured.step?.name,
            version: data.structured.version
        });
    }

    // Aplicar plantilla específica si existe
    if (AUDIT_TEMPLATES[actionType]) {
        const template = AUDIT_TEMPLATES[actionType](baseStructure);
        const result = {
            ...template,
            ...data,
            actionData: {
                ...template.actionData,
                ...data.actionData
            },
            context: {
                ...template.context,
                ...data.context
            },
            entities: {
                ...template.entities,
                ...data.entities
            }
        };

        // 🆕 FASE 1: Verificar que structured quedó en el resultado
        if (result.structured) {
            console.log('✅ [auditStructure.js] Structured data incluido en resultado final');
        } else if (data.structured) {
            console.error('❌ [auditStructure.js] ¡Structured se perdió en el merge!');
        }

        return result;
    }

    return {
        ...baseStructure,
        ...data
    };
};