import React from 'react';
import { NumericFormat } from 'react-number-format';
import AnimatedPage from '../../components/AnimatedPage';

// Este componente ya no necesita la prop 'handleSubmit' ni la etiqueta <form>
const FormularioVivienda = ({ step, formData, errors, handleInputChange, handleValueChange, handleCheckboxChange, valorTotalCalculado }) => {
    return (
        // La etiqueta <form> se ha eliminado de aquí
        <div className="space-y-6 min-h-[300px]">
            {step === 1 && (
                <AnimatedPage>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block font-semibold mb-1" htmlFor="manzana">Manzana <span className="text-red-600">*</span></label>
                            <select id="manzana" name="manzana" value={formData.manzana} onChange={handleInputChange} className={`w-full border p-3 rounded-lg ${errors.manzana ? "border-red-500 ring-red-500" : "border-gray-300"}`}>
                                <option value="">Selecciona</option>
                                {["A", "B", "C", "D", "E", "F"].map((op) => (<option key={op} value={op}>{op}</option>))}
                            </select>
                            {errors.manzana && <p className="text-red-600 text-sm mt-1">{errors.manzana}</p>}
                        </div>
                        <div>
                            <label className="block font-semibold mb-1" htmlFor="numero">Número de casa <span className="text-red-600">*</span></label>
                            <input id="numero" name="numero" type="text" value={formData.numero} onChange={handleInputChange} className={`w-full border p-3 rounded-lg ${errors.numero ? "border-red-500 ring-red-500" : "border-gray-300"}`} maxLength={6} />
                            {errors.numero && <p className="text-red-600 text-sm mt-1">{errors.numero}</p>}
                        </div>
                    </div>
                </AnimatedPage>
            )}
            {step === 2 && (
                <AnimatedPage>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block font-semibold mb-1" htmlFor="matricula">Matrícula inmobiliaria <span className="text-red-600">*</span></label>
                            <input id="matricula" name="matricula" type="text" value={formData.matricula} onChange={handleInputChange} className={`w-full border p-3 rounded-lg ${errors.matricula ? "border-red-500 ring-red-500" : "border-gray-300"}`} maxLength={15} />
                            {errors.matricula && <p className="text-red-600 text-sm mt-1">{errors.matricula}</p>}
                        </div>
                        <div>
                            <label className="block font-semibold mb-1" htmlFor="nomenclatura">Nomenclatura <span className="text-red-600">*</span></label>
                            <input id="nomenclatura" name="nomenclatura" type="text" value={formData.nomenclatura} onChange={handleInputChange} className={`w-full border p-3 rounded-lg ${errors.nomenclatura ? "border-red-500 ring-red-500" : "border-gray-300"}`} maxLength={25} />
                            {errors.nomenclatura && <p className="text-red-600 text-sm mt-1">{errors.nomenclatura}</p>}
                        </div>
                    </div>
                </AnimatedPage>
            )}
            {step === 3 && (
                <AnimatedPage>
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block font-semibold mb-1" htmlFor="valorBase">Valor Base Casa <span className="text-red-600">*</span></label>
                                <NumericFormat id="valorBase" name="valorBase" value={formData.valorBase} onValueChange={(values) => handleValueChange('valorBase', values.value)} thousandSeparator="." decimalSeparator="," prefix="$ " className={`w-full border p-3 rounded-lg ${errors.valorBase ? "border-red-500" : "border-gray-300"}`} />
                                {errors.valorBase && <p className="text-red-600 text-sm mt-1">{errors.valorBase}</p>}
                            </div>
                            <div>
                                <label className="block font-semibold mb-1" htmlFor="gastosNotariales">Gastos Notariales <span className="text-red-600">*</span></label>
                                <NumericFormat id="gastosNotariales" name="gastosNotariales" value={formData.gastosNotariales} onValueChange={(values) => handleValueChange('gastosNotariales', values.value)} thousandSeparator="." decimalSeparator="," prefix="$ " className={`w-full border p-3 rounded-lg ${errors.gastosNotariales ? "border-red-500" : "border-gray-300"}`} />
                                {errors.gastosNotariales && <p className="text-red-600 text-sm mt-1">{errors.gastosNotariales}</p>}
                            </div>
                        </div>
                        <div>
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input type="checkbox" name="esEsquinera" checked={formData.esEsquinera} onChange={handleCheckboxChange} className="h-5 w-5 rounded text-red-600 focus:ring-red-500" />
                                <span className="font-semibold text-gray-700">¿Casa esquinera? (Aplica Recargo)</span>
                            </label>
                            {formData.esEsquinera && (
                                <div className="mt-4 pl-8 animate-fade-in">
                                    <label className="block font-semibold mb-1 text-sm" htmlFor="recargoEsquinera">Selecciona el recargo</label>
                                    <select id="recargoEsquinera" name="recargoEsquinera" value={formData.recargoEsquinera} onChange={handleInputChange} className="w-full border p-3 rounded-lg border-gray-300">
                                        <option value="5000000">$ 5.000.000</option>
                                        <option value="10000000">$ 10.000.000</option>
                                    </select>
                                </div>
                            )}
                        </div>
                        <div className="mt-8 pt-4 border-t-2 border-dashed">
                            <label className="block font-semibold mb-1 text-gray-500">Valor Total Calculado</label>
                            <NumericFormat value={valorTotalCalculado} thousandSeparator="." decimalSeparator="," prefix="$ " className="w-full border-0 bg-gray-100 p-3 rounded-lg font-bold text-lg text-green-600" disabled />
                        </div>
                    </div>
                </AnimatedPage>
            )}
        </div>
    );
};

export default FormularioVivienda;