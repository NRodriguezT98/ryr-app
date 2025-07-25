import React from 'react';
import { Link, useParams } from 'react-router-dom';
import AnimatedPage from '../../components/AnimatedPage';
import { useGestionarAbonos } from '../../hooks/abonos/useGestionarAbonos';
import FuenteDePagoCard from "./FuenteDePagoCard";
import AbonoCard from "./AbonoCard";
import { WalletCards } from "lucide-react";
import EditarAbonoModal from './EditarAbonoModal';
import ModalConfirmacion from '../../components/ModalConfirmacion';
import CondonarSaldoModal from '../viviendas/CondonarSaldoModal';
import { formatCurrency, formatID } from "../../utils/textFormatters";
import { User, Home, ArrowLeft } from 'lucide-react';

const GestionarAbonos = () => {
    const { clienteId } = useParams();
    const {
        isLoading,
        clientesParaLaLista,
        selectedClienteId, setSelectedClienteId,
        datosClienteSeleccionado,
        abonosOcultos,
        modals,
        handlers
    } = useGestionarAbonos(clienteId);

    if (isLoading && !selectedClienteId) {
        return <div className="text-center p-10 animate-pulse">Cargando datos iniciales...</div>;
    }

    const historialVisible = datosClienteSeleccionado?.data.historial.filter(a => !abonosOcultos.includes(a.id)) || [];

    return (
        <AnimatedPage>
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-10">
                    <Link to="/abonos" className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 inline-flex items-center gap-2">
                        <ArrowLeft size={14} /> Volver al buscador
                    </Link>
                    <h2 className="text-3xl font-bold text-[#1976d2] mb-2">Gestión de Pagos</h2>
                    <p className="text-gray-500 dark:text-gray-400">Consulta el estado financiero y registra abonos para el cliente seleccionado.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 self-start">
                        <h3 className="font-semibold mb-4 px-3 dark:text-gray-200">Clientes Activos</h3>
                        <ul className="space-y-2 max-h-[60vh] overflow-y-auto">
                            {clientesParaLaLista.map(cliente => (
                                <li key={cliente.id}>
                                    <button onClick={() => setSelectedClienteId(cliente.id)} className={`w-full text-left p-3 rounded-lg transition-colors ${selectedClienteId === cliente.id ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                                        <p className={`font-semibold ${selectedClienteId !== cliente.id && 'dark:text-gray-200'}`}>{`${cliente.datosCliente.nombres} ${cliente.datosCliente.apellidos}`}</p>
                                        <p className={`text-xs ${selectedClienteId === cliente.id ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'}`}>{`Mz ${cliente.vivienda.manzana} - Casa ${cliente.vivienda.numeroCasa}`}</p>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 min-h-[70vh]">
                        {isLoading && selectedClienteId ? (
                            <div className="text-center p-10 animate-pulse">Cargando datos financieros...</div>
                        ) : datosClienteSeleccionado?.data ? (
                            <div className="animate-fade-in">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <Link to={`/clientes/detalle/${datosClienteSeleccionado.data.cliente.id}`} className="text-xl text-blue-600 dark:text-blue-400 hover:underline font-semibold">{`${datosClienteSeleccionado.data.cliente.datosCliente.nombres} ${datosClienteSeleccionado.data.cliente.datosCliente.apellidos}`}</Link>
                                        <div className="mt-2 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                            <p className="flex items-center gap-2"><User size={14} /><span>C.C. {formatID(datosClienteSeleccionado.data.cliente.datosCliente.cedula)}</span></p>
                                            <p className="flex items-center gap-2"><Home size={14} /><span>Vivienda: Mz. {datosClienteSeleccionado.data.vivienda.manzana} - Casa {datosClienteSeleccionado.data.vivienda.numeroCasa}</span></p>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-700 mb-8">
                                    <div><p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Valor Final</p><p className="text-lg font-bold text-blue-600 dark:text-blue-400">{formatCurrency(datosClienteSeleccionado.data.vivienda.valorFinal)}</p></div>
                                    <div><p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Total Abonado</p><p className="text-lg font-bold text-green-600 dark:text-green-400">{formatCurrency(datosClienteSeleccionado.data.vivienda.totalAbonado)}</p></div>
                                    <div><p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Saldo Pendiente</p><p className="text-lg font-bold text-red-600 dark:text-red-400">{formatCurrency(datosClienteSeleccionado.data.vivienda.saldoPendiente)}</p></div>
                                </div>
                                <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Fuentes de Pago</h3>
                                <div className="space-y-4">
                                    {datosClienteSeleccionado.data.fuentes.map(fuente => (
                                        <FuenteDePagoCard
                                            key={fuente.fuente}
                                            {...fuente}
                                            vivienda={datosClienteSeleccionado.data.vivienda}
                                            cliente={datosClienteSeleccionado.data.cliente}
                                            onAbonoRegistrado={handlers.recargarDatos}
                                            onCondonarSaldo={() => modals.setFuenteACondonar({ ...fuente, saldoPendiente: fuente.montoPactado - fuente.abonos.reduce((sum, a) => sum + a.monto, 0), vivienda: datosClienteSeleccionado.data.vivienda, cliente: datosClienteSeleccionado.data.cliente })}
                                        />
                                    ))}
                                </div>
                                <div className="mt-12 pt-6 border-t dark:border-gray-700">
                                    <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Historial de Abonos</h3>
                                    {historialVisible.length > 0 ? (
                                        <div className="space-y-4">
                                            {historialVisible.map(abono => (
                                                <AbonoCard key={abono.id} abono={abono} onEdit={() => modals.setAbonoAEditar(abono)} onDelete={handlers.iniciarEliminacion} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-10">
                                            <p className="text-gray-500 dark:text-gray-400">Este cliente aún no ha realizado abonos.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center flex flex-col justify-center items-center h-full py-16">
                                <WalletCards size={64} className="text-gray-300 dark:text-gray-600 mb-4" />
                                <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300">Centro de Gestión de Pagos</h3>
                                <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-sm">Selecciona un cliente de la lista de la izquierda para ver sus detalles.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {modals.abonoAEditar && (<EditarAbonoModal isOpen={!!modals.abonoAEditar} onClose={() => modals.setAbonoAEditar(null)} onSave={handlers.handleGuardado} abonoAEditar={modals.abonoAEditar} />)}
            {modals.abonoAEliminar && (<ModalConfirmacion isOpen={!!modals.abonoAEliminar} onClose={() => modals.setAbonoAEliminar(null)} onConfirm={handlers.confirmarEliminar} titulo="¿Eliminar Abono?" mensaje="¿Estás seguro? Esta acción recalculará los saldos de la vivienda asociada." />)}
            {modals.fuenteACondonar && (
                <CondonarSaldoModal
                    isOpen={!!modals.fuenteACondonar}
                    onClose={() => modals.setFuenteACondonar(null)}
                    onSave={handlers.handleGuardado}
                    fuenteData={modals.fuenteACondonar}
                />
            )}
        </AnimatedPage>
    );
};

export default GestionarAbonos;