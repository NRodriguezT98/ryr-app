import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { NumericFormat } from 'react-number-format';
import { useForm } from '../../hooks/useForm.jsx';
import { validateVivienda } from './viviendaValidation.js';
import { getViviendas, updateVivienda } from '../../utils/storage.js';
import toast from 'react-hot-toast';
import ModalConfirmacion from '../../components/ModalConfirmacion.jsx';

const INITIAL_VIVIENDA_STATE = {
    manzana: '',
    numero: '',
    matricula: '',
    nomenclatura: '',
    valor: '',
};

const EditarVivienda = ({ isOpen, onClose, onGuardar, vivienda }) => {
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [detectedChanges, setDetectedChanges] = useState([]);

    const todasLasViviendas = useMemo(() => getViviendas(), []);

    // --- CORRECCIÓN DE ORDEN 1: El hook useForm se declara ANTES de ser usado. ---
    const {
        formData,
        setFormData,
        errors,
        isSubmitting,
        handleInputChange,
        handleValueChange,
        handleSubmit,
    } = useForm({
        initialState: INITIAL_VIVIENDA_STATE,
        validate: (data) => validateVivienda(data, todasLasViviendas, vivienda.id),
        onSubmit: (data) => handleSubmitWithConfirmation(data),
        options: { resetOnSuccess: false }
    });

    // --- CORRECCIÓN DE ORDEN 2: Las funciones y memos que usan `formData` se declaran DESPUÉS. ---
    const hayCambios = useMemo(() => {
        if (!vivienda) return false;
        return formData.manzana !== (vivienda.manzana || '') ||
            formData.numero !== (vivienda.numeroCasa?.toString() || '') ||
            formData.matricula !== (vivienda.matricula || '') ||
            formData.nomenclatura !== (vivienda.nomenclatura || '') ||
            formData.valor !== (vivienda.valorTotal?.toString() || '');
    }, [formData, vivienda]);

    const handleFinalSave = useCallback(() => {
        const datosActualizados = {
            manzana: formData.manzana,
            numeroCasa: parseInt(formData.numero, 10),
            matricula: formData.matricula.trim(),
            nomenclatura: formData.nomenclatura.trim(),
            valorTotal: parseInt(String(formData.valor).replace(/\D/g, ''), 10),
        };
        if (updateVivienda(vivienda.id, datosActualizados)) {
            toast.success('Vivienda actualizada correctamente.');
            onGuardar();
        } else {
            toast.error('Error al actualizar la vivienda.');
        }
        setIsConfirmOpen(false);
        onClose();
    }, [formData, vivienda, onGuardar, onClose]);

    const handleSubmitWithConfirmation = useCallback((formData) => {
        const campos = [
            { key: 'manzana', label: 'Manzana', original: vivienda.manzana },
            { key: 'numero', label: 'Número', original: vivienda.numeroCasa?.toString() },
            { key: 'matricula', label: 'Matrícula', original: vivienda.matricula },
            { key: 'nomenclatura', label: 'Nomenclatura', original: vivienda.nomenclatura },
            { key: 'valor', label: 'Valor', original: vivienda.valorTotal?.toString() },
        ];
        const cambios = campos.map(campo => {
            const vOriginal = (campo.original || "").toString().trim();
            const vActual = (formData[campo.key] || "").toString().trim();
            if (vOriginal !== vActual) return { campo: campo.label, anterior: vOriginal, actual: vActual };
            return null;
        }).filter(Boolean);

        if (cambios.length > 0) {
            setDetectedChanges(cambios);
            setIsConfirmOpen(true);
        } else {
            toast.success("No se detectaron cambios.", { icon: 'ℹ️' });
            onClose();
        }
    }, [vivienda, onClose]);

    useEffect(() => {
        if (vivienda) {
            setFormData({
                manzana: vivienda.manzana || '',
                numero: vivienda.numeroCasa?.toString() || '',
                matricula: vivienda.matricula || '',
                nomenclatura: vivienda.nomenclatura || '',
                valor: vivienda.valorTotal?.toString() || '',
            });
        }
    }, [vivienda, setFormData]);

    if (!isOpen) {
        return null;
    }

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
                <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-2xl mx-4">
                    <h2 className="text-3xl font-bold text-[#c62828] text-center mb-8">✏️ Editar Vivienda</h2>
                    <form onSubmit={handleSubmit} noValidate>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* ... El JSX del formulario ... */}
                            <div>
                                <label className="block font-medium mb-1" htmlFor="manzana-edit">Manzana</label>
                                <select name="manzana" id="manzana-edit" value={formData.manzana} onChange={handleInputChange} className={`w-full border p-2.5 rounded-lg ${errors.manzana ? "border-red-600" : "border-gray-300"}`}>
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
                            <div className="md:col-span-2">
                                <label className="block font-medium mb-1" htmlFor="valor-edit">Valor</label>
                                <NumericFormat id="valor-edit" name="valor" value={formData.valor} onValueChange={(values) => handleValueChange('valor', values.value)} thousandSeparator="." decimalSeparator="," prefix="$ " className={`w-full border p-2.5 rounded-lg ${errors.valor ? "border-red-600" : "border-gray-300"}`} />
                                {errors.valor && <p className="text-red-600 text-sm mt-1">{errors.valor}</p>}
                            </div>
                        </div>
                        <div className="md:col-span-2 flex justify-end mt-8 space-x-4">
                            <button type="button" onClick={onClose} className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-5 py-2.5 rounded-full transition">Cancelar</button>
                            <button type="submit" disabled={isSubmitting || !hayCambios} className={`text-white px-5 py-2.5 rounded-full transition ${isSubmitting || !hayCambios ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#28a745] hover:bg-green-700'}`}>
                                {isSubmitting ? "Validando..." : "Guardar Cambios"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <ModalConfirmacion
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleFinalSave}
                titulo="Confirmar Cambios"
                mensaje={
                    <div>
                        <p className="mb-4">¿Deseas guardar los siguientes cambios?</p>
                        <ul className="text-left text-sm bg-gray-50 p-3 rounded-lg max-h-40 overflow-y-auto">
                            {detectedChanges.map(c => (
                                <li key={c.campo} className="mb-2">
                                    <strong className="font-medium text-gray-700">{c.campo}:</strong>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-red-600 bg-red-100 px-2 py-1 rounded">{c.anterior || 'Vacío'}</span>
                                        <span className="font-bold text-gray-400 mx-1">→</span>
                                        <span className="text-green-700 bg-green-100 px-2 py-1 rounded">{c.actual || 'Vacío'}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                }
            />
        </>
    );
};

export default EditarVivienda;