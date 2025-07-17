import React from "react";
import { useListarClientes } from "../../hooks/clientes/useListarClientes.jsx";
import ResourcePageLayout from "../../layout/ResourcePageLayout";
import ModalConfirmacion from '../../components/ModalConfirmacion.jsx';
import EditarCliente from "./EditarCliente";
import ModalMotivoRenuncia from "./components/ModalMotivoRenuncia";
import { User, ChevronUp, ChevronDown } from "lucide-react";
import ClienteTableRow from "./components/ClienteTableRow.jsx"; // Importamos el nuevo componente

const TableHeader = ({ children, onSort, sortKey, sortConfig }) => {
    const isSorted = sortConfig.key === sortKey;
    const icon = isSorted ? (sortConfig.direction === 'ascending' ? <ChevronUp size={16} /> : <ChevronDown size={16} />) : null;
    return (
        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            <button className="flex items-center gap-2" onClick={() => onSort(sortKey)}>
                {children} {icon}
            </button>
        </th>
    );
};

const ListarClientes = () => {
    const {
        isLoading,
        clientesVisibles,
        statusFilter, setStatusFilter,
        searchTerm, setSearchTerm,
        modals,
        handlers,
        sortConfig
    } = useListarClientes();

    return (
        <ResourcePageLayout
            title="Clientes Registrados"
            icon={<User size={40} />}
            color="#1976d2"
            filterControls={
                <div className="flex flex-col md:flex-row items-center justify-end gap-4 w-full">
                    <div className="flex-shrink-0 bg-gray-100 p-1 rounded-lg">
                        <button onClick={() => setStatusFilter('activo')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${statusFilter === 'activo' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:bg-gray-200'}`}>Activos</button>
                        <button onClick={() => setStatusFilter('renunciado')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${statusFilter === 'renunciado' ? 'bg-white shadow text-orange-600' : 'text-gray-600 hover:bg-gray-200'}`}>Renunciaron</button>
                        <button onClick={() => setStatusFilter('todos')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${statusFilter === 'todos' ? 'bg-white shadow text-gray-800' : 'text-gray-600 hover:bg-gray-200'}`}>Todos</button>
                    </div>
                    <div className="w-full md:w-1/3">
                        <input type="text" placeholder="Buscar por nombre o cédula..." className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                </div>
            }
        >
            <div className="flex flex-col">
                <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                        <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <TableHeader onSort={handlers.requestSort} sortKey="nombres" sortConfig={sortConfig}>Cliente</TableHeader>
                                        <TableHeader onSort={handlers.requestSort} sortKey="vivienda" sortConfig={sortConfig}>Vivienda</TableHeader>
                                        <TableHeader onSort={() => { }} sortKey="status" sortConfig={{}}>Estado</TableHeader>
                                        <TableHeader onSort={handlers.requestSort} sortKey="saldoPendiente" sortConfig={sortConfig}>Saldo Pendiente</TableHeader>
                                        <th scope="col" className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr><td colSpan="5" className="text-center p-10">Cargando...</td></tr>
                                    ) : clientesVisibles.length > 0 ? (
                                        clientesVisibles.map(cliente => (
                                            <ClienteTableRow
                                                key={cliente.id}
                                                cliente={cliente}
                                                onEdit={modals.setClienteAEditar}
                                                onDelete={() => handlers.iniciarEliminacion(cliente)}
                                                onRenunciar={() => handlers.iniciarRenuncia(cliente)}
                                                onReactivar={() => handlers.iniciarReactivacion(cliente)}
                                            />
                                        ))
                                    ) : (
                                        <tr><td colSpan="5" className="text-center p-10 text-gray-500">No se encontraron clientes con los filtros actuales.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {modals.clienteAEliminar && (<ModalConfirmacion isOpen={!!modals.clienteAEliminar} onClose={() => modals.setClienteAEliminar(null)} onConfirm={handlers.confirmarEliminar} titulo="¿Eliminar Cliente?" mensaje="¿Estás seguro? Tendrás 5 segundos para deshacer." />)}
            {modals.clienteAEditar && (<EditarCliente isOpen={!!modals.clienteAEditar} onClose={() => modals.setClienteAEditar(null)} onGuardar={handlers.handleGuardado} clienteAEditar={modals.clienteAEditar} />)}
            {modals.clienteARenunciar && (<ModalMotivoRenuncia isOpen={!!modals.clienteARenunciar} onClose={() => modals.setClienteARenunciar(null)} onConfirm={handlers.handleConfirmarMotivo} cliente={modals.clienteARenunciar} />)}
            {modals.datosRenuncia && (<ModalConfirmacion isOpen={!!modals.datosRenuncia} onClose={() => modals.setDatosRenuncia(null)} onConfirm={handlers.confirmarRenunciaFinal} titulo="¿Confirmar Renuncia?" mensaje={`¿Seguro de procesar la renuncia para ${modals.datosRenuncia.cliente.datosCliente.nombres} con motivo "${modals.datosRenuncia.motivo}"?`} isSubmitting={modals.isSubmitting} />)}
            {modals.clienteAReactivar && (<ModalConfirmacion isOpen={!!modals.clienteAReactivar} onClose={() => modals.setClienteAReactivar(null)} onConfirm={handlers.confirmarReactivacion} titulo="¿Reactivar Cliente?" mensaje={`¿Estás seguro de reactivar a ${modals.clienteAReactivar.datosCliente.nombres}? Volverá a la lista de clientes activos.`} isSubmitting={modals.isSubmitting} />)}
        </ResourcePageLayout>
    );
};

export default ListarClientes;