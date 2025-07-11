import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, User, Home } from 'lucide-react'; // <-- User y Home añadidos
import { useClienteFinanciero } from '../../hooks/useClienteFinanciero';
import { useData } from '../../context/DataContext';
import { formatCurrency, formatID } from '../../utils/textFormatters'; // <-- formatID añadido
import FuenteDePagoCard from './FuenteDePagoCard';
import AbonoCard from './AbonoCard';
import AnimatedPage from '../../components/AnimatedPage';

const GestionarAbonos = () => {
    const { clienteId } = useParams();
    const navigate = useNavigate();
    const { recargarDatos } = useData();
    const { isLoading, data } = useClienteFinanciero(clienteId);

    if (isLoading) {
        return <div className="text-center p-10 animate-pulse">Cargando datos financieros...</div>;
    }

    if (!data) {
        return (
            <div className="text-center p-10">
                <p className="text-red-500">No se encontraron datos para este cliente.</p>
                <button onClick={() => navigate('/abonos')} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg">
                    Volver a la búsqueda
                </button>
            </div>
        );
    }

    const { cliente, vivienda, historial, fuentes } = data;

    return (
        <AnimatedPage>
            <div className="max-w-5xl mx-auto bg-white p-6 rounded-2xl shadow-lg border">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">Gestión de Pagos</h2>
                        <Link to={`/clientes/detalle/${cliente.id}`} className="text-xl text-blue-600 hover:underline font-semibold">
                            {cliente.datosCliente.nombres} {cliente.datosCliente.apellidos}
                        </Link>
                        {/* --- MEJORA AÑADIDA AQUÍ --- */}
                        <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-sm text-gray-500">
                            <p className="flex items-center gap-2">
                                <User size={14} />
                                <span>C.C. {formatID(cliente.datosCliente.cedula)}</span>
                            </p>
                            <p className="flex items-center gap-2">
                                <Home size={14} />
                                <span>{`Vivienda: Mz. ${vivienda.manzana} - Casa ${vivienda.numeroCasa}`}</span>
                            </p>
                        </div>
                        {/* --- FIN DE LA MEJORA --- */}
                    </div>
                    <button onClick={() => navigate('/abonos')} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-300 transition-colors self-start">
                        <ArrowLeft size={16} /> Volver
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center p-4 bg-gray-50 rounded-lg border mb-8">
                    <div><p className="text-sm font-semibold text-gray-500">Valor Final Vivienda</p><p className="text-lg font-bold text-blue-600">{formatCurrency(vivienda.valorFinal)}</p></div>
                    <div><p className="text-sm font-semibold text-gray-500">Total Abonado</p><p className="text-lg font-bold text-green-600">{formatCurrency(vivienda.totalAbonado)}</p></div>
                    <div><p className="text-sm font-semibold text-gray-500">Saldo Pendiente</p><p className="text-lg font-bold text-red-600">{formatCurrency(vivienda.saldoPendiente)}</p></div>
                </div>

                <h3 className="text-xl font-bold mb-4 text-gray-800">Fuentes de Pago</h3>
                {fuentes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {fuentes.map(fuente => (
                            <FuenteDePagoCard
                                key={fuente.fuente}
                                {...fuente}
                                vivienda={vivienda}
                                cliente={cliente}
                                onAbonoRegistrado={recargarDatos}
                            />
                        ))}
                    </div>
                ) : <p className="text-center text-gray-500 py-4">Este cliente no tiene una estructura financiera definida.</p>}

                <div className="mt-12 pt-6 border-t">
                    <h3 className="text-xl font-bold mb-4 text-gray-800">Historial de Abonos Recientes</h3>
                    {historial.length > 0 ? (
                        <div className="space-y-4">
                            {historial.map(abono => <AbonoCard key={abono.id} abono={abono} isReadOnly={true} />)}
                        </div>
                    ) : <p className="text-center text-gray-500 py-4">No hay abonos registrados para este cliente.</p>}
                </div>
            </div>
        </AnimatedPage>
    );
};

export default GestionarAbonos;