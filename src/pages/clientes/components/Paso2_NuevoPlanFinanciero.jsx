import React from 'react';
import { NumericFormat } from 'react-number-format';
import Select from 'react-select';
import HelpTooltip from '../../../components/HelpTooltip';
import { formatCurrency } from '../../../utils/textFormatters';
import FileUpload from '../../../components/FileUpload';
import { FileText, XCircle, Info, BadgeDollarSign } from 'lucide-react';

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

const getSelectStyles = (hasError) => ({
    control: (base, state) => ({ ...base, backgroundColor: 'var(--color-bg-form)', borderColor: hasError ? '#ef4444' : (state.isFocused ? '#3b82f6' : '#4b5563'), '&:hover': { borderColor: hasError ? '#ef4444' : '#3b82f6', }, boxShadow: 'none', padding: '0.1rem' }),
    singleValue: (base) => ({ ...base, color: 'var(--color-text-form)' }),
    menu: (base) => ({ ...base, backgroundColor: 'var(--color-bg-form)' }),
    option: (base, state) => ({ ...base, backgroundColor: state.isFocused ? '#2563eb' : 'var(--color-bg-form)', color: state.isFocused ? 'white' : 'var(--color-text-form)' }),
    input: (base) => ({ ...base, color: 'var(--color-text-form)' }),
});

const BreakdownRow = ({ label, value }) => (
    <div className="flex justify-between items-center">
        <span className="text-gray-600 dark:text-gray-400">{label}</span>
        <span className="font-semibold text-gray-800 dark:text-gray-200">{formatCurrency(value)}</span>
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
        return <div className="text-center p-8">Cargando datos del cliente...</div>;
    }

    const isDarkMode = document.documentElement.classList.contains('dark');
    const cuotaInicialObligatoria = totalAbonadoCliente > 0;

    const { datosCliente } = cliente;

    return (
        <div className="space-y-6 animate-fade-in">
            <style>{`:root { --color-bg-form: ${isDarkMode ? '#374151' : '#ffffff'}; --color-text-form: ${isDarkMode ? '#ffffff' : '#1f2937'}; }`}</style>
            <div className='text-center'>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">2. Nuevo Plan Financiero</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Defina las fuentes de pago para la nueva vivienda. La suma debe ser igual al valor total.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-700">
                <div className="text-center flex flex-col">
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Valor Nueva Vivienda</p>
                    <div className="flex-grow text-xs mt-2 space-y-1 px-2 border-b dark:border-gray-600 pb-2 mb-2">
                        <BreakdownRow label="Valor Base:" value={nuevaViviendaSeleccionada?.valorBase || 0} />
                        {nuevaViviendaSeleccionada?.recargoEsquinera > 0 && <BreakdownRow label="R. Esquinera:" value={nuevaViviendaSeleccionada.recargoEsquinera} />}
                        <BreakdownRow label="G. Notariales:" value={GASTOS_NOTARIALES_FIJOS} />
                    </div>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{formatCurrency(resumenNuevoPlan.totalAPagar)}</p>
                </div>
                <div className="text-center flex flex-col">
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Total Recursos</p>
                    <div className="flex-grow text-xs mt-2 space-y-1 px-2 border-b dark:border-gray-600 pb-2 mb-2">
                        {totalAbonadoCliente > 0 &&
                            <div className="py-2 border-b border-dashed dark:border-gray-600">
                                <BreakdownRow label="Abonos Previos:" value={totalAbonadoCliente} className="text-green-600 dark:text-green-400" />
                            </div>
                        }
                        {nuevoPlanFinanciero.aplicaCuotaInicial && nuevoPlanFinanciero.cuotaInicial.monto > 0 && <BreakdownRow label="Cuota Inicial:" value={nuevoPlanFinanciero.cuotaInicial.monto} />}
                        {nuevoPlanFinanciero.aplicaCredito && nuevoPlanFinanciero.credito.monto > 0 && <BreakdownRow label="Crédito:" value={nuevoPlanFinanciero.credito.monto} />}
                        {nuevoPlanFinanciero.aplicaSubsidioVivienda && nuevoPlanFinanciero.subsidioVivienda.monto > 0 && <BreakdownRow label="Subsidio MCY:" value={nuevoPlanFinanciero.subsidioVivienda.monto} />}
                        {nuevoPlanFinanciero.aplicaSubsidioCaja && nuevoPlanFinanciero.subsidioCaja.monto > 0 && <BreakdownRow label="Sub. Caja:" value={nuevoPlanFinanciero.subsidioCaja.monto} />}
                    </div>
                    <p className="text-lg font-bold text-gray-800 dark:text-gray-200">{formatCurrency(resumenNuevoPlan.totalRecursos)}</p>
                </div>
                <div className="text-center">
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Diferencia</p>
                    <p className={`text-2xl font-bold ${resumenNuevoPlan.diferencia === 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{formatCurrency(resumenNuevoPlan.diferencia)}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6 pt-6 border-t dark:border-gray-700">

                <div className={`p-4 border rounded-xl h-full dark:border-gray-700 ${cuotaInicialObligatoria ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : ''}`}>
                    <label className="flex items-center space-x-3 cursor-pointer">
                        <input type="checkbox" name="aplicaCuotaInicial" checked={nuevoPlanFinanciero.aplicaCuotaInicial} onChange={handleCheckboxChange} className="h-5 w-5 rounded text-blue-600" disabled={cuotaInicialObligatoria} />
                        <span className="font-semibold text-gray-700 dark:text-gray-200">Cuota Inicial</span>
                        {cuotaInicialObligatoria && <HelpTooltip id="ci-obligatoria" content="Esta fuente es obligatoria porque el cliente ya tiene abonos registrados." />}
                    </label>
                    {nuevoPlanFinanciero.aplicaCuotaInicial && (
                        <div className="space-y-1 mt-4 pt-4 border-t border-dashed dark:border-gray-600">
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Monto</label>
                            <NumericFormat value={nuevoPlanFinanciero.cuotaInicial.monto} onValueChange={(values) => handleFinancialFieldChange('cuotaInicial', 'monto', values.floatValue)} className={`w-full border p-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white`} thousandSeparator="." decimalSeparator="," prefix="$ " />
                            {cuotaInicialObligatoria && (
                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1">
                                    <BadgeDollarSign size={14} />
                                    El monto debe ser al menos de {formatCurrency(totalAbonadoCliente)}.
                                </p>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-4 border rounded-xl h-full dark:border-gray-700">
                    <label className="flex items-center space-x-3 cursor-pointer">
                        <input type="checkbox" name="aplicaCredito" checked={nuevoPlanFinanciero.aplicaCredito} onChange={handleCheckboxChange} className="h-5 w-5 rounded text-blue-600" />
                        <span className="font-semibold text-gray-700 dark:text-gray-200">Crédito Hipotecario</span>
                    </label>
                    {nuevoPlanFinanciero.aplicaCredito && (
                        <div className="space-y-4 mt-4 pt-4 border-t border-dashed dark:border-gray-600">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className='space-y-1'>
                                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Banco</label>
                                    <Select options={creditoOptions} value={creditoOptions.find(o => o.value === nuevoPlanFinanciero.credito.banco)} onChange={(opt) => handleFinancialFieldChange('credito', 'banco', opt ? opt.value : '')} styles={getSelectStyles(!!errors.credito_banco)} />
                                </div>
                                <div className='space-y-1'>
                                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Monto</label>
                                    <NumericFormat value={nuevoPlanFinanciero.credito.monto} onValueChange={(values) => handleFinancialFieldChange('credito', 'monto', values.floatValue)} className={`w-full border p-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white`} thousandSeparator="." decimalSeparator="," prefix="$ " />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center">
                                    Carta Aprobación Crédito <span className="text-red-500 ml-1">*</span>
                                </label>
                                {/* --- INICIO DE LA MODIFICACIÓN --- */}
                                {nuevoPlanFinanciero.credito.urlCartaAprobacion ? (
                                    <div className="bg-green-50 dark:bg-green-900/50 border-2 border-green-200 dark:border-green-700 rounded-lg p-3 flex items-center justify-between">
                                        <div className='flex items-center gap-2 text-green-800 dark:text-green-300 font-semibold text-sm'>
                                            <FileText size={16} />
                                            <a href={nuevoPlanFinanciero.credito.urlCartaAprobacion} target="_blank" rel="noopener noreferrer" className="hover:underline">Ver Carta</a>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleFinancialFieldChange('credito', 'urlCartaAprobacion', null)}
                                            className="p-1 text-red-500 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50"
                                            title="Eliminar documento"
                                        >
                                            <XCircle size={20} />
                                        </button>
                                    </div>
                                ) : (
                                    <FileUpload
                                        label="Subir Carta"
                                        filePath={(fileName) => `documentos_clientes/${datosCliente.cedula}/transferencia-carta-credito-${fileName}`}
                                        onUploadSuccess={(url) => handleFinancialFieldChange('credito', 'urlCartaAprobacion', url)}
                                        disabled={!datosCliente.cedula}
                                    />
                                )}
                                {errors.credito_urlCartaAprobacion && <p className="text-red-600 text-sm mt-1">{errors.credito_urlCartaAprobacion}</p>}
                                {/* --- FIN DE LA MODIFICACIÓN --- */}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border rounded-xl h-full dark:border-gray-700">
                    <label className="flex items-center space-x-3 cursor-pointer">
                        <input type="checkbox" name="aplicaSubsidioVivienda" checked={nuevoPlanFinanciero.aplicaSubsidioVivienda} onChange={handleCheckboxChange} className="h-5 w-5 rounded text-blue-600" />
                        <span className="font-semibold text-gray-700 dark:text-gray-200">Subsidio Mi Casa Ya</span>
                    </label>
                    {nuevoPlanFinanciero.aplicaSubsidioVivienda && (
                        <div className="space-y-1 mt-4 pt-4 border-t border-dashed dark:border-gray-600">
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Monto del Subsidio</label>
                            <NumericFormat value={nuevoPlanFinanciero.subsidioVivienda.monto} onValueChange={(values) => handleFinancialFieldChange('subsidioVivienda', 'monto', values.floatValue)} className={`w-full border p-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white`} thousandSeparator="." decimalSeparator="," prefix="$ " />
                        </div>
                    )}
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center">
                        Carta Aprobación Subsidio <span className="text-red-500 ml-1">*</span>
                    </label>
                    {/* --- INICIO DE LA MODIFICACIÓN --- */}
                    {nuevoPlanFinanciero.subsidioCaja.urlCartaAprobacion ? (
                        <div className="bg-green-50 dark:bg-green-900/50 border-2 border-green-200 dark:border-green-700 rounded-lg p-3 flex items-center justify-between">
                            <div className='flex items-center gap-2 text-green-800 dark:text-green-300 font-semibold text-sm'>
                                <FileText size={16} />
                                <a href={nuevoPlanFinanciero.subsidioCaja.urlCartaAprobacion} target="_blank" rel="noopener noreferrer" className="hover:underline">Ver Carta</a>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleFinancialFieldChange('subsidioCaja', 'urlCartaAprobacion', null)}
                                className="p-1 text-red-500 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50"
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
                    {errors.subsidioCaja_urlCartaAprobacion && <p className="text-red-600 text-sm mt-1">{errors.subsidioCaja_urlCartaAprobacion}</p>}
                    {/* --- FIN DE LA MODIFICACIÓN --- */}
                </div>
            </div>
        </div>
    );
};

export default Paso2_NuevoPlanFinanciero;