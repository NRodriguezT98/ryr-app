import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import AnimatedPage from '../../components/AnimatedPage';

const UnauthorizedPage = () => {
    return (
        <AnimatedPage>
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center">
                <ShieldAlert size={64} className="text-red-500 mb-4" />
                <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">Acceso Denegado</h1>
                <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                    No tienes los permisos necesarios para ver esta página.
                </p>
                <p className="mt-1 text-gray-500 dark:text-gray-500">
                    Si crees que esto es un error, por favor, contacta al administrador del sistema.
                </p>
                <Link to="/" className="mt-6 bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-lg shadow-sm hover:bg-blue-700 transition-colors">
                    Volver al Dashboard
                </Link>
            </div>
        </AnimatedPage>
    );
};

export default UnauthorizedPage;