import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import AnimatedPage from '../../components/AnimatedPage';
import { useData } from '../../context/DataContext'; // <-- 1. IMPORTAMOS EL HOOK DE DATOS
import AbonoCard from './AbonoCard'; // <-- 2. IMPORTAMOS LA TARJETA DE ABONO

const ListarAbonos = () => {
    // --- 3. CONSUMIMOS LOS DATOS DIRECTAMENTE DEL CONTEXTO ---
    const { isLoading, abonos, clientes, viviendas } = useData();

    const abonosRecientes = useMemo(() => {
        if (!abonos || !clientes || !viviendas) return [];

        return abonos
            .map(abono => {
                const cliente = clientes.find(c => c.id === abono.clienteId);
                const vivienda = viviendas.find(v => v.id === abono.viviendaId);
                return {
                    ...abono,
                    clienteNombre: cliente?.datosCliente?.nombres || 'N/A',
                    viviendaLabel: vivienda ? `Mz ${vivienda.manzana} - Casa ${vivienda.numeroCasa}` : 'N/A',
                };
            })
            .sort((a, b) => new Date(b.fechaPago) - new Date(a.fechaPago))
            .slice(0, 50); // Mostramos los últimos 50 abonos
    }, [abonos, clientes, viviendas]);


    if (isLoading) {
        return <div className="text-center p-10 animate-pulse">Cargando historial de abonos...</div>;
    }

    return (
        <AnimatedPage>
            <div className="max-w-4xl mx-auto bg-white p-6 rounded-2xl shadow-2xl mt-10 relative">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                    <div className='text-center md:text-left'>
                        <h2 className="text-4xl font-extrabold text-green-600 uppercase font-poppins">
                            Historial de Abonos
                        </h2>
                        <p className="text-gray-500 mt-1">Consulta los últimos pagos registrados en el sistema.</p>
                    </div>
                    <Link to="/abonos" className="mt-4 md:mt-0">
                        <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all">
                            + Gestionar Pagos
                        </button>
                    </Link>
                </div>

                {/* --- 4. RENDERIZAMOS LAS TARJETAS EN LUGAR DE LA TABLA --- */}
                {abonosRecientes.length > 0 ? (
                    <div className="space-y-4">
                        {abonosRecientes.map(abono => (
                            <AbonoCard key={abono.id} abono={abono} />
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 py-10">No hay abonos registrados todavía.</p>
                )}
            </div>

            {/* Los modales de edición y eliminación ya no son necesarios en esta vista de solo lectura */}
        </AnimatedPage>
    );
};

export default ListarAbonos;