import React from 'react';
import { NumericFormat } from 'react-number-format';
import AnimatedPage from '../../../components/AnimatedPage';
import HelpTooltip from '../../../components/HelpTooltip';

const ResumenValorItem = ({ label, value }) => (
    <div className="flex justify-between text-sm">
        <p className="text-gray-600">{label}:</p>
        <p className="font-medium text-gray-800">{value.toLocaleString("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 })}</p>
    </div>
);

const Step3_Valor = ({ formData, errors, handleInputChange, handleValueChange, handleCheckboxChange, valorTotalCalculado, gastosNotarialesFijos }) => {
    return (
        <AnimatedPage>
            <div className="space-y-6">
                <div>
                    <label className="block font-semibold mb-1 flex items-center" htmlFor="valorBase">
                        Valor Base Casa <span className="text-red-600">*</span>
                        <HelpTooltip id="valorBase" content="Costo de la vivienda antes de aplicar recargos como gastos notariales o Adicional esquinera." />
                    </label>
                    <NumericFormat id="valorBase" name="valorBase" value={formData.valorBase} onValueChange={(values) => handleValueChange('valorBase', values.value)} thousandSeparator="." decimalSeparator="," prefix="$ " className={`w-full border p-3 rounded-lg ${errors.valorBase ? "border-red-500" : "border-gray-300"}`} />
                    {errors.valorBase && <p className="text-red-600 text-sm mt-1">{errors.valorBase}</p>}
                </div>

                <div>
                    <label className="flex items-center space-x-3 cursor-pointer">
                        <input type="checkbox" name="esEsquinera" checked={formData.esEsquinera} onChange={handleCheckboxChange} className="h-5 w-5 rounded text-red-600 focus:ring-red-500" />
                        <span className="font-semibold text-gray-700 flex items-center">
                            ¿Casa esquinera? (Aplica Recargo)
                            <HelpTooltip id="esquinera" content="Marque esta casilla solo si la vivienda es esquinera. Seleccione el recargo que aplicará segun la esquina en la que está ubicada la vivienda." />
                        </span>
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

                <div className="mt-8 pt-4 border-t-2 border-dashed space-y-2">
                    <ResumenValorItem label="Valor base vivienda" value={parseInt(String(formData.valorBase).replace(/\D/g, '')) || 0} />
                    <ResumenValorItem label="Gastos notariales (Recargo obligatorio)" value={gastosNotarialesFijos} />
                    {formData.esEsquinera && (
                        <ResumenValorItem label="Recargo por casa esquinera" value={parseInt(formData.recargoEsquinera) || 0} />
                    )}
                    <div className="!mt-4 pt-2 border-t">
                        <div className="flex justify-between items-center">
                            <label className="font-bold text-gray-800 flex items-center">
                                Valor Total de la Vivienda
                                <HelpTooltip id="valorTotal" content="Este es el precio final que el cliente deberá cubrir. Incluye el valor base, recargos y gastos notariales." />
                            </label>
                            <p className="font-bold text-lg text-green-600">{valorTotalCalculado.toLocaleString("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 })}</p>
                        </div>
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
};

export default Step3_Valor;