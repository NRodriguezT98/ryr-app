import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { deleteAbono } from '../../utils/storage';
import toast from 'react-hot-toast';
import UndoToast from '../../components/UndoToast';

export const useGestionarAbonos = (clienteIdDesdeUrl) => {
    const { isLoading: isDataLoading, clientes, viviendas, abonos, recargarDatos } = useData();
    const [selectedClienteId, setSelectedClienteId] = useState(clienteIdDesdeUrl || null);

    const [abonoAEditar, setAbonoAEditar] = useState(null);
    const [abonoAEliminar, setAbonoAEliminar] = useState(null);
    const [abonosOcultos, setAbonosOcultos] = useState([]);
    const deletionTimeouts = useRef({});
    const [fuenteACondonar, setFuenteACondonar] = useState(null);

    useEffect(() => {
        setSelectedClienteId(clienteIdDesdeUrl || null);
    }, [clienteIdDesdeUrl]);

    const datosClienteSeleccionado = useMemo(() => {
        if (!selectedClienteId || isDataLoading) return null;

        const cliente = clientes.find(c => c.id === selectedClienteId);
        if (!cliente) return null;

        const vivienda = viviendas.find(v => v.id === cliente.viviendaId);
        if (!vivienda) return { data: { cliente, vivienda: null, historial: [], fuentes: [], isPagada: false } };

        const historial = abonos
            .filter(a => a.clienteId === selectedClienteId && a.estadoProceso === 'activo')
            .sort((a, b) => new Date(b.fechaPago) - new Date(a.fechaPago))
            .map(abono => ({
                ...abono,
                clienteInfo: `${vivienda.manzana}${vivienda.numeroCasa} - ${abono.clienteNombre}`,
                clienteStatus: cliente.status
            }));

        const fuentes = [];
        if (cliente.financiero) {
            const { financiero } = cliente;
            const crearFuente = (titulo, fuente, montoPactado) => ({
                titulo, fuente, montoPactado, abonos: historial.filter(a => a.fuente === fuente)
            });
            if (financiero.aplicaCuotaInicial) fuentes.push(crearFuente("Cuota Inicial", "cuotaInicial", financiero.cuotaInicial.monto || 0));
            if (financiero.aplicaCredito) fuentes.push(crearFuente("Crédito Hipotecario", "credito", financiero.credito.monto || 0));
            if (financiero.aplicaSubsidioVivienda) fuentes.push(crearFuente("Subsidio Mi Casa Ya", "subsidioVivienda", financiero.subsidioVivienda.monto || 0));
            if (financiero.aplicaSubsidioCaja) fuentes.push(crearFuente(`Subsidio Caja (${financiero.subsidioCaja.caja || 'N/A'})`, "subsidioCaja", financiero.subsidioCaja.monto || 0));
        }

        const condonaciones = historial.filter(a => a.fuente === 'condonacion');
        if (condonaciones.length > 0) {
            const totalCondonado = condonaciones.reduce((sum, abono) => sum + abono.monto, 0);
            fuentes.push({
                titulo: "Condonación de Saldo",
                fuente: "condonacion",
                montoPactado: totalCondonado,
                abonos: condonaciones
            });
        }

        return {
            data: { cliente, vivienda, historial, fuentes, isPagada: vivienda.saldoPendiente <= 0 }
        };
    }, [selectedClienteId, clientes, viviendas, abonos, isDataLoading]);

    const clientesParaLaLista = useMemo(() =>
        clientes.filter(c => c.vivienda && c.status === 'activo')
            .sort((a, b) => {
                const manzanaComp = a.vivienda.manzana.localeCompare(b.vivienda.manzana);
                if (manzanaComp !== 0) return manzanaComp;
                return a.vivienda.numeroCasa - b.vivienda.numeroCasa;
            }),
        [clientes]
    );

    const handleGuardado = useCallback(() => {
        recargarDatos();
        setAbonoAEditar(null);
        setFuenteACondonar(null);
    }, [recargarDatos]);

    const iniciarEliminacion = (abono) => setAbonoAEliminar(abono);

    const confirmarEliminarReal = async (abono) => {
        try {
            await deleteAbono(abono);
            recargarDatos();
        } catch (error) {
            toast.error("No se pudo eliminar el abono.");
            setAbonosOcultos(prev => prev.filter(aId => aId !== abono.id));
        }
    };

    const deshacerEliminacion = (id) => {
        clearTimeout(deletionTimeouts.current[id]);
        delete deletionTimeouts.current[id];
        setAbonosOcultos(prev => prev.filter(aId => aId !== id));
        toast.success("Eliminación deshecha.");
    };

    const confirmarEliminar = () => {
        if (!abonoAEliminar) return;
        const id = abonoAEliminar.id;
        setAbonosOcultos(prev => [...prev, id]);
        toast.custom((t) => (<UndoToast t={t} message="Abono eliminado" onUndo={() => deshacerEliminacion(id)} />), { duration: 5000 });
        const timeoutId = setTimeout(() => confirmarEliminarReal(abonoAEliminar), 5000);
        deletionTimeouts.current[id] = timeoutId;
        setAbonoAEliminar(null);
    };

    return {
        isLoading: isDataLoading,
        clientesParaLaLista,
        selectedClienteId, setSelectedClienteId,
        datosClienteSeleccionado,
        abonosOcultos,
        modals: {
            abonoAEditar, setAbonoAEditar,
            abonoAEliminar, setAbonoAEliminar,
            fuenteACondonar, setFuenteACondonar
        },
        handlers: {
            recargarDatos,
            handleGuardado,
            iniciarEliminacion,
            confirmarEliminar
        }
    };
};