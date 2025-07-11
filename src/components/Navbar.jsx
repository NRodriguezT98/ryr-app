import { Link, useLocation } from "react-router-dom";
import { useState, useEffect, useRef, Fragment } from "react";
import { Menu, Popover, Transition } from '@headlessui/react'; // Popover añadido
import logo1 from "../assets/logo1.png";
import logo2 from "../assets/logo2.png";
import { Bell, Check } from "lucide-react"; // Bell y Check añadidos
import { useNotifications } from "../context/NotificationContext"; // Importamos el hook
import NotificationItem from "./notifications/NotificationItem"; // Importamos el item

// Pequeño componente de ayuda para los enlaces del menú
const NavLink = ({ to, active, children, colorClass, closeMenu }) => (
    <Link to={to} onClick={closeMenu} className={`${active ? `${colorClass} font-bold` : 'text-gray-900'} group flex rounded-md items-center w-full px-3 py-2 text-sm hover:bg-gray-100`}>
        {children}
    </Link>
);

const Navbar = () => {
    const location = useLocation();
    const [openMenu, setOpenMenu] = useState(null);
    const menuRef = useRef(null);
    const { notifications, unreadCount, markAllAsRead } = useNotifications(); // Usamos el hook

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
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-8">
                    <Link to="/" className="flex items-center space-x-3">
                        <img src={logo1} alt="Logo 1" className="h-9" />
                        <img src={logo2} alt="Logo 2" className="h-9" />
                    </Link>

                    <div className="flex items-center space-x-8" ref={menuRef}>
                        {/* Menús existentes... */}
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

                        <Link to="/renuncias" className={`font-semibold text-gray-700 hover:text-orange-500 focus:outline-none py-2 relative group ${isActiveLink('/renuncias') ? 'text-orange-500' : ''}`}>
                            Renuncias
                            <span className={`absolute left-0 bottom-0 w-full h-0.5 bg-orange-500 transform transition-transform duration-300 ease-out ${isActiveLink('/renuncias') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
                        </Link>
                    </div>
                </div>

                {/* NUEVO: Icono de notificaciones */}
                <div className="relative">
                    <Popover>
                        {({ open, close }) => (
                            <>
                                <Popover.Button className="relative p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full focus:outline-none">
                                    <Bell />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center ring-2 ring-white">
                                            {unreadCount}
                                        </span>
                                    )}
                                </Popover.Button>
                                <Transition
                                    as={Fragment}
                                    show={open}
                                    enter="transition ease-out duration-200"
                                    enterFrom="opacity-0 translate-y-1"
                                    enterTo="opacity-100 translate-y-0"
                                    leave="transition ease-in duration-150"
                                    leaveFrom="opacity-100 translate-y-0"
                                    leaveTo="opacity-0 translate-y-1"
                                >
                                    <Popover.Panel className="absolute right-0 mt-2 w-80 max-w-sm transform z-10 bg-white shadow-lg rounded-lg border">
                                        <div className="p-3 flex justify-between items-center border-b">
                                            <h3 className="text-md font-bold text-gray-800">Notificaciones</h3>
                                            {unreadCount > 0 && (
                                                <button onClick={markAllAsRead} className="text-xs text-blue-600 hover:underline">Marcar todas como leídas</button>
                                            )}
                                        </div>
                                        <div className="overflow-hidden p-2 max-h-96 overflow-y-auto">
                                            {notifications.length > 0 ? (
                                                notifications.map(notif => <NotificationItem key={notif.id} notification={notif} />)
                                            ) : (
                                                <p className="text-center text-gray-500 py-8 text-sm">No hay notificaciones</p>
                                            )}
                                        </div>
                                    </Popover.Panel>
                                </Transition>
                            </>
                        )}
                    </Popover>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;