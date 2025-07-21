import React from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedPage from '../../components/AnimatedPage';
import { ArrowLeft, Edit, User, FileDown, Info, GitCommit, Briefcase } from 'lucide-react';
import { useDetalleCliente } from '../../hooks/clientes/useDetalleCliente.jsx';
import { getInitials } from '../../utils/textFormatters';
import { generateClientStatementPDF } from '../../utils/pdfGenerator';
import toast from 'react-hot-toast';
import TabInfoGeneralCliente from './components/TabInfoGeneralCliente';
import TabProcesoCliente from './components/TabProcesoCliente';
import TabDocumentacionCliente from './components/TabDocumentacionCliente'; // <-- 1. Importamos el nuevo componente

const TabButton = ({ activeTab, tabName, label, icon, onClick }) => (
    <button
        onClick={() => onClick(tabName)}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === tabName ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-200'}`}
    >
        {icon}
        {label}
    </button>
);

const DetalleCliente = () => {
    const { isLoading, data: datosDetalle, activeTab, setActiveTab, recargarDatos, navigate } = useDetalleCliente();

    if (isLoading || !datosDetalle) {
        return <div className="text-center p-10 animate-pulse">Cargando perfil del cliente...</div>;
    }

    const { cliente, vivienda, historialAbonos } = datosDetalle;

    const handleGeneratePdf = () => {
        if (cliente && vivienda) {
            generateClientStatementPDF(cliente, vivienda, historialAbonos);
        } else {
            toast.error("No se puede generar el reporte. El cliente no tiene una vivienda asignada.");
        }
    };

    return (
        <AnimatedPage>
            <div className="bg-gray-50 p-6 rounded-2xl shadow-lg">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-3xl flex-shrink-0">
                            {getInitials(cliente.datosCliente.nombres, cliente.datosCliente.apellidos)}
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800">{`${cliente.datosCliente.nombres} ${cliente.datosCliente.apellidos}`}</h2>
                            <p className="text-gray-500">{cliente.datosCliente.correo}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={() => navigate('/clientes/listar')} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-300 transition-colors">
                            <ArrowLeft size={16} /> Volver
                        </button>
                        <button onClick={handleGeneratePdf} className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-600 transition-colors" disabled={!vivienda}>
                            <FileDown size={16} /> PDF
                        </button>
                    </div>
                </div>

                <div className="border-b border-gray-200 mb-6">
                    <nav className="flex space-x-2">
                        <TabButton activeTab={activeTab} tabName="info" label="Información General" icon={<Info size={16} />} onClick={setActiveTab} />
                        <TabButton activeTab={activeTab} tabName="proceso" label="Proceso" icon={<GitCommit size={16} />} onClick={setActiveTab} />
                        {/* --- 2. AÑADIMOS LA PESTAÑA DE DOCUMENTACIÓN --- */}
                        <TabButton activeTab={activeTab} tabName="documentos" label="Documentación" icon={<Briefcase size={16} />} onClick={setActiveTab} />
                    </nav>
                </div>

                <div>
                    {activeTab === 'info' && <TabInfoGeneralCliente cliente={cliente} vivienda={vivienda} historialAbonos={historialAbonos} />}
                    {activeTab === 'proceso' && <TabProcesoCliente cliente={cliente} onDatosRecargados={recargarDatos} />}
                    {/* --- 3. RENDERIZAMOS EL NUEVO COMPONENTE --- */}
                    {activeTab === 'documentos' && <TabDocumentacionCliente cliente={cliente} />}
                </div>
            </div>
        </AnimatedPage>
    );
};

export default DetalleCliente;