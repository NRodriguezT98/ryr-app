import React, { useState, useMemo, useCallback } from "react";
import { User } from 'lucide-react';
import { useData } from "../../context/DataContext";
import { deleteCliente, renunciarAVivienda } from "../../utils/storage";
import ResourcePageLayout from "../../layout/ResourcePageLayout"; // <-- IMPORTAMOS EL NUEVO LAYOUT
import ClienteCard from './ClienteCard.jsx';
import ModalConfirmacion from '../../components/ModalConfirmacion.jsx';
import EditarCliente from "./EditarCliente";
import Select from 'react-select';
import toast from "react-hot-toast";

const ListarClientes = () => {
    const { isLoading, clientes, viviendas, recargarDatos } = useData();
    const [clienteAEditar, setClienteAEditar] = useState(null);
    const [clienteAEliminar, setClienteAEliminar] = useState(null);
    const [clienteARenunciar, setClienteARenunciar] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [manzanaFilter, setManzanaFilter] = useState(null);

    const handleGuardado = useCallback(() => {
        recargarDatos();
    }, [recargarDatos]);

    const manzanaOptions = useMemo(() => {
        const manzanasUnicas = [...new Set(viviendas.map(v => v.manzana).filter(Boolean))];
        const opciones = manzanasUnicas.sort().map(m => ({ value: m, label: `Manzana ${m}` }));
        return [{ value: null, label: 'Todas las Manzanas' }, ...opciones];
    }, [viviendas]);

    const clientesFiltrados = useMemo(() => {
        let itemsProcesados = [...clientes];
        if (manzanaFilter && manzanaFilter.value) {
            itemsProcesados = itemsProcesados.filter(c => c.vivienda?.manzana === manzanaFilter.value);
        }
        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            itemsProcesados = itemsProcesados.filter(c =>
                `${c.datosCliente?.nombres || ''} ${c.datosCliente?.apellidos || ''}`.toLowerCase().includes(lowerCaseSearchTerm) ||
                (c.datosCliente?.cedula || '').includes(searchTerm)
            );
        }
        itemsProcesados.sort((a, b) => {
            const nameA = `${a.datosCliente?.nombres || ''} ${a.datosCliente?.apellidos || ''}`.toLowerCase();
            const nameB = `${b.datosCliente?.nombres || ''} ${b.datosCliente?.apellidos || ''}`.toLowerCase();
            if (nameA < nameB) return -1;
            if (nameA > nameB) return 1;
            return 0;
        });
        return itemsProcesados;
    }, [clientes, searchTerm, manzanaFilter]);

    const confirmarEliminar = async () => {
        if (!clienteAEliminar) return;
        try {
            await deleteCliente(clienteAEliminar.id);
            toast.success("Cliente eliminado correctamente.");
            recargarDatos();
        } catch (error) { toast.error("No se pudo eliminar el cliente."); }
        finally { setClienteAEliminar(null); }
    };

    const confirmarRenuncia = async () => {
        if (!clienteARenunciar) return;
        try {
            await renunciarAVivienda(clienteARenunciar.id, clienteARenunciar.viviendaId);
            toast.success("La renuncia se ha procesado correctamente.");
            recargarDatos();
        } catch (error) {
            toast.error("No se pudo procesar la renuncia.");
            console.error("Error al procesar renuncia:", error);
        } finally {
            setClienteARenunciar(null);
        }
    };

    if (isLoading) { return <div className="text-center p-10 animate-pulse">Cargando clientes...</div>; }

    return (
        <ResourcePageLayout
            title="Clientes Registrados"
            icon={<User size={40} />}
            color="#1976d2"
            filterControls={
                <>
                    <div className="w-full md:w-auto md:min-w-[200px]">
                        <Select options={manzanaOptions} onChange={setManzanaFilter} value={manzanaFilter} placeholder="Filtrar por Manzana..." isClearable={false} defaultValue={manzanaOptions[0]} />
                    </div>
                    <div className="w-full md:w-1/3">
                        <input type="text" placeholder="Buscar por nombre o cédula..." className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                </>
            }
        >
            {clientesFiltrados.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {clientesFiltrados.map(cliente => (
                        <ClienteCard
                            key={cliente.id}
                            cliente={cliente}
                            onEdit={setClienteAEditar}
                            onDelete={setClienteAEliminar}
                            onRenunciar={setClienteARenunciar}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <p className="text-gray-500">No se encontraron clientes con los filtros actuales.</p>
                </div>
            )}

            {clienteAEliminar && (<ModalConfirmacion isOpen={!!clienteAEliminar} onClose={() => setClienteAEliminar(null)} onConfirm={confirmarEliminar} titulo="¿Eliminar Cliente?" mensaje="Esta acción es permanente y desvinculará la vivienda asignada." />)}
            {clienteAEditar && (<EditarCliente isOpen={!!clienteAEditar} onClose={() => setClienteAEditar(null)} onGuardar={handleGuardado} clienteAEditar={clienteAEditar} />)}
            {clienteARenunciar && (
                <ModalConfirmacion
                    isOpen={!!clienteARenunciar}
                    onClose={() => setClienteARenunciar(null)}
                    onConfirm={confirmarRenuncia}
                    titulo="¿Confirmar Renuncia?"
                    mensaje={`¿Estás seguro de que deseas desvincular a ${clienteARenunciar.datosCliente.nombres} de su vivienda? Esta acción reiniciará los valores de la vivienda y creará un registro de renuncia para la devolución de los abonos.`}
                />
            )}
        </ResourcePageLayout>
    );
};

export default ListarClientes;