// Este archivo define todos los módulos y las acciones posibles en la aplicación.
// Será nuestra guía para construir el formulario de roles.

export const PERMISSIONS_CONFIG = [
    {
        module: 'viviendas',
        displayName: 'Viviendas',
        actions: [
            { key: 'ver', displayName: 'Ver' },
            { key: 'crear', displayName: 'Crear' },
            { key: 'editar', displayName: 'Editar' },
            { key: 'eliminar', displayName: 'Eliminar' },
            { key: 'verDetalle', displayName: 'Ver Detalle' },
        ]
    },
    {
        module: 'clientes',
        displayName: 'Clientes',
        actions: [
            { key: 'ver', displayName: 'Ver' },
            { key: 'crear', displayName: 'Crear' },
            { key: 'editar', displayName: 'Editar' },
            { key: 'eliminar', displayName: 'Eliminar' },
            { key: 'renunciar', displayName: 'Gestionar Renuncias' },
            { key: 'archivar', displayName: 'Archivar' },
            { key: 'restaurarCliente', displayName: 'Restaurar Cliente' },
            { key: 'nuevoProceso', displayName: 'Iniciar Nuevo Proceso' },
            { key: 'verDetalle', displayName: 'Ver Detalle' },
            { key: 'verProceso', displayName: 'Ver Proceso' },
            { key: 'actualizarPasos', displayName: 'Actualizar Pasos del Proceso' },
            { key: 'anularCierre', displayName: 'Anular Cierre del Proceso (Admin)' },
        ]
    },
    {
        module: 'abonos',
        displayName: 'Abonos',
        actions: [
            { key: 'ver', displayName: 'Ver' },
            { key: 'crear', displayName: 'Crear' },
            { key: 'editar', displayName: 'Editar' },
            { key: 'eliminar', displayName: 'Eliminar' },
        ]
    },
    {
        module: 'renuncias',
        displayName: 'Renuncias',
        actions: [
            { key: 'ver', displayName: 'Ver' },
            { key: 'cancelarRenuncia', displayName: 'Cancelar Renuncias' },
            { key: 'marcarDevolucion', displayName: 'Marcar Devolución' },
            { key: 'verDetalle', displayName: 'Ver Detalle' },
        ]
    },
    {
        module: 'reportes',
        displayName: 'Reportes',
        actions: [
            { key: 'generar', displayName: 'Generar Reportes' },
        ]
    },
    {
        module: 'admin',
        displayName: 'Administración',
        actions: [
            { key: 'ver', displayName: 'Ver' },
            { key: 'verAuditoria', displayName: 'Ver Auditoria' },
            { key: 'gestionarUsuarios', displayName: 'Gestionar Usuarios' },
            { key: 'gestionarRoles', displayName: 'Gestionar Roles' },
        ]
    }
];