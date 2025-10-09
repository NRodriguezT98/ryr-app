import React from 'react';
import { motion } from 'framer-motion';

const LoginBackground = ({ mousePosition, children }) => {
    return (
        <div className="relative flex items-center justify-center min-h-screen overflow-hidden p-4">
            {/* Efectos modernos adicionales */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Partículas flotantes */}
                <div className="absolute inset-0">
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
                                duration: 3 + Math.random() * 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                            }}
                        />
                    ))}
                </div>

                {/* Efectos de gradiente interactivo */}
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

            {children}
        </div>
    );
};

export default LoginBackground;