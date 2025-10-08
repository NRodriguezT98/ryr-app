import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, Fragment } from "react";
import { Menu, Popover, Transition } from '@headlessui/react';
import logo1Light from "../assets/logo1.png";
import logo2Light from "../assets/logo2.png";
import logo1Dark from "../assets/logo1-dark.png";
import logo2Dark from "../assets/logo2-dark.png";
import { useTheme } from "../hooks/useTheme";
import { useAuth } from "../context/AuthContext";
import { usePermissions } from "../hooks/auth/usePermissions";
import { Bell, Home, Users, Wallet, UserX, ChevronDown, PlusCircle, List, UserPlus, Landmark, History, Trash2, BarChart2, LogOut, UserCircle, ShieldCheck, Layers, FolderKanban } from "lucide-react";
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
            className={`flex items-center w-full p-3 text-sm rounded-xl transition-all duration-300 transform hover:scale-102 ${isActive
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold shadow-md shadow-blue-500/25'
                : 'text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-700 dark:hover:to-gray-600 hover:text-gray-900 dark:hover:text-white hover:shadow-sm'
                }`}
        >
            <div className="transition-transform duration-300 group-hover:scale-110">
                {icon}
            </div>
            <span className="ml-3 font-medium">{children}</span>
        </Link>
    );
};

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { notifications, unreadCount, markAllAsRead, clearAllNotifications, groupedNotifications } = useNotifications();
    const { theme } = useTheme();
    const { currentUser, userData, logout } = useAuth();
    const { can } = usePermissions();

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
        <header className="bg-gradient-to-r from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50 sticky top-0 z-40 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex-shrink-0 mr-8">
                        <Link to="/" className="flex items-center space-x-3 group">
                            <div className="relative">
                                <img src={theme === 'dark' ? logo1Dark : logo1Light} alt="Logo 1" className="h-9 transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-lg" />
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl"></div>
                            </div>
                            <div className="relative">
                                <img src={theme === 'dark' ? logo2Dark : logo2Light} alt="Logo 2" className="h-9 transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-lg" />
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl"></div>
                            </div>
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center justify-center">
                        <nav className="flex items-center space-x-1 bg-gradient-to-r from-white/80 via-gray-50/90 to-white/80 dark:from-gray-800/90 dark:via-gray-900/95 dark:to-gray-800/90 p-2 rounded-2xl backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-lg shadow-gray-200/30 dark:shadow-gray-900/30 mr-8">
                            {/* Menú Viviendas (Visible si puede ver o crear) */}
                            {(can('viviendas', 'ver') || can('viviendas', 'crear')) && (
                                <Menu as="div" className="relative">
                                    <Menu.Button className={`flex items-center gap-2 font-semibold py-2.5 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 ${isActiveLink('/viviendas') ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25 dark:shadow-red-500/20' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-700 dark:hover:to-gray-600 hover:shadow-md'}`}>
                                        <Home size={16} />
                                        <span>Viviendas</span>
                                        <ChevronDown size={16} />
                                    </Menu.Button>
                                    <Transition as={Fragment} enter="transition ease-out duration-200" enterFrom="transform opacity-0 scale-95 translate-y-1" enterTo="transform opacity-100 scale-100 translate-y-0" leave="transition ease-in duration-150" leaveFrom="transform opacity-100 scale-100 translate-y-0" leaveTo="transform opacity-0 scale-95 translate-y-1">
                                        <Menu.Items className="absolute mt-2 w-60 origin-top-left bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl shadow-2xl shadow-gray-200/50 dark:shadow-gray-900/50 ring-1 ring-gray-200/50 dark:ring-gray-700/50 focus:outline-none p-3 z-10 border border-gray-100 dark:border-gray-700">
                                            {can('viviendas', 'crear') && <Menu.Item>{({ close }) => (<DropdownLink to="/viviendas/crear" icon={<PlusCircle size={18} />} onClick={close}>Registrar Vivienda</DropdownLink>)}</Menu.Item>}
                                            {can('viviendas', 'ver') && <Menu.Item>{({ close }) => (<DropdownLink to="/viviendas/listar" icon={<List size={18} />} onClick={close}>Ver Viviendas</DropdownLink>)}</Menu.Item>}
                                        </Menu.Items>
                                    </Transition>
                                </Menu>
                            )}

                            {/* Menú Clientes (Visible si puede ver o crear) */}
                            {(can('clientes', 'ver') || can('clientes', 'crear')) && (
                                <Menu as="div" className="relative">
                                    <Menu.Button className={`flex items-center gap-2 font-semibold py-2.5 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 ${isActiveLink('/clientes') ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 dark:shadow-blue-500/20' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-700 dark:hover:to-gray-600 hover:shadow-md'}`}>
                                        <Users size={16} />
                                        <span>Clientes</span>
                                        <ChevronDown size={16} />
                                    </Menu.Button>
                                    <Transition as={Fragment} enter="transition ease-out duration-200" enterFrom="transform opacity-0 scale-95 translate-y-1" enterTo="transform opacity-100 scale-100 translate-y-0" leave="transition ease-in duration-150" leaveFrom="transform opacity-100 scale-100 translate-y-0" leaveTo="transform opacity-0 scale-95 translate-y-1">
                                        <Menu.Items className="absolute mt-2 w-60 origin-top-left bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl shadow-2xl shadow-gray-200/50 dark:shadow-gray-900/50 ring-1 ring-gray-200/50 dark:ring-gray-700/50 focus:outline-none p-3 z-10 border border-gray-100 dark:border-gray-700">
                                            {can('clientes', 'crear') && <Menu.Item>{({ close }) => (<DropdownLink to="/clientes/crear" icon={<UserPlus size={18} />} onClick={close}>Registrar Cliente</DropdownLink>)}</Menu.Item>}
                                            {can('clientes', 'ver') && <Menu.Item>{({ close }) => (<DropdownLink to="/clientes/listar" icon={<Users size={18} />} onClick={close}>Ver Clientes</DropdownLink>)}</Menu.Item>}
                                        </Menu.Items>
                                    </Transition>
                                </Menu>
                            )}

                            {/* Menú Abonos (Visible si puede ver o crear) */}
                            {(can('abonos', 'ver') || can('abonos', 'crear')) && (
                                <Menu as="div" className="relative">
                                    <Menu.Button className={`flex items-center gap-2 font-semibold py-2.5 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 ${isActiveLink('/abonos') ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/25 dark:shadow-green-500/20' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-700 dark:hover:to-gray-600 hover:shadow-md'}`}>
                                        <Wallet size={16} />
                                        <span>Abonos</span>
                                        <ChevronDown size={16} />
                                    </Menu.Button>
                                    <Transition as={Fragment} enter="transition ease-out duration-200" enterFrom="transform opacity-0 scale-95 translate-y-1" enterTo="transform opacity-100 scale-100 translate-y-0" leave="transition ease-in duration-150" leaveFrom="transform opacity-100 scale-100 translate-y-0" leaveTo="transform opacity-0 scale-95 translate-y-1">
                                        <Menu.Items className="absolute mt-2 w-60 origin-top-left bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl shadow-2xl shadow-gray-200/50 dark:shadow-gray-900/50 ring-1 ring-gray-200/50 dark:ring-gray-700/50 focus:outline-none p-3 z-10 border border-gray-100 dark:border-gray-700">
                                            {can('abonos', 'crear') && <Menu.Item>{({ close }) => (<DropdownLink to="/abonos" icon={<Landmark size={18} />} onClick={close}>Gestionar Pagos</DropdownLink>)}</Menu.Item>}
                                            {can('abonos', 'ver') && <Menu.Item>{({ close }) => (<DropdownLink to="/abonos/listar" icon={<History size={18} />} onClick={close}>Historial de Abonos</DropdownLink>)}</Menu.Item>}
                                        </Menu.Items>
                                    </Transition>
                                </Menu>
                            )}

                            {/* Enlace Renuncias (Visible si puede ver) */}
                            {can('renuncias', 'ver') && (
                                <Link to="/renuncias" className={`flex items-center gap-2 font-semibold py-2.5 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 ${isActiveLink('/renuncias') ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25 dark:shadow-orange-500/20' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-700 dark:hover:to-gray-600 hover:shadow-md'}`}>
                                    <UserX size={16} />
                                    <span>Renuncias</span>
                                </Link>
                            )}

                            {/* Enlace Reportes (Visible si puede generar) */}
                            {can('reportes', 'generar') && (
                                <Link to="/reportes" className={`flex items-center gap-2 font-semibold py-2.5 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 ${isActiveLink('/reportes') ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/25 dark:shadow-purple-500/20' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-700 dark:hover:to-gray-600 hover:shadow-md'}`}>
                                    <BarChart2 size={16} />
                                    <span>Reportes</span>
                                </Link>
                            )}

                            {(can('admin', 'gestionarUsuarios') || can('admin', 'gestionarRoles') || can('admin', 'verAuditoria') || can('admin', 'listarProyectos')) && (
                                <Menu as="div" className="relative">
                                    <Menu.Button className={`flex items-center gap-2 font-semibold py-2.5 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 ${isActiveLink('/admin') ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/25 dark:shadow-indigo-500/20' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-700 dark:hover:to-gray-600 hover:shadow-md'}`}>
                                        <ShieldCheck size={16} />
                                        <span>Admin</span>
                                        <ChevronDown size={16} />
                                    </Menu.Button>
                                    <Transition as={Fragment} enter="transition ease-out duration-200" enterFrom="transform opacity-0 scale-95 translate-y-1" enterTo="transform opacity-100 scale-100 translate-y-0" leave="transition ease-in duration-150" leaveFrom="transform opacity-100 scale-100 translate-y-0" leaveTo="transform opacity-0 scale-95 translate-y-1">
                                        <Menu.Items className="absolute mt-2 w-60 origin-top-left bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl shadow-2xl shadow-gray-200/50 dark:shadow-gray-900/50 ring-1 ring-gray-200/50 dark:ring-gray-700/50 focus:outline-none p-3 z-10 border border-gray-100 dark:border-gray-700">
                                            {can('admin', 'gestionarUsuarios') && <Menu.Item>{({ close }) => (<DropdownLink to="/admin" icon={<Users size={18} />} onClick={close}>Gestionar Usuarios</DropdownLink>)}</Menu.Item>}
                                            {can('admin', 'gestionarRoles') && <Menu.Item>{({ close }) => (<DropdownLink to="/admin/roles" icon={<ShieldCheck size={18} />} onClick={close}>Gestionar Roles</DropdownLink>)}</Menu.Item>}
                                            {can('admin', 'verAuditoria') && <Menu.Item>{({ close }) => (<DropdownLink to="/admin/auditoria" icon={<History size={18} />} onClick={close}>Registro de Auditoría</DropdownLink>)}</Menu.Item>}
                                            {can('admin', 'listarProyectos') && <Menu.Item>{({ close }) => (<DropdownLink to="/admin/proyectos" icon={<FolderKanban size={18} />} onClick={close}>Gestionar Proyectos</DropdownLink>)}</Menu.Item>}
                                        </Menu.Items>
                                    </Transition>
                                </Menu>
                            )}

                        </nav>
                    </div>

                    <div className="flex items-center justify-end gap-3">
                        <div className="p-1 bg-white/80 dark:bg-gray-800/80 rounded-xl backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
                            <ThemeSwitcher />
                        </div>

                        <Popover as="div" className="relative">
                            {({ open, close: closePopover }) => (
                                <>
                                    <Popover.Button className="relative p-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-700 dark:hover:to-gray-600 rounded-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/30 backdrop-blur-md bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
                                        <Bell className={isRinging ? 'animate-ring' : ''} />
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-1 -right-1 block h-6 w-6 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white text-xs flex items-center justify-center ring-2 ring-white dark:ring-gray-800 shadow-lg animate-pulse">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </Popover.Button>
                                    <Transition as={Fragment} show={open} enter="transition ease-out duration-200" enterFrom="opacity-0 translate-y-1" enterTo="opacity-100 translate-y-0" leave="transition ease-in duration-150" leaveFrom="opacity-100 translate-y-0" leaveTo="opacity-0 translate-y-1">
                                        <Popover.Panel className="absolute right-0 mt-4 w-80 max-w-sm transform z-50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md shadow-2xl shadow-gray-200/50 dark:shadow-gray-900/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
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
                                <Menu.Button className="flex items-center justify-center w-11 h-11 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-xl font-bold text-gray-700 dark:text-gray-200 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-800 dark:hover:to-purple-800 hover:text-blue-700 dark:hover:text-blue-300 hover:ring-2 hover:ring-blue-500/30 transition-all duration-300 transform hover:scale-105 shadow-lg border border-gray-300/50 dark:border-gray-600/50">
                                    {getInitials(currentUser.email)}
                                </Menu.Button>
                                <Transition as={Fragment} enter="transition ease-out duration-200" enterFrom="transform opacity-0 scale-95 translate-y-1" enterTo="transform opacity-100 scale-100 translate-y-0" leave="transition ease-in duration-150" leaveFrom="transform opacity-100 scale-100 translate-y-0" leaveTo="transform opacity-0 scale-95 translate-y-1">
                                    <Menu.Items className="absolute right-0 mt-2 w-64 origin-top-right bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl shadow-2xl shadow-gray-200/50 dark:shadow-gray-900/50 ring-1 ring-gray-200/50 dark:ring-gray-700/50 focus:outline-none p-3 z-50 border border-gray-100 dark:border-gray-700">
                                        <div className="px-3 py-2 border-b dark:border-gray-700">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate" title={currentUser.email}>
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