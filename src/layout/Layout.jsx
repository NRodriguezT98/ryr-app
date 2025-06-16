import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Layout() {
    return (
        <>
            <Navbar />
            <main className="pt-24 px-6 transition-opacity duration-300 ease-in-out opacity-100 min-h-screen bg-gray-100">
                <Outlet />
            </main>
        </>
    );
}
