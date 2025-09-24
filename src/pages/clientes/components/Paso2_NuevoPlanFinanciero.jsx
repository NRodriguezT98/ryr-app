import React from 'react';
import { NumericFormat } from 'react-number-format';
import Select from 'react-select';
import HelpTooltip from '../../../components/HelpTooltip';
import { formatCurrency } from '../../../utils/textFormatters';
import FileUpload from '../../../components/FileUpload';
import { FileText, XCircle, Info, BadgeDollarSign, AlertCircle, TrendingUp } from 'lucide-react';

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

            <div className="space-y-4">
                <div className='text-center'>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Nuevo Plan Financiero</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">La suma de los recursos debe ser igual al valor total de la nueva vivienda.</p>
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
                            {totalAbonadoCliente > 0 && <div className="py-2 border-b border-dashed dark:border-gray-600"><BreakdownRow label="Abonos Previos:" value={totalAbonadoCliente} /></div>}
                            {nuevoPlanFinanciero.aplicaCuotaInicial && nuevoPlanFinanciero.cuotaInicial.monto > 0 && <BreakdownRow label="Cuota Inicial:" value={nuevoPlanFinanciero.cuotaInicial.monto} />}
                            {nuevoPlanFinanciero.aplicaCredito && nuevoPlanFinanciero.credito.monto > 0 && <BreakdownRow label="Crédito:" value={nuevoPlanFinanciero.credito.monto} />}
                            {nuevoPlanFinanciero.aplicaSubsidioVivienda && nuevoPlanFinanciero.subsidioVivienda.monto > 0 && <BreakdownRow label="Subsidio MCY:" value={nuevoPlanFinanciero.subsidioVivienda.monto} />}
                            {nuevoPlanFinanciero.aplicaSubsidioCaja && nuevoPlanFinanciero.subsidioCaja.monto > 0 && <BreakdownRow label="Sub. Caja:" value={nuevoPlanFinanciero.subsidioCaja.monto} />}
                        </div>
                        <p className="text-lg font-bold text-gray-800 dark:text-gray-200">{formatCurrency(resumenNuevoPlan.totalRecursos)}</p>
                    </div>
                    <div className="text-center flex flex-col justify-center">
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Diferencia</p>
                        <p className={`text-2xl font-bold ${resumenNuevoPlan.diferencia === 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{formatCurrency(resumenNuevoPlan.diferencia)}</p>
                    </div>
                </div>
            </div>

            {cuotaInicialObligatoria && (
                <div className="flex items-start p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-blue-800 dark:text-blue-300">Abonos Previos Detectados</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                            El cliente tiene un total de <strong>{formatCurrency(totalAbonadoCliente)}</strong> en abonos. Este monto se ha establecido como el valor mínimo para la nueva Cuota Inicial.
                        </p>
                    </div>
                </div>
            )}

            <div className="pt-6 border-t dark:border-gray-700">
                <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center"><TrendingUp size={20} className="mr-2 text-gray-400" />Fuentes de Pago</h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className={`p-4 border rounded-xl h-full dark:border-gray-700 ${cuotaInicialObligatoria ? 'ring-2 ring-blue-500' : ''}`}>
                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input type="checkbox" name="aplicaCuotaInicial" checked={nuevoPlanFinanciero.aplicaCuotaInicial} onChange={handleCheckboxChange} className="h-5 w-5 rounded text-blue-600" disabled={cuotaInicialObligatoria} />
                            <span className="font-semibold text-gray-700 dark:text-gray-200">Cuota Inicial</span>
                        </label>
                        {nuevoPlanFinanciero.aplicaCuotaInicial && (
                            <div className="space-y-1 mt-4 pt-4 border-t border-dashed dark:border-gray-600">
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Monto</label>
                                <NumericFormat
                                    value={nuevoPlanFinanciero.cuotaInicial.monto}
                                    onValueChange={(values) => handleFinancialFieldChange('cuotaInicial', 'monto', values.floatValue)}
                                    className={`w-full border p-2 rounded-lg dark:bg-gray-700 dark:text-white ${errors.cuotaInicial ? 'border-red-500' : 'dark:border-gray-600'}`}
                                    thousandSeparator="."
                                    decimalSeparator=","
                                    prefix="$ "
                                />
                                {errors.cuotaInicial && <p className="text-red-600 text-sm mt-1">{errors.cuotaInicial}</p>}
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

                                {/* --- CAMPO DE REFERENCIA --- */}
                                <div className='space-y-1 animate-fade-in'>
                                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center">
                                        Referencia del Crédito (Opcional)
                                        <HelpTooltip
                                            id="ref-credito-transferencia"
                                            content="ID o código único de la solicitud. Ej: Número de caso SIB de Bancolombia, número de radicado, etc. Si el banco no lo provee, déjelo vacío."
                                        />
                                    </label>
                                    <input
                                        name="caso"
                                        type="text"
                                        value={nuevoPlanFinanciero.credito.caso || ''}
                                        onChange={(e) => handleFinancialFieldChange('credito', 'caso', e.target.value)}
                                        className={`w-full border p-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.credito_caso ? 'border-red-500' : 'dark:border-gray-600'}`}
                                    />
                                    {errors.credito_caso && <p className="text-red-600 text-sm mt-1">{errors.credito_caso}</p>}
                                </div>

                                {/* --- CAMPO DE CARTA DE APROBACIÓN --- */}
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center">
                                        Carta Aprobación Crédito <span className="text-red-500 ml-1">*</span>
                                    </label>
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
                            <div className="space-y-1 mt-4 pt-4 border-t border-dashed dark:border-gray-600 animate-fade-in">
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center">Monto del Subsidio<HelpTooltip id="sub-vivienda" content="Monto aprobado del subsidio del gobierno." /></label>
                                <NumericFormat value={nuevoPlanFinanciero.subsidioVivienda.monto} onValueChange={(values) => handleFinancialFieldChange('subsidioVivienda', 'monto', values.floatValue)} className={`w-full border p-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.subsidioVivienda_monto ? 'border-red-500' : 'border-gray-300'}`} thousandSeparator="." decimalSeparator="," prefix="$ " />
                                {errors.subsidioVivienda_monto && <p className="text-red-600 text-sm mt-1">{errors.subsidioVivienda_monto}</p>}
                            </div>
                        )}
                    </div>

                    <div className="p-4 border rounded-xl h-full dark:border-gray-700">
                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input type="checkbox" name="aplicaSubsidioCaja" checked={nuevoPlanFinanciero.aplicaSubsidioCaja} onChange={handleCheckboxChange} className="h-5 w-5 rounded text-blue-600" />
                            <span className="font-semibold text-gray-700 dark:text-gray-200">Subsidio Caja de Compensación</span>
                        </label>
                        {nuevoPlanFinanciero.aplicaSubsidioCaja && (
                            <div className="space-y-4 mt-4 pt-4 border-t border-dashed dark:border-gray-600 animate-fade-in">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className='space-y-1'><label className="text-xs font-medium text-gray-500 dark:text-gray-400">Caja</label><Select options={cajaOptions} value={cajaOptions.find(o => o.value === nuevoPlanFinanciero.subsidioCaja.caja)} onChange={(opt) => handleFinancialFieldChange('subsidioCaja', 'caja', opt ? opt.value : '')} styles={getSelectStyles(!!errors.subsidioCaja_caja)} />{errors.subsidioCaja_caja && <p className="text-red-600 text-sm mt-1">{errors.subsidioCaja_caja}</p>}</div>
                                    <div className='space-y-1'><label className="text-xs font-medium text-gray-500 dark:text-gray-400">Monto</label><NumericFormat value={nuevoPlanFinanciero.subsidioCaja.monto} onValueChange={(values) => handleFinancialFieldChange('subsidioCaja', 'monto', values.floatValue)} className={`w-full border p-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.subsidioCaja_monto ? 'border-red-500' : 'border-gray-300'}`} thousandSeparator="." decimalSeparator="," prefix="$ " />{errors.subsidioCaja_monto && <p className="text-red-600 text-sm mt-1">{errors.subsidioCaja_monto}</p>}</div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center">Carta Aprobación Subsidio <span className="text-red-500 ml-1">*</span></label>
                                    {nuevoPlanFinanciero.subsidioCaja.urlCartaAprobacion ? (
                                        <div className="bg-green-50 dark:bg-green-900/50 border-2 border-green-200 dark:border-green-700 rounded-lg p-3 flex items-center justify-between">
                                            <div className='flex items-center gap-2 text-green-800 dark:text-green-300 font-semibold text-sm'><FileText size={16} /><a href={nuevoPlanFinanciero.subsidioCaja.urlCartaAprobacion} target="_blank" rel="noopener noreferrer" className="hover:underline">Ver Carta</a></div>
                                            <button type="button" onClick={() => handleFinancialFieldChange('subsidioCaja', 'urlCartaAprobacion', null)} className="p-1 text-red-500 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50" title="Eliminar documento"><XCircle size={20} /></button>
                                        </div>
                                    ) : (<FileUpload label="Subir Carta" filePath={(fileName) => `documentos_clientes/${datosCliente.cedula}/transferencia-carta-subsidio-${fileName}`} onUploadSuccess={(url) => handleFinancialFieldChange('subsidioCaja', 'urlCartaAprobacion', url)} disabled={!datosCliente.cedula} />)}
                                    {errors.subsidioCaja_urlCartaAprobacion && <p className="text-red-600 text-sm mt-1">{errors.subsidioCaja_urlCartaAprobacion}</p>}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-6 pt-6 border-t dark:border-gray-700">
                <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Valor para Escritura (Opcional)</h4>
                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                        <label htmlFor="usaValorEscrituraDiferente" className="font-medium text-gray-800 dark:text-gray-200 cursor-pointer">
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
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                    {nuevoPlanFinanciero.usaValorEscrituraDiferente && (
                        <div className="mt-4 animate-fade-in">
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Valor para Escritura (Informativo)</label>
                            <NumericFormat
                                value={nuevoPlanFinanciero.valorEscritura || ''}
                                onValueChange={(values) => handleFinancialFieldChange('financiero', 'valorEscritura', values.floatValue)}
                                className={`w-full border p-2 rounded-lg dark:bg-gray-800 dark:border-gray-600 ${errors.valorEscritura ? "border-red-500" : "border-gray-300"}`}
                                thousandSeparator="."
                                decimalSeparator=","
                                prefix="$ "
                            />
                            {errors.valorEscritura && <p className="text-red-600 text-sm mt-1">{errors.valorEscritura}</p>}
                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Info size={14} /> Este valor es solo para fines informativos y no afecta el saldo de la deuda.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Paso2_NuevoPlanFinanciero;