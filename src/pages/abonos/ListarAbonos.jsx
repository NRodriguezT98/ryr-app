import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import AnimatedPage from '../../components/AnimatedPage';
import { useData } from '../../context/DataContext';
import AbonoCard from './AbonoCard';

const ListarAbonos = () => {
    const { isLoading, abonos, clientes, viviendas } = useData();

    const abonosRecientes = useMemo(() => {
        if (!abonos || !clientes || !viviendas) return [];

        return abonos
            .map(abono => {
                const cliente = clientes.find(c => c.id === abono.clienteId);
                const vivienda = viviendas.find(v => v.id === abono.viviendaId);

                // --- LÓGICA MEJORADA AQUÍ ---
                // Ahora construimos la etiqueta con el nombre completo del cliente.
                const clienteInfo = cliente && vivienda
                    ? `${vivienda.manzana}${vivienda.numeroCasa} - ${cliente.datosCliente.nombres.toUpperCase()} ${cliente.datosCliente.apellidos.toUpperCase()}`
                    : 'Información no disponible';

                return {
                    ...abono,
                    clienteInfo: clienteInfo,
                };
            })
            .sort((a, b) => new Date(b.fechaPago) - new Date(a.fechaPago))
            .slice(0, 50);
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
        </AnimatedPage>
    );
};

export default ListarAbonos;