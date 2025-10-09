import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const useLoginForm = () => {
    // Estados del formulario
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    // Estados de la UI
    const [uiState, setUiState] = useState({
        error: '',
        message: '',
        loading: false,
        isResetMode: false,
        showPassword: false,
        emailFocused: false,
        passwordFocused: false,
    });

    // Estados de efectos visuales
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const { login, resetPassword } = useAuth();
    const navigate = useNavigate();

    // Efecto para seguir el mouse
    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Handlers del formulario
    const updateFormData = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const updateUIState = (updates) => {
        setUiState(prev => ({ ...prev, ...updates }));
    };

    const clearMessages = () => {
        setUiState(prev => ({ ...prev, error: '', message: '' }));
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        clearMessages();
        updateUIState({ loading: true });

        try {
            await login(formData.email, formData.password);
            navigate('/');
        } catch (err) {
            updateUIState({
                error: 'Error al iniciar sesión. Verifica tus credenciales.',
                loading: false
            });
        }
    };

    const handleResetSubmit = async (e) => {
        e.preventDefault();
        clearMessages();
        updateUIState({ loading: true });

        if (!formData.email) {
            updateUIState({
                error: 'Por favor, ingresa tu correo electrónico para restablecer la contraseña.',
                loading: false
            });
            return;
        }

        try {
            await resetPassword(formData.email);
            updateUIState({
                message: '¡Hecho! Revisa tu correo para ver las instrucciones.',
                loading: false
            });
        } catch (err) {
            updateUIState({
                error: 'No se pudo enviar el correo. ¿Estás seguro de que es el correcto?',
                loading: false
            });
        }
    };

    const toggleMode = () => {
        setUiState(prev => ({
            ...prev,
            isResetMode: !prev.isResetMode,
            error: '',
            message: '',
        }));
        setFormData(prev => ({ ...prev, password: '' }));
    };

    const togglePasswordVisibility = () => {
        setUiState(prev => ({ ...prev, showPassword: !prev.showPassword }));
    };

    const handleEmailFocus = (focused) => {
        setUiState(prev => ({ ...prev, emailFocused: focused }));
    };

    const handlePasswordFocus = (focused) => {
        setUiState(prev => ({ ...prev, passwordFocused: focused }));
    };

    return {
        // Estados
        formData,
        uiState,
        mousePosition,

        // Handlers
        updateFormData,
        handleLoginSubmit,
        handleResetSubmit,
        toggleMode,
        togglePasswordVisibility,
        handleEmailFocus,
        handlePasswordFocus,
    };
};