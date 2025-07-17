import { Link, useLocation } from "react-router-dom";
import { useState, useEffect, useRef, Fragment } from "react";
import { Menu, Popover, Transition } from '@headlessui/react';
import logo1 from "../assets/logo1.png";
import logo2 from "../assets/logo2.png";
import { Bell, Home, Users, Wallet, UserX, ChevronDown, PlusCircle, List, UserPlus, Landmark, History } from "lucide-react";
import { useNotifications } from "../context/NotificationContext";
import NotificationItem from "./notifications/NotificationItem";

// --- COMPONENTE MEJORADO: AHORA ACEPTA Y USA UN onClick HANDLER ---
const DropdownLink = ({ to, icon, children, onClick }) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link
            to={to}
            onClick={onClick} // Se añade el manejador de clic aquí
            className={`flex items-center w-full p-3 text-sm rounded-lg transition-colors duration-200 ${isActive ? 'bg-blue-600 text-white font-semibold' : 'text-gray-700 hover:bg-gray-100'}`}
        >
            {icon}
            <span className="ml-3">{children}</span>
        </Link>
    );
};


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
        <header className="bg-white shadow-sm sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">

                    {/* Izquierda: Logo */}
                    <div className="flex-shrink-0">
                        <Link to="/" className="flex items-center space-x-3">
                            <img src={logo1} alt="Logo 1" className="h-9" />
                            <img src={logo2} alt="Logo 2" className="h-9" />
                        </Link>
                    </div>

                    {/* Centro: Navegación Principal */}
                    <div className="hidden md:flex items-center justify-center">
                        <nav className="flex items-center space-x-2 bg-white p-2 rounded-full">
                            <Menu as="div" className="relative">
                                <Menu.Button className={`flex items-center gap-2 font-semibold py-2 px-4 rounded-full transition-colors duration-200 ${isActiveLink('/viviendas') ? 'bg-red-50 text-red-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
                                    <Home size={16} />
                                    <span>Viviendas</span>
                                    <ChevronDown size={16} />
                                </Menu.Button>
                                <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                                    <Menu.Items className="absolute mt-2 w-60 origin-top-left bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none p-2">
                                        {/* --- CADA ITEM AHORA USA LA FUNCIÓN `close` --- */}
                                        <Menu.Item>{({ close }) => (<DropdownLink to="/viviendas/crear" icon={<PlusCircle size={18} />} onClick={close}>Registrar Vivienda</DropdownLink>)}</Menu.Item>
                                        <Menu.Item>{({ close }) => (<DropdownLink to="/viviendas/listar" icon={<List size={18} />} onClick={close}>Ver Viviendas</DropdownLink>)}</Menu.Item>
                                    </Menu.Items>
                                </Transition>
                            </Menu>

                            <Menu as="div" className="relative">
                                <Menu.Button className={`flex items-center gap-2 font-semibold py-2 px-4 rounded-full transition-colors duration-200 ${isActiveLink('/clientes') ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
                                    <Users size={16} />
                                    <span>Clientes</span>
                                    <ChevronDown size={16} />
                                </Menu.Button>
                                <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                                    <Menu.Items className="absolute mt-2 w-60 origin-top-left bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none p-2">
                                        <Menu.Item>{({ close }) => (<DropdownLink to="/clientes/crear" icon={<UserPlus size={18} />} onClick={close}>Registrar Cliente</DropdownLink>)}</Menu.Item>
                                        <Menu.Item>{({ close }) => (<DropdownLink to="/clientes/listar" icon={<Users size={18} />} onClick={close}>Ver Clientes</DropdownLink>)}</Menu.Item>
                                    </Menu.Items>
                                </Transition>
                            </Menu>

                            <Menu as="div" className="relative">
                                <Menu.Button className={`flex items-center gap-2 font-semibold py-2 px-4 rounded-full transition-colors duration-200 ${isActiveLink('/abonos') ? 'bg-green-50 text-green-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
                                    <Wallet size={16} />
                                    <span>Abonos</span>
                                    <ChevronDown size={16} />
                                </Menu.Button>
                                <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                                    <Menu.Items className="absolute mt-2 w-60 origin-top-left bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none p-2">
                                        <Menu.Item>{({ close }) => (<DropdownLink to="/abonos" icon={<Landmark size={18} />} onClick={close}>Gestionar Pagos</DropdownLink>)}</Menu.Item>
                                        <Menu.Item>{({ close }) => (<DropdownLink to="/abonos/listar" icon={<History size={18} />} onClick={close}>Historial de Abonos</DropdownLink>)}</Menu.Item>
                                    </Menu.Items>
                                </Transition>
                            </Menu>

                            <Link to="/renuncias" className={`flex items-center gap-2 font-semibold py-2 px-4 rounded-full transition-colors duration-200 ${isActiveLink('/renuncias') ? 'bg-orange-50 text-orange-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
                                <UserX size={16} />
                                <span>Renuncias</span>
                            </Link>
                        </nav>
                    </div>

                    {/* Derecha: Notificaciones y Perfil */}
                    <div className="flex items-center justify-end">
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
                                    <Transition as={Fragment} show={open} enter="transition ease-out duration-200" enterFrom="opacity-0 translate-y-1" enterTo="opacity-100 translate-y-0" leave="transition ease-in duration-150" leaveFrom="opacity-100 translate-y-0" leaveTo="opacity-0 translate-y-1">
                                        <Popover.Panel className="absolute right-0 mt-2 w-80 max-w-sm transform z-10 bg-white shadow-lg rounded-lg border">
                                            <div className="p-3 flex justify-between items-center border-b">
                                                <h3 className="text-md font-bold text-gray-800">Notificaciones</h3>
                                                {unreadCount > 0 && (
                                                    <button onClick={() => { markAllAsRead(); close(); }} className="text-xs text-blue-600 hover:underline">Marcar todas como leídas</button>
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
            </div>
        </header>
    );
};

export default Navbar;