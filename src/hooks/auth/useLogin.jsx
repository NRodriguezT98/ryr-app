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
        setError('');
        setMessage('');
        setLoading(true);
        try {
            await resetPassword(email);
            setMessage('¡Hecho! Revisa tu correo para ver las instrucciones.');
        } catch (err) {
            // --- INICIO DE LA MODIFICACIÓN ---
            // Se revierte al mensaje de error original, más amigable para el usuario.
            setError('No se pudo enviar el correo. ¿Estás seguro de que es el correcto?');
            // Ya no es necesario el console.error(err)
            // --- FIN DE LA MODIFICACIÓN ---
        }
        setLoading(false);
    };

    const toggleMode = () => {
        setIsResetMode(!isResetMode);
        setError('');
        setMessage('');
        setPassword('');
    };

    return {
        email,
        setEmail,
        password,
        setPassword,
        error,
        message,
        loading,
        isResetMode,
        handlers: {
            handleLoginSubmit,
            handleResetSubmit,
            toggleMode
        }
    };
};