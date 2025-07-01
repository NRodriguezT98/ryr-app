import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Tooltip } from "react-tooltip";
import 'react-tooltip/dist/react-tooltip.css';

export default function Layout() {
    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <main>
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <Outlet />
                </div>
            </main>

            {/* --- TOOLTIP GLOBAL Y ÚNICO --- */}
            {/* Este componente atenderá a todos los tooltips de la aplicación */}
            <Tooltip
                id="app-tooltip"
                style={{ backgroundColor: "#334155", color: "#ffffff", borderRadius: '8px', zIndex: 100 }}
            />
        </div>
    );
}