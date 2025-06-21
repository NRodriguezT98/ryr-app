import React, { useEffect, useState, useCallback } from "react";
import { Trash, Pencil } from "lucide-react";
import AnimatedPage from "../../components/AnimatedPage";

// --- IMPORTACIONES CORREGIDAS ---
import { useToast } from "../../components/ToastContext";
import { getViviendas, getClientes, deleteVivienda } from "../../utils/storage";
import TablaViviendas from './TablaViviendas.jsx'; // Usando el nombre que acordamos
import ModalConfirmacion from '../../components/ModalConfirmacion.jsx'; // Usaremos este
import EditarVivienda from "./EditarVivienda"; // Mantenemos tu modal de edición por ahora

const ListarViviendas = () => {
    const { showToast } = useToast();
    const [viviendas, setViviendas] = useState([]);

    // Estados para los modales
    const [selectedVivienda, setSelectedVivienda] = useState(null);
    const [viviendaAEliminar, setViviendaAEliminar] = useState(null);

    // Estado para controlar tu modal de edición original
    const [isEditViviendaModalOpen, setIsEditViviendaModalOpen] = useState(false);
    const [shouldRenderViviendaEditModal, setShouldRenderViviendaEditModal] = useState(false);

    const cargarDatosViviendas = useCallback(() => {
        const dataViviendas = getViviendas();
        const dataClientes = getClientes();

        const viviendasConCliente = dataViviendas.map(vivienda => {
            const clienteAsignado = dataClientes.find(c => c.id === vivienda.clienteId);
            return { ...vivienda, cliente: clienteAsignado || null };
        });
        setViviendas(viviendasConCliente);
    }, []);

    useEffect(() => {
        cargarDatosViviendas();
    }, [cargarDatosViviendas]);

    // Lógica para manejar la visibilidad de tu modal de edición con animaciones
    useEffect(() => {
        if (isEditViviendaModalOpen) {
            setShouldRenderViviendaEditModal(true);
        }
    }, [isEditViviendaModalOpen]);

    const handleCloseViviendaEditModalRequest = () => {
        setIsEditViviendaModalOpen(false);
    };

    const handleViviendaEditModalAnimationFinished = () => {
        setShouldRenderViviendaEditModal(false);
        setSelectedVivienda(null);
    };

    // --- Lógica de Acciones Simplificada ---
    const handleEdit = (vivienda) => {
        setSelectedVivienda(vivienda);
        setIsEditViviendaModalOpen(true);
    };

    const handleDelete = (vivienda) => {
        setViviendaAEliminar(vivienda);
    };

    const confirmarEliminar = () => {
        if (!viviendaAEliminar) return;

        deleteVivienda(viviendaAEliminar.id);
        showToast("Vivienda eliminada correctamente", "success");
        cargarDatosViviendas();
        setViviendaAEliminar(null);
    };

    const handleGuardado = () => {
        cargarDatosViviendas();
        showToast("Vivienda actualizada correctamente", "success");
    };

    return (
        <AnimatedPage>
            <div className="w-fit mx-auto bg-white p-6 rounded-2xl shadow-2xl mt-10 relative">
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-extrabold text-[#c62828] uppercase inline-flex items-center gap-4 pb-4">
                        <span role="img" aria-label="viviendas">🏠</span>
                        Viviendas Registradas
                    </h2>
                    <div className="w-24 h-1 bg-[#c62828] mx-auto rounded-full mt-2"></div>
                </div>

                {viviendas.length === 0 ? (
                    <p className="text-center text-gray-600">No hay viviendas registradas.</p>
                ) : (
                    <TablaViviendas
                        viviendas={viviendas}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                )}
            </div>

            {/* --- SECCIÓN DE MODALES LIMPIA --- */}

            {/* Modal de confirmación para eliminar */}
            {viviendaAEliminar && (
                <ModalConfirmacion
                    isOpen={!!viviendaAEliminar}
                    onClose={() => setViviendaAEliminar(null)}
                    onConfirm={confirmarEliminar}
                    titulo="¿Eliminar Vivienda?"
                    mensaje="Esta acción es permanente y desvinculará a cualquier cliente asignado."
                />
            )}

            {/* Modal de edición de vivienda (tu componente original) */}
            {shouldRenderViviendaEditModal && selectedVivienda && (
                <EditarVivienda
                    isOpen={isEditViviendaModalOpen}
                    onClose={handleCloseViviendaEditModalRequest}
                    onCierreFinalizado={handleViviendaEditModalAnimationFinished}
                    onGuardar={handleGuardado}
                    vivienda={selectedVivienda}
                />
            )}
        </AnimatedPage>
    );
};

export default ListarViviendas;