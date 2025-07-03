import React, { useEffect, useState, useCallback, useMemo } from "react";
import AnimatedPage from "../../components/AnimatedPage";
import toast from 'react-hot-toast';
import { User } from 'lucide-react';
import { useData } from "../../context/DataContext";
import { deleteCliente, renunciarAVivienda, reactivarCliente } from "../../utils/storage";
import ResourcePageLayout from "../../layout/ResourcePageLayout";
import ClienteCard from './ClienteCard.jsx';
import ModalConfirmacion from '../../components/ModalConfirmacion.jsx';
import EditarCliente from "./EditarCliente";
import Select from 'react-select';
import UndoToast from '../../components/UndoToast.jsx';

const CustomOption = (props) => {
    const { innerProps, label, data } = props;
    return (
        <div {...innerProps} className="p-3 hover:bg-blue-50 cursor-pointer">
            <p className="font-semibold text-gray-800">{label}</p>
            {data.cliente && (
                <p className="text-xs text-gray-500">{`C.C. ${data.cliente.datosCliente.cedula}`}</p>
            )}
        </div>
    );
};

const ListarClientes = () => {
    const { isLoading, clientes, viviendas, recargarDatos } = useData();
    const [clienteAEditar, setClienteAEditar] = useState(null);
    const [clienteAEliminar, setClienteAEliminar] = useState(null);
    const [clienteARenunciar, setClienteARenunciar] = useState(null);
    const [clienteAReactivar, setClienteAReactivar] = useState(null); // <-- Nuevo estado
    const [searchTerm, setSearchTerm] = useState('');
    const [manzanaFilter, setManzanaFilter] = useState(null);
    const [statusFilter, setStatusFilter] = useState('activo');
    const [clientesOcultos, setClientesOcultos] = useState([]);
    const deletionTimeouts = React.useRef({});

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
        if (statusFilter !== 'todos') {
            if (statusFilter === 'activo') {
                itemsProcesados = itemsProcesados.filter(c => c.status !== 'renunciado');
            } else {
                itemsProcesados = itemsProcesados.filter(c => c.status === statusFilter);
            }
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
    }, [clientes, searchTerm, manzanaFilter, statusFilter]);

    const iniciarEliminacion = (cliente) => {
        const id = cliente.id;
        setClientesOcultos(prev => [...prev, id]);
        toast.custom((t) => (
            <UndoToast t={t} message="Cliente eliminado" onUndo={() => deshacerEliminacion(id)} />
        ), { duration: 5000 });
        const timeoutId = setTimeout(() => {
            confirmarEliminarReal(id);
        }, 5000);

        deletionTimeouts.current[id] = timeoutId;
        setClienteAEliminar(null);
    };

    const deshacerEliminacion = (id) => {
        clearTimeout(deletionTimeouts.current[id]);
        delete deletionTimeouts.current[id];
        setClientesOcultos(prev => prev.filter(cId => cId !== id));
        toast.success("Eliminación deshecha.");
    };

    const confirmarEliminarReal = async (id) => {
        try {
            await deleteCliente(id);
            recargarDatos();
        } catch (error) {
            toast.error("No se pudo eliminar el cliente.");
            setClientesOcultos(prev => prev.filter(cId => cId !== id));
        }
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

    const confirmarReactivacion = async () => {
        if (!clienteAReactivar) return;
        try {
            await reactivarCliente(clienteAReactivar.id);
            toast.success("El cliente ha sido reactivado.");
            recargarDatos();
        } catch (error) {
            toast.error("No se pudo reactivar el cliente.");
        } finally {
            setClienteAReactivar(null);
        }
    };

    const clientesVisibles = clientesFiltrados.filter(c => !clientesOcultos.includes(c.id));

    if (isLoading) { return <div className="text-center p-10 animate-pulse">Cargando clientes...</div>; }

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
            {clientesVisibles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {clientesVisibles.map(cliente => (
                        <ClienteCard
                            key={cliente.id}
                            cliente={cliente}
                            onEdit={setClienteAEditar}
                            onDelete={setClienteAEliminar}
                            onRenunciar={setClienteARenunciar}
                            onReactivar={setClienteAReactivar}
                        />
                    ))}
                </div>
            ) : (<div className="text-center py-16"><p className="text-gray-500">No se encontraron clientes con los filtros actuales.</p></div>)}

            {clienteAEliminar && (<ModalConfirmacion isOpen={!!clienteAEliminar} onClose={() => setClienteAEliminar(null)} onConfirm={() => iniciarEliminacion(clienteAEliminar)} titulo="¿Eliminar Cliente?" mensaje="Esta acción es permanente y desvinculará la vivienda asignada. Tendrás 5 segundos para deshacer." />)}
            {clienteAEditar && (<EditarCliente isOpen={!!clienteAEditar} onClose={() => setClienteAEditar(null)} onGuardar={handleGuardado} clienteAEditar={clienteAEditar} />)}
            {clienteARenunciar && (<ModalConfirmacion isOpen={!!clienteARenunciar} onClose={() => setClienteARenunciar(null)} onConfirm={confirmarRenuncia} titulo="¿Confirmar Renuncia?" mensaje={`¿Estás seguro de que deseas desvincular a ${clienteARenunciar.datosCliente.nombres} de su vivienda? Esta acción reiniciará los valores de la vivienda y creará un registro de renuncia para la devolución de los abonos.`} />)}
            {clienteAReactivar && (
                <ModalConfirmacion
                    isOpen={!!clienteAReactivar}
                    onClose={() => setClienteAReactivar(null)}
                    onConfirm={confirmarReactivacion}
                    titulo="¿Reactivar Cliente?"
                    mensaje={`¿Estás seguro de que deseas reactivar a ${clienteAReactivar.datosCliente.nombres}? Volverá a la lista de clientes activos.`}
                />
            )}
        </ResourcePageLayout>
    );
};

export default ListarClientes;