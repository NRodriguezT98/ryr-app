import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Check, Calendar, Lock } from 'lucide-react';
import { PASOS_SEGUIMIENTO_CONFIG } from '../../../utils/seguimientoConfig';

const getTodayString = () => new Date().toISOString().split('T')[0];

const SeguimientoItem = ({ paso, data, onUpdate, isLocked, minDate, previousStepDate }) => {
    const isCompletado = data?.completado || false;
    const [localDate, setLocalDate] = useState(data?.fecha || '');

    useEffect(() => {
        setLocalDate(data?.fecha || '');
    }, [data?.fecha]);

    const handleCheckChange = (e) => {
        const completado = e.target.checked;
        if (isLocked && completado) {
            toast.error('Debes completar el paso anterior y asignarle una fecha válida.');
            return;
        }

        const newDate = completado ? localDate : null;
        onUpdate(paso.key, { completado, fecha: newDate });
    };

    const handleDateBlur = () => {
        if (localDate) {
            const fechaSeleccionada = new Date(localDate + 'T00:00:00');
            const fechaMinimaProceso = new Date(minDate + 'T00:00:00');

            if (fechaSeleccionada < fechaMinimaProceso) {
                toast.error(`La fecha no puede ser anterior al inicio del proceso (${new Date(minDate).toLocaleDateString('es-ES')}).`);
                return;
            }

            if (previousStepDate && new Date(previousStepDate) > fechaSeleccionada) {
                toast.error(`La fecha no puede ser anterior a la del paso previo (${new Date(previousStepDate).toLocaleDateString('es-ES')}).`);
                return;
            }
        }
        onUpdate(paso.key, { completado: !!localDate, fecha: localDate || null });
    };

    return (
        <div className={`p-4 border-l-4 transition-colors ${isCompletado && data?.fecha ? 'border-green-500 bg-green-50' : (isLocked ? 'border-gray-200 bg-gray-50' : 'border-gray-300 bg-white')}`}>
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
                        {paso.label}
                    </label>
                </div>
                {isCompletado ? (
                    <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-500" />
                        <input
                            type="date"
                            value={localDate}
                            onChange={(e) => setLocalDate(e.target.value)}
                            onBlur={handleDateBlur}
                            min={previousStepDate || minDate}
                            max={getTodayString()}
                            className="text-sm border-b bg-transparent"
                        />
                    </div>
                ) : isLocked ? (
                    <Lock size={16} className="text-gray-400" />
                ) : (
                    <span className="text-sm text-gray-400">Pendiente</span>
                )}
            </div>
        </div>
    );
};

const SeguimientoCliente = ({ cliente, onSave }) => {
    const [seguimiento, setSeguimiento] = useState(cliente.seguimiento || {});

    useEffect(() => {
        setSeguimiento(cliente.seguimiento || {});
    }, [cliente.seguimiento]);

    const handleUpdate = (pasoKey, newData) => {
        setSeguimiento(prev => ({
            ...prev,
            [pasoKey]: newData
        }));
    };

    const pasosAplicables = PASOS_SEGUIMIENTO_CONFIG.filter(paso =>
        paso.aplicaA(cliente.financiero || {})
    );

    let previousStepValid = true;
    let lastCompletedDate = cliente.datosCliente.fechaIngreso;

    return (
        <div className="animate-fade-in bg-white border rounded-xl shadow-sm">
            <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-bold text-lg">Checklist del Proceso</h3>
                <button
                    onClick={() => onSave(seguimiento)}
                    className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    Guardar Cambios en Seguimiento
                </button>
            </div>
            <div className="divide-y">
                {pasosAplicables.map(paso => {
                    const isLocked = !previousStepValid;
                    const pasoActual = seguimiento[paso.key];

                    const isCurrentStepCompleted = pasoActual?.completado && pasoActual?.fecha;

                    if (isCurrentStepCompleted) {
                        previousStepValid = true;
                        lastCompletedDate = pasoActual.fecha > lastCompletedDate ? pasoActual.fecha : lastCompletedDate;
                    } else {
                        previousStepValid = false;
                    }

                    return (
                        <SeguimientoItem
                            key={paso.key}
                            paso={paso}
                            data={pasoActual}
                            onUpdate={handleUpdate}
                            isLocked={isLocked}
                            minDate={cliente.datosCliente.fechaIngreso}
                            previousStepDate={lastCompletedDate}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default SeguimientoCliente;