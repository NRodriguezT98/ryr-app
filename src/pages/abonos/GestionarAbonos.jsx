import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AnimatedPage from '../../components/AnimatedPage';
import { useGestionarAbonos } from '../../hooks/abonos/useGestionarAbonos';
import FuenteDePagoCard from "./FuenteDePagoCard";
import AbonoCard from "./AbonoCard";
import { Search, WalletCards } from "lucide-react";
import EditarAbonoModal from './EditarAbonoModal';
import ModalConfirmacion from '../../components/ModalConfirmacion';
import { formatCurrency, formatID } from "../../utils/textFormatters";
import { User, Home, ArrowLeft } from 'lucide-react';

const GestionarAbonos = () => {
    const navigate = useNavigate();
    const {
        isLoading,
        searchTerm, setSearchTerm,
        clientesFiltrados,
        selectedClienteId, setSelectedClienteId,
        datosClienteSeleccionado,
        abonosOcultos,
        modals,
        handlers
    } = useGestionarAbonos();

    if (isLoading && !selectedClienteId) {
        return <div className="text-center p-10 animate-pulse">Cargando datos iniciales...</div>;
    }

    const historialVisible = datosClienteSeleccionado?.data.historial.filter(a => !abonosOcultos.includes(a.id)) || [];

    return (
        <AnimatedPage>
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-[#1976d2] mb-2">Gestión de Pagos</h2>
                    <p className="text-gray-500">Busca y selecciona un cliente para registrar y consultar sus abonos.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Panel de Búsqueda */}
                    <div className="lg:col-span-1 bg-white p-4 rounded-xl shadow-lg border border-gray-100 self-start">
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar cliente, cédula o vivienda (ej: A1)"
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <ul className="space-y-2 max-h-[60vh] overflow-y-auto">
                            {clientesFiltrados.map(cliente => (
                                <li key={cliente.id}>
                                    <button onClick={() => setSelectedClienteId(cliente.id)} className={`w-full text-left p-3 rounded-lg transition-colors ${selectedClienteId === cliente.id ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}>
                                        <p className="font-semibold">{`${cliente.datosCliente.nombres} ${cliente.datosCliente.apellidos}`}</p>
                                        <p className={`text-xs ${selectedClienteId === cliente.id ? 'text-blue-200' : 'text-gray-500'}`}>{`Mz ${cliente.vivienda.manzana} - Casa ${cliente.vivienda.numeroCasa}`}</p>
                                    </button>
                                </li>
                            ))}
                            {searchTerm && clientesFiltrados.length === 0 && <li className="p-4 text-center text-sm text-gray-500">No se encontraron clientes.</li>}
                        </ul>
                    </div>

                    {/* Panel de Detalles */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg border border-gray-100 min-h-[70vh]">
                        {isLoading && selectedClienteId ? (
                            <div className="text-center p-10 animate-pulse">Cargando datos financieros...</div>
                        ) : datosClienteSeleccionado?.data ? (
                            <div className="animate-fade-in">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <Link to={`/clientes/detalle/${datosClienteSeleccionado.data.cliente.id}`} className="text-xl text-blue-600 hover:underline font-semibold">{`${datosClienteSeleccionado.data.cliente.datosCliente.nombres} ${datosClienteSeleccionado.data.cliente.datosCliente.apellidos}`}</Link>
                                        <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                                            <p className="flex items-center gap-2"><User size={14} /><span>C.C. {formatID(datosClienteSeleccionado.data.cliente.datosCliente.cedula)}</span></p>
                                            <p className="flex items-center gap-2"><Home size={14} /><span>Vivienda: Mz. {datosClienteSeleccionado.data.vivienda.manzana} - Casa {datosClienteSeleccionado.data.vivienda.numeroCasa}</span></p>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center p-4 bg-gray-50 rounded-lg border mb-8">
                                    <div><p className="text-sm font-semibold text-gray-500">Valor Final</p><p className="text-lg font-bold text-blue-600">{formatCurrency(datosClienteSeleccionado.data.vivienda.valorFinal)}</p></div>
                                    <div><p className="text-sm font-semibold text-gray-500">Total Abonado</p><p className="text-lg font-bold text-green-600">{formatCurrency(datosClienteSeleccionado.data.vivienda.totalAbonado)}</p></div>
                                    <div><p className="text-sm font-semibold text-gray-500">Saldo Pendiente</p><p className="text-lg font-bold text-red-600">{formatCurrency(datosClienteSeleccionado.data.vivienda.saldoPendiente)}</p></div>
                                </div>
                                <h3 className="text-xl font-bold mb-4 text-gray-800">Fuentes de Pago</h3>
                                <div className="space-y-4">
                                    {datosClienteSeleccionado.data.fuentes.map(fuente => (
                                        <FuenteDePagoCard key={fuente.fuente} {...fuente} vivienda={datosClienteSeleccionado.data.vivienda} cliente={datosClienteSeleccionado.data.cliente} onAbonoRegistrado={handlers.recargarDatos} />
                                    ))}
                                </div>
                                <div className="mt-12 pt-6 border-t">
                                    <h3 className="text-xl font-bold mb-4 text-gray-800">Historial de Abonos</h3>
                                    {/* --- LÓGICA CONDICIONAL AÑADIDA AQUÍ --- */}
                                    {historialVisible.length > 0 ? (
                                        <div className="space-y-4">
                                            {historialVisible.map(abono => (
                                                <AbonoCard key={abono.id} abono={abono} onEdit={() => modals.setAbonoAEditar(abono)} onDelete={handlers.iniciarEliminacion} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-10">
                                            <p className="text-gray-500">Este cliente aún no ha realizado abonos.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center flex flex-col justify-center items-center h-full py-16">
                                <WalletCards size={64} className="text-gray-300 mb-4" />
                                <h3 className="text-xl font-bold text-gray-700">Centro de Gestión de Pagos</h3>
                                <p className="text-gray-500 mt-2 max-w-sm">Comienza buscando un cliente en el panel de la izquierda.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {modals.abonoAEditar && (<EditarAbonoModal isOpen={!!modals.abonoAEditar} onClose={() => modals.setAbonoAEditar(null)} onSave={handlers.handleGuardadoEdicion} abonoAEditar={modals.abonoAEditar} />)}
            {modals.abonoAEliminar && (<ModalConfirmacion isOpen={!!modals.abonoAEliminar} onClose={() => modals.setAbonoAEliminar(null)} onConfirm={handlers.confirmarEliminar} titulo="¿Eliminar Abono?" mensaje="¿Estás seguro? Esta acción recalculará los saldos de la vivienda asociada." />)}
        </AnimatedPage>
    );
};

export default GestionarAbonos;