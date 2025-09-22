import { Loader2 } from 'lucide-react';
import Modal from '../../../components/Modal';
import InputField from '../../../components/forms/InputField';
import Button from '../../../components/Button';
import useTransferirVivienda from '../../../hooks/clientes/useTransferirVivienda';
import { toTitleCase } from '../../../utils/textFormatters';
import ViviendaSelector from '../../../components/forms/ViviendaSelector';
// --- INICIO DE LA MODIFICACIÓN ---
import Paso2_NuevoPlanFinanciero from './Paso2_NuevoPlanFinanciero'; // Importamos el componente correcto
// --- FIN DE LA MODIFICACIÓN ---

// El Paso 1 se queda como está, es correcto.
const Step1_Seleccion = ({ hook }) => {
    const {
        viviendaActual,
        nuevaViviendaId,
        setNuevaViviendaId,
        motivo,
        setMotivo,
        errors,
        opcionesViviendaParaSelector,
    } = hook;

    return (
        <div className="space-y-4">
            <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Vivienda Actual</p>
                {viviendaActual ? (
                    <p className="text-gray-600 dark:text-gray-400">
                        {`Mz ${viviendaActual.manzana} - Casa ${viviendaActual.numeroCasa}`}
                    </p>
                ) : (
                    <p className="text-gray-600 dark:text-gray-400">Sin vivienda asignada.</p>
                )}
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

// --- Componente Principal del Modal ---
const TransferirViviendaModal = ({ cliente, isOpen, onClose }) => {
    const hook = useTransferirVivienda(cliente, onClose);
    const {
        step,
        handleNextStep,
        handlePrevStep,
        handleTransfer,
        isSubmitting,
        isLoading,
        resumenNuevoPlan // Necesitamos el resumen para deshabilitar el botón
    } = hook;

    const nombreCompleto = toTitleCase(`${cliente.datosCliente.nombres} ${cliente.datosCliente.apellidos}`);
    const title = `Transferir a ${nombreCompleto} - Paso ${step} de 2`;

    return (
        // --- INICIO DE LA MODIFICACIÓN: Hacemos el tamaño del modal dinámico ---
        <Modal isOpen={isOpen} onClose={onClose} title={title} size={step === 1 ? '2xl' : '5xl'}>
            {/* --- FIN DE LA MODIFICACIÓN --- */}
            {isLoading ? (
                <div className="flex justify-center items-center p-8">
                    <Loader2 className="animate-spin text-blue-500" size={40} />
                </div>
            ) : (
                <div className="p-6">
                    {step === 1 && <Step1_Seleccion hook={hook} />}

                    {/* --- INICIO DE LA MODIFICACIÓN: Renderizamos el componente del plan financiero --- */}
                    {step === 2 && <Paso2_NuevoPlanFinanciero hook={hook} />}
                    {/* --- FIN DE LA MODIFICACIÓN --- */}

                    <div className="flex justify-end space-x-3 pt-6 mt-6 border-t dark:border-gray-700">
                        <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
                            Cancelar
                        </Button>

                        {step > 1 && (
                            <Button variant="secondary" onClick={handlePrevStep} disabled={isSubmitting}>
                                Atrás
                            </Button>
                        )}

                        {step === 1 && (
                            <Button onClick={handleNextStep} disabled={isSubmitting}>
                                Siguiente
                            </Button>
                        )}

                        {step === 2 && (
                            // --- INICIO DE LA MODIFICACIÓN: Envolvemos el botón en un div para el tooltip ---
                            <div
                                data-tooltip-id="app-tooltip"
                                data-tooltip-content={resumenNuevoPlan.diferencia !== 0 ? 'La diferencia debe ser $0 para poder continuar.' : 'Confirmar la transferencia del cliente.'}
                            >
                                <Button
                                    onClick={handleTransfer}
                                    disabled={isSubmitting || resumenNuevoPlan.diferencia !== 0}
                                    isLoading={isSubmitting}
                                >
                                    Confirmar Traslado
                                </Button>
                            </div>
                            // --- FIN DE LA MODIFICACIÓN ---
                        )}
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default TransferirViviendaModal;