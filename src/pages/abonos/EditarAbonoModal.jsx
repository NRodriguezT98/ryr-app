import React, { useEffect, useState } from 'react';
import { NumericFormat } from 'react-number-format';
import { useForm } from '../../hooks/useForm.jsx';
import { validateAbono } from './abonoValidation.js'; // <-- CORRECCIÓN EN LA IMPORTACIÓN
import { updateAbono } from '../../utils/storage.js';
import toast from 'react-hot-toast';
import Modal from '../../components/Modal.jsx';
import { Pencil } from 'lucide-react';

const getTodayString = () => new Date().toISOString().split('T')[0];

const INITIAL_EDIT_STATE = {
    monto: '',
    metodoPago: '',
    fechaPago: getTodayString(),
    observacion: '',
    urlComprobante: null,
};

const EditarAbonoModal = ({ isOpen, onClose, onSave, abonoAEditar, viviendaDelAbono }) => {

    const { formData, setFormData, handleSubmit, handleInputChange, handleValueChange, errors, isSubmitting } = useForm({
        initialState: INITIAL_EDIT_STATE,
        // Usamos la función importada correctamente
        validate: (data) => validateAbono(data, null, viviendaDelAbono?.cliente?.fechaCreacion),
        onSubmit: async (data) => {
            const montoNumerico = parseInt(String(data.monto).replace(/\D/g, '')) || 0;
            const datosParaGuardar = {
                monto: montoNumerico,
                metodoPago: data.metodoPago,
                fechaPago: data.fechaPago,
                observacion: data.observacion,
            };

            try {
                await updateAbono(abonoAEditar.id, datosParaGuardar, abonoAEditar);
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
            setFormData({
                monto: abonoAEditar.monto || '',
                metodoPago: abonoAEditar.metodoPago || '',
                fechaPago: abonoAEditar.fechaPago || getTodayString(),
                observacion: abonoAEditar.observacion || '',
                urlComprobante: abonoAEditar.urlComprobante || null
            });
        }
    }, [abonoAEditar, isOpen, setFormData]);

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Editar Abono" icon={<Pencil className="text-blue-500" />}>
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <label className="block font-semibold mb-1" htmlFor="fechaPago-edit">Fecha del Abono</label>
                        <input
                            type="date"
                            id="fechaPago-edit"
                            name="fechaPago"
                            value={formData.fechaPago}
                            onChange={handleInputChange}
                            max={getTodayString()}
                            min={viviendaDelAbono?.cliente?.fechaCreacion?.split('T')[0]}
                            className={`w-full border p-2 rounded-lg ${errors.fechaPago ? "border-red-500" : "border-gray-300"}`}
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
                </div>
                <div className="flex justify-end gap-4 mt-8">
                    <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-5 py-2 rounded-lg">Cancelar</button>
                    <button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg">
                        {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default EditarAbonoModal;