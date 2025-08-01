import React, { Fragment } from "react";
import AnimatedPage from "../../components/AnimatedPage";
import { useCrearVivienda } from "../../hooks/viviendas/useCrearVivienda.jsx";
import { MapPin, FileText, CircleDollarSign, Check, Loader } from 'lucide-react';
import FormularioVivienda from "./FormularioVivienda";

const CrearVivienda = () => {
    const {
        step, isLoading, formData, errors, isSubmitting,
        valorTotalCalculado, gastosNotarialesFijos, handlers
    } = useCrearVivienda();

    const STEPS_CONFIG = [
        { number: 1, title: 'Ubicación y Linderos', icon: MapPin },
        { number: 2, title: 'Info. Legal', icon: FileText },
        { number: 3, title: 'Valor', icon: CircleDollarSign },
    ];

    if (isLoading) return <div className="text-center p-10 animate-pulse">Preparando formulario...</div>;

    return (
        <AnimatedPage>
            <div className="max-w-2xl mx-auto">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
                    <h2 className="text-3xl font-extrabold mb-4 text-center text-[#c62828]">
                        🏠 Registrar Nueva Vivienda
                    </h2>
                    <div className="flex items-center justify-center my-8">
                        {STEPS_CONFIG.map((s, index) => (
                            <Fragment key={s.number}>
                                <div className="flex flex-col items-center">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${step >= s.number ? 'bg-red-500 border-red-500 text-white' : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500'}`}>
                                        {step > s.number ? <Check size={24} /> : <s.icon size={24} />}
                                    </div>
                                    <p className={`mt-2 text-xs font-semibold ${step >= s.number ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}`}>{s.title}</p>
                                </div>
                                {index < STEPS_CONFIG.length - 1 && (
                                    <div className={`flex-auto border-t-2 transition-all duration-300 mx-4 ${step > s.number ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}></div>
                                )}
                            </Fragment>
                        ))}
                    </div>
                    <FormularioVivienda
                        step={step}
                        formData={formData}
                        errors={errors}
                        handleInputChange={handlers.handleInputChange}
                        handleValueChange={handlers.handleValueChange}
                        handleCheckboxChange={handlers.handleCheckboxChange}
                        valorTotalCalculado={valorTotalCalculado}
                        gastosNotarialesFijos={gastosNotarialesFijos}
                    />
                    <div className="mt-10 flex justify-between">
                        {step > 1 ? (
                            <button type="button" onClick={handlers.handlePrevStep} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg transition-colors">Anterior</button>
                        ) : <div />}
                        {step < 3 ? (
                            <button type="button" onClick={handlers.handleNextStep} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition-colors ml-auto">
                                Siguiente
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handlers.handleSubmit}
                                disabled={isSubmitting}
                                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:bg-gray-400 ml-auto flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (<><Loader size={20} className="animate-spin" /><span>Guardando...</span></>) : ("Finalizar y Guardar")}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
};

export default CrearVivienda;