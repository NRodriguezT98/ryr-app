import React, { useCallback } from 'react';
import { NumericFormat } from 'react-number-format';
import Select from 'react-select';
import AnimatedPage from '../../../components/AnimatedPage';
import HelpTooltip from '../../../components/HelpTooltip';
import { formatCurrency } from '../../../utils/textFormatters';
import { useClienteFinanciero } from '../../../hooks/clientes/useClienteFinanciero';
import FileUpload from '../../../components/FileUpload';
import { FileText, XCircle, Lock, Info } from 'lucide-react';

const creditoOptions = [
    { value: 'Bancolombia', label: 'Bancolombia' },
    { value: 'Davivienda', label: 'Davivienda' },
    { value: 'Banco de Bogotá', label: 'Banco de Bogotá' },
    { value: 'FondoNacionalDelAhorro', label: 'Fondo Nacional Del Ahorro' },
    { value: 'Banco Agrario', label: 'Banco Agrario' },
    { value: 'Otro', label: 'Otro' }
];
const cajaOptions = [
    { value: 'Comfandi', label: 'Comfandi' },
    { value: 'Comfenalco', label: 'Comfenalco' },
    { value: 'Otra', label: 'Otra' }
];

const GASTOS_NOTARIALES_FIJOS = 5000000;

const BreakdownRow = ({ label, value }) => (
    <div className="flex justify-between items-center">
        <span className="text-gray-600 dark:text-gray-400">{label}</span>
        <span className="font-semibold text-gray-800 dark:text-gray-200">{formatCurrency(value)}</span>
    </div>
);

const getSelectStyles = (hasError) => ({
    control: (base, state) => ({
        ...base,
        backgroundColor: 'var(--color-bg-form)',
        borderColor: hasError ? '#ef4444' : (state.isFocused ? '#3b82f6' : '#4b5563'),
        '&:hover': {
            borderColor: hasError ? '#ef4444' : '#3b82f6',
        },
        boxShadow: 'none',
        padding: '0.1rem'
    }),
    singleValue: (base) => ({ ...base, color: 'var(--color-text-form)' }),
    menu: (base) => ({ ...base, backgroundColor: 'var(--color-bg-form)' }),
    option: (base, state) => ({ ...base, backgroundColor: state.isFocused ? '#2563eb' : 'var(--color-bg-form)', color: state.isFocused ? 'white' : 'var(--color-text-form)' }),
    input: (base) => ({ ...base, color: 'var(--color-text-form)' }),
});

const Step3_Financial = ({ formData, dispatch, errors, handleFinancialFieldChange, isEditing, isLocked, modo }) => {
    const { financiero, viviendaSeleccionada, documentos, datosCliente } = formData;
    const resumenFinanciero = useClienteFinanciero(financiero, viviendaSeleccionada?.valorTotal);

    const handleCheckboxChange = useCallback((e) => {
        dispatch({ type: 'TOGGLE_FINANCIAL_OPTION', payload: { field: e.target.name, value: e.target.checked } });
    }, [dispatch]);

    const handleDocumentUpload = useCallback((docId, url) => {
        dispatch({ type: 'UPDATE_DOCUMENTO_URL', payload: { docId, url } });
    }, [dispatch]);

    if (isLocked) {
        return (
            <div className="animate-fade-in p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-center">
                <Lock className="mx-auto text-gray-400" size={40} />
                <h4 className="mt-4 font-bold text-gray-800 dark:text-gray-200">Información Financiera Bloqueada</h4>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    La información financiera del cliente ya no puede ser modificada porque el proceso ha alcanzado la etapa de firma de escritura.
                </p>
            </div>
        );
    }

    return (
        <AnimatedPage>
            <style>{`
                :root {
                  --color-bg-form: ${document.documentElement.classList.contains('dark') ? '#374151' : '#ffffff'};
                  --color-text-form: ${document.documentElement.classList.contains('dark') ? '#ffffff' : '#1f2937'};
                }
            `}</style>
            <div className="space-y-6">
                <div className='text-center'>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">3. Cierre Financiero</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">La suma de los recursos debe ser igual al Valor de la Vivienda.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-700">
                    <div className="text-center flex flex-col">
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Valor Vivienda</p>
                        <div className="flex-grow text-xs mt-2 space-y-1 px-2 border-b dark:border-gray-600 pb-2 mb-2">
                            <BreakdownRow label="Valor Base:" value={viviendaSeleccionada?.valorBase || 0} />
                            {viviendaSeleccionada?.recargoEsquinera > 0 && <BreakdownRow label="R. Esquinera:" value={viviendaSeleccionada.recargoEsquinera} />}
                            <BreakdownRow label="G. Notariales:" value={GASTOS_NOTARIALES_FIJOS} />
                        </div>
                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{formatCurrency(resumenFinanciero.totalAPagar)}</p>
                    </div>

                    <div className="text-center flex flex-col">
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Total Recursos</p>
                        <div className="flex-grow text-xs mt-2 space-y-1 px-2 border-b dark:border-gray-600 pb-2 mb-2">
                            {financiero.aplicaCuotaInicial && financiero.cuotaInicial.monto > 0 && <BreakdownRow label="Cuota Inicial:" value={financiero.cuotaInicial.monto} />}
                            {financiero.aplicaCredito && financiero.credito.monto > 0 && <BreakdownRow label="Crédito:" value={financiero.credito.monto} />}
                            {financiero.aplicaSubsidioVivienda && financiero.subsidioVivienda.monto > 0 && <BreakdownRow label="Subsidio MCY:" value={financiero.subsidioVivienda.monto} />}
                            {financiero.aplicaSubsidioCaja && financiero.subsidioCaja.monto > 0 && <BreakdownRow label="Sub. Caja:" value={financiero.subsidioCaja.monto} />}
                        </div>
                        <p className="text-lg font-bold text-gray-800 dark:text-gray-200">{formatCurrency(resumenFinanciero.totalRecursos)}</p>
                    </div>

                    <div className="text-center flex flex-col justify-center">
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Diferencia</p>
                        <p className={`text-2xl font-bold ${resumenFinanciero.diferencia === 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{formatCurrency(resumenFinanciero.diferencia)}</p>
                    </div>
                </div>

                {errors.financiero &&
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg" role="alert">
                        <p className="font-bold">Error de cuadre financiero</p>
                        <p>{errors.financiero}</p>
                    </div>
                }

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6 pt-6 border-t dark:border-gray-700">
                    {(!isEditing || modo === 'reactivar') && (
                        <div className="lg:col-span-2 p-4 border rounded-xl bg-gray-50 dark:bg-gray-700/50 dark:border-gray-700 space-y-4">
                            <div>
                                <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-200 flex items-center">
                                    Documento de Promesa Enviado (PDF) <span className="text-red-600">*</span>
                                    <HelpTooltip id="promesaFile" content="Adjunte la promesa de compraventa que se envió al cliente." />
                                </label>
                                {documentos.promesaEnviadaUrl ? (
                                    <div className="bg-green-50 dark:bg-green-900/50 border-2 border-green-200 dark:border-green-700 rounded-lg p-4 flex items-center justify-between">
                                        <div className='flex items-center gap-2 text-green-800 dark:text-green-300 font-semibold'>
                                            <FileText />
                                            <a href={documentos.promesaEnviadaUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">Ver Promesa Cargada</a>
                                        </div>
                                        <button type="button" onClick={() => handleDocumentUpload('promesaEnviadaUrl', null)} className="p-1 text-red-500 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50" title="Eliminar documento"><XCircle size={20} /></button>
                                    </div>
                                ) : (
                                    <FileUpload
                                        label="Subir Promesa de Compraventa"
                                        filePath={(fileName) => `documentos_clientes/${datosCliente.cedula}/promesa-enviada-${fileName}`}
                                        onUploadSuccess={(url) => handleDocumentUpload('promesaEnviadaUrl', url)}
                                        disabled={!datosCliente.cedula}
                                    />
                                )}
                                {errors.promesaEnviadaUrl && <p className="text-red-600 text-sm mt-1">{errors.promesaEnviadaUrl}</p>}
                            </div>

                            <div>
                                <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-200 flex items-center">
                                    Captura del Correo de Envío <span className="text-red-600">*</span>
                                    <HelpTooltip id="promesaCorreoFile" content="Adjunte una captura de pantalla o evidencia del correo con el que se envió la promesa." />
                                </label>
                                {documentos.promesaEnviadaCorreoUrl ? (
                                    <div className="bg-green-50 dark:bg-green-900/50 border-2 border-green-200 dark:border-green-700 rounded-lg p-4 flex items-center justify-between">
                                        <div className='flex items-center gap-2 text-green-800 dark:text-green-300 font-semibold'>
                                            <FileText />
                                            <a href={documentos.promesaEnviadaCorreoUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">Ver Captura Cargada</a>
                                        </div>
                                        <button type="button" onClick={() => handleDocumentUpload('promesaEnviadaCorreoUrl', null)} className="p-1 text-red-500 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50" title="Eliminar documento"><XCircle size={20} /></button>
                                    </div>
                                ) : (
                                    <FileUpload
                                        label="Subir Captura de Correo"
                                        filePath={(fileName) => `documentos_clientes/${datosCliente.cedula}/promesa-correo-${fileName}`}
                                        onUploadSuccess={(url) => handleDocumentUpload('promesaEnviadaCorreoUrl', url)}
                                        disabled={!datosCliente.cedula}
                                    />
                                )}
                                {errors.promesaEnviadaCorreoUrl && <p className="text-red-600 text-sm mt-1">{errors.promesaEnviadaCorreoUrl}</p>}
                            </div>
                        </div>
                    )}

                    <div className="p-4 border rounded-xl h-full dark:border-gray-700">
                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input type="checkbox" name="aplicaCuotaInicial" checked={financiero.aplicaCuotaInicial} onChange={handleCheckboxChange} className="h-5 w-5 rounded text-blue-600" disabled={isLocked} />
                            <span className="font-semibold text-gray-700 dark:text-gray-200">Cuota Inicial</span>
                        </label>
                        {financiero.aplicaCuotaInicial && (
                            <div className="space-y-1 mt-4 pt-4 border-t border-dashed dark:border-gray-600 animate-fade-in">
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center">Monto<HelpTooltip id="cuota" content="Monto que el cliente aporta como cuota inicial." /></label>
                                <NumericFormat value={financiero.cuotaInicial.monto} onValueChange={(values) => handleFinancialFieldChange('cuotaInicial', 'monto', values.floatValue)} className={`w-full border p-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:bg-gray-200 disabled:dark:bg-gray-600 disabled:cursor-not-allowed ${errors.cuotaInicial_monto ? 'border-red-500' : 'border-gray-300'}`} thousandSeparator="." decimalSeparator="," prefix="$ " disabled={isLocked} />
                                {errors.cuotaInicial_monto && <p className="text-red-600 text-sm mt-1">{errors.cuotaInicial_monto}</p>}
                            </div>
                        )}
                    </div>

                    <div className="p-4 border rounded-xl h-full dark:border-gray-700">
                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input type="checkbox" name="aplicaCredito" checked={financiero.aplicaCredito} onChange={handleCheckboxChange} className="h-5 w-5 rounded text-blue-600" disabled={isLocked} />
                            <span className="font-semibold text-gray-700 dark:text-gray-200">Crédito Hipotecario</span>
                        </label>
                        {financiero.aplicaCredito && (
                            <div className="space-y-4 mt-4 pt-4 border-t border-dashed dark:border-gray-600 animate-fade-in">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className='space-y-1'>
                                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Banco</label>
                                        <Select options={creditoOptions} value={creditoOptions.find(o => o.value === financiero.credito.banco)} onChange={(opt) => handleFinancialFieldChange('credito', 'banco', opt ? opt.value : '')} placeholder="Selecciona..." styles={getSelectStyles(!!errors.credito_banco)} isDisabled={isLocked} />
                                        {errors.credito_banco && <p className="text-red-600 text-sm mt-1">{errors.credito_banco}</p>}
                                    </div>
                                    <div className='space-y-1'>
                                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center">Monto<HelpTooltip id="credito" content="Monto total del crédito aprobado." /></label>
                                        <NumericFormat value={financiero.credito.monto} onValueChange={(values) => handleFinancialFieldChange('credito', 'monto', values.floatValue)} className={`w-full border p-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:bg-gray-200 disabled:dark:bg-gray-600 disabled:cursor-not-allowed ${errors.credito_monto ? 'border-red-500' : 'border-gray-300'}`} thousandSeparator="." decimalSeparator="," prefix="$ " disabled={isLocked} />
                                        {errors.credito_monto && <p className="text-red-600 text-sm mt-1">{errors.credito_monto}</p>}
                                    </div>
                                </div>

                                {financiero.credito.banco === 'Bancolombia' && (
                                    <div className='space-y-1 animate-fade-in'>
                                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center">Número de Caso<HelpTooltip id="caso" content="Número de caso SIB asignado por Bancolombia." /></label>
                                        <input
                                            name="caso"
                                            type="text"
                                            value={financiero.credito.caso || ''}
                                            onChange={(e) => handleFinancialFieldChange('credito', 'caso', e.target.value)}
                                            className={`w-full border p-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:bg-gray-200 disabled:dark:bg-gray-600 disabled:cursor-not-allowed ${errors.credito_caso ? 'border-red-500' : 'border-gray-300'}`}
                                            disabled={isLocked}
                                        />
                                        {errors.credito_caso && <p className="text-red-600 text-sm mt-1">{errors.credito_caso}</p>}
                                    </div>
                                )}

                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center">
                                        Carta Aprobación Crédito <span className="text-red-600 ml-1">*</span>
                                    </label>
                                    {financiero.credito.urlCartaAprobacion ? (
                                        <div className="bg-green-50 dark:bg-green-900/50 border-2 border-green-200 dark:border-green-700 rounded-lg p-3 flex items-center justify-between">
                                            <div className='flex items-center gap-2 text-green-800 dark:text-green-300 font-semibold text-sm'>
                                                <FileText size={16} />
                                                <a href={financiero.credito.urlCartaAprobacion} target="_blank" rel="noopener noreferrer" className="hover:underline">Ver Carta</a>
                                            </div>
                                            {!isLocked && (<button type="button" onClick={() => handleFinancialFieldChange('credito', 'urlCartaAprobacion', null)} className="p-1 text-red-500 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50" title="Eliminar"><XCircle size={18} /></button>)}
                                        </div>
                                    ) : (
                                        <FileUpload
                                            label="Subir Carta"
                                            filePath={(fileName) => `documentos_clientes/${datosCliente.cedula}/carta-aprobacion-credito-${fileName}`}
                                            onUploadSuccess={(url) => handleFinancialFieldChange('credito', 'urlCartaAprobacion', url)}
                                            disabled={!datosCliente.cedula || isLocked}
                                        />
                                    )}
                                    {errors.credito_urlCartaAprobacion && <p className="text-red-600 text-sm mt-1">{errors.credito_urlCartaAprobacion}</p>}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-4 border rounded-xl h-full dark:border-gray-700">
                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input type="checkbox" name="aplicaSubsidioVivienda" checked={financiero.aplicaSubsidioVivienda} onChange={handleCheckboxChange} className="h-5 w-5 rounded text-blue-600" disabled={isLocked} />
                            <span className="font-semibold text-gray-700 dark:text-gray-200">Subsidio Mi Casa Ya</span>
                        </label>
                        {financiero.aplicaSubsidioVivienda && (
                            <div className="space-y-1 mt-4 pt-4 border-t border-dashed dark:border-gray-600 animate-fade-in">
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center">Monto del Subsidio<HelpTooltip id="sub-vivienda" content="Monto aprobado del subsidio del gobierno." /></label>
                                <NumericFormat value={financiero.subsidioVivienda.monto} onValueChange={(values) => handleFinancialFieldChange('subsidioVivienda', 'monto', values.floatValue)} className={`w-full border p-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:bg-gray-200 disabled:dark:bg-gray-600 disabled:cursor-not-allowed ${errors.subsidioVivienda_monto ? 'border-red-500' : 'border-gray-300'}`} thousandSeparator="." decimalSeparator="," prefix="$ " disabled={isLocked} />
                                {errors.subsidioVivienda_monto && <p className="text-red-600 text-sm mt-1">{errors.subsidioVivienda_monto}</p>}
                            </div>
                        )}
                    </div>

                    <div className="p-4 border rounded-xl h-full dark:border-gray-700">
                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input type="checkbox" name="aplicaSubsidioCaja" checked={financiero.aplicaSubsidioCaja} onChange={handleCheckboxChange} className="h-5 w-5 rounded text-blue-600" disabled={isLocked} />
                            <span className="font-semibold text-gray-700 dark:text-gray-200">Subsidio Caja de Compensación</span>
                        </label>
                        {financiero.aplicaSubsidioCaja && (
                            <div className="space-y-4 mt-4 pt-4 border-t border-dashed dark:border-gray-600 animate-fade-in">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className='space-y-1'>
                                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Caja</label>
                                        <Select options={cajaOptions} value={cajaOptions.find(o => o.value === financiero.subsidioCaja.caja)} onChange={(opt) => handleFinancialFieldChange('subsidioCaja', 'caja', opt ? opt.value : '')} placeholder="Selecciona..." styles={getSelectStyles(!!errors.subsidioCaja_caja)} isDisabled={isLocked} />
                                        {errors.subsidioCaja_caja && <p className="text-red-600 text-sm mt-1">{errors.subsidioCaja_caja}</p>}
                                    </div>
                                    <div className='space-y-1'>
                                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center">Monto<HelpTooltip id="sub-caja" content="Monto aprobado del subsidio de la caja." /></label>
                                        <NumericFormat value={financiero.subsidioCaja.monto} onValueChange={(values) => handleFinancialFieldChange('subsidioCaja', 'monto', values.floatValue)} className={`w-full border p-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:bg-gray-200 disabled:dark:bg-gray-600 disabled:cursor-not-allowed ${errors.subsidioCaja_monto ? 'border-red-500' : 'border-gray-300'}`} thousandSeparator="." decimalSeparator="," prefix="$ " disabled={isLocked} />
                                        {errors.subsidioCaja_monto && <p className="text-red-600 text-sm mt-1">{errors.subsidioCaja_monto}</p>}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center">
                                        Carta Aprobación Subsidio <span className="text-red-600 ml-1">*</span>
                                    </label>
                                    {financiero.subsidioCaja.urlCartaAprobacion ? (
                                        <div className="bg-green-50 dark:bg-green-900/50 border-2 border-green-200 dark:border-green-700 rounded-lg p-3 flex items-center justify-between">
                                            <div className='flex items-center gap-2 text-green-800 dark:text-green-300 font-semibold text-sm'>
                                                <FileText size={16} />
                                                <a href={financiero.subsidioCaja.urlCartaAprobacion} target="_blank" rel="noopener noreferrer" className="hover:underline">Ver Carta</a>
                                            </div>
                                            {!isLocked && (<button type="button" onClick={() => handleFinancialFieldChange('subsidioCaja', 'urlCartaAprobacion', null)} className="p-1 text-red-500 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50" title="Eliminar"><XCircle size={18} /></button>)}
                                        </div>
                                    ) : (
                                        <FileUpload
                                            label="Subir Carta"
                                            filePath={(fileName) => `documentos_clientes/${datosCliente.cedula}/carta-aprobacion-subsidio-${fileName}`}
                                            onUploadSuccess={(url) => handleFinancialFieldChange('subsidioCaja', 'urlCartaAprobacion', url)}
                                            disabled={!datosCliente.cedula || isLocked}
                                        />
                                    )}
                                    {errors.subsidioCaja_urlCartaAprobacion && <p className="text-red-600 text-sm mt-1">{errors.subsidioCaja_urlCartaAprobacion}</p>}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t dark:border-gray-600 lg:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Valor para Escritura (Opcional)</h3>
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
                                    checked={financiero.usaValorEscrituraDiferente || false}
                                    onChange={handleCheckboxChange}
                                    className="sr-only peer"
                                    disabled={isLocked}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                        {financiero.usaValorEscrituraDiferente && (
                            <div className="mt-4 animate-fade-in">
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                                    Valor para Escritura (Informativo)
                                </label>
                                <NumericFormat
                                    value={financiero.valorEscritura || ''}
                                    onValueChange={(values) => handleFinancialFieldChange('financiero', 'valorEscritura', values.floatValue)}
                                    className="w-full border p-2 rounded-lg dark:bg-gray-800 dark:border-gray-600"
                                    thousandSeparator="."
                                    decimalSeparator=","
                                    prefix="$ "
                                    disabled={isLocked}
                                />
                                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                    <Info size={14} /> Este valor es solo para fines informativos y no afecta el saldo de la deuda.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
};

export default Step3_Financial;