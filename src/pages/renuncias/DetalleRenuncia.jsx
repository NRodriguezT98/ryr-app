import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import AnimatedPage from '../../components/AnimatedPage';
import { ArrowLeft, User, Home, Calendar, DollarSign, CheckCircle, Download, FileX } from 'lucide-react';
import AbonoCard from '../abonos/AbonoCard';
import { formatCurrency, formatDisplayDate } from '../../utils/textFormatters';

const DetalleRenuncia = () => {
    const { renunciaId } = useParams();
    const navigate = useNavigate();
    const { renuncias, clientes, isLoading } = useData();

    const datosDetalle = useMemo(() => {
        if (isLoading) return null;
        const renuncia = renuncias.find(r => r.id === renunciaId);
        if (!renuncia) return null;

        // --- INICIO DE LA CORRECCIÓN DEFINITIVA ---
        // Lógica de búsqueda de cliente mucho más robusta y a prueba de fallos.
        let clienteEncontrado = null;

        // 1. Intento principal: Buscar por el ID guardado en la renuncia.
        if (renuncia.clienteId) {
            clienteEncontrado = clientes.find(c => c.id === renuncia.clienteId);
        }

        // 2. Fallback: Si no se encuentra por ID (caso de datos antiguos), buscar por nombre completo.
        if (!clienteEncontrado && renuncia.clienteNombre) {
            const nombreNormalizado = renuncia.clienteNombre.trim().toLowerCase();
            clienteEncontrado = clientes.find(c =>
                `${c.datosCliente.nombres} ${c.datosCliente.apellidos}`.trim().toLowerCase() === nombreNormalizado
            );
        }
        // --- FIN DE LA CORRECCIÓN DEFINITIVA ---

        const historialAbonos = (renuncia.historialAbonos || []).map(abono => ({
            ...abono,
            clienteInfo: renuncia.clienteNombre,
            clienteStatus: 'renunciado'
        }));

        return { renuncia, cliente: clienteEncontrado, historialAbonos };
    }, [renunciaId, renuncias, clientes, isLoading]);

    if (isLoading) {
        return <div className="text-center p-10 animate-pulse">Cargando detalles de la renuncia...</div>;
    }

    if (!datosDetalle) {
        return <div className="text-center p-10 text-red-500">No se encontró el registro de la renuncia.</div>;
    }

    const { renuncia, cliente, historialAbonos } = datosDetalle;
    const isCerrada = renuncia.estadoDevolucion === 'Cerrada' || renuncia.estadoDevolucion === 'Pagada';
    const sinAbonosOriginales = renuncia.totalAbonadoOriginal === 0;

    return (
        <AnimatedPage>
            <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Detalle de Renuncia</h2>
                        <p className={`mt-2 font-semibold px-3 py-1 rounded-full inline-block ${isCerrada ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                            {`Estado: ${isCerrada ? 'Cerrada' : renuncia.estadoDevolucion}`}
                        </p>
                    </div>
                    <button onClick={() => navigate('/renuncias')} className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                        <ArrowLeft size={16} /> Volver a Renuncias
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-5 rounded-xl border dark:border-gray-700">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2 dark:text-gray-200"><User /> Información del Cliente</h3>
                        <p className="dark:text-gray-300"><strong>Nombre:</strong> {renuncia.clienteNombre}</p>
                        <p className="dark:text-gray-300"><strong>Cédula:</strong> {cliente?.datosCliente?.cedula || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-5 rounded-xl border dark:border-gray-700">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2 dark:text-gray-200"><Home /> Vivienda Renunciada</h3>
                        <p className="dark:text-gray-300"><strong>Ubicación:</strong> {renuncia.viviendaInfo}</p>
                        <p className="flex items-center gap-2 mt-2 dark:text-gray-300"><Calendar size={14} /> <strong>Fecha de Renuncia:</strong> {formatDisplayDate(renuncia.fechaRenuncia)}</p>
                    </div>
                </div>

                {isCerrada && (
                    <div className="mt-8 pt-6 border-t dark:border-gray-700">
                        <h3 className="font-bold text-xl mb-4 flex items-center gap-2 text-green-700 dark:text-green-400"><CheckCircle /> Proceso de Renuncia Cerrado</h3>
                        <div className="bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-800 p-5 rounded-xl space-y-3 text-sm">
                            {sinAbonosOriginales ? (
                                <div className="text-center">
                                    <FileX size={24} className="mx-auto text-green-600 dark:text-green-400" />
                                    <p className='dark:text-gray-300 mt-2'>Este proceso se cerró automáticamente ya que no existían abonos que requirieran una devolución de dinero.</p>
                                </div>
                            ) : (
                                <>
                                    <p className='dark:text-gray-300'><strong>Fecha de Cierre (Devolución):</strong> {renuncia.fechaDevolucion ? formatDisplayDate(renuncia.fechaDevolucion) : 'No registrada'}</p>
                                    {renuncia.observacionDevolucion && (
                                        <p className="flex items-start gap-2 dark:text-gray-300">
                                            <strong className='flex-shrink-0'>Observaciones:</strong>
                                            <span className='italic text-gray-700 dark:text-gray-300'>"{renuncia.observacionDevolucion}"</span>
                                        </p>
                                    )}
                                    {renuncia.urlComprobanteDevolucion && (
                                        <a href={renuncia.urlComprobanteDevolucion} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                                            <Download size={16} /> Ver Comprobante de Devolución
                                        </a>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}

                <div className="mt-8 pt-6 border-t dark:border-gray-700">
                    <h3 className="font-bold text-xl mb-4 flex items-center gap-2 dark:text-gray-100"><DollarSign /> Desglose Financiero</h3>
                    <div className="bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800 p-4 rounded-lg text-center mb-6">
                        <p className="text-sm text-blue-800 dark:text-blue-300 font-semibold">
                            {isCerrada ? (sinAbonosOriginales ? 'Total Abonado (Sin devolución)' : 'Total Devuelto al Cliente') : 'Total a Devolver al Cliente'}
                        </p>
                        <p className="text-3xl font-bold text-blue-700 dark:text-blue-400">{formatCurrency(renuncia.totalAbonadoParaDevolucion)}</p>
                    </div>

                    <h4 className="font-semibold mb-4 dark:text-gray-200">Abonos Archivados de este Proceso:</h4>
                    {historialAbonos.length > 0 ? (
                        <div className="space-y-4">
                            {historialAbonos.map(abono => <AbonoCard key={abono.id} abono={abono} isReadOnly={true} />)}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-6">No se encontraron abonos registrados para este proceso de renuncia.</p>
                    )}
                </div>
            </div>
        </AnimatedPage>
    );
};

export default DetalleRenuncia;