import React from "react";
import { useListarClientes } from "../../hooks/clientes/useListarClientes.jsx";
import ResourcePageLayout from "../../layout/ResourcePageLayout";
import ClienteCard from './ClienteCard.jsx';
import ModalConfirmacion from '../../components/ModalConfirmacion.jsx';
import EditarCliente from "./EditarCliente";
import ModalMotivoRenuncia from "./components/ModalMotivoRenuncia";
import { User } from "lucide-react";
import ClienteCardSkeleton from "./ClienteCardSkeleton.jsx";

const ListarClientes = () => {
    const {
        isLoading,
        clientesVisibles,
        statusFilter, setStatusFilter,
        searchTerm, setSearchTerm,
        modals,
        handlers
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
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => <ClienteCardSkeleton key={i} />)}
                </div>
            ) : clientesVisibles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {clientesVisibles.map(cliente => (
                        <ClienteCard
                            key={cliente.id}
                            cliente={cliente}
                            onEdit={modals.setClienteAEditar}
                            onDelete={() => handlers.iniciarEliminacion(cliente)}
                            onRenunciar={() => handlers.iniciarRenuncia(cliente)}
                            onReactivar={() => handlers.iniciarReactivacion(cliente)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <p className="text-gray-500">No se encontraron clientes con los filtros actuales.</p>
                </div>
            )}

            {modals.clienteAEliminar && (<ModalConfirmacion isOpen={!!modals.clienteAEliminar} onClose={() => modals.setClienteAEliminar(null)} onConfirm={handlers.confirmarEliminar} titulo="¿Eliminar Cliente?" mensaje="¿Estás seguro? Tendrás 5 segundos para deshacer." />)}
            {modals.clienteAEditar && (<EditarCliente isOpen={!!modals.clienteAEditar} onClose={() => modals.setClienteAEditar(null)} onGuardar={handlers.handleGuardado} clienteAEditar={modals.clienteAEditar} />)}
            {modals.clienteARenunciar && (<ModalMotivoRenuncia isOpen={!!modals.clienteARenunciar} onClose={() => modals.setClienteARenunciar(null)} onConfirm={handlers.handleConfirmarMotivo} cliente={modals.clienteARenunciar} />)}
            {modals.datosRenuncia && (<ModalConfirmacion isOpen={!!modals.datosRenuncia} onClose={() => modals.setDatosRenuncia(null)} onConfirm={handlers.confirmarRenunciaFinal} titulo="¿Confirmar Renuncia?" mensaje={`¿Seguro de procesar la renuncia para ${modals.datosRenuncia.cliente.datosCliente.nombres} con motivo "${modals.datosRenuncia.motivo}"?`} isSubmitting={modals.isSubmitting} />)}
            {modals.clienteAReactivar && (<ModalConfirmacion isOpen={!!modals.clienteAReactivar} onClose={() => modals.setClienteAReactivar(null)} onConfirm={handlers.confirmarReactivacion} titulo="¿Reactivar Cliente?" mensaje={`¿Estás seguro de reactivar a ${modals.clienteAReactivar.datosCliente.nombres}? Volverá a la lista de clientes activos.`} isSubmitting={modals.isSubmitting} />)}
        </ResourcePageLayout>
    );
};

export default ListarClientes;