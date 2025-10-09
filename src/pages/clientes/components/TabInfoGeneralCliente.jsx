import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { usePermissions } from '../../../hooks/auth/usePermissions';
import {
    User,
    Phone,
    Mail,
    MapPin,
    Home,
    Wallet,
    Calendar,
    AlertTriangle,
    Building,
    Building2,
    Banknote,
    Landmark,
    Award,
    Briefcase,
    PlusCircle,
    FileKey,
    TrendingUp,
    CreditCard,
    DollarSign,
    ArrowUpRight,
    CheckCircle,
    Clock,
    Star,
    Shield,
    Sparkles
} from 'lucide-react';
import { formatID, formatDisplayDate, formatCurrency } from '../../../utils/textFormatters';
import ClienteEstadoView from './ClienteEstadoView';
import Button from '../../../components/Button';

// Componente de card moderno con efectos glassmorphism
const ModernInfoCard = ({ title, icon: Icon, children, headerActions = null, gradient = "from-blue-500 to-blue-600", delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay }}
        className="relative overflow-hidden rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 shadow-xl hover:shadow-2xl transition-all duration-300"
    >
        {/* Background gradient effect */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient}`} />

        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${gradient} shadow-lg`}>
                        <Icon size={24} className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
                </div>
                {headerActions && (
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {headerActions}
                    </motion.div>
                )}
            </div>
            <div className="space-y-4">
                {children}
            </div>
        </div>

        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 skew-x-12" />
    </motion.div>
);

// Componente de fila de información modernizado
const ModernInfoRow = ({ icon: Icon, label, value, valueClassName = '', isLink = false, linkTo = '', highlight = false }) => (
    <motion.div
        className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-200 ${highlight ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }`}
        whileHover={{ scale: 1.01 }}
    >
        <div className={`p-2 rounded-lg ${highlight ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
            <Icon size={16} />
        </div>
        <div className="flex-1">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 block">{label}</span>
            {isLink && linkTo ? (
                <Link
                    to={linkTo}
                    className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors flex items-center gap-1"
                >
                    {value || 'No especificado'}
                    <ArrowUpRight size={14} />
                </Link>
            ) : (
                <span className={`font-semibold text-gray-900 dark:text-white ${valueClassName}`}>
                    {value || 'No especificado'}
                </span>
            )}
        </div>
    </motion.div>
);

// Componente de progreso circular
const CircularProgress = ({ percentage, size = 80, strokeWidth = 8, color = "#3B82F6" }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative">
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="none"
                    className="text-gray-200 dark:text-gray-700"
                />
                {/* Progress circle */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {Math.round(percentage)}%
                </span>
            </div>
        </div>
    );
};

// Componente de fuente financiera modernizada
const ModernFinancialSource = ({ icon: Icon, titulo, banco, monto, abonado, gradient = "from-green-500 to-green-600" }) => {
    const percentage = monto > 0 ? (abonado / monto) * 100 : 0;

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className="relative overflow-hidden rounded-xl bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 p-4 border border-gray-200 dark:border-gray-600"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${gradient}`}>
                        <Icon size={20} className="text-white" />
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{titulo}</p>
                        {banco && (
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                {typeof banco === 'string' ? banco : banco}
                            </div>
                        )}
                    </div>
                </div>

                <div className="text-right">
                    <div className="flex items-center gap-3">
                        <div>
                            <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                {formatCurrency(abonado)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                de {formatCurrency(monto)}
                            </p>
                        </div>
                        <CircularProgress
                            percentage={percentage}
                            size={60}
                            strokeWidth={6}
                            color={percentage === 100 ? "#10B981" : "#3B82F6"}
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// Componente principal modernizado
const TabInfoGeneralClienteModerno = ({ cliente, renuncia, vivienda, historialAbonos, proyecto, isReadOnly }) => {
    const { can } = usePermissions();
    const navigate = useNavigate();
    const [expandedCard, setExpandedCard] = useState(null);

    if (!cliente) return null;

    // Para casos especiales (renunciado/inactivo) mantener el componente original
    if (cliente.status === 'renunciado' || cliente.status === 'inactivo') {
        return <ClienteEstadoView cliente={cliente} renuncia={renuncia} contexto="infoGeneral" />;
    }

    const { datosCliente, financiero } = cliente;

    // Lógica financiera
    const valorTotalVivienda = [
        financiero?.cuotaInicial?.monto,
        financiero?.credito?.monto,
        financiero?.subsidioVivienda?.monto,
        financiero?.subsidioCaja?.monto
    ].reduce((acc, monto) => acc + (monto || 0), 0);

    const totalAbonado = (historialAbonos || []).reduce((acc, abono) => acc + abono.monto, 0);
    const saldoPendiente = valorTotalVivienda - totalAbonado;
    const progresoPago = valorTotalVivienda > 0 ? (totalAbonado / valorTotalVivienda) * 100 : 0;

    // Funciones de los abonos por fuente
    const getAbonosByFuente = (fuente) => {
        return (historialAbonos || []).filter(a => a.fuente === fuente).reduce((s, a) => s + a.monto, 0);
    };

    const handleGoToAbonos = () => {
        navigate(`/abonos/gestionar/${cliente.id}`);
    };

    return (
        <div className="space-y-6">
            {/* Header con métrica de progreso - Full Width */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-white/20">
                                <Wallet size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">Progreso de Pago</h3>
                                <p className="text-blue-100 text-sm">Estado actual del proceso</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-2xl font-bold">{formatCurrency(totalAbonado)}</p>
                                <p className="text-blue-100 text-sm">Total abonado</p>
                            </div>
                            <CircularProgress
                                percentage={progresoPago}
                                size={60}
                                strokeWidth={6}
                                color="white"
                            />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Grid principal de información */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* 1. Datos de Contacto */}
                <ModernInfoCard
                    title="Información Personal"
                    icon={User}
                    gradient="from-blue-500 to-blue-600"
                    delay={0.1}
                >
                    <ModernInfoRow
                        icon={User}
                        label="Nombres y Apellidos"
                        value={`${datosCliente.nombres} ${datosCliente.apellidos}`}
                        highlight={true}
                    />
                    <ModernInfoRow
                        icon={FileKey}
                        label="Cédula"
                        value={formatID(datosCliente.cedula)}
                    />
                    <ModernInfoRow
                        icon={Phone}
                        label="Teléfono"
                        value={datosCliente.telefono}
                    />
                    <ModernInfoRow
                        icon={Mail}
                        label="Correo Electrónico"
                        value={datosCliente.correo}
                    />
                    <ModernInfoRow
                        icon={MapPin}
                        label="Dirección"
                        value={datosCliente.direccion}
                    />
                </ModernInfoCard>

                {/* 2. Vivienda Asignada */}
                <ModernInfoCard
                    title="Vivienda Asignada"
                    icon={Home}
                    gradient="from-purple-500 to-purple-600"
                    delay={0.2}
                >
                    {vivienda ? (
                        <>
                            <ModernInfoRow
                                icon={Home}
                                label="Ubicación"
                                value={`Mz. ${vivienda.manzana} - Casa ${vivienda.numeroCasa}`}
                                isLink={true}
                                linkTo={`/viviendas/detalle/${vivienda.id}`}
                                highlight={true}
                            />
                            <ModernInfoRow
                                icon={Building}
                                label="Matrícula"
                                value={vivienda.matricula}
                            />
                            <ModernInfoRow
                                icon={MapPin}
                                label="Nomenclatura"
                                value={vivienda.nomenclatura}
                            />
                            {proyecto && (
                                <ModernInfoRow
                                    icon={Building2}
                                    label="Proyecto"
                                    value={proyecto.nombre}
                                />
                            )}
                            <ModernInfoRow
                                icon={DollarSign}
                                label="Valor Final"
                                value={formatCurrency(vivienda.valorFinal)}
                                valueClassName="text-green-600 dark:text-green-400"
                            />
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <Home size={48} className="mx-auto text-gray-300 mb-3" />
                            <p className="text-gray-500 dark:text-gray-400">No tiene vivienda asignada</p>
                        </div>
                    )}
                </ModernInfoCard>

                {/* 3. Resumen Financiero Expandido */}
                <ModernInfoCard
                    title="Gestión Financiera"
                    icon={Wallet}
                    gradient="from-amber-500 to-amber-600"
                    delay={0.3}
                    headerActions={
                        can('abonos', 'crear') && vivienda && (
                            <div
                                data-tooltip-id="app-tooltip"
                                data-tooltip-content={isReadOnly ? "No se pueden agregar abonos a un cliente con renuncia en proceso." : "Agregar un nuevo abono"}
                            >
                                <Button
                                    variant="primary"
                                    onClick={handleGoToAbonos}
                                    icon={<PlusCircle size={16} />}
                                    size="sm"
                                    disabled={isReadOnly}
                                >
                                    Agregar Abono
                                </Button>
                            </div>
                        )
                    }
                >
                    {Object.keys(financiero || {}).length > 0 && vivienda ? (
                        <>
                            {/* Valor Pactado Principal */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 mb-6 text-center">
                                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Valor Total Pactado</h4>
                                <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                                    {formatCurrency(valorTotalVivienda)}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Monto acordado para la vivienda</p>
                            </div>

                            {/* Total Abonado y Saldo Pendiente */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 text-center">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
                                        <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Abonado</h4>
                                    </div>
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                        {formatCurrency(totalAbonado)}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Pagos recibidos</p>
                                </div>

                                <div className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-xl p-4 text-center">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <Clock size={20} className="text-red-600 dark:text-red-400" />
                                        <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Saldo Pendiente</h4>
                                    </div>
                                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                                        {formatCurrency(saldoPendiente)}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Por pagar</p>
                                </div>
                            </div>

                            {/* Fuentes de financiación */}
                            <div className="space-y-3">
                                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <CreditCard size={16} />
                                    Fuentes de Financiación
                                </h4>

                                {cliente.financiero.aplicaCuotaInicial && (
                                    <ModernFinancialSource
                                        icon={Banknote}
                                        titulo="Cuota Inicial"
                                        monto={cliente.financiero.cuotaInicial.monto}
                                        abonado={getAbonosByFuente('cuotaInicial')}
                                        gradient="from-emerald-500 to-emerald-600"
                                    />
                                )}

                                {cliente.financiero.aplicaCredito && (
                                    <ModernFinancialSource
                                        icon={Landmark}
                                        titulo="Crédito Hipotecario"
                                        banco={
                                            <>
                                                <span>{cliente.financiero.credito.banco}</span>
                                                {cliente.financiero.credito.caso && (
                                                    <div className="mt-1">
                                                        <span className="font-semibold">Ref: </span>
                                                        <span>{cliente.financiero.credito.caso}</span>
                                                    </div>
                                                )}
                                            </>
                                        }
                                        monto={cliente.financiero.credito.monto}
                                        abonado={getAbonosByFuente('credito')}
                                        gradient="from-blue-500 to-blue-600"
                                    />
                                )}

                                {cliente.financiero.aplicaSubsidioVivienda && (
                                    <ModernFinancialSource
                                        icon={Award}
                                        titulo="Subsidio Mi Casa Ya"
                                        monto={cliente.financiero.subsidioVivienda.monto}
                                        abonado={getAbonosByFuente('subsidioVivienda')}
                                        gradient="from-purple-500 to-purple-600"
                                    />
                                )}

                                {cliente.financiero.aplicaSubsidioCaja && (
                                    <ModernFinancialSource
                                        icon={Briefcase}
                                        titulo="Subsidio Caja Comp."
                                        monto={cliente.financiero.subsidioCaja.monto}
                                        abonado={getAbonosByFuente('subsidioCaja')}
                                        gradient="from-orange-500 to-orange-600"
                                    />
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <Wallet size={48} className="mx-auto text-gray-300 mb-3" />
                            <p className="text-gray-500 dark:text-gray-400">No se ha definido una estructura financiera</p>
                        </div>
                    )}
                </ModernInfoCard>

                {/* 4. Historial del Cliente */}
                <ModernInfoCard
                    title="Historial del Cliente"
                    icon={Calendar}
                    gradient="from-green-500 to-green-600"
                    delay={0.4}
                >
                    <ModernInfoRow
                        icon={Calendar}
                        label="Cliente desde"
                        value={formatDisplayDate(cliente.fechaCreacion)}
                        highlight={true}
                    />
                    <ModernInfoRow
                        icon={Star}
                        label="Inicio de Proceso"
                        value={formatDisplayDate(cliente.fechaInicioProceso)}
                    />
                    <ModernInfoRow
                        icon={Shield}
                        label="Estado Actual"
                        value={cliente.status === 'activo' ? 'Activo' : cliente.status}
                        valueClassName="text-green-600 dark:text-green-400"
                    />
                </ModernInfoCard>
            </div>

            {/* Footer decorativo */}
            <motion.div
                className="text-center py-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
            >
            </motion.div>
        </div>
    );
};

export default TabInfoGeneralClienteModerno;