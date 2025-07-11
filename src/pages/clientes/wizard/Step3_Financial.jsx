import React, { useMemo, useCallback } from 'react';
import { NumericFormat } from 'react-number-format';
import Select from 'react-select';
import AnimatedPage from '../../../components/AnimatedPage';
import HelpTooltip from '../../../components/HelpTooltip';
import { formatCurrency } from '../../../utils/textFormatters';

const creditoOptions = [{ value: 'Bancolombia', label: 'Bancolombia' }, { value: 'Banco de Bogotá', label: 'Banco de Bogotá' }, { value: 'Banco Agrario', label: 'Banco Agrario' }, { value: 'Banco Caja Social', label: 'Banco Caja Social' }];
const cajaOptions = [{ value: 'Comfandi', label: 'Comfandi' }, { value: 'Comfenalco', label: 'Comfenalco' }];

const GASTOS_NOTARIALES_FIJOS = 5000000;

const BreakdownRow = ({ label, value }) => (
    <>
        <span className="text-gray-600 text-left">{label}:</span>
        <span className="font-medium text-gray-800 text-right">{formatCurrency(value)}</span>
    </>
);

const Step3_Financial = ({ formData, dispatch, errors }) => {
    const { financiero, viviendaSeleccionada } = formData;

    const handleCheckboxChange = useCallback((e) => {
        dispatch({ type: 'TOGGLE_FINANCIAL_OPTION', payload: { field: e.target.name, value: e.target.checked } });
    }, [dispatch]);

    const handleFieldChange = useCallback((section, field, value) => {
        dispatch({ type: 'UPDATE_FINANCIAL_FIELD', payload: { section, field, value } });
    }, [dispatch]);

    const resumenFinanciero = useMemo(() => {
        const montoCuota = financiero.aplicaCuotaInicial ? (financiero.cuotaInicial.monto || 0) : 0;
        const montoCredito = financiero.aplicaCredito ? (financiero.credito.monto || 0) : 0;
        const montoSubVivienda = financiero.aplicaSubsidioVivienda ? (financiero.subsidioVivienda.monto || 0) : 0;
        const montoSubCaja = financiero.aplicaSubsidioCaja ? (financiero.subsidioCaja.monto || 0) : 0;

        const totalRecursos = montoCuota + montoCredito + montoSubVivienda + montoSubCaja;
        const totalAPagar = viviendaSeleccionada.valorTotal || 0;

        return { totalRecursos, totalAPagar, diferencia: totalAPagar - totalRecursos };
    }, [financiero, viviendaSeleccionada]);

    const getSelectStyles = (hasError) => ({
        control: (provided, state) => ({
            ...provided,
            borderColor: hasError ? '#ef4444' : '#d1d5db',
            '&:hover': {
                borderColor: hasError ? '#ef4444' : '#9ca3af',
            },
            boxShadow: state.isFocused && (hasError ? '0 0 0 1px #ef4444' : '0 0 0 1px #3b82f6'),
            borderRadius: '0.5rem',
            padding: '2px',
        }),
    });

    return (
        <AnimatedPage>
            <div className="space-y-6">
                <div className='text-center'>
                    <h3 className="text-2xl font-bold text-gray-800">3. Cierre Financiero</h3>
                    <p className="text-sm text-gray-500 mt-1">La suma de los recursos debe ser igual al Valor de la Vivienda.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border">
                    <div className="text-center flex flex-col">
                        <p className="text-sm font-semibold text-gray-500">Valor Vivienda</p>
                        <div className="flex-grow text-xs mt-2 grid grid-cols-2 gap-x-2 px-2 border-b pb-2 mb-2">
                            <BreakdownRow label="Valor Base" value={viviendaSeleccionada.valorBase || 0} />
                            {viviendaSeleccionada.recargoEsquinera > 0 && <BreakdownRow label="R. Esquinera" value={viviendaSeleccionada.recargoEsquinera} />}
                            <BreakdownRow label="G. Notariales" value={GASTOS_NOTARIALES_FIJOS} />
                        </div>
                        <p className="text-lg font-bold text-blue-600">{formatCurrency(resumenFinanciero.totalAPagar)}</p>
                    </div>

                    <div className="text-center flex flex-col">
                        <p className="text-sm font-semibold text-gray-500">Total Recursos</p>
                        <div className="flex-grow text-xs mt-2 grid grid-cols-2 gap-x-2 px-2 border-b pb-2 mb-2">
                            {financiero.aplicaCuotaInicial && financiero.cuotaInicial.monto > 0 && <BreakdownRow label="Cuota Inicial" value={financiero.cuotaInicial.monto} />}
                            {financiero.aplicaCredito && financiero.credito.monto > 0 && <BreakdownRow label="Crédito" value={financiero.credito.monto} />}
                            {financiero.aplicaSubsidioVivienda && financiero.subsidioVivienda.monto > 0 && <BreakdownRow label="Subsidio MCY" value={financiero.subsidioVivienda.monto} />}
                            {financiero.aplicaSubsidioCaja && financiero.subsidioCaja.monto > 0 && <BreakdownRow label="Sub. Caja" value={financiero.subsidioCaja.monto} />}
                        </div>
                        <p className="text-lg font-bold text-gray-800">{formatCurrency(resumenFinanciero.totalRecursos)}</p>
                    </div>

                    {/* --- CAMBIO AQUÍ --- */}
                    <div className="text-center flex flex-col justify-center">
                        <p className="text-sm font-semibold text-gray-500">Diferencia</p>
                        <p className={`text-2xl font-bold ${resumenFinanciero.diferencia === 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(resumenFinanciero.diferencia)}</p>
                    </div>
                </div>

                {errors.financiero &&
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg" role="alert">
                        <p className="font-bold">Error de cuadre financiero</p>
                        <p>{errors.financiero}</p>
                    </div>
                }

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6 pt-6 border-t">
                    <div className="p-4 border rounded-xl h-full">
                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input type="checkbox" name="aplicaCuotaInicial" checked={financiero.aplicaCuotaInicial} onChange={handleCheckboxChange} className="h-5 w-5 rounded text-blue-600" />
                            <span className="font-semibold text-gray-700">Cuota Inicial</span>
                        </label>
                        {financiero.aplicaCuotaInicial && (
                            <div className="space-y-1 mt-4 pt-4 border-t border-dashed animate-fade-in">
                                <label className="text-xs font-medium text-gray-500 flex items-center">Monto<HelpTooltip id="cuota" content="Monto que el cliente aporta como cuota inicial." /></label>
                                <NumericFormat value={financiero.cuotaInicial.monto} onValueChange={(values) => handleFieldChange('cuotaInicial', 'monto', values.floatValue)} className={`w-full border p-2 rounded-lg ${errors.cuotaInicial_monto ? 'border-red-500' : 'border-gray-300'}`} thousandSeparator="." decimalSeparator="," prefix="$ " />
                                {errors.cuotaInicial_monto && <p className="text-red-600 text-sm mt-1">{errors.cuotaInicial_monto}</p>}
                            </div>
                        )}
                    </div>

                    <div className="p-4 border rounded-xl h-full">
                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input type="checkbox" name="aplicaCredito" checked={financiero.aplicaCredito} onChange={handleCheckboxChange} className="h-5 w-5 rounded text-blue-600" />
                            <span className="font-semibold text-gray-700">Crédito Hipotecario</span>
                        </label>
                        {financiero.aplicaCredito && (
                            <div className="space-y-4 mt-4 pt-4 border-t border-dashed animate-fade-in">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className='space-y-1'>
                                        <label className="text-xs font-medium text-gray-500">Banco</label>
                                        <Select options={creditoOptions} value={creditoOptions.find(o => o.value === financiero.credito.banco)} onChange={(opt) => handleFieldChange('credito', 'banco', opt ? opt.value : '')} placeholder="Selecciona..." styles={getSelectStyles(!!errors.credito_banco)} />
                                        {errors.credito_banco && <p className="text-red-600 text-sm mt-1">{errors.credito_banco}</p>}
                                    </div>
                                    <div className='space-y-1'>
                                        <label className="text-xs font-medium text-gray-500 flex items-center">Monto<HelpTooltip id="credito" content="Monto total del crédito aprobado." /></label>
                                        <NumericFormat value={financiero.credito.monto} onValueChange={(values) => handleFieldChange('credito', 'monto', values.floatValue)} className={`w-full border p-2 rounded-lg ${errors.credito_monto ? 'border-red-500' : 'border-gray-300'}`} thousandSeparator="." decimalSeparator="," prefix="$ " />
                                        {errors.credito_monto && <p className="text-red-600 text-sm mt-1">{errors.credito_monto}</p>}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-4 border rounded-xl h-full">
                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input type="checkbox" name="aplicaSubsidioVivienda" checked={financiero.aplicaSubsidioVivienda} onChange={handleCheckboxChange} className="h-5 w-5 rounded text-blue-600" />
                            <span className="font-semibold text-gray-700">Subsidio Mi Casa Ya</span>
                        </label>
                        {financiero.aplicaSubsidioVivienda && (
                            <div className="space-y-1 mt-4 pt-4 border-t border-dashed animate-fade-in">
                                <label className="text-xs font-medium text-gray-500 flex items-center">Monto del Subsidio<HelpTooltip id="sub-vivienda" content="Monto aprobado del subsidio del gobierno." /></label>
                                <NumericFormat value={financiero.subsidioVivienda.monto} onValueChange={(values) => handleFieldChange('subsidioVivienda', 'monto', values.floatValue)} className={`w-full border p-2 rounded-lg ${errors.subsidioVivienda_monto ? 'border-red-500' : 'border-gray-300'}`} thousandSeparator="." decimalSeparator="," prefix="$ " />
                                {errors.subsidioVivienda_monto && <p className="text-red-600 text-sm mt-1">{errors.subsidioVivienda_monto}</p>}
                            </div>
                        )}
                    </div>

                    <div className="p-4 border rounded-xl h-full">
                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input type="checkbox" name="aplicaSubsidioCaja" checked={financiero.aplicaSubsidioCaja} onChange={handleCheckboxChange} className="h-5 w-5 rounded text-blue-600" />
                            <span className="font-semibold text-gray-700">Subsidio Caja de Compensación</span>
                        </label>
                        {financiero.aplicaSubsidioCaja && (
                            <div className="space-y-4 mt-4 pt-4 border-t border-dashed animate-fade-in">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className='space-y-1'>
                                        <label className="text-xs font-medium text-gray-500">Caja</label>
                                        <Select options={cajaOptions} value={cajaOptions.find(o => o.value === financiero.subsidioCaja.caja)} onChange={(opt) => handleFieldChange('subsidioCaja', 'caja', opt ? opt.value : '')} placeholder="Selecciona..." styles={getSelectStyles(!!errors.subsidioCaja_caja)} />
                                        {errors.subsidioCaja_caja && <p className="text-red-600 text-sm mt-1">{errors.subsidioCaja_caja}</p>}
                                    </div>
                                    <div className='space-y-1'>
                                        <label className="text-xs font-medium text-gray-500 flex items-center">Monto<HelpTooltip id="sub-caja" content="Monto aprobado del subsidio de la caja." /></label>
                                        <NumericFormat value={financiero.subsidioCaja.monto} onValueChange={(values) => handleFieldChange('subsidioCaja', 'monto', values.floatValue)} className={`w-full border p-2 rounded-lg ${errors.subsidioCaja_monto ? 'border-red-500' : 'border-gray-300'}`} thousandSeparator="." decimalSeparator="," prefix="$ " />
                                        {errors.subsidioCaja_monto && <p className="text-red-600 text-sm mt-1">{errors.subsidioCaja_monto}</p>}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
};

export default Step3_Financial;