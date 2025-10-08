import React from 'react';
import { Link } from 'react-router-dom';
import { usePermissions } from '../../hooks/auth/usePermissions';
import {
    UserPlus,
    Home,
    Plus,
    Wallet,
    FileText,
    BarChart3,
    Users,
    Building2,
    ArrowRight
} from 'lucide-react';

const QuickActionCard = ({ to, icon, title, description, gradient, disabled = false, onClick }) => {
    const baseClasses = `relative overflow-hidden rounded-2xl p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-xl group ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`;

    const content = (
        <div className={`${baseClasses} bg-gradient-to-br ${gradient}`}>
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                        {React.cloneElement(icon, { size: 24, className: "text-white" })}
                    </div>
                    <ArrowRight className="text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" size={20} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                <p className="text-white/80 text-sm">{description}</p>
            </div>

            {/* Efecto de brillo al hover */}
            <div className="absolute inset-0 bg-white/10 translate-x-full group-hover:translate-x-0 transition-transform duration-700 skew-x-12"></div>
        </div>
    );

    if (disabled) return content;

    return onClick ? (
        <button onClick={onClick} className="block w-full text-left">
            {content}
        </button>
    ) : (
        <Link to={to} className="block">
            {content}
        </Link>
    );
};

const QuickActionsHub = () => {
    const { can } = usePermissions();

    // Definir todas las acciones posibles con sus permisos requeridos
    const actions = [
        {
            id: 'crear-cliente',
            to: '/clientes/crear',
            icon: <UserPlus />,
            title: 'Nuevo Cliente',
            description: 'Registrar un cliente y asignar vivienda',
            gradient: 'from-blue-600 to-blue-700',
            permission: { module: 'clientes', action: 'crear' }
        },
        {
            id: 'crear-vivienda',
            to: '/viviendas/crear',
            icon: <Home />,
            title: 'Nueva Vivienda',
            description: 'Registrar una nueva propiedad',
            gradient: 'from-emerald-600 to-emerald-700',
            permission: { module: 'viviendas', action: 'crear' }
        },
        {
            id: 'gestionar-abonos',
            to: '/abonos/listar',
            icon: <Wallet />,
            title: 'Gestionar Abonos',
            description: 'Ver y administrar pagos',
            gradient: 'from-amber-600 to-amber-700',
            permission: { module: 'abonos', action: 'ver' }
        },
        {
            id: 'ver-clientes',
            to: '/clientes/listar',
            icon: <Users />,
            title: 'Ver Clientes',
            description: 'Lista de todos los clientes',
            gradient: 'from-purple-600 to-purple-700',
            permission: { module: 'clientes', action: 'ver' }
        },
        {
            id: 'ver-viviendas',
            to: '/viviendas/listar',
            icon: <Building2 />,
            title: 'Ver Viviendas',
            description: 'Explorar el inventario',
            gradient: 'from-teal-600 to-teal-700',
            permission: { module: 'viviendas', action: 'ver' }
        },
        {
            id: 'generar-reportes',
            to: '/reportes',
            icon: <FileText />,
            title: 'Reportes',
            description: 'Generar informes y estadísticas',
            gradient: 'from-rose-600 to-rose-700',
            permission: { module: 'reportes', action: 'generar' }
        }
    ];

    // Filtrar acciones basadas en permisos
    const availableActions = actions.filter(action =>
        can(action.permission.module, action.permission.action)
    );

    // Si no hay acciones disponibles, no mostrar el componente
    if (availableActions.length === 0) {
        return null;
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Acciones Rápidas</h2>
                    <p className="text-gray-600 dark:text-gray-400">Acceso directo a las funciones principales</p>
                </div>
                <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
                    <BarChart3 className="text-white" size={24} />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableActions.map((action) => (
                    <QuickActionCard
                        key={action.id}
                        to={action.to}
                        icon={action.icon}
                        title={action.title}
                        description={action.description}
                        gradient={action.gradient}
                    />
                ))}
            </div>

            {/* Mostrar mensaje si hay acciones limitadas */}
            {availableActions.length < actions.length && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border-l-4 border-blue-500">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        💡 Algunas funciones pueden no estar disponibles según tus permisos de usuario
                    </p>
                </div>
            )}
        </div>
    );
};

export default QuickActionsHub;