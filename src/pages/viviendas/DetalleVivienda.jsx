import React from 'react';
import { Link } from 'react-router-dom';
import AnimatedPage from '../../components/AnimatedPage';
import { ArrowLeft, Home, Info, BarChart2, User, Star, Tag } from 'lucide-react';
import { useDetalleVivienda } from '../../hooks/viviendas/useDetalleVivienda.jsx';
import { toTitleCase } from '../../utils/textFormatters';
import TabInformacion from './components/TabInformacion';
import TabFinanciero from './components/TabFinanciero';
import Button from '../../components/Button';

const TabButton = ({ tabName, label, icon, activeTab, onClick }) => (
    <button
        onClick={() => onClick(tabName)}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full transition-colors ${activeTab === tabName ? 'bg-red-500 text-white' : 'text-gray-600 hover:bg-gray-200'}`}
    >
        {icon}
        {label}
    </button>
);

const DetalleVivienda = () => {
    const { isLoading, datosDetalle, activeTab, setActiveTab, recargarDatos, navigate } = useDetalleVivienda();

    if (isLoading || !datosDetalle) {
        return <div className="text-center p-10 animate-pulse">Cargando detalles de la vivienda...</div>;
    }

    const { vivienda, cliente } = datosDetalle;

    return (
        <AnimatedPage>
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-lg border flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Home size={40} className="text-red-500" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">{`Mz. ${vivienda.manzana} - Casa ${vivienda.numeroCasa}`}</h1>
                            <div className="flex items-center gap-2 mt-1">
                                {vivienda.recargoEsquinera > 0 ? (
                                    <span className="flex items-center gap-1.5 text-xs font-semibold text-purple-800 bg-purple-100 px-2 py-1 rounded-full"><Star size={14} />Casa Esquinera</span>
                                ) : (
                                    <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded-full"><Home size={14} />Casa Medianera</span>
                                )}
                                <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-full ${cliente ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    <Tag size={14} />
                                    {cliente ? 'Asignada' : 'Disponible'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="secondary" onClick={() => navigate('/viviendas/listar')} icon={<ArrowLeft size={16} />}>
                            Volver a la Lista
                        </Button>
                    </div>
                </div>

                <div className="bg-white p-2 rounded-xl shadow-sm border">
                    <nav className="flex space-x-2">
                        <TabButton tabName="info" label="Información General" icon={<Info size={16} />} activeTab={activeTab} onClick={setActiveTab} />
                        {cliente && (
                            <TabButton tabName="financiero" label="Resumen Financiero" icon={<BarChart2 size={16} />} activeTab={activeTab} onClick={setActiveTab} />
                        )}
                    </nav>
                </div>

                <div className="mt-4">
                    {activeTab === 'info' && <TabInformacion vivienda={vivienda} cliente={cliente} />}
                    {activeTab === 'financiero' && cliente && <TabFinanciero datosDetalle={datosDetalle} recargarDatos={recargarDatos} />}
                </div>
            </div>
        </AnimatedPage>
    );
};

export default DetalleVivienda;