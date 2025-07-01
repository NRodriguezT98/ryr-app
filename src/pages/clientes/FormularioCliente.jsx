import React from 'react';
import Step1_SelectVivienda from './wizard/Step1_SelectVivienda';
import Step2_ClientInfo from './wizard/Step2_ClientInfo';
import Step3_Financial from './wizard/Step3_Financial';

// Este componente ahora es un presentador "tonto"
// Muestra el paso correcto del wizard basado en la prop 'step'
const FormularioCliente = ({ step, formData, dispatch, errors }) => {

    // Un array que contiene los componentes de cada paso
    const stepsComponents = [
        <Step1_SelectVivienda key="step1" formData={formData} dispatch={dispatch} />,
        <Step2_ClientInfo key="step2" formData={formData} dispatch={dispatch} errors={errors} />,
        <Step3_Financial key="step3" formData={formData} dispatch={dispatch} errors={errors} />,
    ];

    return (
        <div className="mt-8">
            {/* Renderiza el componente del paso actual */}
            {stepsComponents[step - 1]}
        </div>
    );
};

export default FormularioCliente;