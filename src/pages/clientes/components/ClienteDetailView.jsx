import React from 'react';
import { Link } from 'react-router-dom';
import { User, Edit, FileText, BarChart2 } from 'lucide-react';
import TabInfoGeneralCliente from './TabInfoGeneralCliente';
import TabDocumentacionCliente from './TabDocumentacionCliente';
import SeguimientoCliente from './SeguimientoCliente';
import { useData } from '../../../context/DataContext';

const ClienteDetailView = ({ cliente, onEdit }) => {
    const { abonos } = useData();
    const [activeTab, setActiveTab] = React.useState('info');

    if (!cliente) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                <User size={64} className="mb-4" />
                <h3 className="text-xl font-bold">Selecciona un cliente</h3>
                <p>Elige un cliente de la lista de la izquierda para ver sus detalles.</p>
            </div>
        );
    }

    const historialAbonos = abonos.filter(a => a.clienteId === cliente.id && a.estadoProceso === 'activo');

    return (
        <div className="bg-white rounded-2xl shadow-xl border h-full flex flex-col">
            {/* Header del Detalle */}
            <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">{`${cliente.datosCliente.nombres} ${cliente.datosCliente.apellidos}`}</h2>
                <div>
                    <Link to={`/clientes/detalle/${cliente.id}`} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-300 transition-colors mr-2">
                        <FileText size={16} /> Ver Perfil Completo
                    </Link>
                    <button onClick={() => onEdit(cliente)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors">
                        <Edit size={16} /> Editar
                    </button>
                </div>
            </div>

            {/* Pestañas de Navegación */}
            <div className="p-2 border-b">
                <nav className="flex space-x-2">
                    <button onClick={() => setActiveTab('info')} className={`px-4 py-2 rounded-md font-semibold text-sm ${activeTab === 'info' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}>Información General</button>
                    <button onClick={() => setActiveTab('documentos')} className={`px-4 py-2 rounded-md font-semibold text-sm ${activeTab === 'documentos' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}>Documentación</button>
                    <button onClick={() => setActiveTab('seguimiento')} className={`px-4 py-2 rounded-md font-semibold text-sm ${activeTab === 'seguimiento' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}>Seguimiento</button>
                </nav>
            </div>

            {/* Contenido de la Pestaña */}
            <div className="p-6 flex-grow overflow-y-auto">
                {activeTab === 'info' && <TabInfoGeneralCliente cliente={cliente} vivienda={cliente.vivienda} historialAbonos={historialAbonos} />}
                {activeTab === 'documentos' && <TabDocumentacionCliente cliente={cliente} onDatosRecargados={() => { }} />}
                {activeTab === 'seguimiento' && <SeguimientoCliente cliente={cliente} onSave={() => { }} />}
            </div>
        </div>
    );
};

export default ClienteDetailView;