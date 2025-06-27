import React, { useEffect } from 'react';
import { useForm } from '../../hooks/useForm.jsx';
import { updateVivienda } from '../../utils/storage.js';
import toast from 'react-hot-toast';
import { NumericFormat } from 'react-number-format';

const formatCurrency = (value) => (value || 0).toLocaleString("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 });

const DescuentoModal = ({ isOpen, onClose, onSave, vivienda }) => {
    const { formData, setFormData, handleSubmit, handleValueChange, errors, isSubmitting } = useForm({
        initialState: { descuentoMonto: '0', descuentoMotivo: '' },
        validate: (data) => validateVivienda(data, [], vivienda), // Usamos una versión simplificada de la validación
        onSubmit: async (data) => {
            const montoDescuento = parseInt(String(data.descuentoMonto).replace(/\D/g, ''), 10) || 0;
            const datosParaGuardar = { descuentoMonto: montoDescuento, descuentoMotivo: data.descuentoMotivo.trim() };
            try {
                await updateVivienda(vivienda.id, datosParaGuardar);
                toast.success('Descuento actualizado.');
                onSave();
                onClose();
            } catch (error) { toast.error('Error al guardar el descuento.'); }
        },
    });

    useEffect(() => {
        if (vivienda) {
            setFormData({
                descuentoMonto: vivienda.descuentoMonto?.toString() || '0',
                descuentoMotivo: vivienda.descuentoMotivo || ''
            });
        }
    }, [vivienda, setFormData]);

    if (!isOpen) return null;

    const valorFinal = (vivienda.valorTotal || 0) - (parseInt(String(formData.descuentoMonto).replace(/\D/g, ''), 10) || 0);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-xl mx-4">
                <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">Aplicar Descuento</h2>
                <p className="text-center text-gray-500 mb-6">{`Vivienda: Mz ${vivienda.manzana} - Casa ${vivienda.numeroCasa}`}</p>

                <div className="bg-gray-50 border p-4 rounded-lg mb-8 space-y-2">
                    <div className="flex justify-between"><span>Valor de Lista:</span><span className="font-medium">{formatCurrency(vivienda.valorTotal)}</span></div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t"><span>Valor Final:</span><span className="text-green-600">{formatCurrency(valorFinal)}</span></div>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="block font-medium mb-1" htmlFor="descuentoMonto">Monto del Descuento</label>
                            <NumericFormat id="descuentoMonto" name="descuentoMonto" value={formData.descuentoMonto} onValueChange={(values) => handleValueChange('descuentoMonto', values.value)} className={`w-full border p-2.5 rounded-lg ${errors.descuentoMonto ? 'border-red-500' : 'border-gray-300'}`} thousandSeparator="." decimalSeparator="," prefix="$ " />
                            {errors.descuentoMonto && <p className="text-red-600 text-sm mt-1">{errors.descuentoMonto}</p>}
                        </div>
                        <div>
                            <label className="block font-medium mb-1" htmlFor="descuentoMotivo">Motivo del Descuento</label>
                            <input type="text" id="descuentoMotivo" name="descuentoMotivo" value={formData.descuentoMotivo} onChange={handleInputChange} className={`w-full border p-2.5 rounded-lg ${errors.descuentoMotivo ? 'border-red-500' : 'border-gray-300'}`} />
                            {errors.descuentoMotivo && <p className="text-red-600 text-sm mt-1">{errors.descuentoMotivo}</p>}
                        </div>
                    </div>
                    <div className="flex justify-end mt-8 pt-6 border-t space-x-4">
                        <button type="button" onClick={onClose} className="bg-gray-200 ...">Cancelar</button>
                        <button type="submit" disabled={isSubmitting} className="bg-purple-500 hover:bg-purple-600 ...">
                            {isSubmitting ? 'Guardando...' : 'Guardar Descuento'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default DescuentoModal;