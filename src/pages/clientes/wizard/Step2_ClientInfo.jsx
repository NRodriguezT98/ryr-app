import React, { useCallback, useRef } from 'react';
import FileUpload from '../../../components/FileUpload';
import HelpTooltip from '../../../components/HelpTooltip';
import { FileText, XCircle, Eye, Trash2, Replace } from 'lucide-react';
import InputField from '../../../components/forms/InputField';

const FileDisplayActions = ({ url, onReplace, onDelete, isLocked }) => {
    const replaceInputRef = useRef(null);
    const handleReplaceClick = () => replaceInputRef.current?.click();

    return (
        <div className="bg-green-50 dark:bg-green-900/50 border-2 border-green-200 dark:border-green-700 rounded-lg p-4 flex items-center justify-between">
            {/* Sección para 'Ver Documento Actual' (se mantiene similar) */}
            <div className='flex items-center gap-2 text-green-800 dark:text-green-300 font-semibold'>
                <FileText size={20} /> {/* Tamaño ajustado */}
                <a href={url} target="_blank" rel="noopener noreferrer" className="hover:underline">Ver Documento Actual</a>
            </div>

            {/* --- INICIO DE LA MODIFICACIÓN DE ESTILOS --- */}
            {!isLocked && (
                <div className="flex items-center gap-2"> {/* Reducimos el gap si queremos más juntos */}
                    {/* Botón Reemplazar */}
                    <button
                        type="button"
                        onClick={handleReplaceClick}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-yellow-800 dark:text-yellow-200 bg-yellow-100 dark:bg-yellow-700/50 hover:bg-yellow-200 dark:hover:bg-yellow-600/70 transition-colors duration-200 text-sm font-medium"
                        title="Reemplazar documento"
                    >
                        <Replace size={16} /> Reemplazar
                    </button>
                    {/* Botón Eliminar */}
                    <button
                        type="button"
                        onClick={onDelete}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-red-800 dark:text-red-200 bg-red-100 dark:bg-red-700/50 hover:bg-red-200 dark:hover:bg-red-600/70 transition-colors duration-200 text-sm font-medium"
                        title="Eliminar documento"
                    >
                        <Trash2 size={16} /> Eliminar
                    </button>
                    <input
                        type="file"
                        ref={replaceInputRef}
                        onChange={onReplace}
                        className="hidden"
                        accept=".pdf,.png,.jpg,.jpeg"
                    />
                </div>
            )}
            {/* --- FIN DE LA MODIFICACIÓN DE ESTILOS --- */}
        </div>
    );
};

const getTodayString = () => new Date().toISOString().split('T')[0];

const Step2_ClientInfo = ({ formData, dispatch, errors, handleInputChange, handleFileReplace, isEditing, isLocked, modo, isFechaIngresoLocked }) => {

    const handleValueChange = useCallback((field, value) => {
        dispatch({ type: 'UPDATE_DATOS_CLIENTE', payload: { field, value } });
    }, [dispatch]);

    // Determinamos si los campos personales deben estar bloqueados.
    // Esto ocurre si estamos en modo 'editar' y el proceso ha avanzado, O si estamos en modo 'reactivar'.
    const isPersonalInfoLocked = isLocked || modo === 'reactivar';


    return (
        <div className="animate-fade-in space-y-6">
            <div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">2. Información del Cliente</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {modo === 'reactivar' ? 'Confirma y actualiza los datos de contacto del cliente.' : 'Ingresa los datos personales del nuevo propietario.'}
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t dark:border-gray-700">
                <InputField
                    label={<>Nombres <span className="text-red-600">*</span></>}
                    name="nombres"
                    value={formData.nombres}
                    onChange={handleInputChange}
                    disabled={isPersonalInfoLocked}
                    error={errors.nombres}
                    data-tooltip-content={isPersonalInfoLocked ? "El nombre no se puede modificar en esta etapa." : ''}
                />
                <InputField
                    label={<>Apellidos <span className="text-red-600">*</span></>}
                    name="apellidos"
                    value={formData.apellidos}
                    onChange={handleInputChange}
                    disabled={isPersonalInfoLocked}
                    error={errors.apellidos}
                    data-tooltip-content={isPersonalInfoLocked ? "El apellido no se puede modificar en esta etapa." : ''}
                />
                <InputField
                    label={<>Cédula <span className="text-red-600">*</span></>}
                    name="cedula"
                    value={formData.cedula}
                    onChange={handleInputChange}
                    disabled={isEditing}
                    error={errors.cedula}
                    data-tooltip-content={isEditing ? "La cédula no se puede editar. Si cometiste un error, elimina el cliente y créalo de nuevo." : ''}
                />
                <InputField
                    label={<>Teléfono <span className="text-red-600">*</span></>}
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    error={errors.telefono}
                />
                <div className="md:col-span-2">
                    <InputField
                        label={<>Correo Electrónico <span className="text-red-600">*</span></>}
                        name="correo"
                        type="email"
                        value={formData.correo}
                        onChange={handleInputChange}
                        error={errors.correo}
                    />
                </div>
                <div className="md:col-span-2">
                    <InputField
                        label={<>Dirección de Residencia <span className="text-red-600">*</span></>}
                        name="direccion"
                        value={formData.direccion}
                        onChange={handleInputChange}
                        error={errors.direccion}
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="block font-semibold mb-1 flex items-center dark:text-gray-200" htmlFor="fechaIngreso">Fecha de Ingreso al Proceso <span className="text-red-600">*</span></label>
                    <div className="md:col-span-2">
                        <InputField
                            label={<> <span className="text-red-600"></span></>}
                            name="fechaIngreso"
                            type="date"
                            value={formData.fechaIngreso}
                            onChange={handleInputChange}
                            max={getTodayString()}
                            disabled={isFechaIngresoLocked}
                            error={errors.fechaIngreso}
                            data-tooltip-content={isFechaIngresoLocked ? "La fecha no se puede modificar porque el cliente ya tiene abonos o ha avanzado en el proceso." : ''}
                        />
                    </div>
                    {errors.fechaIngreso && <p className="text-red-600 text-sm mt-1">{errors.fechaIngreso}</p>}
                </div>
                <div className="md:col-span-2">
                    <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-200 flex items-center">Copia de la Cédula <span className="text-red-600">*</span></label>

                    {formData.urlCedula ? (
                        <FileDisplayActions
                            url={formData.urlCedula}
                            onDelete={() => handleValueChange('urlCedula', null)}
                            onReplace={(e) => handleFileReplace(e, 'urlCedula')}
                            isLocked={isPersonalInfoLocked}
                        />
                    ) : (
                        <FileUpload
                            label="Subir Cédula"
                            filePath={(fileName) => `documentos_clientes/${formData.cedula}/cedula-${fileName}`}
                            onUploadSuccess={(url) => handleValueChange('urlCedula', url)}
                            disabled={!formData.cedula || isPersonalInfoLocked}
                        />
                    )}
                    {errors.urlCedula && <p className="text-red-600 text-sm mt-1">{errors.urlCedula}</p>}
                </div>
            </div>
        </div>
    );
};

export default Step2_ClientInfo;