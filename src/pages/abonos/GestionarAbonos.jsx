import { useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import AnimatedPage from '../../components/AnimatedPage';
import { useGestionarAbonos } from '../../hooks/abonos/useGestionarAbonos';
import FuenteDePagoCard from "./FuenteDePagoCard";
import AbonoCard from "./AbonoCard";
import { WalletCards, BarChart2, Sparkles, Calculator, CreditCard, Search, ArrowRight } from "lucide-react"
import EditarAbonoModal from './EditarAbonoModal';
import ModalConfirmacion from '../../components/ModalConfirmacion';
import CondonarSaldoModal from '../viviendas/CondonarSaldoModal';
import { formatCurrency, formatID } from "../../utils/textFormatters";
import { User, Home, ArrowLeft } from 'lucide-react';
import ModalRegistrarDesembolso from './components/ModalRegistrarDesembolso';
import ModalAnularAbono from './components/ModalAnularAbono';
import { useAnularAbono } from '../../hooks/abonos/useAnularAbono';
import { useRevertirAbono } from '../../hooks/abonos/useRevertirAbono';

const GestionarAbonos = () => {
    const { clienteId } = useParams();

    // Hook principal para los datos de la página y otros modales (edición, condonación)
    const {
        isLoading,
        isReady,
        clientesParaLaLista,
        selectedClienteId, setSelectedClienteId,
        datosClienteSeleccionado,
        abonosActivos,
        sumarioAbonosActivos,
        totalesCalculados,
        modals,
        handlers
    } = useGestionarAbonos(clienteId);

    // Hook centralizado para la lógica de ANULACIÓN
    const {
        isAnularModalOpen,
        abonoParaAnular,
        iniciarAnulacion,
        cerrarAnulacion,
        confirmarAnulacion,
        isAnulando
    } = useAnularAbono();

    // Hook centralizado para la lógica de REVERSIÓN
    const {
        isRevertirModalOpen,
        isRevirtiendo,
        iniciarReversion,
        cerrarReversion,
        confirmarReversion
    } = useRevertirAbono();

    const [clienteSearchTerm, setClienteSearchTerm] = useState('');

    const filteredClientes = useMemo(() => {
        if (!clienteSearchTerm.trim()) {
            return clientesParaLaLista; // Muestra todos los clientes por defecto
        }
        return clientesParaLaLista.filter(cliente => {
            const nombreCompleto = `${cliente.datosCliente.nombres} ${cliente.datosCliente.apellidos}`;
            const cedula = cliente.datosCliente.cedula;
            const vivienda = `Mz ${cliente.vivienda.manzana} Casa ${cliente.vivienda.numeroCasa}`;

            return nombreCompleto.toLowerCase().includes(clienteSearchTerm.toLowerCase()) ||
                cedula.includes(clienteSearchTerm) ||
                vivienda.toLowerCase().includes(clienteSearchTerm.toLowerCase());
        });
    }, [clientesParaLaLista, clienteSearchTerm]);

    // ✅ Esperar a que las colecciones estén listas antes de mostrar contenido
    if (!isReady || (isLoading && !selectedClienteId)) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <Calculator className="w-16 h-16 text-green-600 animate-spin mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                        Cargando Datos Financieros
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Preparando información de clientes y abonos...
                    </p>
                </div>
            </div>
        );
    }

    const historialVisible = datosClienteSeleccionado?.data?.historial || [];

    return (
        <AnimatedPage>
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Botón de navegación */}
                    <div className="flex justify-end mb-6">
                        <Link
                            to="/abonos/listar"
                            className="inline-flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                        >
                            Ir a Historial de Abonos <ArrowRight size={14} className="md:w-4 md:h-4" />
                        </Link>
                    </div>

                    {/* Header optimizado */}
                    <div className="text-center mb-8 md:mb-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl md:rounded-3xl shadow-lg mb-4 md:mb-6">
                            <Calculator className="w-8 h-8 md:w-10 md:h-10 text-white" />
                        </div>

                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-3 md:mb-4 px-4">
                            Gestión de Pagos
                        </h1>
                        <p className="text-sm md:text-base lg:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4">
                            Centro de control financiero para consultar y registrar abonos de tus clientes
                        </p>
                    </div>

                    {/* Layout principal modernizado */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        {/* Panel de clientes modernizado */}
                        <div className="lg:col-span-1 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 overflow-hidden">
                            {/* Header del panel optimizado */}
                            <div className="bg-gradient-to-r from-green-600 to-blue-600 p-4 md:p-6">
                                <div className="flex items-center gap-2 md:gap-3">
                                    <User className="w-5 h-5 md:w-6 md:h-6 text-white drop-shadow-md" />
                                    <h3 className="text-base md:text-lg font-bold text-white drop-shadow-md">Clientes Activos</h3>
                                    <Sparkles className="w-4 h-4 md:w-5 md:h-5 animate-pulse text-yellow-200 drop-shadow-md" />
                                </div>
                                <p className="text-white/90 text-xs md:text-sm mt-1 font-medium drop-shadow-sm">
                                    {filteredClientes.length} de {clientesParaLaLista.length} cliente{clientesParaLaLista.length !== 1 ? 's' : ''}
                                </p>
                            </div>

                            {/* Buscador de clientes */}
                            {clientesParaLaLista.length > 0 && (
                                <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-600">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Buscar por nombre, cédula o vivienda..."
                                            value={clienteSearchTerm}
                                            onChange={(e) => setClienteSearchTerm(e.target.value)}
                                            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition-colors duration-200"
                                        />
                                        {clienteSearchTerm && (
                                            <button
                                                onClick={() => setClienteSearchTerm('')}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                            >
                                                <span className="text-lg">×</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Lista de clientes optimizada */}
                            <div className="p-3 md:p-6">
                                {filteredClientes.length === 0 ? (
                                    <div className="text-center py-8">
                                        <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {clienteSearchTerm ? 'No se encontraron clientes' : 'No hay clientes disponibles'}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-2 md:space-y-3 max-h-[60vh] overflow-y-auto overflow-x-hidden custom-scrollbar">
                                        {filteredClientes.map(cliente => (
                                            <div key={cliente.id} className="group overflow-hidden">
                                                <button
                                                    onClick={() => setSelectedClienteId(cliente.id)}
                                                    className={`w-full text-left p-3 md:p-4 rounded-xl md:rounded-2xl transition-all duration-300 overflow-hidden ${selectedClienteId === cliente.id
                                                        ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg shadow-green-500/25'
                                                        : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gradient-to-r hover:from-green-100 hover:to-blue-100 dark:hover:from-gray-800 dark:hover:to-gray-900 shadow-md hover:shadow-lg'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-2 md:gap-3 overflow-hidden">
                                                        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0 ${selectedClienteId === cliente.id
                                                            ? 'bg-white/20'
                                                            : 'bg-gradient-to-r from-green-500 to-blue-500'
                                                            }`}>
                                                            <User className={`w-4 h-4 md:w-5 md:h-5 ${selectedClienteId === cliente.id ? 'text-white' : 'text-white'
                                                                }`} />
                                                        </div>
                                                        <div className="flex-1 min-w-0 overflow-hidden">
                                                            <p className={`font-bold text-xs md:text-sm truncate ${selectedClienteId !== cliente.id && 'text-gray-900 dark:text-gray-100 dark:group-hover:text-white'
                                                                }`}>
                                                                {`${cliente.datosCliente.nombres} ${cliente.datosCliente.apellidos}`}
                                                            </p>
                                                            <p className={`text-xs flex items-center gap-1 ${selectedClienteId === cliente.id ? 'text-green-100' : 'text-gray-600 dark:text-gray-300 dark:group-hover:text-gray-200'
                                                                }`}>
                                                                <Home size={10} className="md:w-3 md:h-3" />
                                                                {`Mz ${cliente.vivienda.manzana} - Casa ${cliente.vivienda.numeroCasa}`}
                                                            </p>
                                                        </div>
                                                        {selectedClienteId === cliente.id && (
                                                            <div className="text-white">
                                                                <Sparkles size={14} className="md:w-4 md:h-4 animate-bounce" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Panel principal modernizado */}
                        <div className="lg:col-span-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 min-h-[70vh] overflow-hidden">
                            {isLoading && selectedClienteId ? (
                                <div className="flex items-center justify-center h-full p-6 md:p-10">
                                    <div className="text-center">
                                        <CreditCard className="w-12 h-12 md:w-16 md:h-16 text-green-600 animate-pulse mx-auto mb-3 md:mb-4" />
                                        <h3 className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                                            Cargando datos financieros...
                                        </h3>
                                        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 px-4">
                                            Obteniendo información del cliente seleccionado
                                        </p>
                                    </div>
                                </div>
                            ) : datosClienteSeleccionado?.data ? (
                                <div className="animate-fade-in">
                                    {/* Header del cliente optimizado */}
                                    <div className="bg-gradient-to-r from-green-600 to-blue-600 p-4 md:p-8">
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
                                            <div>
                                                <Link
                                                    to={`/clientes/detalle/${datosClienteSeleccionado.data.cliente.id}`}
                                                    className="text-lg md:text-2xl lg:text-3xl font-bold !text-white hover:!text-yellow-200 transition-colors duration-300 inline-flex items-center gap-2 drop-shadow-lg"
                                                >
                                                    {`${datosClienteSeleccionado.data.cliente.datosCliente.nombres} ${datosClienteSeleccionado.data.cliente.datosCliente.apellidos}`}
                                                    <ArrowLeft size={16} className="md:w-5 md:h-5 rotate-45 text-white" />
                                                </Link>
                                                <div className="mt-2 md:mt-3 flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-xs md:text-sm text-white/90 font-medium">
                                                    <div className="flex items-center gap-1 md:gap-2 drop-shadow-sm">
                                                        <User size={14} className="md:w-4 md:h-4 text-white" />
                                                        <span>C.C. {formatID(datosClienteSeleccionado.data.cliente.datosCliente.cedula)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 md:gap-2 drop-shadow-sm">
                                                        <Home size={14} className="md:w-4 md:h-4 text-white" />
                                                        <span>Mz. {datosClienteSeleccionado.data.vivienda.manzana} - Casa {datosClienteSeleccionado.data.vivienda.numeroCasa}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-white">
                                                <CreditCard className="w-6 h-6 md:w-8 md:h-8" />
                                                <Sparkles className="w-5 h-5 md:w-6 md:h-6 animate-pulse" />
                                            </div>
                                        </div>
                                    </div>
                                    {/* Estadísticas financieras reorganizadas */}
                                    <div className="p-4 md:p-8">
                                        <div className="space-y-4 md:space-y-6 mb-6 md:mb-8">
                                            {/* Valor Total de la Vivienda - Primera fila completa */}
                                            <div className="bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl p-4 md:p-5 shadow-lg border border-gray-100 dark:border-gray-700 transform hover:scale-105 transition-all duration-300">
                                                {/* Header con ícono y título */}
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                                                        <Home className="w-4 h-4 md:w-5 md:h-5 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                    <p className="text-xs md:text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Valor Total de la Vivienda</p>
                                                </div>

                                                {/* Valor principal */}
                                                <div className="text-center">
                                                    <p className="text-lg md:text-xl lg:text-2xl font-bold text-black dark:text-white leading-tight">
                                                        {formatCurrency(totalesCalculados.valorFinal)}
                                                    </p>
                                                    <p className="text-xs text-black dark:text-white mt-1">Precio total establecido para la propiedad</p>
                                                </div>
                                            </div>

                                            {/* Segunda fila: Total Abonado y Saldo Pendiente */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                                {/* Total Abonado */}
                                                <div className="bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl p-4 md:p-5 shadow-lg border border-gray-100 dark:border-gray-700 transform hover:scale-105 transition-all duration-300">
                                                    {/* Header con ícono y título */}
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                                                            <CreditCard className="w-4 h-4 md:w-5 md:h-5 text-green-600 dark:text-green-400" />
                                                        </div>
                                                        <p className="text-xs md:text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Abonado</p>
                                                    </div>

                                                    {/* Valor principal */}
                                                    <div className="mb-3">
                                                        <p className="text-base md:text-lg lg:text-xl font-bold text-green-600 dark:text-green-400 leading-tight">
                                                            {formatCurrency(totalesCalculados.totalAbonado)}
                                                        </p>
                                                    </div>

                                                    {/* Barra de progreso */}
                                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 shadow-inner">
                                                        <div
                                                            className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500 shadow-sm"
                                                            style={{ width: `${totalesCalculados.valorFinal > 0 ? (totalesCalculados.totalAbonado / totalesCalculados.valorFinal) * 100 : 0}%` }}
                                                        ></div>
                                                    </div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                                                        {totalesCalculados.valorFinal > 0 ? Math.round((totalesCalculados.totalAbonado / totalesCalculados.valorFinal) * 100) : 0}% pagado
                                                    </p>
                                                </div>

                                                {/* Saldo Pendiente */}
                                                <div className="bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl p-4 md:p-5 shadow-lg border border-gray-100 dark:border-gray-700 transform hover:scale-105 transition-all duration-300">
                                                    {/* Header con ícono y título */}
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <div className="w-8 h-8 md:w-10 md:h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                                                            <Calculator className="w-4 h-4 md:w-5 md:h-5 text-red-600 dark:text-red-400" />
                                                        </div>
                                                        <p className="text-xs md:text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Saldo Pendiente</p>
                                                    </div>

                                                    {/* Valor principal */}
                                                    <div className="mb-3">
                                                        <p className="text-base md:text-lg lg:text-xl font-bold text-red-600 dark:text-red-400 leading-tight">
                                                            {formatCurrency(totalesCalculados.saldoPendiente)}
                                                        </p>
                                                    </div>

                                                    {/* Barra de progreso */}
                                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 shadow-inner">
                                                        <div
                                                            className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all duration-500 shadow-sm"
                                                            style={{ width: `${totalesCalculados.valorFinal > 0 ? (totalesCalculados.saldoPendiente / totalesCalculados.valorFinal) * 100 : 0}%` }}
                                                        ></div>
                                                    </div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                                                        {totalesCalculados.valorFinal > 0 ? Math.round((totalesCalculados.saldoPendiente / totalesCalculados.valorFinal) * 100) : 0}% por pagar
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Fuentes de pago */}
                                        <div className="space-y-4 md:space-y-6">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                                                    <WalletCards className="w-5 h-5 md:w-6 md:h-6 text-green-600 dark:text-green-400" />
                                                    Fuentes de Pago
                                                </h3>
                                                <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 md:px-3 py-1 rounded-full">
                                                    {datosClienteSeleccionado?.data?.fuentes?.length || 0} fuente{(datosClienteSeleccionado?.data?.fuentes?.length || 0) !== 1 ? 's' : ''}
                                                </div>
                                            </div>

                                            <div className="grid gap-6">
                                                {(datosClienteSeleccionado?.data?.fuentes || []).map(fuente => (
                                                    <div key={fuente.fuente} className="transform hover:scale-[1.02] transition-all duration-300">
                                                        <FuenteDePagoCard
                                                            {...fuente}
                                                            vivienda={datosClienteSeleccionado.data.vivienda}
                                                            cliente={datosClienteSeleccionado.data.cliente}
                                                            proyecto={datosClienteSeleccionado.data.proyecto}
                                                            onCondonarSaldo={() => modals.setFuenteACondonar({ ...fuente, saldoPendiente: fuente.montoPactado - fuente.abonos.reduce((sum, a) => sum + a.monto, 0), vivienda: datosClienteSeleccionado.data.vivienda, cliente: datosClienteSeleccionado.data.cliente, proyecto: datosClienteSeleccionado.data.proyecto })}
                                                            onRegistrarDesembolso={() => modals.setDesembolsoARegistrar({ ...fuente, vivienda: datosClienteSeleccionado.data.vivienda, cliente: datosClienteSeleccionado.data.cliente, proyecto: datosClienteSeleccionado.data.proyecto })}
                                                            showHistory={false}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Historial de abonos optimizado */}
                                        <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-gray-200 dark:border-gray-600">
                                            <div className="flex items-center justify-between mb-4 md:mb-6">
                                                <h3 className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                                                    <BarChart2 className="w-5 h-5 md:w-6 md:h-6 text-blue-600 dark:text-blue-400" />
                                                    Historial de Abonos
                                                </h3>
                                                {abonosActivos.length > 0 && (
                                                    <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 md:px-3 py-1 rounded-full">
                                                        {abonosActivos.length} abono{abonosActivos.length !== 1 ? 's' : ''}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Sumario optimizado */}
                                            {abonosActivos.length > 0 && (
                                                <div className="mb-6 md:mb-8 p-4 md:p-6 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 border border-blue-200 dark:border-blue-700 rounded-xl md:rounded-2xl">
                                                    <div className="flex items-center gap-3 md:gap-4">
                                                        <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg md:rounded-xl flex items-center justify-center">
                                                            <BarChart2 className="w-5 h-5 md:w-6 md:h-6 text-white" />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-sm md:text-base font-bold text-gray-800 dark:text-white">Resumen Financiero</h4>
                                                            <p className="text-xs md:text-sm text-blue-700 dark:text-white/90">
                                                                <span className="font-bold">{sumarioAbonosActivos.totalAbonos}</span> abono{sumarioAbonosActivos.totalAbonos !== 1 ? 's' : ''} registrado{sumarioAbonosActivos.totalAbonos !== 1 ? 's' : ''} por un total de <span className="font-bold">{formatCurrency(sumarioAbonosActivos.sumaTotal)}</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Lista de abonos */}
                                            {abonosActivos.length > 0 ? (
                                                <div className="space-y-6">
                                                    {abonosActivos.map(abono => (
                                                        <div key={abono.id} className="transform hover:scale-[1.02] transition-all duration-300">
                                                            <AbonoCard
                                                                abono={abono}
                                                                onEdit={() => modals.setAbonoAEditar(abono)}
                                                                onAnular={() => iniciarAnulacion(abono)}
                                                                onRevertir={() => iniciarReversion(abono)}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-12 md:py-16">
                                                    <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-100 dark:bg-gray-700 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-4 md:mb-6">
                                                        <CreditCard className="w-8 h-8 md:w-10 md:h-10 text-gray-400 dark:text-gray-500" />
                                                    </div>
                                                    <h3 className="text-lg md:text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">Sin Abonos Registrados</h3>
                                                    <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 max-w-md mx-auto px-4">
                                                        Este cliente aún no ha realizado abonos. Los pagos aparecerán aquí cuando se registren.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col justify-center items-center h-full py-16 md:py-24 text-center">
                                    <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-r from-green-100 to-blue-100 dark:from-gray-700 dark:to-gray-600 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-6 md:mb-8">
                                        <WalletCards size={40} className="md:w-12 md:h-12 text-green-600 dark:text-gray-400" />
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3 md:mb-4 px-4">Centro de Gestión Financiera</h3>
                                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 max-w-md mx-auto px-4">
                                        Selecciona un cliente del panel izquierdo para ver sus detalles financieros y gestionar sus pagos.
                                    </p>
                                    <div className="mt-4 md:mt-6 flex items-center gap-2 text-xs md:text-sm text-gray-500 dark:text-gray-500">
                                        <Sparkles size={14} className="md:w-4 md:h-4" />
                                        <span>Gestión profesional de abonos y pagos</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- SECCIÓN DE MODALES --- */}
            {isAnularModalOpen && (
                <ModalAnularAbono
                    isOpen={isAnularModalOpen}
                    onClose={cerrarAnulacion}
                    onAnulacionConfirmada={confirmarAnulacion}
                    abonoAAnular={abonoParaAnular}
                    isSubmitting={isAnulando}
                />
            )}

            {isRevertirModalOpen && (
                <ModalConfirmacion
                    isOpen={isRevertirModalOpen}
                    onClose={cerrarReversion}
                    onConfirm={confirmarReversion}
                    titulo="¿Revertir Anulación?"
                    mensaje="Esto reactivará el abono y volverá a afectar los saldos de la vivienda. ¿Deseas continuar?"
                    isSubmitting={isRevirtiendo}
                />
            )}

            {modals.abonoAEditar && (<EditarAbonoModal isOpen={!!modals.abonoAEditar} onClose={() => modals.setAbonoAEditar(null)} onSave={handlers.handleGuardado} abonoAEditar={modals.abonoAEditar} />)}
            {modals.fuenteACondonar && (<CondonarSaldoModal isOpen={!!modals.fuenteACondonar} onClose={() => modals.setFuenteACondonar(null)} onSave={handlers.handleGuardado} fuenteData={modals.fuenteACondonar} />)}
            {modals.desembolsoARegistrar && (
                <ModalRegistrarDesembolso
                    // Corregimos el nombre de la variable aquí
                    isOpen={!!modals.desembolsoARegistrar}
                    onClose={() => modals.setDesembolsoARegistrar(null)}
                    onSave={handlers.handleGuardado}
                    fuenteData={modals.desembolsoARegistrar}
                />
            )}
        </AnimatedPage>
    );
};

export default GestionarAbonos;