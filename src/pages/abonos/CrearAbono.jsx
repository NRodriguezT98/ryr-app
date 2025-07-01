import React, { useEffect, useState, useMemo, useCallback } from "react";
import Select from "react-select";
import AnimatedPage from "../../components/AnimatedPage";
import toast from "react-hot-toast";
import { useData } from "../../context/DataContext";
import FuenteDePagoCard from "./FuenteDePagoCard";
import AbonoCard from "./AbonoCard";

const formatCurrency = (value) => (value || 0).toLocaleString("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 });

const CrearAbono = () => {
    const { isLoading, viviendas, clientes, abonos, recargarDatos } = useData();
    const [selectedViviendaId, setSelectedViviendaId] = useState(null);

    const datosViviendaSeleccionada = useMemo(() => {
        if (!selectedViviendaId) return null;

        const viviendaActual = viviendas.find(v => v.id === selectedViviendaId);
        if (!viviendaActual) return null;

        const clienteActual = clientes.find(c => c.id === viviendaActual.clienteId);
        if (!clienteActual || !clienteActual.financiero) return { vivienda: viviendaActual, fuentes: [], historial: [], resumenGeneral: {} };

        const historial = abonos
            .filter(a => a.viviendaId === selectedViviendaId)
            .sort((a, b) => new Date(b.fechaPago) - new Date(a.fechaPago));

        const fuentes = [];
        const { financiero } = clienteActual;

        if (financiero.aplicaCuotaInicial && financiero.cuotaInicial.monto > 0) {
            fuentes.push({ titulo: "Cuota Inicial", fuente: "cuotaInicial", montoPactado: financiero.cuotaInicial.monto, abonos: historial.filter(a => a.fuente === 'cuotaInicial') });
        }
        if (financiero.aplicaCredito && financiero.credito.monto > 0) {
            fuentes.push({ titulo: "Crédito Hipotecario", fuente: "credito", montoPactado: financiero.credito.monto, abonos: historial.filter(a => a.fuente === 'credito') });
        }
        if (financiero.aplicaSubsidioVivienda && financiero.subsidioVivienda.monto > 0) {
            fuentes.push({ titulo: "Subsidio Mi Casa Ya", fuente: "subsidioVivienda", montoPactado: financiero.subsidioVivienda.monto, abonos: historial.filter(a => a.fuente === 'subsidioVivienda') });
        }
        if (financiero.aplicaSubsidioCaja && financiero.subsidioCaja.monto > 0) {
            fuentes.push({ titulo: `Subsidio Caja (${financiero.subsidioCaja.caja})`, fuente: "subsidioCaja", montoPactado: financiero.subsidioCaja.monto, abonos: historial.filter(a => a.fuente === 'subsidioCaja') });
        }

        // --- NUEVA LÓGICA AQUÍ: Añadimos los gastos notariales como una fuente de pago ---
        if (financiero.gastosNotariales && financiero.gastosNotariales.monto > 0) {
            fuentes.push({
                titulo: "Gastos Notariales",
                fuente: "gastosNotariales",
                montoPactado: financiero.gastosNotariales.monto,
                abonos: historial.filter(a => a.fuente === 'gastosNotariales'),
            });
        }

        const resumenGeneral = {
            valorFinal: viviendaActual.valorFinal || 0,
            totalAbonado: viviendaActual.totalAbonado || 0,
            saldoPendiente: viviendaActual.saldoPendiente || 0
        };

        return { vivienda: viviendaActual, fuentes, historial, resumenGeneral };
    }, [selectedViviendaId, viviendas, clientes, abonos]);

    const viviendaOptions = useMemo(() =>
        clientes
            .filter(cliente => cliente.viviendaId)
            .map(cliente => {
                const vivienda = viviendas.find(v => v.id === cliente.viviendaId);
                if (!vivienda) return null;
                return {
                    value: vivienda.id,
                    label: `Mz ${vivienda.manzana} - Casa ${vivienda.numeroCasa} (${cliente.datosCliente.nombres})`
                };
            }).filter(Boolean),
        [clientes, viviendas]);

    if (isLoading) return <div className="text-center p-10 animate-pulse">Cargando...</div>;

    return (
        <AnimatedPage>
            <div className="max-w-5xl mx-auto bg-white p-8 rounded-xl shadow-lg">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-[#1976d2] mb-2">Seguimiento de Pagos por Cliente</h2>
                    <p className="text-gray-500 mb-8">Selecciona una vivienda para ver y registrar los abonos por cada fuente de pago.</p>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                    <div className="mb-6">
                        <label className="block font-semibold mb-2 text-gray-700">Seleccionar Vivienda Ocupada</label>
                        <Select
                            options={viviendaOptions}
                            onChange={(option) => setSelectedViviendaId(option ? option.value : null)}
                            placeholder="Buscar vivienda por cliente..."
                            noOptionsMessage={() => "No hay clientes con viviendas asignadas."}
                            isClearable
                            value={viviendaOptions.find(op => op.value === selectedViviendaId) || null}
                        />
                    </div>
                    {datosViviendaSeleccionada && (
                        <div className="animate-fade-in mt-8 pt-6 border-t">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center p-4 bg-gray-50 rounded-lg border mb-8">
                                <div><p className="text-sm font-semibold text-gray-500">Valor Final Vivienda</p><p className="text-lg font-bold text-blue-600">{formatCurrency(datosViviendaSeleccionada.resumenGeneral.valorFinal)}</p></div>
                                <div><p className="text-sm font-semibold text-gray-500">Total General Abonado</p><p className="text-lg font-bold text-green-600">{formatCurrency(datosViviendaSeleccionada.resumenGeneral.totalAbonado)}</p></div>
                                <div><p className="text-sm font-semibold text-gray-500">Saldo General Pendiente</p><p className="text-lg font-bold text-red-600">{formatCurrency(datosViviendaSeleccionada.resumenGeneral.saldoPendiente)}</p></div>
                            </div>

                            <h3 className="text-xl font-bold mb-4 text-gray-800">Fuentes de Pago</h3>
                            {datosViviendaSeleccionada.fuentes.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {datosViviendaSeleccionada.fuentes.map(fuente => (
                                        <FuenteDePagoCard key={fuente.fuente} {...fuente} vivienda={datosViviendaSeleccionada.vivienda} onAbonoRegistrado={recargarDatos} />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-500 py-4">Este cliente no tiene una estructura financiera definida para hacerle seguimiento.</p>
                            )}

                            <div className="mt-12 pt-6 border-t">
                                <h3 className="text-xl font-bold mb-4 text-gray-800">Historial de Todos los Abonos</h3>
                                {datosViviendaSeleccionada.historial.length > 0 ? (
                                    <div className="space-y-4">
                                        {datosViviendaSeleccionada.historial.map(abono => (
                                            <AbonoCard key={abono.id} abono={abono} />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-gray-500 py-4">Esta vivienda aún no tiene abonos registrados.</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AnimatedPage>
    );
};

export default CrearAbono;