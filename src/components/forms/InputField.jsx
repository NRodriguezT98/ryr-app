// src/components/forms/InputField.jsx (Versión completamente modernizada)
import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle, Lock, Calendar, Mail, Phone, User, MapPin, Hash } from 'lucide-react';
import ModernDatePicker from './ModernDatePicker';

const InputField = ({
    label,
    name,
    type = 'text',
    error,
    isRequired,
    disabled,
    placeholder,
    helpText,
    icon: CustomIcon,
    ...props
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    // Determinar el icono automáticamente basado en el tipo o nombre del campo
    const getIcon = () => {
        if (CustomIcon) return CustomIcon;

        switch (type) {
            case 'email': return Mail;
            case 'tel':
            case 'phone': return Phone;
            case 'date': return Calendar;
            case 'password': return Lock;
            default:
                switch (name) {
                    case 'nombres':
                    case 'apellidos': return User;
                    case 'telefono': return Phone;
                    case 'cedula': return Hash;
                    case 'direccion': return MapPin;
                    default: return null;
                }
        }
    };

    const Icon = getIcon();
    const isPassword = type === 'password';
    const actualType = isPassword && showPassword ? 'text' : type;

    // Si es un campo de fecha, usar el ModernDatePicker
    if (type === 'date') {
        return (
            <ModernDatePicker
                label={label}
                name={name}
                value={props.value}
                onChange={props.onChange}
                error={error}
                isRequired={isRequired}
                disabled={disabled}
                helpText={helpText}
                min={props.min}
                max={props.max}
                placeholder={placeholder}
                {...props}
            />
        );
    }

    return (
        <div className="space-y-2">
            {/* Label mejorado */}
            <label
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1"
                htmlFor={name}
            >
                {label}
                {isRequired && <span className="text-red-500">*</span>}
                {disabled && (
                    <Lock size={12} className="text-gray-400 dark:text-gray-500 ml-1" />
                )}
            </label>

            {/* Container del input */}
            <div className="relative">
                {/* Icono izquierdo */}
                {Icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Icon
                            size={18}
                            className={`
                                ${error ? 'text-red-400' :
                                    isFocused ? 'text-blue-500' :
                                        'text-gray-400 dark:text-gray-500'}
                                transition-colors duration-200
                            `}
                        />
                    </div>
                )}

                {/* Input field */}
                <input
                    id={name}
                    name={name}
                    type={actualType}
                    placeholder={placeholder}
                    disabled={disabled}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    {...props}
                    className={`
                        w-full h-12 text-sm font-medium rounded-xl border-2 transition-all duration-200 ease-in-out
                        ${Icon ? 'pl-11' : 'pl-4'}
                        ${isPassword ? 'pr-11' : 'pr-4'}
                        
                        /* Estados normales */
                        ${!error && !disabled ?
                            `bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 
                             text-gray-900 dark:text-gray-100
                             placeholder-gray-400 dark:placeholder-gray-500
                             hover:border-gray-300 dark:hover:border-gray-600
                             focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/50
                             focus:outline-none` : ''}
                        
                        /* Estado con error */
                        ${error ?
                            `bg-red-50 dark:bg-red-900/10 border-red-300 dark:border-red-700
                             text-red-900 dark:text-red-100
                             placeholder-red-400 dark:placeholder-red-500
                             focus:border-red-500 focus:ring-4 focus:ring-red-100 dark:focus:ring-red-900/50
                             focus:outline-none` : ''}
                        
                        /* Estado deshabilitado */
                        ${disabled ?
                            `bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700
                             text-gray-500 dark:text-gray-400
                             cursor-not-allowed opacity-60` : ''}
                    `}
                />

                {/* Botón show/hide para passwords */}
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        disabled={disabled}
                    >
                        {showPassword ? (
                            <EyeOff size={18} className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" />
                        ) : (
                            <Eye size={18} className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" />
                        )}
                    </button>
                )}

                {/* Icono de error */}
                {error && !isPassword && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <AlertCircle size={18} className="text-red-400" />
                    </div>
                )}
            </div>

            {/* Texto de ayuda */}
            {helpText && !error && (
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    {helpText}
                </p>
            )}

            {/* Mensaje de error mejorado */}
            {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                        {error}
                    </p>
                </div>
            )}

            {/* Tooltip para campos deshabilitados */}
            {disabled && props['data-tooltip-content'] && (
                <div
                    data-tooltip-id="app-tooltip"
                    data-tooltip-content={props['data-tooltip-content']}
                    className="hidden"
                />
            )}
        </div>
    );
};

export default InputField;