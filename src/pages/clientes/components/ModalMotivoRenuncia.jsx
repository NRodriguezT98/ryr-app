import React from 'react';
import { FormModal } from '../../../components/modals';
import Select, { components } from 'react-select';
import {
    UserX,
    AlertCircle,
    Calendar,
    DollarSign,
    FileText,
    TrendingDown,
    Building2,
    User,
    Info,
    AlertTriangle,
    CheckCircle2,
    Banknote,
    Shield
} from 'lucide-react';
import { NumericFormat } from 'react-number-format';
import { formatCurrency, getTodayString } from '../../../utils/textFormatters';
import { useMotivoRenuncia } from '../../../hooks/clientes/useMotivoRenuncia';

const motivosOptions = [
    {
        label: "💰 Motivos Financieros",
        options: [
            {
                value: 'Crédito Negado por el Banco',
                label: 'Crédito Negado por el Banco',
                category: 'financial'
            },
            {
                value: 'Subsidio Insuficiente o No Aprobado',
                label: 'Subsidio Insuficiente o No Aprobado',
                category: 'financial'
            }
        ]
    },
    {
        label: "👤 Decisión del Cliente",
        options: [
            {
                value: 'Desistimiento Voluntario del Cliente',
                label: 'Desistimiento Voluntario del Cliente',
                category: 'client'
            },
            {
                value: 'Cambio de Circunstancias Personales',
                label: 'Cambio en Circunstancias Personales',
                category: 'client'
            },
            {
                value: 'Encontró otra Propiedad',
                label: 'Encontró otra Propiedad',
                category: 'client'
            }
        ]
    },
    {
        label: "🏗️ Motivos Operativos (Constructora)",
        options: [
            {
                value: 'Incumplimiento en el Plan de Pagos',
                label: 'Incumplimiento en el Plan de Pagos',
                category: 'operative'
            },
            {
                value: 'Retrasos en la Entrega de la Vivienda',
                label: 'Retrasos en la Entrega de la Vivienda',
                category: 'operative'
            },
            {
                value: 'Inconformidad con el Inmueble',
                label: 'Inconformidad con el Inmueble',
                category: 'operative'
            }
        ]
    },
    {
        label: "📝 Otro",
        options: [
            {
                value: 'Otro',
                label: 'Otro Motivo (Especificar abajo)',
                category: 'other'
            }
        ]
    }
];

const getSelectStyles = (hasError, isDarkMode) => ({
    control: (base, state) => ({
        ...base,
        minHeight: '44px',
        backgroundColor: isDarkMode ? '#111827' : '#ffffff',
        borderWidth: '2px',
        borderColor: hasError
            ? (isDarkMode ? '#f87171' : '#ef4444')
            : state.isFocused
                ? (isDarkMode ? '#60a5fa' : '#3b82f6')
                : isDarkMode ? '#1f2937' : '#e5e7eb',
        '&:hover': {
            borderColor: hasError
                ? (isDarkMode ? '#f87171' : '#ef4444')
                : (isDarkMode ? '#60a5fa' : '#3b82f6'),
        },
        boxShadow: state.isFocused
            ? `0 0 0 4px ${hasError
                ? (isDarkMode ? 'rgba(248, 113, 113, 0.15)' : 'rgba(239, 68, 68, 0.1)')
                : (isDarkMode ? 'rgba(96, 165, 250, 0.15)' : 'rgba(59, 130, 246, 0.1)')}`
            : 'none',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        borderRadius: '12px',
        cursor: 'pointer',
    }),
    singleValue: (base) => ({
        ...base,
        color: isDarkMode ? '#f9fafb' : '#111827',
        fontSize: '0.9375rem',
        fontWeight: '500',
    }),
    menu: (base) => ({
        ...base,
        backgroundColor: isDarkMode ? '#111827' : '#ffffff',
        border: `2px solid ${isDarkMode ? '#1f2937' : '#e5e7eb'}`,
        boxShadow: isDarkMode
            ? '0 20px 25px -5px rgb(0 0 0 / 0.5), 0 8px 10px -6px rgb(0 0 0 / 0.3)'
            : '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        borderRadius: '12px',
        overflow: 'hidden',
        marginTop: '8px',
        zIndex: 50, // Asegura que aparezca sobre otros elementos
    }),
    menuPortal: (base) => ({
        ...base,
        zIndex: 9999, // Para cuando se usa menuPortalTarget
    }),
    menuList: (base) => ({
        ...base,
        padding: '8px',
    }),
    option: (base, state) => ({
        ...base,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 14px',
        backgroundColor: state.isFocused
            ? (isDarkMode ? '#1f2937' : '#f0f9ff')
            : state.isSelected
                ? (isDarkMode ? '#1e40af' : '#dbeafe')
                : 'transparent',
        color: state.isSelected
            ? (isDarkMode ? '#ffffff' : '#1e40af')
            : (isDarkMode ? '#f9fafb' : '#111827'),
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        borderRadius: '8px',
        fontWeight: state.isSelected ? '600' : '500',
        fontSize: '0.875rem',
        '&:active': {
            backgroundColor: isDarkMode ? '#374151' : '#bfdbfe',
        }
    }),
    groupHeading: (base) => ({
        ...base,
        color: isDarkMode ? '#9ca3af' : '#6b7280',
        fontSize: '0.6875rem',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        padding: '8px 14px 4px',
        marginBottom: '4px',
    }),
    input: (base) => ({
        ...base,
        color: isDarkMode ? '#f9fafb' : '#111827',
        fontSize: '0.9375rem',
    }),
    placeholder: (base) => ({
        ...base,
        color: isDarkMode ? '#6b7280' : '#9ca3af',
        fontSize: '0.9375rem',
    }),
    dropdownIndicator: (base, state) => ({
        ...base,
        color: isDarkMode ? '#9ca3af' : '#6b7280',
        transition: 'all 0.2s ease',
        transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        '&:hover': {
            color: isDarkMode ? '#f9fafb' : '#111827',
        }
    }),
    indicatorSeparator: () => ({ display: 'none' }),
});

// Custom option component para mostrar iconos
const CustomOption = ({ data, ...props }) => {
    const { innerRef, innerProps } = props;
    return (
        <div ref={innerRef} {...innerProps} className="flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition-all">
            <span className="text-lg">{data.icon}</span>
            <span className="text-sm font-medium">{data.label}</span>
        </div>
    );
};

// Custom single value para mostrar el seleccionado
const CustomSingleValue = (props) => {
    return (
        <components.SingleValue {...props}>
            {props.data.label}
        </components.SingleValue>
    );
};

// InfoCard component para mostrar información financiera
const InfoCard = ({ children }) => (
    <div className="relative overflow-hidden bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 dark:from-sky-950/30 dark:via-blue-950/30 dark:to-indigo-950/30 border-2 border-sky-200 dark:border-sky-800/50 p-6 rounded-2xl shadow-lg">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-sky-400/10 to-indigo-400/10 dark:from-sky-400/5 dark:to-indigo-400/5 rounded-full blur-3xl"></div>
        <div className="relative z-10">
            {children}
        </div>
    </div>
);

const InfoRow = ({ label, value, variant = 'normal', icon: Icon }) => {
    const colorClasses = {
        normal: 'text-gray-900 dark:text-gray-100 font-semibold',
        danger: 'text-rose-600 dark:text-rose-400 font-bold',
        success: 'text-emerald-600 dark:text-emerald-400 font-bold text-xl',
    };

    const iconColorClasses = {
        normal: 'text-sky-500 dark:text-sky-400',
        danger: 'text-rose-500 dark:text-rose-400',
        success: 'text-emerald-500 dark:text-emerald-400',
    };

    return (
        <div className="flex justify-between items-center group hover:bg-white/50 dark:hover:bg-gray-800/30 px-3 py-2 rounded-lg transition-all">
            <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300 text-sm font-medium">
                {Icon && <Icon size={16} className={iconColorClasses[variant]} />}
                {label}
            </span>
            <span className={colorClasses[variant]}>{value}</span>
        </div>
    );
};

const ModalMotivoRenuncia = ({ isOpen, onClose, onConfirm, cliente, size = '3xl' }) => {
    const { formData, errors, calculos, handlers, isSubmitting } = useMotivoRenuncia(cliente, onConfirm);
    const { motivo, observacion, fechaRenuncia, penalidadMonto, penalidadMotivo, aplicaPenalidad } = formData;
    const { totalAbonadoReal, totalCondonado, montoPenalidadNum, totalADevolver, minDate } = calculos;
    const { setMotivo, setObservacion, setFechaRenuncia, setPenalidadMonto, setPenalidadMotivo, setAplicaPenalidad, handleConfirmar } = handlers;

    // Detectar dark mode
    const isDarkMode = document.documentElement.classList.contains('dark');

    // Detectar si el formulario tiene cambios
    const isDirty = !!(motivo || observacion || fechaRenuncia !== getTodayString() || aplicaPenalidad);

    return (
        <FormModal
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={handleConfirmar}
            title="Registrar Motivo de Renuncia"
            icon={<UserX size={20} />}
            variant="warning"
            size={size}
            isDirty={isDirty}
            isSubmitting={isSubmitting}
            submitText="Continuar con Renuncia"
            submitDisabled={!motivo}
        >
            <div className="space-y-6">
                {/* Banner informativo moderno */}
                <div className="relative overflow-hidden bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 dark:from-amber-950/30 dark:via-orange-950/30 dark:to-amber-950/30 border-2 border-amber-200/50 dark:border-amber-800/30 p-4 rounded-xl shadow-sm">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-100/20 to-orange-100/20 dark:from-amber-900/10 dark:to-orange-900/10"></div>
                    <div className="relative flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/60 dark:to-orange-900/60 rounded-full flex items-center justify-center shadow-sm">
                            <Info size={20} className="text-amber-700 dark:text-amber-300" />
                        </div>
                        <div className="flex-1 pt-1">
                            <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
                                Estás iniciando el proceso de renuncia para{' '}
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-gray-800 text-amber-900 dark:text-amber-100 rounded-lg font-semibold shadow-sm border border-amber-200 dark:border-amber-800/50">
                                    <User size={14} />
                                    {cliente?.datosCliente?.nombres} {cliente?.datosCliente?.apellidos}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Fecha y Motivo - Grid mejorado */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Fecha de Renuncia - Modernizada */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-gray-100 mb-2">
                            <Calendar size={18} className="text-blue-500" />
                            Fecha de Renuncia
                            {errors.fechaRenuncia && (
                                <span className="flex items-center gap-1 text-red-500 animate-pulse">
                                    <AlertCircle size={14} />
                                </span>
                            )}
                        </label>
                        <div className="relative">
                            <input
                                type="date"
                                value={fechaRenuncia}
                                onChange={(e) => setFechaRenuncia(e.target.value)}
                                min={minDate}
                                max={getTodayString()}
                                className={`w-full border-2 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300
                                    dark:bg-gray-800 dark:text-gray-100
                                    focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none
                                    hover:border-blue-400 dark:hover:border-blue-500
                                    ${errors.fechaRenuncia
                                        ? 'border-red-500 dark:border-red-500 bg-red-50/50 dark:bg-red-950/20 ring-4 ring-red-500/10'
                                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                                    }
                                `}
                                style={{ colorScheme: isDarkMode ? 'dark' : 'light' }}
                            />
                        </div>
                        {errors.fechaRenuncia && (
                            <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 text-xs mt-2 animate-fade-in bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg">
                                <AlertCircle size={14} />
                                <span className="font-medium">{errors.fechaRenuncia}</span>
                            </div>
                        )}
                    </div>

                    {/* Motivo Principal - Select Ultra Moderno */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-gray-100 mb-2">
                            <FileText size={18} className="text-purple-500" />
                            Motivo Principal
                            {errors.motivo && (
                                <span className="flex items-center gap-1 text-red-500 animate-pulse">
                                    <AlertCircle size={14} />
                                </span>
                            )}
                        </label>
                        <Select
                            options={motivosOptions}
                            value={motivo}
                            onChange={setMotivo}
                            placeholder="Selecciona un motivo..."
                            styles={getSelectStyles(!!errors.motivo, isDarkMode)}
                            components={{
                                Option: CustomOption,
                                SingleValue: CustomSingleValue,
                            }}
                            isSearchable
                            className="text-sm"
                        />
                        {errors.motivo && (
                            <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 text-xs mt-2 animate-fade-in bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg">
                                <AlertCircle size={14} />
                                <span className="font-medium">{errors.motivo}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Observación condicional - Mejorada */}
                {motivo?.value === 'Otro' && (
                    <div className="space-y-2 animate-fade-in">
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-gray-100 mb-2">
                            <FileText size={18} className="text-indigo-500" />
                            Especifica el motivo
                            {errors.observacion && (
                                <span className="flex items-center gap-1 text-red-500 animate-pulse">
                                    <AlertCircle size={14} />
                                </span>
                            )}
                        </label>
                        <div className="relative">
                            <textarea
                                value={observacion}
                                onChange={(e) => setObservacion(e.target.value)}
                                rows="4"
                                className={`w-full border-2 rounded-xl px-4 py-3 text-sm transition-all duration-300 resize-none
                                    dark:bg-gray-800 dark:text-gray-100
                                    focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none
                                    hover:border-blue-400 dark:hover:border-blue-500
                                    ${errors.observacion
                                        ? 'border-red-500 dark:border-red-500 bg-red-50/50 dark:bg-red-950/20 ring-4 ring-red-500/10'
                                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                                    }
                                `}
                                placeholder="Detalla aquí la razón específica de la renuncia..."
                            />
                            <div className="absolute bottom-3 right-3 text-xs text-gray-400 dark:text-gray-500 font-medium">
                                {observacion.length}/500
                            </div>
                        </div>
                        {errors.observacion && (
                            <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 text-xs mt-2 animate-fade-in bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg">
                                <AlertCircle size={14} />
                                <span className="font-medium">{errors.observacion}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Sección de penalidad - Toggle Switch Moderno */}
                <div className="pt-6 mt-2 border-t-2 border-dashed border-gray-200 dark:border-gray-700 space-y-5">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20 rounded-xl border-2 border-rose-200 dark:border-rose-800/50 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900/60 dark:to-pink-900/60 rounded-full flex items-center justify-center shadow-sm">
                                <AlertTriangle size={20} className="text-rose-600 dark:text-rose-400" />
                            </div>
                            <div>
                                <p className="font-bold text-gray-800 dark:text-gray-100">¿Desea aplicar penalidad?</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">Se descontará del monto a devolver</p>
                            </div>
                        </div>

                        {/* Toggle Switch Moderno */}
                        <button
                            type="button"
                            onClick={() => setAplicaPenalidad(!aplicaPenalidad)}
                            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-rose-500/20
                                ${aplicaPenalidad
                                    ? 'bg-gradient-to-r from-rose-500 to-pink-500 shadow-lg shadow-rose-500/30'
                                    : 'bg-gray-300 dark:bg-gray-600'
                                }`}
                        >
                            <span
                                className={`flex h-6 w-6 transform items-center justify-center rounded-full bg-white shadow-lg transition-all duration-300
                                    ${aplicaPenalidad ? 'translate-x-7' : 'translate-x-1'}`}
                            >
                                {aplicaPenalidad ? (
                                    <AlertTriangle size={12} className="text-rose-500" />
                                ) : (
                                    <Shield size={12} className="text-gray-400" />
                                )}
                            </span>
                        </button>
                    </div>

                    {aplicaPenalidad && (
                        <div className="animate-fade-in space-y-5">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-5 bg-gradient-to-br from-rose-50/50 to-pink-50/50 dark:from-rose-950/10 dark:to-pink-950/10 rounded-xl border-2 border-l-4 border-rose-300 dark:border-rose-700 shadow-sm">
                                {/* Monto de Penalidad */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-gray-100 mb-2">
                                        <DollarSign size={18} className="text-rose-600 dark:text-rose-400" />
                                        Monto de Penalidad
                                        {errors.penalidadMonto && (
                                            <span className="flex items-center gap-1 text-red-500 animate-pulse">
                                                <AlertCircle size={14} />
                                            </span>
                                        )}
                                    </label>
                                    <div className="relative group">
                                        <NumericFormat
                                            value={penalidadMonto}
                                            onValueChange={(values) => setPenalidadMonto(values.value)}
                                            className={`w-full border-2 rounded-xl px-4 py-3 pl-10 text-sm font-semibold transition-all duration-300
                                                dark:bg-gray-800 dark:text-gray-100
                                                focus:ring-4 focus:ring-rose-500/20 focus:border-rose-500 focus:outline-none
                                                hover:border-rose-400 dark:hover:border-rose-500
                                                ${errors.penalidadMonto
                                                    ? 'border-red-500 dark:border-red-500 bg-red-50/50 dark:bg-red-950/20 ring-4 ring-red-500/10'
                                                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                                                }
                                            `}
                                            thousandSeparator="."
                                            decimalSeparator=","
                                            prefix="$ "
                                            placeholder="$ 0"
                                        />
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <Banknote size={18} className="text-rose-600 dark:text-rose-400" />
                                        </div>
                                    </div>
                                    {errors.penalidadMonto && (
                                        <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 text-xs mt-2 animate-fade-in bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg">
                                            <AlertCircle size={14} />
                                            <span className="font-medium">{errors.penalidadMonto}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Motivo de Penalidad */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-gray-100 mb-2">
                                        <FileText size={18} className="text-rose-600 dark:text-rose-400" />
                                        Motivo de Penalidad
                                        {errors.penalidadMotivo && (
                                            <span className="flex items-center gap-1 text-red-500 animate-pulse">
                                                <AlertCircle size={14} />
                                            </span>
                                        )}
                                    </label>
                                    <input
                                        type="text"
                                        value={penalidadMotivo}
                                        onChange={(e) => setPenalidadMotivo(e.target.value)}
                                        className={`w-full border-2 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300
                                            dark:bg-gray-800 dark:text-gray-100
                                            focus:ring-4 focus:ring-rose-500/20 focus:border-rose-500 focus:outline-none
                                            hover:border-rose-400 dark:hover:border-rose-500
                                            ${errors.penalidadMotivo
                                                ? 'border-red-500 dark:border-red-500 bg-red-50/50 dark:bg-red-950/20 ring-4 ring-red-500/10'
                                                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                                            }
                                        `}
                                        placeholder="Ej: Cláusula de incumplimiento contractual"
                                    />
                                    {errors.penalidadMotivo && (
                                        <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 text-xs mt-2 animate-fade-in bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg">
                                            <AlertCircle size={14} />
                                            <span className="font-medium">{errors.penalidadMotivo}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Resumen financiero - Ultra Modernizado */}
                <InfoCard>
                    <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-sky-200 dark:border-sky-800">
                        <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                            <TrendingDown size={24} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Resumen Financiero</h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Cálculo de devolución</p>
                        </div>
                    </div>

                    <InfoRow
                        label="Total Abonado (Real)"
                        value={formatCurrency(totalAbonadoReal)}
                        icon={Banknote}
                    />

                    {totalCondonado > 0 && (
                        <InfoRow
                            label="Saldos Condonados"
                            value={formatCurrency(totalCondonado)}
                            icon={CheckCircle2}
                        />
                    )}

                    {aplicaPenalidad && montoPenalidadNum > 0 && (
                        <InfoRow
                            label="Penalidad Aplicada"
                            value={`- ${formatCurrency(montoPenalidadNum)}`}
                            variant="danger"
                            icon={AlertTriangle}
                        />
                    )}

                    <div className="pt-4 mt-4 border-t-2 border-dashed border-blue-300 dark:border-blue-700">
                        <InfoRow
                            label="TOTAL A DEVOLVER"
                            value={formatCurrency(totalADevolver)}
                            variant="success"
                            icon={DollarSign}
                        />
                    </div>
                </InfoCard>
            </div>
        </FormModal>
    );
};

export default ModalMotivoRenuncia;


