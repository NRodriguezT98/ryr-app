import React, { useState, useMemo, useCallback, useRef } from "react";
import toast from 'react-hot-toast';
import { useData } from "../../context/DataContext";
import { useViviendaFilters } from "../../hooks/useViviendaFilters";
import { deleteVivienda } from "../../utils/storage";
import ResourcePageLayout from "../../layout/ResourcePageLayout";
import ViviendaCard from './ViviendaCard.jsx';
import ModalConfirmacion from '../../components/ModalConfirmacion.jsx';
import EditarVivienda from "./EditarVivienda.jsx";
import DescuentoModal from './DescuentoModal.jsx';
import UndoToast from '../../components/UndoToast.jsx';

const ListarViviendas = () => {
    const { isLoading, viviendas, recargarDatos } = useData();

    const {
        viviendasFiltradasYOrdenadas,
        searchTerm, setSearchTerm,
        statusFilter, setStatusFilter,
    } = useViviendaFilters(viviendas);

    const [viviendaAEditar, setViviendaAEditar] = useState(null);
    const [viviendaAEliminar, setViviendaAEliminar] = useState(null);
    const [viviendaConDescuento, setViviendaConDescuento] = useState(null);
    const [viviendasOcultas, setViviendasOcultas] = useState([]);
    const deletionTimeouts = useRef({});

    const handleGuardado = useCallback(() => {
        recargarDatos();
        setViviendaAEditar(null);
        setViviendaConDescuento(null);
    }, [recargarDatos]);

    const iniciarEliminacion = (vivienda) => {
        if (vivienda.clienteId) {
            toast.error("No se puede eliminar: la vivienda ya tiene un cliente asignado.");
            setViviendaAEliminar(null);
            return;
        }

        const id = vivienda.id;
        setViviendasOcultas(prev => [...prev, id]);

        // --- CAMBIO DE TIEMPO AQUÍ ---
        toast.custom((t) => (
            <UndoToast
                t={t}
                message="Vivienda eliminada"
                onUndo={() => deshacerEliminacion(id)}
            />
        ), { duration: 5000 }); // Cambiado de 7000 a 5000

        // --- Y CAMBIO DE TIEMPO AQUÍ ---
        const timeoutId = setTimeout(() => {
            confirmarEliminarReal(id);
        }, 5000); // Cambiado de 7000 a 5000

        deletionTimeouts.current[id] = timeoutId;
        setViviendaAEliminar(null);
    };

    const deshacerEliminacion = (id) => {
        clearTimeout(deletionTimeouts.current[id]);
        delete deletionTimeouts.current[id];
        setViviendasOcultas(prev => prev.filter(vId => vId !== id));
        toast.success("Eliminación deshecha.");
    };

    const confirmarEliminarReal = async (id) => {
        try {
            await deleteVivienda(id);
            recargarDatos();
        } catch (error) {
            toast.error("No se pudo completar la eliminación.");
            setViviendasOcultas(prev => prev.filter(vId => vId !== id));
        }
    };

    const viviendasVisibles = viviendasFiltradasYOrdenadas.filter(v => !viviendasOcultas.includes(v.id));

    if (isLoading) return <div className="text-center p-10 animate-pulse">Cargando viviendas...</div>;

    return (
        <ResourcePageLayout
            title="Viviendas Registradas"
            icon={<span role="img" aria-label="viviendas">🏠</span>}
            color="#c62828"
            filterControls={
                <>
                    <div className="flex-shrink-0 bg-gray-100 p-1 rounded-lg">
                        <button onClick={() => setStatusFilter('todas')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${statusFilter === 'todas' ? 'bg-white shadow text-gray-800' : 'text-gray-600 hover:bg-gray-200'}`}>Todas</button>
                        <button onClick={() => setStatusFilter('disponibles')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${statusFilter === 'disponibles' ? 'bg-white shadow text-green-600' : 'text-gray-600 hover:bg-gray-200'}`}>Disponibles</button>
                        <button onClick={() => setStatusFilter('ocupadas')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${statusFilter === 'ocupadas' ? 'bg-white shadow text-red-600' : 'text-gray-600 hover:bg-gray-200'}`}>Ocupadas</button>
                    </div>
                    <div className="w-full md:w-1/3">
                        <input type="text" placeholder="Buscar por Mz, Casa o Cliente..." className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                </>
            }
        >
            {viviendasVisibles.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {viviendasVisibles.map(vivienda => (
                        <ViviendaCard
                            key={vivienda.id}
                            vivienda={vivienda}
                            onEdit={setViviendaAEditar}
                            onDelete={() => setViviendaAEliminar(vivienda)}
                            onApplyDiscount={setViviendaConDescuento}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <p className="text-gray-500">No se encontraron viviendas con los filtros actuales.</p>
                </div>
            )}

            {viviendaAEliminar && (
                <ModalConfirmacion
                    isOpen={!!viviendaAEliminar}
                    onClose={() => setViviendaAEliminar(null)}
                    onConfirm={() => iniciarEliminacion(viviendaAEliminar)}
                    titulo="¿Quieres Eliminar Esta Vivienda?"
                    mensaje="Esta acción eliminará permanentemente la vivienda. Tendrás 5 segundos para deshacer la acción."
                />
            )}

            {viviendaAEditar && (<EditarVivienda isOpen={!!viviendaAEditar} onClose={() => setViviendaAEditar(null)} onSave={handleGuardado} vivienda={viviendaAEditar} todasLasViviendas={viviendas} />)}
            {viviendaConDescuento && (<DescuentoModal isOpen={!!viviendaConDescuento} onClose={() => setViviendaConDescuento(null)} onSave={handleGuardado} vivienda={viviendaConDescuento} />)}
        </ResourcePageLayout>
    );
};

export default ListarViviendas;