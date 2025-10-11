/**
 * Servicios centralizados para gestión de clientes
 * ✅ REFACTORIZACIÓN COMPLETADA - Estructura modular implementada
 * 
 * Estructura final:
 * ├── clienteCRUD.js ✅ COMPLETADO - Operaciones CRUD básicas
 * ├── clienteAuditHelpers.js ✅ COMPLETADO - Helpers de auditoría
 * ├── clienteNotas.js ✅ COMPLETADO - Historial de notas
 * ├── clienteTransferencia.js ✅ COMPLETADO - Transferencia de vivienda
 * ├── clienteRenuncia.js ✅ COMPLETADO - Lógica de renuncia
 * └── clienteProceso.js ✅ COMPLETADO - Gestión de proceso
 */

// ========== MÓDULOS COMPLETADOS ==========

// CRUD básico
export {
    addClienteAndAssignVivienda,
    updateCliente,
    deleteCliente,
    inactivarCliente,
    restaurarCliente,
    deleteClientePermanently
} from './clienteCRUD';

// Helpers de auditoría
export {
    obtenerNombreEvidencia,
    construirListaEvidencias,
    generarMensajeComplecion,
    generarMensajeReapertura,
    generarMensajeReCompletado,
    generarActividadProceso
} from './clienteAuditHelpers';

// Proceso
export {
    getClienteProceso,
    updateClienteProceso,
    updateClienteProcesoUnified,
    reabrirPasoProceso,
    anularCierreProceso
} from './clienteProceso';

// Renuncia
export {
    renunciarAVivienda
} from './clienteRenuncia';

// Transferencia
export {
    transferirViviendaCliente
} from './clienteTransferencia';

// Notas
export {
    addNotaToHistorial,
    updateNotaHistorial
} from './clienteNotas';

/**
 * ESTADO DE REFACTORIZACIÓN:
 * ✅ COMPLETADO - 6/6 módulos migrados (100%)
 * 
 * Todos los módulos de cliente ahora están organizados en archivos especializados.
 * El archivo clienteService.js original se mantiene temporalmente para:
 * - Funciones auxiliares complejas de clienteProceso.js (15+ helpers)
 * - Garantizar estabilidad durante la transición
 * 
 * Próximos pasos opcionales (mejora continua):
 * 1. Extraer helpers internos de clienteService.js a submódulos
 * 2. Marcar clienteService.js como @deprecated
 * 3. Eventualmente eliminar clienteService.js cuando todas las dependencias estén migradas
 */

