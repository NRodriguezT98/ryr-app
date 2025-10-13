/**
 * Servicios centralizados para gestión de clientes
 * ✅ REFACTORIZACIÓN COMPLETADA - Estructura modular implementada
 * 
 * Estructura final:
 * ├── clienteCRUD.js ✅ COMPLETADO - Operaciones CRUD básicas
 * ├── clienteValidators.js ✅ NUEVO - Validaciones de negocio
 * ├── renunciasService.js ✅ NUEVO - Lógica de renuncia
 * ├── historial/notasService.js ✅ NUEVO - Historial de notas
 * ├── utils/evidenciasHelpers.js ✅ NUEVO - Helpers de evidencias
 * └── proceso/ ✅ Gestión de proceso (ya existente)
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

// Validadores
export {
    validateClientUpdate,
    validateFechaIngresoChange,
    sincronizarProcesoConFinanciero
} from './clienteValidators';

// Renuncias
export {
    renunciarAVivienda
} from './renunciasService';

// Notas del historial
export {
    addNotaToHistorial,
    updateNotaHistorial
} from './historial/notasService';

// Helpers de evidencias
export {
    obtenerNombreEvidencia,
    construirListaEvidencias,
    construirAccesoEvidencias
} from './utils/evidenciasHelpers';

// Helpers de auditoría
export {
    generarActividadProceso
} from './clienteAuditHelpers';

// Proceso (módulos ya existentes)
export {
    updateClienteProceso,
    updateClienteProcesoUnified
} from './proceso/updateProceso';

export {
    getClienteProceso,
    reabrirPasoProceso,
    anularCierreProceso
} from './proceso/procesoHelpers';

// Transferencia
export { transferirViviendaCliente } from './clienteTransferencia';

/**
 * ESTADO DE REFACTORIZACIÓN:
 * ✅ COMPLETADO - Estructura modular implementada
 * 
 * Todos los módulos de cliente ahora están organizados en archivos especializados.
 * 
 * Próximos pasos:
 * 1. Actualizar imports en componentes que usen clienteService.js
 * 2. Eliminar clienteService.js cuando todas las dependencias estén migradas
 */

