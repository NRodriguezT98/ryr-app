import React from 'react';
import { useLogin } from '../../hooks/auth/useLogin';
import { LogIn, Loader2, Mail } from 'lucide-react';
import logo1Light from '../../assets/logo1.png';
import logo2Light from '../../assets/logo2.png';
import logo1Dark from '../../assets/logo1-dark.png';
import logo2Dark from '../../assets/logo2-dark.png';
import { useTheme } from '../../hooks/useTheme';
import { AnimatePresence, motion } from 'framer-motion';
// 1. Importamos la imagen de fondo
import corporateBackground from '../../assets/backgrounds/imagen-corporativa.png';

const LoginPage = () => {
    const {
        email, setEmail,
        password, setPassword,
        error, message,
        loading, isResetMode,
        handlers
    } = useLogin();

    const { theme } = useTheme();

    return (
        <div className="relative flex items-center justify-center min-h-screen p-4">
            {/* 2. Contenedor para la imagen de fondo y el oscurecimiento */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${corporateBackground})` }}
            >
                {/* 3. Capa de oscurecimiento (overlay) */}
                <div className="absolute inset-0 bg-black opacity-50"></div>
            </div>

            {/* 4. Contenedor del Formulario (se mantiene por encima con z-10) */}
            <div className="relative w-full max-w-lg p-8 space-y-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border dark:border-gray-700 z-10">
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

                <form className="mt-6 space-y-6" onSubmit={isResetMode ? handlers.handleResetSubmit : handlers.handleLoginSubmit}>
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
                                    <input
                                        name="password" type="password" required={!isResetMode}
                                        className="mt-1 block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
                                        placeholder="••••••••"
                                        value={password} onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {error && <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>}
                    {message && <p className="text-sm text-green-600 dark:text-green-400 text-center">{message}</p>}

                    <div>
                        <button
                            type="submit" disabled={loading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 transition-all"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : (isResetMode ? <Mail size={20} className="mr-2" /> : <LogIn size={20} className="mr-2" />)}
                            {loading ? 'Procesando...' : (isResetMode ? 'Enviar Enlace' : 'Ingresar')}
                        </button>
                    </div>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={handlers.toggleMode}
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