import React from 'react';
import { Link } from 'react-router-dom';
import { useListarClientes } from '../../hooks/clientes/useListarClientes.jsx';
import { useClienteCardLogic } from '../../hooks/clientes/useClienteCardLogic.jsx';
import ResourcePageLayout from '../../layout/ResourcePageLayout';
import ModalConfirmacion from '../../components/ModalConfirmacion.jsx';
import EditarCliente from "./EditarCliente";
import ModalMotivoRenuncia from "./components/ModalMotivoRenuncia";
import { User, Search, UserPlus } from "lucide-react";
import ClienteCard from "./ClienteCard.jsx";
import ClienteCardSkeleton from "./ClienteCardSkeleton.jsx";
import { useData } from "../../context/DataContext";
import Select from 'react-select';
import Pagination from '../../components/Pagination.jsx';
import { usePermissions } from '../../hooks/auth/usePermissions';

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
        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
        borderColor: state.isFocused ? '#2563eb' : (isDarkMode ? '#4b5563' : '#d1d5db'),
        '&:hover': { borderColor: '#3b82f6' },
        boxShadow: state.isFocused ? '0 0 0 1px #2563eb' : 'none',
        borderRadius: '0.5rem',
        padding: '0.1rem',
    }),
    singleValue: (base) => ({ ...base, color: isDarkMode ? '#d1d5db' : '#111827' }),
    menu: (base) => ({ ...base, backgroundColor: isDarkMode ? '#1f2937' : '#ffffff' }),
    option: (base, state) => ({ ...base, backgroundColor: state.isSelected ? '#1d4ed8' : (state.isFocused ? (isDarkMode ? '#3b82f650' : '#dbeafe') : 'transparent'), color: state.isSelected ? 'white' : (isDarkMode ? '#d1d5db' : '#111827') }),
    input: (base) => ({ ...base, color: isDarkMode ? '#d1d5db' : '#111827' }),
});

const ClienteCardWrapper = ({ cliente, onEdit, onArchive, onDelete, onRenunciar, onReactivar, onRestaurar, nombreProyecto }) => {
    const cardData = useClienteCardLogic(cliente);
    return <ClienteCard
        cardData={cardData}
        onEdit={onEdit}
        onArchive={onArchive}
        onDelete={onDelete}
        onRenunciar={onRenunciar}
        onReactivar={onReactivar}
        onRestaurar={onRestaurar}
        nombreProyecto={nombreProyecto}
    />;
};

const ListarClientes = () => {
    const { can } = usePermissions();
    // Obtenemos toda la data que necesitamos para hacer los cruces
    const { viviendas, proyectos } = useData();
    const {
        isLoading,
        clientesVisibles,
        todosLosClientesFiltrados,
        statusFilter, setStatusFilter,
        proyectoFilter, setProyectoFilter,
        searchTerm, setSearchTerm,
        sortOrder, setSortOrder,
        pagination,
        modals,
        handlers
    } = useListarClientes();

    const { clientes: todosLosClientes } = useData();
    const isDarkMode = document.documentElement.classList.contains('dark');

    const projectOptions = [
        { value: 'todos', label: 'Todos los Proyectos' },
        ...proyectos.map(p => ({ value: p.id, label: p.nombre }))
    ];

    return (
        <ResourcePageLayout
            title="Clientes Registrados"
            icon={<User size={40} />}
            color="#1976d2"
            filterControls={
                <div className="w-full space-y-4">
                    <div className="flex justify-center">
                        <div className="flex-shrink-0 bg-gray-100 dark:bg-gray-700/50 p-1 rounded-lg">
                            <button onClick={() => setStatusFilter('activo')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${statusFilter === 'activo' ? 'bg-white dark:bg-gray-900 shadow text-blue-600' : 'text-gray-600 dark:text-gray-300'}`}>Activos</button>
                            <button onClick={() => setStatusFilter('enProcesoDeRenuncia')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${statusFilter === 'enProcesoDeRenuncia' ? 'bg-white dark:bg-gray-900 shadow text-orange-600' : 'text-gray-600 dark:text-gray-300'}`}>En Renuncia</button>
                            <button onClick={() => setStatusFilter('renunciado')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${statusFilter === 'renunciado' ? 'bg-white dark:bg-gray-900 shadow text-orange-600' : 'text-gray-600 dark:text-gray-300'}`}>Renunciaron</button>
                            <button onClick={() => setStatusFilter('inactivo')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${statusFilter === 'inactivo' ? 'bg-white dark:bg-gray-900 shadow text-gray-500' : 'text-gray-600 dark:text-gray-300'}`}>Archivados</button>
                            <button onClick={() => setStatusFilter('todos')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${statusFilter === 'todos' ? 'bg-white dark:bg-gray-900 shadow text-gray-800' : 'text-gray-600 dark:text-gray-300'}`}>Todos</button>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="relative w-full flex-grow">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar por Nombre, Cédula o Ubicación (ej: A1)..."
                                className="w-full p-3 pl-10 border border-gray-300 dark:border-gray-600 dark:bg-gray-900/50 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        {/* 👇 3. Agregamos el nuevo Select para Proyectos 👇 */}
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
            }
        >
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">{[...Array(9)].map((_, i) => <ClienteCardSkeleton key={i} />)}</div>
            ) : clientesVisibles.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {clientesVisibles.map(cliente => {
                            // Hacemos el "doble salto" para encontrar el nombre del proyecto
                            const viviendaAsignada = viviendas.find(v => v.id === cliente.viviendaId);
                            const proyectoAsignado = viviendaAsignada ? proyectos.find(p => p.id === viviendaAsignada.proyectoId) : null;
                            const nombreProyecto = proyectoAsignado ? proyectoAsignado.nombre : null;

                            return (
                                <ClienteCardWrapper
                                    key={cliente.id}
                                    cliente={cliente}
                                    nombreProyecto={nombreProyecto}
                                    onEdit={handlers.iniciarEdicion}
                                    onArchive={handlers.iniciarArchivado}
                                    onDelete={handlers.iniciarEliminacionPermanente}
                                    onRenunciar={handlers.iniciarRenuncia}
                                    onReactivar={handlers.iniciarReactivacion}
                                    onRestaurar={handlers.iniciarRestauracion}
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
            ) : todosLosClientesFiltrados.length === 0 && searchTerm === '' ? (
                <div className="text-center py-16 border-2 border-dashed rounded-xl dark:border-gray-700">
                    <User size={48} className="mx-auto text-gray-300 dark:text-gray-600" />
                    <h3 className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-200">Aún no hay clientes</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Registra a tu primer cliente para empezar a gestionar sus pagos y procesos.</p>
                    {can('clientes', 'crear') && (
                        <Link to="/clientes/crear" className="mt-6 inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-lg shadow-sm hover:bg-blue-700 transition-colors"><UserPlus size={18} />Registrar primer cliente</Link>
                    )}
                </div>
            ) : (
                <div className="text-center py-16"><p className="text-gray-500 dark:text-gray-400">No se encontraron clientes con los filtros actuales.</p></div>
            )}

            {modals.clienteAArchivar && (<ModalConfirmacion isOpen={!!modals.clienteAArchivar} onClose={() => modals.setClienteAArchivar(null)} onConfirm={handlers.confirmarArchivado} titulo="¿Archivar Cliente?" mensaje="Este cliente tiene historial, por lo que será archivado y ocultado de las listas. ¿Estás seguro?" />)}
            {modals.clienteAEliminar && (<ModalConfirmacion isOpen={!!modals.clienteAEliminar} onClose={() => modals.setClienteAEliminar(null)} onConfirm={handlers.confirmarEliminacionPermanente} titulo="¿Eliminar Cliente Permanentemente?" mensaje="¡Atención! Esta acción es irreversible. Se eliminará al cliente y todo su historial de renuncias y documentos. ¿Estás seguro?" />)}

            {modals.clienteEnModal.cliente && (<EditarCliente isOpen={!!modals.clienteEnModal.cliente} onClose={() => modals.setClienteEnModal({ cliente: null, modo: null })} onGuardar={handlers.handleGuardado} clienteAEditar={modals.clienteEnModal.cliente} modo={modals.clienteEnModal.modo} />)}
            {modals.clienteARenunciar && (<ModalMotivoRenuncia isOpen={!!modals.clienteARenunciar} onClose={() => modals.setClienteARenunciar(null)} onConfirm={handlers.handleConfirmarMotivo} cliente={modals.clienteARenunciar} />)}
            {modals.datosRenuncia && (<ModalConfirmacion isOpen={!!modals.datosRenuncia} onClose={() => modals.setDatosRenuncia(null)} onConfirm={handlers.confirmarRenunciaFinal} titulo="¿Confirmar Renuncia?" mensaje={`¿Seguro de procesar la renuncia para ${modals.datosRenuncia.cliente.datosCliente.nombres} con motivo "${modals.datosRenuncia.motivo}"?`} isSubmitting={modals.isSubmitting} />)}
            {modals.clienteARestaurar && (<ModalConfirmacion isOpen={!!modals.clienteARestaurar} onClose={() => modals.setClienteARestaurar(null)} onConfirm={handlers.confirmarRestauracion} titulo="¿Restaurar Cliente?" mensaje={`¿Estás seguro de restaurar a ${modals.clienteARestaurar.datosCliente.nombres}? Volverá a la lista de clientes con estado 'Renunció'.`} isSubmitting={modals.isSubmitting} />)}
        </ResourcePageLayout>
    );
};

export default ListarClientes;