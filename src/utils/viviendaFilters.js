/**
 * Utilidades centralizadas para filtrado y ordenamiento de viviendas
 * 🔥 OPTIMIZACIÓN: Lógica reutilizable extraída de useListarViviendas
 */

/**
 * Aplica todos los filtros a un array de viviendas procesadas
 * 🔥 DEFENSIVO: Maneja campos undefined de viviendas antiguas
 */
export const aplicarFiltrosViviendas = (viviendas, { statusFilter, proyectoFilter, searchTerm }) => {
    let resultado = viviendas;

    // Filtro de Proyecto
    if (proyectoFilter !== 'todos') {
        resultado = resultado.filter(v => v.proyectoId === proyectoFilter);
    }

    // Filtro de Estado
    if (statusFilter === 'archivadas') {
        resultado = resultado.filter(v => v.status === 'archivada');
    } else {
        resultado = resultado.filter(v => v.status !== 'archivada');

        if (statusFilter !== 'todas') {
            if (statusFilter === 'disponibles') {
                resultado = resultado.filter(v => !v.clienteId);
            } else if (statusFilter === 'asignadas') {
                // 🔥 DEFENSIVO: saldoPendiente puede no existir en viviendas antiguas
                resultado = resultado.filter(v => v.clienteId && (v.saldoPendiente ?? v.valorFinal ?? 0) > 0);
            } else if (statusFilter === 'pagadas') {
                // 🔥 DEFENSIVO: saldoPendiente puede no existir en viviendas antiguas
                resultado = resultado.filter(v => v.clienteId && (v.saldoPendiente ?? v.valorFinal ?? 0) <= 0);
            }
        }
    }

    // Filtro de Búsqueda
    if (searchTerm) {
        const lowerCaseSearchTerm = searchTerm.toLowerCase().replace(/\s/g, '');
        resultado = resultado.filter(v => {
            const ubicacion = `${v.manzana}${v.numeroCasa}`.toLowerCase().replace(/\s/g, '');
            const matricula = (v.matricula || '').toLowerCase();
            const cliente = (v.clienteNombre || '').toLowerCase();
            return ubicacion.includes(lowerCaseSearchTerm) ||
                matricula.includes(lowerCaseSearchTerm) ||
                cliente.includes(searchTerm.toLowerCase());
        });
    }

    return resultado;
};

/**
 * Ordena viviendas según el criterio especificado
 */
export const ordenarViviendas = (viviendas, sortOrder) => {
    const ordenados = [...viviendas];

    switch (sortOrder) {
        case 'nombre_cliente':
            return ordenados.sort((a, b) =>
                (a.clienteNombre || 'z').localeCompare(b.clienteNombre || 'z')
            );

        case 'recientes':
            return ordenados.sort((a, b) =>
                (b.fechaCreacion || '').localeCompare(a.fechaCreacion || '')
            );

        case 'valor_desc':
            return ordenados.sort((a, b) => b.valorFinal - a.valorFinal);

        case 'valor_asc':
            return ordenados.sort((a, b) => a.valorFinal - b.valorFinal);

        case 'saldo_desc':
            return ordenados.sort((a, b) =>
                (b.saldoPendiente ?? 0) - (a.saldoPendiente ?? 0)
            );

        case 'saldo_asc':
            return ordenados.sort((a, b) =>
                (a.saldoPendiente ?? 0) - (b.saldoPendiente ?? 0)
            );

        case 'ubicacion':
        default:
            return ordenados.sort((a, b) =>
                a.manzana.localeCompare(b.manzana) || a.numeroCasa - b.numeroCasa
            );
    }
};

/**
 * Calcula permisos y estados de una vivienda
 */
export const calcularPermisosVivienda = (vivienda, cliente, tieneHistorialDeAbonos) => {
    const procesoFinalizado = cliente?.proceso?.facturaVenta?.completado === true;
    const tieneValorEscrituraDiferente = cliente?.financiero?.usaValorEscrituraDiferente === true &&
        cliente?.financiero?.valorEscritura > 0;

    return {
        puedeEditar: !procesoFinalizado,
        puedeEliminar: !vivienda.clienteId && !tieneHistorialDeAbonos,
        puedeArchivar: !vivienda.clienteId && vivienda.status !== 'archivada',
        puedeRestaurar: vivienda.status === 'archivada',
        camposFinancierosBloqueados: !!vivienda.clienteId,
        tieneValorEscrituraDiferente
    };
};
