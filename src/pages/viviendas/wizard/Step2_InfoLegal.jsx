import React from 'react';
import AnimatedPage from '../../../components/AnimatedPage';
import UniversalFileManager from '../../../components/UniversalFileManager';
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
                <div className="md:col-span-2">
                    <label className="block font-semibold mb-1 flex items-center dark:text-gray-200" htmlFor="tipoVivienda">
                        Tipo de Vivienda <span className="text-red-600">*</span>
                        <HelpTooltip id="tipoVivienda" content="Define si la vivienda es 'Regular' o 'Irregular' según su construcción." />
                    </label>
                    <select
                        id="tipoVivienda"
                        name="tipoVivienda"
                        value={formData.tipoVivienda || 'Regular'}
                        onChange={handleInputChange}
                        className={`w-full border p-3 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.tipoVivienda ? "border-red-500" : "border-gray-300"}`}
                    >
                        <option value="Regular">Regular</option>
                        <option value="Irregular">Irregular</option>
                    </select>
                    {errors.tipoVivienda && <p className="text-red-600 text-sm mt-1">{errors.tipoVivienda}</p>}
                </div>
            </div>
            <div className="md:col-span-2 mt-6 pt-6 border-t border-dashed dark:border-gray-600">
                <label className="block font-semibold mb-1 flex items-center dark:text-gray-200">
                    Certificado de Tradición y Libertad (Opcional)
                    <HelpTooltip content="Si tienes el certificado de tradición, puedes subirlo aquí; si no, más adelante podrás añadirlo desde la documentación de la vivienda." />
                </label>
                <UniversalFileManager
                    variant="normal"
                    label="Subir Certificado de Tradición y Libertad"
                    currentFileUrl={formData.urlCertificadoTradicion}
                    filePath={(fileName) => `documentos_viviendas/${formData.matricula}/certificado-tradicion-${fileName}`}
                    onUploadSuccess={(url) => handleValueChange('urlCertificadoTradicion', url)}
                    onDelete={() => handleValueChange('urlCertificadoTradicion', null)}
                    disabled={!formData.matricula}
                    required={false}
                    showDownload={true}
                    showPreview={true}
                    disabledTooltip="Para subir el certificado necesitas ingresar primero la matrícula inmobiliaria"
                    helpText={!formData.matricula
                        ? "⚠️ Ingresa la matrícula inmobiliaria para habilitar la subida del certificado"
                        : "Documento que certifica la propiedad y su historial legal"
                    }
                />
            </div>
        </AnimatedPage >
    );
};

export default Step2_InfoLegal;