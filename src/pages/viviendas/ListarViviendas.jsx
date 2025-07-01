import React, { useState, useMemo, useCallback } from "react";
import toast from 'react-hot-toast';
import { useData } from "../../context/DataContext";
import { deleteVivienda } from "../../utils/storage";
import ResourcePageLayout from "../../layout/ResourcePageLayout";
import ViviendaCard from './ViviendaCard.jsx';
import ModalConfirmacion from '../../components/ModalConfirmacion.jsx';
import EditarVivienda from "./EditarVivienda.jsx";
import DescuentoModal from './DescuentoModal.jsx';

const ListarViviendas = () => {
    const { isLoading, viviendas, recargarDatos } = useData();
    const [viviendaAEditar, setViviendaAEditar] = useState(null);
    const [viviendaAEliminar, setViviendaAEliminar] = useState(null);
    const [viviendaConDescuento, setViviendaConDescuento] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('todas');

    const handleGuardado = useCallback(() => {
        recargarDatos();
        setViviendaAEditar(null);
        setViviendaConDescuento(null);
    }, [recargarDatos]);

    const viviendasFiltradas = useMemo(() => {
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
        itemsProcesados.sort((a, b) => {
            if (a.manzana < b.manzana) return -1;
            if (a.manzana > b.manzana) return 1;
            if (a.numeroCasa < b.numeroCasa) return -1;
            if (a.numeroCasa > b.numeroCasa) return 1;
            return 0;
        });
        return itemsProcesados;
    }, [viviendas, searchTerm, statusFilter]);

    const confirmarEliminar = async () => {
        if (!viviendaAEliminar) return;
        try {
            await deleteVivienda(viviendaAEliminar.id);
            toast.success("Vivienda eliminada correctamente.");
            recargarDatos();
        } catch (error) {
            if (error.message === "CLIENTE_ASIGNADO") {
                toast.error("No se puede eliminar: la vivienda ya tiene un cliente asignado.");
            } else {
                toast.error("No se pudo eliminar la vivienda.");
                console.error("Error al eliminar vivienda:", error);
            }
        } finally {
            setViviendaAEliminar(null);
        }
    };

    if (isLoading) return <div className="text-center p-10 animate-pulse">Cargando viviendas...</div>;

    return (
        <ResourcePageLayout
            title="Viviendas Registradas"
            icon={<span role="img" aria-label="viviendas">🏠</span>}
            color="#c62828"
            filterControls={
                <>
                    <div className="flex-shrink-0 bg-gray-100 p-1 rounded-lg">
                        <button onClick={() => setStatusFilter('todas')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${statusFilter === 'todas' ? 'bg-white shadow text-gray-800' : 'text-gray-600 hover:bg-gray-200'}`}>Todas</button>
                        <button onClick={() => setStatusFilter('disponibles')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${statusFilter === 'disponibles' ? 'bg-white shadow text-green-600' : 'text-gray-600 hover:bg-gray-200'}`}>Disponibles</button>
                        <button onClick={() => setStatusFilter('ocupadas')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${statusFilter === 'ocupadas' ? 'bg-white shadow text-red-600' : 'text-gray-600 hover:bg-gray-200'}`}>Ocupadas</button>
                    </div>
                    <div className="w-full md:w-1/3">
                        <input type="text" placeholder="Buscar por Mz, Casa o Cliente..." className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                </>
            }
        >
            {viviendasFiltradas.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {viviendasFiltradas.map(vivienda => (
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

            {viviendaAEliminar && (<ModalConfirmacion isOpen={!!viviendaAEliminar} onClose={() => setViviendaAEliminar(null)} onConfirm={confirmarEliminar} titulo="¿Eliminar Vivienda?" mensaje="Esta acción es permanente. Solo se pueden eliminar viviendas sin cliente asignado." />)}
            {viviendaAEditar && (<EditarVivienda isOpen={!!viviendaAEditar} onClose={() => setViviendaAEditar(null)} onSave={handleGuardado} vivienda={viviendaAEditar} todasLasViviendas={viviendas} />)}
            {viviendaConDescuento && (<DescuentoModal isOpen={!!viviendaConDescuento} onClose={() => setViviendaConDescuento(null)} onSave={handleGuardado} vivienda={viviendaConDescuento} />)}
        </ResourcePageLayout>
    );
};

export default ListarViviendas;