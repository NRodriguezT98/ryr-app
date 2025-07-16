import React, { Fragment } from 'react';
import AnimatedPage from '../../components/AnimatedPage';
import FormularioCliente from './FormularioCliente';
import { Home, User, CircleDollarSign, Check, Loader } from 'lucide-react';
import { useCrearCliente } from '../../hooks/clientes/useCrearCliente.jsx'; // <-- RUTA ACTUALIZADA

const CrearCliente = () => {
    const {
        step,
        formData,
        dispatch,
        errors,
        isSubmitting,
        viviendaOptions,
        handleNextStep,
        handlePrevStep,
        handleSave,
        handleInputChange,
        handleValueChange
    } = useCrearCliente();

    const STEPS_CONFIG = [
        { number: 1, title: 'Vivienda', icon: Home },
        { number: 2, title: 'Datos Cliente', icon: User },
        { number: 3, title: 'Finanzas', icon: CircleDollarSign },
    ];

    return (
        <AnimatedPage>
            <div className="max-w-4xl mx-auto">
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                    <h2 className="text-3xl font-extrabold mb-4 text-center text-[#1976d2]">
                        👥 Registrar Nuevo Cliente
                    </h2>
                    <div className="flex items-center justify-center my-8">
                        {STEPS_CONFIG.map((s, index) => (
                            <Fragment key={s.number}>
                                <div className="flex flex-col items-center text-center w-24">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${step >= s.number ? 'bg-blue-500 border-blue-500 text-white' : 'bg-gray-100 border-gray-300 text-gray-400'}`}>
                                        {step > s.number ? <Check size={24} /> : <s.icon size={24} />}
                                    </div>
                                    <p className={`mt-2 text-xs font-semibold ${step >= s.number ? 'text-blue-500' : 'text-gray-400'}`}>{s.title}</p>
                                </div>
                                {index < STEPS_CONFIG.length - 1 && (
                                    <div className={`flex-auto border-t-2 transition-all duration-300 mx-4 ${step > s.number ? 'border-blue-500' : 'border-gray-300'}`}></div>
                                )}
                            </Fragment>
                        ))}
                    </div>
                    <FormularioCliente
                        step={step}
                        formData={formData}
                        dispatch={dispatch}
                        errors={errors}
                        viviendaOptions={viviendaOptions}
                        handleInputChange={handleInputChange}
                        handleValueChange={handleValueChange}
                    />
                    <div className="mt-10 flex justify-between">
                        {step > 1 ? (
                            <button onClick={handlePrevStep} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg transition-colors">
                                Anterior
                            </button>
                        ) : <div />}
                        {step < 3 ? (
                            <button onClick={handleNextStep} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition-colors ml-auto">
                                Siguiente
                            </button>
                        ) : (
                            <button
                                onClick={handleSave}
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

export default CrearCliente;