import React, { useEffect } from 'react';
import { NumericFormat } from 'react-number-format';
import { useForm } from '../../hooks/useForm.jsx';
import { validateAbono } from './abonoValidation.js';
import { updateAbono } from '../../utils/storage.js';
import { useToast } from '../../components/ToastContext';

// --- LA SOLUCIÓN: Definimos el estado inicial aquí, una sola vez ---
const INITIAL_EDIT_STATE = { monto: '', metodoPago: '' };

const EditarAbonoModal = ({ isOpen, onClose, onSave, abonoAEditar }) => {
    const { showToast } = useToast();

    const { formData, setFormData, handleSubmit, handleInputChange, handleValueChange, errors, isSubmitting } = useForm({
        // Usamos la constante estable para evitar el bucle infinito.
        initialState: INITIAL_EDIT_STATE,
        validate: (data) => validateAbono(data, null),
        onSubmit: async (data) => {
            const montoNumerico = parseInt(String(data.monto).replace(/\D/g, ''));
            const datosParaGuardar = {
                ...data,
                monto: montoNumerico,
            };

            if (updateAbono(abonoAEditar.id, datosParaGuardar)) {
                showToast('✅ Abono actualizado correctamente.', 'success');
                onSave();
            } else {
                showToast('❌ Error al actualizar el abono.', 'error');
            }
            onClose();
        }
    });

    // Este useEffect ahora podrá ejecutarse sin problemas para poblar el formulario.
    useEffect(() => {
        if (abonoAEditar) {
            setFormData({
                monto: abonoAEditar.monto,
                metodoPago: abonoAEditar.metodoPago,
            });
        }
    }, [abonoAEditar, setFormData]);

    if (!isOpen) {
        return null;
    }

    // El JSX no cambia, ya estaba correcto.
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg mx-4">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Editar Abono</h2>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="block font-semibold mb-1" htmlFor="monto-edit">Monto del Abono</label>
                            <NumericFormat
                                id="monto-edit"
                                name="monto"
                                value={formData.monto}
                                onValueChange={(values) => handleValueChange('monto', values.value)}
                                className={`w-full border p-2 rounded-lg ${errors.monto ? "border-red-600" : "border-gray-300"}`}
                                thousandSeparator="." decimalSeparator="," prefix="$ " allowNegative={false} decimalScale={0}
                            />
                            {errors.monto && <p className="text-red-600 text-sm mt-1">{errors.monto}</p>}
                        </div>
                        <div>
                            <label className="block font-semibold mb-1" htmlFor="metodoPago-edit">Método de Pago</label>
                            <select
                                id="metodoPago-edit"
                                name="metodoPago"
                                value={formData.metodoPago}
                                onChange={handleInputChange}
                                className={`w-full border p-2 rounded-lg ${errors.metodoPago ? "border-red-600" : "border-gray-300"}`}
                            >
                                <option value="">Selecciona un método</option>
                                <option value="Consignación Bancaria">Consignación Bancaria</option>
                                <option value="Crédito Hipotecario">Crédito Hipotecario</option>
                                <option value="Subsidio de vivienda / Caja de compensación">Subsidio de vivienda</option>
                                <option value="Cesantias">Cesantías</option>
                                <option value="CDT">CDT</option>
                                <option value="Efectivo">Efectivo</option>
                            </select>
                            {errors.metodoPago && <p className="text-red-600 text-sm mt-1">{errors.metodoPago}</p>}
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 mt-8">
                        <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-5 py-2 rounded-full">Cancelar</button>
                        <button type="submit" disabled={isSubmitting} className="bg-[#1976d2] hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-full">
                            {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditarAbonoModal;