import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Layout() {
    return (
        // El fondo gris ahora cubre toda la pantalla
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <main>
                {/* Este div interno será el contenedor principal para TODAS tus páginas.
                  Se encarga de centrar el contenido, limitar su ancho máximo y darle un 
                  padding consistente.
                */}
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}