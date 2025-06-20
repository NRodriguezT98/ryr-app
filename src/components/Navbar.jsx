import { Link, useLocation, useNavigate } from "react-router-dom"; // Importa useNavigate
import { useState, useEffect, useRef } from "react";
import logo1 from "../assets/logo1.png";
import logo2 from "../assets/logo2.png";

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate(); // Inicializa useNavigate

    const [openViviendas, setOpenViviendas] = useState(false);
    const [animacionCierreViviendas, setAnimacionCierreViviendas] = useState(false);
    const menuViviendasRef = useRef(null);

    const [openClientes, setOpenClientes] = useState(false);
    const [animacionCierreClientes, setAnimacionCierreClientes] = useState(false);
    const menuClientesRef = useRef(null);

    const ANIMATION_DURATION_MS = 250;

    // Función para cerrar un menú desplegable con animación
    const closeMenuWithAnimation = (setOpenState, setAnimacionCierreState) => {
        setAnimacionCierreState(true);
        setTimeout(() => {
            setOpenState(false);
            setAnimacionCierreState(false);
        }, ANIMATION_DURATION_MS);
    };

    // Lógica para abrir/cerrar menú Viviendas. Cierra el otro si está abierto.
    const toggleMenuViviendas = () => {
        if (openViviendas) {
            closeMenuWithAnimation(setOpenViviendas, setAnimacionCierreViviendas);
        } else {
            setOpenViviendas(true);
            if (openClientes) { // Si el otro menú está abierto, ciérralo inmediatamente
                closeMenuWithAnimation(setOpenClientes, setAnimacionCierreClientes);
            }
        }
    };

    // Lógica para abrir/cerrar menú Clientes. Cierra el otro si está abierto.
    const toggleMenuClientes = () => {
        if (openClientes) {
            closeMenuWithAnimation(setOpenClientes, setAnimacionCierreClientes);
        } else {
            setOpenClientes(true);
            if (openViviendas) { // Si el otro menú está abierto, ciérralo inmediatamente
                closeMenuWithAnimation(setOpenViviendas, setAnimacionCierreViviendas);
            }
        }
    };

    // Nueva función para manejar el clic en un enlace de submenú o enlace directo
    const handleNavigationClick = (path) => {
        // Cierra todos los menús desplegables con animación
        if (openViviendas) {
            closeMenuWithAnimation(setOpenViviendas, setAnimacionCierreViviendas);
        }
        if (openClientes) {
            closeMenuWithAnimation(setOpenClientes, setAnimacionCierreClientes);
        }
        // Navega programáticamente a la nueva ruta
        navigate(path);
    };


    useEffect(() => {
        const handleClickOutside = (event) => {
            // Cierra menú Viviendas si el clic fue fuera y no es parte de su botón
            if (
                menuViviendasRef.current && !menuViviendasRef.current.contains(event.target) &&
                openViviendas && !animacionCierreViviendas
            ) {
                closeMenuWithAnimation(setOpenViviendas, setAnimacionCierreViviendas);
            }

            // Cierra menú Clientes si el clic fue fuera y no es parte de su botón
            if (
                menuClientesRef.current && !menuClientesRef.current.contains(event.target) &&
                openClientes && !animacionCierreClientes
            ) {
                closeMenuWithAnimation(setOpenClientes, setAnimacionCierreClientes);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [openViviendas, animacionCierreViviendas, openClientes, animacionCierreClientes]);

    const isActiveLink = (path) => {
        if (path === '/viviendas' && location.pathname.startsWith('/viviendas')) {
            return true;
        }
        if (path === '/clientes' && location.pathname.startsWith('/clientes')) {
            return true;
        }
        if (path === '/abonos' && location.pathname.startsWith('/abonos')) {
            return true;
        }
        return location.pathname === path;
    };

    return (
        <nav className="bg-white shadow-md sticky top-0 left-0 w-full z-40">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-start space-x-8">
                <Link to="/" className="flex items-center space-x-3" onClick={() => handleNavigationClick('/')}> {/* Añadido onClick para el logo */}
                    <img src={logo1} alt="Logo 1" className="h-9" />
                    <img src={logo2} alt="Logo 2" className="h-9" />
                </Link>

                <div className="flex items-center space-x-8">
                    {/* Submenú Viviendas */}
                    <div className="relative" ref={menuViviendasRef}>
                        <button
                            onClick={toggleMenuViviendas}
                            className={`font-semibold text-gray-700 hover:text-[#c62828] focus:outline-none py-2 relative group 
                                ${isActiveLink('/viviendas') ? 'text-[#c62828]' : ''}`}
                        >
                            Viviendas
                            <span className={`absolute left-0 bottom-0 w-full h-0.5 bg-[#c62828] transform transition-transform duration-${ANIMATION_DURATION_MS} ease-out 
                                ${isActiveLink('/viviendas') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
                        </button>

                        {(openViviendas || animacionCierreViviendas) && (
                            <div
                                className={`absolute left-0 mt-3 w-48 bg-white shadow-lg rounded-lg z-50 border border-gray-100 overflow-hidden transform origin-top 
                                    transition-all duration-${ANIMATION_DURATION_MS} ease-out 
                                    ${animacionCierreViviendas ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
                            >
                                {/* USAR DIVS CON ONCLICK Y NAVEGAR PROGRAMÁTICAMENTE */}
                                <div
                                    onClick={() => handleNavigationClick('/viviendas')}
                                    className="block px-4 py-2 hover:bg-gray-100 text-sm text-gray-800 transition-colors duration-150 cursor-pointer"
                                >
                                    Crear Vivienda
                                </div>
                                <div
                                    onClick={() => handleNavigationClick('/viviendas/listar')}
                                    className="block px-4 py-2 hover:bg-gray-100 text-sm text-gray-800 transition-colors duration-150 cursor-pointer"
                                >
                                    Ver Viviendas
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Submenú Clientes */}
                    <div className="relative" ref={menuClientesRef}>
                        <button
                            onClick={toggleMenuClientes}
                            className={`font-semibold text-gray-700 hover:text-[#1976d2] focus:outline-none py-2 relative group
                                ${isActiveLink('/clientes') ? 'text-[#1976d2]' : ''}`}
                        >
                            Clientes
                            <span className={`absolute left-0 bottom-0 w-full h-0.5 bg-[#1976d2] transform transition-transform duration-${ANIMATION_DURATION_MS} ease-out
                                ${isActiveLink('/clientes') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
                        </button>

                        {(openClientes || animacionCierreClientes) && (
                            <div
                                className={`absolute left-0 mt-3 w-48 bg-white shadow-lg rounded-lg z-50 border border-gray-100 overflow-hidden transform origin-top
                                    transition-all duration-${ANIMATION_DURATION_MS} ease-out
                                    ${animacionCierreClientes ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
                            >
                                {/* USAR DIVS CON ONCLICK Y NAVEGAR PROGRAMÁTICAMENTE */}
                                <div
                                    onClick={() => handleNavigationClick('/clientes/crear')}
                                    className="block px-4 py-2 hover:bg-gray-100 text-sm text-gray-800 transition-colors duration-150 cursor-pointer"
                                >
                                    Crear Cliente
                                </div>
                                <div
                                    onClick={() => handleNavigationClick('/clientes/listar')}
                                    className="block px-4 py-2 hover:bg-gray-100 text-sm text-gray-800 transition-colors duration-150 cursor-pointer"
                                >
                                    Listar Clientes
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ENLACE PARA ABONOS */}
                    <Link
                        to="/abonos" // Se mantiene to, pero el onClick lo manejará
                        className={`font-semibold text-gray-700 hover:text-green-600 focus:outline-none py-2 relative group
                            ${isActiveLink('/abonos') ? 'text-green-600' : ''}`}
                        onClick={() => handleNavigationClick('/abonos')} // Usa la nueva función
                    >
                        Abonos
                        <span className={`absolute left-0 bottom-0 w-full h-0.5 bg-green-600 transform transition-transform duration-${ANIMATION_DURATION_MS} ease-out
                            ${isActiveLink('/abonos') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;