import React, { useState, lazy, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AnimatedPage from '../../components/AnimatedPage';
import {
    ArrowLeft,
    FileDown,
    Info,
    GitCommit,
    Home,
    Building2,
    Wallet,
    Briefcase,
    Clock,
    DollarSign,
    AlertTriangle,
    CheckCircle,
    Archive,
    User,
    Star,
    TrendingUp,
    Award,
    Calendar,
    MapPin,
    Sparkles
} from 'lucide-react';
import { useDetalleCliente } from '../../hooks/clientes/useDetalleCliente.jsx';
import { getInitials, formatCurrency, toTitleCase, formatDisplayDate } from '../../utils/textFormatters';
import ModalConfirmacion from '../../components/ModalConfirmacion';

// Lazy loading de tabs (code splitting)
const TabInfoGeneralCliente = lazy(() => import('./components/TabInfoGeneralCliente'));
const TabProcesoCliente = lazy(() => import('./components/TabProcesoCliente'));
const TabDocumentacionCliente = lazy(() => import('./components/TabDocumentacionClienteModerno'));
const NewTabHistorial = lazy(() => import('./components/NewTabHistorial'));

// Lazy loading de PDF (pesado - 500KB+)
const PDFDownloadLink = lazy(() => import('@react-pdf/renderer').then(module => ({ default: module.PDFDownloadLink })));
const ClientPDF = lazy(() => import('../../components/pdf/ClientPDF'));

import { usePermissions } from '../../hooks/auth/usePermissions';
import Button from '../../components/Button';

// Componente del avatar modernizado con efectos
const ModernAvatar = ({ cliente }) => {
    const initials = getInitials(cliente.datosCliente.nombres, cliente.datosCliente.apellidos);

    return (
        <div className="relative group">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 
                           text-white flex items-center justify-center font-bold text-2xl shadow-xl
                           border-4 border-white dark:border-gray-700">
                {initials}
            </div>
            {/* Efectos decorativos */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
            <div
                className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-700 flex items-center justify-center"
            >
                <User size={12} className="text-white" />
            </div>
        </div>
    );
};

// Componente de estadísticas mejorado
const StatsCard = ({ icon: Icon, title, value, subtitle, color = "blue", trend = null }) => {
    const colorVariants = {
        blue: "from-blue-500 to-blue-600",
        green: "from-green-500 to-green-600",
        purple: "from-purple-500 to-purple-600",
        orange: "from-orange-500 to-orange-600",
        red: "from-red-500 to-red-600"
    };

    return (
        <div
            className="relative overflow-hidden rounded-2xl p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300"
        >
            {/* Gradient background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${colorVariants[color]} opacity-5`} />

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${colorVariants[color]} shadow-lg`}>
                        <Icon size={24} className="text-white" />
                    </div>
                    {trend && (
                        <div className="flex items-center gap-1 text-green-500">
                            <TrendingUp size={16} />
                            <span className="text-sm font-medium">+{trend}%</span>
                        </div>
                    )}
                </div>

                <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                    {subtitle && (
                        <p className="text-xs text-gray-500 dark:text-gray-500">{subtitle}</p>
                    )}
                </div>
            </div>

            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 skew-x-12" />
        </div>
    );
};

// Componente de tabs modernizado
const ModernTabButton = ({ activeTab, tabName, label, icon, onClick, count = null }) => {
    const isActive = activeTab === tabName;

    return (
        <button
            onClick={() => onClick(tabName)}
            className={`relative flex items-center gap-3 px-6 py-4 font-semibold text-sm rounded-xl transition-all duration-300
                ${isActive
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                }`}
        >
            <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-700'}`}>
                {icon}
            </div>
            <span>{label}</span>
            {count !== null && (
                <span
                    className={`px-2 py-1 rounded-full text-xs font-bold ${isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                        }`}
                >
                    {count}
                </span>
            )}
        </button>
    );
};

// Componente de banner de estado modernizado
const StatusBanner = ({ type, icon: Icon, title, message, linkText, linkTo }) => {
    const variants = {
        warning: {
            bg: "from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20",
            border: "border-orange-200 dark:border-orange-700",
            icon: "text-orange-500",
            title: "text-orange-800 dark:text-orange-200",
            message: "text-orange-700 dark:text-orange-300"
        },
        info: {
            bg: "from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50",
            border: "border-gray-200 dark:border-gray-600",
            icon: "text-gray-500",
            title: "text-gray-800 dark:text-gray-200",
            message: "text-gray-700 dark:text-gray-300"
        },
        alert: {
            bg: "from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20",
            border: "border-yellow-200 dark:border-yellow-700",
            icon: "text-yellow-500",
            title: "text-yellow-800 dark:text-yellow-200",
            message: "text-yellow-700 dark:text-yellow-300"
        }
    };

    const variant = variants[type] || variants.info;

    return (
        <div
            className={`relative overflow-hidden rounded-2xl p-6 mb-6 bg-gradient-to-r ${variant.bg} border ${variant.border}`}
        >
            <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl bg-white/50 dark:bg-gray-800/50 ${variant.icon}`}>
                    <Icon size={24} />
                </div>
                <div className="flex-1">
                    <h4 className={`font-bold text-lg mb-2 ${variant.title}`}>{title}</h4>
                    <p className={`mb-3 ${variant.message}`}>{message}</p>
                    {linkTo && linkText && (
                        <Link
                            to={linkTo}
                            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold transition-colors"
                        >
                            {linkText}
                            <ArrowLeft size={16} className="rotate-180" />
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};

// Componente principal modernizado
const PDFGeneratorButton = ({ datosDetalle }) => {
    const [isTriggered, setIsTriggered] = useState(false);

    if (!datosDetalle) return null;

    const { cliente, vivienda, historialAbonos, proyecto } = datosDetalle;
    const mostrarBotonPDF = cliente.status === 'activo' || cliente.status === 'enProcesoDeRenuncia';

    if (!mostrarBotonPDF) return null;

    if (!isTriggered) {
        return (
            <Button
                variant="success"
                onClick={() => setIsTriggered(true)}
                size="default"
                icon={<FileDown size={16} />}
            >
                Generar Estado de Cuenta
            </Button>
        );
    }

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
                    icon={!loading && <FileDown size={16} />}
                >
                    {!loading && 'Descargar Estado de Cuenta'}
                </Button>
            )}
        </PDFDownloadLink>
    );
};

const DetalleClienteModerno = () => {
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
        navigate,
        historialRef
    } = useDetalleCliente();

    if (isLoading || !datosDetalle) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
                <div
                    className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
                />
            </div>
        );
    }

    const { cliente, renuncia, historialAbonos, vivienda, proyecto, mostrarAvisoValorEscritura, pasoActualLabel, progresoProceso } = datosDetalle || {};

    if (!cliente) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Cliente no encontrado</h2>
                </div>
            </div>
        );
    }

    const estaAPazYSalvo = cliente.status === 'activo' && vivienda && vivienda.saldoPendiente <= 0;

    return (
        <AnimatedPage>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                <div className="w-full px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">

                    {/* Header modernizado */}
                    <div
                        className="relative overflow-hidden rounded-3xl p-8 mb-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-2xl border border-white/20 dark:border-gray-700/20"
                    >
                        {/* Background effects */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-blue-600/5" />
                        <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-xl" />
                        <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-tr from-purple-500/10 to-pink-500/10 rounded-full blur-xl" />

                        <div className="relative z-10">
                            <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
                                <div className="flex items-center gap-6">
                                    <ModernAvatar cliente={cliente} />
                                    <div className="space-y-2">
                                        <h1
                                            className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent"
                                        >
                                            {toTitleCase(`${cliente.datosCliente.nombres} ${cliente.datosCliente.apellidos}`)}
                                        </h1>

                                        {vivienda && proyecto && (
                                            <div
                                                className="flex flex-wrap items-center gap-4 text-gray-600 dark:text-gray-400"
                                            >
                                                <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                                                    <Home size={16} className="text-blue-600 dark:text-blue-400" />
                                                    <span className="font-semibold text-sm">Mz. {vivienda.manzana} - Casa {vivienda.numeroCasa}</span>
                                                </div>
                                                <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                                                    <Building2 size={16} className="text-purple-600 dark:text-purple-400" />
                                                    <span className="font-semibold text-sm">{proyecto.nombre}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Button
                                        onClick={() => navigate('/clientes/listar')}
                                        variant="secondary"
                                        icon={<ArrowLeft size={16} />}
                                    >
                                        Volver
                                    </Button>
                                    <Suspense fallback={
                                        <Button variant="success" disabled isLoading loadingText="Cargando generador..." />
                                    }>
                                        <PDFGeneratorButton datosDetalle={datosDetalle} />
                                    </Suspense>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Status Banners */}

                    {cliente.status === 'enProcesoDeRenuncia' && renuncia && (
                        <StatusBanner
                            type="warning"
                            icon={AlertTriangle}
                            title="Renuncia en Proceso - Cliente en Estado de Solo Lectura"
                            message={`Este cliente se encuentra en estado '${datosDetalle.statusInfo?.text}', por lo que la mayoría de las acciones están deshabilitadas.`}
                            linkText="Ir a Gestionar Renuncia"
                            linkTo={`/renuncias/detalle/${renuncia.id}`}
                        />
                    )}

                    {cliente.status === 'renunciado' && renuncia && (
                        <StatusBanner
                            type="info"
                            icon={Archive}
                            title="Renuncia Completada"
                            message={`Este cliente se retiró del proyecto el ${renuncia.fechaRenuncia ? formatDisplayDate(renuncia.fechaRenuncia) : 'N/A'}. Para mayor información presione en "Ver Detalle Completo de la Renuncia".`}
                        />
                    )}

                    {mostrarAvisoValorEscritura && (
                        <StatusBanner
                            type="alert"
                            icon={AlertTriangle}
                            title="Recordatorio importante sobre el valor de esta vivienda"
                            message={`El valor total a pagar del cliente por esta vivienda es de ${formatCurrency(vivienda.valorFinal)}, pero en Notaría se firmó el valor de la vivienda en escritura por: ${formatCurrency(cliente.financiero.valorEscritura)}.`}
                        />
                    )}


                    {/* Stats Cards */}
                    {cliente.status !== 'renunciado' && cliente.status !== 'inactivo' && (
                        <div
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                        >
                            <StatsCard
                                icon={DollarSign}
                                title="Saldo Pendiente"
                                value={vivienda ? formatCurrency(vivienda.saldoPendiente) : 'N/A'}
                                subtitle="Monto por pagar"
                                color={vivienda && vivienda.saldoPendiente <= 0 ? "green" : "red"}
                            />

                            <StatsCard
                                icon={pasoActualLabel === 'Completado' ? CheckCircle : GitCommit}
                                title="Paso Actual"
                                value={pasoActualLabel === 'Completado' ? '¡Finalizado!' : `${progresoProceso.completados + 1}/${progresoProceso.total}`}
                                subtitle={pasoActualLabel === 'Completado' ? 'Proceso completado' : pasoActualLabel}
                                color={pasoActualLabel === 'Completado' ? "green" : "blue"}
                            />

                            <StatsCard
                                icon={Calendar}
                                title="Días Activo"
                                value="156"
                                subtitle="En el sistema"
                                color="purple"
                                trend={12}
                            />

                            <StatsCard
                                icon={Award}
                                title="Estado General"
                                value={estaAPazYSalvo ? "A Paz y Salvo" : "Activo"}
                                subtitle="Situación actual"
                                color={estaAPazYSalvo ? "green" : "blue"}
                            />
                        </div>
                    )}

                    {/* Navigation Tabs */}
                    <div
                        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-6 mb-8"
                    >
                        <nav className="flex flex-wrap gap-3">
                            <ModernTabButton
                                activeTab={activeTab}
                                tabName="info"
                                label="Información"
                                icon={<Info size={18} />}
                                onClick={handlers.handleTabClick}
                            />
                            {can('clientes', 'verProceso') && (
                                <ModernTabButton
                                    activeTab={activeTab}
                                    tabName="proceso"
                                    label="Proceso"
                                    icon={<GitCommit size={18} />}
                                    onClick={handlers.handleTabClick}
                                    count={progresoProceso.total}
                                />
                            )}
                            {can('clientes', 'verDocumentos') && (
                                <ModernTabButton
                                    activeTab={activeTab}
                                    tabName="documentacion"
                                    label="Documentación"
                                    icon={<Briefcase size={18} />}
                                    onClick={handlers.handleTabClick}
                                />
                            )}
                            {can('clientes', 'verHistorial') && (
                                <ModernTabButton
                                    activeTab={activeTab}
                                    tabName="historial"
                                    label="Historial"
                                    icon={<Clock size={18} />}
                                    onClick={handlers.handleTabClick}
                                    count={historialAbonos?.length}
                                />
                            )}
                        </nav>
                    </div>

                    {/* Content Area */}
                    <div
                        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 overflow-hidden"
                    >
                        <div
                            key={activeTab}
                            className="p-8"
                        >
                            <Suspense fallback={
                                <div className="flex items-center justify-center py-12">
                                    <div className="text-center">
                                        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                                        <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
                                    </div>
                                </div>
                            }>
                                {activeTab === 'info' && (
                                    <TabInfoGeneralCliente
                                        cliente={cliente}
                                        renuncia={renuncia}
                                        vivienda={vivienda}
                                        historialAbonos={historialAbonos}
                                        proyecto={proyecto}
                                        isReadOnly={isReadOnly}
                                    />
                                )}
                                {activeTab === 'proceso' && (
                                    <TabProcesoCliente
                                        cliente={cliente}
                                        renuncia={renuncia}
                                        onDatosRecargados={recargarDatos}
                                        onHayCambiosChange={setProcesoTieneCambios}
                                        proyecto={proyecto}
                                        isReadOnly={isReadOnly}
                                    />
                                )}
                                {activeTab === 'documentacion' && (
                                    <TabDocumentacionCliente
                                        cliente={cliente}
                                        renuncia={renuncia}
                                    />
                                )}
                                {activeTab === 'historial' && cliente && (
                                    <NewTabHistorial
                                        cliente={cliente}
                                    />
                                )}
                            </Suspense>
                        </div>

                    </div>

                </div>
            </div>

            {/* Modals */}
            <ModalConfirmacion
                isOpen={!!navegacionBloqueada}
                onClose={handlers.handleCancelarSalida}
                onConfirm={handlers.handleConfirmarSalida}
                titulo="Cambios sin Guardar"
                mensaje="Tienes cambios pendientes en el proceso. ¿Estás seguro de que quieres salir sin guardar? Se perderán los cambios."
            />
            <ModalConfirmacion
                isOpen={blocker.state === 'blocked'}
                onClose={handlers.handleCancelarSalida}
                onConfirm={handlers.handleConfirmarSalida}
                titulo="Cambios sin Guardar"
                mensaje="Tienes cambios pendientes en el proceso. ¿Estás seguro de que quieres abandonar la página? Se perderán los cambios."
            />
        </AnimatedPage>
    );
};

export default DetalleClienteModerno;



