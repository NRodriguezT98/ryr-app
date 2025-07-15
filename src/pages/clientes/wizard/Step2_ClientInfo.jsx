import React, { useCallback } from 'react';
import FileUpload from '../../../components/FileUpload';
import HelpTooltip from '../../../components/HelpTooltip';
import { FileText, XCircle } from 'lucide-react';

const getTodayString = () => new Date().toISOString().split('T')[0];

const Step2_ClientInfo = ({ formData, dispatch, errors }) => {

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        const inputFilters = {
            nombres: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/,
            apellidos: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/,
            cedula: /^[0-9]*$/,
            telefono: /^[0-9]*$/,
        };

        if (inputFilters[name] && !inputFilters[name].test(value)) {
            dispatch({ type: 'SET_ERRORS', payload: { [name]: 'Caracter no permitido.' } });
            return;
        }

        dispatch({ type: 'UPDATE_DATOS_CLIENTE', payload: { field: name, value } });
    }, [dispatch]);

    const handleValueChange = useCallback((field, value) => {
        dispatch({ type: 'UPDATE_DATOS_CLIENTE', payload: { field, value } });
    }, [dispatch]);

    return (
        <div className="animate-fade-in space-y-6">
            <div>
                <h3 className="text-2xl font-bold text-gray-800">2. Información del Cliente</h3>
                <p className="text-sm text-gray-500 mt-1">Ingresa los datos personales del nuevo propietario.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
                <div>
                    <label className="block font-semibold mb-1 flex items-center" htmlFor="nombres">
                        Nombres <span className="text-red-600">*</span>
                        <HelpTooltip id="nombres" content="Ingrese los nombres completos del cliente." />
                    </label>
                    <input id="nombres" name="nombres" type="text" value={formData.nombres} onChange={handleInputChange} className={`w-full border p-2 rounded-lg ${errors.nombres ? 'border-red-500' : 'border-gray-300'}`} />
                    {errors.nombres && <p className="text-red-600 text-sm mt-1">{errors.nombres}</p>}
                </div>
                <div>
                    <label className="block font-semibold mb-1 flex items-center" htmlFor="apellidos">
                        Apellidos <span className="text-red-600">*</span>
                        <HelpTooltip id="apellidos" content="Ingrese los apellidos completos del cliente." />
                    </label>
                    <input id="apellidos" name="apellidos" type="text" value={formData.apellidos} onChange={handleInputChange} className={`w-full border p-2 rounded-lg ${errors.apellidos ? 'border-red-500' : 'border-gray-300'}`} />
                    {errors.apellidos && <p className="text-red-600 text-sm mt-1">{errors.apellidos}</p>}
                </div>
                <div>
                    <label className="block font-semibold mb-1 flex items-center" htmlFor="cedula">
                        Cédula <span className="text-red-600">*</span>
                        <HelpTooltip id="cedula" content="Número de identificación único del cliente. Este campo no podrá ser editado posteriormente." />
                    </label>
                    {/* --- CORRECCIÓN AQUÍ: SE ELIMINÓ readOnly --- */}
                    <input id="cedula" name="cedula" type="text" value={formData.cedula} onChange={handleInputChange} className={`w-full border p-2 rounded-lg ${errors.cedula ? 'border-red-500' : 'border-gray-300'}`} />
                    {errors.cedula && <p className="text-red-600 text-sm mt-1">{errors.cedula}</p>}
                </div>
                <div>
                    <label className="block font-semibold mb-1 flex items-center" htmlFor="telefono">
                        Teléfono <span className="text-red-600">*</span>
                        <HelpTooltip id="telefono" content="Número de contacto principal del cliente." />
                    </label>
                    <input id="telefono" name="telefono" type="text" value={formData.telefono} onChange={handleInputChange} className={`w-full border p-2 rounded-lg ${errors.telefono ? 'border-red-500' : 'border-gray-300'}`} />
                    {errors.telefono && <p className="text-red-600 text-sm mt-1">{errors.telefono}</p>}
                </div>
                <div className="md:col-span-2">
                    <label className="block font-semibold mb-1 flex items-center" htmlFor="correo">
                        Correo Electrónico <span className="text-red-600">*</span>
                        <HelpTooltip id="correo" content="Dirección de correo electrónico para comunicaciones y notificaciones." />
                    </label>
                    <input id="correo" name="correo" type="email" value={formData.correo} onChange={handleInputChange} className={`w-full border p-2 rounded-lg ${errors.correo ? 'border-red-500' : 'border-gray-300'}`} />
                    {errors.correo && <p className="text-red-600 text-sm mt-1">{errors.correo}</p>}
                </div>
                <div className="md:col-span-2">
                    <label className="block font-semibold mb-1 flex items-center" htmlFor="direccion">
                        Dirección de Residencia <span className="text-red-600">*</span>
                        <HelpTooltip id="direccion" content="Dirección actual de residencia del cliente." />
                    </label>
                    <input id="direccion" name="direccion" type="text" value={formData.direccion} onChange={handleInputChange} className={`w-full border p-2 rounded-lg ${errors.direccion ? 'border-red-500' : 'border-gray-300'}`} />
                    {errors.direccion && <p className="text-red-600 text-sm mt-1">{errors.direccion}</p>}
                </div>
                <div className="md:col-span-2">
                    <label className="block font-semibold mb-1 flex items-center" htmlFor="fechaIngreso">
                        Fecha de Ingreso al Proceso <span className="text-red-600">*</span>
                        <HelpTooltip id="fechaIngreso" content="Fecha en la que el cliente inicia formalmente el proceso de compra." />
                    </label>
                    <input id="fechaIngreso" name="fechaIngreso" type="date" value={formData.fechaIngreso} onChange={handleInputChange} max={getTodayString()} className={`w-full border p-2 rounded-lg ${errors.fechaIngreso ? 'border-red-500' : 'border-gray-300'}`} />
                    {errors.fechaIngreso && <p className="text-red-600 text-sm mt-1">{errors.fechaIngreso}</p>}
                </div>
                <div className="md:col-span-2">
                    <label className="block font-semibold mb-2 text-gray-700 flex items-center">
                        Copia de la Cédula <span className="text-red-600">*</span>
                        <HelpTooltip id="cedulaFile" content="Adjunte el documento de identidad del cliente. Es obligatorio para continuar." />
                    </label>
                    {formData.urlCedula ? (
                        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 flex items-center justify-between">
                            <div className='flex items-center gap-2 text-green-800 font-semibold'>
                                <FileText />
                                <a href={formData.urlCedula} target="_blank" rel="noopener noreferrer" className="hover:underline">Ver Documento Actual</a>
                            </div>
                            <button type="button" onClick={() => handleValueChange('urlCedula', null)} className="p-1 text-red-500 rounded-full hover:bg-red-100" title="Eliminar documento"><XCircle size={20} /></button>
                        </div>
                    ) : (
                        <FileUpload
                            label="Subir Cédula"
                            filePath={(fileName) => `documentos_clientes/${formData.cedula}/cedula-${fileName}`}
                            onUploadSuccess={(url) => handleValueChange('urlCedula', url)}
                            disabled={!formData.cedula}
                        />
                    )}
                    {errors.urlCedula && <p className="text-red-600 text-sm mt-1">{errors.urlCedula}</p>}
                </div>
            </div>
        </div>
    );
};

export default Step2_ClientInfo;