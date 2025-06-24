import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import AnimatedPage from "../../components/AnimatedPage";
import FormularioVivienda from "./FormularioVivienda.jsx";

const CrearVivienda = () => {
    const navigate = useNavigate();
    const [isSuccess, setIsSuccess] = useState(false);

    // Creamos la función que el hijo llamará al tener éxito
    const handleViviendaCreada = useCallback(() => {
        setIsSuccess(true);
    }, []);

    // Este useEffect se encarga del toast y la redirección
    useEffect(() => {
        if (isSuccess) {
            toast.success("Vivienda registrada exitosamente.");
            const timer = setTimeout(() => {
                navigate("/viviendas/listar");
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, [isSuccess, navigate]);

    return (
        <AnimatedPage>
            <div className="bg-white p-8 rounded-xl shadow-md animate-fade-in">
                <h2 className="text-2xl font-bold mb-6 text-center text-[#c62828]">
                    🏠 Crear Nueva Vivienda
                </h2>

                {isSuccess ? (
                    <div className="text-center py-10 transition-all duration-500 ease-in-out">
                        <div className="text-green-500 w-24 h-24 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-800 mt-6">
                            ¡Vivienda Registrada con éxito!
                        </h2>
                        <p className="text-gray-500 mt-2">
                            Serás redirigido a la lista de viviendas en unos segundos...
                        </p>
                    </div>
                ) : (
                    // Le pasamos la función de callback a nuestro formulario
                    <FormularioVivienda onViviendaCreada={handleViviendaCreada} />
                )}
            </div>
        </AnimatedPage>
    );
};

export default CrearVivienda;