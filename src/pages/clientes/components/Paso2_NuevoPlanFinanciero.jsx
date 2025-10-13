import React from 'react';
import { NumericFormat } from 'react-number-format';
import Select from 'react-select';
import HelpTooltip from '../../../components/HelpTooltip';
import { formatCurrency } from '../../../utils/textFormatters';
import FileUpload from '../../../components/FileUpload';
import {
    FileText, XCircle, Info, BadgeDollarSign, AlertCircle, TrendingUp,
    Home, Wallet, CreditCard, Building2, PiggyBank, FileCheck,
    DollarSign, Calculator, CheckCircle2, XCircle as XCircleIcon,
    Sparkles, Target, Gift, Briefcase
} from 'lucide-react';

// Opciones y estilos reutilizados
const creditoOptions = [
    { value: 'Bancolombia', label: 'Bancolombia' },
    { value: 'Davivienda', label: 'Davivienda' },
    { value: 'Banco de Bogotá', label: 'Banco de Bogotá' },
    { value: 'Fondo Nacional DelAhorro', label: 'Fondo Nacional Del Ahorro' },
    { value: 'Banco Agrario', label: 'Banco Agrario' },
    { value: 'Otro', label: 'Otro' }
];
const cajaOptions = [
    { value: 'Comfandi', label: 'Comfandi' },
    { value: 'Comfenalco', label: 'Comfenalco' },
    { value: 'Otra', label: 'Otra' }
];
const GASTOS_NOTARIALES_FIJOS = 5000000;

const getSelectStyles = (hasError, isDarkMode) => ({
    control: (base, state) => ({
        ...base,
        backgroundColor: isDarkMode ? '#374151' : '#ffffff',
        borderWidth: '2px',
        borderColor: hasError ? '#ef4444' : (state.isFocused ? '#3b82f6' : '#d1d5db'),
        '&:hover': { borderColor: hasError ? '#ef4444' : '#3b82f6' },
        boxShadow: state.isFocused ? (hasError ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : '0 0 0 3px rgba(59, 130, 246, 0.1)') : 'none',
        padding: '0.25rem',
        borderRadius: '0.5rem',
        transition: 'all 0.2s'
    }),
    singleValue: (base) => ({ ...base, color: isDarkMode ? '#ffffff' : '#1f2937', fontWeight: '500' }),
    menu: (base) => ({ ...base, backgroundColor: isDarkMode ? '#374151' : '#ffffff', borderRadius: '0.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: `1px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'}` }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isFocused ? '#2563eb' : (isDarkMode ? '#374151' : '#ffffff'),
        color: state.isFocused ? 'white' : (isDarkMode ? '#ffffff' : '#1f2937'),
        fontWeight: state.isFocused ? '600' : '400',
        padding: '0.75rem 1rem'
    }),
    input: (base) => ({ ...base, color: isDarkMode ? '#ffffff' : '#1f2937' }),
});

const BreakdownRow = ({ label, value, icon: Icon }) => (
    <div className="flex justify-between items-center py-1">
        <div className="flex items-center gap-2">
            {Icon && <Icon size={14} className="text-gray-400 dark:text-gray-500" />}
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{label}</span>
        </div>
        <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{formatCurrency(value)}</span>
    </div>
);

const Paso2_NuevoPlanFinanciero = ({ hook }) => {
    const {
        nuevoPlanFinanciero,
        handleFinancialFieldChange,
        handleCheckboxChange,
        resumenNuevoPlan,
        nuevaViviendaSeleccionada,
        cliente,
        errors = {},
        totalAbonadoCliente
    } = hook;

    if (!cliente || !cliente.datosCliente) {
        return (
            <div className="flex flex-col items-center justify-center p-12">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Cargando datos del cliente...</p>
            </div>
        );
    }

    const isDarkMode = document.documentElement.classList.contains('dark');
    const cuotaInicialObligatoria = totalAbonadoCliente > 0;
    const { datosCliente } = cliente;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header con título y descripción */}
            <div className='text-center space-y-2'>
                <div className="flex items-center justify-center gap-3 mb-2">
                    <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/30">
                        <Calculator size={24} className="text-white" />
                    </div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                        Nuevo Plan Financiero
                    </h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    Configure las fuentes de pago para la nueva vivienda. La suma de los recursos debe ser igual al valor total.
                </p>
            </div>

            {/* Resumen financiero modernizado */}
            <div className="relative overflow-hidden rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-gradient-to-br from-white via-gray-50 to-blue-50/30 dark:from-gray-800 dark:via-gray-850 dark:to-blue-900/10 shadow-xl">
                {/* Decoración de fondo */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl"></div>

                <div className="relative grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-700">
                    {/* Valor Nueva Vivienda */}
                    <div className="p-6 flex flex-col">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                                <Home size={20} className="text-blue-600 dark:text-blue-400" />
                            </div>
                            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Valor Nueva Vivienda</p>
                        </div>
                        <div className="flex-grow space-y-2 mb-4">
                            <BreakdownRow label="Valor Base" value={nuevaViviendaSeleccionada?.valorBase || 0} icon={Building2} />
                            {nuevaViviendaSeleccionada?.recargoEsquinera > 0 && (
                                <BreakdownRow label="Recargo Esquinera" value={nuevaViviendaSeleccionada.recargoEsquinera} icon={Sparkles} />
                            )}
                            <BreakdownRow label="Gastos Notariales" value={GASTOS_NOTARIALES_FIJOS} icon={FileCheck} />
                        </div>
                        <div className="pt-4 border-t-2 border-dashed border-gray-300 dark:border-gray-600">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Total a Pagar</p>
                            <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                                {formatCurrency(resumenNuevoPlan.totalAPagar)}
                            </p>
                        </div>
                    </div>

                    {/* Total Recursos */}
                    <div className="p-6 flex flex-col">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                                <Wallet size={20} className="text-purple-600 dark:text-purple-400" />
                            </div>
                            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Total Recursos</p>
                        </div>
                        <div className="flex-grow space-y-2 mb-4">
                            {totalAbonadoCliente > 0 && (
                                <div className="pb-2 mb-2 border-b border-dashed border-gray-300 dark:border-gray-600">
                                    <BreakdownRow label="Abonos Previos" value={totalAbonadoCliente} icon={PiggyBank} />
                                </div>
                            )}
                            {nuevoPlanFinanciero.aplicaCuotaInicial && nuevoPlanFinanciero.cuotaInicial.monto > 0 && (
                                <BreakdownRow label="Cuota Inicial" value={nuevoPlanFinanciero.cuotaInicial.monto} icon={DollarSign} />
                            )}
                            {nuevoPlanFinanciero.aplicaCredito && nuevoPlanFinanciero.credito.monto > 0 && (
                                <BreakdownRow label="Crédito" value={nuevoPlanFinanciero.credito.monto} icon={CreditCard} />
                            )}
                            {nuevoPlanFinanciero.aplicaSubsidioVivienda && nuevoPlanFinanciero.subsidioVivienda.monto > 0 && (
                                <BreakdownRow label="Subsidio MCY" value={nuevoPlanFinanciero.subsidioVivienda.monto} icon={Gift} />
                            )}
                            {nuevoPlanFinanciero.aplicaSubsidioCaja && nuevoPlanFinanciero.subsidioCaja.monto > 0 && (
                                <BreakdownRow label="Sub. Caja" value={nuevoPlanFinanciero.subsidioCaja.monto} icon={Gift} />
                            )}
                        </div>
                        <div className="pt-4 border-t-2 border-dashed border-gray-300 dark:border-gray-600">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Total Sumado</p>
                            <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                                {formatCurrency(resumenNuevoPlan.totalRecursos)}
                            </p>
                        </div>
                    </div>

                    {/* Diferencia */}
                    <div className="p-6 flex flex-col items-center justify-center">
                        <div className={`mb-4 p-3 rounded-full ${resumenNuevoPlan.diferencia === 0
                                ? 'bg-green-100 dark:bg-green-900/50'
                                : 'bg-red-100 dark:bg-red-900/50'
                            }`}>
                            {resumenNuevoPlan.diferencia === 0 ? (
                                <CheckCircle2 size={32} className="text-green-600 dark:text-green-400" />
                            ) : (
                                <XCircleIcon size={32} className="text-red-600 dark:text-red-400" />
                            )}
                        </div>
                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Diferencia</p>
                        <p className={`text-3xl font-bold mb-2 ${resumenNuevoPlan.diferencia === 0
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                            {formatCurrency(resumenNuevoPlan.diferencia)}
                        </p>
                        <p className={`text-xs font-medium px-3 py-1 rounded-full ${resumenNuevoPlan.diferencia === 0
                                ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                                : 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
                            }`}>
                            {resumenNuevoPlan.diferencia === 0 ? '✓ Plan Cuadrado' : '⚠ Debe ser $0'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Banner de abonos previos */}
            {cuotaInicialObligatoria && (
                <div className="relative overflow-hidden flex items-start gap-4 p-5 bg-gradient-to-r from-blue-50 via-cyan-50 to-blue-50 dark:from-blue-900/20 dark:via-cyan-900/20 dark:to-blue-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-xl shadow-lg">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl"></div>
                    <div className="relative p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
                        <AlertCircle size={24} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="relative flex-1">
                        <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-1">Abonos Previos Detectados</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-400">
                            El cliente tiene un total de <strong className="font-bold">{formatCurrency(totalAbonadoCliente)}</strong> en abonos.
                            Este monto se ha establecido como el valor mínimo para la nueva Cuota Inicial.
                        </p>
                    </div>
                </div>
            )}

            {/* Fuentes de Pago - Modernizadas */}
            <div className="space-y-5">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-lg shadow-purple-500/30">
                        <TrendingUp size={20} className="text-white" />
                    </div>
                    <h4 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                        Fuentes de Pago
                    </h4>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* CUOTA INICIAL */}
                    <div className={`group relative overflow-hidden transition-all duration-300 ${nuevoPlanFinanciero.aplicaCuotaInicial
                            ? 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-900/20 dark:via-teal-900/20 dark:to-cyan-900/20 border-2 border-emerald-300 dark:border-emerald-700 shadow-lg shadow-emerald-100 dark:shadow-emerald-900/20'
                            : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700'
                        } rounded-xl p-5 ${cuotaInicialObligatoria ? 'ring-4 ring-emerald-200 dark:ring-emerald-800' : ''}`}>
                        {/* Decoración */}
                        {nuevoPlanFinanciero.aplicaCuotaInicial && (
                            <div className="absolute -top-6 -right-6 w-24 h-24 bg-emerald-400/20 rounded-full blur-2xl"></div>
                        )}

                        <div className="relative">
                            {/* Header del checkbox */}
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className={`relative flex-shrink-0 w-6 h-6 rounded-md border-2 transition-all ${nuevoPlanFinanciero.aplicaCuotaInicial
                                        ? 'bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-600'
                                        : 'border-gray-300 dark:border-gray-600 group-hover:border-emerald-400'
                                    } ${cuotaInicialObligatoria ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    <input
                                        type="checkbox"
                                        name="aplicaCuotaInicial"
                                        checked={nuevoPlanFinanciero.aplicaCuotaInicial}
                                        onChange={handleCheckboxChange}
                                        className="absolute opacity-0 w-full h-full cursor-pointer"
                                        disabled={cuotaInicialObligatoria}
                                    />
                                    {nuevoPlanFinanciero.aplicaCuotaInicial && (
                                        <CheckCircle2 size={16} className="absolute inset-0 m-auto text-white" />
                                    )}
                                </div>
                                <div className="flex items-center gap-2.5 flex-1">
                                    <div className={`p-1.5 rounded-lg transition-colors ${nuevoPlanFinanciero.aplicaCuotaInicial
                                            ? 'bg-emerald-100 dark:bg-emerald-900/50'
                                            : 'bg-gray-100 dark:bg-gray-700'
                                        }`}>
                                        <DollarSign size={18} className={
                                            nuevoPlanFinanciero.aplicaCuotaInicial
                                                ? 'text-emerald-600 dark:text-emerald-400'
                                                : 'text-gray-500 dark:text-gray-400'
                                        } />
                                    </div>
                                    <span className="font-bold text-gray-800 dark:text-gray-200">Cuota Inicial</span>
                                    {cuotaInicialObligatoria && (
                                        <span className="ml-auto px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-full">
                                            Obligatoria
                                        </span>
                                    )}
                                </div>
                            </label>

                            {/* Campo de monto */}
                            {nuevoPlanFinanciero.aplicaCuotaInicial && (
                                <div className="space-y-2 mt-5 pt-5 border-t-2 border-dashed border-emerald-200 dark:border-emerald-800 animate-fade-in">
                                    <label className="flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-300">
                                        <BadgeDollarSign size={16} />
                                        Monto de la Cuota Inicial
                                    </label>
                                    <NumericFormat
                                        value={nuevoPlanFinanciero.cuotaInicial.monto}
                                        onValueChange={(values) => handleFinancialFieldChange('cuotaInicial', 'monto', values.floatValue)}
                                        className={`w-full border-2 px-4 py-3 rounded-xl font-bold text-lg dark:bg-gray-800 dark:text-white transition-all ${errors.cuotaInicial
                                                ? 'border-red-500 ring-4 ring-red-100 dark:ring-red-900/50'
                                                : 'border-emerald-300 dark:border-emerald-700 focus:ring-4 focus:ring-emerald-100 dark:focus:ring-emerald-900/50'
                                            }`}
                                        thousandSeparator="."
                                        decimalSeparator=","
                                        prefix="$ "
                                        placeholder="$ 0"
                                    />
                                    {errors.cuotaInicial && (
                                        <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                            <AlertCircle size={16} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm text-red-700 dark:text-red-300">{errors.cuotaInicial}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* CRÉDITO HIPOTECARIO */}
                    <div className={`group relative overflow-hidden transition-all duration-300 ${nuevoPlanFinanciero.aplicaCredito
                            ? 'bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-violet-900/20 border-2 border-blue-300 dark:border-blue-700 shadow-lg shadow-blue-100 dark:shadow-blue-900/20'
                            : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                        } rounded-xl p-5`}>
                        {nuevoPlanFinanciero.aplicaCredito && (
                            <div className="absolute -top-6 -right-6 w-24 h-24 bg-blue-400/20 rounded-full blur-2xl"></div>
                        )}

                        <div className="relative">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className={`relative flex-shrink-0 w-6 h-6 rounded-md border-2 transition-all ${nuevoPlanFinanciero.aplicaCredito
                                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600 border-blue-600'
                                        : 'border-gray-300 dark:border-gray-600 group-hover:border-blue-400'
                                    }`}>
                                    <input
                                        type="checkbox"
                                        name="aplicaCredito"
                                        checked={nuevoPlanFinanciero.aplicaCredito}
                                        onChange={handleCheckboxChange}
                                        className="absolute opacity-0 w-full h-full cursor-pointer"
                                    />
                                    {nuevoPlanFinanciero.aplicaCredito && (
                                        <CheckCircle2 size={16} className="absolute inset-0 m-auto text-white" />
                                    )}
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <div className={`p-1.5 rounded-lg transition-colors ${nuevoPlanFinanciero.aplicaCredito
                                            ? 'bg-blue-100 dark:bg-blue-900/50'
                                            : 'bg-gray-100 dark:bg-gray-700'
                                        }`}>
                                        <CreditCard size={18} className={
                                            nuevoPlanFinanciero.aplicaCredito
                                                ? 'text-blue-600 dark:text-blue-400'
                                                : 'text-gray-500 dark:text-gray-400'
                                        } />
                                    </div>
                                    <span className="font-bold text-gray-800 dark:text-gray-200">Crédito Hipotecario</span>
                                </div>
                            </label>

                            {nuevoPlanFinanciero.aplicaCredito && (
                                <div className="space-y-4 mt-5 pt-5 border-t-2 border-dashed border-blue-200 dark:border-blue-800 animate-fade-in">
                                    {/* Banco y Monto */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className='space-y-2'>
                                            <label className="flex items-center gap-2 text-sm font-bold text-blue-700 dark:text-blue-300">
                                                <Building2 size={16} />
                                                Banco
                                            </label>
                                            <Select
                                                options={creditoOptions}
                                                value={creditoOptions.find(o => o.value === nuevoPlanFinanciero.credito.banco)}
                                                onChange={(opt) => handleFinancialFieldChange('credito', 'banco', opt ? opt.value : '')}
                                                styles={getSelectStyles(!!errors.credito_banco, isDarkMode)}
                                                placeholder="Seleccionar banco..."
                                            />
                                        </div>
                                        <div className='space-y-2'>
                                            <label className="flex items-center gap-2 text-sm font-bold text-blue-700 dark:text-blue-300">
                                                <BadgeDollarSign size={16} />
                                                Monto
                                            </label>
                                            <NumericFormat
                                                value={nuevoPlanFinanciero.credito.monto}
                                                onValueChange={(values) => handleFinancialFieldChange('credito', 'monto', values.floatValue)}
                                                className="w-full border-2 border-blue-300 dark:border-blue-700 px-4 py-2.5 rounded-xl dark:bg-gray-800 dark:text-white font-semibold focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/50"
                                                thousandSeparator="."
                                                decimalSeparator=","
                                                prefix="$ "
                                                placeholder="$ 0"
                                            />
                                        </div>
                                    </div>

                                    {/* Referencia */}
                                    <div className='space-y-2'>
                                        <label className="flex items-center gap-2 text-sm font-bold text-blue-700 dark:text-blue-300">
                                            Referencia del Crédito (Opcional)
                                            <HelpTooltip
                                                id="ref-credito-transferencia"
                                                content="ID o código único de la solicitud. Ej: Número de caso SIB de Bancolombia, número de radicado, etc."
                                            />
                                        </label>
                                        <input
                                            name="caso"
                                            type="text"
                                            value={nuevoPlanFinanciero.credito.caso || ''}
                                            onChange={(e) => handleFinancialFieldChange('credito', 'caso', e.target.value)}
                                            className="w-full border-2 border-blue-200 dark:border-blue-800 px-4 py-2.5 rounded-xl dark:bg-gray-800 dark:text-white focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/50"
                                            placeholder="Ej: SIB-12345678"
                                        />
                                    </div>

                                    {/* Carta de Aprobación */}
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-bold text-blue-700 dark:text-blue-300">
                                            <FileText size={16} />
                                            Carta Aprobación Crédito <span className="text-red-500">*</span>
                                        </label>
                                        {nuevoPlanFinanciero.credito.urlCartaAprobacion ? (
                                            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700 rounded-xl">
                                                <div className='flex items-center gap-3'>
                                                    <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                                                        <FileText size={20} className="text-green-600 dark:text-green-400" />
                                                    </div>
                                                    <a
                                                        href={nuevoPlanFinanciero.credito.urlCartaAprobacion}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm font-bold text-green-700 dark:text-green-300 hover:underline"
                                                    >
                                                        Ver Carta de Aprobación
                                                    </a>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleFinancialFieldChange('credito', 'urlCartaAprobacion', null)}
                                                    className="p-2 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                                                    title="Eliminar documento"
                                                >
                                                    <XCircle size={20} />
                                                </button>
                                            </div>
                                        ) : (
                                            <FileUpload
                                                label="Subir Carta de Aprobación"
                                                filePath={(fileName) => `documentos_clientes/${datosCliente.cedula}/transferencia-carta-credito-${fileName}`}
                                                onUploadSuccess={(url) => handleFinancialFieldChange('credito', 'urlCartaAprobacion', url)}
                                                disabled={!datosCliente.cedula}
                                            />
                                        )}
                                        {errors.credito_urlCartaAprobacion && (
                                            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                                <AlertCircle size={16} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                                <p className="text-sm text-red-700 dark:text-red-300">{errors.credito_urlCartaAprobacion}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Subsidio Mi Casa Ya */}
                    <div className={`group relative overflow-hidden transition-all duration-300 ${nuevoPlanFinanciero.aplicaSubsidioVivienda
                            ? 'bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-950/30 dark:via-amber-950/30 dark:to-yellow-950/30 border-2 border-orange-300 dark:border-orange-700 shadow-lg shadow-orange-500/10'
                            : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700'
                        } rounded-xl p-5`}>

                        {/* Decoración blur */}
                        {nuevoPlanFinanciero.aplicaSubsidioVivienda && (
                            <div className="absolute -top-6 -right-6 w-24 h-24 bg-orange-400/20 dark:bg-orange-500/10 rounded-full blur-2xl pointer-events-none"></div>
                        )}

                        {/* Header con checkbox */}
                        <div className="relative flex items-center gap-3 mb-4">
                            <label className="relative flex items-center cursor-pointer group">
                                <input
                                    type="checkbox"
                                    name="aplicaSubsidioVivienda"
                                    checked={nuevoPlanFinanciero.aplicaSubsidioVivienda}
                                    onChange={handleCheckboxChange}
                                    className="sr-only peer"
                                />
                                <div className={`w-6 h-6 flex items-center justify-center transition-all duration-200 ${nuevoPlanFinanciero.aplicaSubsidioVivienda
                                        ? 'bg-gradient-to-br from-orange-500 to-amber-600 border-2 border-orange-600 dark:border-orange-500'
                                        : 'bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 group-hover:border-orange-400'
                                    } rounded-md shadow-sm`}>
                                    {nuevoPlanFinanciero.aplicaSubsidioVivienda && (
                                        <CheckCircle2 size={16} className="text-white" strokeWidth={3} />
                                    )}
                                </div>
                            </label>

                            <div className="flex items-center gap-2 flex-1">
                                <div className={`p-1.5 rounded-lg transition-colors ${nuevoPlanFinanciero.aplicaSubsidioVivienda
                                        ? 'bg-orange-100 dark:bg-orange-900/50'
                                        : 'bg-gray-100 dark:bg-gray-700'
                                    }`}>
                                    <Gift size={18} className={
                                        nuevoPlanFinanciero.aplicaSubsidioVivienda
                                            ? 'text-orange-600 dark:text-orange-400'
                                            : 'text-gray-500 dark:text-gray-400'
                                    } />
                                </div>
                                <span className={`font-bold text-base ${nuevoPlanFinanciero.aplicaSubsidioVivienda
                                        ? 'text-orange-900 dark:text-orange-100'
                                        : 'text-gray-700 dark:text-gray-300'
                                    }`}>
                                    Subsidio Mi Casa Ya
                                </span>
                            </div>
                        </div>

                        {/* Campos */}
                        {nuevoPlanFinanciero.aplicaSubsidioVivienda && (
                            <div className="relative space-y-3 animate-fade-in">
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-bold text-orange-700 dark:text-orange-300">
                                        <BadgeDollarSign size={16} />
                                        Monto del Subsidio
                                        <HelpTooltip id="sub-vivienda" content="Monto aprobado del subsidio del gobierno." />
                                    </label>
                                    <NumericFormat
                                        value={nuevoPlanFinanciero.subsidioVivienda.monto}
                                        onValueChange={(values) => handleFinancialFieldChange('subsidioVivienda', 'monto', values.floatValue)}
                                        className={`w-full border-2 px-4 py-2.5 rounded-xl font-semibold transition-all focus:outline-none ${errors.subsidioVivienda_monto
                                                ? 'border-red-500 dark:border-red-500 bg-red-50 dark:bg-red-950/20 focus:ring-4 focus:ring-red-100 dark:focus:ring-red-900/50'
                                                : 'border-orange-300 dark:border-orange-700 bg-white dark:bg-gray-800 focus:border-orange-500 dark:focus:border-orange-500 focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-900/50'
                                            } dark:text-white`}
                                        thousandSeparator="."
                                        decimalSeparator=","
                                        prefix="$ "
                                    />
                                    {errors.subsidioVivienda_monto && (
                                        <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg animate-fade-in">
                                            <AlertCircle size={16} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm text-red-700 dark:text-red-300">{errors.subsidioVivienda_monto}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Subsidio Caja de Compensación */}
                    <div className={`group relative overflow-hidden transition-all duration-300 ${nuevoPlanFinanciero.aplicaSubsidioCaja
                            ? 'bg-gradient-to-br from-purple-50 via-fuchsia-50 to-pink-50 dark:from-purple-950/30 dark:via-fuchsia-950/30 dark:to-pink-950/30 border-2 border-purple-300 dark:border-purple-700 shadow-lg shadow-purple-500/10'
                            : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
                        } rounded-xl p-5`}>

                        {/* Decoración blur */}
                        {nuevoPlanFinanciero.aplicaSubsidioCaja && (
                            <div className="absolute -top-6 -right-6 w-24 h-24 bg-purple-400/20 dark:bg-purple-500/10 rounded-full blur-2xl pointer-events-none"></div>
                        )}

                        {/* Header con checkbox */}
                        <div className="relative flex items-center gap-3 mb-4">
                            <label className="relative flex items-center cursor-pointer group">
                                <input
                                    type="checkbox"
                                    name="aplicaSubsidioCaja"
                                    checked={nuevoPlanFinanciero.aplicaSubsidioCaja}
                                    onChange={handleCheckboxChange}
                                    className="sr-only peer"
                                />
                                <div className={`w-6 h-6 flex items-center justify-center transition-all duration-200 ${nuevoPlanFinanciero.aplicaSubsidioCaja
                                        ? 'bg-gradient-to-br from-purple-500 to-fuchsia-600 border-2 border-purple-600 dark:border-purple-500'
                                        : 'bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 group-hover:border-purple-400'
                                    } rounded-md shadow-sm`}>
                                    {nuevoPlanFinanciero.aplicaSubsidioCaja && (
                                        <CheckCircle2 size={16} className="text-white" strokeWidth={3} />
                                    )}
                                </div>
                            </label>

                            <div className="flex items-center gap-2 flex-1">
                                <div className={`p-1.5 rounded-lg transition-colors ${nuevoPlanFinanciero.aplicaSubsidioCaja
                                        ? 'bg-purple-100 dark:bg-purple-900/50'
                                        : 'bg-gray-100 dark:bg-gray-700'
                                    }`}>
                                    <Briefcase size={18} className={
                                        nuevoPlanFinanciero.aplicaSubsidioCaja
                                            ? 'text-purple-600 dark:text-purple-400'
                                            : 'text-gray-500 dark:text-gray-400'
                                    } />
                                </div>
                                <span className={`font-bold text-base ${nuevoPlanFinanciero.aplicaSubsidioCaja
                                        ? 'text-purple-900 dark:text-purple-100'
                                        : 'text-gray-700 dark:text-gray-300'
                                    }`}>
                                    Subsidio Caja de Compensación
                                </span>
                            </div>
                        </div>

                        {/* Campos */}
                        {nuevoPlanFinanciero.aplicaSubsidioCaja && (
                            <div className="relative space-y-4 animate-fade-in">
                                <div className="grid sm:grid-cols-2 gap-3">
                                    {/* Caja */}
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-bold text-purple-700 dark:text-purple-300">
                                            <Building2 size={16} />
                                            Caja
                                        </label>
                                        <Select
                                            options={cajaOptions}
                                            value={cajaOptions.find(o => o.value === nuevoPlanFinanciero.subsidioCaja.caja)}
                                            onChange={(opt) => handleFinancialFieldChange('subsidioCaja', 'caja', opt ? opt.value : '')}
                                            styles={getSelectStyles(!!errors.subsidioCaja_caja, isDarkMode)}
                                            placeholder="Seleccionar caja..."
                                        />
                                        {errors.subsidioCaja_caja && (
                                            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg animate-fade-in">
                                                <AlertCircle size={16} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                                <p className="text-sm text-red-700 dark:text-red-300">{errors.subsidioCaja_caja}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Monto */}
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-bold text-purple-700 dark:text-purple-300">
                                            <BadgeDollarSign size={16} />
                                            Monto
                                        </label>
                                        <NumericFormat
                                            value={nuevoPlanFinanciero.subsidioCaja.monto}
                                            onValueChange={(values) => handleFinancialFieldChange('subsidioCaja', 'monto', values.floatValue)}
                                            className={`w-full border-2 px-4 py-2.5 rounded-xl font-semibold transition-all focus:outline-none ${errors.subsidioCaja_monto
                                                    ? 'border-red-500 dark:border-red-500 bg-red-50 dark:bg-red-950/20 focus:ring-4 focus:ring-red-100 dark:focus:ring-red-900/50'
                                                    : 'border-purple-300 dark:border-purple-700 bg-white dark:bg-gray-800 focus:border-purple-500 dark:focus:border-purple-500 focus:ring-4 focus:ring-purple-100 dark:focus:ring-purple-900/50'
                                                } dark:text-white`}
                                            thousandSeparator="."
                                            decimalSeparator=","
                                            prefix="$ "
                                        />
                                        {errors.subsidioCaja_monto && (
                                            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg animate-fade-in">
                                                <AlertCircle size={16} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                                <p className="text-sm text-red-700 dark:text-red-300">{errors.subsidioCaja_monto}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Carta Aprobación */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-bold text-purple-700 dark:text-purple-300">
                                        <FileText size={16} />
                                        Carta Aprobación Subsidio <span className="text-red-500">*</span>
                                    </label>
                                    {nuevoPlanFinanciero.subsidioCaja.urlCartaAprobacion ? (
                                        <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/30 border-2 border-green-300 dark:border-green-700 rounded-xl shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                                                    <FileText size={20} className="text-green-600 dark:text-green-400" />
                                                </div>
                                                <a
                                                    href={nuevoPlanFinanciero.subsidioCaja.urlCartaAprobacion}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm font-bold text-green-700 dark:text-green-300 hover:underline hover:text-green-800 dark:hover:text-green-200"
                                                >
                                                    Ver Carta de Aprobación
                                                </a>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleFinancialFieldChange('subsidioCaja', 'urlCartaAprobacion', null)}
                                                className="p-2 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                                                title="Eliminar documento"
                                            >
                                                <XCircle size={20} />
                                            </button>
                                        </div>
                                    ) : (
                                        <FileUpload
                                            label="Subir Carta"
                                            filePath={(fileName) => `documentos_clientes/${datosCliente.cedula}/transferencia-carta-subsidio-${fileName}`}
                                            onUploadSuccess={(url) => handleFinancialFieldChange('subsidioCaja', 'urlCartaAprobacion', url)}
                                            disabled={!datosCliente.cedula}
                                        />
                                    )}
                                    {errors.subsidioCaja_urlCartaAprobacion && (
                                        <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg animate-fade-in">
                                            <AlertCircle size={16} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm text-red-700 dark:text-red-300">{errors.subsidioCaja_urlCartaAprobacion}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Valor para Escritura */}
                <div className="mt-8 pt-6 border-t-2 border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="p-2 bg-gradient-to-br from-slate-500 to-gray-600 rounded-lg shadow-lg shadow-slate-500/20">
                            <FileCheck size={20} className="text-white" />
                        </div>
                        <h4 className="text-lg font-bold bg-gradient-to-r from-slate-700 to-gray-700 dark:from-slate-300 dark:to-gray-300 bg-clip-text text-transparent">
                            Valor para Escritura (Opcional)
                        </h4>
                    </div>

                    <div className={`relative overflow-hidden rounded-xl p-5 border-2 transition-all duration-300 ${nuevoPlanFinanciero.usaValorEscrituraDiferente
                            ? 'bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 dark:from-slate-950/30 dark:via-gray-950/30 dark:to-zinc-950/30 border-slate-300 dark:border-slate-700 shadow-lg'
                            : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                        }`}>
                        {/* Decoración */}
                        {nuevoPlanFinanciero.usaValorEscrituraDiferente && (
                            <div className="absolute -top-6 -right-6 w-32 h-32 bg-slate-400/10 dark:bg-slate-500/5 rounded-full blur-3xl pointer-events-none"></div>
                        )}

                        {/* Toggle */}
                        <div className="relative flex items-center justify-between mb-4">
                            <label htmlFor="usaValorEscrituraDiferente" className="font-semibold text-gray-800 dark:text-gray-200 cursor-pointer flex-1">
                                ¿El valor para la escritura es diferente al valor comercial?
                            </label>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    id="usaValorEscrituraDiferente"
                                    name="usaValorEscrituraDiferente"
                                    checked={nuevoPlanFinanciero.usaValorEscrituraDiferente || false}
                                    onChange={handleCheckboxChange}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-slate-300 dark:peer-focus:ring-slate-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-gradient-to-r peer-checked:from-slate-500 peer-checked:to-gray-600 shadow-inner"></div>
                            </label>
                        </div>

                        {/* Campo condicional */}
                        {nuevoPlanFinanciero.usaValorEscrituraDiferente && (
                            <div className="relative space-y-2 animate-fade-in">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                                    <BadgeDollarSign size={16} />
                                    Valor para Escritura (Informativo)
                                </label>
                                <NumericFormat
                                    value={nuevoPlanFinanciero.valorEscritura || ''}
                                    onValueChange={(values) => handleFinancialFieldChange('financiero', 'valorEscritura', values.floatValue)}
                                    className={`w-full border-2 px-4 py-2.5 rounded-xl font-semibold transition-all focus:outline-none ${errors.valorEscritura
                                            ? 'border-red-500 dark:border-red-500 bg-red-50 dark:bg-red-950/20 focus:ring-4 focus:ring-red-100 dark:focus:ring-red-900/50'
                                            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-gray-800 focus:border-slate-500 dark:focus:border-slate-500 focus:ring-4 focus:ring-slate-100 dark:focus:ring-slate-900/50'
                                        } dark:text-white`}
                                    thousandSeparator="."
                                    decimalSeparator=","
                                    prefix="$ "
                                />
                                {errors.valorEscritura && (
                                    <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg animate-fade-in">
                                        <AlertCircle size={16} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-red-700 dark:text-red-300">{errors.valorEscritura}</p>
                                    </div>
                                )}
                                <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                                    <Info size={14} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-xs text-blue-700 dark:text-blue-300">
                                        Este valor es solo para fines informativos y no afecta el saldo de la deuda.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Paso2_NuevoPlanFinanciero;