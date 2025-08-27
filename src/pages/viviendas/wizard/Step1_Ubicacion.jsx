import React from 'react';
import AnimatedPage from '../../../components/AnimatedPage';
import HelpTooltip from '../../../components/HelpTooltip';

const Step1_Ubicacion = ({ formData, errors, handleInputChange, proyectos, isProyectoLocked }) => {
    return (
        <AnimatedPage>
            <div className="space-y-6">
                {/* 👇 2. Envolvemos el select en un div para el tooltip */}
                <div
                    className="col-span-1 md:col-span-2"
                    data-tooltip-id="app-tooltip"
                    data-tooltip-content={isProyectoLocked ? "No se puede cambiar el proyecto de una vivienda ya asignada." : ''}
                >
                    <label className="block font-semibold mb-1 flex items-center dark:text-gray-200" htmlFor="proyectoId">
                        Proyecto <span className="text-red-600">*</span>
                        <HelpTooltip id="proyecto" content="Seleccione el proyecto al que pertenece esta vivienda." />
                    </label>
                    <select
                        id="proyectoId"
                        name="proyectoId"
                        value={formData.proyectoId}
                        onChange={handleInputChange}
                        // 👇 3. Aplicamos el estado 'disabled' y clases visuales
                        disabled={isProyectoLocked}
                        className={`w-full border p-3 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.proyectoId ? "border-red-500" : "border-gray-300"} disabled:bg-gray-200 dark:disabled:bg-gray-700/50 disabled:cursor-not-allowed`}
                    >
                        <option value="">Selecciona un Proyecto</option>
                        {proyectos.map((proyecto) => (
                            <option key={proyecto.id} value={proyecto.id}>
                                {proyecto.nombre}
                            </option>
                        ))}
                    </select>
                    {errors.proyectoId && <p className="text-red-600 text-sm mt-1">{errors.proyectoId}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block font-semibold mb-1 flex items-center dark:text-gray-200" htmlFor="manzana">
                            Manzana <span className="text-red-600">*</span>
                            <HelpTooltip id="manzana" content="Seleccione la manzana a la que pertenece la vivienda a registrar" />
                        </label>
                        <select id="manzana" name="manzana" value={formData.manzana} onChange={handleInputChange} className={`w-full border p-3 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.manzana ? "border-red-500" : "border-gray-300"}`}>
                            <option value="">Selecciona</option>
                            {["A", "B", "C", "D", "E", "F"].map((op) => (<option key={op} value={op}>{op}</option>))}
                        </select>
                        {errors.manzana && <p className="text-red-600 text-sm mt-1">{errors.manzana}</p>}
                    </div>
                    <div>
                        <label className="block font-semibold mb-1 flex items-center dark:text-gray-200" htmlFor="numeroCasa">
                            Número de casa <span className="text-red-600">*</span>
                            <HelpTooltip id="numero" content="Indique aquí el número de la vivienda a registrar" />
                        </label>
                        <input id="numeroCasa" name="numeroCasa" type="text" value={formData.numeroCasa} onChange={handleInputChange} className={`w-full border p-3 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.numero ? "border-red-500" : "border-gray-300"}`} maxLength={6} />
                        {errors.numeroCasa && <p className="text-red-600 text-sm mt-1">{errors.numeroCasa}</p>}
                    </div>
                </div>
                <div className="mt-6 pt-6 border-t border-dashed dark:border-gray-600">
                    <h3 className="font-semibold text-lg mb-4 text-gray-700 dark:text-gray-200">Linderos</h3>
                    <div className="grid grid-cols-1 gap-y-4">
                        <div>
                            <label className="block font-semibold mb-1 flex items-center dark:text-gray-200" htmlFor="linderoNorte">
                                Norte <span className="text-red-600">*</span>
                                <HelpTooltip id="linderoNorte" content="Indique aquí el lindero norte de la vivienda a registrar" />
                            </label>
                            <input id="linderoNorte" name="linderoNorte" type="text" value={formData.linderoNorte} onChange={handleInputChange} className={`w-full border p-3 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.linderoNorte ? "border-red-500" : "border-gray-300"}`} />
                            {errors.linderoNorte && <p className="text-red-600 text-sm mt-1">{errors.linderoNorte}</p>}
                        </div>
                        <div>
                            <label className="block font-semibold mb-1 flex items-center dark:text-gray-200" htmlFor="linderoSur">
                                Sur <span className="text-red-600">*</span>
                                <HelpTooltip id="linderoSur" content="Indique aquí el lindero sur de la vivienda a registrar" />
                            </label>
                            <input id="linderoSur" name="linderoSur" type="text" value={formData.linderoSur} onChange={handleInputChange} className={`w-full border p-3 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.linderoSur ? "border-red-500" : "border-gray-300"}`} />
                            {errors.linderoSur && <p className="text-red-600 text-sm mt-1">{errors.linderoSur}</p>}
                        </div>
                        <div>
                            <label className="block font-semibold mb-1 flex items-center dark:text-gray-200" htmlFor="linderoOriente">
                                Oriente <span className="text-red-600">*</span>
                                <HelpTooltip id="linderoOriente" content="Indique aquí el lindero oriente de la vivienda a registrar" />
                            </label>
                            <input id="linderoOriente" name="linderoOriente" type="text" value={formData.linderoOriente} onChange={handleInputChange} className={`w-full border p-3 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.linderoOriente ? "border-red-500" : "border-gray-300"}`} />
                            {errors.linderoOriente && <p className="text-red-600 text-sm mt-1">{errors.linderoOriente}</p>}
                        </div>
                        <div>
                            <label className="block font-semibold mb-1 flex items-center dark:text-gray-200" htmlFor="linderoOccidente">
                                Occidente <span className="text-red-600">*</span>
                                <HelpTooltip id="inderoOccidente" content="Indique aquí el lindero occidente de la vivienda a registrar" />
                            </label>
                            <input id="linderoOccidente" name="linderoOccidente" type="text" value={formData.linderoOccidente} onChange={handleInputChange} className={`w-full border p-3 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.linderoOccidente ? "border-red-500" : "border-gray-300"}`} />
                            {errors.linderoOccidente && <p className="text-red-600 text-sm mt-1">{errors.linderoOccidente}</p>}
                        </div>
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
};

export default Step1_Ubicacion;