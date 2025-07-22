import React, { createContext, useState, useEffect, useMemo } from 'react';

// 1. Creamos el contexto
const ThemeContext = createContext(null);

// 2. Creamos el componente "Proveedor" que envolverá nuestra aplicación
export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        // Leemos el tema guardado o usamos 'light' por defecto
        const storedTheme = localStorage.getItem('theme');
        return storedTheme || 'light';
    });

    useEffect(() => {
        // Este efecto se encarga de aplicar la clase 'dark' al HTML
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    // Usamos useMemo para evitar re-renders innecesarios
    const value = useMemo(() => ({ theme, toggleTheme }), [theme]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

// 3. Exportamos el contexto para que nuestro hook pueda usarlo
export default ThemeContext;