// src/pages/clientes/EditarCliente.jsx (CÓDIGO FINAL Y VERIFICADO)
import React, { Fragment } from 'react';
import { Tooltip } from 'react-tooltip';
import { useClienteForm } from '../../hooks/clientes/useClienteForm';
import Modal from '../../components/Modal';
import ModalConfirmacion from '../../components/ModalConfirmacion';
import FormularioCliente from './FormularioCliente';
import { Home, User, CircleDollarSign, Check, UserCog } from 'lucide-react';
import Button from '../../components/Button'; // Asegúrate de que esta importación exista

const EditarCliente = ({ isOpen, onClose, onGuardar, clienteAEditar, modo }) => {

    const {
        step,
        formData,
        dispatch,
        errors,
        isConfirming,
        setIsConfirming,
        isSubmitting,
        cambios,
        hayCambios,
        viviendasOptions,
        proyectos,
        isFechaIngresoLocked,
        handlers,
        escrituraFirmada
    } = useClienteForm(true, clienteAEditar, onGuardar, modo);

    const STEPS_CONFIG = [
        { number: 1, title: 'Vivienda', icon: Home },
        { number: 2, title: 'Datos Cliente', icon: User },
        { number: 3, title: 'Finanzas', icon: CircleDollarSign },
    ];

    if (!isOpen) return null;

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title={modo === 'reactivar' ? "Iniciar Nuevo Proceso para Cliente" : "Editar Cliente"}
                icon={<UserCog size={32} className="text-[#1976d2]" />}
                size="5xl"
            >
                {!formData.datosCliente.nombres ? (
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
                                viviendaOptions={viviendasOptions}
                                proyectos={proyectos}
                                isEditing={true}
                                isFinancialLocked={modo === 'editar' && escrituraFirmada}
                                isPersonalInfoLocked={modo === 'editar' && escrituraFirmada}
                                isFechaIngresoLocked={isFechaIngresoLocked}
                                modo={modo}
                                clienteAEditar={clienteAEditar}
                                handleInputChange={handlers.handleInputChange}
                                handleFinancialFieldChange={handlers.handleFinancialFieldChange}
                            />
                        </div>

                        {/* --- INICIO DEL CÓDIGO CORREGIDO --- */}
                        <div className="mt-10 pt-6 border-t flex justify-between">
                            <div>
                                {step > 1 && (
                                    <Button variant="secondary" onClick={handlers.handlePrevStep} className="w-auto px-6">
                                        Anterior
                                    </Button>
                                )}
                            </div>
                            <div>
                                {step < 3 ? (
                                    <Button variant="primary" onClick={handlers.handleNextStep} className="w-auto px-6">
                                        Siguiente
                                    </Button>
                                ) : (
                                    <span data-tooltip-id="app-tooltip" data-tooltip-content={!hayCambios ? "No hay cambios para guardar" : ''}>
                                        <Button
                                            variant="success"
                                            onClick={handlers.handleSave}
                                            disabled={!hayCambios}
                                            isLoading={isSubmitting}
                                            loadingText="Guardando..."
                                            className="w-auto px-6"
                                        >
                                            Guardar Cambios
                                        </Button>
                                    </span>
                                )}
                            </div>
                        </div>
                        {/* --- FIN DEL CÓDIGO CORREGIDO --- */}
                    </>
                )}
            </Modal>

            <ModalConfirmacion
                isOpen={isConfirming}
                onClose={() => setIsConfirming(false)}
                onConfirm={handlers.executeSave}
                titulo="Confirmar Cambios del Cliente"
                cambios={cambios}
                isSubmitting={isSubmitting}
            />

            <Tooltip id="app-tooltip" />
        </>
    );
};

export default EditarCliente;