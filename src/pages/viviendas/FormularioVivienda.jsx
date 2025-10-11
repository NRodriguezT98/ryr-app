import React, { memo } from 'react';
import Step1_Ubicacion from './wizard/Step1_Ubicacion.jsx';
import Step2_InfoLegal from './wizard/Step2_InfoLegal.jsx';
import Step3_Valor from './wizard/Step3_Valor.jsx';

/**
 * Componente presentador "tonto" que muestra el paso correcto del wizard
 * 🔥 OPTIMIZADO: Memoizado para evitar rerenders innecesarios
 */
const FormularioVivienda = ({ step, formData, errors, handleInputChange, handleValueChange, handleCheckboxChange, valorTotalCalculado, gastosNotarialesFijos, isFinancialLocked, proyectos, isProyectoLocked }) => {

    // Array que contiene los componentes de cada paso para renderizar dinámicamente
    const stepsComponents = [
        <Step1_Ubicacion
            key="step1"
            formData={formData}
            errors={errors}
            handleInputChange={handleInputChange}
            proyectos={proyectos}
            isProyectoLocked={isProyectoLocked}
        />,
        <Step2_InfoLegal
            key="step2"
            formData={formData}
            errors={errors}
            handleInputChange={handleInputChange}
            handleValueChange={handleValueChange}
        />,
        <Step3_Valor
            key="step3"
            formData={formData}
            errors={errors}
            handleInputChange={handleInputChange}
            handleValueChange={handleValueChange}
            handleCheckboxChange={handleCheckboxChange}
            valorTotalCalculado={valorTotalCalculado}
            gastosNotarialesFijos={gastosNotarialesFijos}
            isFinancialLocked={isFinancialLocked}
        />,
    ];

    return (
        <div className="mt-8">
            {stepsComponents[step - 1]}
        </div>
    );
};

export default memo(FormularioVivienda);