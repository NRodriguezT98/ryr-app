import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, Fragment } from "react";
import { Menu, Popover, Transition } from '@headlessui/react';
import logo1Light from "../assets/logo1.png";
import logo2Light from "../assets/logo2.png";
import logo1Dark from "../assets/logo1-dark.png";
import logo2Dark from "../assets/logo2-dark.png";
import { useTheme } from "../hooks/useTheme";
import { useAuth } from "../context/AuthContext";
import { Bell, Home, Users, Wallet, UserX, ChevronDown, PlusCircle, List, UserPlus, Landmark, History, Trash2, BarChart2, LogOut, UserCircle, ShieldCheck } from "lucide-react";
import { useNotifications } from "../context/NotificationContext";
import NotificationItem from "./notifications/NotificationItem";
import ThemeSwitcher from "./ThemeSwitcher";
import { getInitials } from "../utils/textFormatters";

const DropdownLink = ({ to, icon, children, onClick }) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link
            to={to}
            onClick={onClick}
            className={`flex items-center w-full p-3 text-sm rounded-lg transition-colors duration-200 ${isActive ? 'bg-blue-600 text-white font-semibold' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
        >
            {icon}
            <span className="ml-3">{children}</span>
        </Link>
    );
};

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { notifications, unreadCount, markAllAsRead, clearAllNotifications, groupedNotifications } = useNotifications();
    const { theme } = useTheme();
    const { currentUser, userData, logout } = useAuth();

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

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    return (
        <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex-shrink-0">
                        <Link to="/" className="flex items-center space-x-3">
                            <img src={theme === 'dark' ? logo1Dark : logo1Light} alt="Logo 1" className="h-9" />
                            <img src={theme === 'dark' ? logo2Dark : logo2Light} alt="Logo 2" className="h-9" />
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center justify-center">
                        <nav className="flex items-center space-x-2 bg-white dark:bg-gray-800 p-2 rounded-full">
                            {/* Menú Viviendas */}
                            <Menu as="div" className="relative">
                                <Menu.Button className={`flex items-center gap-2 font-semibold py-2 px-4 rounded-full transition-colors duration-200 ${isActiveLink('/viviendas') ? 'bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300' : 'text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                                    <Home size={16} />
                                    <span>Viviendas</span>
                                    <ChevronDown size={16} />
                                </Menu.Button>
                                <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                                    <Menu.Items className="absolute mt-2 w-60 origin-top-left bg-white dark:bg-gray-800 rounded-xl shadow-lg ring-1 ring-black dark:ring-gray-700 ring-opacity-5 focus:outline-none p-2 z-10">
                                        <Menu.Item>{({ close }) => (<DropdownLink to="/viviendas/crear" icon={<PlusCircle size={18} />} onClick={close}>Registrar Vivienda</DropdownLink>)}</Menu.Item>
                                        <Menu.Item>{({ close }) => (<DropdownLink to="/viviendas/listar" icon={<List size={18} />} onClick={close}>Ver Viviendas</DropdownLink>)}</Menu.Item>
                                    </Menu.Items>
                                </Transition>
                            </Menu>

                            {/* Menú Clientes */}
                            <Menu as="div" className="relative">
                                <Menu.Button className={`flex items-center gap-2 font-semibold py-2 px-4 rounded-full transition-colors duration-200 ${isActiveLink('/clientes') ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                                    <Users size={16} />
                                    <span>Clientes</span>
                                    <ChevronDown size={16} />
                                </Menu.Button>
                                <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                                    <Menu.Items className="absolute mt-2 w-60 origin-top-left bg-white dark:bg-gray-800 rounded-xl shadow-lg ring-1 ring-black dark:ring-gray-700 ring-opacity-5 focus:outline-none p-2 z-10">
                                        <Menu.Item>{({ close }) => (<DropdownLink to="/clientes/crear" icon={<UserPlus size={18} />} onClick={close}>Registrar Cliente</DropdownLink>)}</Menu.Item>
                                        <Menu.Item>{({ close }) => (<DropdownLink to="/clientes/listar" icon={<Users size={18} />} onClick={close}>Ver Clientes</DropdownLink>)}</Menu.Item>
                                    </Menu.Items>
                                </Transition>
                            </Menu>

                            {/* Menú Abonos */}
                            <Menu as="div" className="relative">
                                <Menu.Button className={`flex items-center gap-2 font-semibold py-2 px-4 rounded-full transition-colors duration-200 ${isActiveLink('/abonos') ? 'bg-green-50 text-green-700 dark:bg-green-900/50 dark:text-green-300' : 'text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                                    <Wallet size={16} />
                                    <span>Abonos</span>
                                    <ChevronDown size={16} />
                                </Menu.Button>
                                <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                                    <Menu.Items className="absolute mt-2 w-60 origin-top-left bg-white dark:bg-gray-800 rounded-xl shadow-lg ring-1 ring-black dark:ring-gray-700 ring-opacity-5 focus:outline-none p-2 z-10">
                                        <Menu.Item>{({ close }) => (<DropdownLink to="/abonos" icon={<Landmark size={18} />} onClick={close}>Gestionar Pagos</DropdownLink>)}</Menu.Item>
                                        <Menu.Item>{({ close }) => (<DropdownLink to="/abonos/listar" icon={<History size={18} />} onClick={close}>Historial de Abonos</DropdownLink>)}</Menu.Item>
                                    </Menu.Items>
                                </Transition>
                            </Menu>

                            {/* Enlace Renuncias */}
                            <Link to="/renuncias" className={`flex items-center gap-2 font-semibold py-2 px-4 rounded-full transition-colors duration-200 ${isActiveLink('/renuncias') ? 'bg-orange-50 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300' : 'text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                                <UserX size={16} />
                                <span>Renuncias</span>
                            </Link>

                            {/* Enlace Reportes */}
                            <Link to="/reportes" className={`flex items-center gap-2 font-semibold py-2 px-4 rounded-full transition-colors duration-200 ${isActiveLink('/reportes') ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300' : 'text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                                <BarChart2 size={16} />
                                <span>Reportes</span>
                            </Link>
                            {/* El menú de Administración solo se renderiza si el rol del usuario es 'admin' */}
                            {userData?.role === 'admin' && (
                                <Menu as="div" className="relative">
                                    <Menu.Button className={`flex items-center gap-2 font-semibold py-2 px-4 rounded-full transition-colors duration-200 ${isActiveLink('/admin') ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                                        <ShieldCheck size={16} />
                                        <span>Admin</span>
                                        <ChevronDown size={16} />
                                    </Menu.Button>
                                    <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                                        <Menu.Items className="absolute mt-2 w-60 origin-top-left bg-white dark:bg-gray-800 rounded-xl shadow-lg ring-1 ring-black dark:ring-gray-700 ring-opacity-5 focus:outline-none p-2 z-10">
                                            <Menu.Item>{({ close }) => (<DropdownLink to="/admin" icon={<Users size={18} />} onClick={close}>Gestionar Usuarios</DropdownLink>)}</Menu.Item>
                                            {/* Aquí podríamos añadir más enlaces de admin en el futuro */}
                                        </Menu.Items>
                                    </Transition>
                                </Menu>
                            )}
                        </nav>
                    </div>

                    <div className="flex items-center justify-end gap-2">
                        <ThemeSwitcher />

                        <Popover as="div" className="relative">
                            {({ open, close: closePopover }) => (
                                <>
                                    <Popover.Button className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                        <Bell className={isRinging ? 'animate-ring' : ''} />
                                        {unreadCount > 0 && (
                                            <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center ring-2 ring-white">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </Popover.Button>
                                    <Transition as={Fragment} show={open} enter="transition ease-out duration-200" enterFrom="opacity-0 translate-y-1" enterTo="opacity-100 translate-y-0" leave="transition ease-in duration-150" leaveFrom="opacity-100 translate-y-0" leaveTo="opacity-0 translate-y-1">
                                        <Popover.Panel className="absolute right-0 mt-4 w-80 max-w-sm transform z-50 bg-white dark:bg-gray-800 shadow-lg rounded-lg border dark:border-gray-700">
                                            <div className="p-3 flex justify-between items-center border-b dark:border-gray-700">
                                                <h3 className="text-md font-bold text-gray-800 dark:text-white">Notificaciones</h3>
                                                {unreadCount > 0 && (
                                                    <button onClick={async () => { await markAllAsRead(); closePopover(); }} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Marcar leídas</button>
                                                )}
                                            </div>
                                            <div className="overflow-hidden max-h-96 overflow-y-auto">
                                                {(groupedNotifications.new.length === 0 && groupedNotifications.previous.length === 0) ? (
                                                    <p className="text-center text-gray-500 dark:text-gray-400 py-8 text-sm">No hay notificaciones</p>
                                                ) : (
                                                    <div>
                                                        {groupedNotifications.new.length > 0 && (
                                                            <div className="p-2">
                                                                <h4 className="px-3 text-xs font-bold text-gray-400 uppercase">Nuevas</h4>
                                                                {groupedNotifications.new.map(notif => <NotificationItem key={notif.id} notification={notif} />)}
                                                            </div>
                                                        )}
                                                        {groupedNotifications.previous.length > 0 && (
                                                            <div className="p-2 border-t dark:border-gray-700">
                                                                <h4 className="px-3 text-xs font-bold text-gray-400 uppercase">Anteriores</h4>
                                                                {groupedNotifications.previous.map(notif => <NotificationItem key={notif.id} notification={notif} />)}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            {(groupedNotifications.new.length > 0 || groupedNotifications.previous.length > 0) && (
                                                <div className="p-2 border-t bg-gray-50 dark:bg-gray-900/50 dark:border-gray-700">
                                                    <button
                                                        onClick={async () => { await clearAllNotifications(); closePopover(); }}
                                                        className="w-full flex items-center justify-center gap-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 font-semibold p-2 rounded-md transition-colors"
                                                    >
                                                        <Trash2 size={14} />
                                                        Limpiar Todo
                                                    </button>
                                                </div>
                                            )}
                                        </Popover.Panel>
                                    </Transition>
                                </>
                            )}
                        </Popover>

                        {currentUser && (
                            <Menu as="div" className="relative">
                                <Menu.Button className="flex items-center justify-center w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full font-bold text-gray-600 dark:text-gray-300 hover:ring-2 hover:ring-blue-500 transition-all">
                                    {getInitials(currentUser.email)}
                                </Menu.Button>
                                <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                                    <Menu.Items className="absolute right-0 mt-2 w-64 origin-top-right bg-white dark:bg-gray-800 rounded-xl shadow-lg ring-1 ring-black dark:ring-gray-700 ring-opacity-5 focus:outline-none p-2 z-50">
                                        <div className="px-3 py-2 border-b dark:border-gray-700">
                                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate" title={currentUser.email}>
                                                {currentUser.email}
                                            </p>
                                        </div>
                                        <div className="py-1">
                                            <Menu.Item>{({ close }) => (<DropdownLink to="/perfil" icon={<UserCircle size={18} />} onClick={close}>Mi Perfil</DropdownLink>)}</Menu.Item>
                                        </div>
                                        <div className="py-1 border-t dark:border-gray-700">
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <button
                                                        onClick={handleLogout}
                                                        className={`${active ? 'bg-red-50 dark:bg-red-900/50 text-red-700 dark:text-red-300' : 'text-gray-700 dark:text-gray-200'} group flex items-center w-full p-3 text-sm rounded-lg transition-colors duration-200`}
                                                    >
                                                        <LogOut size={18} className="mr-3" />
                                                        Cerrar Sesión
                                                    </button>
                                                )}
                                            </Menu.Item>
                                        </div>
                                    </Menu.Items>
                                </Transition>
                            </Menu>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;