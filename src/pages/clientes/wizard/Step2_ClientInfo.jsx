import React, { useCallback } from 'react';
import FileUpload from '../../../components/FileUpload';
import { FileText, XCircle } from 'lucide-react'; // Importamos íconos

const getTodayString = () => new Date().toISOString().split('T')[0];

const Step2_ClientInfo = ({ formData, dispatch, errors }) => {
    const { datosCliente } = formData;

    const handleChange = useCallback((e) => {
        dispatch({ type: 'UPDATE_FIELD', payload: { section: 'datosCliente', field: e.target.name, value: e.target.value } });
    }, [dispatch]);

    const handleFileUpload = (url) => {
        dispatch({ type: 'UPDATE_FIELD', payload: { section: 'datosCliente', field: 'urlCedula', value: url } });
    };

    const handleFileRemove = () => {
        dispatch({ type: 'UPDATE_FIELD', payload: { section: 'datosCliente', field: 'urlCedula', value: null } });
    };

    return (
        <div className="animate-fade-in space-y-6">
            <div>
                <h3 className="text-2xl font-bold text-gray-800">2. Información del Cliente</h3>
                <p className="text-sm text-gray-500 mt-1">Ingresa los datos personales del nuevo propietario.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
                <div>
                    <label className="block font-semibold mb-1" htmlFor="nombres">Nombre(s) <span className="text-red-600">*</span></label>
                    <input type="text" id="nombres" name="nombres" className={`w-full border p-2 rounded-lg ${errors.nombres ? 'border-red-500' : 'border-gray-300'}`} value={datosCliente.nombres} onChange={handleChange} />
                    {errors.nombres && <p className="text-red-600 text-sm mt-1">{errors.nombres}</p>}
                </div>
                <div>
                    <label className="block font-semibold mb-1" htmlFor="apellidos">Apellido(s) <span className="text-red-600">*</span></label>
                    <input type="text" id="apellidos" name="apellidos" className={`w-full border p-2 rounded-lg ${errors.apellidos ? 'border-red-500' : 'border-gray-300'}`} value={datosCliente.apellidos} onChange={handleChange} />
                    {errors.apellidos && <p className="text-red-600 text-sm mt-1">{errors.apellidos}</p>}
                </div>
                <div>
                    <label className="block font-semibold mb-1" htmlFor="cedula">Cédula <span className="text-red-600">*</span></label>
                    <input type="text" id="cedula" name="cedula" className={`w-full border p-2 rounded-lg ${errors.cedula ? 'border-red-500' : 'border-gray-300'}`} value={datosCliente.cedula} onChange={handleChange} />
                    {errors.cedula && <p className="text-red-600 text-sm mt-1">{errors.cedula}</p>}
                </div>
                <div>
                    <label className="block font-semibold mb-1" htmlFor="telefono">Teléfono <span className="text-red-600">*</span></label>
                    <input type="text" id="telefono" name="telefono" className={`w-full border p-2 rounded-lg ${errors.telefono ? 'border-red-500' : 'border-gray-300'}`} value={datosCliente.telefono} onChange={handleChange} />
                    {errors.telefono && <p className="text-red-600 text-sm mt-1">{errors.telefono}</p>}
                </div>
                <div>
                    <label className="block font-semibold mb-1" htmlFor="correo">Correo Electrónico <span className="text-red-600">*</span></label>
                    <input type="email" id="correo" name="correo" className={`w-full border p-2 rounded-lg ${errors.correo ? 'border-red-500' : 'border-gray-300'}`} value={datosCliente.correo} onChange={handleChange} />
                    {errors.correo && <p className="text-red-600 text-sm mt-1">{errors.correo}</p>}
                </div>
                <div>
                    <label className="block font-semibold mb-1" htmlFor="direccion">Dirección <span className="text-red-600">*</span></label>
                    <input type="text" id="direccion" name="direccion" className={`w-full border p-2 rounded-lg ${errors.direccion ? 'border-red-500' : 'border-gray-300'}`} value={datosCliente.direccion} onChange={handleChange} />
                    {errors.direccion && <p className="text-red-600 text-sm mt-1">{errors.direccion}</p>}
                </div>
                <div className="md:col-span-2">
                    <label className="block font-semibold mb-1" htmlFor="fechaIngreso">Fecha de Ingreso / Inicio del Proceso <span className="text-red-600">*</span></label>
                    <input
                        type="date" id="fechaIngreso" name="fechaIngreso"
                        className={`w-full md:w-1/2 border p-2 rounded-lg ${errors.fechaIngreso ? 'border-red-500' : 'border-gray-300'}`}
                        value={datosCliente.fechaIngreso} onChange={handleChange}
                        max={getTodayString()}
                    />
                    {errors.fechaIngreso && <p className="text-red-600 text-sm mt-1">{errors.fechaIngreso}</p>}
                </div>
                <div className="md:col-span-2">
                    <label className="block font-semibold mb-2 text-gray-700">Soporte de Cédula <span className="text-red-600">*</span></label>
                    {datosCliente.urlCedula ? (
                        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 flex items-center justify-between">
                            <div className='flex items-center gap-2 text-green-800 font-semibold'>
                                <FileText />
                                <a href={datosCliente.urlCedula} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                    Ver Documento de identidad subido
                                </a>
                            </div>
                            <button type="button" onClick={handleFileRemove} className="p-1 text-red-500 rounded-full hover:bg-red-100" title="Eliminar documento">
                                <XCircle size={20} />
                            </button>
                        </div>
                    ) : (
                        <FileUpload
                            label="Subir Cédula"
                            filePath={(fileName) => `documentos_clientes/${datosCliente.cedula}/cedula-${fileName}`}
                            onUploadSuccess={handleFileUpload}
                            disabled={!datosCliente.cedula}
                        />
                    )}
                    {errors.urlCedula && <p className="text-red-600 text-sm mt-1">{errors.urlCedula}</p>}
                </div>
            </div>
        </div>
    );
};

export default Step2_ClientInfo;