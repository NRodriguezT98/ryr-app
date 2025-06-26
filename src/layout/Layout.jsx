import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Tooltip } from "react-tooltip"; // <-- 1. Importa el componente
import 'react-tooltip/dist/react-tooltip.css'; // <-- 2. Importa los estilos


export default function Layout() {
    return (
        // El fondo gris ahora cubre toda la pantalla
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <main>
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <Outlet />
                </div>
            </main>
            <Tooltip id="discount-tooltip" style={{ backgroundColor: "#334155", color: "#ffffff", borderRadius: '8px' }} />
        </div>
    );
}