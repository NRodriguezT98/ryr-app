/**
 * @file LoginPage.jsx
 * @description Página de login optimizada con validaciones y rate limiting
 */

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { useLogin } from '../../hooks/auth/useLogin';

// Componentes optimizados
import LoginBackground from '../../components/auth/LoginBackground';
import LoginHeader from '../../components/auth/LoginHeader';
import LoginFormFields from '../../components/auth/LoginFormFields';
import LoginMessages from '../../components/auth/LoginMessages';
import LoginSubmitButton from '../../components/auth/LoginSubmitButton';

// Assets
import corporateBackground from '../../assets/backgrounds/imagen-corporativa.png';

const LoginPage = () => {
    const { theme } = useTheme();
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const {
        email,
        password,
        error,
        message,
        loading,
        isResetMode,
        showPassword,
        emailFocused,
        passwordFocused,
        emailError,
        isBlocked,
        remainingTime,
        attemptsLeft,
        setEmail,
        setPassword,
        setEmailFocused,
        setPasswordFocused,
        handleSubmit,
        toggleMode,
        togglePasswordVisibility
    } = useLogin();

    // Mouse tracking for interactive background effects
    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Background with corporate image - lazy loaded */}
            <div
                className="fixed inset-0 bg-cover bg-center z-0 pointer-events-none"
                style={{
                    backgroundImage: `url(${corporateBackground})`,
                    imageRendering: 'auto',
                    willChange: 'transform'
                }}
            />

            {/* Background overlay */}
            <div className="fixed inset-0 bg-black/50 z-10 pointer-events-none" />

            {/* Animated background effects */}
            <LoginBackground mousePosition={mousePosition}>
                {/* Main content */}
                <div className="w-full max-w-md animate-fadeIn">
                    {/* Card with glassmorphism effect */}
                    <div className="relative">
                        {/* Glow effect */}
                        <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 rounded-3xl blur-xl animate-pulse pointer-events-none" />

                        <div className="relative bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 p-8 space-y-8 overflow-hidden z-10">
                            {/* Decorative elements */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/10 to-transparent rounded-full -translate-y-16 translate-x-16 pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-full translate-y-12 -translate-x-12 pointer-events-none" />

                            {/* Header con logos */}
                            <LoginHeader isResetMode={isResetMode} />

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                                {/* Messages */}
                                <LoginMessages
                                    error={error}
                                    message={message}
                                    isBlocked={isBlocked}
                                    remainingTime={remainingTime}
                                    attemptsLeft={attemptsLeft}
                                />

                                {/* Form Fields */}
                                <LoginFormFields
                                    formData={{ email, password }}
                                    uiState={{ showPassword, emailFocused, passwordFocused }}
                                    isResetMode={isResetMode}
                                    emailError={emailError}
                                    onEmailChange={setEmail}
                                    onPasswordChange={setPassword}
                                    onEmailFocus={setEmailFocused}
                                    onPasswordFocus={setPasswordFocused}
                                    onTogglePassword={togglePasswordVisibility}
                                />

                                {/* Submit Button */}
                                <LoginSubmitButton
                                    loading={loading}
                                    isResetMode={isResetMode}
                                    isBlocked={isBlocked}
                                />

                                {/* Toggle Reset Mode */}
                                <div className="text-center">
                                    <button
                                        type="button"
                                        onClick={toggleMode}
                                        className="text-sm text-white/80 hover:text-white transition-colors duration-200 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={loading}
                                    >
                                        {isResetMode ? '← Volver al inicio de sesión' : '¿Olvidaste tu contraseña?'}
                                    </button>
                                </div>
                            </form>

                            {/* Footer */}
                            <div className="pt-6 border-t border-white/10">
                                <p className="text-xs text-center text-white/60">
                                    © 2025 R&R Administración. Todos los derechos reservados.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </LoginBackground>
        </div>
    );
};

export default LoginPage;
