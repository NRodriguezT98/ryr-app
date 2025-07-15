import React from 'react';
import Step1_SelectVivienda from './wizard/Step1_SelectVivienda';
import Step2_ClientInfo from './wizard/Step2_ClientInfo';
import Step3_Financial from './wizard/Step3_Financial';

// Este componente ahora solo pasa las props hacia abajo
const FormularioCliente = ({ step, formData, dispatch, errors, handleInputChange, handleValueChange }) => {
    const stepsComponents = [
        <Step1_SelectVivienda key="step1" formData={formData} dispatch={dispatch} />,
        <Step2_ClientInfo
            key="step2"
            datosCliente={formData.datosCliente}
            errors={errors}
            handleInputChange={handleInputChange}
            handleValueChange={handleValueChange}
        />,
        <Step3_Financial key="step3" formData={formData} dispatch={dispatch} errors={errors} />,
    ];
    return <div className="mt-8">{stepsComponents[step - 1]}</div>;
};

export default FormularioCliente;