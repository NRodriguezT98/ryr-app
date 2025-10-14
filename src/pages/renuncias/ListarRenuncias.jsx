import React from 'react';
import { useListarRenuncias } from '../../hooks/renuncias/useListarRenuncias';
import { useLoadCollections } from '../../components/withCollections';
import RenunciaCard from './components/RenunciaCard';
import ListPageLayout from '../../layout/ListPageLayout';
import ModalGestionarDevolucion from './components/ModalGestionarDevolucion';
import ModalConfirmacion from '../../components/ModalConfirmacion';
import { UserX, Search } from 'lucide-react';
import Select from 'react-select';
import { getTodayString } from '../../utils/textFormatters';

const motivosOptions = [
    { value: 'Crédito Negado', label: 'Crédito Negado' },
    { value: 'Desistimiento Voluntario', label: 'Desistimiento Voluntario' },
    { value: 'Incumplimiento de Pagos', label: 'Incumplimiento de Pagos' },
    { value: 'Otro', label: 'Otro' }
];

const getSelectStyles = (isDarkMode) => ({
    control: (base) => ({ ...base, backgroundColor: isDarkMode ? '#1f2937' : '#ffffff', borderColor: isDarkMode ? '#4b5563' : '#d1d5db' }),
    singleValue: (base) => ({ ...base, color: isDarkMode ? '#d1d5db' : '#111827' }),
    menu: (base) => ({ ...base, backgroundColor: isDarkMode ? '#1f2937' : '#ffffff' }),
    option: (base, state) => ({ ...base, backgroundColor: state.isFocused ? '#2563eb' : (isDarkMode ? '#1f2937' : '#ffffff'), color: state.isFocused ? 'white' : (isDarkMode ? '#d1d5db' : '#111827') }),
    input: (base) => ({ ...base, color: isDarkMode ? '#d1d5db' : '#111827' }),
});

const ListarRenuncias = () => {
    // ✅ Cargar colecciones necesarias
    const { isReady: collectionsReady } = useLoadCollections(['renuncias', 'clientes', 'viviendas']);

    const {
        renunciasFiltradas,
        filters,
        modals,
        handlers
    } = useListarRenuncias();
    const isDarkMode = document.documentElement.classList.contains('dark');

    const filterControls = (
        <div className="w-full space-y-6">
            {/* Tarjeta de resumen modernizada */}
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-6 border border-slate-200 dark:border-slate-600">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">
                            Gestión de Renuncias
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Administra los procesos de renuncia y devoluciones de clientes
                        </p>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-600">
                            <div className="text-sm font-bold text-orange-600 dark:text-orange-400">
                                {renunciasFiltradas.filter(r => r.estadoDevolucion !== 'Cerrada' && r.estadoDevolucion !== 'Pagada').length}
                            </div>
                            <div className="text-xs text-slate-600 dark:text-slate-400">Pendientes</div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-600">
                            <div className="text-sm font-bold text-green-600 dark:text-green-400">
                                {renunciasFiltradas.filter(r => r.estadoDevolucion === 'Cerrada' || r.estadoDevolucion === 'Pagada').length}
                            </div>
                            <div className="text-xs text-slate-600 dark:text-slate-400">Cerradas</div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-600">
                            <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                {renunciasFiltradas.length}
                            </div>
                            <div className="text-xs text-slate-600 dark:text-slate-400">Total</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controles de filtrado modernizados */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    {/* Botones de estado */}
                    <div className="flex-shrink-0 bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-700 dark:to-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-600">
                        <button
                            onClick={() => filters.setStatusFilter('Pendiente')}
                            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${filters.statusFilter === 'Pendiente' ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg scale-105' : 'text-slate-600 dark:text-slate-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:scale-105'}`}
                        >
                            Pendientes
                        </button>
                        <button
                            onClick={() => filters.setStatusFilter('Cerrada')}
                            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${filters.statusFilter === 'Cerrada' ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg scale-105' : 'text-slate-600 dark:text-slate-400 hover:bg-green-50 dark:hover:bg-green-900/20 hover:scale-105'}`}
                        >
                            Cerradas
                        </button>
                        <button
                            onClick={() => filters.setStatusFilter('Todas')}
                            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${filters.statusFilter === 'Todas' ? 'bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-lg scale-105' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:scale-105'}`}
                        >
                            Todas
                        </button>
                    </div>

                    {/* Barra de búsqueda modernizada */}
                    <div className="relative w-full lg:w-1/3">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por cliente o vivienda..."
                            className="w-full pl-12 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                            value={filters.searchTerm}
                            onChange={(e) => filters.setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Filtros adicionales */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 mt-6 border-t border-slate-200 dark:border-slate-700">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Filtrar por Motivo</label>
                        <Select
                            options={motivosOptions}
                            isClearable
                            onChange={filters.setMotivoFiltro}
                            value={filters.motivoFiltro}
                            placeholder="Todos los motivos..."
                            styles={getSelectStyles(isDarkMode)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Fecha Desde</label>
                        <input
                            type="date"
                            className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                            value={filters.fechaInicio}
                            onChange={e => filters.setFechaInicio(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Fecha Hasta</label>
                        <input
                            type="date"
                            className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                            value={filters.fechaFin}
                            onChange={e => filters.setFechaFin(e.target.value)}
                            max={getTodayString()}
                        />
                    </div>
                </div>
            </div>
        </div>
    )

    if (!collectionsReady) {
        return <div className="text-center p-10 animate-pulse">Cargando renuncias...</div>;
    }

    return (
        <ListPageLayout
            icon={<UserX />}
            title="Gestión de Renuncias"
            filterControls={filterControls}
        >
            {renunciasFiltradas.length > 0 ? (
                <div className="space-y-4">
                    {renunciasFiltradas.map(renuncia => (
                        <RenunciaCard
                            key={renuncia.id}
                            renuncia={renuncia}
                            onMarcarPagada={() => handlers.setModals(prev => ({ ...prev, renunciaADevolver: renuncia }))}
                            onCancelar={handlers.iniciarCancelacion}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="relative mb-8">
                        <div className="w-32 h-32 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-full flex items-center justify-center relative overflow-hidden">
                            {/* Efecto de brillo animado */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                            <UserX className="w-16 h-16 text-slate-400 dark:text-slate-500 relative z-10" />
                        </div>
                        {/* Círculos decorativos */}
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-orange-400 to-red-400 rounded-full opacity-60 animate-bounce"></div>
                        <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-gradient-to-r from-slate-300 to-slate-400 rounded-full opacity-50 animate-pulse delay-300"></div>
                    </div>

                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">
                        No se encontraron renuncias
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 max-w-md leading-relaxed mb-6">
                        No hay renuncias que coincidan con los filtros seleccionados. Intenta ajustar los criterios de búsqueda o verifica que haya datos disponibles.
                    </p>

                    {/* Sugerencias de acción */}
                    <div className="flex flex-wrap gap-3 justify-center">
                        <button
                            onClick={() => {
                                filters.setStatusFilter('Todas');
                                filters.setSearchTerm('');
                                filters.setMotivoFiltro(null);
                                filters.setFechaInicio('');
                                filters.setFechaFin('');
                            }}
                            className="px-4 py-2 bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white font-medium rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg"
                        >
                            Limpiar filtros
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white font-medium rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg"
                        >
                            Actualizar datos
                        </button>
                    </div>
                </div>
            )}

            {modals.renunciaADevolver && (<ModalGestionarDevolucion isOpen={!!modals.renunciaADevolver} onClose={() => modals.setRenunciaADevolver(null)} onSave={handlers.handleSave} renuncia={modals.renunciaADevolver} />)}
            {modals.renunciaACancelar && (
                <ModalConfirmacion
                    isOpen={!!modals.renunciaACancelar}
                    onClose={() => modals.setRenunciaACancelar(null)}
                    onConfirm={handlers.confirmarCancelacion}
                    titulo="¿Cancelar Proceso de Renuncia?"
                    mensaje="¿Estás seguro? Esta acción restaurará la asignación de la vivienda al cliente y reactivará sus abonos. Úsese solo para corregir un error."
                    isSubmitting={modals.isSubmitting}
                />
            )}
        </ListPageLayout>
    );
};

export default ListarRenuncias;