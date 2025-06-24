import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import logo1 from "../assets/logo1.png";
import logo2 from "../assets/logo2.png";

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [openViviendas, setOpenViviendas] = useState(false);
    const [animacionCierreViviendas, setAnimacionCierreViviendas] = useState(false);
    const menuViviendasRef = useRef(null);

    const [openClientes, setOpenClientes] = useState(false);
    const [animacionCierreClientes, setAnimacionCierreClientes] = useState(false);
    const menuClientesRef = useRef(null);

    // --- NUEVO: Estados para el menú de Abonos ---
    const [openAbonos, setOpenAbonos] = useState(false);
    const [animacionCierreAbonos, setAnimacionCierreAbonos] = useState(false);
    const menuAbonosRef = useRef(null);

    const ANIMATION_DURATION_MS = 250;

    const closeMenuWithAnimation = (setOpenState, setAnimacionCierreState) => {
        setAnimacionCierreState(true);
        setTimeout(() => {
            setOpenState(false);
            setAnimacionCierreState(false);
        }, ANIMATION_DURATION_MS);
    };

    // Lógica para cerrar otros menús al abrir uno nuevo
    const closeOtherMenus = (menuToKeepOpen) => {
        if (menuToKeepOpen !== 'viviendas' && openViviendas) {
            closeMenuWithAnimation(setOpenViviendas, setAnimacionCierreViviendas);
        }
        if (menuToKeepOpen !== 'clientes' && openClientes) {
            closeMenuWithAnimation(setOpenClientes, setAnimacionCierreClientes);
        }
        if (menuToKeepOpen !== 'abonos' && openAbonos) {
            closeMenuWithAnimation(setOpenAbonos, setAnimacionCierreAbonos);
        }
    };

    const toggleMenuViviendas = () => openViviendas ? closeMenuWithAnimation(setOpenViviendas, setAnimacionCierreViviendas) : (setOpenViviendas(true), closeOtherMenus('viviendas'));
    const toggleMenuClientes = () => openClientes ? closeMenuWithAnimation(setOpenClientes, setAnimacionCierreClientes) : (setOpenClientes(true), closeOtherMenus('clientes'));

    // --- NUEVO: Función para el toggle del menú de Abonos ---
    const toggleMenuAbonos = () => openAbonos ? closeMenuWithAnimation(setOpenAbonos, setAnimacionCierreAbonos) : (setOpenAbonos(true), closeOtherMenus('abonos'));

    // MODIFICADO: Ahora cierra todos los menús
    const handleNavigationClick = (path) => {
        closeOtherMenus(null); // Cierra todos los menús
        navigate(path);
    };

    // MODIFICADO: useEffect ahora vigila los 3 menús
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuViviendasRef.current && !menuViviendasRef.current.contains(event.target) && openViviendas) {
                closeMenuWithAnimation(setOpenViviendas, setAnimacionCierreViviendas);
            }
            if (menuClientesRef.current && !menuClientesRef.current.contains(event.target) && openClientes) {
                closeMenuWithAnimation(setOpenClientes, setAnimacionCierreClientes);
            }
            // NUEVO: Lógica para cerrar el menú de Abonos
            if (menuAbonosRef.current && !menuAbonosRef.current.contains(event.target) && openAbonos) {
                closeMenuWithAnimation(setOpenAbonos, setAnimacionCierreAbonos);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [openViviendas, openClientes, openAbonos]); // Dependencias simplificadas

    const isActiveLink = (path) => {
        return location.pathname.startsWith(path);
    };

    return (
        <nav className="bg-white shadow-md sticky top-0 left-0 w-full z-40">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-start space-x-8">
                <Link to="/" className="flex items-center space-x-3">
                    <img src={logo1} alt="Logo 1" className="h-9" />
                    <img src={logo2} alt="Logo 2" className="h-9" />
                </Link>

                <div className="flex items-center space-x-8">
                    {/* Submenú Viviendas */}
                    <div className="relative" ref={menuViviendasRef}>
                        <button onClick={toggleMenuViviendas} className={`font-semibold text-gray-700 hover:text-[#c62828] focus:outline-none py-2 relative group ${isActiveLink('/viviendas') ? 'text-[#c62828]' : ''}`}>
                            Viviendas
                            <span className={`absolute left-0 bottom-0 w-full h-0.5 bg-[#c62828] transform transition-transform duration-300 ease-out ${isActiveLink('/viviendas') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
                        </button>
                        {(openViviendas || animacionCierreViviendas) && (
                            <div className={`absolute left-0 mt-3 w-48 bg-white shadow-lg rounded-lg z-50 border border-gray-100 overflow-hidden transform origin-top transition-all duration-300 ease-out ${animacionCierreViviendas || !openViviendas ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}>
                                <div onClick={() => handleNavigationClick('/viviendas')} className="block px-4 py-2 hover:bg-gray-100 text-sm text-gray-800 cursor-pointer">Registrar Vivienda</div>
                                <div onClick={() => handleNavigationClick('/viviendas/listar')} className="block px-4 py-2 hover:bg-gray-100 text-sm text-gray-800 cursor-pointer">Ver Viviendas</div>
                            </div>
                        )}
                    </div>

                    {/* Submenú Clientes */}
                    <div className="relative" ref={menuClientesRef}>
                        <button onClick={toggleMenuClientes} className={`font-semibold text-gray-700 hover:text-[#1976d2] focus:outline-none py-2 relative group ${isActiveLink('/clientes') ? 'text-[#1976d2]' : ''}`}>
                            Clientes
                            <span className={`absolute left-0 bottom-0 w-full h-0.5 bg-[#1976d2] transform transition-transform duration-300 ease-out ${isActiveLink('/clientes') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
                        </button>
                        {(openClientes || animacionCierreClientes) && (
                            <div className={`absolute left-0 mt-3 w-48 bg-white shadow-lg rounded-lg z-50 border border-gray-100 overflow-hidden transform origin-top transition-all duration-300 ease-out ${animacionCierreClientes || !openClientes ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}>
                                <div onClick={() => handleNavigationClick('/clientes/crear')} className="block px-4 py-2 hover:bg-gray-100 text-sm text-gray-800 cursor-pointer">Registrar Cliente</div>
                                <div onClick={() => handleNavigationClick('/clientes/listar')} className="block px-4 py-2 hover:bg-gray-100 text-sm text-gray-800 cursor-pointer">Ver Clientes</div>
                            </div>
                        )}
                    </div>

                    {/* --- NUEVO: Submenú Abonos --- */}
                    <div className="relative" ref={menuAbonosRef}>
                        <button onClick={toggleMenuAbonos} className={`font-semibold text-gray-700 hover:text-green-600 focus:outline-none py-2 relative group ${isActiveLink('/abonos') ? 'text-green-600' : ''}`}>
                            Abonos
                            <span className={`absolute left-0 bottom-0 w-full h-0.5 bg-green-600 transform transition-transform duration-300 ease-out ${isActiveLink('/abonos') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
                        </button>
                        {(openAbonos || animacionCierreAbonos) && (
                            <div className={`absolute left-0 mt-3 w-48 bg-white shadow-lg rounded-lg z-50 border border-gray-100 overflow-hidden transform origin-top transition-all duration-300 ease-out ${animacionCierreAbonos || !openAbonos ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}>
                                <div onClick={() => handleNavigationClick('/abonos/crear')} className="block px-4 py-2 hover:bg-gray-100 text-sm text-gray-800 cursor-pointer">Registrar Abono</div>
                                <div onClick={() => handleNavigationClick('/abonos')} className="block px-4 py-2 hover:bg-gray-100 text-sm text-gray-800 cursor-pointer">Ver Abonos</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;