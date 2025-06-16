// src/pages/Home.jsx
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import AnimatedPage from "../components/AnimatedPage";

const Home = () => {
    const [totalViviendas, setTotalViviendas] = useState(0);

    useEffect(() => {
        const data = localStorage.getItem("viviendas");
        if (data) {
            setTotalViviendas(JSON.parse(data).length);
        }
    }, []);

    return (
        <AnimatedPage>
            <div className="min-h-screen pt-28 px-6 bg-gray-50">
                <h1 className="text-3xl font-bold text-center text-[#c62828] mb-2">
                    Bienvenido a RyR Constructora
                </h1>
                <p className="text-center text-gray-600 text-lg mb-10">
                    Plataforma para gestión de viviendas, clientes y procesos financieros
                </p>

                {/* Resumen de datos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-10">
                    <div className="bg-white shadow rounded-2xl p-6 text-center">
                        <h3 className="text-2xl font-semibold text-[#c62828]">🏠 {totalViviendas}</h3>
                        <p className="text-gray-600 mt-1">Viviendas Registradas</p>
                    </div>

                    <div className="bg-white shadow rounded-2xl p-6 text-center opacity-60">
                        <h3 className="text-2xl font-semibold text-gray-500">🧍 0</h3>
                        <p className="text-gray-400 mt-1">Clientes Registrados</p>
                        <p className="text-xs mt-2 text-gray-400 italic">Módulo en desarrollo</p>
                    </div>

                    <div className="bg-white shadow rounded-2xl p-6 text-center opacity-60">
                        <h3 className="text-2xl font-semibold text-gray-500">📄 -</h3>
                        <p className="text-gray-400 mt-1">Contratos / Finanzas</p>
                        <p className="text-xs mt-2 text-gray-400 italic">Módulo en desarrollo</p>
                    </div>
                </div>

                {/* Accesos rápidos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    <Link
                        to="/viviendas"
                        className="bg-white rounded-xl p-6 shadow hover:shadow-xl transition-transform hover:-translate-y-1"
                    >
                        <h3 className="text-xl font-bold text-[#c62828] mb-2">➕ Crear Vivienda</h3>
                        <p className="text-sm text-gray-600">Registrar una nueva propiedad en el sistema</p>
                    </Link>

                    <Link
                        to="/viviendas/listar"
                        className="bg-white rounded-xl p-6 shadow hover:shadow-xl transition-transform hover:-translate-y-1"
                    >
                        <h3 className="text-xl font-bold text-[#c62828] mb-2">📋 Ver Viviendas</h3>
                        <p className="text-sm text-gray-600">Consultar, editar o eliminar viviendas existentes</p>
                    </Link>
                </div>

                {/* Footer */}
                <div className="text-center mt-16 text-sm text-gray-400">
                    © {new Date().getFullYear()} RyR Constructora — Todos los derechos reservados
                </div>
            </div>
        </AnimatedPage>
    );
};

export default Home;
