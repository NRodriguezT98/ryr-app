import React, { useEffect, useMemo } from 'react';
import { NumericFormat } from 'react-number-format';
import { useForm } from '../../hooks/useForm.jsx';
import { validateAbonoOnEdit } from './abonoValidation.js';
import { updateAbono } from '../../utils/storage.js';
import toast from 'react-hot-toast';
import Modal from '../../components/Modal';
import { Edit } from 'lucide-react';
import FileUpload from '../../components/FileUpload';

// --- NUEVA FUNCIÓN DE AYUDA ---
// Devuelve la fecha de hoy en formato YYYY-MM-DD
const getTodayString = () => new Date().toISOString().split('T')[0];

const EditarAbonoModal = ({ isOpen, onClose, onSave, abonoAEditar, viviendaDelAbono }) => {
    const initialState = useMemo(() => ({
        monto: abonoAEditar?.monto?.toString() || '',
        fechaPago: abonoAEditar?.fechaPago || getTodayString(),
        observacion: abonoAEditar?.observacion || '',
        urlComprobante: abonoAEditar?.urlComprobante || null,
    }), [abonoAEditar]);

    const { formData, setFormData, handleSubmit, handleInputChange, handleValueChange, errors, isSubmitting } = useForm({
        initialState,
        validate: (data) => validateAbonoOnEdit(data, abonoAEditar, viviendaDelAbono),
        onSubmit: async (data) => {
            const montoNumerico = parseInt(String(data.monto).replace(/\D/g, '')) || 0;
            const datosParaGuardar = {
                monto: montoNumerico,
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
        }
    });

    useEffect(() => {
        if (isOpen) {
            setFormData(initialState);
        }
    }, [isOpen, initialState, setFormData]);

    const handleUploadSuccess = (url) => {
        handleValueChange('urlComprobante', url);
    };
    const handleRemoveFile = () => {
        handleValueChange('urlComprobante', null);
    };

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Editar Abono"
            icon={<Edit size={28} className="text-green-600" />}
        >
            <form onSubmit={handleSubmit} noValidate>
                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <label className="block font-semibold mb-1" htmlFor="monto-edit">Monto del Abono</label>
                        <NumericFormat
                            id="monto-edit" name="monto" value={formData.monto}
                            onValueChange={(values) => handleValueChange('monto', values.value)}
                            className={`w-full border p-2 rounded-lg ${errors.monto ? "border-red-500" : "border-gray-300"}`}
                            thousandSeparator="." decimalSeparator="," prefix="$ "
                        />
                        {errors.monto && <p className="text-red-600 text-sm mt-1">{errors.monto}</p>}
                    </div>
                    <div>
                        <label className="block font-semibold mb-1" htmlFor="fechaPago-edit">Fecha del Abono</label>
                        <input
                            type="date" id="fechaPago-edit" name="fechaPago" value={formData.fechaPago}
                            onChange={handleInputChange}
                            // --- ATRIBUTO MAX AÑADIDO AQUÍ ---
                            max={getTodayString()}
                            className={`w-full border p-2 rounded-lg ${errors.fechaPago ? "border-red-600" : "border-gray-300"}`}
                        />
                        {errors.fechaPago && <p className="text-red-600 text-sm mt-1">{errors.fechaPago}</p>}
                    </div>
                    <div>
                        <label className="block font-semibold mb-1" htmlFor="observacion-edit">Observación</label>
                        <textarea
                            id="observacion-edit" name="observacion" value={formData.observacion}
                            onChange={handleInputChange} rows="2"
                            className="w-full border p-2 rounded-lg text-sm"
                        />
                    </div>
                    <div>
                        <FileUpload
                            label="Reemplazar Comprobante de Pago"
                            filePath={(fileName) => `comprobantes_abonos/${abonoAEditar.viviendaId}/${abonoAEditar.fuente}-${Date.now()}-${fileName}`}
                            currentFileUrl={formData.urlComprobante}
                            onUploadSuccess={handleUploadSuccess}
                            onRemove={handleRemoveFile}
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
                    <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-5 py-2 rounded-lg">Cancelar</button>
                    <button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded-lg">
                        {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default EditarAbonoModal;