/**
 * @file useLogin.jsx
 * @description Hook optimizado para manejo del formulario de login
 * Incluye validaciones, rate limiting y manejo de errores mejorado
 */

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { validateEmail } from '../../utils/validators';
import { useRateLimiter } from './useRateLimiter';
import { authLogger } from '../../utils/logger';

export const useLogin = () => {
    // Estados del formulario
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [isResetMode, setIsResetMode] = useState(false);

    // Estados de UI
    const [showPassword, setShowPassword] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [emailError, setEmailError] = useState('');

    const { login, resetPassword } = useAuth();
    const navigate = useNavigate();

    // Rate limiter: máximo 5 intentos por minuto
    const {
        isBlocked,
        remainingTime,
        attemptsLeft,
        registerAttempt
    } = useRateLimiter(5, 60000);

    /**
     * Validación de email en tiempo real (debounced)
     */
    useEffect(() => {
        if (!email) {
            setEmailError('');
            return;
        }

        const timeoutId = setTimeout(() => {
            const validation = validateEmail(email);
            if (!validation.isValid) {
                setEmailError(validation.error);
            } else {
                setEmailError('');
            }
        }, 500); // Debounce de 500ms

        return () => clearTimeout(timeoutId);
    }, [email]);

    /**
     * Maneja el submit de login
     */
    const handleLoginSubmit = useCallback(async (e) => {
        e.preventDefault();

        // Verificar rate limit
        if (!registerAttempt()) {
            setError(`Demasiados intentos. Espera ${remainingTime} segundos`);
            return;
        }

        // Validar email
        const emailValidation = validateEmail(email);
        if (!emailValidation.isValid) {
            setError(emailValidation.error);
            return;
        }

        // Validar password
        if (!password || password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setError('');
        setMessage('');
        setLoading(true);

        try {
            await login(email, password);
            // Navegar después del login exitoso
            navigate('/');
        } catch (err) {
            // El error ya viene parseado del servicio y logueado
            setError(err.message || 'Error al iniciar sesión');
            // NO logueamos aquí porque authService ya lo hizo
        } finally {
            setLoading(false);
        }
    }, [email, password, login, navigate, registerAttempt, remainingTime]);

    /**
     * Maneja el submit de reset password
     */
    const handleResetSubmit = useCallback(async (e) => {
        e.preventDefault();

        // Validar email
        const emailValidation = validateEmail(email);
        if (!emailValidation.isValid) {
            setError(emailValidation.error);
            return;
        }

        setError('');
        setMessage('');
        setLoading(true);

        try {
            await resetPassword(email);
            setMessage('✓ Correo enviado. Revisa tu bandeja de entrada');
            setError('');
            setEmail(''); // Limpiar el campo
        } catch (err) {
            setError(err.message || 'No se pudo enviar el correo');
            // NO logueamos aquí porque authService ya lo hizo
        } finally {
            setLoading(false);
        }
    }, [email, resetPassword]);

    /**
     * Maneja el submit general (login o reset)
     */
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        if (isBlocked) {
            setError(`Demasiados intentos. Espera ${remainingTime} segundos`);
            return;
        }

        if (isResetMode) {
            await handleResetSubmit(e);
        } else {
            await handleLoginSubmit(e);
        }
    }, [isResetMode, isBlocked, remainingTime, handleResetSubmit, handleLoginSubmit]);

    /**
     * Alterna entre modo login y reset
     */
    const toggleMode = useCallback(() => {
        setIsResetMode(prev => !prev);
        setError('');
        setMessage('');
        setPassword('');
        setEmailError('');
    }, []);

    /**
     * Alterna visibilidad de contraseña
     */
    const togglePasswordVisibility = useCallback(() => {
        setShowPassword(prev => !prev);
    }, []);

    /**
     * Maneja cambio de email con limpieza de errores
     */
    const handleEmailChange = useCallback((value) => {
        setEmail(value);
        setError(''); // Limpiar error general al escribir
    }, []);

    /**
     * Maneja cambio de password con limpieza de errores
     */
    const handlePasswordChange = useCallback((value) => {
        setPassword(value);
        setError(''); // Limpiar error general al escribir
    }, []);

    return {
        // Estados del formulario
        email,
        password,
        error,
        message,
        loading,
        isResetMode,

        // Estados de UI
        showPassword,
        emailFocused,
        passwordFocused,
        emailError,

        // Rate limiting
        isBlocked,
        remainingTime,
        attemptsLeft,

        // Setters optimizados
        setEmail: handleEmailChange,
        setPassword: handlePasswordChange,
        setEmailFocused,
        setPasswordFocused,

        // Handlers
        handleSubmit,
        toggleMode,
        togglePasswordVisibility
    };
};