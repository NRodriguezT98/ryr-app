// En /components/clientes/components/TransferirViviendaModal.jsx
import React from 'react';
import { Loader2, Home, ArrowRight, ClipboardList, CheckCircle } from 'lucide-react';
import Modal from '../../../components/Modal';
import InputField from '../../../components/forms/InputField';
import Button from '../../../components/Button';
import useTransferirVivienda from '../../../hooks/clientes/useTransferirVivienda';
import { toTitleCase, formatCurrency } from '../../../utils/textFormatters';
import ViviendaSelector from '../../../components/forms/ViviendaSelector';
import Paso2_NuevoPlanFinanciero from './Paso2_NuevoPlanFinanciero';

// --- 2. DEFINIMOS LOS PASOS PARA EL STEPPER ---
const stepsConfig = [
    { name: 'Selección de Vivienda', icon: <Home size={20} /> },
    { name: 'Nuevo Plan Financiero', icon: <ClipboardList size={20} /> },
];

const Stepper = ({ steps, currentStep }) => (
    <nav className="flex items-center justify-center mb-6" aria-label="Progress">
        {steps.map((step, index) => {
            const stepIndex = index + 1;
            const isCompleted = currentStep > stepIndex;
            const isCurrent = currentStep === stepIndex;

            return (
                <React.Fragment key={step.name}>
                    <div className="flex items-center">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                            ${isCompleted ? 'bg-blue-600 text-white' : ''}
                            ${isCurrent ? 'bg-blue-100 dark:bg-blue-900/50 border-2 border-blue-600 text-blue-600' : ''}
                            ${!isCompleted && !isCurrent ? 'bg-gray-100 dark:bg-gray-700 border-2 dark:border-gray-600 text-gray-400 dark:text-gray-500' : ''}
                        `}>
                            {isCompleted ? <CheckCircle size={24} /> : React.cloneElement(step.icon, { size: 20 })}
                        </div>
                        <div className="ml-3 text-left">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Paso {stepIndex}</p>
                            <p className={`text-sm font-semibold ${isCurrent ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>{step.name}</p>
                        </div>
                    </div>
                    {index < steps.length - 1 && (
                        <div className={`flex-auto border-t-2 mx-4
                            ${isCompleted ? 'border-blue-600' : 'border-gray-200 dark:border-gray-600'}`}
                        />
                    )}
                </React.Fragment>
            );
        })}
    </nav>
);

const InfoCard = ({ title, vivienda }) => (
    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border dark:border-gray-600 h-full">
        <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 border-b dark:border-gray-600 pb-2 mb-2">{title}</h4>
        {vivienda ? (
            <div className="space-y-1 text-sm">
                <p className="text-gray-600 dark:text-gray-300">
                    <span className="font-semibold">Ubicación:</span> {`Mz ${vivienda.manzana} - Casa ${vivienda.numeroCasa}`}
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                    <span className="font-semibold">Valor:</span> {formatCurrency(vivienda.valorTotal)}
                </p>
            </div>
        ) : (
            <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500 text-sm">
                <p>No seleccionada</p>
            </div>
        )}
    </div>
);

const Step1_Seleccion = ({ hook }) => {
    const {
        viviendaActual, nuevaViviendaId, setNuevaViviendaId, motivo, setMotivo,
        errors, opcionesViviendaParaSelector, nuevaViviendaSeleccionada
    } = hook;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-4">
                <InfoCard title="Vivienda Actual" vivienda={viviendaActual} />
                <div className="text-center">
                    <ArrowRight size={24} className="text-gray-400 dark:text-gray-500" />
                </div>
                <InfoCard title="Nueva Vivienda" vivienda={nuevaViviendaSeleccionada} />
            </div>
            <ViviendaSelector
                label="Seleccionar Nueva Vivienda"
                options={opcionesViviendaParaSelector}
                value={nuevaViviendaId}
                onChange={(option) => setNuevaViviendaId(option ? option.value : '')}
                error={errors.nuevaViviendaId}
                isRequired
            />
            <InputField
                label="Motivo del Traslado"
                type="textarea"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Especifique la razón de negocio para esta transferencia..."
                error={errors.motivo}
                isRequired
                rows={3}
            />
        </div>
    );
};

const TransferirViviendaModal = ({ cliente, isOpen, onClose }) => {
    const hook = useTransferirVivienda(cliente, onClose);
    const {
        step, handleNextStep, handlePrevStep, handleTransfer,
        isSubmitting, isLoading, resumenNuevoPlan
    } = hook;

    const nombreCompleto = toTitleCase(`${cliente.datosCliente.nombres} ${cliente.datosCliente.apellidos}`);
    const title = `Transferir a ${nombreCompleto}`;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size={step === 1 ? '3xl' : '5xl'}>
            {isLoading ? (
                <div className="flex justify-center items-center p-8"><Loader2 className="animate-spin text-blue-500" size={40} /></div>
            ) : (
                <div className="p-6">
                    <Stepper steps={stepsConfig} currentStep={step} />

                    <div className="mt-6 pt-6 border-t dark:border-gray-600">
                        {step === 1 && <Step1_Seleccion hook={hook} />}
                        {step === 2 && <Paso2_NuevoPlanFinanciero hook={hook} />}
                    </div>

                    <div className="flex justify-end space-x-3 pt-6 mt-6 border-t dark:border-gray-700">
                        <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
                        {step > 1 && (<Button variant="secondary" onClick={handlePrevStep} disabled={isSubmitting}>Atrás</Button>)}
                        {step === 1 && (<Button onClick={handleNextStep} disabled={isSubmitting}>Siguiente</Button>)}
                        {step === 2 && (
                            <div data-tooltip-id="app-tooltip" data-tooltip-content={resumenNuevoPlan.diferencia !== 0 ? 'La diferencia debe ser $0 para poder continuar.' : 'Confirmar la transferencia del cliente.'}>
                                <Button onClick={handleTransfer} disabled={isSubmitting || resumenNuevoPlan.diferencia !== 0} isLoading={isSubmitting}>
                                    Confirmar Traslado
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default TransferirViviendaModal;