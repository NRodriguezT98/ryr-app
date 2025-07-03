import React, { useState, useMemo, useCallback } from "react";
import AnimatedPage from "../../components/AnimatedPage";
import { useData } from "../../context/DataContext";
import FuenteDePagoCard from "./FuenteDePagoCard";
import AbonoCard from "./AbonoCard";
import { Search, WalletCards } from "lucide-react"; // Importamos un nuevo ícono

const formatCurrency = (value) => (value || 0).toLocaleString("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 });

const CrearAbono = () => {
    const { isLoading, viviendas, clientes, abonos, recargarDatos } = useData();
    const [selectedClienteId, setSelectedClienteId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const clientesConVivienda = useMemo(() =>
        clientes.filter(c => c.vivienda),
        [clientes]);

    const clientesFiltrados = useMemo(() => {
        if (!searchTerm.trim()) {
            return [];
        }
        const lowerCaseSearchTerm = searchTerm.toLowerCase().replace(/\s/g, '');
        return clientesConVivienda.filter(c => {
            const nombreCompleto = `${c.datosCliente.nombres} ${c.datosCliente.apellidos}`.toLowerCase();
            const ubicacion = `${c.vivienda.manzana}${c.vivienda.numeroCasa}`.toLowerCase().replace(/\s/g, '');
            return nombreCompleto.includes(searchTerm.toLowerCase()) || ubicacion.includes(lowerCaseSearchTerm);
        }).sort((a, b) => {
            if (a.vivienda.manzana < b.vivienda.manzana) return -1;
            if (a.vivienda.manzana > b.vivienda.manzana) return 1;
            return a.vivienda.numeroCasa - b.vivienda.numeroCasa;
        });
    }, [clientesConVivienda, searchTerm]);

    const datosClienteSeleccionado = useMemo(() => {
        if (!selectedClienteId) return null;
        const clienteActual = clientes.find(c => c.id === selectedClienteId);
        if (!clienteActual) return null;
        const viviendaActual = clienteActual.vivienda;
        if (!viviendaActual) return null;

        const historial = abonos.filter(a => a.viviendaId === viviendaActual.id).sort((a, b) => new Date(b.fechaPago) - new Date(a.fechaPago));
        const fuentes = [];
        if (clienteActual.financiero) {
            const { financiero } = clienteActual;
            if (financiero.aplicaCuotaInicial) fuentes.push({ titulo: "Cuota Inicial", fuente: "cuotaInicial", montoPactado: financiero.cuotaInicial.monto, abonos: historial.filter(a => a.fuente === 'cuotaInicial') });
            if (financiero.aplicaCredito) fuentes.push({ titulo: "Crédito Hipotecario", fuente: "credito", montoPactado: financiero.credito.monto, abonos: historial.filter(a => a.fuente === 'credito') });
            if (financiero.aplicaSubsidioVivienda) fuentes.push({ titulo: "Subsidio Mi Casa Ya", fuente: "subsidioVivienda", montoPactado: financiero.subsidioVivienda.monto, abonos: historial.filter(a => a.fuente === 'subsidioVivienda') });
            if (financiero.aplicaSubsidioCaja) fuentes.push({ titulo: `Subsidio Caja (${financiero.subsidioCaja.caja})`, fuente: "subsidioCaja", montoPactado: financiero.subsidioCaja.monto, abonos: historial.filter(a => a.fuente === 'subsidioCaja') });
            if (financiero.gastosNotariales) fuentes.push({ titulo: "Gastos Notariales", fuente: "gastosNotariales", montoPactado: financiero.gastosNotariales.monto, abonos: historial.filter(a => a.fuente === 'gastosNotariales') });
        }
        return { vivienda: viviendaActual, cliente: clienteActual, fuentes, historial };
    }, [selectedClienteId, clientes, abonos]);

    if (isLoading) return <div className="text-center p-10 animate-pulse">Cargando...</div>;

    return (
        <AnimatedPage>
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-[#1976d2] mb-2">Seguimiento de Pagos</h2>
                    <p className="text-gray-500">Busca y selecciona un cliente para gestionar sus abonos.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-1 bg-white p-4 rounded-xl shadow-lg border border-gray-100 self-start">
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar cliente o vivienda (ej: A1)"
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <ul className="space-y-2 max-h-[60vh] overflow-y-auto">
                            {clientesFiltrados.map(cliente => (
                                <li key={cliente.id}>
                                    <button
                                        onClick={() => setSelectedClienteId(cliente.id)}
                                        className={`w-full text-left p-3 rounded-lg transition-colors ${selectedClienteId === cliente.id ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
                                    >
                                        <p className="font-semibold">{`${cliente.datosCliente.nombres} ${cliente.datosCliente.apellidos}`}</p>
                                        <p className={`text-xs ${selectedClienteId === cliente.id ? 'text-blue-200' : 'text-gray-500'}`}>{`Mz ${cliente.vivienda.manzana} - Casa ${cliente.vivienda.numeroCasa}`}</p>
                                    </button>
                                </li>
                            ))}
                            {searchTerm && clientesFiltrados.length === 0 && (
                                <li className="p-4 text-center text-sm text-gray-500">No se encontraron clientes.</li>
                            )}
                        </ul>
                    </div>

                    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg border border-gray-100 min-h-[70vh]">
                        {datosClienteSeleccionado ? (
                            <div className="animate-fade-in">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center p-4 bg-gray-50 rounded-lg border mb-8">
                                    <div><p className="text-sm font-semibold text-gray-500">Valor Final Vivienda</p><p className="text-lg font-bold text-blue-600">{formatCurrency(datosClienteSeleccionado.vivienda.valorFinal)}</p></div>
                                    <div><p className="text-sm font-semibold text-gray-500">Total Abonado</p><p className="text-lg font-bold text-green-600">{formatCurrency(datosClienteSeleccionado.vivienda.totalAbonado)}</p></div>
                                    <div><p className="text-sm font-semibold text-gray-500">Saldo Pendiente</p><p className="text-lg font-bold text-red-600">{formatCurrency(datosClienteSeleccionado.vivienda.saldoPendiente)}</p></div>
                                </div>

                                <h3 className="text-xl font-bold mb-4 text-gray-800">Fuentes de Pago</h3>
                                {datosClienteSeleccionado.fuentes.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {datosClienteSeleccionado.fuentes.map(fuente => (
                                            <FuenteDePagoCard key={fuente.fuente} {...fuente} vivienda={datosClienteSeleccionado.vivienda} onAbonoRegistrado={recargarDatos} />
                                        ))}
                                    </div>
                                ) : <p className="text-center text-gray-500 py-4">Este cliente no tiene una estructura financiera definida.</p>}

                                <div className="mt-12 pt-6 border-t">
                                    <h3 className="text-xl font-bold mb-4 text-gray-800">Historial de Abonos</h3>
                                    {datosClienteSeleccionado.historial.length > 0 ? (
                                        <div className="space-y-4">
                                            {datosClienteSeleccionado.historial.map(abono => (
                                                <AbonoCard key={abono.id} abono={abono} />
                                            ))}
                                        </div>
                                    ) : <p className="text-center text-gray-500 py-4">No hay abonos registrados.</p>}
                                </div>
                            </div>
                        ) : (
                            // --- NUEVO ESTADO VACÍO E INSTRUCTIVO ---
                            <div className="text-center flex flex-col justify-center items-center h-full py-16">
                                <WalletCards size={64} className="text-gray-300 mb-4" />
                                <h3 className="text-xl font-bold text-gray-700">Centro de Gestión de Pagos</h3>
                                <p className="text-gray-500 mt-2 max-w-sm">
                                    Comienza escribiendo en el buscador para encontrar un cliente y ver su estado financiero detallado.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
};

export default CrearAbono;