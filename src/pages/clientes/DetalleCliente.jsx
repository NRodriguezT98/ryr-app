import { Buffer } from "buffer";
window.Buffer = Buffer;
import React, { useState, useEffect, useMemo } from 'react';
import { useBlocker } from 'react-router-dom';
import AnimatedPage from '../../components/AnimatedPage';
import { ArrowLeft, FileDown, Info, GitCommit } from 'lucide-react';
import { useDetalleCliente } from '../../hooks/clientes/useDetalleCliente.jsx';
import { getInitials } from '../../utils/textFormatters';
import ModalConfirmacion from '../../components/ModalConfirmacion';
import TabInfoGeneralCliente from './components/TabInfoGeneralCliente';
import TabProcesoCliente from './components/TabProcesoCliente';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ClientPDF from '../../components/pdf/ClientPDF';
import { usePermissions } from '../../hooks/auth/usePermissions';

const TabButton = ({ activeTab, tabName, label, icon, onClick }) => (
    <button
        onClick={() => onClick(tabName)}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === tabName
            ? 'bg-blue-500 text-white'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
    >
        {icon}
        {label}
    </button>
);

const DetalleCliente = () => {
    const { can } = usePermissions();
    const { isLoading, data: datosDetalle, activeTab, setActiveTab, recargarDatos, navigate } = useDetalleCliente();
    const [procesoTieneCambios, setProcesoTieneCambios] = useState(false);
    const [navegacionBloqueada, setNavegacionBloqueada] = useState(null);

    // --- INICIO DE LA CORRECCIÓN ---
    // El hook useMemo se mueve a la parte superior, ANTES de cualquier return condicional.
    const memoizedPDFLink = useMemo(() => {
        if (isLoading || !datosDetalle) return null;

        const { cliente, vivienda, historialAbonos } = datosDetalle;
        const mostrarBotonPDF = cliente.status === 'activo' || cliente.status === 'enProcesoDeRenuncia';

        if (mostrarBotonPDF && cliente && vivienda && historialAbonos) {
            return (
                <PDFDownloadLink
                    document={
                        <ClientPDF
                            cliente={cliente}
                            vivienda={vivienda}
                            historialAbonos={historialAbonos}
                        />
                    }
                    fileName={`Estado_Cuenta_${cliente.datosCliente.nombres.replace(/ /g, '_')}.pdf`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                >
                    {({ loading }) => (
                        <>
                            <FileDown size={16} />
                            {loading ? 'Generando...' : 'PDF'}
                        </>
                    )}
                </PDFDownloadLink>
            );
        }
        return null;
    }, [isLoading, datosDetalle]);
    // --- FIN DE LA CORRECCIÓN ---

    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            procesoTieneCambios && currentLocation.pathname !== nextLocation.pathname
    );

    const handleTabClick = (tabName) => {
        if (procesoTieneCambios && activeTab === 'proceso' && tabName !== 'proceso') {
            setNavegacionBloqueada({ proximaTab: tabName });
        } else {
            setActiveTab(tabName);
        }
    };

    const handleConfirmarSalida = () => {
        if (navegacionBloqueada) {
            setProcesoTieneCambios(false);
            setActiveTab(navegacionBloqueada.proximaTab);
            setNavegacionBloqueada(null);
        } else if (blocker.state === 'blocked') {
            blocker.proceed();
        }
    };

    const handleCancelarSalida = () => {
        setNavegacionBloqueada(null);
        if (blocker.state === 'blocked') {
            blocker.reset();
        }
    };

    useEffect(() => {
        if (blocker.state === 'blocked' && !procesoTieneCambios) {
            blocker.proceed();
        }
    }, [blocker, procesoTieneCambios]);

    if (isLoading || !datosDetalle) {
        return <div className="text-center p-10 animate-pulse">Cargando perfil del cliente...</div>;
    }

    const { cliente, renuncia, historialAbonos } = datosDetalle;

    return (
        <AnimatedPage>
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-3xl flex-shrink-0">
                            {getInitials(cliente.datosCliente.nombres, cliente.datosCliente.apellidos)}
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                                {`${cliente.datosCliente.nombres} ${cliente.datosCliente.apellidos}`}
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400">{cliente.datosCliente.correo}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                            onClick={() => navigate('/clientes/listar')}
                            className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                            <ArrowLeft size={16} /> Volver
                        </button>
                        {memoizedPDFLink}
                    </div>
                </div>

                <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                    <nav className="flex space-x-2">
                        <TabButton
                            activeTab={activeTab}
                            tabName="info"
                            label="Información General"
                            icon={<Info size={16} />}
                            onClick={handleTabClick}
                        />
                        {can('clientes', 'verProceso') && (
                            <TabButton
                                activeTab={activeTab}
                                tabName="proceso"
                                label="Proceso"
                                icon={<GitCommit size={16} />}
                                onClick={handleTabClick}
                            />
                        )}
                    </nav>
                </div>

                <div>
                    {activeTab === 'info' && (
                        <TabInfoGeneralCliente
                            cliente={cliente}
                            renuncia={renuncia}
                            historialAbonos={historialAbonos}
                        />
                    )}
                    {activeTab === 'proceso' && (
                        <TabProcesoCliente
                            cliente={cliente}
                            renuncia={renuncia}
                            onDatosRecargados={recargarDatos}
                            onHayCambiosChange={setProcesoTieneCambios}
                        />
                    )}
                </div>
            </div>

            <ModalConfirmacion
                isOpen={!!navegacionBloqueada}
                onClose={handleCancelarSalida}
                onConfirm={handleConfirmarSalida}
                titulo="Cambios sin Guardar"
                mensaje="Tienes cambios pendientes en el proceso. ¿Estás seguro de que quieres salir sin guardar? Se perderán los cambios."
            />

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