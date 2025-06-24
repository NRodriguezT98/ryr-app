import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import AnimatedPage from "../../components/AnimatedPage";
import FormularioCliente from "./FormularioCliente.jsx";

const CrearCliente = () => {
    const navigate = useNavigate();
    const [isSuccess, setIsSuccess] = useState(false);

    // Esta función se la pasaremos como prop al formulario hijo.
    // El hijo la llamará cuando termine de guardar exitosamente.
    const handleClienteCreado = useCallback(() => {
        setIsSuccess(true);
    }, []);

    // Este useEffect escucha los cambios en `isSuccess` para manejar
    // los efectos secundarios (toast y redirección).
    useEffect(() => {
        if (isSuccess) {
            toast.success("Cliente registrado exitosamente.");
            const timer = setTimeout(() => {
                navigate("/clientes/listar");
            }, 2500); // Damos 2.5 segundos para que el usuario vea el mensaje

            return () => clearTimeout(timer);
        }
    }, [isSuccess, navigate]);

    return (
        <AnimatedPage>
            <div className="bg-white p-8 rounded-xl shadow-md animate-fade-in">
                <h2 className="text-2xl font-bold mb-6 text-center text-[#1976d2]">
                    🧍 Crear Cliente
                </h2>

                {isSuccess ? (
                    // La vista de Éxito
                    <div className="text-center py-10 transition-all duration-500 ease-in-out">
                        <div className="text-green-500 w-24 h-24 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-800 mt-6">
                            ¡Cliente Registrado con éxito!
                        </h2>
                        <p className="text-gray-500 mt-2">
                            Serás redirigido a la lista de clientes en unos segundos...
                        </p>
                    </div>
                ) : (
                    // La vista del Formulario
                    <FormularioCliente onClienteCreado={handleClienteCreado} />
                )}
            </div>
        </AnimatedPage>
    );
};

export default CrearCliente;