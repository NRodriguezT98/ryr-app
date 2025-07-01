import React, { useEffect, useState, useCallback, useMemo, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import AnimatedPage from "../../components/AnimatedPage";
import toast from 'react-hot-toast';
import { useForm } from "../../hooks/useForm.jsx";
import { validateVivienda } from "./viviendaValidation.js";
import { addVivienda, getViviendas } from "../../utils/storage";
import { MapPin, FileText, CircleDollarSign, Check } from 'lucide-react';
import FormularioVivienda from "./FormularioVivienda";

const initialState = {
    manzana: "",
    numero: "",
    matricula: "",
    nomenclatura: "",
    valorBase: "",
    gastosNotariales: "",
    esEsquinera: false,
    recargoEsquinera: "0"
};

const inputFilters = {
    numero: { regex: /^[0-9]*$/ },
    matricula: { regex: /^[0-9-]*$/ },
    nomenclatura: { regex: /^[a-zA-Z0-9\s#-]*$/ }
};

const CrearVivienda = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [todasLasViviendas, setTodasLasViviendas] = useState([]);
    const [step, setStep] = useState(1);

    useEffect(() => {
        const cargarDatosParaValidacion = async () => {
            try {
                const viviendasData = await getViviendas();
                setTodasLasViviendas(viviendasData);
            } catch (error) {
                toast.error("No se pudieron cargar los datos para validación.");
            } finally {
                setIsLoading(false);
            }
        };
        cargarDatosParaValidacion();
    }, []);

    const { formData, errors, setErrors, isSubmitting, handleInputChange, handleValueChange, handleSubmit, setFormData } = useForm({
        initialState,
        validate: (data) => validateVivienda(data, todasLasViviendas, null),
        onSubmit: async (formData) => {
            const valorBaseNum = parseInt(String(formData.valorBase).replace(/\D/g, ''), 10) || 0;
            const gastosNotarialesNum = parseInt(String(formData.gastosNotariales).replace(/\D/g, ''), 10) || 0;
            const recargoEsquineraNum = formData.esEsquinera ? parseInt(formData.recargoEsquinera, 10) || 0 : 0;

            const nuevaVivienda = {
                manzana: formData.manzana,
                numeroCasa: parseInt(formData.numero, 10),
                matricula: formData.matricula.trim(),
                nomenclatura: formData.nomenclatura.trim(),
                valorBase: valorBaseNum,
                gastosNotariales: gastosNotarialesNum,
                recargoEsquinera: recargoEsquineraNum,
                valorTotal: valorBaseNum + gastosNotarialesNum + recargoEsquineraNum,
            };
            try {
                await addVivienda(nuevaVivienda);
                toast.success("¡Vivienda registrada con éxito!");
                navigate("/viviendas/listar");
            } catch (error) {
                toast.error("No se pudo registrar la vivienda.");
                console.error("Error al crear vivienda:", error);
            }
        },
        options: { inputFilters }
    });

    const valorTotalCalculado = useMemo(() => {
        const valorBase = parseInt(String(formData.valorBase).replace(/\D/g, ''), 10) || 0;
        const gastosNotariales = parseInt(String(formData.gastosNotariales).replace(/\D/g, ''), 10) || 0;
        const recargoEsquinera = formData.esEsquinera ? parseInt(formData.recargoEsquinera, 10) || 0 : 0;
        return valorBase + gastosNotariales + recargoEsquinera;
    }, [formData.valorBase, formData.gastosNotariales, formData.recargoEsquinera, formData.esEsquinera]);

    const handleNextStep = () => {
        const allErrors = validateVivienda(formData, todasLasViviendas, null);
        let stepErrors = {};
        if (step === 1) {
            if (allErrors.manzana) stepErrors.manzana = allErrors.manzana;
            if (allErrors.numero) stepErrors.numero = allErrors.numero;
        } else if (step === 2) {
            if (allErrors.matricula) stepErrors.matricula = allErrors.matricula;
            if (allErrors.nomenclatura) stepErrors.nomenclatura = allErrors.nomenclatura;
        }
        setErrors(stepErrors);
        if (Object.keys(stepErrors).length === 0) {
            setStep(s => s + 1);
        } else {
            toast.error("Por favor, completa los campos requeridos.");
        }
    };

    const handlePrevStep = () => setStep(s => s - 1);

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setFormData(prev => {
            const newState = { ...prev, [name]: checked };
            if (name === 'esEsquinera') {
                newState.recargoEsquinera = checked ? "5000000" : "0";
            }
            return newState;
        });
    };

    const STEPS_CONFIG = [
        { number: 1, title: 'Ubicación', icon: MapPin },
        { number: 2, title: 'Info. Legal', icon: FileText },
        { number: 3, title: 'Valor', icon: CircleDollarSign },
    ];

    if (isLoading) return <div className="text-center p-10 animate-pulse">Preparando formulario...</div>;

    return (
        <AnimatedPage>
            <div className="max-w-2xl mx-auto">
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                    <h2 className="text-3xl font-extrabold mb-4 text-center text-[#c62828]">
                        🏠 Registrar Nueva Vivienda
                    </h2>

                    <div className="flex items-center justify-center my-8">
                        {STEPS_CONFIG.map((s, index) => (
                            <Fragment key={s.number}>
                                <div className="flex flex-col items-center">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${step >= s.number ? 'bg-red-500 border-red-500 text-white' : 'bg-gray-100 border-gray-300 text-gray-400'}`}>
                                        {step > s.number ? <Check size={24} /> : <s.icon size={24} />}
                                    </div>
                                    <p className={`mt-2 text-xs font-semibold ${step >= s.number ? 'text-red-500' : 'text-gray-400'}`}>{s.title}</p>
                                </div>
                                {index < STEPS_CONFIG.length - 1 && (
                                    <div className={`flex-auto border-t-2 transition-all duration-300 mx-4 ${step > s.number ? 'border-red-500' : 'border-gray-300'}`}></div>
                                )}
                            </Fragment>
                        ))}
                    </div>

                    {/* La etiqueta <form> ya no está aquí */}
                    <FormularioVivienda
                        step={step}
                        formData={formData}
                        errors={errors}
                        handleInputChange={handleInputChange}
                        handleValueChange={handleValueChange}
                        handleCheckboxChange={handleCheckboxChange}
                        valorTotalCalculado={valorTotalCalculado}
                        handleSubmit={handleSubmit} // Pasamos la función, pero no se usa en un <form>
                    />

                    <div className="mt-10 flex justify-between">
                        {step > 1 ? (
                            <button type="button" onClick={handlePrevStep} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg transition-colors">Anterior</button>
                        ) : <div />}

                        {step < 3 ? (
                            <button type="button" onClick={handleNextStep} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition-colors ml-auto">
                                Siguiente
                            </button>
                        ) : (
                            // Este botón ahora es de tipo 'button' y llama a handleSubmit directamente
                            <button type="button" onClick={handleSubmit} disabled={isSubmitting} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:bg-gray-400 ml-auto">
                                {isSubmitting ? "Guardando..." : "Finalizar y Guardar"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
};

export default CrearVivienda;