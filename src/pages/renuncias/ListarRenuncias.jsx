import React, { useState, useMemo, useCallback } from 'react';
import { useData } from '../../context/DataContext';
import { updateDoc, doc } from "firebase/firestore";
import { db } from '../../firebase/config';
import ResourcePageLayout from '../../layout/ResourcePageLayout';
import RenunciaCard from './components/RenunciaCard';
import ModalConfirmacion from '../../components/ModalConfirmacion';
import toast from 'react-hot-toast';
import { UserX } from 'lucide-react';

const formatCurrency = (value) => (value || 0).toLocaleString("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 });

const ListarRenuncias = () => {
    const { isLoading, renuncias, recargarDatos } = useData();
    const [statusFilter, setStatusFilter] = useState('Pendiente');
    const [renunciaAConfirmar, setRenunciaAConfirmar] = useState(null);

    const renunciasFiltradas = useMemo(() => {
        const sortedRenuncias = [...renuncias].sort((a, b) => new Date(b.fechaRenuncia) - new Date(a.fechaRenuncia));
        if (statusFilter === 'Todas') {
            return sortedRenuncias;
        }
        return sortedRenuncias.filter(r => r.estadoDevolucion === statusFilter);
    }, [renuncias, statusFilter]);

    const handleMarcarPagada = (renuncia) => {
        setRenunciaAConfirmar(renuncia);
    };

    const confirmarPago = async () => {
        if (!renunciaAConfirmar) return;
        try {
            const renunciaRef = doc(db, "renuncias", renunciaAConfirmar.id);
            await updateDoc(renunciaRef, {
                estadoDevolucion: 'Pagada',
                fechaDevolucion: new Date().toISOString()
            });
            toast.success("Devolución marcada como pagada.");
            recargarDatos();
        } catch (error) {
            toast.error("No se pudo actualizar el estado de la renuncia.");
            console.error("Error al marcar como pagada:", error);
        } finally {
            setRenunciaAConfirmar(null);
        }
    };

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
                                onMarcarPagada={handleMarcarPagada}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <p className="text-gray-500">No hay renuncias que coincidan con el filtro actual.</p>
                    </div>
                )}
            </ResourcePageLayout>

            {renunciaAConfirmar && (
                <ModalConfirmacion
                    isOpen={!!renunciaAConfirmar}
                    onClose={() => setRenunciaAConfirmar(null)}
                    onConfirm={confirmarPago}
                    titulo="¿Confirmar Devolución?"
                    mensaje={`¿Estás seguro de que deseas marcar la devolución de ${formatCurrency(renunciaAConfirmar.totalAbonadoParaDevolucion)} al cliente ${renunciaAConfirmar.clienteNombre} como pagada? Esta acción no se puede deshacer.`}
                />
            )}
        </>
    );
};

export default ListarRenuncias;