import React, { useCallback, useRef } from 'react';
import UniversalFileManager from '../../../components/UniversalFileManager';
import HelpTooltip from '../../../components/HelpTooltip';
import { FileText, XCircle, Eye, Trash2, Replace, AlertCircle } from 'lucide-react';
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
        <div className="animate-fade-in">
            {/* Header Section */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-800 mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            Información del Cliente
                        </h3>
                        <p className="text-blue-600 dark:text-blue-400 font-medium">
                            {modo === 'reactivar' ? 'Confirma y actualiza los datos de contacto del cliente.' : 'Ingresa los datos personales del nuevo propietario.'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Form Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
                <div className="p-8 space-y-8">
                    {/* Información Personal */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                                <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Datos Personales
                            </h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField
                                label="Nombres"
                                name="nombres"
                                value={formData.nombres}
                                onChange={handleInputChange}
                                disabled={isPersonalInfoLocked}
                                error={errors.nombres}
                                isRequired={true}
                                placeholder="Ingresa los nombres del cliente"
                                helpText={isPersonalInfoLocked ? "El nombre no se puede modificar en esta etapa." : "Nombres completos del cliente"}
                                data-tooltip-content={isPersonalInfoLocked ? "El nombre no se puede modificar en esta etapa." : ''}
                            />
                            <InputField
                                label="Apellidos"
                                name="apellidos"
                                value={formData.apellidos}
                                onChange={handleInputChange}
                                disabled={isPersonalInfoLocked}
                                error={errors.apellidos}
                                isRequired={true}
                                placeholder="Ingresa los apellidos del cliente"
                                helpText={isPersonalInfoLocked ? "El apellido no se puede modificar en esta etapa." : "Apellidos completos del cliente"}
                                data-tooltip-content={isPersonalInfoLocked ? "El apellido no se puede modificar en esta etapa." : ''}
                            />
                            <InputField
                                label="Cédula de Ciudadanía"
                                name="cedula"
                                value={formData.cedula}
                                onChange={handleInputChange}
                                disabled={isEditing}
                                error={errors.cedula}
                                isRequired={true}
                                placeholder="1234567890"
                                helpText={isEditing ? "La cédula no se puede editar después de crear el cliente." : "Número de identificación sin puntos ni espacios"}
                                data-tooltip-content={isEditing ? "La cédula no se puede editar. Si cometiste un error, elimina el cliente y créalo de nuevo." : ''}
                            />
                            <InputField
                                label="Teléfono"
                                name="telefono"
                                type="tel"
                                value={formData.telefono}
                                onChange={handleInputChange}
                                error={errors.telefono}
                                isRequired={true}
                                placeholder="3001234567"
                                helpText="Número de contacto principal del cliente"
                            />
                        </div>
                    </div>

                    {/* Información de Contacto */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                </svg>
                            </div>
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Contacto y Ubicación
                            </h4>
                        </div>

                        <div className="space-y-6">
                            <InputField
                                label="Correo Electrónico"
                                name="correo"
                                type="email"
                                value={formData.correo}
                                onChange={handleInputChange}
                                error={errors.correo}
                                isRequired={true}
                                placeholder="cliente@email.com"
                                helpText="Dirección de correo electrónico para comunicaciones"
                            />
                            <InputField
                                label="Dirección de Residencia"
                                name="direccion"
                                value={formData.direccion}
                                onChange={handleInputChange}
                                error={errors.direccion}
                                isRequired={true}
                                placeholder="Calle 123 #45-67, Barrio Ejemplo"
                                helpText="Dirección actual de residencia del cliente"
                            />
                        </div>
                    </div>

                    {/* Fecha de Proceso */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Fecha de Ingreso
                            </h4>
                        </div>

                        <InputField
                            label={modo === 'reactivar' ? 'Fecha de Ingreso al Nuevo Proceso' : 'Fecha de Ingreso al Proceso'}
                            name="fechaIngreso"
                            type="date"
                            value={formData.fechaIngreso}
                            onChange={handleInputChange}
                            max={getTodayString()}
                            min={minDateForReactivation}
                            disabled={isFechaIngresoLocked}
                            error={errors.fechaIngreso}
                            isRequired={true}
                            helpText={isFechaIngresoLocked ? "La fecha no se puede modificar porque el cliente ya tiene abonos o ha avanzado en el proceso." : "Fecha en que el cliente ingresó al proceso de compra"}
                            data-tooltip-content={isFechaIngresoLocked ? "La fecha no se puede modificar porque el cliente ya tiene abonos o ha avanzado en el proceso." : ''}
                        />
                    </div>

                    {/* Documentación */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                                <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Documentación Requerida
                            </h4>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Copia de la Cédula <span className="text-red-500">*</span>
                            </label>

                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 border-2 border-dashed border-gray-200 dark:border-gray-700">
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
                                {errors.urlCedula && (
                                    <div className="mt-4 flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                        <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                                            {errors.urlCedula}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Step2_ClientInfo;