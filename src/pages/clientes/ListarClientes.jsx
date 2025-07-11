import React, { useState, useCallback, useMemo } from "react";
import AnimatedPage from "../../components/AnimatedPage";
import toast from 'react-hot-toast';
import { useData } from "../../context/DataContext";
import { useUndoableDelete } from "../../hooks/useUndoableDelete.jsx";
import { deleteCliente, renunciarAVivienda, reactivarCliente } from "../../utils/storage";
import ResourcePageLayout from "../../layout/ResourcePageLayout";
import ClienteCard from './ClienteCard.jsx';
import ModalConfirmacion from '../../components/ModalConfirmacion.jsx';
import EditarCliente from "./EditarCliente";
import Select from 'react-select';
import ModalMotivoRenuncia from "./components/ModalMotivoRenuncia";
import { User } from "lucide-react";

const ListarClientes = () => {
    const { isLoading, clientes, viviendas, renuncias, recargarDatos } = useData();

    const { hiddenItems: clientesOcultos, initiateDelete } = useUndoableDelete(
        async (cliente) => deleteCliente(cliente.id),
        recargarDatos,
        "Cliente"
    );

    const [clienteAEditar, setClienteAEditar] = useState(null);
    const [clienteAEliminar, setClienteAEliminar] = useState(null);
    const [clienteARenunciar, setClienteARenunciar] = useState(null);
    const [clienteAReactivar, setClienteAReactivar] = useState(null);
    const [datosRenuncia, setDatosRenuncia] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [manzanaFilter, setManzanaFilter] = useState(null);
    const [statusFilter, setStatusFilter] = useState('activo');

    const handleGuardado = useCallback(() => {
        recargarDatos();
        setClienteAEditar(null);
    }, [recargarDatos]);

    const manzanaOptions = useMemo(() => {
        const manzanasUnicas = [...new Set(viviendas.map(v => v.manzana).filter(Boolean))];
        const opciones = manzanasUnicas.sort().map(m => ({ value: m, label: `Manzana ${m}` }));
        return [{ value: null, label: 'Todas las Manzanas' }, ...opciones];
    }, [viviendas]);

    const clientesFiltrados = useMemo(() => {
        let itemsProcesados = clientes.map(cliente => {
            const renunciaPendiente = renuncias.find(r => r.clienteId === cliente.id && r.estadoDevolucion === 'Pendiente');
            return { ...cliente, tieneRenunciaPendiente: !!renunciaPendiente, renunciaPendiente: renunciaPendiente || null };
        });

        if (statusFilter !== 'todos') {
            itemsProcesados = itemsProcesados.filter(c => c.status === statusFilter);
        }

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
    }, [clientes, renuncias, searchTerm, manzanaFilter, statusFilter]);

    const handleIniciarRenuncia = (cliente) => {
        setClienteARenunciar(cliente);
    };

    const handleConfirmarMotivo = (motivo, observacion, fechaRenuncia) => {
        setDatosRenuncia({ cliente: clienteARenunciar, motivo, observacion, fechaRenuncia });
        setClienteARenunciar(null);
    };

    const confirmarRenunciaFinal = async () => {
        if (!datosRenuncia || !datosRenuncia.cliente) return;
        setIsSubmitting(true);
        const { cliente, motivo, observacion, fechaRenuncia } = datosRenuncia;
        try {
            await renunciarAVivienda(cliente.id, cliente.viviendaId, motivo, observacion, fechaRenuncia);
            toast.success("La renuncia se ha procesado correctamente.");
            recargarDatos();
        } catch (error) {
            toast.error("No se pudo procesar la renuncia.");
            console.error("Error al procesar renuncia:", error);
        } finally {
            setDatosRenuncia(null);
            setIsSubmitting(false);
        }
    };

    const confirmarReactivacion = async () => {
        if (!clienteAReactivar) return;
        setIsSubmitting(true);
        try {
            await reactivarCliente(clienteAReactivar.id);
            toast.success("El cliente ha sido reactivado.");
            recargarDatos();
        } catch (error) {
            toast.error("No se pudo reactivar el cliente.");
        } finally {
            setClienteAReactivar(null);
            setIsSubmitting(false);
        }
    };

    const iniciarEliminacionConModal = (cliente) => {
        // <-- VALIDACIÓN AÑADIDA AQUÍ
        if (cliente.viviendaId) {
            toast.error("No se puede eliminar un cliente con una vivienda asignada. Primero debe procesar la renuncia.");
            return;
        }
        setClienteAEliminar(cliente);
    };

    const confirmarEliminar = () => {
        if (!clienteAEliminar) return;
        initiateDelete(clienteAEliminar);
        setClienteAEliminar(null);
    };

    const clientesVisibles = clientesFiltrados.filter(c => !clientesOcultos.includes(c.id));

    return (
        <ResourcePageLayout
            title="Clientes Registrados"
            icon={<User size={40} />}
            color="#1976d2"
            filterControls={
                <>
                    <div className="flex-shrink-0 bg-gray-100 p-1 rounded-lg">
                        <button onClick={() => setStatusFilter('activo')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${statusFilter === 'activo' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:bg-gray-200'}`}>Activos</button>
                        <button onClick={() => setStatusFilter('renunciado')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${statusFilter === 'renunciado' ? 'bg-white shadow text-orange-600' : 'text-gray-600 hover:bg-gray-200'}`}>Renunciaron</button>
                        <button onClick={() => setStatusFilter('todos')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${statusFilter === 'todos' ? 'bg-white shadow text-gray-800' : 'text-gray-600 hover:bg-gray-200'}`}>Todos</button>
                    </div>
                    <div className="w-full md:w-auto md:min-w-[200px]">
                        <Select options={manzanaOptions} onChange={setManzanaFilter} value={manzanaFilter} placeholder="Filtrar por Manzana..." isClearable={false} defaultValue={manzanaOptions[0]} />
                    </div>
                    <div className="w-full md:w-1/3">
                        <input type="text" placeholder="Buscar por nombre o cédula..." className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                </>
            }
        >
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => <div key={i} className="bg-white rounded-2xl shadow-lg p-5 animate-pulse h-64"></div>)}
                </div>
            ) : clientesVisibles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {clientesVisibles.map(cliente => (
                        <ClienteCard
                            key={cliente.id}
                            cliente={cliente}
                            onEdit={setClienteAEditar}
                            onDelete={iniciarEliminacionConModal}
                            onRenunciar={handleIniciarRenuncia}
                            onReactivar={setClienteAReactivar}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <p className="text-gray-500">No se encontraron clientes con los filtros actuales.</p>
                </div>
            )}

            {clienteAEliminar && (<ModalConfirmacion isOpen={!!clienteAEliminar} onClose={() => setClienteAEliminar(null)} onConfirm={confirmarEliminar} titulo="¿Eliminar Cliente?" mensaje="¿Estás seguro? Tendrás 5 segundos para deshacer." isSubmitting={isSubmitting} />)}
            {clienteAEditar && (<EditarCliente isOpen={!!clienteAEditar} onClose={() => setClienteAEditar(null)} onGuardar={handleGuardado} clienteAEditar={clienteAEditar} />)}
            {clienteARenunciar && (<ModalMotivoRenuncia isOpen={!!clienteARenunciar} onClose={() => setClienteARenunciar(null)} onConfirm={handleConfirmarMotivo} cliente={clienteARenunciar} />)}
            {datosRenuncia && (<ModalConfirmacion isOpen={!!datosRenuncia} onClose={() => setDatosRenuncia(null)} onConfirm={confirmarRenunciaFinal} titulo="¿Confirmar Renuncia?" mensaje={`¿Seguro de procesar la renuncia para ${datosRenuncia.cliente.datosCliente.nombres} con fecha ${new Date(datosRenuncia.fechaRenuncia + 'T00:00:00').toLocaleDateString('es-ES')} y motivo "${datosRenuncia.motivo}"?`} isSubmitting={isSubmitting} />)}
            {clienteAReactivar && (<ModalConfirmacion isOpen={!!clienteAReactivar} onClose={() => setClienteAReactivar(null)} onConfirm={confirmarReactivacion} titulo="¿Reactivar Cliente?" mensaje={`¿Estás seguro de reactivar a ${clienteAReactivar.datosCliente.nombres}? Volverá a la lista de clientes activos.`} isSubmitting={isSubmitting} />)}
        </ResourcePageLayout>
    );
};

export default ListarClientes;