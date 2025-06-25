import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AnimatedPage from '../../components/AnimatedPage';
import toast from 'react-hot-toast';
import { getAbonos, getClientes, getViviendas, deleteAbono } from '../../utils/storage';
import TablaAbonos from './TablaAbonos.jsx';
import EditarAbonoModal from './EditarAbonoModal.jsx';
import ModalConfirmacion from '../../components/ModalConfirmacion.jsx';

const ListarAbonos = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [abonos, setAbonos] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [viviendas, setViviendas] = useState([]);

    const [abonoAEditar, setAbonoAEditar] = useState(null);
    const [abonoAEliminar, setAbonoAEliminar] = useState(null);

    const cargarDatos = useCallback(async () => {
        setIsLoading(true);
        try {
            const [abonosData, clientesData, viviendasData] = await Promise.all([
                getAbonos(),
                getClientes(),
                getViviendas()
            ]);
            setAbonos(abonosData);
            setClientes(clientesData);
            setViviendas(viviendasData);
        } catch (error) {
            console.error("Error cargando datos de abonos:", error);
            toast.error("No se pudieron cargar los datos.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    const abonosRecientes = useMemo(() => {
        return abonos
            .map(abono => {
                const cliente = clientes.find(c => c.id === abono.clienteId);
                const vivienda = viviendas.find(v => v.id === abono.viviendaId);
                return {
                    ...abono,
                    clienteNombre: cliente?.nombre || 'Desconocido',
                    viviendaLabel: vivienda ? `Mz ${vivienda.manzana} - Casa ${vivienda.numeroCasa}` : 'Desconocida',
                };
            })
            .sort((a, b) => new Date(b.fechaPago) - new Date(a.fechaPago))
            .slice(0, 20);
    }, [abonos, clientes, viviendas]);

    const handleGuardado = useCallback(() => {
        cargarDatos();
    }, [cargarDatos]);

    const confirmarEliminar = async () => {
        if (!abonoAEliminar) return;
        try {
            await deleteAbono(abonoAEliminar.id);
            toast.success("Abono eliminado correctamente.");
            cargarDatos();
        } catch (error) {
            toast.error("No se pudo eliminar el abono.");
        } finally {
            setAbonoAEliminar(null);
        }
    };

    if (isLoading) {
        return <div className="text-center p-10 animate-pulse">Cargando abonos...</div>;
    }

    return (
        <AnimatedPage>
            <div className="max-w-7xl mx-auto bg-white p-6 rounded-2xl shadow-2xl mt-10 relative">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                    <div className='text-center md:text-left'>
                        <h2 className="text-4xl font-extrabold text-[#1976d2] uppercase font-poppins">
                            Gestión de Abonos
                        </h2>
                        <p className="text-gray-500 mt-1">Consulta los últimos pagos registrados.</p>
                    </div>
                    <Link to="/abonos/crear" className="mt-4 md:mt-0">
                        <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all">
                            + Registrar Nuevo Abono
                        </button>
                    </Link>
                </div>
                {abonosRecientes.length === 0 ? (
                    <p className="text-center text-gray-500 py-10">No hay abonos registrados todavía.</p>
                ) : (
                    <TablaAbonos
                        abonos={abonosRecientes}
                        onEdit={setAbonoAEditar}
                        onDelete={setAbonoAEliminar}
                    />
                )}
            </div>
            {abonoAEditar && (
                <EditarAbonoModal
                    isOpen={!!abonoAEditar}
                    onClose={() => setAbonoAEditar(null)}
                    onSave={handleGuardado}
                    abonoAEditar={abonoAEditar}
                />
            )}
            {abonoAEliminar && (
                <ModalConfirmacion
                    isOpen={!!abonoAEliminar}
                    onClose={() => setAbonoAEliminar(null)}
                    onConfirm={confirmarEliminar}
                    titulo="¿Eliminar Abono?"
                    mensaje="¿Estás seguro? Esta acción no se puede deshacer."
                />
            )}
        </AnimatedPage>
    );
};

export default ListarAbonos;