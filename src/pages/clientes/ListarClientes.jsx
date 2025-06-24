import React, { useEffect, useState, useCallback, useMemo } from "react";
import AnimatedPage from "../../components/AnimatedPage";
import toast from 'react-hot-toast';
import Select from 'react-select'; // <-- 1. Importamos el componente Select
import { getClientes, getViviendas, deleteCliente } from "../../utils/storage";
import ClientIcon from '../../assets/Client.png';

// Nuestros componentes modulares
import TablaClientes from './TablaClientes.jsx';
import ModalConfirmacion from '../../components/ModalConfirmacion.jsx';
import EditarCliente from "./EditarCliente";

const ListarClientes = () => {
    const [clientes, setClientes] = useState([]);
    const [clienteAEditar, setClienteAEditar] = useState(null);
    const [clienteAEliminar, setClienteAEliminar] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'nombre', direction: 'ascending' });

    // --- NUEVO: Estado para el filtro de Manzana ---
    const [manzanaFilter, setManzanaFilter] = useState(null); // Usamos null para el valor inicial

    const cargarDatosClientes = useCallback(() => {
        const dataClientes = getClientes();
        const dataViviendas = getViviendas();
        const clientesConVivienda = dataClientes.map((cliente) => {
            const viviendaAsignada = dataViviendas.find((v) => v.clienteId === cliente.id);
            return { ...cliente, vivienda: viviendaAsignada || null };
        });
        setClientes(clientesConVivienda);
    }, []);

    useEffect(() => {
        cargarDatosClientes();
    }, [cargarDatosClientes]);

    // --- NUEVO: Lógica para obtener las opciones del filtro de Manzana ---
    const manzanaOptions = useMemo(() => {
        const manzanasUnicas = [...new Set(getViviendas().map(v => v.manzana))];
        const opciones = manzanasUnicas.sort().map(m => ({ value: m, label: `Manzana ${m}` }));
        // Añadimos la opción para ver todas
        return [{ value: null, label: 'Todas las Manzanas' }, ...opciones];
    }, []);

    // --- LÓGICA DE FILTRADO ACTUALIZADA ---
    const clientesFiltradosYOrdenados = useMemo(() => {
        let itemsProcesados = [...clientes];

        // 1. Filtramos por Manzana
        if (manzanaFilter && manzanaFilter.value) {
            itemsProcesados = itemsProcesados.filter(c => c.vivienda?.manzana === manzanaFilter.value);
        }

        // 2. Filtramos por término de búsqueda
        if (searchTerm) {
            itemsProcesados = itemsProcesados.filter(c =>
                c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.cedula.includes(searchTerm)
            );
        }

        // 3. Ordenamos el resultado final
        if (sortConfig.key) {
            // ... la lógica de sort no cambia ...
        }
        return itemsProcesados;
    }, [clientes, searchTerm, sortConfig, manzanaFilter]);

    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const handleGuardado = useCallback(() => {
        cargarDatosClientes();
    }, [cargarDatosClientes]);

    const confirmarEliminar = () => {
        if (!clienteAEliminar) return;
        deleteCliente(clienteAEliminar.id);
        toast.success("Cliente eliminado correctamente.");
        cargarDatosClientes();
        setClienteAEliminar(null);
    };

    return (
        <AnimatedPage>
            <div className="bg-white p-6 rounded-2xl shadow-2xl relative">
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-extrabold text-[#1976d2] uppercase font-poppins inline-flex items-center gap-4">
                        <img src={ClientIcon} alt="Icono de Clientes" className="h-12" /> {/* Reemplaza con la ruta correcta a tu icono */}
                        <span>Clientes Registrados</span>
                    </h2>
                    <div className="w-24 h-1 bg-[#1976d2] mx-auto rounded-full mt-2"></div>
                </div>

                {/* --- NUEVO: Panel de Control con Filtros y Búsqueda --- */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                    {/* Filtro por Manzana */}
                    <div className="w-full md:w-1/4">
                        <Select
                            options={manzanaOptions}
                            onChange={setManzanaFilter}
                            value={manzanaFilter}
                            placeholder="Filtrar por Manzana..."
                            isClearable={false} // Hacemos que no se pueda borrar para siempre tener una opción
                        />
                    </div>

                    {/* Barra de Búsqueda */}
                    <div className="w-full md:w-1/3">
                        <input
                            type="text"
                            placeholder="Buscar por nombre o cédula..."
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {clientes.length === 0 ? (
                    <p className="text-center text-gray-600">No hay clientes registrados.</p>
                ) : (
                    <TablaClientes
                        clientes={clientesFiltradosYOrdenados}
                        onEdit={setClienteAEditar}
                        onDelete={setClienteAEliminar}
                        onSort={handleSort}
                        sortConfig={sortConfig}
                    />
                )}
            </div>
            {clienteAEliminar && (
                <ModalConfirmacion isOpen={!!clienteAEliminar} onClose={() => setClienteAEliminar(null)} onConfirm={confirmarEliminar} titulo="¿Eliminar Cliente?" mensaje="Esta acción es permanente y desvinculará la vivienda asignada." />
            )}
            {clienteAEditar && (
                <EditarCliente isOpen={!!clienteAEditar} onClose={() => setClienteAEditar(null)} onGuardar={handleGuardado} clienteAEditar={clienteAEditar} />
            )}
        </AnimatedPage>
    );
};
export default ListarClientes;