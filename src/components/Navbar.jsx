import { Link, useLocation } from "react-router-dom";
import { useState, useEffect, useRef, Fragment } from "react";
import { Menu, Transition } from '@headlessui/react';
import logo1 from "../assets/logo1.png";
import logo2 from "../assets/logo2.png";

// Pequeño componente de ayuda para los enlaces del menú
const NavLink = ({ to, active, children, colorClass, closeMenu }) => (
    <Link to={to} onClick={closeMenu} className={`${active ? `${colorClass} font-bold` : 'text-gray-900'} group flex rounded-md items-center w-full px-3 py-2 text-sm hover:bg-gray-100`}>
        {children}
    </Link>
);

const Navbar = () => {
    const location = useLocation();
    const [openMenu, setOpenMenu] = useState(null); // Un solo estado para todos los menús
    const menuRef = useRef(null);

    const toggleMenu = (menuName) => {
        setOpenMenu(prev => (prev === menuName ? null : menuName));
    };

    const closeAllMenus = () => {
        setOpenMenu(null);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                closeAllMenus();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const isActiveLink = (path) => location.pathname.startsWith(path);

    return (
        <nav className="bg-white shadow-md sticky top-0 left-0 w-full z-40">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-start space-x-8">
                <Link to="/" className="flex items-center space-x-3">
                    <img src={logo1} alt="Logo 1" className="h-9" />
                    <img src={logo2} alt="Logo 2" className="h-9" />
                </Link>

                <div className="flex items-center space-x-8" ref={menuRef}>
                    {/* Botón Viviendas */}
                    <div className="relative">
                        <button onClick={() => toggleMenu('viviendas')} className={`font-semibold text-gray-700 hover:text-[#c62828] focus:outline-none py-2 relative group ${isActiveLink('/viviendas') ? 'text-[#c62828]' : ''}`}>
                            Viviendas
                            <span className={`absolute left-0 bottom-0 w-full h-0.5 bg-[#c62828] transform transition-transform duration-300 ease-out ${isActiveLink('/viviendas') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
                        </button>
                        <Transition show={openMenu === 'viviendas'} as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                            <div className="absolute left-0 mt-3 w-48 bg-white shadow-lg rounded-lg z-50 border border-gray-100 overflow-hidden p-1">
                                <NavLink to="/viviendas/crear" closeMenu={closeAllMenus}>Registrar Vivienda</NavLink>
                                <NavLink to="/viviendas/listar" closeMenu={closeAllMenus}>Ver Viviendas</NavLink>
                            </div>
                        </Transition>
                    </div>

                    {/* Botón Clientes */}
                    <div className="relative">
                        <button onClick={() => toggleMenu('clientes')} className={`font-semibold text-gray-700 hover:text-[#1976d2] focus:outline-none py-2 relative group ${isActiveLink('/clientes') ? 'text-[#1976d2]' : ''}`}>
                            Clientes
                            <span className={`absolute left-0 bottom-0 w-full h-0.5 bg-[#1976d2] transform transition-transform duration-300 ease-out ${isActiveLink('/clientes') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
                        </button>
                        <Transition show={openMenu === 'clientes'} as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                            <div className="absolute left-0 mt-3 w-48 bg-white shadow-lg rounded-lg z-50 border border-gray-100 overflow-hidden p-1">
                                <NavLink to="/clientes/crear" closeMenu={closeAllMenus}>Registrar Cliente</NavLink>
                                <NavLink to="/clientes/listar" closeMenu={closeAllMenus}>Ver Clientes</NavLink>
                            </div>
                        </Transition>
                    </div>

                    {/* Botón Abonos */}
                    <div className="relative">
                        <button onClick={() => toggleMenu('abonos')} className={`font-semibold text-gray-700 hover:text-green-600 focus:outline-none py-2 relative group ${isActiveLink('/abonos') ? 'text-green-600' : ''}`}>
                            Abonos
                            <span className={`absolute left-0 bottom-0 w-full h-0.5 bg-green-600 transform transition-transform duration-300 ease-out ${isActiveLink('/abonos') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
                        </button>
                        <Transition show={openMenu === 'abonos'} as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                            <div className="absolute left-0 mt-3 w-52 bg-white shadow-lg rounded-lg z-50 border border-gray-100 overflow-hidden p-1">
                                <NavLink to="/abonos" closeMenu={closeAllMenus}>Gestionar Pagos</NavLink>
                                <NavLink to="/abonos/listar" closeMenu={closeAllMenus}>Ver Historial</NavLink>
                            </div>
                        </Transition>
                    </div>

                    {/* Botón Renuncias */}
                    <Link to="/renuncias" className={`font-semibold text-gray-700 hover:text-orange-500 focus:outline-none py-2 relative group ${isActiveLink('/renuncias') ? 'text-orange-500' : ''}`}>
                        Renuncias
                        <span className={`absolute left-0 bottom-0 w-full h-0.5 bg-orange-500 transform transition-transform duration-300 ease-out ${isActiveLink('/renuncias') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;