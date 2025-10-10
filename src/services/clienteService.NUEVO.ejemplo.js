/**
 * EJEMPLO: Cómo actualizar clienteService.js para usar el nuevo sistema de auditoría
 * 
 * Este es un ejemplo de migración de algunas funciones clave del clienteService
 * para mostrar cómo sería la implementación con el nuevo sistema unificado
 */

import {
    createClientAuditLog,
    ACTION_TYPES
} from '../services/unifiedAuditService';

import { formatCurrency, toTitleCase } from '../utils/textFormatters';
import { formatDisplayDate } from './dataService';

// ========== EJEMPLO 1: Creación de cliente ==========
export const createClienteWithNewAudit = async (clienteData) => {
    try {
        // ... lógica existente de creación ...

        // En lugar del mensaje complejo anterior, capturamos datos crudos
        await createClientAuditLog(
            ACTION_TYPES.CLIENTES.CREATE_CLIENT,
            {
                id: newClienteId, // ID del cliente creado
                nombres: clienteData.nombres,
                apellidos: clienteData.apellidos,
                tipoDocumento: clienteData.tipoDocumento,
                numeroDocumento: clienteData.numeroDocumento,
                telefono: clienteData.telefono,
                email: clienteData.email,
                fechaNacimiento: clienteData.fechaNacimiento,
                genero: clienteData.genero
            },
            {
                proyectoId: clienteData.proyectoId,
                proyecto: {
                    id: clienteData.proyectoId,
                    nombre: proyectoNombre // obtenido de algún lado
                }
            }
        );

        // Los intérpretes generarán:
        // Admin: "Creó al cliente Pedro Suarez"
        // Cliente: "Juan López creó tu perfil con la información: Pedro Suarez. Datos registrados: CC: 12345678, Tel: 300123456..."

        return newClienteId;

    } catch (error) {
        // ... manejo de errores ...
    }
};

// ========== EJEMPLO 2: Completar paso de proceso ==========
export const updateClienteProcesoWithNewAudit = async (clienteId, pasoId, datosComplecion, clienteData) => {
    try {
        // ... lógica de detección de escenarios (misma que tienes) ...

        // Obtener información del paso y proceso
        const pasoInfo = obtenerInformacionPaso(pasoId); // función helper
        const procesoInfo = obtenerInformacionProceso(pasoInfo.procesoId);

        // Analizar evidencias
        const evidenciasAntes = clienteData.procesos?.[procesoInfo.id]?.pasos?.[pasoId]?.evidencias || [];
        const evidenciasDespues = datosComplecion.evidencias || [];

        // Determinar el tipo de escenario
        let actionType;
        let esReComplecion = false;
        let esPrimeraComplecion = true;
        let cambioSoloFecha = false;
        let cambioSoloEvidencias = false;

        // ... toda tu lógica de detección existente ...

        if (cambioSoloFecha) {
            actionType = ACTION_TYPES.CLIENTES.CHANGE_COMPLETION_DATE;
        } else if (cambioSoloEvidencias) {
            actionType = ACTION_TYPES.CLIENTES.CHANGE_STEP_EVIDENCE;
        } else if (esReComplecion) {
            actionType = ACTION_TYPES.CLIENTES.COMPLETE_PROCESS_STEP; // Mismo tipo, diferentes datos
        } else {
            actionType = ACTION_TYPES.CLIENTES.COMPLETE_PROCESS_STEP;
        }

        // ... actualizar Firestore ...

        // Crear audit log con datos crudos
        await createClientAuditLog(
            actionType,
            {
                id: clienteId,
                nombre: `${clienteData.nombres} ${clienteData.apellidos}`
            },
            {
                viviendaId: clienteData.viviendaId,
                vivienda: {
                    id: clienteData.viviendaId,
                    manzana: viviendaData.manzana,
                    numeroCasa: viviendaData.numeroCasa
                },
                proyecto: {
                    id: proyectoData.id,
                    nombre: proyectoData.nombre
                },
                actionData: {
                    // Datos específicos de completar paso
                    pasoId: pasoId,
                    pasoNombre: pasoInfo.nombre,
                    procesoId: procesoInfo.id,
                    procesoNombre: procesoInfo.nombre,
                    fechaComplecion: datosComplecion.fechaComplecion,
                    evidenciasAntes: evidenciasAntes.map(e => ({
                        nombre: obtenerNombreEvidencia(e),
                        displayName: e.displayName,
                        tipo: e.tipo
                    })),
                    evidenciasDespues: evidenciasDespues.map(e => ({
                        nombre: obtenerNombreEvidencia(e),
                        displayName: e.displayName,
                        tipo: e.tipo
                    })),
                    esReComplecion: esReComplecion,
                    esPrimeraComplecion: esPrimeraComplecion,
                    fechaAnterior: fechaAnteriorComplecion, // si existe
                    cambioSoloFecha: cambioSoloFecha,
                    cambioSoloEvidencias: cambioSoloEvidencias
                }
            }
        );

        // Los intérpretes generarán automáticamente:
        // Admin: "Completó paso 'Entrega de documentos' de Pedro Suarez"
        // Cliente: "Juan López completó el paso 'Entrega de documentos' del proceso 'Proceso Legal' el 10/10/2025. Evidencias adjuntas: Cédula, RUT, Certificado laboral"

    } catch (error) {
        // ... manejo de errores ...
    }
};

// ========== EJEMPLO 3: Registro de abono ==========
export const registerAbonoWithNewAudit = async (abonoData, clienteData, viviendaData, proyectoData) => {
    try {
        // ... lógica de creación del abono ...

        const { createAbonoAuditLog, ACTION_TYPES } = await import('../services/unifiedAuditService');

        await createAbonoAuditLog(
            ACTION_TYPES.ABONOS.REGISTER_ABONO,
            {
                id: newAbonoId,
                clienteId: abonoData.clienteId,
                viviendaId: abonoData.viviendaId,
                monto: abonoData.monto,
                metodoPago: abonoData.metodoPago,
                fechaPago: abonoData.fechaPago,
                fuente: abonoData.fuente,
                consecutivo: consecutivo
            },
            {
                cliente: {
                    id: clienteData.id,
                    nombre: `${clienteData.nombres} ${clienteData.apellidos}`
                },
                vivienda: {
                    id: viviendaData.id,
                    manzana: viviendaData.manzana,
                    numeroCasa: viviendaData.numeroCasa
                },
                proyecto: {
                    id: proyectoData.id,
                    nombre: proyectoData.nombre
                },
                actionData: {
                    // Formatear datos para mostrar
                    montoFormateado: formatCurrency(abonoData.monto),
                    consecutivoFormateado: `#${String(consecutivo).padStart(4, '0')}`,
                    completoCuotaInicial: esCuotaInicial && cuotaInicialCompletada,
                    pasoCompletado: pasoCompletadoNombre // si aplica
                }
            }
        );

        // Los intérpretes generarán:
        // Admin: "Registró pago de $2,500,000 para Pedro Suarez"
        // Cliente: "Juan López registró un pago de $2,500,000 mediante Transferencia bancaria con fecha 10/10/2025 (Consecutivo: #0001) aplicado a tu Cuota Inicial. ¡Con este pago se completó el saldo de tu Cuota Inicial!"

    } catch (error) {
        // ... manejo de errores ...
    }
};

// ========== VENTAJAS DEL NUEVO SISTEMA ==========

/**
 * 1. SEPARACIÓN DE RESPONSABILIDADES:
 *    - Los servicios se enfocan en la lógica de negocio
 *    - Los intérpretes se enfocan en la presentación
 *
 * 2. FLEXIBILIDAD:
 *    - Cada vista puede mostrar la información como necesite
 *    - Fácil agregar nuevas vistas sin cambiar los servicios
 *
 * 3. MANTENIBILIDAD:
 *    - Un solo lugar para capturar datos (servicios)
 *    - Un solo lugar para formatear mensajes (intérpretes)
 *
 * 4. ESCALABILIDAD:
 *    - Fácil agregar nuevos tipos de acciones
 *    - Fácil agregar nuevos campos de datos
 *
 * 5. CONSISTENCIA:
 *    - Estructura unificada para todos los módulos
 *    - Patrones consistentes de implementación
 */

// ========== MIGRACIÓN GRADUAL ==========

/**
 * PASO 1: Implementar sistema nuevo en paralelo
 * PASO 2: Migrar función por función
 * PASO 3: Actualizar componentes de visualización
 * PASO 4: Remover sistema anterior cuando todo esté migrado
 * 
 * Durante la migración:
 * - Los dos sistemas pueden coexistir
 * - Los intérpretes pueden manejar ambos formatos
 * - No se rompe funcionalidad existente
 */