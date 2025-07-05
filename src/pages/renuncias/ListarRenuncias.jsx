import React, { useState, useMemo, useCallback } from 'react';
import { useData } from '../../context/DataContext';
import { cancelarRenuncia } from '../../utils/storage';
import ResourcePageLayout from '../../layout/ResourcePageLayout';
import RenunciaCard from './components/RenunciaCard';
import ModalGestionarDevolucion from './components/ModalGestionarDevolucion';
import ModalEditarRenuncia from './components/ModalEditarRenuncia';
import ModalConfirmacion from '../../components/ModalConfirmacion';
import toast from 'react-hot-toast';
import { UserX } from 'lucide-react';

const formatCurrency = (value) => (value || 0).toLocaleString("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 });

const ListarRenuncias = () => {
    const { isLoading, renuncias, recargarDatos } = useData();
    const [statusFilter, setStatusFilter] = useState('Pendiente');
    const [renunciaADevolver, setRenunciaADevolver] = useState(null);
    const [renunciaAEditar, setRenunciaAEditar] = useState(null);
    const [renunciaACancelar, setRenunciaACancelar] = useState(null);

    const renunciasFiltradas = useMemo(() => {
        const sortedRenuncias = [...renuncias].sort((a, b) => new Date(b.fechaRenuncia) - new Date(a.fechaRenuncia));
        if (statusFilter === 'Todas') return sortedRenuncias;
        return sortedRenuncias.filter(r => r.estadoDevolucion === statusFilter);
    }, [renuncias, statusFilter]);

    const handleSave = useCallback(() => {
        recargarDatos();
        setRenunciaADevolver(null);
        setRenunciaAEditar(null);
    }, [recargarDatos]);

    const confirmarCancelacion = async () => {
        if (!renunciaACancelar) return;
        try {
            await cancelarRenuncia(renunciaACancelar);
            toast.success("La renuncia ha sido cancelada exitosamente.");
            recargarDatos();
        } catch (error) {
            toast.error("No se pudo cancelar la renuncia.");
            console.error("Error al cancelar renuncia:", error);
        } finally {
            setRenunciaACancelar(null);
        }
    };

    if (isLoading) { return <div className="text-center p-10 animate-pulse">Cargando renuncias...</div>; }

    return (
        <>
            <ResourcePageLayout
                title="Gestión de Renuncias"
                icon={<UserX size={40} />}
                color="#f97316"
                filterControls={
                    <div className="flex-shrink-0 bg-gray-100 p-1 rounded-lg">
                        <button onClick={() => setStatusFilter('Pendiente')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${statusFilter === 'Pendiente' ? 'bg-white shadow text-orange-600' : 'text-gray-600 hover:bg-gray-200'}`}>Pendientes</button>
                        <button onClick={() => setStatusFilter('Pagada')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${statusFilter === 'Pagada' ? 'bg-white shadow text-green-600' : 'text-gray-600 hover:bg-gray-200'}`}>Completadas</button>
                        <button onClick={() => setStatusFilter('Todas')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${statusFilter === 'Todas' ? 'bg-white shadow text-gray-800' : 'text-gray-600 hover:bg-gray-200'}`}>Todas</button>
                    </div>
                }
            >
                {renunciasFiltradas.length > 0 ? (
                    <div className="space-y-4">
                        {renunciasFiltradas.map(renuncia => (
                            <RenunciaCard
                                key={renuncia.id}
                                renuncia={renuncia}
                                onMarcarPagada={setRenunciaADevolver}
                                onEditar={setRenunciaAEditar}
                                onCancelar={setRenunciaACancelar}
                            />
                        ))}
                    </div>
                ) : (<div className="text-center py-16"><p className="text-gray-500">No hay renuncias que coincidan con el filtro actual.</p></div>)}
            </ResourcePageLayout>

            {renunciaADevolver && (<ModalGestionarDevolucion isOpen={!!renunciaADevolver} onClose={() => setRenunciaADevolver(null)} onSave={handleSave} renuncia={renunciaADevolver} />)}
            {renunciaAEditar && (<ModalEditarRenuncia isOpen={!!renunciaAEditar} onClose={() => setRenunciaAEditar(null)} onSave={handleSave} renuncia={renunciaAEditar} />)}
            {renunciaACancelar && (
                <ModalConfirmacion
                    isOpen={!!renunciaACancelar}
                    onClose={() => setRenunciaACancelar(null)}
                    onConfirm={confirmarCancelacion}
                    titulo="¿Cancelar Proceso de Renuncia?"
                    mensaje="¿Estás seguro? Esta acción restaurará la asignación de la vivienda al cliente y reactivará sus abonos. Úsese solo para corregir un error."
                />
            )}
        </>
    );
};

export default ListarRenuncias;