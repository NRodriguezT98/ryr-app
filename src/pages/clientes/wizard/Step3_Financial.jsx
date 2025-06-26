import React, { useMemo, useCallback } from 'react';
import { NumericFormat } from 'react-number-format';
import Select from 'react-select';

const formatCurrency = (value) => (value || 0).toLocaleString("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 });

// Opciones para los Selects, definidas fuera para mayor claridad
const cuotaInicialOptions = [{ value: 'Cesantias', label: 'Cesantías' }, { value: 'Efectivo', label: 'Efectivo' }, { value: 'Consignación bancaria', label: 'Consignación' }];
const creditoOptions = [{ value: 'Bancolombia', label: 'Bancolombia' }, { value: 'Banco de Bogotá', label: 'Banco de Bogotá' }, { value: 'Banco Agrario', label: 'Banco Agrario' }];
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
        const totalAportado = montoCuota + montoCredito + montoSubVivienda + montoSubCaja;
        return { totalAportado, diferencia: viviendaSeleccionada.valorTotal - totalAportado };
    }, [financiero, viviendaSeleccionada.valorTotal]);

    return (
        <div className="animate-fade-in space-y-8">
            <div>
                <h3 className="text-2xl font-bold text-gray-800">3. Estructura Financiera</h3>
                <p className="text-sm text-gray-500 mt-1">Define cómo el cliente cubrirá el valor de la vivienda.</p>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center p-4 bg-gray-50 rounded-lg">
                <div>
                    <p className="text-sm font-semibold text-gray-500">Valor Vivienda</p>
                    <p className="text-lg font-bold text-blue-600">{formatCurrency(viviendaSeleccionada.valorTotal)}</p>
                </div>
                <div>
                    <p className="text-sm font-semibold text-gray-500">Total Recursos propios</p>
                    <p className="text-lg font-bold text-gray-800">{formatCurrency(resumenFinanciero.totalAportado)}</p>
                </div>
                <div>
                    <p className="text-sm font-semibold text-gray-500">Diferencia</p>
                    <p className={`text-lg font-bold ${resumenFinanciero.diferencia === 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(resumenFinanciero.diferencia)}
                    </p>
                </div>
            </div>

            {errors.financiero &&
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg" role="alert">
                    <p className="font-bold">Error de diferencia entre los valores.</p>
                    <p>{errors.financiero}</p>
                </div>
            }

            <div className="space-y-6 pt-6 border-t">
                <div className="p-4 border rounded-lg">
                    <label className="flex items-center space-x-3 cursor-pointer">
                        <input type="checkbox" name="aplicaCuotaInicial" checked={financiero.aplicaCuotaInicial} onChange={handleCheckboxChange} className="h-5 w-5 rounded text-blue-600" />
                        <span className="font-semibold text-gray-700">¿Aplica Cuota Inicial?</span>
                    </label>
                    {financiero.aplicaCuotaInicial && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pl-8 animate-fade-in">
                            <div>
                                <Select options={cuotaInicialOptions} value={cuotaInicialOptions.find(o => o.value === financiero.cuotaInicial.metodo)} onChange={(opt) => handleFieldChange('cuotaInicial', 'metodo', opt ? opt.value : '')} placeholder="Método..." />
                                {errors.cuotaInicial_metodo && <p className="text-red-600 text-sm mt-1">{errors.cuotaInicial_metodo}</p>}
                            </div>
                            <div>
                                <NumericFormat placeholder="Monto Cuota Inicial" value={financiero.cuotaInicial.monto} onValueChange={(values) => handleFieldChange('cuotaInicial', 'monto', values.floatValue)} className={`w-full border p-2 rounded-lg ${errors.cuotaInicial_monto ? 'border-red-500' : 'border-gray-300'}`} thousandSeparator="." decimalSeparator="," prefix="$ " />
                                {errors.cuotaInicial_monto && <p className="text-red-600 text-sm mt-1">{errors.cuotaInicial_monto}</p>}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border rounded-lg">
                    <label className="flex items-center space-x-3 cursor-pointer">
                        <input type="checkbox" name="aplicaCredito" checked={financiero.aplicaCredito} onChange={handleCheckboxChange} className="h-5 w-5 rounded text-blue-600" />
                        <span className="font-semibold text-gray-700">¿Aplica Crédito Hipotecario?</span>
                    </label>
                    {financiero.aplicaCredito && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pl-8 animate-fade-in">
                            <div>
                                <Select options={creditoOptions} value={creditoOptions.find(o => o.value === financiero.credito.banco)} onChange={(opt) => handleFieldChange('credito', 'banco', opt ? opt.value : '')} placeholder="Banco..." />
                                {errors.credito_banco && <p className="text-red-600 text-sm mt-1">{errors.credito_banco}</p>}
                            </div>
                            <div>
                                <NumericFormat placeholder="Monto Crédito" value={financiero.credito.monto} onValueChange={(values) => handleFieldChange('credito', 'monto', values.floatValue)} className={`w-full border p-2 rounded-lg ${errors.credito_monto ? 'border-red-500' : 'border-gray-300'}`} thousandSeparator="." decimalSeparator="," prefix="$ " />
                                {errors.credito_monto && <p className="text-red-600 text-sm mt-1">{errors.credito_monto}</p>}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border rounded-lg">
                    <label className="flex items-center space-x-3 cursor-pointer">
                        <input type="checkbox" name="aplicaSubsidioVivienda" checked={financiero.aplicaSubsidioVivienda} onChange={handleCheckboxChange} className="h-5 w-5 rounded text-blue-600" />
                        <span className="font-semibold text-gray-700">¿Aplica Subsidio Mi Casa Ya?</span>
                    </label>
                    {financiero.aplicaSubsidioVivienda && (
                        <div className="mt-4 pl-8 animate-fade-in">
                            <NumericFormat placeholder="Monto Subsidio" value={financiero.subsidioVivienda.monto} onValueChange={(values) => handleFieldChange('subsidioVivienda', 'monto', values.floatValue)} className={`w-full md:w-1/2 border p-2 rounded-lg ${errors.subsidioVivienda_monto ? 'border-red-500' : 'border-gray-300'}`} thousandSeparator="." decimalSeparator="," prefix="$ " />
                            {errors.subsidioVivienda_monto && <p className="text-red-600 text-sm mt-1">{errors.subsidioVivienda_monto}</p>}
                        </div>
                    )}
                </div>

                <div className="p-4 border rounded-lg">
                    <label className="flex items-center space-x-3 cursor-pointer">
                        <input type="checkbox" name="aplicaSubsidioCaja" checked={financiero.aplicaSubsidioCaja} onChange={handleCheckboxChange} className="h-5 w-5 rounded text-blue-600" />
                        <span className="font-semibold text-gray-700">¿Aplica Subsidio Caja de Compensación?</span>
                    </label>
                    {financiero.aplicaSubsidioCaja && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pl-8 animate-fade-in">
                            <div>
                                <Select options={cajaOptions} value={cajaOptions.find(o => o.value === financiero.subsidioCaja.caja)} onChange={(opt) => handleFieldChange('subsidioCaja', 'caja', opt ? opt.value : '')} placeholder="Caja..." />
                                {errors.subsidioCaja_caja && <p className="text-red-600 text-sm mt-1">{errors.subsidioCaja_caja}</p>}
                            </div>
                            <div>
                                <NumericFormat placeholder="Monto Subsidio" value={financiero.subsidioCaja.monto} onValueChange={(values) => handleFieldChange('subsidioCaja', 'monto', values.floatValue)} className={`w-full border p-2 rounded-lg ${errors.subsidioCaja_monto ? 'border-red-500' : 'border-gray-300'}`} thousandSeparator="." decimalSeparator="," prefix="$ " />
                                {errors.subsidioCaja_monto && <p className="text-red-600 text-sm mt-1">{errors.subsidioCaja_monto}</p>}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Step3_Financial;