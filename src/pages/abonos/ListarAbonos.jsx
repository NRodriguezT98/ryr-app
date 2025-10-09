import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useData } from '../../context/DataContext';
import { useAbonosFilters } from '../../hooks/abonos/useAbonosFilters';
import AbonoCard from './AbonoCard';
import EditarAbonoModal from './EditarAbonoModal';
import ModalConfirmacion from '../../components/ModalConfirmacion';
import ModalAnularAbono from './components/ModalAnularAbono';
import ModalRevertirAbono from './components/ModalRevertirAbono';
import CustomSelect from '../../components/forms/CustomSelect';
import { Filter, BarChart2, DollarSign } from 'lucide-react';
import AbonoCardSkeleton from './AbonoCardSkeleton';
import Pagination from '../../components/Pagination';
import { usePermissions } from '../../hooks/auth/usePermissions';
import { useAnularAbono } from '../../hooks/abonos/useAnularAbono';
import { useRevertirAbono } from '../../hooks/abonos/useRevertirAbono';
import { formatCurrency } from '../../utils/textFormatters';
import ListPageLayout from '../../layout/ListPageLayout'; // <-- ¡NUESTRO LAYOUT!
import Button from '../../components/Button';

const CustomOption = (props) => {
    const { innerProps, label, data } = props;
    return (
        <div {...innerProps} className="p-3 hover:bg-blue-50 dark:hover:bg-blue-900/50 cursor-pointer">
            <p className="font-semibold text-gray-800 dark:text-gray-200">{label}</p>
            {data.cliente?.datosCliente?.cedula && (
                <p className="text-xs text-gray-500 dark:text-gray-400">{`C.C. ${data.cliente.datosCliente.cedula}`}</p>
            )}
        </div>
    );
};// Componente interno para el estilo del Select

const ListarAbonos = () => {
    const { can } = usePermissions();
    const { isLoading, abonos, clientes, viviendas, renuncias, recargarDatos } = useData();

    // Estado local para el modal de edición
    const [abonoAEditar, setAbonoAEditar] = useState(null);

    // Hook centralizado para la lógica de ANULACIÓN
    const {
        isAnularModalOpen,
        abonoParaAnular,
        iniciarAnulacion,
        cerrarAnulacion,
        confirmarAnulacion,
        isAnulando
    } = useAnularAbono(recargarDatos);

    // Hook centralizado para la lógica de REVERSIÓN
    const {
        isRevertirModalOpen,
        abonoParaRevertir,
        isRevirtiendo,
        iniciarReversion,
        cerrarReversion,
        confirmarReversion
    } = useRevertirAbono(recargarDatos);

    // Hook para manejar los filtros de la lista
    const {
        abonosFiltrados, // ✨ AHORA USAMOS LA LISTA PAGINADA
        todosLosAbonosFiltrados, // ✨ Y LA LISTA COMPLETA PARA EL SUMARIO
        setClienteFiltro, setFechaInicioFiltro, setFechaFinFiltro, setFuenteFiltro, setStatusFiltro,
        statusFiltro, fechaInicioFiltro, fechaFinFiltro, pagination
    } = useAbonosFilters();

    // Opciones para los menús de selección (filtros)
    const clienteOptions = useMemo(() => {
        const opciones = clientes.filter(c => c.vivienda).map(c => ({
            value: c.id,
            label: `${c.vivienda.manzana}${c.vivienda.numeroCasa} - ${c.datosCliente.nombres} ${c.datosCliente.apellidos}`,
            cliente: c
        }));
        return [{ value: null, label: 'Todos los Clientes', cliente: null }, ...opciones];
    }, [clientes]);

    const fuenteOptions = useMemo(() => [
        { value: null, label: 'Todas las Fuentes' },
        { value: 'cuotaInicial', label: 'Cuota Inicial' },
        { value: 'credito', label: 'Crédito Hipotecario' },
        { value: 'subsidioVivienda', label: 'Subsidio Mi Casa Ya' },
        { value: 'subsidioCaja', label: 'Subsidio Caja Comp.' },
        { value: 'gastosNotariales', label: 'Gastos Notariales' }
    ], []);

    // Placeholder para la función de guardado de edición
    const handleGuardadoEdicion = () => {
        setAbonoAEditar(null);
        recargarDatos();
    };

    const abonosAgrupados = useMemo(() => {
        return abonosFiltrados.reduce((acc, abono) => {
            const month = format(new Date(abono.fechaPago), 'MMMM yyyy', { locale: es });
            const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
            if (!acc[capitalizedMonth]) {
                acc[capitalizedMonth] = [];
            }
            acc[capitalizedMonth].push(abono);
            return acc;
        }, {});
    }, [abonosFiltrados]);

    const sumario = useMemo(() => {
        const totalAbonos = todosLosAbonosFiltrados.length;
        const sumaTotal = todosLosAbonosFiltrados.reduce((sum, abono) => sum + abono.monto, 0);
        return { totalAbonos, sumaTotal };
    }, [todosLosAbonosFiltrados]);

    const actionButton = can('abonos', 'crear') ? (
        <Link to="/abonos">
            <Button variant="primary">
                + Gestionar Pagos
            </Button>
        </Link>
    ) : null;

    const filterControls = (
        <div className="w-full space-y-6">
            {/* Sumario modernizado */}
            {!isLoading && todosLosAbonosFiltrados.length > 0 && (
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 border border-indigo-200 dark:border-indigo-700 p-6">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-800 dark:to-blue-800 opacity-50 rounded-full -translate-y-16 translate-x-16"></div>
                    <div className="relative flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center">
                            <BarChart2 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 dark:text-slate-200">Resumen de Abonos</h3>
                            <p className="text-slate-600 dark:text-slate-400">
                                <span className="font-semibold text-indigo-600 dark:text-indigo-400">{sumario.totalAbonos}</span> abono(s)
                                • Total: <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(sumario.sumaTotal)}</span>
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Header de filtros */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                    <Filter size={16} className="text-slate-600 dark:text-slate-400" />
                </div>
                <h3 className="font-semibold text-slate-700 dark:text-slate-200">Filtros de Búsqueda</h3>
            </div>

            {/* Controles de filtros modernizados */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2 uppercase tracking-wide">
                        Cliente / Vivienda
                    </label>
                    <CustomSelect
                        options={clienteOptions}
                        onChange={setClienteFiltro}
                        isClearable
                        placeholder="Todos los clientes..."
                        components={{ Option: CustomOption }}
                    />
                </div>
                <div className="lg:col-span-1">
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2 uppercase tracking-wide">
                        Fuente de Pago
                    </label>
                    <CustomSelect
                        options={fuenteOptions}
                        onChange={setFuenteFiltro}
                        isClearable
                        placeholder="Todas las fuentes..."
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2 uppercase tracking-wide">
                            Desde
                        </label>
                        <input
                            type="date"
                            className="w-full p-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                            value={fechaInicioFiltro}
                            onChange={e => setFechaInicioFiltro(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2 uppercase tracking-wide">
                            Hasta
                        </label>
                        <input
                            type="date"
                            className="w-full p-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                            value={fechaFinFiltro}
                            onChange={e => setFechaFinFiltro(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Estados modernizados */}
            <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                    Estado del Proceso
                </label>
                <div className="inline-flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <button
                        onClick={() => setStatusFiltro('activo')}
                        className={`px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${statusFiltro === 'activo'
                                ? 'bg-white dark:bg-slate-700 shadow-md text-emerald-600 dark:text-emerald-400 scale-105'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                    >
                        Activos
                    </button>
                    <button
                        onClick={() => setStatusFiltro('anulado')}
                        className={`px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${statusFiltro === 'anulado'
                                ? 'bg-white dark:bg-slate-700 shadow-md text-red-600 dark:text-red-400 scale-105'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                    >
                        Anulados
                    </button>
                    <button
                        onClick={() => setStatusFiltro('renunciado')}
                        className={`px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${statusFiltro === 'renunciado'
                                ? 'bg-white dark:bg-slate-700 shadow-md text-amber-600 dark:text-amber-400 scale-105'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                    >
                        De Renuncias
                    </button>
                    <button
                        onClick={() => setStatusFiltro('todos')}
                        className={`px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${statusFiltro === 'todos'
                                ? 'bg-white dark:bg-slate-700 shadow-md text-slate-800 dark:text-slate-200 scale-105'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                    >
                        Todos
                    </button>
                </div>
            </div>
        </div>
    );



    return (
        <ListPageLayout
            icon={<DollarSign />}
            title="Historial de Abonos"
            actionButton={actionButton}
            filterControls={filterControls}
        >
            {isLoading ? (
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => <AbonoCardSkeleton key={i} />)}
                </div>
            ) : abonosFiltrados.length > 0 ? (
                <>
                    <div className="space-y-8">
                        {Object.entries(abonosAgrupados).map(([month, abonosDelMes]) => (
                            <div key={month} className="relative">
                                {/* Header del mes modernizado */}
                                <div className="sticky top-0 z-10 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 mb-6 border border-slate-200 dark:border-slate-600 backdrop-blur-sm">
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 animate-pulse"></div>
                                        {month}
                                        <span className="ml-auto text-sm font-medium text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 px-3 py-1 rounded-full">
                                            {abonosDelMes.length} abono{abonosDelMes.length !== 1 ? 's' : ''}
                                        </span>
                                    </h3>
                                </div>

                                {/* Lista de abonos con mejor espaciado */}
                                <div className="space-y-4 pl-4">
                                    {abonosDelMes.map(abono => (
                                        <AbonoCard
                                            key={abono.id}
                                            abono={abono}
                                            onEdit={() => setAbonoAEditar(abono)}
                                            onAnular={() => iniciarAnulacion(abono)}
                                            onRevertir={() => iniciarReversion(abono)}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    <Pagination
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                        onPageChange={pagination.onPageChange}
                    />
                </>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="relative mb-8">
                        <div className="w-32 h-32 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-full flex items-center justify-center relative overflow-hidden">
                            {/* Efecto de brillo animado */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                            <svg className="w-16 h-16 text-slate-400 dark:text-slate-500 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01m3-4h.01M9 10h.01m3-7H9a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V9l-3-3z" />
                            </svg>
                        </div>
                        {/* Círculos decorativos */}
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-indigo-400 to-blue-400 rounded-full opacity-60 animate-bounce"></div>
                        <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-gradient-to-r from-slate-300 to-slate-400 rounded-full opacity-50 animate-pulse delay-300"></div>
                    </div>

                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">
                        No se encontraron abonos
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 max-w-md leading-relaxed mb-6">
                        No hay abonos que coincidan con los filtros seleccionados. Intenta ajustar los criterios de búsqueda o verifica que haya datos disponibles.
                    </p>

                    {/* Sugerencias de acción */}
                    <div className="flex flex-wrap gap-3 justify-center">
                        <button
                            onClick={() => {
                                setClienteSeleccionado('');
                                setFechaInicio('');
                                setFechaFin('');
                                setFuenteSeleccionada('');
                                setEstadoSeleccionado('');
                            }}
                            className="px-4 py-2 bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white font-medium rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg"
                        >
                            Limpiar filtros
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white font-medium rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg"
                        >
                            Actualizar datos
                        </button>
                    </div>
                </div>
            )}

            {/* --- SECCIÓN DE MODALES --- */}
            {abonoAEditar && (<EditarAbonoModal isOpen={!!abonoAEditar} onClose={() => setAbonoAEditar(null)} onSave={handleGuardadoEdicion} abonoAEditar={abonoAEditar} />)}
            {isAnularModalOpen && (<ModalAnularAbono isOpen={isAnularModalOpen} onClose={cerrarAnulacion} onAnulacionConfirmada={confirmarAnulacion} abonoAAnular={abonoParaAnular} isSubmitting={isAnulando} size="2xl" />)}
            {isRevertirModalOpen && (
                <ModalRevertirAbono
                    isOpen={isRevertirModalOpen}
                    onClose={cerrarReversion}
                    onConfirm={confirmarReversion}
                    abonoARevertir={abonoParaRevertir}
                    isSubmitting={isRevirtiendo}
                />
            )}
        </ListPageLayout>
    );
};

export default ListarAbonos;