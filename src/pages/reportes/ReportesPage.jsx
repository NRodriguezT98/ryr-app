import React, { useState, lazy, Suspense } from 'react';
import AnimatedPage from '../../components/AnimatedPage';
import { BarChart2, FileDown, Inbox, Home, CheckCircle, TrendingUp, Loader2 } from 'lucide-react';
import { useData } from '../../context/DataContext';

// Lazy loading de PDF components (muy pesados)
const PDFDownloadLink = lazy(() => import('@react-pdf/renderer').then(module => ({ default: module.PDFDownloadLink })));
const InventarioGeneralPDF = lazy(() => import('../../components/pdf/reportes/InventarioGeneralPDF'));
const ViviendasDisponiblesPDF = lazy(() => import('../../components/pdf/reportes/ViviendasDisponiblesPDF'));
const CarteraActivaPDF = lazy(() => import('../../components/pdf/reportes/CarteraActivaPDF'));
const ViviendasPagadasPDF = lazy(() => import('../../components/pdf/reportes/ViviendasPagadasPDF'));

const ReportCard = ({ icon, title, description, disabled, children }) => (
    <div className={`bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700 shadow-sm ${disabled ? 'opacity-50' : ''}`}>
        <div className="flex items-center gap-4 mb-3">
            {icon}
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{title}</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 h-10">{description}</p>
        <div className={disabled ? 'cursor-not-allowed' : ''}>
            {children}
        </div>
    </div>
);

const InteractivePdfLink = ({ document, fileName, baseClassName, readyClassName, disabled }) => (
    <PDFDownloadLink document={document} fileName={fileName}>
        {({ loading, url }) => {
            const isReady = !loading && url;
            const isLoadingState = loading;

            let buttonClass = `${baseClassName} ${isReady ? readyClassName : ''}`;
            if (isLoadingState || disabled) {
                buttonClass += ' cursor-wait opacity-70';
            }

            return (
                <div className={`w-full text-center block font-semibold px-5 py-2.5 rounded-lg shadow-sm transition-colors ${buttonClass}`}>
                    <div className="flex items-center justify-center gap-2">
                        {isLoadingState ? <Loader2 size={16} className="animate-spin" /> : (isReady ? <CheckCircle size={16} /> : <FileDown size={16} />)}
                        {isLoadingState ? 'Generando...' : (isReady ? 'Descargar PDF' : 'Generar PDF')}
                    </div>
                </div>
            );
        }}
    </PDFDownloadLink>
);

const ReportesPage = () => {
    const { viviendas, clientes, isLoading } = useData();
    const [reportToGenerate, setReportToGenerate] = useState(null);

    if (isLoading) {
        return <div className="text-center p-10 animate-pulse">Cargando datos para reportes...</div>;
    }

    const viviendasAsignadas = viviendas.filter(v => v.clienteId && v.saldoPendiente > 0);
    const viviendasDisponibles = viviendas.filter(v => !v.clienteId);
    const viviendasPagadas = viviendas.filter(v => v.clienteId && v.saldoPendiente <= 0);

    const GenerateButton = ({ reportKey, className }) => (
        <button
            onClick={() => setReportToGenerate(reportKey)}
            className={`w-full text-center block font-semibold px-5 py-2.5 rounded-lg shadow-sm transition-colors ${className}`}
        >
            <div className="flex items-center justify-center gap-2">
                <FileDown size={16} />
                Generar PDF
            </div>
        </button>
    );

    return (
        <AnimatedPage>
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <BarChart2 size={40} className="text-blue-600" />
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Reportes y Analíticas</h1>
                        <p className="text-gray-500 dark:text-gray-400">Genera documentos PDF con resúmenes clave sobre el estado de tu negocio.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ReportCard
                        icon={<Inbox size={24} className="text-blue-500" />}
                        title="Reporte General de Inventario"
                        description="Un resumen completo de todas las propiedades, su estado y valor total del inventario."
                    >
                        {reportToGenerate === 'inventarioGeneral' ? (
                            <Suspense fallback={
                                <div className="w-full text-center block font-semibold px-5 py-2.5 rounded-lg shadow-sm bg-blue-600 text-white opacity-70">
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 size={16} className="animate-spin" />
                                        Cargando generador...
                                    </div>
                                </div>
                            }>
                                <InteractivePdfLink
                                    document={<InventarioGeneralPDF viviendas={viviendas} />}
                                    fileName="Reporte_General_Inventario.pdf"
                                    baseClassName="bg-blue-600 text-white hover:bg-blue-700"
                                    readyClassName="bg-green-600 hover:bg-green-700"
                                />
                            </Suspense>
                        ) : (
                            <GenerateButton reportKey="inventarioGeneral" className="bg-blue-600 text-white hover:bg-blue-700" />
                        )}
                    </ReportCard>

                    <ReportCard
                        icon={<Home size={24} className="text-yellow-500" />}
                        title="Reporte de Viviendas Disponibles"
                        description="Una lista detallada de todas las viviendas que actualmente se encuentran disponibles para la venta."
                        disabled={viviendasDisponibles.length === 0}
                    >
                        {reportToGenerate === 'viviendasDisponibles' ? (
                            <Suspense fallback={
                                <div className="w-full text-center block font-semibold px-5 py-2.5 rounded-lg shadow-sm bg-yellow-500 text-white opacity-70">
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 size={16} className="animate-spin" />
                                        Cargando generador...
                                    </div>
                                </div>
                            }>
                                <InteractivePdfLink
                                    document={<ViviendasDisponiblesPDF viviendas={viviendasDisponibles} />}
                                    fileName="Reporte_Viviendas_Disponibles.pdf"
                                    baseClassName="bg-yellow-500 text-white hover:bg-yellow-600"
                                    readyClassName="bg-green-600 hover:bg-green-700"
                                    disabled={viviendasDisponibles.length === 0}
                                />
                            </Suspense>
                        ) : (
                            <GenerateButton reportKey="viviendasDisponibles" className="bg-yellow-500 text-white hover:bg-yellow-600" />
                        )}
                    </ReportCard>

                    <ReportCard
                        icon={<TrendingUp size={24} className="text-red-500" />}
                        title="Reporte de Cartera Activa"
                        description="Un desglose de las viviendas asignadas, mostrando el saldo pendiente de cada cliente."
                        disabled={viviendasAsignadas.length === 0}
                    >
                        {reportToGenerate === 'carteraActiva' ? (
                            <Suspense fallback={
                                <div className="w-full text-center block font-semibold px-5 py-2.5 rounded-lg shadow-sm bg-red-500 text-white opacity-70">
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 size={16} className="animate-spin" />
                                        Cargando generador...
                                    </div>
                                </div>
                            }>
                                <InteractivePdfLink
                                    document={<CarteraActivaPDF viviendasAsignadas={viviendasAsignadas} clientes={clientes} />}
                                    fileName="Reporte_Cartera_Activa.pdf"
                                    baseClassName="bg-red-500 text-white hover:bg-red-600"
                                    readyClassName="bg-green-600 hover:bg-green-700"
                                    disabled={viviendasAsignadas.length === 0}
                                />
                            </Suspense>
                        ) : (
                            <GenerateButton reportKey="carteraActiva" className="bg-red-500 text-white hover:bg-red-600" />
                        )}
                    </ReportCard>

                    <ReportCard
                        icon={<CheckCircle size={24} className="text-green-500" />}
                        title="Reporte de Viviendas Pagadas"
                        description="Una lista de todas las propiedades que ya han sido pagadas en su totalidad por los clientes."
                        disabled={viviendasPagadas.length === 0}
                    >
                        {reportToGenerate === 'viviendasPagadas' ? (
                            <Suspense fallback={
                                <div className="w-full text-center block font-semibold px-5 py-2.5 rounded-lg shadow-sm bg-green-600 text-white opacity-70">
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 size={16} className="animate-spin" />
                                        Cargando generador...
                                    </div>
                                </div>
                            }>
                                <InteractivePdfLink
                                    document={<ViviendasPagadasPDF viviendasPagadas={viviendasPagadas} clientes={clientes} />}
                                    fileName="Reporte_Viviendas_Pagadas.pdf"
                                    baseClassName="bg-green-600 text-white hover:bg-green-700"
                                    readyClassName="bg-green-600 hover:bg-green-700"
                                    disabled={viviendasPagadas.length === 0}
                                />
                            </Suspense>
                        ) : (
                            <GenerateButton reportKey="viviendasPagadas" className="bg-green-600 text-white hover:bg-green-700" />
                        )}
                    </ReportCard>
                </div>
            </div>
        </AnimatedPage>
    );
};

export default ReportesPage;