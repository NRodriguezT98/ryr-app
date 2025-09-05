import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { anularAbono, revertirAnulacionAbono } from "../../services/abonoService";
import toast from 'react-hot-toast';
import UndoToast from '../../components/UndoToast';
import { useAuth } from '../../context/AuthContext';

export const useGestionarAbonos = (clienteIdDesdeUrl) => {
    const { isLoading: isDataLoading, clientes, viviendas, abonos, recargarDatos, proyectos, renuncias } = useData();
    const { user } = useAuth();
    const userName = user?.displayName || 'Usuario desconocido';
    const [selectedClienteId, setSelectedClienteId] = useState(clienteIdDesdeUrl || null);
    const [abonoAEditar, setAbonoAEditar] = useState(null);
    const [abonoAAnular, setAbonoAAnular] = useState(null);
    const [abonoARevertir, setAbonoARevertir] = useState(null);
    const [desembolsoARegistrar, setDesembolsoARegistrar] = useState(null);
    const [fuenteACondonar, setFuenteACondonar] = useState(null);

    useEffect(() => {
        setSelectedClienteId(clienteIdDesdeUrl || null);
    }, [clienteIdDesdeUrl]);

    const datosClienteSeleccionado = useMemo(() => {
        if (!selectedClienteId || isDataLoading) return null;

        const cliente = clientes.find(c => c.id === selectedClienteId);
        if (!cliente) return null;

        const vivienda = viviendas.find(v => v.id === cliente.viviendaId);

        const proyecto = vivienda ? proyectos.find(p => p.id === vivienda.proyectoId) : null;

        if (!vivienda) return { data: { cliente, vivienda: null, historial: [], fuentes: [], isPagada: false } };

        const historial = abonos
            .filter(a => a.clienteId === selectedClienteId && a.estadoProceso === 'activo')
            .sort((a, b) => new Date(b.fechaPago) - new Date(a.fechaPago))
            .map(abono => ({
                ...abono,
                // --- INICIO DE LA CORRECCIÓN ---
                // Se construye el nombre usando el objeto 'cliente' principal para asegurar consistencia.
                clienteInfo: `${vivienda.manzana}${vivienda.numeroCasa} - ${cliente.datosCliente.nombres} ${cliente.datosCliente.apellidos}`.trim(),
                // --- FIN DE LA CORRECCIÓN ---
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

        const fuentesValidas = fuentes.filter(f => f && typeof f.titulo === 'string');

        return {
            data: { cliente, vivienda, proyecto, historial, fuentes: fuentesValidas, isPagada: vivienda.saldoPendiente <= 0 }
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
        setDesembolsoARegistrar(null);
    }, [recargarDatos]);

    // Lógica de Anulación (antes eliminación)
    const iniciarAnulacion = (abono) => setAbonoAAnular(abono);
    const confirmarAnulacion = async (motivo) => {

        if (!abonoAAnular) return;
        try {
            toast.loading('Anulando abono...');
            await anularAbono(abonoAAnular, userName, motivo);
            toast.dismiss();
            toast.success('¡Abono anulado correctamente!');
            recargarDatos();
        } catch (error) {
            toast.dismiss();
            toast.error(error.message || "No se pudo anular el abono.");
            console.error(error);
        } finally {
            setAbonoAAnular(null);
        }
    };


    // Nueva Lógica de Reversión
    const iniciarReversion = (abono) => setAbonoARevertir(abono);
    const confirmarReversion = async () => {
        if (!abonoARevertir) return;
        try {
            toast.loading('Revirtiendo anulación...');
            // 'userName' también estará disponible aquí
            await revertirAnulacionAbono(abonoARevertir, userName);
            toast.dismiss();
            toast.success('¡Anulación revertida con éxito!');
            recargarDatos();
        } catch (error) {
            toast.dismiss();
            toast.error(error.message || "No se pudo revertir la anulación.");
            console.error(error);
        } finally {
            setAbonoARevertir(null);
        }
    };

    return {
        isLoading: isDataLoading,
        abonos,
        clientes,
        viviendas,
        renuncias,
        clientesParaLaLista,
        selectedClienteId, setSelectedClienteId,
        datosClienteSeleccionado,
        modals: {
            abonoAEditar, setAbonoAEditar,
            abonoAAnular, setAbonoAAnular,
            abonoARevertir, setAbonoARevertir,
            fuenteACondonar, setFuenteACondonar,
            desembolsoARegistrar, setDesembolsoARegistrar
        },
        handlers: {
            recargarDatos,
            handleGuardado,
            iniciarAnulacion, // Renombrado
            confirmarAnulacion, // Renombrado
            iniciarReversion, // Nuevo
            confirmarReversion
        }
    };
};