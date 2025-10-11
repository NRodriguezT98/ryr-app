/**
 * @file LoginFormFields.jsx
 * @description Campos de formulario optimizados con validación visual
 */

import React from 'react';
import { User, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

const LoginFormFields = ({
    formData,
    uiState,
    isResetMode,
    emailError,
    onEmailChange,
    onPasswordChange,
    onEmailFocus,
    onPasswordFocus,
    onTogglePassword,
}) => {
    const hasEmailError = emailError && formData.email;
    const hasEmailSuccess = !emailError && formData.email && formData.email.length > 0;

    return (
        <>
            {/* Campo de email modernizado con validación */}
            <div className="relative">
                <label className="flex items-center gap-2 text-sm font-medium text-white/90 mb-2">
                    <User size={16} className="text-blue-400" />
                    Correo Electrónico
                </label>
                <div className="relative">
                    {uiState.emailFocused && !hasEmailError && (
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-30 transition-opacity duration-200 animate-fadeIn -z-10" />
                    )}
                    {hasEmailError && (
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl blur opacity-30 transition-opacity duration-200 -z-10" />
                    )}
                    <div className="relative">
                        <input
                            name="email"
                            type="email"
                            required
                            className={`relative z-10 w-full px-4 py-4 pr-12 bg-white/5 border rounded-2xl text-white placeholder-white/50 
                                     backdrop-blur-sm transition-all duration-300 focus:outline-none focus:bg-white/10 
                                     active:scale-[0.98] ${hasEmailError
                                    ? 'border-red-400/50 focus:border-red-400/70'
                                    : hasEmailSuccess
                                        ? 'border-green-400/50 focus:border-green-400/70'
                                        : 'border-white/20 focus:border-blue-400/50'
                                }`}
                            placeholder="tu@correo.com"
                            value={formData.email}
                            onChange={(e) => onEmailChange(e.target.value)}
                            onFocus={() => onEmailFocus(true)}
                            onBlur={() => onEmailFocus(false)}
                        />
                        {/* Icono de validación */}
                        {hasEmailError && (
                            <div className="absolute inset-y-0 right-0 flex items-center pr-4 z-20">
                                <AlertCircle size={20} className="text-red-400" />
                            </div>
                        )}
                        {hasEmailSuccess && !uiState.emailFocused && (
                            <div className="absolute inset-y-0 right-0 flex items-center pr-4 z-20">
                                <CheckCircle size={20} className="text-green-400" />
                            </div>
                        )}
                    </div>
                </div>
                {/* Mensaje de error de email */}
                {hasEmailError && (
                    <p className="mt-2 text-sm text-red-300 flex items-center gap-2 animate-fadeIn">
                        <AlertCircle size={14} />
                        {emailError}
                    </p>
                )}
            </div>

            {/* Campo de contraseña con transición CSS */}
            {!isResetMode && (
                <div className="relative animate-fadeIn">
                    <label className="flex items-center gap-2 text-sm font-medium text-white/90 mb-2">
                        <Lock size={16} className="text-purple-400" />
                        Contraseña
                    </label>
                    <div className="relative">
                        {uiState.passwordFocused && (
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-30 transition-opacity duration-200 animate-fadeIn -z-10" />
                        )}
                        <input
                            name="password"
                            type={uiState.showPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                            required
                            className="relative z-10 w-full px-4 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-white/50 
                                     backdrop-blur-sm transition-all duration-300 focus:outline-none focus:bg-white/10 
                                     focus:border-purple-400/50 focus:shadow-lg focus:shadow-purple-500/25 pr-12 active:scale-[0.98]"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => onPasswordChange(e.target.value)}
                            onFocus={() => onPasswordFocus(true)}
                            onBlur={() => onPasswordFocus(false)}
                        />
                        <button
                            type="button"
                            onClick={onTogglePassword}
                            className="absolute inset-y-0 right-0 flex items-center pr-4 text-white/60 hover:text-white/90 transition-all duration-200 hover:scale-110 active:scale-95 z-20"
                            aria-label={uiState.showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        >
                            {uiState.showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default LoginFormFields;