import React, { useMemo, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import AnimatedPage from '../../components/AnimatedPage';
import { useData } from '../../context/DataContext';
import { useGestionarAbonos } from '../../hooks/abonos/useGestionarAbonos';
import { useAbonosFilters } from '../../hooks/abonos/useAbonosFilters';
import AbonoCard from './AbonoCard';
import EditarAbonoModal from './EditarAbonoModal';
import ModalConfirmacion from '../../components/ModalConfirmacion';
import ModalAnularAbono from './components/ModalAnularAbono';
import toast from 'react-hot-toast';
import Select, { components } from 'react-select';
import { Filter, Undo2 } from 'lucide-react';
import AbonoCardSkeleton from './AbonoCardSkeleton';
import Pagination from '../../components/Pagination';
import { usePermissions } from '../../hooks/auth/usePermissions';

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
    const {
        modals,
        handlers,
        isLoading,
        abonos,
        clientes,
        viviendas,
        renuncias
    } = useGestionarAbonos();
    const { abonoAEditar, setAbonoAEditar, abonoAAnular, setAbonoAAnular, abonoARevertir, setAbonoARevertir } = modals;
    const { handleGuardado, iniciarAnulacion, confirmarAnulacion, iniciarReversion, confirmarReversion } = handlers;
    const {
        abonosFiltrados,
        clienteFiltro, setClienteFiltro,
        fechaInicioFiltro, setFechaInicioFiltro,
        fechaFinFiltro, setFechaFinFiltro,
        fuenteFiltro, setFuenteFiltro,
        statusFiltro, setStatusFiltro,
        pagination
    } = useAbonosFilters(abonos, clientes, viviendas, renuncias);

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
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-700 mb-8">
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
                            <button
                                onClick={() => setStatusFiltro('activo')}
                                className={`w-1/4 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${statusFiltro === 'activo' ? 'bg-white dark:bg-gray-900 shadow text-green-600' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                            >
                                Activos
                            </button>
                            <button
                                onClick={() => setStatusFiltro('anulado')}
                                className={`w-1/4 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${statusFiltro === 'anulado' ? 'bg-white dark:bg-gray-900 shadow text-red-600' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                            >
                                Anulados
                            </button>
                            <button
                                onClick={() => setStatusFiltro('renunciado')}
                                className={`w-1/4 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${statusFiltro === 'renunciado' ? 'bg-white dark:bg-gray-900 shadow text-orange-600' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                            >
                                De Renuncias
                            </button>
                            <button
                                onClick={() => setStatusFiltro('todos')}
                                className={`w-1/4 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${statusFiltro === 'todos' ? 'bg-white dark:bg-gray-900 shadow text-gray-800 dark:text-gray-100' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                            >
                                Todos
                            </button>
                        </div>
                    </div>
                </div>
                {isLoading ? (
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => <AbonoCardSkeleton key={i} />)}
                    </div>
                ) : abonosFiltrados.length > 0 ? (
                    <>
                        <div className="space-y-4">
                            {abonosFiltrados.map(abono => (
                                <AbonoCard
                                    key={abono.id}
                                    abono={abono}
                                    onEdit={() => setAbonoAEditar(abono)}
                                    onAnular={iniciarAnulacion}
                                    onRevertir={iniciarReversion}
                                />
                            ))}
                        </div>
                        {/* --- INICIO DE LA MODIFICACIÓN --- */}
                        {/* 3. Renderizamos el componente de paginación */}
                        <Pagination
                            currentPage={pagination.currentPage}
                            totalPages={pagination.totalPages}
                            onPageChange={pagination.onPageChange}
                        />
                        {/* --- FIN DE LA MODIFICACIÓN --- */}
                    </>
                ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-10">No se encontraron abonos con los filtros seleccionados.</p>
                )}
            </div>
            {abonoAEditar && (
                <EditarAbonoModal
                    isOpen={!!abonoAEditar}
                    onClose={() => setAbonoAEditar(null)}
                    onSave={handleGuardado}
                    abonoAEditar={abonoAEditar}
                />
            )}
            {/* ✨ 2. Reemplaza el modal genérico por el nuevo */}
            {abonoAAnular && (
                <ModalAnularAbono
                    isOpen={!!abonoAAnular}
                    onClose={() => setAbonoAAnular(null)}
                    onConfirm={confirmarAnulacion} // confirmarAnulacion ya está preparada para recibir el motivo
                    abono={abonoAAnular}
                />
            )}
            {abonoARevertir && (
                <ModalConfirmacion
                    isOpen={!!abonoARevertir}
                    onClose={() => setAbonoARevertir(null)}
                    onConfirm={confirmarReversion}
                    titulo="¿Revertir Anulación?"
                    mensaje="Esto reactivará el abono y volverá a afectar los saldos de la vivienda. ¿Deseas continuar?"
                />
            )}
        </AnimatedPage >
    );
};

export default ListarAbonos;