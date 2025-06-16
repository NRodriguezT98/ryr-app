import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import logo1 from "../assets/logo1.png";
import logo2 from "../assets/logo2.png";

const Navbar = () => {
    const [openViviendas, setOpenViviendas] = useState(false);
    const [animacionCierre, setAnimacionCierre] = useState(false);
    const menuRef = useRef(null);

    const [openClientes, setOpenClientes] = useState(false);
    const [cerrandoClientes, setCerrandoClientes] = useState(false);
    const clienteMenuRef = useRef(null);

    const toggleMenu = () => {
        if (openViviendas) {
            setAnimacionCierre(true);
            setTimeout(() => {
                setOpenViviendas(false);
                setAnimacionCierre(false);
            }, 250);
        } else {
            setOpenViviendas(true);
        }
    };

    const toggleClientes = () => {
        if (openClientes) {
            setCerrandoClientes(true);
            setTimeout(() => {
                setOpenClientes(false);
                setCerrandoClientes(false);
            }, 250);
        } else {
            setOpenClientes(true);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                menuRef.current && !menuRef.current.contains(event.target) &&
                openViviendas && !animacionCierre
            ) {
                setAnimacionCierre(true);
                setTimeout(() => {
                    setOpenViviendas(false);
                    setAnimacionCierre(false);
                }, 250);
            }

            if (
                clienteMenuRef.current && !clienteMenuRef.current.contains(event.target) &&
                openClientes && !cerrandoClientes
            ) {
                setCerrandoClientes(true);
                setTimeout(() => {
                    setOpenClientes(false);
                    setCerrandoClientes(false);
                }, 250);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [openViviendas, animacionCierre, openClientes, cerrandoClientes]);

    return (
        <nav className="bg-white shadow-md fixed top-0 left-0 w-full z-10">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center space-x-6">
                <Link to="/" className="flex items-center space-x-2">
                    <img src={logo1} alt="Logo 1" className="h-10" />
                    <img src={logo2} alt="Logo 2" className="h-10" />
                </Link>

                <div className="border-l-2 h-8 border-gray-300"></div>

                {/* Submenú Viviendas */}
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={toggleMenu}
                        className="font-semibold text-gray-700 hover:text-[#c62828] focus:outline-none"
                    >
                        Viviendas
                    </button>

                    {(openViviendas || animacionCierre) && (
                        <div
                            className={`absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-lg z-50 border overflow-hidden 
                            ${animacionCierre ? "animate-fade-slide-up" : "animate-fade-slide-down"}`}
                        >
                            <Link
                                to="/viviendas"
                                className="block px-4 py-2 hover:bg-gray-100 text-sm text-gray-800"
                                onClick={toggleMenu}
                            >
                                Crear Vivienda
                            </Link>
                            <Link
                                to="/viviendas/listar"
                                className="block px-4 py-2 hover:bg-gray-100 text-sm text-gray-800"
                                onClick={toggleMenu}
                            >
                                Ver Viviendas
                            </Link>
                        </div>
                    )}
                </div>

                {/* Submenú Clientes */}
                <div className="relative" ref={clienteMenuRef}>
                    <button
                        onClick={toggleClientes}
                        className="font-semibold text-gray-700 hover:text-[#1976d2] focus:outline-none"
                    >
                        Clientes
                    </button>

                    {(openClientes || cerrandoClientes) && (
                        <div
                            className={`absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-lg z-50 border overflow-hidden 
                            ${cerrandoClientes ? "animate-fade-slide-up" : "animate-fade-slide-down"}`}
                        >
                            <Link
                                to="/clientes/crear"
                                className="block px-4 py-2 hover:bg-gray-100 text-sm text-gray-800"
                                onClick={toggleClientes}
                            >
                                Crear Cliente
                            </Link>
                            <Link
                                to="/clientes/listar"
                                className="block px-4 py-2 hover:bg-gray-100 text-sm text-gray-800"
                                onClick={toggleClientes}
                            >
                                Listar Clientes
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
