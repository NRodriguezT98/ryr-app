import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="flex justify-center items-center gap-4 mb-6"
            >
                <motion.img
                    src={theme === 'dark' ? logo1Dark : logo1Light}
                    alt="Logo 1"
                    className="h-12 filter drop-shadow-lg"
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                />
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                    <Sparkles className="w-6 h-6 text-yellow-400" />
                </motion.div>
                <motion.img
                    src={theme === 'dark' ? logo2Dark : logo2Light}
                    alt="Logo 2"
                    className="h-12 filter drop-shadow-lg"
                    whileHover={{ scale: 1.05, rotate: -5 }}
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
                        {isResetMode ? 'Ingresa tu correo para recibir un enlace de recuperación.' : 'Bienvenido de nuevo, esperamos verte pronto'}
                    </p>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default LoginHeader;