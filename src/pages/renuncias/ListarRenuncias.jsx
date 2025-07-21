import React from 'react';
import { useListarRenuncias } from '../../hooks/useListarRenuncias';
import ResourcePageLayout from '../../layout/ResourcePageLayout';
import RenunciaCard from './components/RenunciaCard';
import ModalGestionarDevolucion from './components/ModalGestionarDevolucion';
import ModalEditarRenuncia from './components/ModalEditarRenuncia';
import ModalConfirmacion from '../../components/ModalConfirmacion';
import { UserX } from 'lucide-react';

const ListarRenuncias = () => {
    const {
        isLoading,
        renunciasFiltradas,
        statusFilter,
        setStatusFilter,
        modals,
        handlers
    } = useListarRenuncias();

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
                    <div className="flex-shrink-0 bg-gray-100 dark:bg-gray-700/50 p-1 rounded-lg">
                        <button onClick={() => setStatusFilter('Pendiente')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${statusFilter === 'Pendiente' ? 'bg-white dark:bg-gray-900 shadow text-orange-600' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600/50'}`}>Pendientes</button>
                        <button onClick={() => setStatusFilter('Pagada')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${statusFilter === 'Pagada' ? 'bg-white dark:bg-gray-900 shadow text-green-600' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600/50'}`}>Completadas</button>
                        <button onClick={() => setStatusFilter('Todas')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${statusFilter === 'Todas' ? 'bg-white dark:bg-gray-900 shadow text-gray-800 dark:text-gray-100' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600/50'}`}>Todas</button>
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
                                onEditar={modals.setRenunciaAEditar}
                                onCancelar={modals.setRenunciaACancelar}
                            />
                        ))}
                    </div>
                ) : (<div className="text-center py-16"><p className="text-gray-500 dark:text-gray-400">No hay renuncias que coincidan con el filtro actual.</p></div>)}
            </ResourcePageLayout>

            {modals.renunciaADevolver && (<ModalGestionarDevolucion isOpen={!!modals.renunciaADevolver} onClose={() => modals.setRenunciaADevolver(null)} onSave={handlers.handleSave} renuncia={modals.renunciaADevolver} />)}
            {modals.renunciaAEditar && (<ModalEditarRenuncia isOpen={!!modals.renunciaAEditar} onClose={() => modals.setRenunciaAEditar(null)} onSave={handlers.handleSave} renuncia={modals.renunciaAEditar} />)}
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