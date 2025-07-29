import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import AnimatedPage from '../../components/AnimatedPage';
import { ArrowLeft, User, Home, Calendar, DollarSign, CheckCircle, Download, FileX, Briefcase, FileText, MinusCircle } from 'lucide-react';
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
        let clienteEncontrado = null;
        if (renuncia.clienteId) {
            clienteEncontrado = clientes.find(c => c.id === renuncia.clienteId);
        }
        if (!clienteEncontrado && renuncia.clienteNombre) {
            const nombreNormalizado = renuncia.clienteNombre.trim().toLowerCase();
            clienteEncontrado = clientes.find(c =>
                `${c.datosCliente.nombres} ${c.datosCliente.apellidos}`.trim().toLowerCase() === nombreNormalizado
            );
        }
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
    const conPenalidad = renuncia.penalidadMonto > 0;

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
                                    {renuncia.observacionDevolucion && (<p className="flex items-start gap-2 dark:text-gray-300"><strong className='flex-shrink-0'>Observaciones:</strong><span className='italic text-gray-700 dark:text-gray-300'>"{renuncia.observacionDevolucion}"</span></p>)}
                                    {renuncia.urlComprobanteDevolucion && (<a href={renuncia.urlComprobanteDevolucion} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-semibold text-blue-600 dark:text-blue-400 hover:underline"><Download size={16} /> Ver Comprobante de Devolución</a>)}
                                </>
                            )}
                        </div>
                    </div>
                )}

                <div className="mt-8 pt-6 border-t dark:border-gray-700">
                    <h3 className="font-bold text-xl mb-4 flex items-center gap-2 dark:text-gray-100"><DollarSign /> Desglose Financiero</h3>
                    <div className="bg-gray-50 dark:bg-gray-700/50 border dark:border-gray-700 p-4 rounded-lg space-y-2 mb-6">
                        <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Total Abonado Original:</span><span className="font-medium dark:text-gray-200">{formatCurrency(renuncia.totalAbonadoOriginal)}</span></div>
                        {conPenalidad && (
                            <div className="flex justify-between items-start">
                                <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2"><MinusCircle size={14} /> Penalidad:</span>
                                <div className="text-right">
                                    <span className="font-medium text-red-500 dark:text-red-400">- {formatCurrency(renuncia.penalidadMonto)}</span>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 italic">({renuncia.penalidadMotivo})</p>
                                </div>
                            </div>
                        )}
                        <div className="flex justify-between font-bold text-lg pt-2 border-t dark:border-gray-600 mt-2">
                            <span className='dark:text-gray-200'>{isCerrada ? 'Total Devuelto' : 'Total a Devolver'}:</span>
                            <span className="text-green-600 dark:text-green-400">{formatCurrency(renuncia.totalAbonadoParaDevolucion)}</span>
                        </div>
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

                <div className="mt-8 pt-6 border-t dark:border-gray-700">
                    <h3 className="font-bold text-xl mb-4 flex items-center gap-2 dark:text-gray-100"><Briefcase /> Documentos Archivados del Proceso</h3>
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-5 rounded-xl border dark:border-gray-700">
                        {renuncia.documentosArchivados && renuncia.documentosArchivados.length > 0 ? (
                            <ul className="space-y-2">
                                {renuncia.documentosArchivados.map((doc, index) => (
                                    <li key={index} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                                        <span className="flex items-center gap-2 text-sm dark:text-gray-300">
                                            <FileText size={16} className="text-gray-400" />
                                            {doc.label}
                                        </span>
                                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">Ver</a>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-center text-sm text-gray-500 dark:text-gray-400">No se archivaron documentos para este proceso de renuncia.</p>
                        )}
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
};

export default DetalleRenuncia;