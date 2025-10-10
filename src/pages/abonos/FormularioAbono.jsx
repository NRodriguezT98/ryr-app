import React from "react";
import { NumericFormat } from "react-number-format";
import { useForm } from "../../hooks/useForm.jsx";
import { useModernToast } from '../../hooks/useModernToast.jsx';
import { validateAbono } from "./abonoValidation.js";
import { addAbono } from "../../utils/storage";

// --- LA SOLUCIÓN: La constante se define aquí, una sola vez. ---
const INITIAL_ABONO_STATE = {
    monto: "",
    metodoPago: "",
};

const FormularioAbono = ({ vivienda, resumenPago, onAbonoRegistrado }) => {
    const toast = useModernToast();

    const initialState = {
        monto: "",
        metodoPago: "",
    };

    const handleRegisterAbono = async (formData) => {
        const montoNumerico = parseInt(String(formData.monto).replace(/\D/g, ''), 10);
        const nuevoAbono = {
            id: Date.now(),
            viviendaId: vivienda.id,
            clienteId: vivienda.clienteId,
            fechaPago: new Date().toISOString().split('T')[0],
            monto: montoNumerico,
            metodoPago: formData.metodoPago,
        };

        addAbono(nuevoAbono);
        toast.success("Abono registrado exitosamente.", {
            title: "¡Abono Registrado!"
        });
        onAbonoRegistrado();
        resetForm();
    };

    const {
        formData,
        errors,
        isSubmitting,
        handleValueChange,
        handleInputChange,
        handleSubmit,
        resetForm
    } = useForm({
        initialState: INITIAL_ABONO_STATE,
        validate: (data) => validateAbono(data, resumenPago),
        onSubmit: handleRegisterAbono,
    });

    return (
        <div className="animate-fade-in transition-all duration-300 ease-out mt-8">
            <hr className="my-8 border-gray-200" />
            <h3 className="text-xl font-bold mb-4 text-gray-800">Registrar Nuevo Abono</h3>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 bg-blue-50 p-6 rounded-lg">
                {/* ... El resto del JSX no cambia ... */}
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
                        <option value="Subsidio de vivienda / Caja de compensación">Subsidio de vivienda / Caja de compensación</option>
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
        </div>
    );
};

export default FormularioAbono;