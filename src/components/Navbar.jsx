import { Link, useLocation } from "react-router-dom";
import { useState, useEffect, useRef, Fragment } from "react";
import { Menu, Popover, Transition } from '@headlessui/react';
import logo1 from "../assets/logo1.png";
import logo2 from "../assets/logo2.png";
import { Bell } from "lucide-react";
import { useNotifications } from "../context/NotificationContext";
import NotificationItem from "./notifications/NotificationItem";

const Navbar = () => {
    const location = useLocation();
    const { notifications, unreadCount, markAllAsRead } = useNotifications();

    const [isRinging, setIsRinging] = useState(false);
    const prevUnreadCount = useRef(unreadCount);

    useEffect(() => {
        if (unreadCount > prevUnreadCount.current) {
            setIsRinging(true);
            const timer = setTimeout(() => setIsRinging(false), 500);
            return () => clearTimeout(timer);
        }
        prevUnreadCount.current = unreadCount;
    }, [unreadCount]);

    const isActiveLink = (path) => location.pathname.startsWith(path);

    return (
        <nav className="bg-white shadow-md sticky top-0 left-0 w-full z-40">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-8">
                    <Link to="/" className="flex items-center space-x-3">
                        <img src={logo1} alt="Logo 1" className="h-9" />
                        <img src={logo2} alt="Logo 2" className="h-9" />
                    </Link>

                    {/* --- MENÚS DESPLEGABLES RESTAURADOS --- */}
                    <div className="hidden md:flex items-center space-x-1">
                        <Menu as="div" className="relative inline-block text-left">
                            <Menu.Button className={`font-semibold text-gray-700 hover:text-[#c62828] focus:outline-none py-2 px-3 relative group rounded-md ${isActiveLink('/viviendas') ? 'text-[#c62828]' : ''}`}>
                                Viviendas
                                <span className={`absolute left-0 bottom-0 w-full h-0.5 bg-[#c62828] transform transition-transform duration-300 ease-out ${isActiveLink('/viviendas') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
                            </Menu.Button>
                            <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                                <Menu.Items className="absolute left-0 mt-2 w-56 origin-top-left bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                    <div className="py-1"><Menu.Item><Link to="/viviendas/crear" className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100">Registrar Vivienda</Link></Menu.Item></div>
                                    <div className="py-1"><Menu.Item><Link to="/viviendas/listar" className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100">Ver Viviendas</Link></Menu.Item></div>
                                </Menu.Items>
                            </Transition>
                        </Menu>

                        <Menu as="div" className="relative inline-block text-left">
                            <Menu.Button className={`font-semibold text-gray-700 hover:text-[#1976d2] focus:outline-none py-2 px-3 relative group rounded-md ${isActiveLink('/clientes') ? 'text-[#1976d2]' : ''}`}>
                                Clientes
                                <span className={`absolute left-0 bottom-0 w-full h-0.5 bg-[#1976d2] transform transition-transform duration-300 ease-out ${isActiveLink('/clientes') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
                            </Menu.Button>
                            <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                                <Menu.Items className="absolute left-0 mt-2 w-56 origin-top-left bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                    <div className="py-1"><Menu.Item><Link to="/clientes/crear" className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100">Registrar Cliente</Link></Menu.Item></div>
                                    <div className="py-1"><Menu.Item><Link to="/clientes/listar" className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100">Ver Clientes</Link></Menu.Item></div>
                                </Menu.Items>
                            </Transition>
                        </Menu>

                        <Menu as="div" className="relative inline-block text-left">
                            <Menu.Button className={`font-semibold text-gray-700 hover:text-green-600 focus:outline-none py-2 px-3 relative group rounded-md ${isActiveLink('/abonos') ? 'text-green-600' : ''}`}>
                                Abonos
                                <span className={`absolute left-0 bottom-0 w-full h-0.5 bg-green-600 transform transition-transform duration-300 ease-out ${isActiveLink('/abonos') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
                            </Menu.Button>
                            <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                                <Menu.Items className="absolute left-0 mt-2 w-56 origin-top-left bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                    <div className="py-1"><Menu.Item><Link to="/abonos" className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100">Gestionar Pagos</Link></Menu.Item></div>
                                    <div className="py-1"><Menu.Item><Link to="/abonos/listar" className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100">Listar Abonos</Link></Menu.Item></div>
                                </Menu.Items>
                            </Transition>
                        </Menu>

                        <Link to="/renuncias" className={`font-semibold text-gray-700 hover:text-orange-500 focus:outline-none py-2 px-3 relative group rounded-md ${isActiveLink('/renuncias') ? 'text-orange-500' : ''}`}>
                            Renuncias
                            <span className={`absolute left-0 bottom-0 w-full h-0.5 bg-orange-500 transform transition-transform duration-300 ease-out ${isActiveLink('/renuncias') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
                        </Link>
                    </div>
                </div>

                <div className="relative">
                    <Popover>
                        {({ open, close }) => (
                            <>
                                <Popover.Button className="relative p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                    <Bell className={isRinging ? 'animate-ring' : ''} />
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
                                                <button onClick={() => { markAllAsRead(); close(); }} className="text-xs text-blue-600 hover:underline">Marcar todas como leídas</button>
                                            )}
                                        </div>
                                        <div className="overflow-hidden p-2 max-h-96 overflow-y-auto">
                                            {notifications.length > 0 ? (
                                                notifications.map(notif => <NotificationItem key={notif.id} notification={notif} closePanel={close} />)
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