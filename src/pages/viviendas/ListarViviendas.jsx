import React from "react";
import { Link } from "react-router-dom";
import { useListarViviendas } from "../../hooks/viviendas/useListarViviendas.jsx";
import ResourcePageLayout from "../../layout/ResourcePageLayout";
import ViviendaCard from './ViviendaCard.jsx';
import ModalConfirmacion from '../../components/ModalConfirmacion.jsx';
import EditarVivienda from "./EditarVivienda.jsx";
import ViviendaCardSkeleton from "./ViviendaCardSkeleton.jsx";
import { Home, PlusCircle } from 'lucide-react';

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
                    <div className="flex-shrink-0 bg-gray-100 dark:bg-gray-700/50 p-1 rounded-lg">
                        <button onClick={() => filters.setStatusFilter('todas')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${filters.statusFilter === 'todas' ? 'bg-white dark:bg-gray-900 shadow text-gray-800 dark:text-gray-100' : 'text-gray-600 dark:text-gray-300'}`}>Todas</button>
                        <button onClick={() => filters.setStatusFilter('disponibles')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${filters.statusFilter === 'disponibles' ? 'bg-white dark:bg-gray-900 shadow text-yellow-600' : 'text-gray-600 dark:text-gray-300'}`}>Disponibles</button>
                        <button onClick={() => filters.setStatusFilter('asignadas')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${filters.statusFilter === 'asignadas' ? 'bg-white dark:bg-gray-900 shadow text-blue-600' : 'text-gray-600 dark:text-gray-300'}`}>Asignadas</button>
                        <button onClick={() => filters.setStatusFilter('pagadas')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${filters.statusFilter === 'pagadas' ? 'bg-white dark:bg-gray-900 shadow text-green-600' : 'text-gray-600 dark:text-gray-300'}`}>Pagadas</button>
                    </div>
                    <div className="w-full md:w-1/3">
                        <input type="text" placeholder="Buscar por Mz, Casa o Cliente..." className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300" value={filters.searchTerm} onChange={(e) => filters.setSearchTerm(e.target.value)} />
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
                        />
                    ))}
                </div>
            ) : todasLasViviendas.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed rounded-xl dark:border-gray-700">
                    <Home size={48} className="mx-auto text-gray-300 dark:text-gray-600" />
                    <h3 className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-200">No hay viviendas registradas</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Parece que aún no has añadido ninguna vivienda al sistema.</p>
                    <Link to="/viviendas/crear" className="mt-6 inline-flex items-center gap-2 bg-red-600 text-white font-semibold px-5 py-2.5 rounded-lg shadow-sm hover:bg-red-700 transition-colors">
                        <PlusCircle size={18} />
                        Crear la primera vivienda
                    </Link>
                </div>
            ) : (
                <div className="text-center py-16">
                    <p className="text-gray-500 dark:text-gray-400">No se encontraron viviendas con los filtros actuales.</p>
                </div>
            )}

            {modals.viviendaAEliminar && (<ModalConfirmacion isOpen={!!modals.viviendaAEliminar} onClose={() => modals.setViviendaAEliminar(null)} onConfirm={handlers.confirmarEliminar} titulo="¿Eliminar Vivienda?" mensaje="¿Estás seguro? Tendrás 5 segundos para deshacer la acción." />)}
            {modals.viviendaAEditar && (<EditarVivienda isOpen={!!modals.viviendaAEditar} onClose={() => modals.setViviendaAEditar(null)} onSave={handlers.handleGuardado} vivienda={modals.viviendaAEditar} todasLasViviendas={todasLasViviendas} />)}
        </ResourcePageLayout>
    );
};

export default ListarViviendas;