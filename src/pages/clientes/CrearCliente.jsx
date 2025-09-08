import React, { Fragment } from 'react';
import AnimatedPage from '../../components/AnimatedPage';
import FormularioCliente from './FormularioCliente';
import { Home, User, CircleDollarSign, Check, Loader } from 'lucide-react';
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
        { number: 1, title: 'Vivienda', icon: Home },
        { number: 2, title: 'Datos Cliente', icon: User },
        { number: 3, title: 'Finanzas', icon: CircleDollarSign },
    ];

    return (
        <AnimatedPage>
            <div className="max-w-4xl mx-auto">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
                    <h2 className="text-3xl font-extrabold mb-4 text-center text-[#1976d2]">
                        👥 Registrar Nuevo Cliente
                    </h2>
                    <div className="flex items-center justify-center my-8">
                        {STEPS_CONFIG.map((s, index) => (
                            <Fragment key={s.number}>
                                <div className="flex flex-col items-center text-center w-24">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${step >= s.number ? 'bg-blue-500 border-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500'}`}>
                                        {step > s.number ? <Check size={24} /> : <s.icon size={24} />}
                                    </div>
                                    <p className={`mt-2 text-xs font-semibold ${step >= s.number ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'}`}>{s.title}</p>
                                </div>
                                {index < STEPS_CONFIG.length - 1 && (
                                    <div className={`flex-auto border-t-2 transition-all duration-300 mx-4 ${step > s.number ? 'border-blue-500' : 'border-gray-300 dark:border-gray-600'}`}></div>
                                )}
                            </Fragment>
                        ))}
                    </div>
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
                    <div className="mt-10 flex justify-between items-center">
                        <div>
                            {step > 1 && (
                                <Button onClick={handlers.handlePrevStep} variant="secondary" className="w-auto px-6">
                                    Anterior
                                </Button>
                            )}
                        </div>

                        <div>
                            {step < 3 ? (
                                <Button onClick={handlers.handleNextStep} variant="primary" className="w-auto px-6">
                                    Siguiente
                                </Button>
                            ) : (
                                <Button
                                    onClick={handlers.handleSave}
                                    variant="success"
                                    isLoading={isSubmitting}
                                    loadingText="Guardando Cliente..."
                                    className="w-auto px-6"
                                >
                                    Finalizar y Guardar
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
};

export default CrearCliente;