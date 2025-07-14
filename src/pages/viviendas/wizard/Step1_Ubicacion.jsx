import React from 'react';
import AnimatedPage from '../../../components/AnimatedPage';
import HelpTooltip from '../../../components/HelpTooltip';

const Step1_Ubicacion = ({ formData, errors, handleInputChange }) => {
    return (
        <AnimatedPage>
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block font-semibold mb-1 flex items-center" htmlFor="manzana">
                            Manzana <span className="text-red-600">*</span>
                            <HelpTooltip id="manzana" content="Seleccione la manzana a la que pertenece la vivienda a registrar" />
                        </label>
                        <select id="manzana" name="manzana" value={formData.manzana} onChange={handleInputChange} className={`w-full border p-3 rounded-lg ${errors.manzana ? "border-red-500" : "border-gray-300"}`}>
                            <option value="">Selecciona</option>
                            {["A", "B", "C", "D", "E", "F"].map((op) => (<option key={op} value={op}>{op}</option>))}
                        </select>
                        {errors.manzana && <p className="text-red-600 text-sm mt-1">{errors.manzana}</p>}
                    </div>
                    <div>
                        <label className="block font-semibold mb-1 flex items-center" htmlFor="numero">
                            Número de casa <span className="text-red-600">*</span>
                            <HelpTooltip id="numero" content="Indique aquí el número de la vivienda a registrar" />
                        </label>
                        <input id="numero" name="numero" type="text" value={formData.numero} onChange={handleInputChange} className={`w-full border p-3 rounded-lg ${errors.numero ? "border-red-500" : "border-gray-300"}`} maxLength={6} />
                        {errors.numero && <p className="text-red-600 text-sm mt-1">{errors.numero}</p>}
                    </div>
                </div>
                <div className="mt-6 pt-6 border-t border-dashed">
                    <h3 className="font-semibold text-lg mb-4 text-gray-700">Linderos</h3>
                    <div className="grid grid-cols-1 gap-y-4">
                        {/* --- LABELS RESTAURADOS AQUÍ --- */}
                        <div>
                            <label className="block font-semibold mb-1 flex items-center" htmlFor="linderoNorte">
                                Norte <span className="text-red-600">*</span>
                                <HelpTooltip id="linderoNorte" content="Indique aquí el lindero norte de la vivienda a registrar" />
                            </label>
                            <input id="linderoNorte" name="linderoNorte" type="text" value={formData.linderoNorte} onChange={handleInputChange} className={`w-full border p-3 rounded-lg ${errors.linderoNorte ? "border-red-500" : "border-gray-300"}`} />
                            {errors.linderoNorte && <p className="text-red-600 text-sm mt-1">{errors.linderoNorte}</p>}
                        </div>
                        <div>
                            <label className="block font-semibold mb-1 flex items-center" htmlFor="linderoSur">
                                Sur <span className="text-red-600">*</span>
                                <HelpTooltip id="linderoSur" content="Indique aquí el lindero sur de la vivienda a registrar" />
                            </label>
                            <input id="linderoSur" name="linderoSur" type="text" value={formData.linderoSur} onChange={handleInputChange} className={`w-full border p-3 rounded-lg ${errors.linderoSur ? "border-red-500" : "border-gray-300"}`} />
                            {errors.linderoSur && <p className="text-red-600 text-sm mt-1">{errors.linderoSur}</p>}
                        </div>
                        <div>
                            <label className="block font-semibold mb-1 flex items-center" htmlFor="linderoOriente">
                                Oriente <span className="text-red-600">*</span>
                                <HelpTooltip id="linderoOriente" content="Indique aquí el lindero oriente de la vivienda a registrar" />
                            </label>
                            <input id="linderoOriente" name="linderoOriente" type="text" value={formData.linderoOriente} onChange={handleInputChange} className={`w-full border p-3 rounded-lg ${errors.linderoOriente ? "border-red-500" : "border-gray-300"}`} />
                            {errors.linderoOriente && <p className="text-red-600 text-sm mt-1">{errors.linderoOriente}</p>}
                        </div>
                        <div>
                            <label className="block font-semibold mb-1 flex items-center" htmlFor="linderoOccidente">
                                Occidente <span className="text-red-600">*</span>
                                <HelpTooltip id="inderoOccidente" content="Indique aquí el lindero occidente de la vivienda a registrar" />
                            </label>
                            <input id="linderoOccidente" name="linderoOccidente" type="text" value={formData.linderoOccidente} onChange={handleInputChange} className={`w-full border p-3 rounded-lg ${errors.linderoOccidente ? "border-red-500" : "border-gray-300"}`} />
                            {errors.linderoOccidente && <p className="text-red-600 text-sm mt-1">{errors.linderoOccidente}</p>}
                        </div>
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
};

export default Step1_Ubicacion;