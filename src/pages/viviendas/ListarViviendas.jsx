import React, { useEffect, useState, useCallback, useMemo } from "react";
import AnimatedPage from "../../components/AnimatedPage";
import toast from 'react-hot-toast';
import { getViviendas, deleteVivienda } from "../../utils/storage";
import ViviendaCard from './ViviendaCard.jsx'; // <-- IMPORTAMOS LA NUEVA TARJETA
import ModalConfirmacion from '../../components/ModalConfirmacion.jsx';
import EditarVivienda from "./EditarVivienda.jsx";
import DescuentoModal from './DescuentoModal.jsx';

const ListarViviendas = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [viviendas, setViviendas] = useState([]);
    const [viviendaAEditar, setViviendaAEditar] = useState(null);
    const [viviendaAEliminar, setViviendaAEliminar] = useState(null);
    const [viviendaConDescuento, setViviendaConDescuento] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'manzana', direction: 'ascending' });
    const [statusFilter, setStatusFilter] = useState('todas');

    const cargarDatos = useCallback(async () => {
        setIsLoading(true);
        try {
            const dataViviendas = await getViviendas();
            setViviendas(dataViviendas);
        } catch (error) {
            toast.error("No se pudieron cargar las viviendas.");
            console.error(error);
        }
        finally { setIsLoading(false); }
    }, []);

    useEffect(() => { cargarDatos(); }, [cargarDatos]);

    const viviendasFiltradasYOrdenadas = useMemo(() => {
        let itemsProcesados = [...viviendas];

        if (statusFilter === 'disponibles') {
            itemsProcesados = itemsProcesados.filter(v => !v.clienteId);
        } else if (statusFilter === 'ocupadas') {
            itemsProcesados = itemsProcesados.filter(v => !!v.clienteId);
        }

        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            itemsProcesados = itemsProcesados.filter(v =>
                v.manzana.toLowerCase().includes(lowerCaseSearchTerm) ||
                v.numeroCasa.toString().includes(lowerCaseSearchTerm) ||
                v.matricula.toLowerCase().includes(lowerCaseSearchTerm) ||
                (v.clienteNombre || '').toLowerCase().includes(lowerCaseSearchTerm)
            );
        }

        if (sortConfig.key) {
            itemsProcesados.sort((a, b) => {
                const key = sortConfig.key;
                const direction = sortConfig.direction === 'ascending' ? 1 : -1;

                let valA = a[key];
                let valB = b[key];

                if (key === 'cliente') {
                    valA = a.clienteNombre || 'ZZZ';
                    valB = b.clienteNombre || 'ZZZ';
                }

                if (valA == null) return 1;
                if (valB == null) return -1;

                if (typeof valA === 'string') valA = valA.toLowerCase();
                if (typeof valB === 'string') valB = valB.toLowerCase();

                if (valA < valB) return -1 * direction;
                if (valA > valB) return 1 * direction;

                if (key === 'manzana') {
                    if (a.numeroCasa < b.numeroCasa) return -1 * direction;
                    if (a.numeroCasa > b.numeroCasa) return 1 * direction;
                }

                return 0;
            });
        }
        return itemsProcesados;
    }, [viviendas, searchTerm, sortConfig, statusFilter]);

    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const handleGuardado = useCallback(() => {
        cargarDatos();
        setViviendaAEditar(null);
        setViviendaConDescuento(null);
    }, [cargarDatos]);

    const confirmarEliminar = async () => {
        if (!viviendaAEliminar) return;
        try {
            await deleteVivienda(viviendaAEliminar.id);
            toast.success("Vivienda eliminada correctamente.");
            cargarDatos();
        } catch (error) {
            toast.error("No se pudo eliminar la vivienda.");
            console.error(error);
        }
        finally { setViviendaAEliminar(null); }
    };

    if (isLoading) return <div className="text-center p-10 animate-pulse">Cargando viviendas...</div>;

    return (
        <AnimatedPage>
            <div className="bg-white p-6 rounded-2xl shadow-2xl">
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-extrabold text-[#c62828] uppercase font-poppins inline-flex items-center gap-4">
                        <span role="img" aria-label="viviendas">🏠</span> Viviendas Registradas
                    </h2>
                    <div className="w-24 h-1 bg-[#c62828] mx-auto rounded-full mt-2"></div>
                </div>
                <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                    <div className="flex-shrink-0 bg-gray-100 p-1 rounded-lg">
                        <button onClick={() => setStatusFilter('todas')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${statusFilter === 'todas' ? 'bg-white shadow text-gray-800' : 'text-gray-600 hover:bg-gray-200'}`}>Todas</button>
                        <button onClick={() => setStatusFilter('disponibles')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${statusFilter === 'disponibles' ? 'bg-white shadow text-green-600' : 'text-gray-600 hover:bg-gray-200'}`}>Disponibles</button>
                        <button onClick={() => setStatusFilter('ocupadas')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${statusFilter === 'ocupadas' ? 'bg-white shadow text-red-600' : 'text-gray-600 hover:bg-gray-200'}`}>Ocupadas</button>
                    </div>
                    <div className="w-full md:w-1/3">
                        <input type="text" placeholder="Buscar por Mz, Casa o Cliente..." className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                </div>

                {/* --- AQUÍ REEMPLAZAMOS LA TABLA POR LA CUADRÍCULA DE TARJETAS --- */}
                {viviendasFiltradasYOrdenadas.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {viviendasFiltradasYOrdenadas.map(vivienda => (
                            <ViviendaCard
                                key={vivienda.id}
                                vivienda={vivienda}
                                onEdit={setViviendaAEditar}
                                onDelete={setViviendaAEliminar}
                                onApplyDiscount={setViviendaConDescuento}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <p className="text-gray-500">No se encontraron viviendas con los filtros actuales.</p>
                    </div>
                )}
            </div>

            {/* Los modales siguen funcionando igual */}
            {viviendaAEliminar && (<ModalConfirmacion isOpen={!!viviendaAEliminar} onClose={() => setViviendaAEliminar(null)} onConfirm={confirmarEliminar} titulo="¿Eliminar Vivienda?" mensaje="Esta acción es permanente y desvinculará al cliente asignado. ¿Estás seguro?" />)}
            {viviendaAEditar && (<EditarVivienda isOpen={!!viviendaAEditar} onClose={() => setViviendaAEditar(null)} onSave={handleGuardado} vivienda={viviendaAEditar} />)}
            {viviendaConDescuento && (<DescuentoModal isOpen={!!viviendaConDescuento} onClose={() => setViviendaConDescuento(null)} onSave={handleGuardado} vivienda={viviendaConDescuento} />)}
        </AnimatedPage>
    );
};

export default ListarViviendas;