import React, { useCallback } from 'react';
import { NumericFormat } from 'react-number-format';

import { useForm } from '../../hooks/useForm.jsx';
import { useToast } from '../../components/ToastContext';
import { validateAbono } from './abonoValidation.js';
import { addAbono } from '../../utils/storage';

const INITIAL_ABONO_STATE = { monto: "", metodoPago: "" };

/**
 * Componente que encapsula toda la lógica para el formulario de registro de abonos.
 * @param {object} props
 * @param {object} props.vivienda - El objeto completo de la vivienda seleccionada.
 * @param {object} props.resumen - El resumen financiero para validación.
 * @param {Function} props.onAbonoRegistrado - Callback para notificar al padre que un abono fue creado.
 */
const FormularioAbono = ({ vivienda, resumen, onAbonoRegistrado }) => {
    const { showToast } = useToast();

    // La lógica de registro ahora vive dentro de este componente.
    const handleRegisterAbono = useCallback((formData) => {
        const montoNumerico = parseInt(String(formData.monto).replace(/\D/g, ''));
        const nuevoAbono = {
            id: Date.now(),
            viviendaId: vivienda.id,
            clienteId: vivienda.clienteId,
            fechaPago: new Date().toISOString().split('T')[0],
            monto: montoNumerico,
            metodoPago: formData.metodoPago,
        };

        addAbono(nuevoAbono);
        showToast("✅ Abono registrado exitosamente.", "success");
        onAbonoRegistrado(); // Llama a la función del padre (loadAllData) para refrescar la UI.
    }, [vivienda, showToast, onAbonoRegistrado]);

    // El hook useForm también se mueve aquí.
    const {
        formData,
        errors,
        isSubmitting,
        handleInputChange,
        handleValueChange,
        handleSubmit,
    } = useForm({
        initialState: INITIAL_ABONO_STATE,
        validate: (formData) => validateAbono(formData, resumen),
        onSubmit: handleRegisterAbono,
    });

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8 bg-blue-50 p-6 rounded-lg">
            <div>
                <label className="block font-semibold mb-1" htmlFor="monto">Monto del Abono <span className="text-red-600">*</span></label>
                <NumericFormat
                    id="monto"
                    name="monto"
                    value={formData.monto}
                    onValueChange={(values) => handleValueChange('monto', values.value)}
                    className={`w-full border p-2 rounded-lg ${errors.monto ? "border-red-600" : "border-gray-300"}`}
                    thousandSeparator="." decimalSeparator="," prefix="$ " allowNegative={false} decimalScale={0}
                />
                {errors.monto && <p className="text-red-600 text-sm mt-1">{errors.monto}</p>}
            </div>
            <div>
                <label className="block font-semibold mb-1" htmlFor="metodoPago">Método de Pago <span className="text-red-600">*</span></label>
                <select
                    id="metodoPago"
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
            <div className="md:col-span-2 flex justify-end">
                <button type="submit" disabled={isSubmitting} className={`px-5 py-2.5 rounded-full transition text-white ${isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-[#1976d2] hover:bg-blue-700"}`}>
                    {isSubmitting ? "Registrando..." : "Registrar Abono"}
                </button>
            </div>
        </form>
    );
};

export default FormularioAbono;