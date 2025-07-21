import React, { useState, useEffect } from 'react'; // Importar useState y useEffect
import { useNavigate, useBlocker } from 'react-router-dom';
import AnimatedPage from '../../components/AnimatedPage';
import { ArrowLeft, Edit, User, FileDown, Info, GitCommit, Briefcase } from 'lucide-react';
import { useDetalleCliente } from '../../hooks/clientes/useDetalleCliente.jsx';
import { getInitials } from '../../utils/textFormatters';
import { generateClientStatementPDF } from '../../utils/pdfGenerator';
import toast from 'react-hot-toast';
import TabInfoGeneralCliente from './components/TabInfoGeneralCliente';
import TabProcesoCliente from './components/TabProcesoCliente';
import TabDocumentacionCliente from './components/TabDocumentacionCliente';
import ModalConfirmacion from '../../components/ModalConfirmacion'; // Importar Modal

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

    // --- INICIO DE LA NUEVA LÓGICA ---
    const [procesoTieneCambios, setProcesoTieneCambios] = useState(false);
    const [navegacionBloqueada, setNavegacionBloqueada] = useState(null);

    // Este blocker SÍ funciona para salir de la página (ej: con el navbar principal)
    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            procesoTieneCambios && currentLocation.pathname !== nextLocation.pathname
    );

    const handleTabClick = (tabName) => {
        // Si hay cambios en la pestaña de proceso y queremos salir de ella, mostramos el modal
        if (procesoTieneCambios && activeTab === 'proceso' && tabName !== 'proceso') {
            setNavegacionBloqueada({ proximaTab: tabName });
        } else {
            setActiveTab(tabName);
        }
    };

    const handleConfirmarSalida = () => {
        if (navegacionBloqueada) {
            setProcesoTieneCambios(false); // Permitimos la salida
            setActiveTab(navegacionBloqueada.proximaTab);
            setNavegacionBloqueada(null);
        } else if (blocker.state === 'blocked') {
            // Esto es para el blocker de react-router
            blocker.proceed();
        }
    };

    const handleCancelarSalida = () => {
        setNavegacionBloqueada(null);
        if (blocker.state === 'blocked') {
            // Esto es para el blocker de react-router
            blocker.reset();
        }
    };

    // Forzamos la recarga de datos si salimos de la página para descartar cambios
    useEffect(() => {
        if (blocker.state === 'blocked' && !procesoTieneCambios) {
            blocker.proceed();
        }
    }, [blocker, procesoTieneCambios]);
    // --- FIN DE LA NUEVA LÓGICA ---

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
                        {/* Ahora los botones llaman a handleTabClick */}
                        <TabButton activeTab={activeTab} tabName="info" label="Información General" icon={<Info size={16} />} onClick={handleTabClick} />
                        <TabButton activeTab={activeTab} tabName="proceso" label="Proceso" icon={<GitCommit size={16} />} onClick={handleTabClick} />
                        <TabButton activeTab={activeTab} tabName="documentos" label="Documentación" icon={<Briefcase size={16} />} onClick={handleTabClick} />
                    </nav>
                </div>

                <div>
                    {activeTab === 'info' && <TabInfoGeneralCliente cliente={cliente} vivienda={vivienda} historialAbonos={historialAbonos} />}
                    {activeTab === 'proceso' && <TabProcesoCliente cliente={cliente} onDatosRecargados={recargarDatos} onHayCambiosChange={setProcesoTieneCambios} />}
                    {activeTab === 'documentos' && <TabDocumentacionCliente cliente={cliente} />}
                </div>
            </div>

            {/* Modal para la navegación interna de pestañas */}
            <ModalConfirmacion
                isOpen={!!navegacionBloqueada}
                onClose={handleCancelarSalida}
                onConfirm={handleConfirmarSalida}
                titulo="Cambios sin Guardar"
                mensaje="Tienes cambios pendientes en el proceso. ¿Estás seguro de que quieres salir sin guardar? Se perderán los cambios."
            />

            {/* Modal para la navegación fuera de la página (react-router) */}
            <ModalConfirmacion
                isOpen={blocker.state === 'blocked'}
                onClose={handleCancelarSalida}
                onConfirm={handleConfirmarSalida}
                titulo="Cambios sin Guardar"
                mensaje="Tienes cambios pendientes en el proceso. ¿Estás seguro de que quieres abandonar la página? Se perderán los cambios."
            />
        </AnimatedPage>
    );
};

export default DetalleCliente;