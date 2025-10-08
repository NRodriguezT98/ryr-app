import React, { useCallback, useRef } from 'react';
import UniversalFileManager from '../../../components/UniversalFileManager';
import HelpTooltip from '../../../components/HelpTooltip';
import { FileText, XCircle, Eye, Trash2, Replace } from 'lucide-react';
import InputField from '../../../components/forms/InputField';

const getTodayString = () => new Date().toISOString().split('T')[0];

const Step2_ClientInfo = ({ formData, dispatch, errors, handleInputChange, handleFileReplace, isEditing, isLocked, modo, isFechaIngresoLocked, minDateForReactivation }) => {

    // Función para actualizar campos específicos en formData);
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
                    <div className="md:col-span-2">
                        <InputField
                            label={<>{modo === 'reactivar' ? 'Fecha de Ingreso al Nuevo Proceso' : 'Fecha de Ingreso al Proceso'} <span className="text-red-600">*</span></>}
                            name="fechaIngreso"
                            type="date"
                            value={formData.fechaIngreso}
                            onChange={handleInputChange}
                            max={getTodayString()}
                            min={minDateForReactivation}
                            disabled={isFechaIngresoLocked}
                            error={errors.fechaIngreso}
                            data-tooltip-content={isFechaIngresoLocked ? "La fecha no se puede modificar porque el cliente ya tiene abonos o ha avanzado en el proceso." : ''}
                        />
                    </div>
                    {errors.fechaIngreso && <p className="text-red-600 text-sm mt-1">{errors.fechaIngreso}</p>}
                </div>
                <div className="md:col-span-2">
                    <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-200 flex items-center">Copia de la Cédula <span className="text-red-600">*</span></label>

                    <UniversalFileManager
                        variant="normal"
                        label="Subir Cédula de Ciudadanía"
                        currentFileUrl={formData.urlCedula}
                        filePath={(fileName) => `documentos_clientes/${formData.cedula}/cedula-${fileName}`}
                        onUploadSuccess={(url) => handleValueChange('urlCedula', url)}
                        onDelete={() => handleValueChange('urlCedula', null)}
                        disabled={!formData.cedula || isPersonalInfoLocked}
                        readonly={false}
                        required={true}
                        showDownload={true}
                        showPreview={true}
                        disabledTooltip={
                            !formData.cedula
                                ? "Para subir la cédula necesitas ingresar primero el número de cédula"
                                : isPersonalInfoLocked
                                    ? "No puedes cambiar la cédula en esta etapa del proceso"
                                    : undefined
                        }
                        helpText={
                            !formData.cedula
                                ? "⚠️ Ingresa el número de cédula para habilitar la subida del documento"
                                : isPersonalInfoLocked
                                    ? "📎 Documento de identificación del cliente"
                                    : "📎 Sube la copia de la cédula de ciudadanía del cliente"
                        }
                    />
                    {errors.urlCedula && <p className="text-red-600 text-sm mt-1">{errors.urlCedula}</p>}
                </div>
            </div>
        </div>
    );
};

export default Step2_ClientInfo;