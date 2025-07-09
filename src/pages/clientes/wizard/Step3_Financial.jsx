import React, { useMemo, useCallback } from 'react';
import { NumericFormat } from 'react-number-format';
import Select from 'react-select';
import AnimatedPage from '../../../components/AnimatedPage';

const formatCurrency = (value) => (value || 0).toLocaleString("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 });

const cuotaInicialOptions = [{ value: 'Cesantias', label: 'Cesantías' }, { value: 'Efectivo', label: 'Efectivo' }, { value: 'Consignación bancaria', label: 'Consignación' }];
const creditoOptions = [{ value: 'Bancolombia', label: 'Bancolombia' }, { value: 'Banco de Bogotá', label: 'Banco de Bogotá' }, { value: 'Banco Agrario', label: 'Banco Agrario' }, { value: 'Banco Caja Social', label: 'Banco Caja Social' }];
const cajaOptions = [{ value: 'Comfandi', label: 'Comfandi' }, { value: 'Comfenalco', label: 'Comfenalco' }];

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
        const montoGastosNotariales = financiero.gastosNotariales.monto || 0;

        const totalRecursos = montoCuota + montoCredito + montoSubVivienda + montoSubCaja + montoGastosNotariales;
        const totalAPagar = viviendaSeleccionada.valorTotal || 0;

        return { totalRecursos, totalAPagar, diferencia: totalAPagar - totalRecursos };
    }, [financiero, viviendaSeleccionada.valorTotal]);

    return (
        <AnimatedPage>
            <div className="space-y-6">
                <div className='text-center'>
                    <h3 className="text-2xl font-bold text-gray-800">3. Estructura Financiera</h3>
                    <p className="text-sm text-gray-500 mt-1">La suma de los recursos debe ser igual al Valor de la Vivienda.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center p-4 bg-gray-50 rounded-lg border">
                    <div>
                        <p className="text-sm font-semibold text-gray-500">Valor Vivienda</p>
                        <p className="text-lg font-bold text-blue-600">{formatCurrency(resumenFinanciero.totalAPagar)}</p>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-500">Total Recursos</p>
                        <p className="text-lg font-bold text-gray-800">{formatCurrency(resumenFinanciero.totalRecursos)}</p>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-500">Diferencia</p>
                        <p className={`text-lg font-bold ${resumenFinanciero.diferencia === 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(resumenFinanciero.diferencia)}</p>
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
                            <div className="space-y-4 mt-4 pt-4 border-t border-dashed animate-fade-in">
                                <div className='space-y-1'>
                                    <label className="text-xs font-medium text-gray-500">Monto</label>
                                    <NumericFormat value={financiero.cuotaInicial.monto} onValueChange={(values) => handleFieldChange('cuotaInicial', 'monto', values.floatValue)} className={`w-full border p-2 rounded-lg ${errors.cuotaInicial_monto ? 'border-red-500' : 'border-gray-300'}`} thousandSeparator="." decimalSeparator="," prefix="$ " />
                                </div>
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
                                        <Select options={creditoOptions} value={creditoOptions.find(o => o.value === financiero.credito.banco)} onChange={(opt) => handleFieldChange('credito', 'banco', opt ? opt.value : '')} placeholder="Selecciona..." />
                                        {errors.credito_banco && <p className="text-red-600 text-sm mt-1">{errors.credito_banco}</p>}
                                    </div>
                                    <div className='space-y-1'>
                                        <label className="text-xs font-medium text-gray-500">Monto</label>
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
                            <div className="space-y-4 mt-4 pt-4 border-t border-dashed animate-fade-in">
                                <div className='space-y-1'>
                                    <label className="text-xs font-medium text-gray-500">Monto del Subsidio</label>
                                    <NumericFormat value={financiero.subsidioVivienda.monto} onValueChange={(values) => handleFieldChange('subsidioVivienda', 'monto', values.floatValue)} className={`w-full border p-2 rounded-lg ${errors.subsidioVivienda_monto ? 'border-red-500' : 'border-gray-300'}`} thousandSeparator="." decimalSeparator="," prefix="$ " />
                                </div>
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
                                        <Select options={cajaOptions} value={cajaOptions.find(o => o.value === financiero.subsidioCaja.caja)} onChange={(opt) => handleFieldChange('subsidioCaja', 'caja', opt ? opt.value : '')} placeholder="Selecciona..." />
                                        {errors.subsidioCaja_caja && <p className="text-red-600 text-sm mt-1">{errors.subsidioCaja_caja}</p>}
                                    </div>
                                    <div className='space-y-1'>
                                        <label className="text-xs font-medium text-gray-500">Monto</label>
                                        <NumericFormat value={financiero.subsidioCaja.monto} onValueChange={(values) => handleFieldChange('subsidioCaja', 'monto', values.floatValue)} className={`w-full border p-2 rounded-lg ${errors.subsidioCaja_monto ? 'border-red-500' : 'border-gray-300'}`} thousandSeparator="." decimalSeparator="," prefix="$ " />
                                        {errors.subsidioCaja_monto && <p className="text-red-600 text-sm mt-1">{errors.subsidioCaja_monto}</p>}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-2">
                        <div className="p-4 border rounded-xl bg-gray-50">
                            <label className="font-semibold text-gray-700">Gastos Notariales</label>
                            <div className='mt-2 space-y-1'>
                                <label className="text-xs font-medium text-gray-500">Monto (Máximo $5.000.000)</label>
                                <NumericFormat
                                    value={financiero.gastosNotariales.monto}
                                    isAllowed={(values) => {
                                        const { floatValue } = values;
                                        return floatValue === undefined || floatValue <= 5000000;
                                    }}
                                    onValueChange={(values) => handleFieldChange('gastosNotariales', 'monto', values.floatValue)}
                                    className={`w-full border p-2 rounded-lg ${errors.gastosNotariales_monto ? 'border-red-500' : 'border-gray-300'}`}
                                    thousandSeparator="." decimalSeparator="," prefix="$ "
                                />
                                {errors.gastosNotariales_monto && <p className="text-red-600 text-sm mt-1">{errors.gastosNotariales_monto}</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
};

export default Step3_Financial;