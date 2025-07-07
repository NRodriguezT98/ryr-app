import { useState, useMemo } from 'react';

export const useAbonosFilters = (abonos, clientes, viviendas, renuncias) => {
    const [clienteFiltro, setClienteFiltro] = useState(null);
    const [fechaInicioFiltro, setFechaInicioFiltro] = useState('');
    const [fechaFinFiltro, setFechaFinFiltro] = useState('');
    const [fuenteFiltro, setFuenteFiltro] = useState(null);
    const [statusFiltro, setStatusFiltro] = useState('activo');

    const abonosFiltrados = useMemo(() => {
        if (!abonos || !clientes || !viviendas || !renuncias) return [];

        // 1. Enriquecemos cada abono con la información que necesitamos para mostrarlo
        let abonosProcesados = abonos.map(abono => {
            const cliente = clientes.find(c => c.id === abono.clienteId);
            const vivienda = viviendas.find(v => v.id === abono.viviendaId);
            const tieneRenunciaPendiente = renuncias.some(r => r.clienteId === abono.clienteId && r.estadoDevolucion === 'Pendiente');
            const clienteInfo = cliente && vivienda ? `${vivienda.manzana}${vivienda.numeroCasa} - ${cliente.datosCliente.nombres.toUpperCase()} ${cliente.datosCliente.apellidos.toUpperCase()}` : 'Información no disponible';

            return {
                ...abono,
                clienteInfo,
                vivienda,
                clienteStatus: cliente?.status,
                tieneRenunciaPendiente
            };
        });

        // 2. --- LÓGICA DE FILTRADO CORREGIDA Y DEFINITIVA ---
        // Ahora filtramos usando el estado propio del abono ('estadoProceso')
        if (statusFiltro !== 'todos') {
            if (statusFiltro === 'activo') {
                // Un abono activo es aquel que NO está archivado.
                abonosProcesados = abonosProcesados.filter(a => a.estadoProceso !== 'archivado');
            } else { // 'renunciado' (que en realidad son los archivados)
                abonosProcesados = abonosProcesados.filter(a => a.estadoProceso === 'archivado');
            }
        }

        // 3. Aplicamos el resto de los filtros (cliente, fecha, fuente)
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

        return abonosProcesados.sort((a, b) => new Date(b.fechaPago) - new Date(a.fechaPago));
    }, [abonos, clientes, viviendas, renuncias, clienteFiltro, fechaInicioFiltro, fechaFinFiltro, fuenteFiltro, statusFiltro]);

    return {
        abonosFiltrados,
        clienteFiltro, setClienteFiltro,
        fechaInicioFiltro, setFechaInicioFiltro,
        fechaFinFiltro, setFechaFinFiltro,
        fuenteFiltro, setFuenteFiltro,
        statusFiltro, setStatusFiltro,
    };
};