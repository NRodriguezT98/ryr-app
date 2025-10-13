// src/pages/clientes/components/TransferirViviendaModal.jsx
// Modal moderna para transferir clientes entre viviendas

import React from 'react';
import { Loader2, Home, ArrowRight, ClipboardList, CheckCircle, AlertTriangle, Building2, ArrowRightLeft } from 'lucide-react';
import { FormModal } from '../../../components/modals';
import InputField from '../../../components/forms/InputField';
import Button from '../../../components/Button';
import useTransferirVivienda from '../../../hooks/clientes/useTransferirVivienda';
import { toTitleCase, formatCurrency } from '../../../utils/textFormatters';
import ViviendaSelector from '../../../components/forms/ViviendaSelector';
import Paso2_NuevoPlanFinanciero from './Paso2_NuevoPlanFinanciero';

// --- STEPPER MODERNO ---
const stepsConfig = [
    { name: 'Selección de Vivienda', icon: <Home size={20} /> },
    { name: 'Nuevo Plan Financiero', icon: <ClipboardList size={20} /> },
];

const Stepper = ({ steps, currentStep }) => (
    <nav className="flex items-center justify-center mb-8" aria-label="Progress">
        {steps.map((step, index) => {
            const stepIndex = index + 1;
            const isCompleted = currentStep > stepIndex;
            const isCurrent = currentStep === stepIndex;

            return (
                <React.Fragment key={step.name}>
                    <div className="flex items-center">
                        <div className={`relative flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300
                            ${isCompleted ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30' : ''}
                            ${isCurrent ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 ring-4 ring-blue-100 dark:ring-blue-900/50' : ''}
                            ${!isCompleted && !isCurrent ? 'bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500' : ''}
                        `}>
                            {isCompleted ? (
                                <CheckCircle size={24} className="animate-[fadeIn_0.3s_ease-in]" />
                            ) : (
                                React.cloneElement(step.icon, { size: 22 })
                            )}
                        </div>
                        <div className="ml-3 text-left">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Paso {stepIndex}</p>
                            <p className={`text-sm font-bold transition-colors ${isCurrent ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>
                                {step.name}
                            </p>
                        </div>
                    </div>
                    {index < steps.length - 1 && (
                        <div className={`flex-auto h-1 mx-4 rounded-full transition-all duration-300 ${isCompleted
                                ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                                : 'bg-gray-200 dark:bg-gray-700'
                            }`} />
                    )}
                </React.Fragment>
            );
        })}
    </nav>
);

// --- INFO CARD MODERNIZADA ---
const InfoCard = ({ title, vivienda, isNew = false }) => (
    <div className={`relative overflow-hidden p-5 rounded-xl border-2 h-full transition-all duration-300 ${isNew
            ? 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-300 dark:border-blue-700 shadow-lg shadow-blue-100 dark:shadow-blue-900/20'
            : 'bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-800 dark:to-gray-850 border-gray-300 dark:border-gray-600'
        }`}>
        {/* Decoración de fondo */}
        <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-20 ${isNew ? 'bg-blue-400' : 'bg-gray-400'
            }`}></div>

        <div className="relative">
            <div className="flex items-center gap-2 mb-3">
                <div className={`p-2 rounded-lg ${isNew
                        ? 'bg-blue-100 dark:bg-blue-900/50'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}>
                    <Building2 size={18} className={isNew ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'} />
                </div>
                <h4 className={`text-sm font-bold ${isNew
                        ? 'text-blue-800 dark:text-blue-200'
                        : 'text-gray-800 dark:text-gray-200'
                    }`}>
                    {title}
                </h4>
            </div>

            {vivienda ? (
                <div className="space-y-2 text-sm">
                    <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-gray-600 dark:text-gray-400">Ubicación:</span>
                        <span className="font-medium text-gray-800 dark:text-gray-200">
                            Mz {vivienda.manzana} - Casa {vivienda.numeroCasa}
                        </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-gray-600 dark:text-gray-400">Valor:</span>
                        <span className={`font-bold ${isNew
                                ? 'text-blue-700 dark:text-blue-300'
                                : 'text-gray-800 dark:text-gray-200'
                            }`}>
                            {formatCurrency(vivienda.valorTotal)}
                        </span>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-20 text-gray-400 dark:text-gray-500">
                    <Building2 size={32} className="mb-2 opacity-30" />
                    <p className="text-xs font-medium">No seleccionada</p>
                </div>
            )}
        </div>
    </div>
);

// --- PASO 1: SELECCIÓN ---
const Step1_Seleccion = ({ hook }) => {
    const {
        viviendaActual, nuevaViviendaId, setNuevaViviendaId, motivo, setMotivo,
        errors, opcionesViviendaParaSelector, nuevaViviendaSeleccionada
    } = hook;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Banner informativo */}
            <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-l-4 border-orange-400 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                <div>
                    <h4 className="font-semibold text-orange-800 dark:text-orange-300">Acción Importante</h4>
                    <p className="text-sm text-orange-700 dark:text-orange-400 mt-1">
                        Esta acción transferirá al cliente a una nueva vivienda y reseteará su proceso.
                        Todos los abonos activos se sincronizarán con la nueva ubicación.
                    </p>
                </div>
            </div>

            {/* Comparación de viviendas */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-stretch gap-4">
                <InfoCard title="Vivienda Actual" vivienda={viviendaActual} isNew={false} />
                <div className="flex items-center justify-center">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-lg">
                        <ArrowRightLeft size={24} className="text-white" />
                    </div>
                </div>
                <InfoCard title="Nueva Vivienda" vivienda={nuevaViviendaSeleccionada} isNew={true} />
            </div>

            {/* Selector de vivienda */}
            <ViviendaSelector
                label="Seleccionar Nueva Vivienda"
                options={opcionesViviendaParaSelector}
                value={nuevaViviendaId}
                onChange={(option) => setNuevaViviendaId(option ? option.value : '')}
                error={errors.nuevaViviendaId}
                isRequired
            />

            {/* Motivo */}
            <InputField
                label="Motivo del Traslado"
                type="textarea"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Especifique la razón de negocio para esta transferencia (ej: Cliente solicitó cambio por mejor ubicación, corrección administrativa, etc.)"
                error={errors.motivo}
                isRequired
                rows={4}
            />
        </div>
    );
};

// --- COMPONENTE PRINCIPAL ---
const TransferirViviendaModal = ({ cliente, isOpen, onClose }) => {
    const hook = useTransferirVivienda(cliente, onClose);
    const {
        step, handleNextStep, handlePrevStep, handleTransfer,
        isSubmitting, isLoading, resumenNuevoPlan, nuevaViviendaId, motivo,
        nuevoPlanFinanciero
    } = hook;

    const nombreCompleto = toTitleCase(`${cliente.datosCliente.nombres} ${cliente.datosCliente.apellidos}`);

    // Detectar si hay cambios en el formulario
    const isDirty = step === 1
        ? Boolean(nuevaViviendaId || motivo.trim())
        : Object.values(nuevoPlanFinanciero).some(val =>
            typeof val === 'boolean' ? val : (val?.monto > 0 || val?.banco || val?.caja)
        );

    // Icono del header según el paso
    const headerIcon = step === 1 ? (
        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
            <ArrowRightLeft size={24} className="text-white" />
        </div>
    ) : (
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <ClipboardList size={24} className="text-white" />
        </div>
    );

    // Renderizado según paso
    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center p-12">
                    <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Cargando información...</p>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                <Stepper steps={stepsConfig} currentStep={step} />
                <div className="pt-4">
                    {step === 1 && <Step1_Seleccion hook={hook} />}
                    {step === 2 && <Paso2_NuevoPlanFinanciero hook={hook} />}
                </div>
            </div>
        );
    };

    // Footer según paso
    const renderFooter = () => {
        if (isLoading) return null;

        return (
            <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                    {step === 2 && (
                        <Button
                            variant="secondary"
                            onClick={handlePrevStep}
                            disabled={isSubmitting}
                            icon={<ArrowRight size={16} className="rotate-180" />}
                        >
                            Atrás
                        </Button>
                    )}
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="secondary"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </Button>
                    {step === 1 ? (
                        <Button
                            onClick={handleNextStep}
                            disabled={isSubmitting}
                            icon={<ArrowRight size={16} />}
                        >
                            Siguiente
                        </Button>
                    ) : (
                        <Button
                            onClick={handleTransfer}
                            disabled={isSubmitting || resumenNuevoPlan.diferencia !== 0}
                            isLoading={isSubmitting}
                            variant={resumenNuevoPlan.diferencia === 0 ? 'primary' : 'secondary'}
                            data-tooltip-id="app-tooltip"
                            data-tooltip-content={
                                resumenNuevoPlan.diferencia !== 0
                                    ? 'La diferencia debe ser $0 para poder continuar.'
                                    : 'Confirmar la transferencia del cliente.'
                            }
                        >
                            {isSubmitting ? 'Transfiriendo...' : 'Confirmar Traslado'}
                        </Button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <FormModal
            isOpen={isOpen}
            onClose={onClose}
            title={`Transferir a ${nombreCompleto}`}
            icon={headerIcon}
            size={step === 1 ? '3xl' : '5xl'}
            variant="warning"
            isDirty={isDirty}
            footer={renderFooter()}
            maxHeight="max-h-[calc(100vh-8rem)]"
        >
            {renderContent()}
        </FormModal>
    );
};

export default TransferirViviendaModal;