import React, { useState, useMemo, useCallback } from 'react';
import { useData } from '../../context/DataContext';
import ResourcePageLayout from '../../layout/ResourcePageLayout';
import RenunciaCard from './components/RenunciaCard';
import ModalGestionarDevolucion from './components/ModalGestionarDevolucion';
import ModalEditarRenuncia from './components/ModalEditarRenuncia'; // <-- Importamos el nuevo modal
import { UserX } from 'lucide-react';

const ListarRenuncias = () => {
    const { isLoading, renuncias, recargarDatos } = useData();
    const [statusFilter, setStatusFilter] = useState('Pendiente');
    const [renunciaADevolver, setRenunciaADevolver] = useState(null);
    const [renunciaAEditar, setRenunciaAEditar] = useState(null); // <-- Nuevo estado

    const renunciasFiltradas = useMemo(() => {
        const sortedRenuncias = [...renuncias].sort((a, b) => new Date(b.fechaRenuncia) - new Date(a.fechaRenuncia));
        if (statusFilter === 'Todas') return sortedRenuncias;
        return sortedRenuncias.filter(r => r.estadoDevolucion === statusFilter);
    }, [renuncias, statusFilter]);

    const handleSave = useCallback(() => {
        recargarDatos();
        setRenunciaADevolver(null);
        setRenunciaAEditar(null); // Cerramos el modal de edición también
    }, [recargarDatos]);

    if (isLoading) { return <div className="text-center p-10 animate-pulse">Cargando renuncias...</div>; }

    return (
        <>
            <ResourcePageLayout
                title="Gestión de Renuncias"
                icon={<UserX size={40} />}
                color="#f97316"
                filterControls={
                    <div className="flex-shrink-0 bg-gray-100 p-1 rounded-lg">
                        <button onClick={() => setStatusFilter('Pendiente')} className={`px-4 py-1.5 text-sm font-semibold ...`}>Pendientes</button>
                        <button onClick={() => setStatusFilter('Pagada')} className={`px-4 py-1.5 text-sm font-semibold ...`}>Completadas</button>
                        <button onClick={() => setStatusFilter('Todas')} className={`px-4 py-1.5 text-sm font-semibold ...`}>Todas</button>
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
                                onEditar={setRenunciaAEditar} // <-- Pasamos la nueva función
                            />
                        ))}
                    </div>
                ) : (<div className="text-center py-16"><p className="text-gray-500">No hay renuncias que coincidan con el filtro actual.</p></div>)}
            </ResourcePageLayout>

            {renunciaADevolver && (
                <ModalGestionarDevolucion
                    isOpen={!!renunciaADevolver}
                    onClose={() => setRenunciaADevolver(null)}
                    onSave={handleSave}
                    renuncia={renunciaADevolver}
                />
            )}

            {/* --- RENDERIZAMOS EL NUEVO MODAL DE EDICIÓN --- */}
            {renunciaAEditar && (
                <ModalEditarRenuncia
                    isOpen={!!renunciaAEditar}
                    onClose={() => setRenunciaAEditar(null)}
                    onSave={handleSave}
                    renuncia={renunciaAEditar}
                />
            )}
        </>
    );
};

export default ListarRenuncias;