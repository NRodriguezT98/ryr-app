import { useState, useMemo } from 'react';

export const useAbonosFilters = (abonos, clientes, viviendas) => {
    const [clienteFiltro, setClienteFiltro] = useState(null);
    const [fechaInicioFiltro, setFechaInicioFiltro] = useState('');
    const [fechaFinFiltro, setFechaFinFiltro] = useState('');
    const [fuenteFiltro, setFuenteFiltro] = useState(null);

    const abonosFiltrados = useMemo(() => {
        if (!abonos || !clientes || !viviendas) return [];

        let abonosProcesados = abonos.map(abono => {
            const cliente = clientes.find(c => c.id === abono.clienteId);
            const vivienda = viviendas.find(v => v.id === abono.viviendaId);
            const clienteInfo = cliente && vivienda
                ? `${vivienda.manzana}${vivienda.numeroCasa} - ${cliente.datosCliente.nombres.toUpperCase()} ${cliente.datosCliente.apellidos.toUpperCase()}`
                : 'Información no disponible';
            return { ...abono, clienteInfo, vivienda };
        });

        // Aplicamos los filtros
        if (clienteFiltro && clienteFiltro.value) {
            abonosProcesados = abonosProcesados.filter(a => a.clienteId === clienteFiltro.value);
        }
        if (fechaInicioFiltro) {
            // Se añade T00:00:00 para asegurar una comparación de fecha correcta sin importar la zona horaria
            abonosProcesados = abonosProcesados.filter(a => new Date(a.fechaPago + 'T00:00:00') >= new Date(fechaInicioFiltro + 'T00:00:00'));
        }
        if (fechaFinFiltro) {
            abonosProcesados = abonosProcesados.filter(a => new Date(a.fechaPago + 'T00:00:00') <= new Date(fechaFinFiltro + 'T00:00:00'));
        }
        if (fuenteFiltro && fuenteFiltro.value) {
            abonosProcesados = abonosProcesados.filter(a => a.fuente === fuenteFiltro.value);
        }

        return abonosProcesados.sort((a, b) => new Date(b.fechaPago) - new Date(a.fechaPago));

    }, [abonos, clientes, viviendas, clienteFiltro, fechaInicioFiltro, fechaFinFiltro, fuenteFiltro]);

    return {
        abonosFiltrados,
        clienteFiltro,
        setClienteFiltro,
        fechaInicioFiltro,
        setFechaInicioFiltro,
        fechaFinFiltro,
        setFechaFinFiltro,
        fuenteFiltro,
        setFuenteFiltro,
    };
};