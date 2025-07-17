import React from 'react';
import Step1_SelectVivienda from './wizard/Step1_SelectVivienda';
import Step2_ClientInfo from './wizard/Step2_ClientInfo';
import Step3_Financial from './wizard/Step3_Financial';

const FormularioCliente = ({ step, formData, dispatch, errors, viviendaOptions, handleInputChange }) => {
    const stepsComponents = [
        <Step1_SelectVivienda
            key="step1"
            formData={formData}
            dispatch={dispatch}
            options={viviendaOptions}
        />,
        <Step2_ClientInfo
            key="step2"
            formData={formData.datosCliente}
            dispatch={dispatch}
            errors={errors}
            handleInputChange={handleInputChange} // <-- Lo pasamos al Step 2
        />,
        <Step3_Financial
            key="step3"
            formData={formData}
            dispatch={dispatch}
            errors={errors}
        />,
    ];

    return (
        <div className="mt-8">
            {stepsComponents[step - 1]}
        </div>
    );
};

export default FormularioCliente;