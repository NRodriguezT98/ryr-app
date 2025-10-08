import React, { Fragment } from 'react';
import AnimatedPage from '../../components/AnimatedPage';
import FormularioCliente from './FormularioCliente';
import { Home, User, CircleDollarSign, Check, Loader, Sparkles, UserPlus } from 'lucide-react';
import { useClienteForm } from '../../hooks/clientes/useClienteForm.jsx';
import Button from '../../components/Button';

const CrearCliente = () => {
    const {
        step,
        formData,
        dispatch,
        errors,
        isSubmitting,
        viviendasOptions,
        proyectos,
        handlers,
    } = useClienteForm(false);

    const STEPS_CONFIG = [
        { number: 1, title: 'Seleccionar Vivienda', icon: Home, description: 'Elige la vivienda a asignar' },
        { number: 2, title: 'Información Personal', icon: User, description: 'Datos básicos del cliente' },
        { number: 3, title: 'Plan Financiero', icon: CircleDollarSign, description: 'Configuración de pagos' },
    ];

    return (
        <AnimatedPage>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-4 md:py-6 px-4">
                <div className="max-w-5xl mx-auto">
                    {/* Header compacto */}
                    <div className="text-center mb-4 md:mb-6">
                        <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl md:rounded-2xl shadow-lg mb-2 md:mb-3">
                            <UserPlus className="w-6 h-6 md:w-8 md:h-8 text-white" />
                        </div>
                        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1 md:mb-2">
                            Registrar Nuevo Cliente
                        </h1>
                        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 max-w-xl mx-auto px-4">
                            Configura la información del cliente en 3 sencillos pasos
                        </p>
                    </div>

                    {/* Contenedor principal con diseño mejorado */}
                    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 overflow-hidden">
                        <div className="p-3 md:p-4">
                            {/* Indicador de pasos compacto */}
                            <div className="mb-2 md:mb-3">
                                <div className="flex items-center justify-between relative px-4 md:px-0">
                                    {STEPS_CONFIG.map((s, index) => (
                                        <Fragment key={s.number}>
                                            <div className="flex flex-col items-center text-center relative z-10">
                                                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center shadow-md transition-all duration-500 transform ${step >= s.number
                                                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white scale-105 shadow-blue-500/25'
                                                    : 'bg-white dark:bg-gray-700 text-gray-400 dark:text-gray-500 shadow-gray-200 dark:shadow-gray-800'
                                                    }`}>
                                                    {step > s.number ? (
                                                        <Check size={16} className="md:w-5 md:h-5" />
                                                    ) : (
                                                        <s.icon size={16} className="md:w-5 md:h-5" />
                                                    )}
                                                </div>
                                                <div className="mt-1 md:mt-2 max-w-[90px] md:max-w-[120px]">
                                                    <p className={`text-xs font-semibold transition-colors duration-300 ${step >= s.number ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
                                                        }`}>
                                                        {s.title}
                                                    </p>
                                                </div>
                                            </div>
                                            {index < STEPS_CONFIG.length - 1 && (
                                                <div className="flex-1 h-0.5 md:h-1 mx-2 md:mx-4 rounded-full bg-gray-200 dark:bg-gray-600 relative">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-700 ease-out ${step > s.number
                                                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 w-full'
                                                            : 'w-0'
                                                            }`}
                                                    />
                                                </div>
                                            )}
                                        </Fragment>
                                    ))}
                                </div>
                            </div>
                            {/* Contenido del formulario compacto */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-inner p-3 md:p-4 mt-2">
                                <FormularioCliente
                                    step={step}
                                    formData={formData}
                                    dispatch={dispatch}
                                    errors={errors}
                                    viviendaOptions={viviendasOptions}
                                    proyectos={proyectos}
                                    handleInputChange={handlers.handleInputChange}
                                    handleFinancialFieldChange={handlers.handleFinancialFieldChange}
                                />
                            </div>

                            {/* Navegación compacta */}
                            <div className="p-2 md:p-3 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 mt-2">
                                <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
                                    <div className="flex items-center space-x-3 md:space-x-4 order-2 md:order-1">
                                        {step > 1 && (
                                            <Button
                                                onClick={handlers.handlePrevStep}
                                                variant="secondary"
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
                                                onClick={handlers.handleNextStep}
                                                variant="primary"
                                                className="px-6 py-2 md:px-8 md:py-3 rounded-lg md:rounded-xl text-sm md:text-base font-semibold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all duration-300"
                                            >
                                                Siguiente →
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={handlers.handleSave}
                                                variant="success"
                                                isLoading={isSubmitting}
                                                loadingText="Guardando Cliente..."
                                                className="px-4 py-2 md:px-8 md:py-3 rounded-lg md:rounded-xl text-sm md:text-base font-semibold bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 shadow-lg hover:shadow-xl transition-all duration-300"
                                            >
                                                {isSubmitting ? "Guardando..." : "✓ Guardar Cliente"}
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

export default CrearCliente;