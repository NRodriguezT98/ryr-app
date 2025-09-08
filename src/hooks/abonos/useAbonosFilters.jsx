import { useState, useMemo, useEffect } from 'react';
import { useData } from '../../context/DataContext';

const ITEMS_PER_PAGE = 10; // Definimos cuántos abonos mostrar por página

export const useAbonosFilters = () => {
    const { isLoading, abonos, clientes, viviendas, renuncias, proyectos } = useData();

    // Estados para los filtros (se mantienen)
    const [clienteFiltro, setClienteFiltro] = useState(null);
    const [fechaInicioFiltro, setFechaInicioFiltro] = useState('');
    const [fechaFinFiltro, setFechaFinFiltro] = useState('');
    const [fuenteFiltro, setFuenteFiltro] = useState(null);
    const [statusFiltro, setStatusFiltro] = useState('activo');

    // --- INICIO DE LA MODIFICACIÓN: Nuevo estado para paginación ---
    const [currentPage, setCurrentPage] = useState(1);
    // --- FIN DE LA MODIFICACIÓN ---

    const abonosFiltrados = useMemo(() => {
        if (isLoading) return [];

        let abonosProcesados = abonos.map(abono => {
            const cliente = clientes.find(c => c.id === abono.clienteId);
            const vivienda = viviendas.find(v => v.id === abono.viviendaId);
            const proyecto = vivienda ? proyectos.find(p => p.id === vivienda.proyectoId) : null;

            const tieneRenunciaPendiente = renuncias.some(r => r.clienteId === abono.clienteId && r.estadoDevolucion === 'Pendiente');
            const clienteInfo = cliente && vivienda ? `${vivienda.manzana}${vivienda.numeroCasa} - ${cliente.datosCliente.nombres.toUpperCase()} ${cliente.datosCliente.apellidos.toUpperCase()}` : 'Información no disponible';
            const nombreCompletoCliente = cliente ? `${cliente.datosCliente.nombres.toUpperCase()} ${cliente.datosCliente.apellidos.toUpperCase()}` : 'Cliente no encontrado';
            const infoVivienda = vivienda ? `Mz ${vivienda.manzana} - Casa ${vivienda.numeroCasa}` : 'Vivienda no encontrada';

            const procesoClienteFinalizado = cliente?.proceso?.facturaVenta?.completado || false;

            return {
                ...abono,
                clienteInfo,
                viviendaInfo: infoVivienda,
                proyectoNombre: proyecto ? proyecto.nombre : 'No Asignado',
                clienteStatus: cliente?.status,
                tieneRenunciaPendiente,
                procesoClienteFinalizado
            };
        });

        if (statusFiltro !== 'todos') {
            switch (statusFiltro) {
                case 'activo':
                    // Ahora solo muestra los que están estrictamente activos
                    abonosProcesados = abonosProcesados.filter(a => a.estadoProceso === 'activo');
                    break;
                case 'anulado':
                    // Nuevo filtro para los anulados
                    abonosProcesados = abonosProcesados.filter(a => a.estadoProceso === 'anulado');
                    break;
                case 'renunciado':
                    // Mantenemos la lógica para los archivados (de renuncias)
                    abonosProcesados = abonosProcesados.filter(a => a.estadoProceso === 'archivado');
                    break;
                default:
                    break;
            }
        }

        if (clienteFiltro && clienteFiltro.value) {
            abonosProcesados = abonosProcesados.filter(a => a.clienteId === clienteFiltro.value);
        }
        if (fechaInicioFiltro) {
            abonosProcesados = abonosProcesados.filter(a => new Date(a.fechaPago + 'T00:00:00') >= new Date(fechaInicioFiltro + 'T00:00:00'));
        }
        if (fechaFinFiltro) {
            abonosProcesados = abonosProcesados.filter(a => new Date(a.fechaPago + 'T00:00:00') <= new Date(fechaFinFiltro + 'T00:00:00'));
        }
        if (fuenteFiltro && fuenteFiltro.value) {
            abonosProcesados = abonosProcesados.filter(a => a.fuente === fuenteFiltro.value);
        }

        return abonosProcesados.sort((a, b) => (b.consecutivo || 0) - (a.consecutivo || 0));
    }, [abonos, clientes, viviendas, proyectos, renuncias, clienteFiltro, fechaInicioFiltro, fechaFinFiltro, fuenteFiltro, statusFiltro, isLoading]);

    // --- INICIO DE LA MODIFICACIÓN: Lógica de paginación ---
    const totalPages = useMemo(() => Math.ceil(abonosFiltrados.length / ITEMS_PER_PAGE), [abonosFiltrados]);

    const abonosPaginados = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return abonosFiltrados.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [currentPage, abonosFiltrados]);

    useEffect(() => {
        setCurrentPage(1); // Resetea a la página 1 cada vez que cambian los filtros
    }, [clienteFiltro, fechaInicioFiltro, fechaFinFiltro, fuenteFiltro, statusFiltro]);
    // --- FIN DE LA MODIFICACIÓN ---

    return {
        isLoading,
        abonosFiltrados: abonosPaginados, // Devolvemos la lista paginada para la vista
        todosLosAbonosFiltrados: abonosFiltrados, // Devolvemos la lista completa para contadores

        // Filtros
        clienteFiltro, setClienteFiltro,
        fechaInicioFiltro, setFechaInicioFiltro,
        fechaFinFiltro, setFechaFinFiltro,
        fuenteFiltro, setFuenteFiltro,
        statusFiltro, setStatusFiltro,

        // Paginación
        pagination: {
            currentPage,
            totalPages,
            onPageChange: setCurrentPage
        }
    };
};