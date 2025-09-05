// src/pages/clientes/components/TabProcesoCliente.jsx

import React, { useEffect } from 'react';
import { useProcesoLogic } from '../../../hooks/clientes/useProcesoLogic';
import { useAuth } from '../../../context/AuthContext';
import { updateCliente } from "../../../services/clienteService";
import { Tooltip } from 'react-tooltip';
import ModalConfirmacion from '../../../components/ModalConfirmacion';
import ModalEditarFechaProceso from './ModalEditarFechaProceso';
import { PartyPopper, Unlock } from 'lucide-react';
import ClienteEstadoView from './ClienteEstadoView';
import Timeline from './Timeline';
import ModalMotivoReapertura from './ModalMotivoReapertura';
import { usePermissions } from '../../../hooks/auth/usePermissions';

const TabProcesoCliente = ({ cliente, renuncia, onDatosRecargados, onHayCambiosChange }) => {

    const { userData } = useAuth();
    const { can } = usePermissions();
    const isReadOnly = !can('clientes', 'actualizarPasos');

    if (cliente.status === 'renunciado' || cliente.status === 'inactivo' || cliente.status === 'enProcesoDeRenuncia') {
        return <ClienteEstadoView cliente={cliente} renuncia={renuncia} contexto="proceso" />;
    }

    const handleSave = async (procesoConActividad, userName) => {
        const clienteActualizado = { ...cliente, proceso: procesoConActividad };
        const { vivienda, ...datosParaGuardar } = clienteActualizado;
        await updateCliente(cliente.id, datosParaGuardar, cliente.viviendaId, { userName });
        onDatosRecargados();
    };

    const {
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

    useEffect(() => {
        onHayCambiosChange(hayCambiosSinGuardar);
    }, [hayCambiosSinGuardar, onHayCambiosChange]);

    const pasoAReabrirInfo = reaperturaInfo ? pasosRenderizables.find(p => p.key === reaperturaInfo.key) : null;
    const nombrePasoAReabrir = pasoAReabrirInfo ? `"${pasoAReabrirInfo.label.substring(pasoAReabrirInfo.label.indexOf('.') + 1).trim()}"` : '';
    const porcentajeProgreso = progreso.total > 0 ? (progreso.completados / progreso.total) * 100 : 0;

    return (
        <div className="animate-fade-in space-y-4">

            {/* El encabezado sticky se queda como está, sin padding */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700 shadow-sm flex justify-between items-center sticky top-20 z-10">
                <h3 className="font-bold text-lg dark:text-gray-200">Línea de Tiempo del Proceso</h3>
                {hayCambiosSinGuardar && (
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
                            <button
                                onClick={handlers.iniciarAnulacionCierre}
                                className="w-full md:w-auto bg-yellow-500 hover:bg-yellow-600 text-white font-semibold text-xs py-2 px-4 rounded-lg flex items-center justify-center gap-2"
                            >
                                <Unlock size={14} />
                                Anular Cierre de Proceso (Admin)
                            </button>
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
            </div>
            {/* 🔼 FIN DE LA CORRECCIÓN 🔼 */}

            {/* ... Modales sin cambios ... */}
            <ModalMotivoReapertura isOpen={!!reaperturaInfo} onClose={handlers.cancelarReapertura} onConfirm={handlers.confirmarReapertura} titulo="Justificar Reapertura de Paso" nombrePaso={nombrePasoAReabrir} />
            <ModalConfirmacion isOpen={cierreAAnular} onClose={handlers.cancelarAnulacionCierre} onConfirm={handlers.confirmarAnulacionCierre} titulo="¿Anular Cierre de Proceso?" mensaje="Esta acción reabrirá únicamente el último paso ('Factura de Venta') para permitir correcciones." />
            <ModalEditarFechaProceso isOpen={!!pasoAEditarFecha} onClose={handlers.cancelarEdicionFecha} onConfirm={handlers.confirmarEdicionFecha} pasoInfo={pasoAEditarFecha ? { ...pasoAEditarFecha, ...pasosRenderizables.find(p => p.key === pasoAEditarFecha.key) } : null} />
        </div>
    );
};

export default TabProcesoCliente;