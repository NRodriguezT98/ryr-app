import React, { useMemo } from 'react';
import { Tooltip } from 'react-tooltip';
import { Check, Calendar, Lock, AlertCircle } from 'lucide-react';
import { useSeguimientoLogic } from '../../../hooks/clientes/useSeguimientoLogic';
import toast from 'react-hot-toast';

const getTodayString = () => new Date().toISOString().split('T')[0];

const SeguimientoItem = ({ paso, onUpdate }) => {
    const { data, isLocked, label, key, error, previousStepDate, minDate } = paso;
    const isCompletado = data?.completado || false;
    const fechaActual = data?.fecha || '';

    const handleCheckChange = (e) => {
        const completado = e.target.checked;
        if (isLocked && completado) {
            toast.error('Debes completar los pasos anteriores requeridos.');
            return;
        }
        onUpdate(key, { completado, fecha: completado ? fechaActual : null });
    };

    const handleDateChange = (e) => {
        const nuevaFecha = e.target.value;
        onUpdate(key, { completado: isCompletado, fecha: nuevaFecha });
    };

    return (
        <div className={`p-4 border-l-4 transition-colors ${error ? 'border-red-500 bg-red-50' : (isCompletado && fechaActual ? 'border-green-500 bg-green-50' : (isLocked ? 'border-gray-200 bg-gray-50' : 'border-gray-300 bg-white'))}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        checked={isCompletado}
                        onChange={handleCheckChange}
                        disabled={isLocked && !isCompletado}
                        className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300 disabled:opacity-50"
                    />
                    <label className={`ml-3 font-medium ${isLocked && !isCompletado ? 'text-gray-400' : 'text-gray-800'}`}>
                        {label}
                    </label>
                </div>

                <div className="flex items-center gap-2">
                    {isLocked ? (
                        <Lock size={16} className="text-gray-400" />
                    ) : (
                        <>
                            <Calendar size={16} className={isCompletado ? "text-gray-600" : "text-gray-400"} />
                            <input
                                type="date"
                                value={fechaActual}
                                onChange={handleDateChange}
                                disabled={!isCompletado}
                                min={minDate}
                                max={getTodayString()}
                                className={`text-sm border-b bg-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${error ? 'border-red-500' : 'border-gray-300'}`}
                            />
                        </>
                    )}
                </div>
            </div>
            {error && (
                <div className="mt-2 pl-8 flex items-center gap-2 text-red-600 text-xs font-semibold">
                    <AlertCircle size={14} />
                    <p>{error}</p>
                </div>
            )}
        </div>
    );
};

const SeguimientoCliente = ({ cliente, onSave }) => {
    const { handleUpdate, pasosRenderizables, handleSave, isSaveDisabled } = useSeguimientoLogic(cliente, onSave);

    return (
        <div className="animate-fade-in bg-white border rounded-xl shadow-sm">
            <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-bold text-lg">Checklist del Proceso</h3>
                <span data-tooltip-id="app-tooltip" data-tooltip-content={isSaveDisabled ? "Hay pasos completados sin fecha o con fechas incorrectas." : 'Guardar los cambios realizados'}>
                    <button
                        onClick={handleSave}
                        disabled={isSaveDisabled}
                        className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        Guardar Cambios en Seguimiento
                    </button>
                </span>
            </div>
            <div className="divide-y">
                {pasosRenderizables.map(paso => (
                    <SeguimientoItem
                        key={paso.key}
                        paso={paso}
                        onUpdate={handleUpdate}
                    />
                ))}
            </div>
            <Tooltip id="app-tooltip" />
        </div>
    );
};

export default SeguimientoCliente;