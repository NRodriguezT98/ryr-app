import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LoginMessages = ({ error, message }) => {
    return (
        <>
            {/* Mensajes de error */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl backdrop-blur-sm"
                    >
                        <p className="text-sm text-red-300 text-center flex items-center justify-center gap-2">
                            <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 0.5 }}>
                                ⚠️
                            </motion.div>
                            {error}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mensajes de éxito */}
            <AnimatePresence>
                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl backdrop-blur-sm"
                    >
                        <p className="text-sm text-green-300 text-center flex items-center justify-center gap-2">
                            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5 }}>
                                ✅
                            </motion.div>
                            {message}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default LoginMessages;