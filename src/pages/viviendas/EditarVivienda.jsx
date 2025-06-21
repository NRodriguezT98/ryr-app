import React, { useEffect, useMemo } from 'react';
import { NumericFormat } from 'react-number-format';
import { useForm } from '../../hooks/useForm.jsx';
import { validateVivienda } from './viviendaValidation.js';
import { getViviendas, updateVivienda } from '../../utils/storage.js';
import { useToast } from '../../components/ToastContext';

/**
 * Modal para editar una vivienda existente.
 * Encapsula su propia lógica de formulario y validación.
 */
const EditarVivienda = ({ isOpen, onClose, onGuardar, vivienda }) => {
    const { showToast } = useToast();

    // 1. Obtenemos todas las viviendas una sola vez para la validación de unicidad.
    const todasLasViviendas = useMemo(() => getViviendas(), []);

    // 2. Definimos la lógica que se ejecutará al enviar el formulario.
    const handleSaveChanges = async (formData) => {
        const datosActualizados = {
            manzana: formData.manzana,
            numeroCasa: parseInt(formData.numero, 10),
            matricula: formData.matricula.trim(),
            nomenclatura: formData.nomenclatura.trim(),
            valorTotal: parseInt(formData.valor.replace(/\D/g, ''), 10),
        };

        if (updateVivienda(vivienda.id, datosActualizados)) {
            showToast('✅ Vivienda actualizada correctamente.', 'success');
            onGuardar(); // Notifica al padre para que recargue la lista
        } else {
            showToast('❌ Error al actualizar la vivienda.', 'error');
        }
        onClose(); // Cierra el modal en cualquier caso
    };

    // 3. Usamos nuestro hook `useForm` para toda la gestión del formulario.
    const {
        formData,
        setFormData,
        errors,
        isSubmitting,
        handleInputChange,
        handleValueChange,
        handleSubmit,
    } = useForm({
        // El estado inicial ahora es un objeto vacío.
        initialState: {
            manzana: '',
            numero: '',
            matricula: '',
            nomenclatura: '',
            valor: '',
        },
        // Conectamos nuestra nueva función de validación.
        validate: (data) => validateVivienda(data, todasLasViviendas, vivienda.id),
        // Le pasamos la lógica de guardado.
        onSubmit: handleSaveChanges,
    });

    // 4. Usamos useEffect para poblar el formulario con los datos de la vivienda a editar.
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

    // Si el modal no está abierto, no renderizamos nada.
    if (!isOpen) {
        return null;
    }

    // 5. El JSX es ahora mucho más simple.
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-2xl mx-4">
                <h2 className="text-3xl font-bold text-[#c62828] text-center mb-8">
                    ✏️ Editar Vivienda
                </h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6" noValidate>
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
                        <NumericFormat id="valor-edit" value={formData.valor} onValueChange={(values) => handleValueChange('valor', values.value)} thousandSeparator="." decimalSeparator="," prefix="$ " className={`w-full border p-2.5 rounded-lg ${errors.valor ? "border-red-600" : "border-gray-300"}`} />
                        {errors.valor && <p className="text-red-600 text-sm mt-1">{errors.valor}</p>}
                    </div>
                    <div className="md:col-span-2 flex justify-end mt-8 space-x-4">
                        <button type="button" onClick={onClose} className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-5 py-2.5 rounded-full transition">Cancelar</button>
                        <button type="submit" disabled={isSubmitting} className={`bg-[#28a745] hover:bg-green-700 text-white px-5 py-2.5 rounded-full transition`}>
                            {isSubmitting ? "Guardando..." : "Guardar Cambios"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditarVivienda;