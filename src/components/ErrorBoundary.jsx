import React from 'react';
import { ShieldAlert } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    // Este método de ciclo de vida actualiza el estado para que el siguiente renderizado muestre la UI de respaldo.
    static getDerivedStateFromError(error) {
        return { hasError: true, error: error };
    }

    // Este método de ciclo de vida te permite registrar la información del error.
    componentDidCatch(error, errorInfo) {
        console.error("Error atrapado por el Error Boundary:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // Puedes renderizar cualquier interfaz de respaldo que quieras
            return (
                <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg text-red-800 text-center shadow-md">
                    <ShieldAlert className="mx-auto h-12 w-12 text-red-500" />
                    <h2 className="mt-4 text-xl font-bold">Oops, algo salió mal.</h2>
                    <p className="mt-2 text-sm">
                        Hemos registrado el error. Por favor, intenta recargar la página o contacta a soporte si el problema persiste.
                    </p>
                </div>
            );
        }

        // Si no hay error, renderiza los componentes hijos normalmente.
        return this.props.children;
    }
}

export default ErrorBoundary;