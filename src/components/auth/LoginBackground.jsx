import React from 'react';

const LoginBackground = ({ mousePosition, children }) => {
    return (
        <div className="relative flex items-center justify-center min-h-screen overflow-hidden p-4 z-20">
            {/* Efectos modernos adicionales */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Partículas flotantes con CSS */}
                <div className="absolute inset-0">
                    {[...Array(15)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-1 h-1 bg-white/20 rounded-full animate-float"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 3}s`,
                                animationDuration: `${3 + Math.random() * 2}s`
                            }}
                        />
                    ))}
                </div>

                {/* Efectos de gradiente interactivo */}
                <div
                    className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-3xl transition-transform duration-700 ease-out"
                    style={{
                        left: '10%',
                        top: '20%',
                        transform: `translate(${mousePosition.x / 20}px, ${mousePosition.y / 20}px)`
                    }}
                />
                <div
                    className="absolute w-64 h-64 rounded-full bg-gradient-to-r from-pink-500/10 to-orange-500/10 blur-3xl transition-transform duration-1000 ease-out"
                    style={{
                        right: '10%',
                        bottom: '20%',
                        transform: `translate(${-mousePosition.x / 30}px, ${-mousePosition.y / 30}px)`
                    }}
                />
            </div>

            {children}
        </div>
    );
};

export default LoginBackground;