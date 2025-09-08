import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import AnimatedPage from '../../components/AnimatedPage';
import { useData } from '../../context/DataContext';
import { useAbonosFilters } from '../../hooks/abonos/useAbonosFilters';
import AbonoCard from './AbonoCard';
import EditarAbonoModal from './EditarAbonoModal';
import ModalConfirmacion from '../../components/ModalConfirmacion';
import ModalAnularAbono from './components/ModalAnularAbono';
import Select from 'react-select';
import { Filter, BarChart2 } from 'lucide-react';
import AbonoCardSkeleton from './AbonoCardSkeleton';
import Pagination from '../../components/Pagination';
import { usePermissions } from '../../hooks/auth/usePermissions';
import { useAnularAbono } from '../../hooks/abonos/useAnularAbono';
import { useRevertirAbono } from '../../hooks/abonos/useRevertirAbono'; // Importamos el nuevo hook de reversión
import { formatCurrency } from '../../utils/textFormatters';

// Componente interno para el estilo del Select
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
};

// Función interna para los estilos del Select
const getSelectStyles = () => ({
    control: (base, state) => ({
        ...base,
        backgroundColor: 'var(--color-bg-form)',
        borderColor: state.isFocused ? '#3b82f6' : '#4b5563',
        '&:hover': { borderColor: '#3b82f6' },
    }),
    singleValue: (base) => ({ ...base, color: 'var(--color-text-form)' }),
    menu: (base) => ({ ...base, backgroundColor: 'var(--color-bg-form)' }),
    option: (base, state) => ({ ...base, backgroundColor: state.isFocused ? '#2563eb' : 'var(--color-bg-form)', color: state.isFocused ? 'white' : 'var(--color-text-form)' }),
    input: (base) => ({ ...base, color: 'var(--color-text-form)' }),
});

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
    // ✨ FIN: Lógica para el sumario dinámico

    return (
        <AnimatedPage>
            <style>{`
                :root {
                    --color-bg-form: ${document.documentElement.classList.contains('dark') ? '#374151' : '#ffffff'};
                    --color-text-form: ${document.documentElement.classList.contains('dark') ? '#ffffff' : '#1f2937'};
                }
            `}</style>
            <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl mt-10 relative">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                    <div className='text-center md:text-left'>
                        <h2 className="text-4xl font-extrabold text-green-600 uppercase font-poppins">Historial de Abonos</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Consulta y filtra todos los pagos registrados en el sistema.</p>
                    </div>
                    {can('abonos', 'crear') && (
                        <Link to="/abonos" className="mt-4 md:mt-0">
                            <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all">
                                + Gestionar Pagos
                            </button>
                        </Link>
                    )}
                </div>

                {/* --- SECCIÓN DE FILTROS --- */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-700 mb-8">
                    {/* ✨ INICIO: Nuevo Sumario Dinámico */}
                    {!isLoading && todosLosAbonosFiltrados.length > 0 && (
                        <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 rounded-r-lg flex items-center gap-4">
                            <BarChart2 className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                            <p className="text-sm text-blue-800 dark:text-blue-300">
                                Mostrando <span className="font-bold">{sumario.totalAbonos}</span> abono(s) que suman un total de <span className="font-bold">{formatCurrency(sumario.sumaTotal)}</span>.
                            </p>
                        </div>
                    )}
                    {/* ✨ FIN: Nuevo Sumario Dinámico */}
                    <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2"><Filter size={18} /> Opciones de Filtro</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1">
                            <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Cliente / Vivienda</label>
                            <Select options={clienteOptions} onChange={setClienteFiltro} isClearable placeholder="Todos..." components={{ Option: CustomOption }} styles={getSelectStyles()} />
                        </div>
                        <div className="lg:col-span-1">
                            <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Fuente de Pago</label>
                            <Select options={fuenteOptions} onChange={setFuenteFiltro} isClearable placeholder="Todas..." styles={getSelectStyles()} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Desde</label>
                                <input type="date" className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={fechaInicioFiltro} onChange={e => setFechaInicioFiltro(e.target.value)} />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Hasta</label>
                                <input type="date" className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={fechaFinFiltro} onChange={e => setFechaFinFiltro(e.target.value)} />
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Estado del Proceso</label>
                        <div className="flex-shrink-0 bg-gray-200 dark:bg-gray-700 p-1 rounded-lg mt-1 flex max-w-md">
                            <button onClick={() => setStatusFiltro('activo')} className={`w-1/4 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${statusFiltro === 'activo' ? 'bg-white dark:bg-gray-900 shadow text-green-600' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>Activos</button>
                            <button onClick={() => setStatusFiltro('anulado')} className={`w-1/4 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${statusFiltro === 'anulado' ? 'bg-white dark:bg-gray-900 shadow text-red-600' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>Anulados</button>
                            <button onClick={() => setStatusFiltro('renunciado')} className={`w-1/4 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${statusFiltro === 'renunciado' ? 'bg-white dark:bg-gray-900 shadow text-orange-600' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>De Renuncias</button>
                            <button onClick={() => setStatusFiltro('todos')} className={`w-1/4 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${statusFiltro === 'todos' ? 'bg-white dark:bg-gray-900 shadow text-gray-800 dark:text-gray-100' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>Todos</button>
                        </div>
                    </div>
                </div>

                {/* --- LISTA DE ABONOS --- */}
                {isLoading ? (
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => <AbonoCardSkeleton key={i} />)}
                    </div>
                ) : abonosFiltrados.length > 0 ? (
                    <>
                        <div className="space-y-8">
                            {Object.entries(abonosAgrupados).map(([month, abonosDelMes]) => (
                                <div key={month}>
                                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 pb-2 mb-4 border-b border-gray-200 dark:border-gray-700">
                                        {month}
                                    </h3>
                                    <div className="space-y-4">
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
                    <p className="text-center text-gray-500 dark:text-gray-400 py-10">No se encontraron abonos con los filtros seleccionados.</p>
                )}
            </div>

            {/* --- SECCIÓN DE MODALES --- */}
            {abonoAEditar && (
                <EditarAbonoModal
                    isOpen={!!abonoAEditar}
                    onClose={() => setAbonoAEditar(null)}
                    onSave={handleGuardadoEdicion}
                    abonoAEditar={abonoAEditar}
                />
            )}

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
                />
            )}
        </AnimatedPage>
    );
};

export default ListarAbonos;