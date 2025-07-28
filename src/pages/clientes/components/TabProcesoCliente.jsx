import React, { useEffect } from 'react';
import { useProcesoLogic } from '../../../hooks/clientes/useProcesoLogic';
import { updateCliente } from '../../../utils/storage';
import PasoProcesoCard from './PasoProcesoCard';
import { Tooltip } from 'react-tooltip';
import ModalConfirmacion from '../../../components/ModalConfirmacion';
import ModalEditarFechaProceso from './ModalEditarFechaProceso';
import { PartyPopper } from 'lucide-react';
import ClienteEstadoView from './ClienteEstadoView';

const TabProcesoCliente = ({ cliente, renuncia, onDatosRecargados, onHayCambiosChange }) => {

    const isClientInactiveOrPending = cliente.status === 'renunciado' || cliente.status === 'inactivo' || cliente.tieneRenunciaPendiente;

    if (isClientInactiveOrPending) {
        return <ClienteEstadoView cliente={cliente} renuncia={renuncia} contexto="proceso" />;
    }

    const handleSave = async (nuevoProceso) => {
        const clienteActualizado = {
            ...cliente,
            proceso: nuevoProceso
        };
        const { vivienda, ...datosParaGuardar } = clienteActualizado;
        await updateCliente(cliente.id, datosParaGuardar, cliente.viviendaId);
        onDatosRecargados();
    };

    const {
        pasosRenderizables,
        progreso,
        hayPasoEnReapertura,
        pasoAReabrir,
        pasoAEditarFecha,
        justSaved,
        isSaveDisabled,
        tooltipMessage,
        hayCambiosSinGuardar,
        procesoCompletado,
        handlers,
    } = useProcesoLogic(cliente, handleSave);

    useEffect(() => {
        onHayCambiosChange(hayCambiosSinGuardar);
    }, [hayCambiosSinGuardar, onHayCambiosChange]);

    const pasoAReabrirInfo = pasoAReabrir ? pasosRenderizables.find(p => p.key === pasoAReabrir) : null;
    const nombrePasoAReabrir = pasoAReabrirInfo ? `"${pasoAReabrirInfo.label.substring(pasoAReabrirInfo.label.indexOf('.') + 1).trim()}"` : '';

    const porcentajeProgreso = progreso.total > 0 ? (progreso.completados / progreso.total) * 100 : 0;

    return (
        <div className="animate-fade-in space-y-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700 shadow-sm flex justify-between items-center sticky top-20 z-10">
                <h3 className="font-bold text-lg dark:text-gray-200">Línea de Tiempo del Proceso</h3>
                {!procesoCompletado && (
                    <span data-tooltip-id="app-tooltip" data-tooltip-content={tooltipMessage}>
                        <button
                            onClick={handlers.handleSaveChanges}
                            disabled={isSaveDisabled}
                            className="bg-blue-600 text-white font-semibold px-5 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            Guardar Cambios
                        </button>
                    </span>
                )}
            </div>

            {procesoCompletado ? (
                <div className="p-4 bg-green-100 dark:bg-green-900/50 border-2 border-green-300 dark:border-green-700 rounded-xl shadow-md flex items-center gap-4">
                    <PartyPopper size={32} className="text-green-600 dark:text-green-400" />
                    <div>
                        <h4 className="font-bold text-green-800 dark:text-green-300">¡Proceso Completado!</h4>
                        <p className="text-sm text-green-700 dark:text-green-400">Todos los pasos de este cliente se han completado exitosamente.</p>
                    </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700 shadow-sm">
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

            <div className="space-y-4">
                {pasosRenderizables.map((paso, index) => (
                    <PasoProcesoCard
                        key={paso.key}
                        paso={{
                            ...paso,
                            label: `${index + 1}. ${paso.label}`,
                            stepNumber: index + 1,
                            hayPasoEnReapertura
                        }}
                        justSaved={justSaved}
                        onUpdateEvidencia={handlers.handleUpdateEvidencia}
                        onCompletarPaso={handlers.handleCompletarPaso}
                        onIniciarReapertura={handlers.iniciarReapertura}
                        onDeshacerReapertura={handlers.deshacerReapertura}
                        onIniciarEdicionFecha={handlers.iniciarEdicionFecha}
                        clienteId={cliente.id}
                    />
                ))}
            </div>

            <ModalConfirmacion
                isOpen={!!pasoAReabrir}
                onClose={handlers.cancelarReapertura}
                onConfirm={handlers.confirmarReapertura}
                titulo="¿Reabrir este paso?"
                mensaje={`Estás a punto de reabrir el paso ${nombrePasoAReabrir}. Perderás la fecha de completado y deberás volver a validarlo. ¿Estás seguro?`}
            />

            <ModalEditarFechaProceso
                isOpen={!!pasoAEditarFecha}
                onClose={handlers.cancelarEdicionFecha}
                onConfirm={handlers.confirmarEdicionFecha}
                pasoInfo={pasoAEditarFecha ? { ...pasoAEditarFecha, ...pasosRenderizables.find(p => p.key === pasoAEditarFecha.key) } : null}
            />

            <Tooltip id="app-tooltip" />
        </div>
    );
};

export default TabProcesoCliente;