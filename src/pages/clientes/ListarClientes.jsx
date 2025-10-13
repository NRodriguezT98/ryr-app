import React from 'react';
import { Link } from 'react-router-dom';
import { useListarClientes } from '../../hooks/clientes/useListarClientes.jsx';
import { useClienteCardLogic } from '../../hooks/clientes/useClienteCardLogic.jsx';
import ModalConfirmacion from '../../components/ModalConfirmacion.jsx';
import EditarCliente from "./EditarCliente";
import ModalMotivoRenuncia from "./components/ModalMotivoRenuncia";
import { User, Search, UserPlus, FilterX } from "lucide-react";
import ClienteCard from "./ClienteCard.jsx";
import ClienteCardSkeleton from "./ClienteCardSkeleton.jsx";
import { useData } from "../../context/DataContext";
import Select from 'react-select';
import Pagination from '../../components/Pagination.jsx';
import { usePermissions } from '../../hooks/auth/usePermissions';
import ListPageLayout from '../../layout/ListPageLayout.jsx';
import Button from '../../components/Button.jsx';
import TransferirViviendaModal from './components/TransferirViviendaModal';

const sortOptions = [
    { value: 'ubicacion', label: 'Ubicación (Mz/Casa)' },
    { value: 'nombre_asc', label: 'Nombre (A-Z)' },
    { value: 'fecha_reciente', label: 'Más Recientes' },
    { value: 'valor_desc', label: 'Valor Vivienda (Mayor a menor)' },
    { value: 'valor_asc', label: 'Valor Vivienda (Menor a mayor)' },
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
    input: (base) => ({
        ...base,
        color: isDarkMode ? '#f1f5f9' : '#0f172a',
        fontWeight: '500'
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

const ClienteCardWrapper = React.memo(({ cliente, onEdit, onArchive, onDelete, onRenunciar, onReactivar, onRestaurar, onTransferir }) => {
    const cardData = useClienteCardLogic(cliente);

    return <ClienteCard
        cardData={cardData}
        onEdit={onEdit}
        onArchive={onArchive}
        onDelete={onDelete}
        onRenunciar={onRenunciar}
        onReactivar={onReactivar}
        onRestaurar={onRestaurar}
        onTransferir={onTransferir}
        nombreProyecto={cliente.nombreProyecto}
    />;
});

const ListarClientes = () => {
    const { can } = usePermissions();
    // Obtenemos toda la data que necesitamos para hacer los cruces
    const { viviendas, proyectos } = useData();
    const {
        isLoading,
        clientesVisibles,
        todosLosClientesFiltrados,
        totalClientesEnSistema,
        statusFilter, setStatusFilter,
        proyectoFilter, setProyectoFilter,
        searchTerm, setSearchTerm,
        sortOrder, setSortOrder,
        pagination,
        modals,
        handlers,
        projectOptions
    } = useListarClientes();

    const isDarkMode = document.documentElement.classList.contains('dark');

    const actionButton = can('clientes', 'crear') ? (
        <Link to="/clientes/crear">
            <Button
                variant="primary"
                icon={<UserPlus size={18} />}
            >
                Registrar Cliente
            </Button>
        </Link>
    ) : null;

    const filterControls = (
        <div className="w-full space-y-6">
            {/* Filtros de estado modernizados */}
            <div className="flex justify-center">
                <div className="inline-flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <button
                        onClick={() => setStatusFilter('activo')}
                        className={`px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${statusFilter === 'activo'
                            ? 'bg-white dark:bg-slate-700 shadow-md text-indigo-600 dark:text-indigo-400 scale-105'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                    >
                        Activos
                    </button>
                    <button
                        onClick={() => setStatusFilter('enProcesoDeRenuncia')}
                        className={`px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${statusFilter === 'enProcesoDeRenuncia'
                            ? 'bg-white dark:bg-slate-700 shadow-md text-amber-600 dark:text-amber-400 scale-105'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                    >
                        En Renuncia
                    </button>
                    <button
                        onClick={() => setStatusFilter('renunciado')}
                        className={`px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${statusFilter === 'renunciado'
                            ? 'bg-white dark:bg-slate-700 shadow-md text-orange-600 dark:text-orange-400 scale-105'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                    >
                        Renunciaron
                    </button>
                    <button
                        onClick={() => setStatusFilter('inactivo')}
                        className={`px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${statusFilter === 'inactivo'
                            ? 'bg-white dark:bg-slate-700 shadow-md text-slate-500 dark:text-slate-400 scale-105'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                    >
                        Archivados
                    </button>
                    <button
                        onClick={() => setStatusFilter('todos')}
                        className={`px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${statusFilter === 'todos'
                            ? 'bg-white dark:bg-slate-700 shadow-md text-slate-800 dark:text-slate-200 scale-105'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                    >
                        Todos
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
                        placeholder="Buscar por Nombre, Cédula o Ubicación (ej: A1)..."
                        className="w-full p-4 pl-12 pr-4 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 placeholder-slate-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="w-full md:w-64 flex-shrink-0">
                    <Select
                        options={projectOptions}
                        value={projectOptions.find(option => option.value === proyectoFilter)}
                        onChange={(option) => setProyectoFilter(option.value)}
                        styles={getSelectStyles(isDarkMode)}
                        isSearchable={false}
                        placeholder="Filtrar por proyecto..."
                    />
                </div>
                <div className="w-full md:w-64 flex-shrink-0">
                    <Select
                        options={sortOptions}
                        defaultValue={sortOptions[0]}
                        onChange={(option) => setSortOrder(option.value)}
                        styles={getSelectStyles(isDarkMode)}
                        isSearchable={false}
                        placeholder="Ordenar por..."
                    />
                </div>
            </div>
        </div>
    );

    return (
        <ListPageLayout
            icon={<User />}
            title="Clientes Registrados"
            actionButton={actionButton}
            filterControls={filterControls}
        >

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">{[...Array(9)].map((_, i) => <ClienteCardSkeleton key={i} />)}</div>

                // --- INICIO DE LA LÓGICA DE RENDERIZADO CORREGIDA ---
            ) : totalClientesEnSistema === 0 ? (
                // 1. Si NO hay clientes en toda la base de datos, muestra el mensaje de bienvenida.
                <div className="text-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
                    <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900 dark:to-indigo-800 rounded-2xl mb-6">
                        <User size={40} className="text-indigo-600 dark:text-indigo-400" />
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                            <UserPlus size={12} className="text-white" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">¡Comienza tu gestión!</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">Registra a tu primer cliente para empezar a gestionar pagos, procesos y documentos de manera eficiente.</p>
                    {can('clientes', 'crear') && (
                        <Link to="/clientes/crear" className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-105">
                            <UserPlus size={20} />
                            Registrar primer cliente
                        </Link>
                    )}
                </div>

            ) : clientesVisibles.length > 0 ? (
                // 2. Si SÍ hay clientes y la vista filtrada tiene resultados, muéstralos.
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {clientesVisibles.map(cliente => (
                            <ClienteCardWrapper
                                key={`${cliente.id}-${cliente.updatedAt || ''}-${cliente.datosCliente?.nombres || ''}`}
                                cliente={cliente}
                                onEdit={handlers.iniciarEdicion}
                                onArchive={handlers.iniciarArchivado}
                                onDelete={handlers.iniciarEliminacionPermanente}
                                onRenunciar={handlers.iniciarRenuncia}
                                onReactivar={handlers.iniciarReactivacion}
                                onRestaurar={handlers.iniciarRestauracion}
                                onTransferir={handlers.iniciarTransferencia}
                            />
                        ))}
                    </div>
                    <Pagination {...pagination} />
                </>

            ) : (
                // 3. Si SÍ hay clientes, pero la vista filtrada está vacía, muestra este mensaje.
                <div className="text-center py-20">
                    <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-2xl mb-6">
                        <FilterX size={36} className="text-slate-500 dark:text-slate-400" />
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                            <Search size={14} className="text-white" />
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Sin resultados</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-sm mx-auto">No encontramos clientes que coincidan con los filtros actuales. Prueba ajustando los criterios de búsqueda.</p>
                    <div className="space-y-3">
                        <Button
                            variant="secondary"
                            onClick={handlers.limpiarFiltros}
                            className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600"
                        >
                            Limpiar Filtros
                        </Button>
                    </div>
                </div>
            )}

            <ModalConfirmacion
                isOpen={!!modals.clienteAArchivar}
                onClose={() => handlers.setModals(prev => ({ ...prev, clienteAArchivar: null }))}
                onConfirm={handlers.confirmarArchivado}
                titulo="¿Archivar Cliente?"
                mensaje="Este cliente tiene historial, por lo que será archivado y ocultado de las listas. ¿Estás seguro?"
            />
            <ModalConfirmacion
                isOpen={!!modals.clienteAEliminar}
                onClose={() => handlers.setModals(prev => ({ ...prev, clienteAEliminar: null }))}
                onConfirm={handlers.confirmarEliminacionPermanente}
                titulo="¿Eliminar Cliente Permanentemente?"
                mensaje="¡Atención! Esta acción es irreversible. Se eliminará al cliente y todo su historial de renuncias y documentos. ¿Estás seguro?"
            />
            {modals.clienteEnModal.cliente && (
                <EditarCliente
                    isOpen={!!modals.clienteEnModal.cliente}
                    onClose={() => handlers.setModals(prev => ({ ...prev, clienteEnModal: { cliente: null, modo: null } }))}
                    onGuardar={handlers.handleGuardado}
                    clienteAEditar={modals.clienteEnModal.cliente}
                    modo={modals.clienteEnModal.modo}
                />
            )}
            {modals.clienteARenunciar && (
                <ModalMotivoRenuncia
                    isOpen={!!modals.clienteARenunciar}
                    onClose={() => handlers.setModals(prev => ({ ...prev, clienteARenunciar: null }))}
                    onConfirm={handlers.handleConfirmarMotivo}
                    cliente={modals.clienteARenunciar}
                    size="3xl"
                />
            )}
            {modals.datosRenuncia && (
                <ModalConfirmacion
                    isOpen={!!modals.datosRenuncia}
                    onClose={() => handlers.setModals(prev => ({ ...prev, datosRenuncia: null }))}
                    onConfirm={handlers.confirmarRenunciaFinal}
                    titulo="¿Confirmar Renuncia?"
                    mensaje={`¿Seguro de procesar la renuncia para ${modals.datosRenuncia.cliente.datosCliente.nombres} con motivo "${modals.datosRenuncia.motivo}"?`}
                    isSubmitting={modals.isSubmitting}
                />
            )}
            {modals.clienteARestaurar && (
                <ModalConfirmacion
                    isOpen={!!modals.clienteARestaurar}
                    onClose={() => handlers.setModals(prev => ({ ...prev, clienteARestaurar: null }))}
                    onConfirm={handlers.confirmarRestauracion}
                    titulo="¿Restaurar Cliente?"
                    mensaje={`¿Estás seguro de restaurar a ${modals.clienteARestaurar.datosCliente.nombres}? Volverá a la lista de clientes con estado 'Renunció'.`}
                    isSubmitting={modals.isSubmitting}
                />
            )}

            {modals.clienteParaTransferir && (
                <TransferirViviendaModal
                    cliente={modals.clienteParaTransferir}
                    isOpen={!!modals.clienteParaTransferir}
                    onClose={handlers.cerrarModalTransferencia}
                    size="3xl"
                />
            )}
        </ListPageLayout>
    );
};

export default ListarClientes;