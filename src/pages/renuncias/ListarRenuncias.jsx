import React from 'react';
import { useListarRenuncias } from '../../hooks/renuncias/useListarRenuncias';
import ResourcePageLayout from '../../layout/ResourcePageLayout';
import RenunciaCard from './components/RenunciaCard';
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
    const {
        isLoading,
        renunciasFiltradas,
        filters,
        modals,
        handlers
    } = useListarRenuncias();
    const isDarkMode = document.documentElement.classList.contains('dark');

    if (isLoading) {
        return <div className="text-center p-10 animate-pulse">Cargando renuncias...</div>;
    }

    return (
        <>
            <ResourcePageLayout
                title="Gestión de Renuncias"
                icon={<UserX size={40} />}
                color="#f97316"
                filterControls={
                    <div className="w-full space-y-4">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex-shrink-0 bg-gray-100 dark:bg-gray-700/50 p-1 rounded-lg">
                                <button onClick={() => filters.setStatusFilter('Pendiente')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${filters.statusFilter === 'Pendiente' ? 'bg-white dark:bg-gray-900 shadow text-orange-600' : 'text-gray-600 dark:text-gray-300'}`}>Pendientes</button>
                                <button onClick={() => filters.setStatusFilter('Cerrada')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${filters.statusFilter === 'Cerrada' ? 'bg-white dark:bg-gray-900 shadow text-green-600' : 'text-gray-600 dark:text-gray-300'}`}>Cerradas</button>
                                <button onClick={() => filters.setStatusFilter('Todas')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${filters.statusFilter === 'Todas' ? 'bg-white dark:bg-gray-900 shadow text-gray-800' : 'text-gray-600 dark:text-gray-300'}`}>Todas</button>
                            </div>
                            <div className="relative w-full md:w-1/3">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Buscar por cliente o vivienda..."
                                    className="w-full p-3 pl-10 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={filters.searchTerm}
                                    onChange={(e) => filters.setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t dark:border-gray-700">
                            <div>
                                <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Filtrar por Motivo</label>
                                <Select options={motivosOptions} isClearable onChange={filters.setMotivoFiltro} value={filters.motivoFiltro} placeholder="Todos..." styles={getSelectStyles(isDarkMode)} />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Fecha Desde</label>
                                <input type="date" className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={filters.fechaInicio} onChange={e => filters.setFechaInicio(e.target.value)} />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Fecha Hasta</label>
                                <input type="date" className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={filters.fechaFin} onChange={e => filters.setFechaFin(e.target.value)} max={getTodayString()} />
                            </div>
                        </div>
                    </div>
                }
            >
                {renunciasFiltradas.length > 0 ? (
                    <div className="space-y-4">
                        {renunciasFiltradas.map(renuncia => (
                            <RenunciaCard
                                key={renuncia.id}
                                renuncia={renuncia}
                                onMarcarPagada={modals.setRenunciaADevolver}
                                onCancelar={modals.setRenunciaACancelar}
                            />
                        ))}
                    </div>
                ) : (<div className="text-center py-16"><p className="text-gray-500 dark:text-gray-400">No hay renuncias que coincidan con los filtros actuales.</p></div>)}
            </ResourcePageLayout>

            {modals.renunciaADevolver && (<ModalGestionarDevolucion isOpen={!!modals.renunciaADevolver} onClose={() => modals.setRenunciaADevolver(null)} onSave={handlers.handleSave} renuncia={modals.renunciaADevolver} />)}
            {modals.renunciaACancelar && (
                <ModalConfirmacion
                    isOpen={!!modals.renunciaACancelar}
                    onClose={() => modals.setRenunciaACancelar(null)}
                    onConfirm={handlers.confirmarCancelacion}
                    titulo="¿Cancelar Proceso de Renuncia?"
                    mensaje="¿Estás seguro? Esta acción restaurará la asignación de la vivienda al cliente y reactivará sus abonos. Úsese solo para corregir un error."
                />
            )}
        </>
    );
};

export default ListarRenuncias;