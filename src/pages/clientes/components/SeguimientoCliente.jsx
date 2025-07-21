import React from 'react';
import toast from 'react-hot-toast';
import { Check, Calendar, Lock } from 'lucide-react';
import { useSeguimientoLogic } from '../../../hooks/clientes/useSeguimientoLogic';

const getTodayString = () => new Date().toISOString().split('T')[0];

const SeguimientoItem = ({ paso, onUpdate }) => {
    const { data, isLocked, minDate, previousStepDate, label, key } = paso;
    const isCompletado = data?.completado || false;
    const fechaActual = data?.fecha || '';

    const isDateValid = (dateString) => {
        if (!dateString) {
            toast.error("Debes seleccionar una fecha válida.");
            return false;
        };
        const fechaSeleccionada = new Date(dateString + 'T00:00:00');
        const fechaMinimaProceso = new Date(minDate + 'T00:00:00');

        if (fechaSeleccionada < fechaMinimaProceso) {
            toast.error(`La fecha no puede ser anterior al inicio del proceso (${new Date(minDate).toLocaleDateString('es-ES')}).`);
            return false;
        }
        if (previousStepDate && new Date(previousStepDate) > fechaSeleccionada) {
            toast.error(`La fecha no puede ser anterior a la del paso previo (${new Date(previousStepDate).toLocaleDateString('es-ES')}).`);
            return false;
        }
        return true;
    };

    const handleCheckChange = (e) => {
        const completado = e.target.checked;
        if (isLocked && completado) {
            toast.error('Debes completar los pasos anteriores requeridos.');
            return;
        }

        if (completado) {
            onUpdate(key, { completado: true, fecha: fechaActual });
        } else {
            onUpdate(key, { completado: false, fecha: null });
        }
    };

    const handleDateChange = (e) => {
        const nuevaFecha = e.target.value;
        onUpdate(key, { completado: isCompletado, fecha: nuevaFecha });
    };

    const handleDateBlur = () => {
        if (isCompletado && !isDateValid(fechaActual)) {
            onUpdate(key, { completado: false, fecha: null });
        }
    };

    return (
        <div className={`p-4 border-l-4 transition-colors ${isCompletado && fechaActual ? 'border-green-500 bg-green-50' : (isLocked ? 'border-gray-200 bg-gray-50' : 'border-gray-300 bg-white')}`}>
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
                {isCompletado ? (
                    <div className="flex items-center gap-2 animate-fade-in">
                        <Calendar size={16} className="text-gray-500" />
                        <input
                            type="date"
                            value={fechaActual}
                            onChange={handleDateChange}
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
    // Le pasamos la función onSave al hook
    const { seguimientoState, handleUpdate, pasosRenderizables, validateAndSaveChanges } = useSeguimientoLogic(cliente, onSave);

    // --- CORRECCIÓN CLAVE AQUÍ ---
    const handleSaveClick = () => {
        const isValid = validateAndSaveChanges();
        // Solo llamamos a onSave si la validación fue exitosa
        if (isValid) {
            onSave(seguimientoState);
        }
    };

    return (
        <div className="animate-fade-in bg-white border rounded-xl shadow-sm">
            <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-bold text-lg">Checklist del Proceso</h3>
                <button
                    onClick={handleSaveClick}
                    className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    Guardar Cambios en Seguimiento
                </button>
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
        </div>
    );
};

export default SeguimientoCliente;