/**
 * @file LoginMessages.jsx
 * @description Componente mejorado para mostrar mensajes de error y éxito
 */

import React from 'react';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

const LoginMessages = ({ error, message, isBlocked, remainingTime, attemptsLeft }) => {
    return (
        <>
            {/* Mensaje de bloqueo por rate limiting */}
            {isBlocked && (
                <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-2xl backdrop-blur-sm animate-fadeIn">
                    <div className="flex items-start gap-3">
                        <Clock size={20} className="text-orange-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-orange-300 mb-1">
                                Demasiados intentos fallidos
                            </p>
                            <p className="text-xs text-orange-300/80">
                                Por seguridad, espera <span className="font-bold">{remainingTime}s</span> antes de intentar nuevamente
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Advertencia de intentos restantes */}
            {!isBlocked && attemptsLeft <= 2 && attemptsLeft > 0 && (
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl backdrop-blur-sm animate-fadeIn">
                    <p className="text-xs text-yellow-300 text-center flex items-center justify-center gap-2">
                        <AlertCircle size={14} />
                        {attemptsLeft === 1
                            ? 'Último intento antes del bloqueo temporal'
                            : `${attemptsLeft} intentos restantes`
                        }
                    </p>
                </div>
            )}

            {/* Mensajes de error */}
            {error && !isBlocked && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl backdrop-blur-sm animate-fadeIn">
                    <div className="flex items-start gap-3">
                        <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-300 flex-1">
                            {error}
                        </p>
                    </div>
                </div>
            )}

            {/* Mensajes de éxito */}
            {message && (
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-2xl backdrop-blur-sm animate-fadeIn">
                    <div className="flex items-start gap-3">
                        <CheckCircle size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-green-300 flex-1">
                            {message}
                        </p>
                    </div>
                </div>
            )}
        </>
    );
};

export default LoginMessages;