import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Tooltip } from "react-tooltip";
import 'react-tooltip/dist/react-tooltip.css';
import ErrorBoundary from "../components/ErrorBoundary";

export default function Layout() {
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <Navbar />
            <main>
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <ErrorBoundary>
                        <Outlet />
                    </ErrorBoundary>
                </div>
            </main>
            <Tooltip
                id="app-tooltip"
                style={{
                    backgroundColor: "#334155",
                    color: "#ffffff",
                    borderRadius: '8px',
                    zIndex: 9999
                }}
            />
        </div>
    );
}