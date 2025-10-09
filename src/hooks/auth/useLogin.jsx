import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const useLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [isResetMode, setIsResetMode] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);

    const { login, resetPassword } = useAuth();
    const navigate = useNavigate();

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError('Error al iniciar sesión. Verifica tus credenciales.');
        }
        setLoading(false);
    };

    const handleResetSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            setError('Por favor, ingresa tu correo electrónico para restablecer la contraseña.');
            return;
        }

        setError('');
        setMessage('');
        setLoading(true);

        try {
            await resetPassword(email);
            setMessage('¡Hecho! Revisa tu correo para ver las instrucciones.');
            setError('');
        } catch (err) {
            setError('No se pudo enviar el correo. ¿Estás seguro de que es el correcto?');
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        if (isResetMode) {
            await handleResetSubmit(e);
        } else {
            await handleLoginSubmit(e);
        }
    };

    const toggleMode = () => {
        setIsResetMode(!isResetMode);
        setError('');
        setMessage('');
        setPassword('');
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return {
        // States
        email,
        password,
        error,
        message,
        loading,
        isResetMode,
        showPassword,
        emailFocused,
        passwordFocused,

        // State setters
        setEmail,
        setPassword,
        setEmailFocused,
        setPasswordFocused,

        // Handlers
        handleSubmit,
        toggleMode,
        togglePasswordVisibility
    };
};