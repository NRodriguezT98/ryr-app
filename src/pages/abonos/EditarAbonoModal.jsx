import React, { useEffect, useMemo } from 'react';
import { NumericFormat } from 'react-number-format';
import { useForm } from '../../hooks/useForm.jsx';
import { validateAbono } from './abonoValidation.js';
import { updateAbono } from '../../utils/storage.js';
import toast from 'react-hot-toast';
import Modal from '../../components/Modal.jsx';
import { Pencil } from 'lucide-react';
import FileUpload from '../../components/FileUpload.jsx';
import { Tooltip } from 'react-tooltip';

const getTodayString = () => new Date().toISOString().split('T')[0];

const EditarAbonoModal = ({ isOpen, onClose, onSave, abonoAEditar, viviendaDelAbono }) => {

    const initialState = useMemo(() => ({
        monto: abonoAEditar?.monto?.toString() || '',
        metodoPago: abonoAEditar?.metodoPago || '',
        fechaPago: abonoAEditar?.fechaPago || getTodayString(),
        observacion: abonoAEditar?.observacion || '',
        urlComprobante: abonoAEditar?.urlComprobante || null
    }), [abonoAEditar]);

    const { formData, setFormData, handleSubmit, handleInputChange, handleValueChange, errors, isSubmitting, initialData } = useForm({
        initialState,
        validate: (data) => validateAbono(data, null, viviendaDelAbono?.cliente?.fechaCreacion),
        onSubmit: async (data) => {
            const montoNumerico = parseInt(String(data.monto).replace(/\D/g, '')) || 0;
            const datosParaGuardar = {
                monto: montoNumerico,
                metodoPago: data.metodoPago,
                fechaPago: data.fechaPago,
                observacion: data.observacion.trim(),
                urlComprobante: data.urlComprobante,
            };

            try {
                await updateAbono(abonoAEditar.id, datosParaGuardar, abonoAEditar);
                toast.success('Abono actualizado correctamente.');
                onSave();
                onClose();
            } catch (error) {
                toast.error('Error al actualizar el abono.');
                console.error("Error al actualizar abono:", error);
            }
        },
        options: { resetOnSuccess: false }
    });

    // <-- LÓGICA CORREGIDA AQUÍ
    const hayCambios = useMemo(() => {
        if (!initialData) return false;
        // Clonamos los objetos y anulamos 'errors' para una comparación precisa
        const currentData = { ...formData, errors: null };
        const originalData = { ...initialData, errors: null };
        return JSON.stringify(currentData) !== JSON.stringify(originalData);
    }, [formData, initialData]);

    useEffect(() => {
        if (isOpen) {
            setFormData(initialState);
        }
    }, [isOpen, initialState, setFormData]);

    if (!isOpen) return null;

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title="Editar Abono" icon={<Pencil className="text-blue-500" />}>
                <form onSubmit={handleSubmit} noValidate>
                    <div className="grid grid-cols-1 gap-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                        <div>
                            <label className="block font-semibold mb-1" htmlFor="observacion-edit">Observación (Opcional)</label>
                            <textarea
                                id="observacion-edit"
                                name="observacion"
                                value={formData.observacion}
                                onChange={handleInputChange}
                                rows="3"
                                className="w-full border p-2 rounded-lg text-sm"
                                placeholder="Ej: Abono correspondiente a..."
                            />
                        </div>
                        <div>
                            <FileUpload
                                label="Reemplazar Comprobante de Pago"
                                filePath={(fileName) => `comprobantes_abonos/${abonoAEditar.viviendaId}/${abonoAEditar.fuente}-${Date.now()}-${fileName}`}
                                currentFileUrl={formData.urlComprobante}
                                onUploadSuccess={(url) => handleValueChange('urlComprobante', url)}
                                onRemove={() => handleValueChange('urlComprobante', null)}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
                        <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-5 py-2 rounded-lg">Cancelar</button>

                        <span
                            data-tooltip-id="app-tooltip"
                            data-tooltip-content={!hayCambios ? "No hay cambios para guardar" : ''}
                        >
                            <button
                                type="submit"
                                disabled={!hayCambios || isSubmitting}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg disabled:bg-gray-400"
                            >
                                {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </span>
                    </div>
                </form>
            </Modal>
            <Tooltip id="app-tooltip" />
        </>
    );
};

export default EditarAbonoModal;