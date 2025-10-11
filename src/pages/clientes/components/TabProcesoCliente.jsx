// src/pages/clientes/components/TabProcesoCliente.jsx
import React, { useEffect, useState } from 'react';
import { useProcesoLogic } from '../../../hooks/clientes/useProcesoLogic';
import { useAuth } from '../../../context/AuthContext';
import { useModernToast } from '../../../hooks/useModernToast';
import { Tooltip } from 'react-tooltip';
import ModalConfirmacion from '../../../components/ModalConfirmacion';
import ModalEditarFechaProceso from './ModalEditarFechaProceso';
import { PartyPopper, Unlock } from 'lucide-react';
import ClienteEstadoView from './ClienteEstadoView';
import Timeline from './Timeline';
import TimelineSkeleton from './TimelineSkeleton';
import ModalMotivoReapertura from './ModalMotivoReapertura';
import { usePermissions } from '../../../hooks/auth/usePermissions';
import Button from '../../../components/Button';

const TabProcesoCliente = ({ cliente, renuncia, onDatosRecargados, onHayCambiosChange, isReadOnly: isReadOnlyFromStatus }) => {

    const { userData } = useAuth();
    const { can } = usePermissions();
    const toast = useModernToast();
    const isReadOnly = isReadOnlyFromStatus || !can('clientes', 'actualizarPasos');
    const [isLoading, setIsLoading] = useState(true);

    const handleSave = async () => {
        // Recargar datos sin mostrar toast (ya se mostró en useProcesoLogic)
        await onDatosRecargados(false);
        // Mostrar el toast de éxito aquí
        toast.success('Proceso actualizado exitosamente');
    };

    const {
        isSubmitting,
        isLoadingProceso,
        pasosRenderizables,
        progreso,
        hayPasoEnReapertura,
        reaperturaInfo,
        pasoAEditarFecha,
        cierreAAnular,
        justSaved,
        isSaveDisabled,
        tooltipMessage,
        hayCambiosSinGuardar,
        procesoCompletado,
        handlers,
    } = useProcesoLogic(cliente, handleSave, onDatosRecargados);

    const isMotivoModalOpen = !!reaperturaInfo || !!cierreAAnular;
    const motivoModalData = reaperturaInfo || cierreAAnular;

    const handleCloseMotivoModal = () => {
        if (reaperturaInfo) handlers.cancelarReapertura();
        if (cierreAAnular) handlers.cancelarAnulacionCierre();
    };

    const handleConfirmMotivoModal = (motivo) => {
        if (reaperturaInfo) handlers.confirmarReapertura(motivo);
        if (cierreAAnular) handlers.confirmarAnulacionCierre(motivo);
    };

    useEffect(() => {
        onHayCambiosChange(hayCambiosSinGuardar);
    }, [hayCambiosSinGuardar, onHayCambiosChange]);

    useEffect(() => {
        if (pasosRenderizables && pasosRenderizables.length > 0) {
            setIsLoading(false);
        }
    }, [pasosRenderizables]);

    const pasoAReabrirInfo = reaperturaInfo ? pasosRenderizables.find(p => p.key === reaperturaInfo.key) : null;
    const nombrePaso = cierreAAnular ? "Factura de Venta" : (pasoAReabrirInfo ? `"${pasoAReabrirInfo.label.substring(pasoAReabrirInfo.label.indexOf('.') + 1).trim()}"` : '');
    const porcentajeProgreso = progreso.total > 0 ? (progreso.completados / progreso.total) * 100 : 0;

    return (
        <div className="animate-fade-in space-y-4">

            {/* El encabezado sticky se queda como está, sin padding */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700 shadow-sm flex justify-between items-center sticky top-20 z-10">
                <h3 className="font-bold text-lg dark:text-gray-200">Línea de Tiempo del Proceso</h3>
                {hayCambiosSinGuardar && (
                    <span data-tooltip-id="app-tooltip" data-tooltip-content={tooltipMessage}>
                        <Button
                            onClick={handlers.handleSaveChanges}
                            disabled={isSaveDisabled}
                            isLoading={isSubmitting}
                            loadingText="Guardando Cambios..."
                        >
                            Guardar Cambios
                        </Button>
                    </span>
                )}
            </div>

            {/* 👇 INICIO DE LA CORRECCIÓN 👇 */}
            {procesoCompletado && !hayCambiosSinGuardar ? (
                <div className="p-4 bg-green-100 dark:bg-green-900/50 border-2 border-green-300 dark:border-green-700 rounded-xl shadow-md pl-14">
                    <div className="flex items-center gap-4">
                        <PartyPopper size={32} className="text-green-600 dark:text-green-400" />
                        <div>
                            <h4 className="font-bold text-green-800 dark:text-green-300">¡Proceso Completado!</h4>
                            <p className="text-sm text-green-700 dark:text-green-400">Todos los pasos de este cliente se han completado exitosamente.</p>
                        </div>
                    </div>
                    {userData?.role === 'admin' && (
                        <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-800">
                            <Button
                                variant="danger"
                                onClick={handlers.iniciarAnulacionCierre}
                                icon={<Unlock size={14} />}
                                className="w-full md:w-auto"
                                size="sm"
                            >
                                Anular Cierre de Proceso (Admin)
                            </Button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700 shadow-sm pl-14">
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Progreso General</span>
                            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{`${progreso.completados} / ${progreso.total} Pasos`}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                            <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${porcentajeProgreso}%` }}></div>
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-6">
                {isLoadingProceso ? (
                    <TimelineSkeleton />
                ) : (
                    <Timeline
                        pasos={pasosRenderizables}
                        justSaved={justSaved}
                        onUpdateEvidencia={handlers.handleUpdateEvidencia}
                        onCompletarPaso={handlers.handleCompletarPaso}
                        onIniciarReapertura={handlers.iniciarReapertura}
                        onDescartarCambios={handlers.descartarCambiosEnPaso}
                        onIniciarEdicionFecha={handlers.iniciarEdicionFecha}
                        clienteId={cliente.id}
                        isReadOnly={isReadOnly}
                    />
                )}
            </div>

            <ModalMotivoReapertura
                isOpen={isMotivoModalOpen}
                onClose={handleCloseMotivoModal}
                onConfirm={handleConfirmMotivoModal}
                titulo={cierreAAnular ? "Justificar Anulación de Cierre" : "Justificar Reapertura de Paso"}
                nombrePaso={nombrePaso}
            />
            <ModalEditarFechaProceso isOpen={!!pasoAEditarFecha} onClose={handlers.cancelarEdicionFecha} onConfirm={handlers.confirmarEdicionFecha} pasoInfo={pasoAEditarFecha ? { ...pasoAEditarFecha, ...pasosRenderizables.find(p => p.key === pasoAEditarFecha.key) } : null} />
        </div>
    );
};

export default TabProcesoCliente;
