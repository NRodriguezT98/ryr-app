import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogIn, Loader2, Mail, Eye, EyeOff } from 'lucide-react';
import logo1Light from '../../assets/logo1.png';
import logo2Light from '../../assets/logo2.png';
import logo1Dark from '../../assets/logo1-dark.png';
import logo2Dark from '../../assets/logo2-dark.png';
import { useTheme } from '../../hooks/useTheme';
import { AnimatePresence, motion } from 'framer-motion';
import corporateBackground from '../../assets/backgrounds/imagen-corporativa.png';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [isResetMode, setIsResetMode] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // 1. Nuevo estado para el ojo
    const { login, resetPassword } = useAuth();
    const navigate = useNavigate();
    const { theme } = useTheme();

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
        if (!email) {
            setError('Por favor, ingresa tu correo electrónico para restablecer la contraseña.');
            setLoading(false);
            return;
        }
        try {
            await resetPassword(email);
            setMessage('¡Hecho! Revisa tu correo para ver las instrucciones.');
            setError('');
        } catch (err) {
            setError('No se pudo enviar el correo. ¿Estás seguro de que es el correcto?');
        }
        setLoading(false);
    };

    const toggleMode = () => {
        setIsResetMode(!isResetMode);
        setError('');
        setMessage('');
        setPassword('');
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4 bg-gradient-to-br from-blue-100 via-white to-red-100 dark:from-blue-900/50 dark:via-gray-900 dark:to-red-900/50">
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${corporateBackground})` }}
            >
                {/* 3. Capa de oscurecimiento (overlay) */}
                <div className="absolute inset-0 bg-black opacity-50"></div>
            </div>
            <div className="w-full max-w-md p-8 space-y-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border dark:border-gray-700">
                <div className="text-center">
                    <div className="flex justify-center items-center gap-4 mb-4">
                        <img src={theme === 'dark' ? logo1Dark : logo1Light} alt="Logo 1" className="h-10" />
                        <img src={theme === 'dark' ? logo2Dark : logo2Light} alt="Logo 2" className="h-10" />
                    </div>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={isResetMode ? 'reset' : 'login'}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                                {isResetMode ? 'Recuperar Contraseña' : 'Iniciar Sesión'}
                            </h2>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                {isResetMode ? 'Ingresa tu correo para recibir un enlace de recuperación.' : 'Bienvenido de nuevo'}
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </div>

                <form className="mt-6 space-y-6" onSubmit={isResetMode ? handleResetSubmit : handleLoginSubmit}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Correo Electrónico</label>
                        <input
                            name="email" type="email" required
                            className="mt-1 block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
                            placeholder="tu@correo.com"
                            value={email} onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <AnimatePresence>
                        {!isResetMode && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contraseña</label>
                                    <div className="relative mt-1">
                                        <input
                                            name="password"
                                            // --- INICIO DE LA MODIFICACIÓN ---
                                            // 2. Usamos el estado para controlar el tipo de input
                                            type={showPassword ? 'text' : 'password'}
                                            // --- FIN DE LA MODIFICACIÓN ---
                                            autoComplete="current-password"
                                            required
                                            className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 pr-10" // Añadimos padding para el ícono
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        {/* --- INICIO DE LA MODIFICACIÓN --- */}
                                        {/* 3. Botón para mostrar/ocultar la contraseña */}
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 dark:text-gray-400"
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                        {/* --- FIN DE LA MODIFICACIÓN --- */}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {error && <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>}
                    {message && <p className="text-sm text-green-600 dark:text-green-400 text-center">{message}</p>}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 transition-all"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : (isResetMode ? <Mail size={20} className="mr-2" /> : <LogIn size={20} className="mr-2" />)}
                            {loading ? 'Procesando...' : (isResetMode ? 'Enviar Enlace' : 'Ingresar')}
                        </button>
                    </div>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={toggleMode}
                            className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            {isResetMode ? 'Volver a Iniciar Sesión' : '¿Olvidaste tu contraseña?'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;