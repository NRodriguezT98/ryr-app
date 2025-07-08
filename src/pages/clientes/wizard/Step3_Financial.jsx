import React, { useMemo, useCallback, useEffect } from 'react';
import { NumericFormat } from 'react-number-format';
import Select from 'react-select';
import FileUpload from '../../../components/FileUpload';
import AnimatedPage from '../../../components/AnimatedPage';

const formatCurrency = (value) => (value || 0).toLocaleString("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 });

const cuotaInicialOptions = [{ value: 'Cesantias', label: 'Cesantías' }, { value: 'Efectivo', label: 'Efectivo' }, { value: 'Consignación bancaria', label: 'Consignación' }];
const creditoOptions = [{ value: 'Bancolombia', label: 'Bancolombia' }, { value: 'Banco de Bogotá', label: 'Banco de Bogotá' }, { value: 'Banco Agrario', label: 'Banco Agrario' }];
const cajaOptions = [{ value: 'Comfandi', label: 'Comfandi' }, { value: 'Comfenalco', label: 'Comfenalco' }];

const Step3_Financial = ({ formData, dispatch, errors }) => {
    const { financiero, viviendaSeleccionada, datosCliente } = formData;

    const handleCheckboxChange = useCallback((e) => {
        const { name, checked } = e.target;
        dispatch({ type: 'TOGGLE_FINANCIAL_OPTION', payload: { field: name, value: checked } });
    }, [dispatch]);

    const handleFieldChange = useCallback((section, field, value) => {
        dispatch({ type: 'UPDATE_FINANCIAL_FIELD', payload: { section, field, value } });
    }, [dispatch]);

    const handleFileUpload = (section, field, url) => {
        dispatch({ type: 'UPDATE_FINANCIAL_FIELD', payload: { section, field, value: url } });
    };

    const handleRemoveFile = (section, field) => {
        dispatch({ type: 'UPDATE_FINANCIAL_FIELD', payload: { section, field, value: null } });
    };

    // Lógica de cálculo que maneja el excedente del crédito
    const resumenFinanciero = useMemo(() => {
        const montoCuota = financiero.aplicaCuotaInicial ? (financiero.cuotaInicial.monto || 0) : 0;
        const montoCredito = financiero.aplicaCredito ? (financiero.credito.monto || 0) : 0;
        const montoSubVivienda = financiero.aplicaSubsidioVivienda ? (financiero.subsidioVivienda.monto || 0) : 0;
        const montoSubCaja = financiero.aplicaSubsidioCaja ? (financiero.subsidioCaja.monto || 0) : 0;
        const montoGastosNotariales = financiero.gastosNotariales?.monto || 0;

        let totalRecursos = montoCuota + montoCredito + montoSubVivienda + montoSubCaja;

        // Si el crédito cubre los gastos, no los sumamos a los recursos que el cliente debe reunir aparte.
        if (financiero.credito?.cubreGastosNotariales) {
            // No hacemos nada, el monto del crédito ya incluye los 5M
        } else {
            // Si no, los gastos notariales se suman como un recurso aparte que el cliente debe cubrir.
            totalRecursos += montoGastosNotariales;
        }

        const totalAPagar = viviendaSeleccionada.valorTotal || 0;

        return {
            totalRecursos,
            totalAPagar,
            diferencia: totalAPagar - totalRecursos
        };
    }, [financiero, viviendaSeleccionada.valorTotal]);

    return (
        <AnimatedPage>
            <div className="space-y-6">
                <div className='text-center'>
                    <h3 className="text-2xl font-bold text-gray-800">3. Estructura Financiera</h3>
                    <p className="text-sm text-gray-500 mt-1 max-w-xl mx-auto">Define cómo el cliente cubrirá el valor total de la vivienda.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center p-4 bg-gray-50 rounded-lg border">
                    <div>
                        <p className="text-sm font-semibold text-gray-500">Valor Vivienda</p>
                        <p className="text-lg font-bold text-blue-600">{formatCurrency(resumenFinanciero.totalAPagar)}</p>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-500">Total Recursos (para vivienda)</p>
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
                    <div className="lg:col-span-2">
                        <div className="p-4 border rounded-xl bg-gray-100">
                            <label className="flex items-center space-x-3">
                                <input type="checkbox" checked={true} disabled className="h-5 w-5 rounded text-blue-600" />
                                <span className="font-semibold text-gray-700">Gastos Notariales (Costo Adicional: {formatCurrency(5000000)})</span>
                            </label>
                        </div>
                    </div>

                    <div className="space-y-6">
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
                                        </div>
                                        <div className='space-y-1'>
                                            <label className="text-xs font-medium text-gray-500">Monto Aprobado Total</label>
                                            <NumericFormat value={financiero.credito.monto} onValueChange={(values) => handleFieldChange('credito', 'monto', values.floatValue)} className={`w-full border p-2 rounded-lg ${errors.credito_monto ? 'border-red-500' : 'border-gray-300'}`} thousandSeparator="." decimalSeparator="," prefix="$ " />
                                        </div>
                                    </div>
                                    <div className='pt-2'>
                                        <label className="flex items-center space-x-3 cursor-pointer text-sm">
                                            <input
                                                type="checkbox"
                                                name="cubreGastosNotariales"
                                                checked={financiero.credito?.cubreGastosNotariales || false}
                                                onChange={(e) => handleFieldChange('credito', 'cubreGastosNotariales', e.target.checked)}
                                                className="h-4 w-4 rounded text-blue-600"
                                            />
                                            <span className="text-gray-700">El monto del crédito incluye los Gastos Notariales</span>
                                        </label>
                                    </div>
                                    <FileUpload label="Carta de Aprobación del Crédito" filePath={(fileName) => `documentos_clientes/${datosCliente.cedula}/credito-${fileName}`} currentFileUrl={financiero.credito.urlCartaAprobacion} onUploadSuccess={(url) => handleFileUpload('credito', 'urlCartaAprobacion', url)} onRemove={() => handleFileRemove('credito', 'urlCartaAprobacion')} />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="p-4 border rounded-xl h-full">
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input type="checkbox" name="aplicaCuotaInicial" checked={financiero.aplicaCuotaInicial} onChange={handleCheckboxChange} className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500" />
                                <span className="font-semibold text-gray-700">Cuota Inicial</span>
                            </label>
                            {financiero.aplicaCuotaInicial && (
                                <div className="space-y-4 mt-4 pt-4 border-t border-dashed animate-fade-in">
                                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                        <div className='space-y-1'>
                                            <label className="text-xs font-medium text-gray-500">Método de Pago</label>
                                            <Select options={cuotaInicialOptions} value={cuotaInicialOptions.find(o => o.value === financiero.cuotaInicial.metodo)} onChange={(opt) => handleFieldChange('cuotaInicial', 'metodo', opt ? opt.value : '')} placeholder="Selecciona..." />
                                        </div>
                                        <div className='space-y-1'>
                                            <label className="text-xs font-medium text-gray-500">Monto</label>
                                            <NumericFormat value={financiero.cuotaInicial.monto} onValueChange={(values) => handleFieldChange('cuotaInicial', 'monto', values.floatValue)} className={`w-full border p-2 rounded-lg ${errors.cuotaInicial_monto ? 'border-red-500' : 'border-gray-300'}`} thousandSeparator="." decimalSeparator="," prefix="$ " />
                                        </div>
                                    </div>
                                    <FileUpload label="Soporte de Pago" filePath={(fileName) => `documentos_clientes/${datosCliente.cedula}/cuota_inicial-${fileName}`} currentFileUrl={financiero.cuotaInicial.urlSoportePago} onUploadSuccess={(url) => handleFileUpload('cuotaInicial', 'urlSoportePago', url)} onRemove={() => handleFileRemove('cuotaInicial', 'urlSoportePago')} />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
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
                                    <FileUpload label="Carta de Aprobación" filePath={(fileName) => `documentos_clientes/${datosCliente.cedula}/subsidio_vivienda-${fileName}`} currentFileUrl={financiero.subsidioVivienda.urlSoporte} onUploadSuccess={(url) => handleFileUpload('subsidioVivienda', 'urlSoporte', url)} onRemove={() => handleFileRemove('subsidioVivienda', 'urlSoporte')} />
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
                                        </div>
                                        <div className='space-y-1'>
                                            <label className="text-xs font-medium text-gray-500">Monto</label>
                                            <NumericFormat value={financiero.subsidioCaja.monto} onValueChange={(values) => handleFieldChange('subsidioCaja', 'monto', values.floatValue)} className={`w-full border p-2 rounded-lg ${errors.subsidioCaja_monto ? 'border-red-500' : 'border-gray-300'}`} thousandSeparator="." decimalSeparator="," prefix="$ " />
                                        </div>
                                    </div>
                                    <FileUpload label="Carta de Aprobación" filePath={(fileName) => `documentos_clientes/${datosCliente.cedula}/subsidio_caja-${fileName}`} currentFileUrl={financiero.subsidioCaja.urlSoporte} onUploadSuccess={(url) => handleFileUpload('subsidioCaja', 'urlSoporte', url)} onRemove={() => handleFileRemove('subsidioCaja', 'urlSoporte')} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
};

export default Step3_Financial;