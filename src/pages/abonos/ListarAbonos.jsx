import React, { useMemo, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import AnimatedPage from '../../components/AnimatedPage';
import { useData } from '../../context/DataContext';
import AbonoCard from './AbonoCard';
import { deleteAbono } from '../../utils/storage';
import EditarAbonoModal from './EditarAbonoModal';
import ModalConfirmacion from '../../components/ModalConfirmacion';
import toast from 'react-hot-toast';
import Select from 'react-select';
import { Filter, Search } from 'lucide-react';
import UndoToast from '../../components/UndoToast';

const ListarAbonos = () => {
    const { isLoading, abonos, clientes, viviendas, recargarDatos } = useData();

    // Estados para los modales y la función de deshacer
    const [abonoAEditar, setAbonoAEditar] = useState(null);
    const [abonoAEliminar, setAbonoAEliminar] = useState(null);
    const [abonosOcultos, setAbonosOcultos] = useState([]);
    const deletionTimeouts = useRef({});

    // Estados para todos los filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [fechaInicioFiltro, setFechaInicioFiltro] = useState('');
    const [fechaFinFiltro, setFechaFinFiltro] = useState('');
    const [fuenteFiltro, setFuenteFiltro] = useState(null);
    const [statusFiltro, setStatusFiltro] = useState('activo');

    const abonosFiltrados = useMemo(() => {
        if (!abonos || !clientes || !viviendas) return [];

        // 1. Enriquecemos cada abono con la información que necesitamos
        let abonosProcesados = abonos.map(abono => {
            const cliente = clientes.find(c => c.id === abono.clienteId);
            const vivienda = viviendas.find(v => v.id === abono.viviendaId);
            const clienteInfo = cliente && vivienda
                ? `${vivienda.manzana}${vivienda.numeroCasa} - ${cliente.datosCliente.nombres.toUpperCase()} ${cliente.datosCliente.apellidos.toUpperCase()}`
                : 'Información no disponible';
            const nombreCompleto = cliente ? `${cliente.datosCliente.nombres} ${cliente.datosCliente.apellidos}` : '';
            const ubicacion = vivienda ? `${vivienda.manzana}${vivienda.numeroCasa}` : '';

            return { ...abono, clienteInfo, vivienda, clienteStatus: cliente?.status, nombreCompleto, ubicacion };
        });

        // 2. Aplicamos todos los filtros
        if (statusFiltro !== 'todos') {
            if (statusFiltro === 'activo') {
                abonosProcesados = abonosProcesados.filter(a => a.clienteStatus !== 'renunciado');
            } else { // 'renunciado'
                abonosProcesados = abonosProcesados.filter(a => a.clienteStatus === 'renunciado');
            }
        }

        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase().replace(/\s/g, '');
            abonosProcesados = abonosProcesados.filter(a =>
                a.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
                a.ubicacion.toLowerCase().replace(/\s/g, '').includes(lowerCaseSearchTerm)
            );
        }

        if (fechaInicioFiltro) {
            abonosProcesados = abonosProcesados.filter(a => new Date(a.fechaPago + 'T00:00:00') >= new Date(fechaInicioFiltro + 'T00:00:00'));
        }
        if (fechaFinFiltro) {
            abonosProcesados = abonosProcesados.filter(a => new Date(a.fechaPago + 'T00:00:00') <= new Date(fechaFinFiltro + 'T00:00:00'));
        }
        if (fuenteFiltro && fuenteFiltro.value) {
            abonosProcesados = abonosProcesados.filter(a => a.fuente === fuenteFiltro.value);
        }

        return abonosProcesados.sort((a, b) => new Date(b.fechaPago) - new Date(a.fechaPago));

    }, [abonos, clientes, viviendas, searchTerm, fechaInicioFiltro, fechaFinFiltro, fuenteFiltro, statusFiltro]);

    const fuenteOptions = useMemo(() => [
        { value: null, label: 'Todas las Fuentes' },
        { value: 'cuotaInicial', label: 'Cuota Inicial' },
        { value: 'credito', label: 'Crédito Hipotecario' },
        { value: 'subsidioVivienda', label: 'Subsidio Mi Casa Ya' },
        { value: 'subsidioCaja', label: 'Subsidio Caja Comp.' },
        { value: 'gastosNotariales', label: 'Gastos Notariales' }
    ], []);

    const handleGuardado = () => recargarDatos();

    const iniciarEliminacion = (abono) => {
        const id = abono.id;
        setAbonosOcultos(prev => [...prev, id]);
        toast.custom((t) => (<UndoToast t={t} message="Abono eliminado" onUndo={() => deshacerEliminacion(id)} />), { duration: 5000 });
        const timeoutId = setTimeout(() => { confirmarEliminarReal(abono); }, 5000);
        deletionTimeouts.current[id] = timeoutId;
        setAbonoAEliminar(null);
    };

    const deshacerEliminacion = (id) => {
        clearTimeout(deletionTimeouts.current[id]);
        delete deletionTimeouts.current[id];
        setAbonosOcultos(prev => prev.filter(aId => aId !== id));
        toast.success("Eliminación deshecha.");
    };

    const confirmarEliminarReal = async (abono) => {
        try {
            await deleteAbono(abono);
            recargarDatos();
        } catch (error) {
            toast.error("No se pudo eliminar el abono.");
            setAbonosOcultos(prev => prev.filter(aId => aId !== abono.id));
        }
    };

    const abonosVisibles = abonosFiltrados.filter(a => !abonosOcultos.includes(a.id));

    if (isLoading) { return <div className="text-center p-10 animate-pulse">Cargando historial de abonos...</div>; }

    return (
        <AnimatedPage>
            <div className="max-w-6xl mx-auto bg-white p-6 rounded-2xl shadow-2xl mt-10 relative">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                    <div className='text-center md:text-left'>
                        <h2 className="text-4xl font-extrabold text-green-600 uppercase font-poppins">Historial de Abonos</h2>
                        <p className="text-gray-500 mt-1">Consulta y filtra todos los pagos registrados en el sistema.</p>
                    </div>
                    <Link to="/abonos" className="mt-4 md:mt-0">
                        <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all">
                            + Gestionar Pagos
                        </button>
                    </Link>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border mb-8">
                    <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2"><Filter size={18} /> Opciones de Filtro</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1">
                            <label className="text-xs font-medium text-gray-600">Buscar por Cliente o Vivienda</label>
                            <div className="relative mt-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Ej: Cesar Arana o A1..."
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-600">Fuente de Pago</label>
                            <Select options={fuenteOptions} onChange={setFuenteFiltro} isClearable placeholder="Todas..." />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-gray-600">Desde</label>
                                <input type="date" className="w-full p-2 border rounded-lg" value={fechaInicioFiltro} onChange={e => setFechaInicioFiltro(e.target.value)} />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-600">Hasta</label>
                                <input type="date" className="w-full p-2 border rounded-lg" value={fechaFinFiltro} onChange={e => setFechaFinFiltro(e.target.value)} />
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <label className="text-xs font-medium text-gray-600">Estado del Proceso</label>
                        <div className="flex-shrink-0 bg-gray-200 p-1 rounded-lg mt-1 flex max-w-sm">
                            <button onClick={() => setStatusFiltro('activo')} className={`w-1/3 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${statusFiltro === 'activo' ? 'bg-white shadow text-green-600' : 'text-gray-600 hover:bg-gray-300'}`}>Activos</button>
                            <button onClick={() => setStatusFiltro('renunciado')} className={`w-1/3 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${statusFiltro === 'renunciado' ? 'bg-white shadow text-orange-600' : 'text-gray-600 hover:bg-gray-300'}`}>De Renuncias</button>
                            <button onClick={() => setStatusFiltro('todos')} className={`w-1/3 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${statusFiltro === 'todos' ? 'bg-white shadow text-gray-800' : 'text-gray-600 hover:bg-gray-300'}`}>Todos</button>
                        </div>
                    </div>
                </div>

                {abonosVisibles.length > 0 ? (
                    <div className="space-y-4">
                        {abonosVisibles.map(abono => (
                            <AbonoCard
                                key={abono.id}
                                abono={abono}
                                onEdit={setAbonoAEditar}
                                onDelete={setAbonoAEliminar}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 py-10">No se encontraron abonos con los filtros seleccionados.</p>
                )}
            </div>
            {abonoAEditar && (<EditarAbonoModal isOpen={!!abonoAEditar} onClose={() => setAbonoAEditar(null)} onSave={handleGuardado} abonoAEditar={abonoAEditar} viviendaDelAbono={viviendas.find(v => v.id === abonoAEditar.viviendaId)} />)}
            {abonoAEliminar && (<ModalConfirmacion isOpen={!!abonoAEliminar} onClose={() => setAbonoAEliminar(null)} onConfirm={() => iniciarEliminacion(abonoAEliminar)} titulo="¿Eliminar Abono?" mensaje="¿Estás seguro? Esta acción recalculará los saldos de la vivienda asociada y no se puede deshacer." />)}
        </AnimatedPage>
    );
};

export default ListarAbonos;