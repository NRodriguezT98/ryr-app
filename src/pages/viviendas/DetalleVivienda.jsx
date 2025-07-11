import React, { useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import AnimatedPage from '../../components/AnimatedPage';
import { ArrowLeft, Home, Info, BarChart2, User, FileText, Compass, Download, CheckCircle, MessageSquare, DollarSign, ClipboardList } from 'lucide-react';
import FuenteDePagoCard from '../abonos/FuenteDePagoCard';
import AbonoCard from '../abonos/AbonoCard';
import { formatCurrency } from '../../utils/textFormatters'; // <-- IMPORTAMOS LA FUNCIÓN

const LinderoItem = ({ label, value }) => (
    <div>
        <p className="text-xs font-semibold text-gray-500">{label}</p>
        <p className="text-sm text-gray-800">{value || 'N/A'}</p>
    </div>
);

const StatCard = ({ title, value, colorClass }) => (
    <div className="bg-white p-4 rounded-lg border">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
    </div>
);

const DetalleVivienda = () => {
    const { viviendaId } = useParams();
    const navigate = useNavigate();
    const { viviendas, clientes, abonos, isLoading, recargarDatos } = useData();
    const [activeTab, setActiveTab] = useState('info');

    const datosDetalle = useMemo(() => {
        if (isLoading) return null;
        const vivienda = viviendas.find(v => v.id === viviendaId);
        if (!vivienda) return null;

        const cliente = clientes.find(c => c.id === vivienda.clienteId);
        const historialAbonos = abonos
            .filter(a => a.viviendaId === viviendaId)
            .sort((a, b) => new Date(b.fechaPago) - new Date(a.fechaPago))
            .map(abono => ({
                ...abono,
                clienteInfo: cliente?.datosCliente ? `${cliente.datosCliente.nombres} ${cliente.datosCliente.apellidos}` : 'N/A',
                clienteStatus: cliente?.status || 'activo'
            }));

        let fuentes = [];
        if (cliente && cliente.financiero) {
            const { financiero } = cliente;
            if (financiero.aplicaCuotaInicial) fuentes.push({ titulo: "Cuota Inicial", fuente: "cuotaInicial", montoPactado: financiero.cuotaInicial.monto, abonos: historialAbonos.filter(a => a.fuente === 'cuotaInicial') });
            if (financiero.aplicaCredito) fuentes.push({ titulo: "Crédito Hipotecario", fuente: "credito", montoPactado: financiero.credito.monto, abonos: historialAbonos.filter(a => a.fuente === 'credito') });
            if (financiero.aplicaSubsidioVivienda) fuentes.push({ titulo: "Subsidio Mi Casa Ya", fuente: "subsidioVivienda", montoPactado: financiero.subsidioVivienda.monto, abonos: historialAbonos.filter(a => a.fuente === 'subsidioVivienda') });
            if (financiero.aplicaSubsidioCaja) fuentes.push({ titulo: `Subsidio Caja (${financiero.subsidioCaja.caja})`, fuente: "subsidioCaja", montoPactado: financiero.subsidioCaja.monto, abonos: historialAbonos.filter(a => a.fuente === 'subsidioCaja') });
            if (financiero.gastosNotariales) fuentes.push({ titulo: "Gastos Notariales", fuente: "gastosNotariales", montoPactado: financiero.gastosNotariales.monto, abonos: historialAbonos.filter(a => a.fuente === 'gastosNotariales') });
        }

        return { vivienda, cliente, historialAbonos, fuentes };
    }, [viviendaId, viviendas, clientes, abonos, isLoading]);

    if (isLoading) return <div className="text-center p-10 animate-pulse">Cargando detalles de la vivienda...</div>;
    if (!datosDetalle) {
        navigate('/viviendas/listar');
        return null;
    }

    const { vivienda, cliente, historialAbonos, fuentes } = datosDetalle;

    const TabButton = ({ tabName, label, icon }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === tabName ? 'bg-red-500 text-white' : 'text-gray-600 hover:bg-gray-200'}`}
        >
            {icon}
            {label}
        </button>
    );

    return (
        <AnimatedPage>
            <div className="bg-gray-50 p-6 rounded-2xl shadow-lg">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                        <Home size={40} className="text-red-500 flex-shrink-0" />
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800">{`Mz. ${vivienda.manzana} - Casa ${vivienda.numeroCasa}`}</h2>
                            {cliente ? (
                                <Link to={`/clientes/detalle/${cliente.id}`} className="flex items-center gap-2 text-blue-600 font-semibold hover:underline mt-1">
                                    <User size={16} />
                                    <span>{`${cliente.datosCliente.nombres} ${cliente.datosCliente.apellidos}`}</span>
                                </Link>
                            ) : (
                                <span className={`mt-1 inline-block px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800`}>
                                    Disponible
                                </span>
                            )}
                        </div>
                    </div>
                    <button onClick={() => navigate('/viviendas/listar')} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-300 transition-colors flex-shrink-0">
                        <ArrowLeft size={16} /> Volver a la Lista
                    </button>
                </div>

                <div className="border-b border-gray-200 mb-6">
                    <nav className="flex space-x-2">
                        <TabButton tabName="info" label="Información General" icon={<Info size={16} />} />
                        <TabButton tabName="financiero" label="Resumen Financiero" icon={<BarChart2 size={16} />} />
                    </nav>
                </div>

                <div>
                    {activeTab === 'info' && (
                        <AnimatedPage>
                            <div className="space-y-6">
                                <div className="bg-white p-6 rounded-xl border">
                                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><ClipboardList /> Ficha Técnica de la Propiedad</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                                        <p><strong>Matrícula:</strong> {vivienda.matricula}</p>
                                        <p><strong>Nomenclatura:</strong> {vivienda.nomenclatura}</p>
                                    </div>
                                    <div className='pt-4 mt-4 border-t'>
                                        <h4 className='font-semibold text-md mt-2 mb-4 flex items-center gap-2'><Compass /> Linderos</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <LinderoItem label="Norte" value={vivienda.linderoNorte} />
                                            <LinderoItem label="Sur" value={vivienda.linderoSur} />
                                            <LinderoItem label="Oriente" value={vivienda.linderoOriente} />
                                            <LinderoItem label="Occidente" value={vivienda.linderoOccidente} />
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-xl border">
                                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><FileText /> Documentación</h3>
                                    {vivienda.urlCertificadoTradicion ? (
                                        <a href={vivienda.urlCertificadoTradicion} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-semibold text-blue-600 hover:underline">
                                            <Download size={16} /> Ver Certificado de Tradición
                                        </a>
                                    ) : (
                                        <p className="text-sm text-gray-500">No se ha adjuntado el Certificado de Tradición.</p>
                                    )}
                                </div>
                            </div>
                        </AnimatedPage>
                    )}
                    {activeTab === 'financiero' && (
                        <AnimatedPage>
                            <div className='space-y-8'>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                                    <StatCard title="Valor Final" value={formatCurrency(vivienda.valorFinal)} colorClass="text-blue-600" />
                                    <StatCard title="Total Abonado" value={formatCurrency(vivienda.totalAbonado)} colorClass="text-green-600" />
                                    <StatCard title="Saldo Pendiente" value={formatCurrency(vivienda.saldoPendiente)} colorClass="text-red-600" />
                                </div>
                                <div className="pt-6 border-t">
                                    <h3 className="text-xl font-bold text-gray-800 mb-4">Seguimiento por Fuente de Pago</h3>
                                    {fuentes.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {fuentes.map(fuente => (<FuenteDePagoCard key={fuente.fuente} {...fuente} vivienda={vivienda} onAbonoRegistrado={recargarDatos} />))}
                                        </div>
                                    ) : (<div className="bg-white p-6 rounded-xl border text-center text-gray-500">Esta vivienda no tiene un cliente con estructura financiera asignada.</div>)}
                                </div>
                                <div className="mt-6 pt-6 border-t">
                                    <h3 className="text-xl font-bold text-gray-800 mb-4">Historial de Abonos Realizados</h3>
                                    {historialAbonos.length > 0 ? (
                                        <div className="space-y-4">{historialAbonos.map(abono => <AbonoCard key={abono.id} abono={abono} isReadOnly={true} />)}</div>
                                    ) : (<div className="bg-white p-6 rounded-xl border text-center text-gray-500">No se han registrado abonos para esta vivienda.</div>)}
                                </div>
                            </div>
                        </AnimatedPage>
                    )}
                </div>
            </div>
        </AnimatedPage>
    );
};

export default DetalleVivienda;