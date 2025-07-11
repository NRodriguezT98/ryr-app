import React, { useState, useCallback } from "react";
import toast from 'react-hot-toast';
import { useLocation } from 'react-router-dom'; // <-- 1. Importar useLocation
import { useData } from "../../context/DataContext";
import { useViviendaFilters } from "../../hooks/useViviendaFilters";
import { useUndoableDelete } from "../../hooks/useUndoableDelete.jsx";
import { deleteVivienda } from "../../utils/storage";
import ResourcePageLayout from "../../layout/ResourcePageLayout";
import ViviendaCard from './ViviendaCard.jsx';
import ModalConfirmacion from '../../components/ModalConfirmacion.jsx';
import EditarVivienda from "./EditarVivienda.jsx";
import DescuentoModal from './DescuentoModal.jsx';
import ViviendaCardSkeleton from "./ViviendaCardSkeleton.jsx";

const ListarViviendas = () => {
    const location = useLocation(); // <-- 2. Obtener la ubicación
    const { isLoading, viviendas, recargarDatos } = useData();

    // 3. Establecer el estado inicial del filtro usando el state del Link (si existe)
    const initialStateFromLink = location.state?.statusFilter || 'todas';
    const [statusFilter, setStatusFilter] = useState(initialStateFromLink);

    const {
        viviendasFiltradasYOrdenadas, searchTerm, setSearchTerm
    } = useViviendaFilters(viviendas, statusFilter); // Pasamos el filtro al hook

    const { hiddenItems: viviendasOcultas, initiateDelete } = useUndoableDelete(
        async (vivienda) => deleteVivienda(vivienda.id),
        recargarDatos,
        "Vivienda"
    );

    const [viviendaAEditar, setViviendaAEditar] = useState(null);
    const [viviendaAEliminar, setViviendaAEliminar] = useState(null);
    const [viviendaConDescuento, setViviendaConDescuento] = useState(null);

    const handleGuardado = useCallback(() => {
        recargarDatos();
        setViviendaAEditar(null);
        setViviendaConDescuento(null);
    }, [recargarDatos]);

    const handleIniciarEliminacion = (vivienda) => {
        if (vivienda.clienteId) {
            toast.error("No se puede eliminar: la vivienda ya tiene un cliente asignado.");
            return;
        }
        setViviendaAEliminar(vivienda);
    };

    const confirmarEliminar = () => {
        if (!viviendaAEliminar) return;
        initiateDelete(viviendaAEliminar);
        setViviendaAEliminar(null);
    };

    const viviendasVisibles = viviendasFiltradasYOrdenadas.filter(v => !viviendasOcultas.includes(v.id));

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
            {isLoading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => <ViviendaCardSkeleton key={i} />)}
                </div>
            ) : viviendasVisibles.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {viviendasVisibles.map(vivienda => (
                        <ViviendaCard
                            key={vivienda.id}
                            vivienda={vivienda}
                            onEdit={setViviendaAEditar}
                            onDelete={handleIniciarEliminacion}
                            onApplyDiscount={setViviendaConDescuento}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <p className="text-gray-500">No se encontraron viviendas con los filtros actuales.</p>
                </div>
            )}

            {viviendaAEliminar && (<ModalConfirmacion isOpen={!!viviendaAEliminar} onClose={() => setViviendaAEliminar(null)} onConfirm={confirmarEliminar} titulo="¿Eliminar Vivienda?" mensaje="¿Estás seguro? Tendrás 5 segundos para deshacer la acción." />)}
            {viviendaAEditar && (<EditarVivienda isOpen={!!viviendaAEditar} onClose={() => setViviendaAEditar(null)} onSave={handleGuardado} vivienda={viviendaAEditar} todasLasViviendas={viviendas} />)}
            {viviendaConDescuento && (<DescuentoModal isOpen={!!viviendaConDescuento} onClose={() => setViviendaConDescuento(null)} onSave={handleGuardado} vivienda={viviendaConDescuento} />)}
        </ResourcePageLayout>
    );
};

export default ListarViviendas;