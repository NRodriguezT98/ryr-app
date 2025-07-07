import React from 'react';
import { NumericFormat } from 'react-number-format';
import AnimatedPage from '../../components/AnimatedPage';
import FileUpload from '../../components/FileUpload';
import { PlusCircle } from 'lucide-react';

// Pequeño componente de ayuda para el nuevo resumen
const ResumenValorItem = ({ label, value }) => (
    <div className="flex justify-between text-sm">
        <p className="text-gray-600">{label}:</p>
        <p className="font-medium text-gray-800">{value.toLocaleString("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 })}</p>
    </div>
);

const FormularioVivienda = ({ step, formData, errors, handleInputChange, handleValueChange, handleCheckboxChange, valorTotalCalculado, gastosNotarialesFijos }) => {

    const handleUploadSuccess = (url) => {
        handleValueChange('urlCertificadoTradicion', url);
    };
    const handleRemoveFile = () => {
        handleValueChange('urlCertificadoTradicion', null);
    };

    return (
        <div className="space-y-6 min-h-[350px]">
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
                    <div className="mt-6 pt-6 border-t border-dashed">
                        <h3 className="font-semibold text-lg mb-4 text-gray-700">Linderos</h3>
                        <div className="grid grid-cols-1 gap-y-4">
                            <div>
                                <label className="block font-semibold mb-1" htmlFor="linderoNorte">Norte <span className="text-red-600">*</span></label>
                                <input id="linderoNorte" name="linderoNorte" type="text" value={formData.linderoNorte} onChange={handleInputChange} className={`w-full border p-3 rounded-lg ${errors.linderoNorte ? "border-red-500" : "border-gray-300"}`} />
                                {errors.linderoNorte && <p className="text-red-600 text-sm mt-1">{errors.linderoNorte}</p>}
                            </div>
                            <div>
                                <label className="block font-semibold mb-1" htmlFor="linderoSur">Sur <span className="text-red-600">*</span></label>
                                <input id="linderoSur" name="linderoSur" type="text" value={formData.linderoSur} onChange={handleInputChange} className={`w-full border p-3 rounded-lg ${errors.linderoSur ? "border-red-500" : "border-gray-300"}`} />
                                {errors.linderoSur && <p className="text-red-600 text-sm mt-1">{errors.linderoSur}</p>}
                            </div>
                            <div>
                                <label className="block font-semibold mb-1" htmlFor="linderoOriente">Oriente <span className="text-red-600">*</span></label>
                                <input id="linderoOriente" name="linderoOriente" type="text" value={formData.linderoOriente} onChange={handleInputChange} className={`w-full border p-3 rounded-lg ${errors.linderoOriente ? "border-red-500" : "border-gray-300"}`} />
                                {errors.linderoOriente && <p className="text-red-600 text-sm mt-1">{errors.linderoOriente}</p>}
                            </div>
                            <div>
                                <label className="block font-semibold mb-1" htmlFor="linderoOccidente">Occidente <span className="text-red-600">*</span></label>
                                <input id="linderoOccidente" name="linderoOccidente" type="text" value={formData.linderoOccidente} onChange={handleInputChange} className={`w-full border p-3 rounded-lg ${errors.linderoOccidente ? "border-red-500" : "border-gray-300"}`} />
                                {errors.linderoOccidente && <p className="text-red-600 text-sm mt-1">{errors.linderoOccidente}</p>}
                            </div>
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
                    <div className="md:col-span-2 mt-6 pt-6 border-t border-dashed">
                        <FileUpload
                            label="Certificado de Tradición y Libertad (Opcional)"
                            filePath={(fileName) => `documentos_viviendas/${formData.matricula}/certificado-tradicion-${fileName}`}
                            currentFileUrl={formData.urlCertificadoTradicion}
                            onUploadSuccess={handleUploadSuccess}
                            onRemove={handleRemoveFile}
                            disabled={!formData.matricula}
                        />
                    </div>
                </AnimatedPage>
            )}

            {step === 3 && (
                <AnimatedPage>
                    <div className="space-y-6">
                        <div>
                            <label className="block font-semibold mb-1" htmlFor="valorBase">Valor Base Casa <span className="text-red-600">*</span></label>
                            <NumericFormat id="valorBase" name="valorBase" value={formData.valorBase} onValueChange={(values) => handleValueChange('valorBase', values.value)} thousandSeparator="." decimalSeparator="," prefix="$ " className={`w-full border p-3 rounded-lg ${errors.valorBase ? "border-red-500" : "border-gray-300"}`} />
                            {errors.valorBase && <p className="text-red-600 text-sm mt-1">{errors.valorBase}</p>}
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

                        {/* --- NUEVO RESUMEN DE CÁLCULO --- */}
                        <div className="mt-8 pt-4 border-t-2 border-dashed space-y-2">
                            <ResumenValorItem label="Valor base vivienda" value={parseInt(String(formData.valorBase).replace(/\D/g, '')) || 0} />
                            <ResumenValorItem label="Gastos notariales (Recargo obligatorio)" value={gastosNotarialesFijos} />
                            {formData.esEsquinera && (
                                <ResumenValorItem label="Recargo por casa esquinera" value={parseInt(formData.recargoEsquinera) || 0} />
                            )}
                            <div className="!mt-4 pt-2 border-t">
                                <div className="flex justify-between items-center">
                                    <label className="font-bold text-gray-800">Valor Total Calculado</label>
                                    <p className="font-bold text-lg text-green-600">{valorTotalCalculado.toLocaleString("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 })}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </AnimatedPage>
            )}
        </div>
    );
};

export default FormularioVivienda;