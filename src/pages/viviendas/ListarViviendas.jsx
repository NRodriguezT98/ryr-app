import React, { useEffect, useState, useCallback, useMemo } from "react";
import AnimatedPage from "../../components/AnimatedPage";
import toast from 'react-hot-toast';
import { getViviendas, getClientes, getAbonos, deleteVivienda } from "../../utils/storage";
import TablaViviendas from './TablaViviendas.jsx';
import ModalConfirmacion from '../../components/ModalConfirmacion.jsx';
import EditarVivienda from "./EditarVivienda.jsx";
import DescuentoModal from './DescuentoModal.jsx';

const ListarViviendas = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [viviendas, setViviendas] = useState([]);
    const [viviendaAEditar, setViviendaAEditar] = useState(null);
    const [viviendaAEliminar, setViviendaAEliminar] = useState(null);
    // --- ESTADO FALTANTE AÑADIDO AQUÍ ---
    const [viviendaConDescuento, setViviendaConDescuento] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'manzana', direction: 'ascending' });
    const [statusFilter, setStatusFilter] = useState('todas');

    const cargarDatos = useCallback(async () => {
        setIsLoading(true);
        try {
            const [dataViviendas, dataClientes, dataAbonos] = await Promise.all([getViviendas(), getClientes(), getAbonos()]);
            const viviendasConDatosCompletos = dataViviendas.map(vivienda => {
                const clienteAsignado = dataClientes.find(c => c.id === vivienda.clienteId);
                const abonosDeLaVivienda = dataAbonos.filter(a => a.viviendaId === vivienda.id);
                const totalAbonado = abonosDeLaVivienda.reduce((sum, abono) => sum + (abono.monto || 0), 0);
                const valorFinal = (vivienda.valorTotal || 0) - (vivienda.descuentoMonto || 0);
                return { ...vivienda, cliente: clienteAsignado || null, totalAbonado, valorFinal, saldoPendiente: valorFinal - totalAbonado };
            });
            setViviendas(viviendasConDatosCompletos);
        } catch (error) { toast.error("No se pudieron cargar los datos."); }
        finally { setIsLoading(false); }
    }, []);

    useEffect(() => { cargarDatos(); }, [cargarDatos]);

    const viviendasFiltradasYOrdenadas = useMemo(() => {
        let itemsProcesados = [...viviendas];
        if (statusFilter === 'disponibles') { itemsProcesados = itemsProcesados.filter(v => v.cliente === null); }
        else if (statusFilter === 'ocupadas') { itemsProcesados = itemsProcesados.filter(v => v.cliente !== null); }
        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            itemsProcesados = itemsProcesados.filter(v => v.manzana.toLowerCase().includes(lowerCaseSearchTerm) || v.numeroCasa.toString().includes(lowerCaseSearchTerm) || v.matricula.includes(lowerCaseSearchTerm));
        }
        if (sortConfig.key) {
            itemsProcesados.sort((a, b) => {
                const key = sortConfig.key;
                const direction = sortConfig.direction === 'ascending' ? 1 : -1;
                let valA = a[key];
                let valB = b[key];
                if (key === 'cliente') { valA = a.cliente?.datosCliente?.nombres || 'ZZZ'; valB = b.cliente?.datosCliente?.nombres || 'ZZZ'; }
                if (typeof valA === 'string') valA = valA.toLowerCase();
                if (typeof valB === 'string') valB = valB.toLowerCase();
                if (valA < valB) return -1 * direction;
                if (valA > valB) return 1 * direction;
                if (a.numeroCasa < b.numeroCasa) return -1;
                if (a.numeroCasa > b.numeroCasa) return 1;
                return 0;
            });
        }
        return itemsProcesados;
    }, [viviendas, searchTerm, sortConfig, statusFilter]);

    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') { direction = 'descending'; }
        setSortConfig({ key, direction });
    };

    const handleGuardado = useCallback(() => { cargarDatos(); }, [cargarDatos]);

    const confirmarEliminar = async () => {
        if (!viviendaAEliminar) return;
        try {
            await deleteVivienda(viviendaAEliminar.id);
            toast.success("Vivienda eliminada correctamente.");
            cargarDatos();
        } catch (error) { toast.error("No se pudo eliminar la vivienda."); }
        finally { setViviendaAEliminar(null); }
    };

    if (isLoading) return <div className="text-center p-10 animate-pulse">Cargando viviendas...</div>;

    return (
        <AnimatedPage>
            <div className="bg-white p-6 rounded-2xl shadow-2xl relative">
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-extrabold text-[#c62828] uppercase font-poppins ...">
                        <span role="img" aria-label="viviendas">🏠</span> Viviendas Registradas
                    </h2>
                    <div className="w-24 h-1 bg-[#c62828] mx-auto rounded-full mt-2"></div>
                </div>
                <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                    <div className="flex-shrink-0 bg-gray-100 p-1 rounded-lg">
                        <button onClick={() => setStatusFilter('todas')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${statusFilter === 'todas' ? 'bg-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}>Todas</button>
                        <button onClick={() => setStatusFilter('disponibles')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${statusFilter === 'disponibles' ? 'bg-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}>Disponibles</button>
                        <button onClick={() => setStatusFilter('ocupadas')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${statusFilter === 'ocupadas' ? 'bg-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}>Ocupadas</button>
                    </div>
                    <div className="w-full md:w-1/3">
                        <input type="text" placeholder="Buscar por manzana, casa o matrícula..." className="w-full p-3 border border-gray-300 rounded-lg ..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                </div>
                <TablaViviendas
                    viviendas={viviendasFiltradasYOrdenadas}
                    onEdit={setViviendaAEditar}
                    onDelete={setViviendaAEliminar}
                    onApplyDiscount={setViviendaConDescuento} // 3. Pasamos la nueva función
                    onSort={handleSort}
                    sortConfig={sortConfig}
                />
            </div>
            {viviendaAEliminar && (<ModalConfirmacion isOpen={!!viviendaAEliminar} onClose={() => setViviendaAEliminar(null)} onConfirm={confirmarEliminar} titulo="¿Eliminar Vivienda?" mensaje="Esta acción es permanente..." />)}
            {viviendaAEditar && (<EditarVivienda isOpen={!!viviendaAEditar} onClose={() => setViviendaAEditar(null)} onGuardar={handleGuardado} vivienda={viviendaAEditar} />)}
            {viviendaConDescuento && (
                <DescuentoModal
                    isOpen={!!viviendaConDescuento}
                    onClose={() => setViviendaConDescuento(null)}
                    onSave={handleGuardado}
                    vivienda={viviendaConDescuento}
                />
            )}
        </AnimatedPage>
    );
};

export default ListarViviendas;