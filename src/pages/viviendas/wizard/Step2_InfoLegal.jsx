import React from 'react';
import AnimatedPage from '../../../components/AnimatedPage';
import FileUpload from '../../../components/FileUpload';
import HelpTooltip from '../../../components/HelpTooltip';
import { FileText, XCircle } from 'lucide-react';

const Step2_InfoLegal = ({ formData, errors, handleInputChange, handleValueChange }) => {
    return (
        <AnimatedPage>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block font-semibold mb-1 flex items-center dark:text-gray-200" htmlFor="matricula">
                        Matrícula inmobiliaria <span className="text-red-600">*</span>
                        <HelpTooltip id="matricula" content="Número único de identificación del inmueble por ejemplo: 373-123456." />
                    </label>
                    <input id="matricula" name="matricula" type="text" value={formData.matricula} onChange={handleInputChange} className={`w-full border p-3 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.matricula ? "border-red-500" : "border-gray-300"}`} maxLength={15} />
                    {errors.matricula && <p className="text-red-600 text-sm mt-1">{errors.matricula}</p>}
                </div>
                <div>
                    <label className="block font-semibold mb-1 flex items-center dark:text-gray-200" htmlFor="nomenclatura">
                        Nomenclatura <span className="text-red-600">*</span>
                        <HelpTooltip id="nomenclatura" content="Dirección oficial y completa de la vivienda por ejemplo: Carrera 5 # 1-02." />
                    </label>
                    <input id="nomenclatura" name="nomenclatura" type="text" value={formData.nomenclatura} onChange={handleInputChange} className={`w-full border p-3 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.nomenclatura ? "border-red-500" : "border-gray-300"}`} maxLength={25} />
                    {errors.nomenclatura && <p className="text-red-600 text-sm mt-1">{errors.nomenclatura}</p>}
                </div>
                <div>
                    <label className="block font-semibold mb-1 flex items-center dark:text-gray-200" htmlFor="areaLote">
                        Área del Lote (m²) <span className="text-red-600">*</span>
                        <HelpTooltip id="areaLote" content="Area total del lote por ejemplo: 66.125" />
                    </label>
                    <input id="areaLote" name="areaLote" type="text" value={formData.areaLote} onChange={handleInputChange} className={`w-full border p-3 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.areaLote ? "border-red-500" : "border-gray-300"}`} />
                    {errors.areaLote && <p className="text-red-600 text-sm mt-1">{errors.areaLote}</p>}
                </div>
                <div>
                    <label className="block font-semibold mb-1 flex items-center dark:text-gray-200" htmlFor="areaConstruida">
                        Área Construida (m²) <span className="text-red-600">*</span>
                        <HelpTooltip id="areaConstruida" content="Area construida del lote por ejemplo: 41.00" />
                    </label>
                    <input id="areaConstruida" name="areaConstruida" type="text" value={formData.areaConstruida} onChange={handleInputChange} className={`w-full border p-3 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.areaConstruida ? "border-red-500" : "border-gray-300"}`} />
                    {errors.areaConstruida && <p className="text-red-600 text-sm mt-1">{errors.areaConstruida}</p>}
                </div>
            </div>
            <div className="md:col-span-2 mt-6 pt-6 border-t border-dashed dark:border-gray-600">
                <label className="block font-semibold mb-1 flex items-center dark:text-gray-200">
                    Certificado de Tradición y Libertad (Opcional)
                    <HelpTooltip content="Si tienes el certificado de tradición, puedes subirlo aquí; si no, más adelante podrás añadirlo desde la documentación de la vivienda." />
                </label>
                {formData.urlCertificadoTradicion ? (
                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 flex items-center justify-between dark:bg-green-900/50 dark:border-green-800">
                        <div className='flex items-center gap-2 text-green-800 dark:text-green-300 font-semibold'>
                            <FileText />
                            <a href={formData.urlCertificadoTradicion} target="_blank" rel="noopener noreferrer" className="hover:underline">Ver Certificado Actual</a>
                        </div>
                        <button type="button" onClick={() => handleValueChange('urlCertificadoTradicion', null)} className="p-1 text-red-500 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50" title="Eliminar documento"><XCircle size={20} /></button>
                    </div>
                ) : (
                    <FileUpload
                        label="Subir Certificado"
                        filePath={(fileName) => `documentos_viviendas/${formData.matricula}/certificado-tradicion-${fileName}`}
                        onUploadSuccess={(url) => handleValueChange('urlCertificadoTradicion', url)}
                        disabled={!formData.matricula}
                    />
                )}
            </div>
        </AnimatedPage >
    );
};

export default Step2_InfoLegal;