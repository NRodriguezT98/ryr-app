import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, Fragment } from "react"; // <-- Se importa Fragment
import { Menu, Transition } from '@headlessui/react'; // <-- Se importa Transition
import logo1 from "../assets/logo1.png";
import logo2 from "../assets/logo2.png";

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [openViviendas, setOpenViviendas] = useState(false);
    const menuViviendasRef = useRef(null);

    const [openClientes, setOpenClientes] = useState(false);
    const menuClientesRef = useRef(null);

    const [openAbonos, setOpenAbonos] = useState(false);
    const menuAbonosRef = useRef(null);

    const closeAllMenus = () => {
        setOpenViviendas(false);
        setOpenClientes(false);
        setOpenAbonos(false);
    };

    const toggleMenuViviendas = () => {
        const isOpen = !openViviendas;
        closeAllMenus();
        setOpenViviendas(isOpen);
    };
    const toggleMenuClientes = () => {
        const isOpen = !openClientes;
        closeAllMenus();
        setOpenClientes(isOpen);
    };
    const toggleMenuAbonos = () => {
        const isOpen = !openAbonos;
        closeAllMenus();
        setOpenAbonos(isOpen);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                menuViviendasRef.current && !menuViviendasRef.current.contains(event.target) &&
                menuClientesRef.current && !menuClientesRef.current.contains(event.target) &&
                menuAbonosRef.current && !menuAbonosRef.current.contains(event.target)
            ) {
                closeAllMenus();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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
                        <Transition
                            show={openViviendas}
                            as={Fragment}
                            enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95"
                        >
                            <div className="absolute left-0 mt-3 w-48 bg-white shadow-lg rounded-lg z-50 border border-gray-100 overflow-hidden">
                                <Link to="/viviendas/crear" onClick={closeAllMenus} className="block px-4 py-2 hover:bg-gray-100 text-sm text-gray-800 cursor-pointer">Registrar Vivienda</Link>
                                <Link to="/viviendas/listar" onClick={closeAllMenus} className="block px-4 py-2 hover:bg-gray-100 text-sm text-gray-800 cursor-pointer">Ver Viviendas</Link>
                            </div>
                        </Transition>
                    </div>

                    {/* Submenú Clientes */}
                    <div className="relative" ref={menuClientesRef}>
                        <button onClick={toggleMenuClientes} className={`font-semibold text-gray-700 hover:text-[#1976d2] focus:outline-none py-2 relative group ${isActiveLink('/clientes') ? 'text-[#1976d2]' : ''}`}>
                            Clientes
                            <span className={`absolute left-0 bottom-0 w-full h-0.5 bg-[#1976d2] transform transition-transform duration-300 ease-out ${isActiveLink('/clientes') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
                        </button>
                        <Transition
                            show={openClientes}
                            as={Fragment}
                            enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95"
                        >
                            <div className="absolute left-0 mt-3 w-48 bg-white shadow-lg rounded-lg z-50 border border-gray-100 overflow-hidden">
                                <Link to="/clientes/crear" onClick={closeAllMenus} className="block px-4 py-2 hover:bg-gray-100 text-sm text-gray-800 cursor-pointer">Registrar Cliente</Link>
                                <Link to="/clientes/listar" onClick={closeAllMenus} className="block px-4 py-2 hover:bg-gray-100 text-sm text-gray-800 cursor-pointer">Ver Clientes</Link>
                            </div>
                        </Transition>
                    </div>

                    {/* Submenú Abonos */}
                    <div className="relative" ref={menuAbonosRef}>
                        <button onClick={toggleMenuAbonos} className={`font-semibold text-gray-700 hover:text-green-600 focus:outline-none py-2 relative group ${isActiveLink('/abonos') ? 'text-green-600' : ''}`}>
                            Abonos
                            <span className={`absolute left-0 bottom-0 w-full h-0.5 bg-green-600 transform transition-transform duration-300 ease-out ${isActiveLink('/abonos') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
                        </button>
                        <Transition
                            show={openAbonos}
                            as={Fragment}
                            enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95"
                        >
                            <div className="absolute left-0 mt-3 w-52 bg-white shadow-lg rounded-lg z-50 border border-gray-100 overflow-hidden">
                                <Link to="/abonos" onClick={closeAllMenus} className="block px-4 py-2 hover:bg-gray-100 text-sm text-gray-800 cursor-pointer">Gestionar Pagos</Link>
                                <Link to="/abonos/listar" onClick={closeAllMenus} className="block px-4 py-2 hover:bg-gray-100 text-sm text-gray-800 cursor-pointer">Ver Historial</Link>
                            </div>
                        </Transition>
                    </div>

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