import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Eye, EyeOff } from 'lucide-react';

const LoginFormFields = ({
    formData,
    uiState,
    isResetMode,
    onEmailChange,
    onPasswordChange,
    onEmailFocus,
    onPasswordFocus,
    onTogglePassword,
}) => {
    return (
        <>
            {/* Campo de email modernizado */}
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
                        value={formData.email}
                        onChange={(e) => onEmailChange(e.target.value)}
                        onFocus={() => onEmailFocus(true)}
                        onBlur={() => onEmailFocus(false)}
                    />
                    <AnimatePresence>
                        {uiState.emailFocused && (
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

            {/* Campo de contraseña con animación */}
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
                                type={uiState.showPassword ? 'text' : 'password'}
                                autoComplete="current-password"
                                required
                                className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-white/50 
                                         backdrop-blur-sm transition-all duration-300 focus:outline-none focus:bg-white/10 
                                         focus:border-purple-400/50 focus:shadow-lg focus:shadow-purple-500/25 pr-12"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => onPasswordChange(e.target.value)}
                                onFocus={() => onPasswordFocus(true)}
                                onBlur={() => onPasswordFocus(false)}
                            />
                            <motion.button
                                type="button"
                                onClick={onTogglePassword}
                                className="absolute inset-y-0 right-0 flex items-center pr-4 text-white/60 hover:text-white/90 transition-colors duration-200"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={uiState.showPassword ? 'visible' : 'hidden'}
                                        initial={{ opacity: 0, rotate: -90 }}
                                        animate={{ opacity: 1, rotate: 0 }}
                                        exit={{ opacity: 0, rotate: 90 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {uiState.showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </motion.div>
                                </AnimatePresence>
                            </motion.button>
                            <AnimatePresence>
                                {uiState.passwordFocused && (
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
        </>
    );
};

export default LoginFormFields;