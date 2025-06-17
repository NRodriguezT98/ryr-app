import React, { createContext, useContext, useState, useCallback } from "react";
import Toast from "./Toast";

const ToastContext = createContext();

export function ToastProvider({ children }) {
    const [toast, setToast] = useState({
        show: false,
        message: "",
        type: "success",
    });

    const showToast = useCallback((message, type = "success") => {
        setToast({ show: true, message, type });
    }, []);

    const hideToast = useCallback(() => {
        setToast((t) => ({ ...t, show: false }));
    }, []);

    // Funciones comodín para tipos comunes
    const success = (msg) => showToast(msg, "success");
    const error = (msg) => showToast(msg, "error");
    const warning = (msg) => showToast(msg, "warning");
    const info = (msg) => showToast(msg, "info");

    return (
        <ToastContext.Provider value={{ showToast, hideToast, success, error, warning, info }}>
            {children}
            <Toast
                show={toast.show}
                message={toast.message}
                type={toast.type}
                onClose={hideToast}
            />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast debe usarse dentro de un ToastProvider");
    }
    return context;
}
