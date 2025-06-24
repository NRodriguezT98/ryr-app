import React, { useEffect, useState, useCallback, useMemo } from "react";
import AnimatedPage from "../../components/AnimatedPage";
import toast from 'react-hot-toast';
import { getViviendas, getClientes, deleteVivienda, updateVivienda } from "../../utils/storage";
import HomeIcon from '../../assets/Home.png';

// Nuestros componentes modulares
import TablaViviendas from './TablaViviendas.jsx';
import ModalConfirmacion from '../../components/ModalConfirmacion.jsx';
import EditarVivienda from "./EditarVivienda.jsx";

const ListarViviendas = () => {
    const [viviendas, setViviendas] = useState([]);
    const [viviendaAEditar, setViviendaAEditar] = useState(null);
    const [viviendaAEliminar, setViviendaAEliminar] = useState(null);

    // --- NUEVO: Estados para búsqueda y ordenamiento ---
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'manzana', direction: 'ascending' });
    const [statusFilter, setStatusFilter] = useState('todas');

    const cargarDatos = useCallback(() => {
        const dataViviendas = getViviendas();
        const dataClientes = getClientes();
        const viviendasConCliente = dataViviendas.map(vivienda => {
            const clienteAsignado = dataClientes.find(c => c.id === vivienda.clienteId);
            return { ...vivienda, cliente: clienteAsignado || null };
        });
        setViviendas(viviendasConCliente);
    }, []);

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    // --- NUEVO: Lógica principal de filtrado y ordenamiento ---
    const viviendasFiltradasYOrdenadas = useMemo(() => {
        let itemsProcesados = [...viviendas];

        if (statusFilter === 'disponibles') {
            itemsProcesados = itemsProcesados.filter(v => v.cliente === null);
        } else if (statusFilter === 'ocupadas') {
            itemsProcesados = itemsProcesados.filter(v => v.cliente !== null);
        }

        if (searchTerm) {
            itemsProcesados = itemsProcesados.filter(v =>
                v.manzana.toLowerCase().includes(searchTerm.toLowerCase()) ||
                v.numeroCasa.toString().includes(searchTerm) ||
                v.matricula.includes(searchTerm)
            );
        }

        if (sortConfig.key) {
            itemsProcesados.sort((a, b) => {
                let valA = a[sortConfig.key];
                let valB = b[sortConfig.key];

                // Lógica especial para ordenar por cliente asignado
                if (sortConfig.key === 'cliente') {
                    valA = a.cliente?.nombre || 'ZZZ'; // Clientes sin asignar van al final
                    valB = b.cliente?.nombre || 'ZZZ';
                }

                if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
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
    }, [cargarDatos]);

    const confirmarEliminar = () => {
        if (!viviendaAEliminar) return;
        deleteVivienda(viviendaAEliminar.id);
        toast.success("Vivienda eliminada correctamente.");
        cargarDatos();
        setViviendaAEliminar(null);
    };

    return (
        <AnimatedPage>
            <div className="bg-white p-6 rounded-2xl shadow-2xl relative">
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-extrabold text-[#c62828] uppercase inline-flex items-center justify-center gap-4 font-poppins">
                        <img src={HomeIcon} alt="Icono de Viviendas" className="h-16" /> {/* <-- Usamos el icono importado */}
                        <span>Viviendas Registradas</span>
                    </h2>
                    <div className="w-24 h-1 bg-[#c62828] mx-auto rounded-full mt-2"></div>
                </div>

                {/* --- NUEVO: Panel de Control con Filtros y Búsqueda --- */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                    {/* Botones de Filtro de Estatus */}
                    <div className="flex-shrink-0 bg-gray-100 p-1 rounded-lg">
                        <button onClick={() => setStatusFilter('todas')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${statusFilter === 'todas' ? 'bg-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}>
                            Todas
                        </button>
                        <button onClick={() => setStatusFilter('disponibles')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${statusFilter === 'disponibles' ? 'bg-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}>
                            Disponibles
                        </button>
                        <button onClick={() => setStatusFilter('ocupadas')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${statusFilter === 'ocupadas' ? 'bg-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}>
                            Asignadas
                        </button>
                    </div>

                    {/* Barra de Búsqueda */}
                    <div className="w-full md:w-1/3">
                        <input
                            type="text"
                            placeholder="Buscar por manzana, casa o matrícula..."
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {viviendas.length === 0 ? (
                    <p className="text-center text-gray-600">No hay viviendas registradas.</p>
                ) : (
                    <TablaViviendas
                        viviendas={viviendasFiltradasYOrdenadas}
                        onEdit={setViviendaAEditar}
                        onDelete={setViviendaAEliminar}
                        onSort={handleSort}
                        sortConfig={sortConfig}
                    />
                )}
            </div>

            {viviendaAEliminar && (
                <ModalConfirmacion isOpen={!!viviendaAEliminar} onClose={() => setViviendaAEliminar(null)} onConfirm={confirmarEliminar} titulo="¿Eliminar Vivienda?" mensaje="Esta acción es permanente y desvinculará a cualquier cliente asignado." />
            )}
            {viviendaAEditar && (
                <EditarVivienda isOpen={!!viviendaAEditar} onClose={() => setViviendaAEditar(null)} onGuardar={handleGuardado} vivienda={viviendaAEditar} />
            )}
        </AnimatedPage>
    );
};

export default ListarViviendas; 