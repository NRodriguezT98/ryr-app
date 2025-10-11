/**
 * Utilidades centralizadas para filtrado y ordenamiento de clientes
 * 🔥 OPTIMIZACIÓN: Lógica reutilizable extraída de useListarClientes
 * 📋 Patrón: Mismo diseño que viviendaFilters.js
 */

/**
 * Aplica todos los filtros a un array de clientes procesados
 * @param {Array} clientes - Array de clientes con datos enriquecidos (vivienda, proyecto, etc.)
 * @param {Object} filtros - Objeto con statusFilter, proyectoFilter, searchTerm
 * @returns {Array} - Clientes filtrados
 */
export const aplicarFiltrosClientes = (clientes, { statusFilter, proyectoFilter, searchTerm }) => {
    let resultado = clientes;

    // Filtro de Proyecto
    if (proyectoFilter !== 'todos') {
        resultado = resultado.filter(c => c.vivienda?.proyectoId === proyectoFilter);
    }

    // Filtro de Estado
    if (statusFilter !== 'todos') {
        resultado = resultado.filter(c => c.status === statusFilter);
    }

    // Filtro de Búsqueda
    if (searchTerm) {
        const lowerCaseSearchTerm = searchTerm.toLowerCase().replace(/\s/g, '');
        resultado = resultado.filter(c => {
            // Nombre completo del cliente
            const nombreCompleto = `${c.datosCliente?.nombres || ''} ${c.datosCliente?.apellidos || ''}`.toLowerCase();

            // Cédula (sin espacios)
            const cedula = (c.datosCliente?.cedula || '');

            // Ubicación de la vivienda (sin espacios)
            const ubicacion = c.vivienda
                ? `${c.vivienda.manzana}${c.vivienda.numeroCasa}`.toLowerCase().replace(/\s/g, '')
                : '';

            return nombreCompleto.includes(searchTerm.toLowerCase()) ||
                cedula.includes(lowerCaseSearchTerm) ||
                (ubicacion && ubicacion.includes(lowerCaseSearchTerm));
        });
    }

    return resultado;
};

/**
 * Ordena clientes según el criterio especificado
 * @param {Array} clientes - Array de clientes a ordenar
 * @param {string} sortOrder - Criterio de ordenamiento
 * @returns {Array} - Clientes ordenados
 */
export const ordenarClientes = (clientes, sortOrder) => {
    const ordenados = [...clientes];

    switch (sortOrder) {
        case 'fecha_reciente':
            return ordenados.sort((a, b) =>
                new Date(b.datosCliente?.fechaIngreso || 0) - new Date(a.datosCliente?.fechaIngreso || 0)
            );

        case 'saldo_desc':
            return ordenados.sort((a, b) =>
                (b.vivienda?.saldoPendiente ?? -Infinity) - (a.vivienda?.saldoPendiente ?? -Infinity)
            );

        case 'saldo_asc':
            return ordenados.sort((a, b) =>
                (a.vivienda?.saldoPendiente ?? Infinity) - (b.vivienda?.saldoPendiente ?? Infinity)
            );

        case 'valor_desc':
            return ordenados.sort((a, b) =>
                (b.vivienda?.valorFinal || 0) - (a.vivienda?.valorFinal || 0)
            );

        case 'valor_asc':
            return ordenados.sort((a, b) =>
                (a.vivienda?.valorFinal || 0) - (b.vivienda?.valorFinal || 0)
            );

        case 'nombre_asc':
            return ordenados.sort((a, b) => {
                const nameA = `${a.datosCliente?.nombres || ''} ${a.datosCliente?.apellidos || ''}`.toLowerCase();
                const nameB = `${b.datosCliente?.nombres || ''} ${b.datosCliente?.apellidos || ''}`.toLowerCase();
                return nameA.localeCompare(nameB);
            });

        case 'ubicacion':
        default:
            return ordenados.sort((a, b) => {
                const viviendaA = a.vivienda;
                const viviendaB = b.vivienda;

                // Clientes sin vivienda al final
                if (!viviendaA && !viviendaB) return 0;
                if (!viviendaA) return 1;
                if (!viviendaB) return -1;

                // Ordenar por manzana y luego por número de casa
                const manzanaCompare = viviendaA.manzana.localeCompare(viviendaB.manzana);
                return manzanaCompare !== 0 ? manzanaCompare : viviendaA.numeroCasa - viviendaB.numeroCasa;
            });
    }
};

/**
 * Enriquece clientes con datos derivados (nombre proyecto, permisos, etc.)
 * @param {Array} clientes - Array de clientes base
 * @param {Map} proyectosMap - Map de proyectos por ID
 * @param {Set} abonosSet - Set de clienteIds que tienen abonos
 * @returns {Array} - Clientes enriquecidos
 */
export const enriquecerClientes = (clientes, proyectosMap, abonosSet) => {
    return clientes.map(cliente => {
        const procesoFinalizado = cliente.proceso?.facturaVenta?.completado === true;
        const vivienda = cliente.vivienda; // Ya viene del DataContext
        const proyecto = vivienda ? proyectosMap.get(vivienda.proyectoId) : null;

        return {
            ...cliente,
            nombreProyecto: proyecto?.nombre || null,
            puedeRenunciar: !procesoFinalizado,
            puedeEditar: !procesoFinalizado,
            puedeSerEliminado: !abonosSet.has(cliente.id)
        };
    });
};

/**
 * Opciones de ordenamiento para el select
 */
export const OPCIONES_ORDENAMIENTO_CLIENTES = [
    { value: 'ubicacion', label: 'Ubicación (Manzana/Casa)' },
    { value: 'fecha_reciente', label: 'Fecha Ingreso (Recientes primero)' },
    { value: 'nombre_asc', label: 'Nombre (A-Z)' },
    { value: 'saldo_desc', label: 'Saldo Pendiente (Mayor a Menor)' },
    { value: 'saldo_asc', label: 'Saldo Pendiente (Menor a Mayor)' },
    { value: 'valor_desc', label: 'Valor Vivienda (Mayor a Menor)' },
    { value: 'valor_asc', label: 'Valor Vivienda (Menor a Mayor)' }
];

/**
 * Opciones de filtro de estado
 */
export const OPCIONES_ESTADO_CLIENTES = [
    { value: 'todos', label: 'Todos los Estados' },
    { value: 'activo', label: 'Activos' },
    { value: 'inactivo', label: 'Inactivos' },
    { value: 'renuncia', label: 'En Renuncia' }
];
