import React, { Fragment } from 'react';
import { Tooltip } from 'react-tooltip';
import { useEditarCliente } from '../../hooks/clientes/useEditarCliente';
import Modal from '../../components/Modal';
import ModalConfirmacion from '../../components/ModalConfirmacion';
import FormularioCliente from './FormularioCliente';
import { Home, User, CircleDollarSign, Check, UserCog, Loader } from 'lucide-react';

const EditarCliente = ({ isOpen, onClose, onGuardar, clienteAEditar }) => {

    const {
        step,
        formData,
        dispatch,
        errors,
        isConfirming,
        setIsConfirming, // Obtenemos la función directamente
        isSubmitting,
        cambios,
        hayCambios,
        viviendaOptions,
        handlers,
    } = useEditarCliente(clienteAEditar, isOpen, onGuardar, onClose);

    const STEPS_CONFIG = [
        { number: 1, title: 'Vivienda', icon: Home },
        { number: 2, title: 'Datos Cliente', icon: User },
        { number: 3, title: 'Finanzas', icon: CircleDollarSign },
    ];

    if (!isOpen) return null;

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title="Editar Cliente" icon={<UserCog size={32} className="text-[#1976d2]" />}>
                {!formData ? (
                    <div className="text-center py-10 text-gray-500 animate-pulse">Cargando datos...</div>
                ) : (
                    <>
                        <div className="flex items-center justify-center my-8">
                            {STEPS_CONFIG.map((s, index) => (
                                <Fragment key={s.number}>
                                    <div className="flex flex-col items-center text-center w-24">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${step >= s.number ? 'bg-blue-500 border-blue-500 text-white' : 'bg-gray-100 border-gray-300 text-gray-400'}`}>
                                            {step > s.number ? <Check size={24} /> : <s.icon size={24} />}
                                        </div>
                                        <p className={`mt-2 text-xs font-semibold ${step >= s.number ? 'text-blue-500' : 'text-gray-400'}`}>{s.title}</p>
                                    </div>
                                    {index < STEPS_CONFIG.length - 1 && (<div className={`flex-auto border-t-2 transition-all duration-300 mx-4 ${step > s.number ? 'border-blue-500' : 'border-gray-300'}`}></div>)}
                                </Fragment>
                            ))}
                        </div>
                        <div className="mt-8 min-h-[350px]">
                            <FormularioCliente
                                step={step}
                                formData={formData}
                                dispatch={dispatch}
                                errors={errors}
                                viviendaOptions={viviendaOptions}
                                isEditing={true}
                                clienteAEditar={clienteAEditar}
                            />
                        </div>
                        <div className="mt-10 pt-6 border-t flex justify-between">
                            {step > 1 ? (<button type="button" onClick={handlers.handlePrevStep} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg transition-colors">Anterior</button>) : <div />}
                            {step < 3 ? (
                                <button type="button" onClick={handlers.handleNextStep} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition-colors ml-auto">Siguiente</button>
                            ) : (
                                <span className="ml-auto" data-tooltip-id="app-tooltip" data-tooltip-content={!hayCambios ? "No hay cambios para guardar" : ''}>
                                    <button onClick={handlers.handlePreSave} disabled={!hayCambios || isSubmitting} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed w-full flex items-center justify-center gap-2">
                                        {isSubmitting ? <Loader size={20} className="animate-spin" /> : null}
                                        {isSubmitting ? "Guardando..." : "Guardar Cambios"}
                                    </button>
                                </span>
                            )}
                        </div>
                    </>
                )}
            </Modal>

            <ModalConfirmacion
                isOpen={isConfirming}
                onClose={() => setIsConfirming(false)} // <-- LLAMADA CORREGIDA
                onConfirm={handlers.executeSave}
                titulo="Confirmar Cambios del Cliente"
                mensaje="¿Estás seguro de que deseas guardar estos cambios?"
                cambios={cambios}
                isSubmitting={isSubmitting}
            />

            <Tooltip id="app-tooltip" />
        </>
    );
};

export default EditarCliente;