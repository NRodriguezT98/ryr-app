import React, { useEffect } from 'react';
import { useForm } from '../../hooks/useForm.jsx';
import { updateVivienda } from '../../utils/storage.js';
import toast from 'react-hot-toast';

const EditarVivienda = ({ isOpen, onClose, onGuardar, vivienda }) => {
    const { formData, setFormData, handleSubmit, handleInputChange, isSubmitting } = useForm({
        initialState: { manzana: '', numero: '', matricula: '', nomenclatura: '' },
        onSubmit: async (data) => {
            const datosActualizados = {
                manzana: data.manzana,
                numeroCasa: parseInt(data.numero, 10) || 0,
                matricula: data.matricula.trim(),
                nomenclatura: data.nomenclatura.trim(),
            };
            try {
                await updateVivienda(vivienda.id, datosActualizados);
                toast.success('Datos de la vivienda actualizados.');
                onSave();
                onClose();
            } catch (error) {
                toast.error('Error al actualizar la vivienda.');
            }
        },
    });

    useEffect(() => {
        if (vivienda) {
            setFormData({
                manzana: vivienda.manzana || '',
                numero: vivienda.numeroCasa?.toString() || '',
                matricula: vivienda.matricula || '',
                nomenclatura: vivienda.nomenclatura || '',
            });
        }
    }, [vivienda, setFormData]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-2xl mx-4">
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold text-[#c62828]">✏️ Editar Vivienda</h2>
                    <p className="text-lg text-gray-500 mt-1">
                        Valor de Lista: <span className="font-bold text-gray-800">{formatCurrency(vivienda?.valorTotal)}</span>
                    </p>
                </div>

                {isLoading ? <div className="text-center py-10 animate-pulse">Cargando...</div> : (
                    <form onSubmit={handleSubmit} noValidate>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block font-medium mb-1" htmlFor="manzana-edit">Manzana</label>
                                <select id="manzana-edit" name="manzana" value={formData.manzana} onChange={handleInputChange} className={`w-full border p-2.5 rounded-lg ${errors.manzana ? "border-red-600" : "border-gray-300"}`}>
                                    <option value="">Selecciona</option>
                                    {["A", "B", "C", "D", "E", "F"].map((m) => (<option key={m} value={m}>{m}</option>))}
                                </select>
                                {errors.manzana && <p className="text-red-600 text-sm mt-1">{errors.manzana}</p>}
                            </div>
                            <div>
                                <label className="block font-medium mb-1" htmlFor="numero-edit">Número</label>
                                <input id="numero-edit" name="numero" type="text" value={formData.numero} onChange={handleInputChange} className={`w-full border p-2.5 rounded-lg ${errors.numero ? "border-red-600" : "border-gray-300"}`} />
                                {errors.numero && <p className="text-red-600 text-sm mt-1">{errors.numero}</p>}
                            </div>
                            <div>
                                <label className="block font-medium mb-1" htmlFor="matricula-edit">Matrícula</label>
                                <input id="matricula-edit" name="matricula" type="text" value={formData.matricula} onChange={handleInputChange} className={`w-full border p-2.5 rounded-lg ${errors.matricula ? "border-red-600" : "border-gray-300"}`} />
                                {errors.matricula && <p className="text-red-600 text-sm mt-1">{errors.matricula}</p>}
                            </div>
                            <div>
                                <label className="block font-medium mb-1" htmlFor="nomenclatura-edit">Nomenclatura</label>
                                <input id="nomenclatura-edit" name="nomenclatura" type="text" value={formData.nomenclatura} onChange={handleInputChange} className={`w-full border p-2.5 rounded-lg ${errors.nomenclatura ? "border-red-600" : "border-gray-300"}`} />
                                {errors.nomenclatura && <p className="text-red-600 text-sm mt-1">{errors.nomenclatura}</p>}
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t">
                            <button type="button" onClick={() => setShowDiscountSection(prev => !prev)} className="text-blue-600 hover:text-blue-800 font-semibold text-sm w-full text-left p-2 -ml-2">
                                {showDiscountSection ? 'Ocultar sección de descuento' : 'Aplicar o Modificar Descuento...'}
                            </button>
                            {showDiscountSection && (
                                <div className="space-y-6 mt-4 animate-fade-in p-4 bg-gray-50 rounded-lg">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block font-medium mb-1" htmlFor="descuentoMonto">Monto del Descuento</label>
                                            <NumericFormat id="descuentoMonto" name="descuentoMonto" value={formData.descuentoMonto} onValueChange={(values) => handleValueChange('descuentoMonto', values.value)} className={`w-full border p-2.5 rounded-lg ${errors.descuentoMonto ? "border-red-600" : "border-gray-300"}`} thousandSeparator="." decimalSeparator="," prefix="$ " />
                                            {errors.descuentoMonto && <p className="text-red-600 text-sm mt-1">{errors.descuentoMonto}</p>}
                                        </div>
                                        <div>
                                            <label className="block font-medium mb-1" htmlFor="descuentoMotivo">Motivo del Descuento</label>
                                            <input type="text" id="descuentoMotivo" name="descuentoMotivo" value={formData.descuentoMotivo} onChange={handleInputChange} className={`w-full border p-2.5 rounded-lg ${errors.descuentoMotivo ? 'border-red-500' : 'border-gray-300'}`} />
                                            {errors.descuentoMotivo && <p className="text-red-600 text-sm mt-1">{errors.descuentoMotivo}</p>}
                                        </div>
                                    </div>
                                    <div className="mt-6 pt-6 border-t border-dashed space-y-2">
                                        <div className="flex justify-between items-center text-gray-900 font-bold text-lg">
                                            <span>Valor Final (con Descuento):</span>
                                            <span className="text-green-600">{formatCurrency(valorFinalCalculado)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end mt-8 pt-6 border-t space-x-4">
                            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 hover:bg-gray-300 font-semibold px-6 py-2 rounded-lg transition">Cancelar</button>
                            <span data-tooltip-id="save-button-tooltip" data-tooltip-content="No hay cambios para guardar">
                                <button type="submit" disabled={!hayCambios || isSubmitting} className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed">
                                    {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                            </span>
                            {!hayCambios && <Tooltip id="save-button-tooltip" style={{ backgroundColor: "#334155", color: "#ffffff", borderRadius: '8px', zIndex: 100 }} />}
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default EditarVivienda;