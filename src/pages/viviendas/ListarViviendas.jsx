// src/pages/viviendas/ListarViviendas.jsx

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useListarViviendas } from "../../hooks/viviendas/useListarViviendas.jsx";
import ListPageLayout from '../../layout/ListPageLayout.jsx';
import Button from '../../components/Button.jsx';
import ViviendaCard from './ViviendaCard.jsx';
import { useViviendaCardData } from '../../hooks/viviendas/useViviendaCardData';
import ModalConfirmacion from '../../components/ModalConfirmacion.jsx';
import EditarVivienda from "./EditarVivienda.jsx";
import ViviendaCardSkeleton from "./ViviendaCardSkeleton.jsx";
import { Home, PlusCircle, Search } from 'lucide-react';
import Select from 'react-select';
import Pagination from '../../components/Pagination.jsx';
import { usePermissions } from '../../hooks/auth/usePermissions';
import { useData } from '../../context/DataContext.jsx';
import ConfirmacionEliminarVivienda from "./components/ConfirmacionEliminarVivienda";

const sortOptions = [
    { value: 'ubicacion', label: 'Ubicación (Mz/Casa)' },
    { value: 'nombre_cliente', label: 'Nombre Cliente (A-Z)' },
    { value: 'recientes', label: 'Más Recientes' },
    { value: 'valor_desc', label: 'Valor (Mayor a menor)' },
    { value: 'valor_asc', label: 'Valor (Menor a mayor)' },
    { value: 'saldo_desc', label: 'Saldo (Mayor a menor)' },
    { value: 'saldo_asc', label: 'Saldo (Menor a mayor)' },
];

const getSelectStyles = (isDarkMode) => ({
    control: (base, state) => ({
        ...base,
        backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
        borderColor: state.isFocused ? '#6366f1' : (isDarkMode ? '#475569' : '#e2e8f0'),
        '&:hover': { borderColor: isDarkMode ? '#64748b' : '#cbd5e1' },
        boxShadow: state.isFocused ? '0 0 0 2px rgba(99, 102, 241, 0.2)' : 'none',
        borderRadius: '0.75rem',
        padding: '0.25rem',
        minHeight: '3rem',
    }),
    singleValue: (base) => ({
        ...base,
        color: isDarkMode ? '#f1f5f9' : '#0f172a',
        fontWeight: '500'
    }),
    menu: (base) => ({
        ...base,
        backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
        borderRadius: '0.75rem',
        border: `1px solid ${isDarkMode ? '#475569' : '#e2e8f0'}`,
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        zIndex: 20
    }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected
            ? '#6366f1'
            : (state.isFocused ? (isDarkMode ? '#334155' : '#f1f5f9') : 'transparent'),
        color: state.isSelected
            ? 'white'
            : (isDarkMode ? '#f1f5f9' : '#0f172a'),
        fontWeight: state.isSelected ? '600' : '500',
        padding: '0.75rem',
        ':hover': {
            backgroundColor: state.isSelected ? '#6366f1' : (isDarkMode ? '#334155' : '#f1f5f9')
        }
    }),
    placeholder: (base) => ({
        ...base,
        color: isDarkMode ? '#94a3b8' : '#64748b',
        fontWeight: '500'
    }),
    dropdownIndicator: (base) => ({
        ...base,
        color: isDarkMode ? '#94a3b8' : '#64748b',
        ':hover': {
            color: isDarkMode ? '#f1f5f9' : '#0f172a'
        }
    })
});

// Componente auxiliar para el mensaje dinámico
const EmptyState = ({ filters, totalCount, canCreate }) => {
    // Si no hay ninguna vivienda en el sistema
    if (totalCount === 0) {
        return (
            <div className="text-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
                <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900 dark:to-indigo-800 rounded-2xl mb-6">
                    <Home size={40} className="text-indigo-600 dark:text-indigo-400" />
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                        <PlusCircle size={12} className="text-white" />
                    </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">¡Construye tu inventario!</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">Registra tu primera vivienda para comenzar a gestionar el inventario y las asignaciones de clientes.</p>
                {canCreate && (
                    <Link to="/viviendas/crear" className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-105">
                        <PlusCircle size={20} />
                        Crear la primera vivienda
                    </Link>
                )}
            </div>
        );
    }

    // Si hay viviendas, pero los filtros no arrojaron resultados
    let message = "No se encontraron viviendas con los filtros actuales.";
    if (filters.searchTerm) {
        message = `No hay resultados para tu búsqueda "${filters.searchTerm}".`;
    } else if (filters.statusFilter !== 'todas') {
        const statusMap = {
            disponibles: "disponibles",
            asignadas: "asignadas",
            pagadas: "pagadas",
            archivadas: "archivadas"
        };
        message = `No hay viviendas ${statusMap[filters.statusFilter]} en este momento.`;
    }

    return (
        <div className="text-center py-20">
            <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-2xl mb-6">
                <Search size={36} className="text-slate-500 dark:text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Sin resultados</h3>
            <p className="text-slate-600 dark:text-slate-400 max-w-sm mx-auto">{message}</p>
        </div>
    );
};

const ViviendaCardWrapper = React.memo(({ vivienda, ...props }) => {
    // Este wrapper llama al hook para obtener los datos calculados
    const viviendaData = useViviendaCardData(vivienda);
    // Y se los pasa a la ViviendaCard, que ahora es un componente puramente visual
    return <ViviendaCard vivienda={viviendaData} {...props} />;
});

const ListarViviendas = () => {
    const { can } = usePermissions();
    const { proyectos } = useData();
    const [isConfirmDisabled, setIsConfirmDisabled] = useState(true);
    const {
        isLoading,
        isSubmitting,
        viviendasVisibles,
        totalViviendasCount,
        todasLasViviendasFiltradas, // Obtenemos el conteo total
        filters,
        pagination,
        modals,
        handlers
    } = useListarViviendas();
    const isDarkMode = document.documentElement.classList.contains('dark');

    const projectOptions = [
        { value: 'todos', label: 'Todos los Proyectos' },
        ...proyectos.map(p => ({ value: p.id, label: p.nombre }))
    ];

    const filterControls = (
        <div className="w-full space-y-6">
            {/* Filtros de estado modernizados */}
            <div className="flex justify-center">
                <div className="inline-flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <button
                        onClick={() => filters.setStatusFilter('todas')}
                        className={`px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${filters.statusFilter === 'todas'
                            ? 'bg-white dark:bg-slate-700 shadow-md text-slate-800 dark:text-slate-200 scale-105'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                    >
                        Todas
                    </button>
                    <button
                        onClick={() => filters.setStatusFilter('disponibles')}
                        className={`px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${filters.statusFilter === 'disponibles'
                            ? 'bg-white dark:bg-slate-700 shadow-md text-amber-600 dark:text-amber-400 scale-105'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                    >
                        Disponibles
                    </button>
                    <button
                        onClick={() => filters.setStatusFilter('asignadas')}
                        className={`px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${filters.statusFilter === 'asignadas'
                            ? 'bg-white dark:bg-slate-700 shadow-md text-indigo-600 dark:text-indigo-400 scale-105'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                    >
                        Asignadas
                    </button>
                    <button
                        onClick={() => filters.setStatusFilter('pagadas')}
                        className={`px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${filters.statusFilter === 'pagadas'
                            ? 'bg-white dark:bg-slate-700 shadow-md text-emerald-600 dark:text-emerald-400 scale-105'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                    >
                        Pagadas
                    </button>
                    <button
                        onClick={() => filters.setStatusFilter('archivadas')}
                        className={`px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${filters.statusFilter === 'archivadas'
                            ? 'bg-white dark:bg-slate-700 shadow-md text-slate-500 dark:text-slate-400 scale-105'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                    >
                        Archivadas
                    </button>
                </div>
            </div>

            {/* Controles de búsqueda y filtros */}
            <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="relative w-full flex-grow">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <Search size={20} />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar por Ubicación (ej: A1), Matrícula o Cliente..."
                        className="w-full p-4 pl-12 pr-4 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 placeholder-slate-400"
                        value={filters.searchTerm}
                        onChange={(e) => filters.setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="w-full md:w-64 flex-shrink-0">
                    <Select
                        options={projectOptions}
                        value={projectOptions.find(option => option.value === filters.proyectoFilter)}
                        onChange={(option) => filters.setProyectoFilter(option.value)}
                        styles={getSelectStyles(isDarkMode)}
                        isSearchable={false}
                        placeholder="Filtrar por proyecto..."
                    />
                </div>
                <div className="w-full md:w-64 flex-shrink-0">
                    <Select
                        options={sortOptions}
                        defaultValue={sortOptions[0]}
                        onChange={(option) => filters.setSortOrder(option.value)}
                        styles={getSelectStyles(isDarkMode)}
                        isSearchable={false}
                        placeholder="Ordenar por..."
                    />
                </div>
            </div>
        </div>
    );

    const actionButton = can('viviendas', 'crear') ? (
        <Link to="/viviendas/crear">
            <Button
                variant="primary"
                icon={<PlusCircle size={18} />}
            >
                Crear Vivienda
            </Button>
        </Link>
    ) : null;

    return (
        <ListPageLayout
            icon={<Home />}
            title="Viviendas Registradas"
            actionButton={actionButton}
            filterControls={filterControls}
        >
            {isLoading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[...Array(9)].map((_, i) => <ViviendaCardSkeleton key={i} />)}
                </div>
            ) : viviendasVisibles.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {viviendasVisibles.map(vivienda => {
                            const proyectoDeVivienda = proyectos.find(p => p.id === vivienda.proyectoId);
                            const nombreProyecto = proyectoDeVivienda ? proyectoDeVivienda.nombre : 'Sin Proyecto Asignado';
                            return (
                                <ViviendaCardWrapper
                                    key={vivienda.id}
                                    vivienda={vivienda}
                                    nombreProyecto={nombreProyecto}
                                    onEdit={modals.setViviendaAEditar}
                                    onDelete={() => handlers.handleIniciarEliminacion(vivienda, nombreProyecto)}
                                    onArchive={() => handlers.handleIniciarArchivado(vivienda, nombreProyecto)}
                                    onRestore={() => handlers.handleIniciarRestauracion(vivienda, nombreProyecto)}
                                />
                            );
                        })}
                    </div>
                    <Pagination
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                        onPageChange={pagination.onPageChange}
                    />
                </>
            ) : (
                <EmptyState
                    filters={filters}
                    totalCount={totalViviendasCount}
                    canCreate={can('viviendas', 'crear')}
                />
            )}

            {modals.viviendaAEliminar && (
                <ModalConfirmacion
                    isOpen={!!modals.viviendaAEliminar}
                    onClose={() => modals.setViviendaAEliminar(null)}
                    onConfirm={handlers.confirmarEliminar}
                    titulo="Confirmación de Eliminación Permanente"
                    isSubmitting={isSubmitting}
                    disabled={isConfirmDisabled}
                    type="warning"
                    size="xl"
                    mensaje={
                        <ConfirmacionEliminarVivienda
                            datosParaEliminar={modals.viviendaAEliminar}
                            onValidationChange={setIsConfirmDisabled} // El hijo le informa al padre si la validación pasa
                        />
                    }
                />
            )}
            {modals.viviendaAEditar && (
                <EditarVivienda
                    isOpen={!!modals.viviendaAEditar}
                    onClose={() => modals.setViviendaAEditar(null)}
                    onSave={handlers.handleGuardado}
                    vivienda={modals.viviendaAEditar}
                    todasLasViviendas={todasLasViviendasFiltradas}
                    size="xl" />
            )}
            {modals.viviendaAArchivar && (
                <ModalConfirmacion
                    isOpen={!!modals.viviendaAArchivar}
                    onClose={() => modals.setViviendaAArchivar(null)}
                    onConfirm={handlers.confirmarArchivado}
                    titulo="¿Archivar Vivienda?"
                    mensaje="Esta vivienda se ocultará de la vista principal. Podrás verla usando el filtro 'Archivadas'. ¿Estás seguro?"
                    isSubmitting={isSubmitting}
                />
            )}
            {modals.viviendaARestaurar && (
                <ModalConfirmacion
                    isOpen={!!modals.viviendaARestaurar}
                    onClose={() => modals.setViviendaARestaurar(null)}
                    onConfirm={handlers.confirmarRestauracion}
                    titulo="¿Restaurar Vivienda?"
                    mensaje="Esta vivienda volverá a estar disponible en la lista principal. ¿Estás seguro?"
                    isSubmitting={isSubmitting}
                />
            )}
        </ListPageLayout>
    );
}

export default ListarViviendas;