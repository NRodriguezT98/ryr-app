import React from "react";
import { Link } from "react-router-dom";
import { useListarClientes } from "../../hooks/clientes/useListarClientes.jsx";
import ResourcePageLayout from "../../layout/ResourcePageLayout";
import ModalConfirmacion from '../../components/ModalConfirmacion.jsx';
import EditarCliente from "./EditarCliente";
import ModalMotivoRenuncia from "./components/ModalMotivoRenuncia";
import { User, Search, UserPlus } from "lucide-react";
import ClienteCard from "./ClienteCard.jsx";
import ClienteCardSkeleton from "./ClienteCardSkeleton.jsx";
import { useData } from "../../context/DataContext"; // Importamos useData

const ListarClientes = () => {
    const {
        isLoading,
        clientesVisibles,
        statusFilter, setStatusFilter,
        searchTerm, setSearchTerm,
        modals,
        handlers
    } = useListarClientes();

    // Obtenemos la lista total de clientes para la validación de estado vacío
    const { clientes: todosLosClientes } = useData();

    return (
        <ResourcePageLayout
            title="Clientes Registrados"
            icon={<User size={40} />}
            color="#1976d2"
            filterControls={
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full">
                    <div className="flex-shrink-0 bg-gray-100 dark:bg-gray-700/50 p-1 rounded-lg">
                        <button onClick={() => setStatusFilter('activo')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${statusFilter === 'activo' ? 'bg-white dark:bg-gray-900 shadow text-blue-600' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600/50'}`}>Activos</button>
                        <button onClick={() => setStatusFilter('renunciado')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${statusFilter === 'renunciado' ? 'bg-white dark:bg-gray-900 shadow text-orange-600' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600/50'}`}>Renunciaron</button>
                        <button onClick={() => setStatusFilter('todos')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${statusFilter === 'todos' ? 'bg-white dark:bg-gray-900 shadow text-gray-800 dark:text-gray-100' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600/50'}`}>Todos</button>
                    </div>
                    <div className="relative w-full md:w-1/3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o cédula..."
                            className="w-full p-3 pl-10 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 transition-shadow"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
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
            ) : todosLosClientes.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed rounded-xl dark:border-gray-700">
                    <User size={48} className="mx-auto text-gray-300 dark:text-gray-600" />
                    <h3 className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-200">Aún no hay clientes</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Registra a tu primer cliente para empezar a gestionar sus pagos y procesos.</p>
                    <Link to="/clientes/crear" className="mt-6 inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-lg shadow-sm hover:bg-blue-700 transition-colors">
                        <UserPlus size={18} />
                        Registrar primer cliente
                    </Link>
                </div>
            ) : (
                <div className="text-center py-16">
                    <p className="text-gray-500 dark:text-gray-400">No se encontraron clientes con los filtros actuales.</p>
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