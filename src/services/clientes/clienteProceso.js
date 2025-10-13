/**
 * clienteProceso.js
 * 
 * Módulo para gestión del proceso de clientes.
 * Maneja la actualización, reapertura y anulación de pasos del proceso.
 * 
 * ✅ FASE 1 COMPLETADA: Unificación de funciones duplicadas
 * Las funciones updateClienteProceso y updateClienteProcesoUnified ahora están
 * unificadas en el módulo proceso/ con lógica de detección compartida.
 */

// Funciones de proceso actualizadas (FASE 1)
export {
    updateClienteProceso,
    updateClienteProcesoUnified  // Alias para compatibilidad
} from './proceso/updateProceso';

// Funciones del módulo principal de clientes
export {
    getClienteProceso,
    reabrirPasoProceso,
    anularCierreProceso
} from '../clientes';

/**
 * DOCUMENTACIÓN DE FUNCIONES:
 * 
 * === FUNCIONES UNIFICADAS (FASE 1) ===
 * 
 * 1. updateClienteProceso(clienteId, nuevoProceso, options)
 *    - Función UNIFICADA para actualizar el proceso del cliente
 *    - Soporta ambos sistemas de auditoría (legacy y unificado)
 *    - Detecta automáticamente todos los cambios en el proceso
 *    - Parámetros:
 *      * clienteId: ID del cliente
 *      * nuevoProceso: Nuevo estado del proceso
 *      * options: { useUnifiedAudit, auditMessage, auditDetails }
 *    - Ventajas:
 *      * Elimina duplicación de código (380 → 260 líneas)
 *      * Lógica de detección compartida y reutilizable
 *      * Fácil de testear y mantener
 * 
 * 2. updateClienteProcesoUnified(clienteId, nuevoProceso, auditMessage, auditDetails)
 *    - Alias para compatibilidad con código existente
 *    - Llama a updateClienteProceso con useUnifiedAudit: true
 *    - @deprecated Usar updateClienteProceso directamente
 * 
 * === FUNCIONES ORIGINALES ===
 * 
 * 3. getClienteProceso(clienteId)
 *    - Obtiene el objeto proceso de un cliente
 *    - Retorna: objeto proceso o {}
 *    - Lanza: Error si cliente no existe
 * 
 * 4. reabrirPasoProceso(clienteId, pasoKey, motivoReapertura)
 *    - Marca un paso completado como pendiente para revisión
 *    - Guarda estado anterior (fecha, evidencias, completado)
 *    - Genera log de auditoría con fecha original y motivo
 *    - Retorna: proceso actualizado
 * 
 * 5. anularCierreProceso(clienteId, userName, motivo)
 *    - Reabre el último paso 'Factura de Venta' cuando el proceso está completado
 *    - Solo aplica si el paso facturaVenta está completado
 *    - Añade entrada al historial del paso
 *    - Genera log de auditoría de anulación
 *    - Lanza: Error si cliente no existe o proceso no está completado
 * 
 * === ARQUITECTURA MODULAR (FASE 1) ===
 * 
 * proceso/
 * ├── updateProceso.js .................. Función unificada principal
 * ├── cambiosDetector.js ................ Detecta cambios en el proceso
 * ├── auditoriaSistemaLegacy.js ......... Sistema de auditoría legacy
 * └── auditoriaSistemaUnificado.js ...... Sistema de auditoría unificado
 * 
 * === MIGRACIÓN FUTURA (FASES 2-5) ===
 * 
 * FASE 2: Sistema de plantillas para mensajes
 * FASE 3: Extracción de helpers de evidencias
 * FASE 4: Simplificación de captura de auditoría
 * FASE 5: Mejora de agrupación en UI
 */
