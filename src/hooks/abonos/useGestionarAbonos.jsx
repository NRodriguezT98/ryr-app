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

        // --- INICIO DE LA SOLUCIÓN ---
        const historial = abonos
            .filter(a => a.clienteId === selectedClienteId) // Filtramos todos los abonos del cliente
            .sort((a, b) => new Date(b.fechaPago) - new Date(a.fechaPago))
            .map(abono => {
                // Para cada abono, buscamos su información relacionada
                const viviendaDelAbono = viviendas.find(v => v.id === abono.viviendaId);
                const clienteDelAbono = clientes.find(c => c.id === abono.clienteId);
                const proyectoDelAbono = viviendaDelAbono ? proyectos.find(p => p.id === viviendaDelAbono.proyectoId) : null;

                // Construimos el objeto enriquecido que consumirán tanto el AbonoCard como el Modal
                return {
                    ...abono,
                    // Creamos los strings EXACTOS que el modal necesita
                    clienteInfo: `${viviendaDelAbono?.manzana || '?'}${viviendaDelAbono?.numeroCasa || '?'} - ${clienteDelAbono?.datosCliente?.nombres || 'N/A'} ${clienteDelAbono?.datosCliente?.apellidos || 'N/A'}`.trim(),
                    proyectoNombre: proyectoDelAbono?.nombre || 'No disponible',
                    // Incluimos los objetos completos por si se necesitan en otro lado
                    cliente: clienteDelAbono,
                    vivienda: viviendaDelAbono,
                    proyecto: proyectoDelAbono
                };
            });
        // --- FIN DE LA SOLUCIÓN ---

        const fuentes = [];
        if (cliente.financiero) {
            const { financiero } = cliente;
            const crearFuente = (titulo, fuente, montoPactado) => {
                const abonosDeFuente = historial.filter(a => a.fuente === fuente && a.estadoProceso === 'activo');
                const totalAbonado = abonosDeFuente.reduce((sum, a) => sum + a.monto, 0);

                return {
                    titulo,
                    fuente,
                    montoPactado,
                    abonos: abonosDeFuente,
                    resumenPago: {
                        montoPactado: montoPactado,
                        totalAbonado: totalAbonado,
                        saldoPendiente: montoPactado - totalAbonado
                    }
                };
            };

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
    }, [selectedClienteId, clientes, viviendas, abonos, proyectos, isDataLoading]);

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

    // --- INICIO DE LA SOLUCIÓN ---
    // Ahora los handlers son más simples. El objeto `abono` ya viene listo desde `historial`.
    const iniciarAnulacion = (abono) => {
        setAbonoAAnular(abono);
    };

    const iniciarReversion = (abono) => {
        setAbonoARevertir(abono);
    };
    // --- FIN DE LA SOLUCIÓN ---

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

    const confirmarReversion = async () => {
        if (!abonoARevertir) return;
        try {
            toast.loading('Revirtiendo anulación...');
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
            iniciarAnulacion,
            confirmarAnulacion,
            iniciarReversion,
            confirmarReversion
        }
    };
};