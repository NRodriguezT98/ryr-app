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
            { key: 'actualizarPasos', displayName: 'Actualizar Pasos del Proceso' },
            { key: 'anularCierre', displayName: 'Anular Cierre del Proceso (Admin)' },
            { key: 'archivar', displayName: 'Archivar' },
            { key: 'crear', displayName: 'Crear' },
            { key: 'editar', displayName: 'Editar' },
            { key: 'editarFechaProceso', displayName: 'Editar Fecha del Proceso' },
            { key: 'eliminar', displayName: 'Eliminar' },
            { key: 'nuevoProceso', displayName: 'Iniciar Nuevo Proceso' },
            { key: 'reabrirProceso', displayName: 'Reabrir Proceso' },
            { key: 'renunciar', displayName: 'Gestionar Renuncias' },
            { key: 'restaurarCliente', displayName: 'Restaurar Cliente' },
            { key: 'trasnferirVivienda', displayName: 'Transferir Vivienda' },
            { key: 'ver', displayName: 'Ver' },
            { key: 'verDetalle', displayName: 'Ver Detalle' },
            { key: 'verDocumentos', displayName: 'Ver Documentos' },
            { key: 'verFinanciero', displayName: 'Ver Financiero' },
            { key: 'verHistorial', displayName: 'Ver Historial' },
            { key: 'verHistorialProceso', displayName: 'Ver Historial Proceso' },
            { key: 'verProceso', displayName: 'Ver Proceso' },
        ]
    },
    {
        module: 'abonos',
        displayName: 'Abonos',
        actions: [
            { key: 'ver', displayName: 'Ver' },
            { key: 'crear', displayName: 'Crear' },
            { key: 'editar', displayName: 'Editar' },
            { key: 'anular', displayName: 'Anular' },
            { key: 'revertirAnulacion', displayName: 'Revertir Anulación' },
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
            { key: 'crearProyectos', displayName: 'Crear Proyectos' },
            { key: 'editarProyecto', displayName: 'Editar Proyectos' },
            { key: 'eliminarProyecto', displayName: 'Eliminar Proyectos' },
            { key: 'listarProyectos', displayName: 'Listar Proyectos' },
        ]
    }
];