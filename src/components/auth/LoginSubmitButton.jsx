import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Mail, LogIn, ArrowRight } from 'lucide-react';

const LoginSubmitButton = ({ loading, isResetMode }) => {
    return (
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
                {/* Efecto de brillo animado */}
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
    );
};

export default LoginSubmitButton;