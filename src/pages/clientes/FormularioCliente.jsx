import React from 'react';
import Step1_SelectVivienda from './wizard/Step1_SelectVivienda';
import Step2_ClientInfo from './wizard/Step2_ClientInfo';
import Step3_Financial from './wizard/Step3_Financial';

const FormularioCliente = ({ step, formData, dispatch, errors, setErrors, viviendaOptions, proyectos, handleInputChange, handleFinancialFieldChange, handleFileReplace, handleFinancialFileReplace, isEditing = false, isViviendaLocked = false, isFinancialLocked = false, isPersonalInfoLocked = false, isFechaIngresoLocked = false, modo = 'editar', minDateForReactivation, isLoadingViviendas = false, isLoadingProyectos = false }) => {
    const stepsComponents = [
        <Step1_SelectVivienda
            key="step1"
            formData={formData}
            dispatch={dispatch}
            errors={errors}
            setErrors={setErrors}
            options={viviendaOptions}
            isLocked={isViviendaLocked || isPersonalInfoLocked}
            proyectos={proyectos}
            isLoadingViviendas={isLoadingViviendas}
        />,
        <Step2_ClientInfo
            key="step2"
            formData={formData.datosCliente}
            dispatch={dispatch}
            errors={errors}
            handleInputChange={handleInputChange}
            handleFileReplace={handleFileReplace}
            isEditing={isEditing}
            isLocked={isPersonalInfoLocked}
            isFechaIngresoLocked={isFechaIngresoLocked}
            minDateForReactivation={minDateForReactivation}
            modo={modo} // <-- Se añade la prop 'modo' que faltaba
        />,
        <Step3_Financial
            key="step3"
            formData={formData}
            dispatch={dispatch}
            errors={errors}
            handleFinancialFieldChange={handleFinancialFieldChange}
            handleFinancialFileReplace={handleFinancialFileReplace}
            isEditing={isEditing}
            isLocked={isFinancialLocked}
            modo={modo}
        />,
    ];

    return (
        <div className="mt-8">
            {stepsComponents[step - 1]}
        </div>
    );
};

export default FormularioCliente;