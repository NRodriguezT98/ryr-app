import React, { useCallback } from 'react';
import FileUpload from '../../../components/FileUpload';
import HelpTooltip from '../../../components/HelpTooltip';
import { FileText, XCircle } from 'lucide-react';

const getTodayString = () => new Date().toISOString().split('T')[0];

const Step2_ClientInfo = ({ formData, dispatch, errors, handleInputChange, isEditing, isLocked }) => {

    const handleValueChange = useCallback((field, value) => {
        dispatch({ type: 'UPDATE_DATOS_CLIENTE', payload: { field, value } });
    }, [dispatch]);

    return (
        <div className="animate-fade-in space-y-6">
            <div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">2. Información del Cliente</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Ingresa los datos personales del nuevo propietario.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t dark:border-gray-700">
                <div>
                    <label className="block font-semibold mb-1 flex items-center dark:text-gray-200" htmlFor="nombres">Nombres <span className="text-red-600">*</span></label>
                    <input id="nombres" name="nombres" type="text" value={formData.nombres} onChange={handleInputChange} disabled={isLocked} className={`w-full border p-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:bg-gray-200 disabled:dark:bg-gray-600 disabled:cursor-not-allowed ${errors.nombres ? 'border-red-500' : 'border-gray-300'}`} />
                    {errors.nombres && <p className="text-red-600 text-sm mt-1">{errors.nombres}</p>}
                </div>
                <div>
                    <label className="block font-semibold mb-1 flex items-center dark:text-gray-200" htmlFor="apellidos">Apellidos <span className="text-red-600">*</span></label>
                    <input id="apellidos" name="apellidos" type="text" value={formData.apellidos} onChange={handleInputChange} disabled={isLocked} className={`w-full border p-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:bg-gray-200 disabled:dark:bg-gray-600 disabled:cursor-not-allowed ${errors.apellidos ? 'border-red-500' : 'border-gray-300'}`} />
                    {errors.apellidos && <p className="text-red-600 text-sm mt-1">{errors.apellidos}</p>}
                </div>
                <div>
                    <label className="block font-semibold mb-1 flex items-center dark:text-gray-200" htmlFor="cedula">Cédula <span className="text-red-600">*</span></label>
                    <div data-tooltip-id="app-tooltip" data-tooltip-content={isEditing ? "La cédula no se puede editar. Si cometiste un error, elimina el cliente y créalo de nuevo." : ''}>
                        <input id="cedula" name="cedula" type="text" value={formData.cedula} onChange={handleInputChange} disabled={isEditing} className={`w-full border p-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:bg-gray-200 disabled:dark:bg-gray-600 disabled:cursor-not-allowed ${errors.cedula ? 'border-red-500' : 'border-gray-300'}`} />
                    </div>
                    {errors.cedula && <p className="text-red-600 text-sm mt-1">{errors.cedula}</p>}
                </div>
                <div>
                    <label className="block font-semibold mb-1 flex items-center dark:text-gray-200" htmlFor="telefono">Teléfono <span className="text-red-600">*</span></label>
                    <input id="telefono" name="telefono" type="text" value={formData.telefono} onChange={handleInputChange} className={`w-full border p-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.telefono ? 'border-red-500' : 'border-gray-300'}`} />
                    {errors.telefono && <p className="text-red-600 text-sm mt-1">{errors.telefono}</p>}
                </div>
                <div className="md:col-span-2">
                    <label className="block font-semibold mb-1 flex items-center dark:text-gray-200" htmlFor="correo">Correo Electrónico <span className="text-red-600">*</span></label>
                    <input id="correo" name="correo" type="email" value={formData.correo} onChange={handleInputChange} className={`w-full border p-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.correo ? 'border-red-500' : 'border-gray-300'}`} />
                    {errors.correo && <p className="text-red-600 text-sm mt-1">{errors.correo}</p>}
                </div>
                <div className="md:col-span-2">
                    <label className="block font-semibold mb-1 flex items-center dark:text-gray-200" htmlFor="direccion">Dirección de Residencia <span className="text-red-600">*</span></label>
                    <input id="direccion" name="direccion" type="text" value={formData.direccion} onChange={handleInputChange} className={`w-full border p-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.direccion ? 'border-red-500' : 'border-gray-300'}`} />
                    {errors.direccion && <p className="text-red-600 text-sm mt-1">{errors.direccion}</p>}
                </div>
                <div className="md:col-span-2">
                    <label className="block font-semibold mb-1 flex items-center dark:text-gray-200" htmlFor="fechaIngreso">Fecha de Ingreso al Proceso <span className="text-red-600">*</span></label>
                    <input id="fechaIngreso" name="fechaIngreso" type="date" value={formData.fechaIngreso} onChange={handleInputChange} max={getTodayString()} disabled={isLocked} className={`w-full border p-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:bg-gray-200 disabled:dark:bg-gray-600 disabled:cursor-not-allowed ${errors.fechaIngreso ? 'border-red-500' : 'border-gray-300'}`} />
                    {errors.fechaIngreso && <p className="text-red-600 text-sm mt-1">{errors.fechaIngreso}</p>}
                </div>
                <div className="md:col-span-2">
                    <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-200 flex items-center">Copia de la Cédula <span className="text-red-600">*</span></label>
                    {formData.urlCedula ? (
                        <div className="bg-green-50 dark:bg-green-900/50 border-2 border-green-200 dark:border-green-700 rounded-lg p-4 flex items-center justify-between">
                            <div className='flex items-center gap-2 text-green-800 dark:text-green-300 font-semibold'>
                                <FileText />
                                <a href={formData.urlCedula} target="_blank" rel="noopener noreferrer" className="hover:underline">Ver Documento Actual</a>
                            </div>
                            {!isLocked && (<button type="button" onClick={() => handleValueChange('urlCedula', null)} className="p-1 text-red-500 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50" title="Eliminar documento"><XCircle size={20} /></button>)}
                        </div>
                    ) : (
                        <FileUpload
                            label="Subir Cédula"
                            filePath={(fileName) => `documentos_clientes/${formData.cedula}/cedula-${fileName}`}
                            onUploadSuccess={(url) => handleValueChange('urlCedula', url)}
                            disabled={!formData.cedula || isEditing}
                        />
                    )}
                    {errors.urlCedula && <p className="text-red-600 text-sm mt-1">{errors.urlCedula}</p>}
                </div>
            </div>
        </div>
    );
};

export default Step2_ClientInfo;