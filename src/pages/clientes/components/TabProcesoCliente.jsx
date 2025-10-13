// src/pages/clientes/components/TabProcesoCliente.jsx
import React, { useEffect, useState } from 'react';
import { useProcesoLogic } from '../../../hooks/clientes/useProcesoLogic';
import { useAuth } from '../../../context/AuthContext';
import { useModernToast } from '../../../hooks/useModernToast';
import { Tooltip } from 'react-tooltip';
import ModalConfirmacion from '../../../components/ModalConfirmacion';
import ModalEditarFechaProceso from './ModalEditarFechaProceso';
import { PartyPopper, Unlock, History } from 'lucide-react';
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
        <div className="animate-fade-in space-y-6">

            {/* Contenedor unificado: Header + Progreso - Rediseñado completamente */}
            <div className="overflow-hidden bg-gradient-to-br from-white via-gray-50 to-blue-50/30 dark:from-gray-800 dark:via-gray-850 dark:to-blue-900/10 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg sticky top-16 z-20 backdrop-blur-sm">
                {/* Decoración de fondo sutil */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/5 to-indigo-400/5 rounded-full blur-3xl"></div>

                <div className="relative p-4 space-y-3">
                    {/* Header con botón de guardar */}
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                                <History size={20} className="text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">Línea de Tiempo del Proceso</h3>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Seguimiento completo del progreso</p>
                            </div>
                        </div>
                        {hayCambiosSinGuardar && (
                            <span data-tooltip-id="app-tooltip" data-tooltip-content={tooltipMessage}>
                                <Button
                                    onClick={handlers.handleSaveChanges}
                                    disabled={isSaveDisabled}
                                    isLoading={isSubmitting}
                                    loadingText="Guardando..."
                                >
                                    Guardar Cambios
                                </Button>
                            </span>
                        )}
                    </div>

                    {/* Separador sutil */}
                    <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>

                    {/* Sección de progreso */}
                    {procesoCompletado && !hayCambiosSinGuardar ? (
                        // Mensaje de completado integrado
                        <div className="flex items-center gap-5 p-5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-700/50">
                            <div className="flex-shrink-0">
                                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
                                    <PartyPopper size={28} className="text-white" />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-bold text-lg text-green-800 dark:text-green-200">¡Proceso Completado!</h4>
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200">
                                        100%
                                    </span>
                                </div>
                                <p className="text-sm text-green-700 dark:text-green-300">
                                    Todos los pasos se completaron exitosamente
                                </p>
                            </div>
                            {userData?.role === 'admin' && (
                                <Button
                                    variant="danger"
                                    onClick={handlers.iniciarAnulacionCierre}
                                    icon={<Unlock size={16} />}
                                    size="sm"
                                >
                                    Anular Cierre
                                </Button>
                            )}
                        </div>
                    ) : (
                        // Barra de progreso integrada
                        <div className="space-y-3">
                            {/* Stats del progreso */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/30">
                                        <span className="text-white font-bold text-base">{progreso.completados}</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Progreso del Proceso</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">{progreso.completados} de {progreso.total} pasos completados</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent leading-none">
                                        {Math.round(porcentajeProgreso)}%
                                    </div>
                                    {porcentajeProgreso > 0 && porcentajeProgreso < 100 && (
                                        <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
                                            En progreso
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Barra de progreso principal */}
                            <div className="relative w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 rounded-full transition-all duration-700 ease-out relative overflow-hidden"
                                    style={{ width: `${porcentajeProgreso}%` }}
                                >
                                    {/* Efecto shimmer */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                                </div>
                                {/* Marcadores de pasos */}
                                {Array.from({ length: progreso.total }, (_, i) => (
                                    <div
                                        key={i}
                                        className={`absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border-2 transition-all duration-300 ${i < progreso.completados
                                                ? 'bg-emerald-400 border-emerald-500 dark:bg-emerald-500 dark:border-emerald-400 shadow-md'
                                                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                                            }`}
                                        style={{ left: `${((i + 1) / progreso.total) * 100}%`, transform: 'translate(-50%, -50%)' }}
                                    ></div>
                                ))}
                            </div>

                            {/* Estadísticas en badges */}
                            <div className="flex items-center justify-center gap-2.5 pt-1">
                                <div className="flex items-center gap-2 px-2.5 py-1 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700/50 rounded-full">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="text-xs font-semibold text-green-700 dark:text-green-300">
                                        {progreso.completados} Completados
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 px-2.5 py-1 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-full">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                                        {progreso.total - progreso.completados} Pendientes
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Timeline con margen adicional para evitar superposición con sticky header */}
            <div className="mt-8">
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
