import React, { Fragment } from "react";
import AnimatedPage from "../../components/AnimatedPage";
import { useCrearVivienda } from "../../hooks/viviendas/useCrearVivienda.jsx";
import { MapPin, FileText, CircleDollarSign, Check, Loader, Home, Sparkles, Building } from 'lucide-react';
import FormularioVivienda from "./FormularioVivienda";
import Button from "../../components/Button";

const CrearVivienda = () => {
    const {
        step, isLoading, formData, errors, isSubmitting,
        valorTotalCalculado, gastosNotarialesFijos, proyectos, handlers
    } = useCrearVivienda();

    const STEPS_CONFIG = [
        { number: 1, title: 'Ubicación y Linderos', icon: MapPin, description: 'Ubicación y características físicas' },
        { number: 2, title: 'Información Legal', icon: FileText, description: 'Documentos y aspectos legales' },
        { number: 3, title: 'Valorización', icon: CircleDollarSign, description: 'Precio y gastos asociados' },
    ];

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative mb-4 md:mb-6">
                        <Building className="w-12 h-12 md:w-16 md:h-16 text-red-600 animate-pulse mx-auto" />
                        <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-orange-500 absolute -top-1 -right-1 md:-top-2 md:-right-2 animate-bounce" />
                    </div>
                    <h2 className="text-lg md:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                        Preparando Formulario
                    </h2>
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 px-4">
                        Configurando el sistema para registrar la nueva vivienda...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <AnimatedPage>
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
                <div className="max-w-5xl mx-auto">
                    {/* Header optimizado */}
                    <div className="text-center mb-8 md:mb-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl md:rounded-3xl shadow-lg mb-4 md:mb-6">
                            <Home className="w-8 h-8 md:w-10 md:h-10 text-white" />
                        </div>
                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-3 md:mb-4 px-4">
                            Registrar Nueva Vivienda
                        </h1>
                        <p className="text-sm md:text-base lg:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4">
                            Completa la información de la vivienda paso a paso para agregarla al inventario
                        </p>
                    </div>

                    {/* Contenedor principal con diseño mejorado */}
                    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 overflow-hidden">
                        {/* Barra de progreso superior */}
                        <div className="h-2 bg-gray-200 dark:bg-gray-700">
                            <div
                                className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-500 ease-out"
                                style={{ width: `${(step / 3) * 100}%` }}
                            />
                        </div>

                        <div className="p-4 md:p-8 lg:p-12">
                            {/* Indicador de pasos optimizado */}
                            <div className="mb-8 md:mb-12">
                                <div className="flex items-center justify-between relative">
                                    {STEPS_CONFIG.map((s, index) => (
                                        <Fragment key={s.number}>
                                            <div className="flex flex-col items-center text-center relative z-10">
                                                <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500 transform ${step >= s.number
                                                        ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white scale-110 shadow-red-500/25'
                                                        : 'bg-white dark:bg-gray-700 text-gray-400 dark:text-gray-500 shadow-gray-200 dark:shadow-gray-800'
                                                    }`}>
                                                    {step > s.number ? (
                                                        <div className="relative">
                                                            <Check size={20} className="md:w-7 md:h-7 animate-pulse" />
                                                            <Sparkles size={12} className="md:w-4 md:h-4 absolute -top-1 -right-1 text-yellow-300 animate-bounce" />
                                                        </div>
                                                    ) : (
                                                        <s.icon size={20} className="md:w-7 md:h-7" />
                                                    )}
                                                </div>
                                                <div className="mt-2 md:mt-4 max-w-[100px] md:max-w-[140px]">
                                                    <p className={`text-xs md:text-sm font-bold transition-colors duration-300 ${step >= s.number ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
                                                        }`}>
                                                        {s.title}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 hidden md:block">
                                                        {s.description}
                                                    </p>
                                                </div>
                                            </div>
                                            {index < STEPS_CONFIG.length - 1 && (
                                                <div className="flex-1 h-1 mx-4 rounded-full bg-gray-200 dark:bg-gray-600 relative">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-700 ease-out ${step > s.number
                                                                ? 'bg-gradient-to-r from-red-500 to-orange-500 w-full'
                                                                : 'w-0'
                                                            }`}
                                                    />
                                                </div>
                                            )}
                                        </Fragment>
                                    ))}
                                </div>
                            </div>
                            {/* Contenido del formulario optimizado */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl shadow-inner p-4 md:p-8">
                                <FormularioVivienda
                                    step={step}
                                    formData={formData}
                                    errors={errors}
                                    handleInputChange={handlers.handleInputChange}
                                    handleValueChange={handlers.handleValueChange}
                                    handleCheckboxChange={handlers.handleCheckboxChange}
                                    valorTotalCalculado={valorTotalCalculado}
                                    gastosNotarialesFijos={gastosNotarialesFijos}
                                    proyectos={proyectos}
                                />
                            </div>

                            {/* Navegación optimizada */}
                            <div className="p-4 md:p-8 bg-gradient-to-r from-gray-50 to-red-50 dark:from-gray-800 dark:to-gray-700">
                                <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
                                    <div className="flex items-center space-x-3 md:space-x-4 order-2 md:order-1">
                                        {step > 1 && (
                                            <Button
                                                variant="secondary"
                                                onClick={handlers.handlePrevStep}
                                                className="px-4 py-2 md:px-8 md:py-3 rounded-lg md:rounded-xl text-sm md:text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                                            >
                                                ← Anterior
                                            </Button>
                                        )}
                                        <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                                            Paso {step} de {STEPS_CONFIG.length}
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3 md:space-x-4 order-1 md:order-2">
                                        {step < 3 ? (
                                            <Button
                                                variant="danger"
                                                onClick={handlers.handleNextStep}
                                                className="px-6 py-2 md:px-8 md:py-3 rounded-lg md:rounded-xl text-sm md:text-base font-semibold bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-lg hover:shadow-xl transition-all duration-300"
                                            >
                                                Siguiente →
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="success"
                                                onClick={handlers.handleSubmit}
                                                isLoading={isSubmitting}
                                                className="px-6 py-2 md:px-8 md:py-3 rounded-lg md:rounded-xl text-sm md:text-base font-semibold bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 shadow-lg hover:shadow-xl transition-all duration-300"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader className="w-4 h-4 md:w-5 md:h-5 mr-2 animate-spin" />
                                                        <span className="hidden md:inline">Guardando Vivienda...</span>
                                                        <span className="md:hidden">Guardando...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Check className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                                                        <span className="hidden md:inline">Finalizar y Guardar</span>
                                                        <span className="md:hidden">Finalizar</span>
                                                    </>
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
};

export default CrearVivienda;