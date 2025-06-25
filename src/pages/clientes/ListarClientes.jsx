import React, { useEffect, useState, useCallback, useMemo } from "react";
import AnimatedPage from "../../components/AnimatedPage";
import toast from 'react-hot-toast';
import { getClientes, getViviendas, deleteCliente } from "../../utils/storage";
import TablaClientes from './TablaClientes.jsx';
import ModalConfirmacion from '../../components/ModalConfirmacion.jsx';
import EditarCliente from "./EditarCliente";
import Select from 'react-select';

const ListarClientes = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [clientes, setClientes] = useState([]);
    const [viviendas, setViviendas] = useState([]);
    const [clienteAEditar, setClienteAEditar] = useState(null);
    const [clienteAEliminar, setClienteAEliminar] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'nombre', direction: 'ascending' });
    const [manzanaFilter, setManzanaFilter] = useState(null);

    const cargarDatos = useCallback(async () => {
        setIsLoading(true);
        try {
            const [dataClientes, dataViviendas] = await Promise.all([getClientes(), getViviendas()]);
            const clientesConVivienda = dataClientes.map((cliente) => {
                const viviendaAsignada = dataViviendas.find((v) => v.clienteId === cliente.id);
                return { ...cliente, vivienda: viviendaAsignada || null };
            });
            setClientes(clientesConVivienda);
            setViviendas(dataViviendas);
        } catch (error) {
            console.error("Error al cargar datos:", error);
            toast.error("No se pudieron cargar los datos.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    const manzanaOptions = useMemo(() => {
        const manzanasUnicas = [...new Set(viviendas.map(v => v.manzana))];
        const opciones = manzanasUnicas.sort().map(m => ({ value: m, label: `Manzana ${m}` }));
        return [{ value: null, label: 'Todas las Manzanas' }, ...opciones];
    }, [viviendas]);

    const clientesFiltradosYOrdenados = useMemo(() => {
        let itemsProcesados = [...clientes];
        if (manzanaFilter && manzanaFilter.value) { itemsProcesados = itemsProcesados.filter(c => c.vivienda?.manzana === manzanaFilter.value); }
        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            itemsProcesados = itemsProcesados.filter(c => c.nombre.toLowerCase().includes(lowerCaseSearchTerm) || c.cedula.includes(lowerCaseSearchTerm));
        }
        if (sortConfig.key) {
            itemsProcesados.sort((a, b) => {
                const key = sortConfig.key;
                const direction = sortConfig.direction === 'ascending' ? 1 : -1;
                let valA = a[key];
                let valB = b[key];
                if (key === 'vivienda') { valA = a.vivienda ? `${a.vivienda.manzana}-${a.vivienda.numeroCasa}` : 'ZZZ'; valB = b.vivienda ? `${b.vivienda.manzana}-${b.vivienda.numeroCasa}` : 'ZZZ'; }
                if (typeof valA === 'string') valA = valA.toLowerCase();
                if (typeof valB === 'string') valB = valB.toLowerCase();
                if (valA < valB) return -1 * direction;
                if (valA > valB) return 1 * direction;
                return 0;
            });
        }
        return itemsProcesados;
    }, [clientes, searchTerm, sortConfig, manzanaFilter]);

    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') { direction = 'descending'; }
        setSortConfig({ key, direction });
    };

    const handleGuardado = useCallback(() => { cargarDatos(); }, [cargarDatos]);

    const confirmarEliminar = async () => {
        if (!clienteAEliminar) return;
        try {
            await deleteCliente(clienteAEliminar.id);
            toast.success("Cliente eliminado correctamente.");
            cargarDatos();
        } catch (error) { toast.error("No se pudo eliminar el cliente."); }
        finally { setClienteAEliminar(null); }
    };

    if (isLoading) { return <div className="text-center p-10 animate-pulse">Cargando clientes...</div>; }

    return (
        <AnimatedPage>
            <div className="bg-white p-6 rounded-2xl shadow-2xl relative">
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-extrabold text-[#1976d2] uppercase font-poppins inline-flex items-center gap-4">
                        <img src="/src/assets/Client.png" alt="Icono de Clientes" className="h-12" />
                        <span>Clientes Registrados</span>
                    </h2>
                    <div className="w-24 h-1 bg-[#1976d2] mx-auto rounded-full mt-2"></div>
                </div>
                <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                    <div className="w-full md:w-auto md:min-w-[200px]">
                        <Select options={manzanaOptions} onChange={setManzanaFilter} value={manzanaFilter} placeholder="Filtrar por Manzana..." isClearable={false} />
                    </div>
                    <div className="w-full md:w-1/3">
                        <input type="text" placeholder="Buscar por nombre o cédula..." className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                </div>
                <TablaClientes clientes={clientesFiltradosYOrdenados} onEdit={setClienteAEditar} onDelete={setClienteAEliminar} onSort={handleSort} sortConfig={sortConfig} />
            </div>
            {clienteAEliminar && (<ModalConfirmacion isOpen={!!clienteAEliminar} onClose={() => setClienteAEliminar(null)} onConfirm={confirmarEliminar} titulo="¿Eliminar Cliente?" mensaje="Esta acción es permanente y desvinculará la vivienda asignada." />)}
            {clienteAEditar && (<EditarCliente isOpen={!!clienteAEditar} onClose={() => setClienteAEditar(null)} onGuardar={handleGuardado} clienteAEditar={clienteAEditar} />)}
        </AnimatedPage>
    );
};

export default ListarClientes;