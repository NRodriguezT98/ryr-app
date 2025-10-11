import React from 'react';
import { Sparkles } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import logo1Light from '../../assets/logo1.png';
import logo2Light from '../../assets/logo2.png';
import logo1Dark from '../../assets/logo1-dark.png';
import logo2Dark from '../../assets/logo2-dark.png';

const LoginHeader = ({ isResetMode }) => {
    const { theme } = useTheme();

    return (
        <div className="relative text-center">
            <div className="flex justify-center items-center gap-4 mb-6 animate-fadeIn">
                <img
                    src={theme === 'dark' ? logo1Dark : logo1Light}
                    alt="Logo 1"
                    loading="eager"
                    decoding="async"
                    fetchPriority="high"
                    className="h-12 filter drop-shadow-lg transition-transform duration-200 hover:scale-105 hover:rotate-[5deg]"
                />
                <div className="animate-spin-slow">
                    <Sparkles className="w-6 h-6 text-yellow-400" />
                </div>
                <img
                    src={theme === 'dark' ? logo2Dark : logo2Light}
                    alt="Logo 2"
                    loading="eager"
                    decoding="async"
                    fetchPriority="high"
                    className="h-12 filter drop-shadow-lg transition-transform duration-200 hover:scale-105 hover:-rotate-[5deg]"
                />
            </div>

            <div
                key={isResetMode ? 'reset' : 'login'}
                className="animate-fadeIn"
            >
                <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent mb-2">
                    {isResetMode ? 'Recuperar Contraseña' : 'Iniciar Sesión'}
                </h2>
                <p className="text-sm text-white/70">
                    {isResetMode ? 'Ingresa tu correo para recibir un enlace de recuperación.' : 'Bienvenido de nuevo, esperamos verte pronto'}
                </p>
            </div>
        </div>
    );
};

export default LoginHeader;