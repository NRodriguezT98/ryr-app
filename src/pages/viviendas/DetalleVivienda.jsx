import React from 'react';
import { Link } from 'react-router-dom';
import AnimatedPage from '../../components/AnimatedPage';
import { ArrowLeft, Home, Info, Wallet } from 'lucide-react';
import { useDetalleVivienda } from '../../hooks/viviendas/useDetalleVivienda';
import { formatCurrency, formatID, toTitleCase } from '../../utils/textFormatters';
import TabInformacion from './components/TabInformacion';
import TabFinanciero from './components/TabFinanciero';
import CondonarSaldoModal from './CondonarSaldoModal';

const DetalleVivienda = () => {
    const {
        isLoading,
        datosDetalle,
        activeTab,
        setActiveTab,
        recargarDatos,
        navigate,
        fuenteACondonar,
        setFuenteACondonar,
        handleGuardado
    } = useDetalleVivienda();

    if (isLoading) {
        return <div className="text-center p-10 animate-pulse">Cargando detalles de la vivienda...</div>;
    }

    const { vivienda, cliente, historialAbonos, fuentes, desgloseValorVivienda, desgloseTotalAbonado } = datosDetalle;

    return (
        <AnimatedPage>
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-lg bg-red-500 text-white flex items-center justify-center flex-shrink-0">
                            <Home size={32} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{`Vivienda ${vivienda.manzana}${vivienda.numeroCasa}`}</h2>
                            <p className="text-gray-500 dark:text-gray-400">{vivienda.nomenclatura}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={() => navigate('/viviendas/listar')} className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                            <ArrowLeft size={16} /> Volver
                        </button>
                    </div>
                </div>

                {cliente && (
                    <div className="mb-6 bg-white dark:bg-gray-900/50 p-4 rounded-xl border dark:border-gray-700">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Actualmente asignada a:</p>
                        <Link to={`/clientes/detalle/${cliente.id}`} className="font-bold text-lg text-blue-600 dark:text-blue-400 hover:underline">
                            {toTitleCase(cliente.datosCliente.nombres)} {toTitleCase(cliente.datosCliente.apellidos)}
                        </Link>
                        <p className="text-xs text-gray-500">C.C. {formatID(cliente.datosCliente.cedula)}</p>
                    </div>
                )}

                <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                    <nav className="flex space-x-2">
                        <button onClick={() => setActiveTab('info')} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'info' ? 'bg-red-500 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                            <Info size={16} /> Información General
                        </button>
                        <button onClick={() => setActiveTab('financiero')} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'financiero' ? 'bg-red-500 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`} disabled={!cliente}>
                            <Wallet size={16} /> Resumen Financiero
                        </button>
                    </nav>
                </div>

                <div>
                    {activeTab === 'info' && <TabInformacion vivienda={vivienda} desglose={desgloseValorVivienda} />}
                    {activeTab === 'financiero' && (
                        <TabFinanciero
                            vivienda={vivienda}
                            cliente={cliente}
                            fuentes={fuentes}
                            historialAbonos={historialAbonos}
                            onAbonoRegistrado={recargarDatos}
                            onCondonarSaldo={setFuenteACondonar}
                        />
                    )}
                </div>
            </div>

            {fuenteACondonar && (
                <CondonarSaldoModal
                    isOpen={!!fuenteACondonar}
                    onClose={() => setFuenteACondonar(null)}
                    onSave={handleGuardado}
                    fuenteData={fuenteACondonar}
                />
            )}
        </AnimatedPage>
    );
};

export default DetalleVivienda;