import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import AnimatedPage from '../../components/AnimatedPage';
import { ArrowLeft, Home, Info, BarChart2 } from 'lucide-react';
import TabInformacion from './components/TabInformacion';
import TabFinanciero from './components/TabFinanciero';

const formatCurrency = (value) => (value || 0).toLocaleString("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 });

const DetalleVivienda = () => {
    const { viviendaId } = useParams();
    const navigate = useNavigate();
    const { viviendas, clientes, abonos, isLoading, recargarDatos } = useData();
    const [activeTab, setActiveTab] = useState('info'); // 'info' o 'financiero'

    const datosDetalle = useMemo(() => {
        if (isLoading) return null;
        const vivienda = viviendas.find(v => v.id === viviendaId);
        if (!vivienda) return null;

        const cliente = clientes.find(c => c.id === vivienda.clienteId);
        const historialAbonos = abonos
            .filter(a => a.viviendaId === viviendaId)
            .sort((a, b) => new Date(b.fechaPago) - new Date(a.fechaPago));

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
    if (!datosDetalle) return <div className="text-center p-10 text-red-500">Vivienda no encontrada.</div>;

    const { vivienda, cliente, historialAbonos, fuentes } = datosDetalle;

    const TabButton = ({ tabName, label, icon }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === tabName ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-200'}`}
        >
            {icon}
            {label}
        </button>
    );

    return (
        <AnimatedPage>
            <div className="bg-gray-50 p-6 rounded-2xl shadow-lg">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <Home size={40} className="text-red-500" />
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800">{`Mz. ${vivienda.manzana} - Casa ${vivienda.numeroCasa}`}</h2>
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${vivienda.clienteId ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {vivienda.clienteId ? 'Asignada' : 'Disponible'}
                            </span>
                        </div>
                    </div>
                    <button onClick={() => navigate('/viviendas/listar')} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-300 transition-colors">
                        <ArrowLeft size={16} /> Volver
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center p-4 bg-white rounded-lg border mb-8">
                    <div><p className="text-sm font-semibold text-gray-500">Valor Final Vivienda</p><p className="text-2xl font-bold text-blue-600">{formatCurrency(vivienda.valorFinal)}</p></div>
                    <div><p className="text-sm font-semibold text-gray-500">Total Abonado</p><p className="text-2xl font-bold text-green-600">{formatCurrency(vivienda.totalAbonado)}</p></div>
                    <div><p className="text-sm font-semibold text-gray-500">Saldo Pendiente</p><p className="text-2xl font-bold text-red-600">{formatCurrency(vivienda.saldoPendiente)}</p></div>
                </div>

                <div className="border-b border-gray-200 mb-6">
                    <nav className="flex space-x-2">
                        <TabButton tabName="info" label="Información General" icon={<Info size={16} />} />
                        <TabButton tabName="financiero" label="Resumen Financiero" icon={<BarChart2 size={16} />} />
                    </nav>
                </div>

                <div>
                    {activeTab === 'info' && <TabInformacion vivienda={vivienda} cliente={cliente} />}
                    {activeTab === 'financiero' && <TabFinanciero fuentes={fuentes} historialAbonos={historialAbonos} vivienda={vivienda} cliente={cliente} onAbonoRegistrado={recargarDatos} />}
                </div>
            </div>
        </AnimatedPage>
    );
};

export default DetalleVivienda;