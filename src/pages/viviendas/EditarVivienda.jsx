import React, { Fragment } from "react";
import { useEditarVivienda } from "../../hooks/viviendas/useEditarVivienda.jsx";
import { MapPin, FileText, CircleDollarSign, Check, Edit, Loader, Lock } from 'lucide-react';
import FormularioVivienda from "./FormularioVivienda";
import Modal from "../../components/Modal";
import ModalConfirmacion from '../../components/ModalConfirmacion.jsx';
import { Tooltip } from 'react-tooltip';

const EditarVivienda = ({ isOpen, onClose, onSave, vivienda, todasLasViviendas }) => {

    const {
        step, formData, errors, isSubmitting, valorTotalCalculado, gastosNotarialesFijos,
        isConfirming, setIsConfirming, cambios, hayCambios, camposFinancierosBloqueados, proyectos,
        isProyectoLocked, handlers
    } = useEditarVivienda(vivienda, todasLasViviendas, isOpen, onSave, onClose);

    const STEPS_CONFIG = [
        { number: 1, title: 'Ubicación y Linderos', icon: MapPin },
        { number: 2, title: 'Info. Legal', icon: FileText },
        { number: 3, title: 'Valor', icon: CircleDollarSign },
    ];

    if (!isOpen) return null;

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title="Editar Vivienda"
                icon={<Edit size={28} className="text-[#c62828]" />}
            >
                {/* --- INICIO DE LA CORRECCIÓN --- */}
                {/* Se usa 'camposFinancierosBloqueados' del hook, no 'vivienda.camposFinancierosBloqueados' */}
                {camposFinancierosBloqueados && (
                    <div className="p-4 mb-6 bg-yellow-50 dark:bg-yellow-900/50 border-l-4 border-yellow-400 text-yellow-700 dark:text-yellow-300">
                        <div className="flex items-center gap-3">
                            <Lock />
                            <p className="font-bold">Los campos financieros están bloqueados porque la vivienda ya está asignada a un cliente.</p>
                        </div>
                    </div>
                )}
                {/* --- FIN DE LA CORRECCIÓN --- */}

                <div className="flex items-center justify-center my-6">
                    {STEPS_CONFIG.map((s, index) => (
                        <Fragment key={s.number}>
                            <div className="flex flex-col items-center">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${step >= s.number ? 'bg-red-500 border-red-500 text-white' : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500'}`}>
                                    {step > s.number ? <Check size={24} /> : <s.icon size={24} />}
                                </div>
                                <p className={`mt-2 text-xs font-semibold ${step >= s.number ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}`}>{s.title}</p>
                            </div>
                            {index < STEPS_CONFIG.length - 1 && (
                                <div className={`flex-auto border-t-2 transition-all duration-300 mx-4 ${step > s.number ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}></div>
                            )}
                        </Fragment>
                    ))}
                </div>

                {formData && (
                    <FormularioVivienda
                        step={step}
                        formData={formData}
                        errors={errors}
                        handleInputChange={handlers.handleInputChange}
                        handleValueChange={handlers.handleValueChange}
                        handleCheckboxChange={handlers.handleCheckboxChange}
                        valorTotalCalculado={valorTotalCalculado}
                        gastosNotarialesFijos={gastosNotarialesFijos}
                        isFinancialLocked={camposFinancierosBloqueados}
                        proyectos={proyectos}
                        isProyectoLocked={isProyectoLocked}
                    />
                )}

                <div className="mt-10 pt-6 border-t dark:border-gray-700 flex justify-between">
                    {step > 1 ? (
                        <button type="button" onClick={handlers.handlePrevStep} className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-bold py-2 px-6 rounded-lg transition-colors">Anterior</button>
                    ) : <div />}

                    {step < 3 ? (
                        <button type="button" onClick={handlers.handleNextStep} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition-colors ml-auto">
                            Siguiente
                        </button>
                    ) : (
                        <span
                            className="ml-auto"
                            data-tooltip-id="app-tooltip"
                            data-tooltip-content={!hayCambios ? "No hay cambios para guardar" : ''}
                        >
                            <button
                                id="guardar-cambios-btn" // 1. Agregamos un ID único al botón
                                type="button"
                                onClick={handlers.handlePreSave}
                                disabled={!hayCambios || isSubmitting}
                                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed w-40 flex items-center justify-center gap-2 ml-auto"
                            >
                                {isSubmitting ? <Loader size={20} className="animate-spin" /> : null}
                                {isSubmitting ? "Guardando..." : "Guardar Cambios"}
                            </button>
                        </span>
                    )}
                </div>
            </Modal>

            {isConfirming && (
                <ModalConfirmacion
                    isOpen={isConfirming}
                    onClose={() => setIsConfirming(false)}
                    onConfirm={handlers.handleSubmit}
                    titulo="Confirmar Cambios de la Vivienda"
                    cambios={cambios}
                    isSubmitting={isSubmitting}
                />
            )}
            <Tooltip
                id="app-tooltip"
                anchorSelect="#guardar-cambios-btn"
                content={!hayCambios ? "No hay cambios para guardar" : ''}
            />
        </>
    );
};

export default EditarVivienda;