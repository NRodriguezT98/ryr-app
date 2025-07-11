import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import AnimatedPage from '../../components/AnimatedPage';
import { ArrowLeft, User, Home, Calendar, DollarSign, FileText, CheckCircle, MessageSquare, Download } from 'lucide-react';
import AbonoCard from '../abonos/AbonoCard';
import { formatCurrency } from '../../utils/textFormatters'; // <-- IMPORTAMOS LA FUNCIÓN

const DetalleRenuncia = () => {
    const { renunciaId } = useParams();
    const navigate = useNavigate();
    const { renuncias, clientes, isLoading } = useData();

    const datosDetalle = useMemo(() => {
        if (isLoading) return null;
        const renuncia = renuncias.find(r => r.id === renunciaId);
        if (!renuncia) return null;
        const cliente = clientes.find(c => c.id === renuncia.clienteId);
        const historialAbonos = (renuncia.historialAbonos || []).map(abono => ({
            ...abono,
            clienteInfo: renuncia.clienteNombre,
            clienteStatus: 'renunciado'
        }));
        return { renuncia, cliente, historialAbonos };
    }, [renunciaId, renuncias, clientes, isLoading]);

    if (isLoading) {
        return <div className="text-center p-10 animate-pulse">Cargando detalles de la renuncia...</div>;
    }

    if (!datosDetalle) {
        return <div className="text-center p-10 text-red-500">No se encontró el registro de la renuncia.</div>;
    }

    const { renuncia, cliente, historialAbonos } = datosDetalle;

    return (
        <AnimatedPage>
            <div className="max-w-5xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">Detalle de Renuncia</h2>
                        <p className={`mt-2 font-semibold px-3 py-1 rounded-full inline-block ${renuncia.estadoDevolucion === 'Pendiente' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>
                            {`Estado: ${renuncia.estadoDevolucion}`}
                        </p>
                    </div>
                    <button onClick={() => navigate('/renuncias')} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-300 transition-colors">
                        <ArrowLeft size={16} /> Volver a Renuncias
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-5 rounded-xl border">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><User /> Información del Cliente</h3>
                        <p><strong>Nombre:</strong> {renuncia.clienteNombre}</p>
                        <p><strong>Cédula:</strong> {cliente?.datosCliente?.cedula || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 p-5 rounded-xl border">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Home /> Vivienda Renunciada</h3>
                        <p><strong>Ubicación:</strong> {renuncia.viviendaInfo}</p>
                        <p className="flex items-center gap-2 mt-2"><Calendar size={14} /> {new Date(renuncia.fechaRenuncia).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                </div>

                {renuncia.estadoDevolucion === 'Pagada' && (
                    <div className="mt-8 pt-6 border-t">
                        <h3 className="font-bold text-xl mb-4 flex items-center gap-2 text-green-700"><CheckCircle /> Devolución Completada</h3>
                        <div className="bg-green-50 border border-green-200 p-5 rounded-xl space-y-3 text-sm">
                            <p><strong>Fecha de Devolución:</strong> {renuncia.fechaDevolucion ? new Date(renuncia.fechaDevolucion).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : 'No registrada'}</p>
                            {renuncia.observacionDevolucion && (
                                <p className="flex items-start gap-2">
                                    <strong className='flex-shrink-0'>Observaciones:</strong>
                                    <span className='italic text-gray-700'>"{renuncia.observacionDevolucion}"</span>
                                </p>
                            )}
                            {renuncia.urlComprobanteDevolucion && (
                                <a href={renuncia.urlComprobanteDevolucion} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-semibold text-blue-600 hover:underline">
                                    <Download size={16} /> Ver Comprobante de Devolución
                                </a>
                            )}
                        </div>
                    </div>
                )}

                <div className="mt-8 pt-6 border-t">
                    <h3 className="font-bold text-xl mb-4 flex items-center gap-2"><DollarSign /> Desglose de Devolución</h3>
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-center mb-6">
                        <p className="text-sm text-blue-800 font-semibold">
                            {renuncia.estadoDevolucion === 'Pagada' ? 'Total Devuelto al Cliente' : 'Total a Devolver al Cliente'}
                        </p>
                        <p className="text-3xl font-bold text-blue-700">{formatCurrency(renuncia.totalAbonadoParaDevolucion)}</p>
                    </div>

                    <h4 className="font-semibold mb-4">Abonos Registrados para este Proceso:</h4>
                    {historialAbonos.length > 0 ? (
                        <div className="space-y-4">
                            {historialAbonos.map(abono => <AbonoCard key={abono.id} abono={abono} isReadOnly={true} />)}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 py-6">No se encontraron abonos registrados para este proceso de renuncia.</p>
                    )}
                </div>
            </div>
        </AnimatedPage>
    );
};

export default DetalleRenuncia;