import { useEffect } from "react";

const ICONS = {
    success: "✅",
    error: "❌",
    warning: "⚠️",
    info: "ℹ️",
};

const COLORS = {
    success: "bg-green-600 text-white",
    error: "bg-red-600 text-white",
    warning: "bg-yellow-500 text-white",
    info: "bg-blue-500 text-white",
};

export default function Toast({ show, type = "success", message, onClose, duration = 2500 }) {
    useEffect(() => {
        if (!show) return;
        const timer = setTimeout(() => {
            onClose?.();
        }, duration);
        return () => clearTimeout(timer);
    }, [show, duration, onClose]);

    if (!show) return null;

    return (
        <div
            className={`fixed top-6 right-6 z-[9999] rounded-xl px-5 py-3 shadow-xl flex items-center gap-3 min-w-[230px] text-base font-medium transition-all animate-fade-in ${COLORS[type]}`}
        >
            <span className="text-2xl">{ICONS[type] || ICONS.info}</span>
            <span>{message}</span>
            <button
                onClick={onClose}
                className="ml-2 text-xl text-white hover:text-gray-200 focus:outline-none"
                aria-label="Cerrar notificación"
            >
                ×
            </button>
        </div>
    );
}
