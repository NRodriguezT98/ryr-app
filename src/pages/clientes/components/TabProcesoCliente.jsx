import React from 'react';
import { useProcesoLogic } from '../../../hooks/clientes/useProcesoLogic';
import { updateCliente } from '../../../utils/storage';
import PasoProcesoCard from './PasoProcesoCard';
import { Tooltip } from 'react-tooltip';

const TabProcesoCliente = ({ cliente, onDatosRecargados }) => {

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
        handleUpdateEvidencia,
        handleCompletarPaso,
        handleDateChange,
        handleReabrirPaso, // <-- Obtenemos la función del hook
        handleSaveChanges,
        isSaveDisabled,
        progreso,
        tooltipMessage
    } = useProcesoLogic(cliente, handleSave);

    const porcentajeProgreso = progreso.total > 0 ? (progreso.completados / progreso.total) * 100 : 0;

    return (
        <div className="animate-fade-in space-y-4">
            <div className="bg-white p-4 rounded-xl border shadow-sm flex justify-between items-center sticky top-20 z-10">
                <h3 className="font-bold text-lg">Línea de Tiempo del Proceso</h3>
                <span data-tooltip-id="app-tooltip" data-tooltip-content={tooltipMessage}>
                    <button
                        onClick={handleSaveChanges}
                        disabled={isSaveDisabled}
                        className="bg-blue-600 text-white font-semibold px-5 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        Guardar Cambios
                    </button>
                </span>
            </div>
            <div className="bg-white p-4 rounded-xl border shadow-sm">
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-semibold text-gray-700">Progreso General</span>
                        <span className="text-sm font-bold text-blue-600">{`${progreso.completados} / ${progreso.total} Pasos`}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${porcentajeProgreso}%` }}></div>
                    </div>
                </div>
            </div>
            <div className="space-y-4">
                {pasosRenderizables.map((paso, index) => (
                    <PasoProcesoCard
                        key={paso.key}
                        paso={{ ...paso, label: `${index + 1}. ${paso.label.substring(paso.label.indexOf(' ') + 1)}` }}
                        stepNumber={index + 1}
                        onUpdateEvidencia={handleUpdateEvidencia}
                        onCompletarPaso={handleCompletarPaso}
                        onDateChange={handleDateChange}
                        onReabrirPaso={handleReabrirPaso} // <-- Pasamos la función como prop
                        clienteId={cliente.id}
                    />
                ))}
            </div>
            <Tooltip id="app-tooltip" />
        </div>
    );
};

export default TabProcesoCliente;