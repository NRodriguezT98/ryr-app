import React, { useEffect } from 'react';
import { NumericFormat } from 'react-number-format';
import { useForm } from '../../hooks/useForm.jsx';
import { validateAbono } from './abonoValidation.js';
import { updateAbono } from '../../utils/storage.js';
import toast from 'react-hot-toast';

// Helper para obtener la fecha de hoy en formato YYYY-MM-DD
const getTodayString = () => new Date().toISOString().split('T')[0];

// 1. Añadimos fechaPago al estado inicial
const INITIAL_EDIT_STATE = {
    monto: '',
    metodoPago: '',
    fechaPago: getTodayString(),
};

const EditarAbonoModal = ({ isOpen, onClose, onSave, abonoAEditar }) => {

    const { formData, setFormData, handleSubmit, handleInputChange, handleValueChange, errors, isSubmitting } = useForm({
        initialState: INITIAL_EDIT_STATE,
        validate: (data) => validateAbono(data, null), // Para editar no necesitamos el resumen de saldo
        onSubmit: async (data) => {
            const montoNumerico = parseInt(String(data.monto).replace(/\D/g, '')) || 0;

            // 2. Nos aseguramos de incluir la fecha en los datos a guardar
            const datosParaGuardar = {
                monto: montoNumerico,
                metodoPago: data.metodoPago,
                fechaPago: data.fechaPago,
            };

            try {
                await updateAbono(abonoAEditar.id, datosParaGuardar);
                toast.success('Abono actualizado correctamente.');
                onSave();
            } catch (error) {
                toast.error('Error al actualizar el abono.');
                console.error("Error al actualizar abono:", error);
            }
            onClose();
        }
    });

    useEffect(() => {
        if (abonoAEditar) {
            // 3. Poblamos el formulario incluyendo la fecha del abono
            setFormData({
                monto: abonoAEditar.monto || '',
                metodoPago: abonoAEditar.metodoPago || '',
                fechaPago: abonoAEditar.fechaPago || getTodayString(),
            });
        }
    }, [abonoAEditar, setFormData]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg mx-4">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Editar Abono</h2>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-6">

                        {/* 4. AÑADIMOS EL CAMPO DE FECHA AL FORMULARIO */}
                        <div>
                            <label className="block font-semibold mb-1" htmlFor="fechaPago-edit">Fecha del Abono</label>
                            <input
                                type="date"
                                id="fechaPago-edit"
                                name="fechaPago"
                                value={formData.fechaPago}
                                onChange={handleInputChange}
                                max={getTodayString()} // No permite seleccionar fechas futuras
                                className={`w-full border p-2 rounded-lg ${errors.fechaPago ? "border-red-600" : "border-gray-300"}`}
                            />
                            {errors.fechaPago && <p className="text-red-600 text-sm mt-1">{errors.fechaPago}</p>}
                        </div>

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