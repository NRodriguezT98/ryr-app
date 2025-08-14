import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogIn, Loader2, Building } from 'lucide-react';
import logo1Light from '../../assets/logo1.png';
import logo2Light from '../../assets/logo2.png';
import logo1Dark from '../../assets/logo1-dark.png';
import logo2Dark from '../../assets/logo2-dark.png';
import { useTheme } from '../../hooks/useTheme';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const { theme } = useTheme();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError('Error al iniciar sesión. Verifica tus credenciales.');
        }
        setLoading(false);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="w-full max-w-4xl m-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg flex border dark:border-gray-700 overflow-hidden">
                {/* Columna Izquierda - Branding */}
                <div className="hidden md:flex flex-col items-center justify-center w-1/2 bg-blue-600 p-12 text-white">
                    <Building size={64} className="mb-4" />
                    <h1 className="text-3xl font-bold mb-2">RyR Construye</h1>
                    <p className="text-center text-blue-200">Gestiona tus proyectos, clientes y finanzas en un solo lugar.</p>
                </div>

                {/* Columna Derecha - Formulario */}
                <div className="w-full md:w-1/2 p-8 md:p-12">
                    <div className="flex justify-center items-center gap-4 mb-6">
                        <img src={theme === 'dark' ? logo1Dark : logo1Light} alt="Logo 1" className="h-10" />
                        <img src={theme === 'dark' ? logo2Dark : logo2Light} alt="Logo 2" className="h-10" />
                    </div>
                    <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100">Iniciar Sesión</h2>
                    <p className="mt-2 text-sm text-center text-gray-500 dark:text-gray-400">Bienvenido de nuevo</p>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Correo Electrónico</label>
                            <input
                                name="email"
                                type="email"
                                required
                                className="mt-1 block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
                                placeholder="tu@correo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Contraseña</label>
                            <input
                                name="password"
                                type="password"
                                required
                                className="mt-1 block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        {error && <p className="text-sm text-red-600 text-center">{error}</p>}

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <LogIn size={20} className="mr-2" />}
                                {loading ? 'Ingresando...' : 'Ingresar'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;