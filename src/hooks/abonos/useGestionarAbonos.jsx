import { useState, useMemo, useCallback, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { revertirAnulacionAbono } from "../../services/abonoService"; // Ya no se importa anularAbono
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export const useGestionarAbonos = (clienteIdDesdeUrl) => {
    const { isLoading: isDataLoading, clientes, viviendas, abonos, recargarDatos, proyectos } = useData();
    const { user } = useAuth();
    const userName = user?.displayName || 'Usuario desconocido';
    const [selectedClienteId, setSelectedClienteId] = useState(clienteIdDesdeUrl || null);

    // Estados para los otros modales que este hook sí maneja
    const [abonoAEditar, setAbonoAEditar] = useState(null);
    const [desembolsoARegistrar, setDesembolsoARegistrar] = useState(null);
    const [fuenteACondonar, setFuenteACondonar] = useState(null);

    // ✨ SE ELIMINÓ: const [abonoAAnular, setAbonoAAnular] = useState(null);

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
            .filter(a => a.clienteId === selectedClienteId)
            .sort((a, b) => new Date(b.fechaPago) - new Date(a.fechaPago));

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

    // Añadimos el cálculo para los abonos activos, que depende de los datos ya calculados
    const abonosActivos = useMemo(() =>
        (datosClienteSeleccionado?.data?.historial || []).filter(abono => abono.estadoProceso === 'activo'),
        [datosClienteSeleccionado]
    );

    const totalesCalculados = useMemo(() => {
        if (!datosClienteSeleccionado?.data?.vivienda) {
            return { totalAbonado: 0, saldoPendiente: 0, valorFinal: 0 };
        }

        const valorFinal = datosClienteSeleccionado.data.vivienda.valorFinal || 0;
        // Usamos la lista de 'abonosActivos' que ya tenemos calculada.
        const totalAbonado = abonosActivos.reduce((sum, abono) => sum + abono.monto, 0);
        const saldoPendiente = valorFinal - totalAbonado;

        return { totalAbonado, saldoPendiente, valorFinal };
    }, [datosClienteSeleccionado, abonosActivos]);

    // Añadimos el cálculo del sumario, que depende de la lista de abonos activos
    const sumarioAbonosActivos = useMemo(() => {
        const totalAbonos = abonosActivos.length;
        const sumaTotal = abonosActivos.reduce((sum, abono) => sum + abono.monto, 0);
        return { totalAbonos, sumaTotal };
    }, [abonosActivos]);

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


    return {
        isLoading: isDataLoading,
        clientesParaLaLista,
        selectedClienteId,
        setSelectedClienteId,
        datosClienteSeleccionado,
        abonosActivos,
        sumarioAbonosActivos,
        totalesCalculados,
        modals: {
            abonoAEditar, setAbonoAEditar,
            fuenteACondonar, setFuenteACondonar,
            desembolsoARegistrar, setDesembolsoARegistrar
        },
        handlers: {
            recargarDatos,
            handleGuardado,
        }
    };
};