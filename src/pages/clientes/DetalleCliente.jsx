import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AnimatedPage from '../../components/AnimatedPage';
import { ArrowLeft, FileDown, Info, GitCommit, Home, Building2, Wallet, Briefcase, Clock, DollarSign, AlertTriangle, CheckCircle, Archive } from 'lucide-react';
import { useDetalleCliente } from '../../hooks/clientes/useDetalleCliente.jsx';
import { getInitials, formatCurrency, toTitleCase, formatDisplayDate } from '../../utils/textFormatters';
import ModalConfirmacion from '../../components/ModalConfirmacion';
import TabInfoGeneralCliente from './components/TabInfoGeneralCliente';
import TabProcesoCliente from './components/TabProcesoCliente';
import TabDocumentacionCliente from './components/TabDocumentacionCliente';
import TabHistorial from './components/TabHistorial';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ClientPDF from '../../components/pdf/ClientPDF';
import { usePermissions } from '../../hooks/auth/usePermissions';
import Button from '../../components/Button';

const TabButton = ({ activeTab, tabName, label, icon, onClick }) => {
    const isActive = activeTab === tabName;
    return (
        <button
            onClick={() => onClick(tabName)}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold border-b-2 transition-all duration-200
                ${isActive
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
        >
            {icon}
            {label}
        </button>
    );
};

const PDFGeneratorButton = ({ datosDetalle }) => {
    // 1. Creamos un estado local para este botón
    const [isTriggered, setIsTriggered] = useState(false);

    if (!datosDetalle) return null;

    const { cliente, vivienda, historialAbonos, proyecto } = datosDetalle;
    const mostrarBotonPDF = cliente.status === 'activo' || cliente.status === 'enProcesoDeRenuncia';

    if (!mostrarBotonPDF) return null;

    // Si el usuario aún no ha hecho clic, mostramos el botón para iniciar
    if (!isTriggered) {
        return (
            <Button
                variant="success"
                onClick={() => setIsTriggered(true)}
                size="default"
                icon={<FileDown size={16} />}  // ← Usa el prop icon
            >
                Generar Estado de Cuenta
            </Button>
        );
    }
    // Si el usuario ya hizo clic, renderizamos el componente de descarga
    return (
        <PDFDownloadLink
            document={<ClientPDF cliente={cliente} vivienda={vivienda} historialAbonos={historialAbonos} proyecto={proyecto} />}
            fileName={`Estado_Cuenta_${cliente.datosCliente.nombres.replace(/ /g, '_')}.pdf`}
        >
            {({ loading }) => (
                <Button
                    variant="success"
                    size="default"
                    disabled={loading}
                    isLoading={loading}
                    loadingText="Generando PDF..."
                    icon={!loading && <FileDown size={16} />}  // ← El icono va aquí, solo cuando NO está cargando
                >
                    {!loading && 'Descargar Estado de Cuenta'}  {/* ← Solo muestra el texto cuando no está cargando */}
                </Button>
            )}
        </PDFDownloadLink>
    );
};

const DetalleCliente = () => {
    const { can } = usePermissions();
    const {
        isLoading,
        data: datosDetalle,
        activeTab,
        blocker,
        navegacionBloqueada,
        setProcesoTieneCambios,
        recargarDatos,
        handlers,
        setActiveTab,
        isReadOnly,
        navigate
    } = useDetalleCliente();

    if (isLoading || !datosDetalle) {
        return <div className="text-center p-10 animate-pulse">Cargando perfil del cliente...</div>;
    }

    const { cliente, renuncia, historialAbonos, vivienda, proyecto, mostrarAvisoValorEscritura, pasoActualLabel, progresoProceso } = datosDetalle || {};
    if (!cliente) {
        return <div className="text-center p-10 animate-pulse">Cargando datos del cliente...</div>;
    }

    const estaAPazYSalvo = cliente.status === 'activo' && vivienda && vivienda.saldoPendiente <= 0;

    return (
        <AnimatedPage>
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-3xl flex-shrink-0">
                            {getInitials(cliente.datosCliente.nombres, cliente.datosCliente.apellidos)}
                        </div>
                        <div className="flex flex-col">
                            {/* --- Etiqueta de Estado General --- */}
                            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{toTitleCase(`${cliente.datosCliente.nombres} ${cliente.datosCliente.apellidos}`)}</h2>
                            {vivienda && proyecto && (
                                <div className="mt-1 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                    <div className="flex items-center gap-2"><Home size={16} /> <span className="font-semibold">{`Mz. ${vivienda.manzana} - Casa ${vivienda.numeroCasa}`}</span></div>
                                    <div className="flex items-center gap-2"><Building2 size={16} /> <span className="font-semibold">{proyecto.nombre}</span></div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 self-start sm:self-center">
                        <Button
                            onClick={() => navigate('/clientes/listar')}
                            variant="secondary"
                            icon={<ArrowLeft size={16} />}
                        >
                            Volver
                        </Button>
                        <PDFGeneratorButton datosDetalle={datosDetalle} />
                    </div>
                </div>
                {/* --- INICIO DE LA MODIFICACIÓN: Banners de Estado Globales --- */}
                {/* Banner para "EN PROCESO DE RENUNCIA"*/}
                {cliente.status === 'enProcesoDeRenuncia' && renuncia && (
                    <div className="p-4 mb-6 bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-400 rounded-r-lg flex items-center gap-4">
                        <AlertTriangle size={32} className="text-orange-500 flex-shrink-0" />
                        <div>
                            <h4 className="font-bold text-orange-800 dark:text-orange-200">Renuncia en Proceso, Cliente en Estado de Solo Lectura </h4>
                            <p className="text-sm text-orange-700 dark:text-orange-300">Este cliente se encuentra en estado '{datosDetalle.statusInfo.text}', por lo que la mayoría de las acciones están deshabilitadas.</p>
                            <Link to={`/renuncias/detalle/${renuncia.id}`} className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline mt-1 block">Ir a Gestionar Renuncia</Link>
                        </div>
                    </div>
                )}
                {/* Banner para estado "RENUNCIADO"*/}
                {cliente.status === 'renunciado' && renuncia && (
                    <div className="p-4 mb-6 bg-gray-100 dark:bg-gray-700/50 border-l-4 border-gray-400 rounded-r-lg flex items-center gap-4">
                        <Archive size={32} className="text-gray-500 flex-shrink-0" />
                        <div>
                            <h4 className="font-bold text-gray-800 dark:text-gray-200">Renuncia Completada</h4>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                {/* Mostramos la fecha de la renuncia para dar contexto */}
                                Este cliente se retiró del proyecto el {renuncia.fechaRenuncia ? formatDisplayDate(renuncia.fechaRenuncia) : 'N/A'}. para mayor información presione en "Ver Detalle Completo de la Renuncia".
                            </p>
                        </div>
                    </div>
                )}

                {/* --- 1. AVISO DE VALOR DE ESCRITURA (REINTEGRADO) --- */}
                {mostrarAvisoValorEscritura && (
                    <div className="md:col-span-3 p-4 rounded-lg flex items-start gap-3 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400">
                        <AlertTriangle size={24} className="text-yellow-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold text-yellow-800 dark:text-yellow-200">Recordatorio importante sobre el valor de esta vivienda</p>
                            <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                El valor total a pagar del cliente por esta vivienda es de {formatCurrency(vivienda.valorFinal)}, pero en Notaría se firmo el valor de la vivienda en escritura por: {formatCurrency(cliente.financiero.valorEscritura)}.
                            </p>
                        </div>
                    </div>
                )}
                {/* Este bloque de tarjetas solo se mostrará si el cliente NO está en un estado final */}
                {cliente.status !== 'renunciado' && cliente.status !== 'inactivo' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {/* Tarjeta #1: Saldo Pendiente */}
                        <div className={`p-4 rounded-lg flex items-center gap-4 bg-gray-100 dark:bg-gray-700/50`}>
                            <DollarSign size={28} className={vivienda && vivienda.saldoPendiente <= 0 ? "text-green-500" : "text-red-500"} />
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Saldo Pendiente</p>
                                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{vivienda ? formatCurrency(vivienda.saldoPendiente) : 'N/A'}</p>
                            </div>
                        </div>

                        {/* Tarjeta #2: Paso Actual del Proceso */}
                        <div className={`p-4 rounded-lg flex items-center gap-4 bg-gray-100 dark:bg-gray-700/50`}>
                            {pasoActualLabel === 'Completado' ? <CheckCircle size={28} className="text-green-500" /> : <GitCommit size={28} className="text-blue-500" />}
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Paso Actual del Proceso</p>
                                <p className="text-lg font-bold text-gray-800 dark:text-gray-100 truncate" title={pasoActualLabel}>
                                    {pasoActualLabel === 'Completado' ? '¡Proceso Finalizado!' : pasoActualLabel}
                                </p>
                                {pasoActualLabel !== 'Completado' && progresoProceso.total > 0 && (
                                    <p className="text-xs font-semibold text-blue-500 dark:text-blue-400 mt-1">
                                        {`Paso ${progresoProceso.completados + 1} de ${progresoProceso.total}`}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                    <nav className="flex flex-wrap gap-2">
                        <TabButton activeTab={activeTab} tabName="info" label="Información" icon={<Info size={16} />} onClick={handlers.handleTabClick} />
                        {can('clientes', 'verProceso') && <TabButton activeTab={activeTab} tabName="proceso" label="Proceso" icon={<GitCommit size={16} />} onClick={handlers.handleTabClick} />}
                        {can('clientes', 'verDocumentos') && <TabButton activeTab={activeTab} tabName="documentacion" label="Documentación" icon={<Briefcase size={16} />} onClick={handlers.handleTabClick} />}
                        {can('clientes', 'verHistorial') && <TabButton activeTab={activeTab} tabName="historial" label="Historial" icon={<Clock size={16} />} onClick={handlers.handleTabClick} />}
                    </nav>
                </div>

                <div>
                    {activeTab === 'info' && <TabInfoGeneralCliente cliente={cliente} renuncia={renuncia} vivienda={vivienda} historialAbonos={historialAbonos} proyecto={proyecto} isReadOnly={isReadOnly} />}
                    {activeTab === 'proceso' && <TabProcesoCliente cliente={cliente} renuncia={renuncia} onDatosRecargados={recargarDatos} onHayCambiosChange={setProcesoTieneCambios} isReadOnly={isReadOnly} />}
                    {activeTab === 'documentacion' && <TabDocumentacionCliente cliente={cliente} renuncia={renuncia} />}
                    {activeTab === 'historial' && cliente && <TabHistorial cliente={cliente} isReadOnly={isReadOnly} />}
                </div>
            </div>

            <ModalConfirmacion isOpen={!!navegacionBloqueada} onClose={handlers.handleCancelarSalida} onConfirm={handlers.handleConfirmarSalida} titulo="Cambios sin Guardar" mensaje="Tienes cambios pendientes en el proceso. ¿Estás seguro de que quieres salir sin guardar? Se perderán los cambios." />
            <ModalConfirmacion isOpen={blocker.state === 'blocked'} onClose={handlers.handleCancelarSalida} onConfirm={handlers.handleConfirmarSalida} titulo="Cambios sin Guardar" mensaje="Tienes cambios pendientes en el proceso. ¿Estás seguro de que quieres abandonar la página? Se perderán los cambios." />
        </AnimatedPage>
    );
};

export default DetalleCliente;