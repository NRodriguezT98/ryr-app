import React from "react";
import { useListarViviendas } from "../../hooks/viviendas/useListarViviendas.jsx";
import ResourcePageLayout from "../../layout/ResourcePageLayout";
import ViviendaCard from './ViviendaCard.jsx';
import ModalConfirmacion from '../../components/ModalConfirmacion.jsx';
import EditarVivienda from "./EditarVivienda.jsx";
import DescuentoModal from './DescuentoModal.jsx';
import ViviendaCardSkeleton from "./ViviendaCardSkeleton.jsx";

const ListarViviendas = () => {
    const {
        isLoading,
        viviendasVisibles,
        todasLasViviendas,
        filters,
        modals,
        handlers
    } = useListarViviendas();

    return (
        <ResourcePageLayout
            title="Viviendas Registradas"
            icon={<span role="img" aria-label="viviendas">🏠</span>}
            color="#c62828"
            filterControls={
                <>
                    {/* --- BOTONES DE FILTRO ACTUALIZADOS --- */}
                    <div className="flex-shrink-0 bg-gray-100 p-1 rounded-lg">
                        <button onClick={() => filters.setStatusFilter('todas')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${filters.statusFilter === 'todas' ? 'bg-white shadow text-gray-800' : 'text-gray-600 hover:bg-gray-200'}`}>Todas</button>
                        <button onClick={() => filters.setStatusFilter('disponibles')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${filters.statusFilter === 'disponibles' ? 'bg-white shadow text-yellow-600' : 'text-gray-600 hover:bg-gray-200'}`}>Disponibles</button>
                        <button onClick={() => filters.setStatusFilter('asignadas')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${filters.statusFilter === 'asignadas' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:bg-gray-200'}`}>Asignadas</button>
                        <button onClick={() => filters.setStatusFilter('pagadas')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${filters.statusFilter === 'pagadas' ? 'bg-white shadow text-green-600' : 'text-gray-600 hover:bg-gray-200'}`}>Pagadas</button>
                    </div>
                    <div className="w-full md:w-1/3">
                        <input type="text" placeholder="Buscar por Mz, Casa o Cliente..." className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300" value={filters.searchTerm} onChange={(e) => filters.setSearchTerm(e.target.value)} />
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
                            onEdit={modals.setViviendaAEditar}
                            onDelete={handlers.handleIniciarEliminacion}
                            onApplyDiscount={modals.setViviendaConDescuento}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <p className="text-gray-500">No se encontraron viviendas con los filtros actuales.</p>
                </div>
            )}

            {modals.viviendaAEliminar && (<ModalConfirmacion isOpen={!!modals.viviendaAEliminar} onClose={() => modals.setViviendaAEliminar(null)} onConfirm={handlers.confirmarEliminar} titulo="¿Eliminar Vivienda?" mensaje="¿Estás seguro? Tendrás 5 segundos para deshacer la acción." />)}
            {modals.viviendaAEditar && (<EditarVivienda isOpen={!!modals.viviendaAEditar} onClose={() => modals.setViviendaAEditar(null)} onSave={handlers.handleGuardado} vivienda={modals.viviendaAEditar} todasLasViviendas={todasLasViviendas} />)}
            {modals.viviendaConDescuento && (<DescuentoModal isOpen={!!modals.viviendaConDescuento} onClose={() => modals.setViviendaConDescuento(null)} onSave={handlers.handleGuardado} vivienda={modals.viviendaConDescuento} />)}
        </ResourcePageLayout>
    );
};

export default ListarViviendas;