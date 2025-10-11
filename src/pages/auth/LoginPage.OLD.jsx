import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, Loader2, Mail, Eye, EyeOff, User, Lock, Sparkles, ArrowRight } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useLogin } from '../../hooks/auth/useLogin';

// Assets
import logo1 from '../../assets/logo1.png';
import logo2 from '../../assets/logo2.png';
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
            {/* Background with corporate image */}
            <div
                className="fixed inset-0 bg-cover bg-center z-0"
                style={{ backgroundImage: `url(${corporateBackground})` }}
            />

            {/* Background overlay */}
            <div className="fixed inset-0 bg-black/50 z-10" />

            {/* Animated background effects */}
            <div className="fixed inset-0 z-20 overflow-hidden">
                {/* Floating particles */}
                {[...Array(15)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white/20 rounded-full"
                        animate={{
                            x: [0, Math.random() * 100 - 50, 0],
                            y: [0, Math.random() * 100 - 50, 0],
                            opacity: [0.2, 0.8, 0.2],
                        }}
                        transition={{
                            duration: 4 + Math.random() * 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                    />
                ))}

                {/* Interactive gradient orbs */}
                <motion.div
                    className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-3xl"
                    animate={{
                        x: mousePosition.x / 20,
                        y: mousePosition.y / 20,
                    }}
                    transition={{ type: "spring", stiffness: 20, damping: 30 }}
                    style={{ left: '10%', top: '20%' }}
                />

                <motion.div
                    className="absolute w-64 h-64 rounded-full bg-gradient-to-r from-pink-500/10 to-orange-500/10 blur-3xl"
                    animate={{
                        x: -mousePosition.x / 30,
                        y: -mousePosition.y / 30,
                    }}
                    transition={{ type: "spring", stiffness: 15, damping: 25 }}
                    style={{ right: '10%', bottom: '20%' }}
                />
            </div>

            {/* Main content */}
            <div className="relative z-30 flex items-center justify-center min-h-screen p-4">
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                        duration: 0.8,
                        type: "spring",
                        stiffness: 100,
                        delay: 0.2
                    }}
                    className="w-full max-w-md"
                >
                    {/* Card with glassmorphism effect */}
                    <div className="relative">
                        {/* Glow effect */}
                        <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 rounded-3xl blur-xl animate-pulse" />

                        <div className="relative bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 p-8 space-y-8 overflow-hidden">
                            {/* Decorative elements */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/10 to-transparent rounded-full -translate-y-16 translate-x-16" />
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-full translate-y-12 -translate-x-12" />

                            {/* Header with logos */}
                            <div className="relative text-center">
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4, duration: 0.6 }}
                                    className="flex justify-center items-center gap-4 mb-6"
                                >
                                    <motion.img
                                        src={logo1}
                                        alt="Logo 1"
                                        className="h-12 filter drop-shadow-lg"
                                        whileHover={{
                                            scale: 1.05,
                                            rotate: 5,
                                            filter: "drop-shadow(0 0 20px rgba(59, 130, 246, 0.5))"
                                        }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                    />

                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{
                                            duration: 20,
                                            repeat: Infinity,
                                            ease: "linear"
                                        }}
                                    >
                                    </motion.div>

                                    <motion.img
                                        src={logo2}
                                        alt="Logo 2"
                                        className="h-12 filter drop-shadow-lg"
                                        whileHover={{
                                            scale: 1.05,
                                            rotate: -5,
                                            filter: "drop-shadow(0 0 20px rgba(168, 85, 247, 0.5))"
                                        }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                    />
                                </motion.div>

                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={isResetMode ? 'reset' : 'login'}
                                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                                        transition={{ duration: 0.4, type: "spring" }}
                                    >
                                        <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent mb-2">
                                            {isResetMode ? 'Recuperar Contraseña' : 'Iniciar Sesión'}
                                        </h2>
                                        <p className="text-sm text-white/70">
                                            {isResetMode
                                                ? 'Ingresa tu correo para recibir un enlace de recuperación.'
                                                : 'Bienvenido de nuevo, esperamos verte pronto'
                                            }
                                        </p>
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            {/* Form */}
                            <motion.form
                                className="relative space-y-6"
                                onSubmit={handleSubmit}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5, duration: 0.6 }}
                            >
                                {/* Email Field */}
                                <motion.div
                                    className="relative"
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <label className="block text-sm font-medium text-white/90 mb-2 flex items-center gap-2">
                                        <User size={16} className="text-blue-400" />
                                        Correo Electrónico
                                    </label>
                                    <div className="relative">
                                        <input
                                            name="email"
                                            type="email"
                                            required
                                            className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-white/50 
                                                     backdrop-blur-sm transition-all duration-300 focus:outline-none focus:bg-white/10 
                                                     focus:border-blue-400/50 focus:shadow-lg focus:shadow-blue-500/25"
                                            placeholder="tu@correo.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            onFocus={() => setEmailFocused(true)}
                                            onBlur={() => setEmailFocused(false)}
                                        />
                                        <AnimatePresence>
                                            {emailFocused && (
                                                <motion.div
                                                    className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-30"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 0.3 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                />
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </motion.div>

                                {/* Password Field */}
                                <AnimatePresence>
                                    {!isResetMode && (
                                        <motion.div
                                            className="relative"
                                            initial={{ opacity: 0, height: 0, y: -20 }}
                                            animate={{ opacity: 1, height: 'auto', y: 0 }}
                                            exit={{ opacity: 0, height: 0, y: -20 }}
                                            transition={{ duration: 0.4, type: "spring" }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <label className="block text-sm font-medium text-white/90 mb-2 flex items-center gap-2">
                                                <Lock size={16} className="text-purple-400" />
                                                Contraseña
                                            </label>
                                            <div className="relative">
                                                <input
                                                    name="password"
                                                    type={showPassword ? 'text' : 'password'}
                                                    autoComplete="current-password"
                                                    required
                                                    className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-white/50 
                                                             backdrop-blur-sm transition-all duration-300 focus:outline-none focus:bg-white/10
                                                             focus:border-purple-400/50 focus:shadow-lg focus:shadow-purple-500/25 pr-12"
                                                    placeholder="••••••••"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    onFocus={() => setPasswordFocused(true)}
                                                    onBlur={() => setPasswordFocused(false)}
                                                />
                                                <motion.button
                                                    type="button"
                                                    onClick={togglePasswordVisibility}
                                                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-white/60 hover:text-white/90 transition-colors duration-200"
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    <AnimatePresence mode="wait">
                                                        <motion.div
                                                            key={showPassword ? 'visible' : 'hidden'}
                                                            initial={{ opacity: 0, rotate: -90 }}
                                                            animate={{ opacity: 1, rotate: 0 }}
                                                            exit={{ opacity: 0, rotate: 90 }}
                                                            transition={{ duration: 0.2 }}
                                                        >
                                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                        </motion.div>
                                                    </AnimatePresence>
                                                </motion.button>
                                                <AnimatePresence>
                                                    {passwordFocused && (
                                                        <motion.div
                                                            className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-30"
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 0.3 }}
                                                            exit={{ opacity: 0 }}
                                                            transition={{ duration: 0.2 }}
                                                        />
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Status Messages */}
                                <AnimatePresence>
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                            className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl backdrop-blur-sm"
                                        >
                                            <p className="text-sm text-red-300 text-center flex items-center justify-center gap-2">
                                                <motion.div
                                                    animate={{ rotate: [0, 10, -10, 0] }}
                                                    transition={{ duration: 0.5 }}
                                                >
                                                    ⚠️
                                                </motion.div>
                                                {error}
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <AnimatePresence>
                                    {message && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                            className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl backdrop-blur-sm"
                                        >
                                            <p className="text-sm text-green-300 text-center flex items-center justify-center gap-2">
                                                <motion.div
                                                    animate={{ scale: [1, 1.2, 1] }}
                                                    transition={{ duration: 0.5 }}
                                                >
                                                    ✅
                                                </motion.div>
                                                {message}
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Submit Button */}
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <motion.button
                                        type="submit"
                                        disabled={loading}
                                        className="group relative w-full py-4 px-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 
                                                 text-white font-semibold rounded-2xl shadow-lg overflow-hidden
                                                 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300
                                                 hover:shadow-2xl hover:shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                                        whileHover={{
                                            boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)",
                                        }}
                                    >
                                        {/* Shine effect */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                                                       translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                                        <div className="relative flex items-center justify-center gap-3">
                                            <AnimatePresence mode="wait">
                                                {loading ? (
                                                    <motion.div
                                                        key="loading"
                                                        initial={{ opacity: 0, scale: 0 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0 }}
                                                    >
                                                        <Loader2 className="animate-spin" size={20} />
                                                    </motion.div>
                                                ) : (
                                                    <motion.div
                                                        key="icon"
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: 20 }}
                                                        className="flex items-center gap-2"
                                                    >
                                                        {isResetMode ? <Mail size={20} /> : <LogIn size={20} />}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            <span className="text-lg">
                                                {loading ? 'Procesando...' : (isResetMode ? 'Enviar Enlace' : 'Ingresar')}
                                            </span>

                                            {!loading && (
                                                <motion.div
                                                    animate={{ x: [0, 5, 0] }}
                                                    transition={{ duration: 1.5, repeat: Infinity }}
                                                >
                                                    <ArrowRight size={16} />
                                                </motion.div>
                                            )}
                                        </div>
                                    </motion.button>
                                </motion.div>

                                {/* Mode Toggle */}
                                <div className="text-center">
                                    <motion.button
                                        type="button"
                                        onClick={toggleMode}
                                        className="text-sm text-white/70 hover:text-white transition-all duration-300 
                                                 hover:bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {isResetMode ? '← Volver a Iniciar Sesión' : '¿Olvidaste tu contraseña? →'}
                                    </motion.button>
                                </div>
                            </motion.form>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default LoginPage;