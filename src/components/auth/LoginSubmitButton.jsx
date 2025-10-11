/**
 * @file LoginSubmitButton.jsx
 * @description Botón de submit optimizado con estados visuales mejorados
 */

import React from 'react';
import { Loader2, Mail, LogIn, ArrowRight, Lock } from 'lucide-react';

const LoginSubmitButton = ({ loading, isResetMode, isBlocked }) => {
    const isDisabled = loading || isBlocked;

    return (
        <div className="transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]">
            <button
                type="submit"
                disabled={isDisabled}
                className={`group relative w-full py-4 px-6 text-white font-semibold rounded-2xl shadow-lg overflow-hidden
                         transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400/50
                         ${isBlocked
                        ? 'bg-gradient-to-r from-gray-600 to-gray-700 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:shadow-2xl hover:shadow-blue-500/25'
                    }
                         ${isDisabled && !isBlocked ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
                {/* Efecto de brillo animado */}
                {!isDisabled && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                                   translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                )}

                <div className="relative flex items-center justify-center gap-3">
                    {loading ? (
                        <Loader2 className="animate-spin" size={20} />
                    ) : isBlocked ? (
                        <Lock size={20} />
                    ) : (
                        <div className="flex items-center gap-2">
                            {isResetMode ? <Mail size={20} /> : <LogIn size={20} />}
                        </div>
                    )}

                    <span className="text-lg">
                        {loading
                            ? 'Procesando...'
                            : isBlocked
                                ? 'Bloqueado'
                                : (isResetMode ? 'Enviar Enlace' : 'Ingresar')
                        }
                    </span>

                    {!loading && !isBlocked && (
                        <div className="animate-pulse">
                            <ArrowRight size={16} />
                        </div>
                    )}
                </div>
            </button>
        </div>
    );
};

export default LoginSubmitButton;