import React, { useEffect, useMemo, useState, useCallback } from 'react';
import Select from 'react-select';
import { useForm } from '../../hooks/useForm.jsx';
import { validateCliente } from './clienteValidation.js';
import { getViviendas, getClientes, updateCliente } from '../../utils/storage.js';
import toast from 'react-hot-toast';
import ModalConfirmacion from '../../components/ModalConfirmacion.jsx';

const INITIAL_CLIENTE_STATE = {
    nombre: '',
    cedula: '',
    telefono: '',
    correo: '',
    direccion: '',
    viviendaId: '',
};

const EditarCliente = ({ isOpen, onClose, onGuardar, clienteAEditar }) => {
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [detectedChanges, setDetectedChanges] = useState([]);

    // Estados para cargar los datos necesarios de forma asíncrona
    const [isLoading, setIsLoading] = useState(true);
    const [todosLosClientes, setTodosLosClientes] = useState([]);
    const [viviendasDisponibles, setViviendasDisponibles] = useState([]);

    useEffect(() => {
        if (isOpen) {
            const cargarDatosNecesarios = async () => {
                setIsLoading(true);
                try {
                    // Pedimos los datos a Firebase
                    const [dataClientes, dataViviendas] = await Promise.all([getClientes(), getViviendas()]);

                    // Preparamos los datos para la validación y el selector
                    setTodosLosClientes(dataClientes);
                    const disponibles = dataViviendas.filter(v => v.clienteId === null || v.clienteId === clienteAEditar.id);
                    setViviendasDisponibles(disponibles);

                } catch (error) {
                    toast.error("No se pudieron cargar los datos para editar.");
                    console.error("Error cargando datos en EditarCliente:", error);
                } finally {
                    setIsLoading(false);
                }
            };
            cargarDatosNecesarios();
        }
    }, [isOpen, clienteAEditar]); // Se ejecuta cada vez que el modal se abre

    const { formData, setFormData, errors, isSubmitting, handleInputChange, handleSubmit } = useForm({
        initialState: INITIAL_CLIENTE_STATE,
        validate: (data) => validateCliente(data, todosLosClientes, clienteAEditar.id),
        onSubmit: (data) => handleSubmitWithConfirmation(data),
        options: { resetOnSuccess: false }
    });

    const hayCambios = useMemo(() => {
        if (!clienteAEditar) return false;
        return formData.nombre.trim() !== (clienteAEditar.nombre || '') ||
            formData.cedula.trim() !== (clienteAEditar.cedula || '') ||
            formData.telefono.trim() !== (clienteAEditar.telefono || '') ||
            formData.correo.trim() !== (clienteAEditar.correo || '') ||
            formData.direccion.trim() !== (clienteAEditar.direccion || '') ||
            (formData.viviendaId || null) !== (clienteAEditar.viviendaId || null);
    }, [formData, clienteAEditar]);

    const handleFinalSave = useCallback(async () => {
        try {
            await updateCliente(clienteAEditar.id, formData);
            toast.success('Cliente actualizado correctamente.');
            onGuardar();
        } catch (error) {
            toast.error('Error al actualizar el cliente.');
            console.error("Error al guardar cliente:", error);
        } finally {
            setIsConfirmOpen(false);
            onClose();
        }
    }, [formData, clienteAEditar, onGuardar, onClose]);

    const handleSubmitWithConfirmation = useCallback((formData) => {
        const viviendaOriginal = viviendasDisponibles.find(v => v.id === clienteAEditar.viviendaId);
        const viviendaNueva = viviendasDisponibles.find(v => v.id === formData.viviendaId);
        const campos = [
            { key: 'nombre', label: 'Nombre', original: clienteAEditar.nombre },
            { key: 'cedula', label: 'Cédula', original: clienteAEditar.cedula },
            { key: 'telefono', label: 'Teléfono', original: clienteAEditar.telefono },
            { key: 'correo', label: 'Correo', original: clienteAEditar.correo },
            { key: 'direccion', label: 'Dirección', original: clienteAEditar.direccion },
            { key: 'viviendaId', label: 'Vivienda Asignada', original: viviendaOriginal ? `Mz ${viviendaOriginal.manzana} - Casa ${viviendaOriginal.numeroCasa}` : 'No asignada', actual: viviendaNueva ? `Mz ${viviendaNueva.manzana} - Casa ${viviendaNueva.numeroCasa}` : 'No asignada' },
        ];
        const cambios = campos.map(campo => {
            const vOriginal = (campo.original || "").toString().trim();
            const vActual = (campo.actual !== undefined ? campo.actual : (formData[campo.key] || "")).toString().trim();
            if (vOriginal !== vActual) return { campo: campo.label, anterior: vOriginal, actual: vActual };
            return null;
        }).filter(Boolean);
        if (cambios.length > 0) {
            setDetectedChanges(cambios);
            setIsConfirmOpen(true);
        } else {
            toast("No se detectaron cambios.", { icon: 'ℹ️' });
            onClose();
        }
    }, [clienteAEditar, onClose, formData, viviendasDisponibles]);

    useEffect(() => {
        if (clienteAEditar) {
            setFormData({
                nombre: clienteAEditar.nombre || '',
                cedula: clienteAEditar.cedula || '',
                telefono: clienteAEditar.telefono || '',
                correo: clienteAEditar.correo || '',
                direccion: clienteAEditar.direccion || '',
                viviendaId: clienteAEditar.viviendaId || null,
            });
        }
    }, [clienteAEditar, setFormData]);

    const selectOptions = useMemo(() =>
        viviendasDisponibles.map(v => ({
            value: v.id,
            label: `Manzana ${v.manzana} - Casa ${v.numeroCasa}`,
        })),
        [viviendasDisponibles]);

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
                <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-2xl mx-4">
                    <h2 className="text-3xl font-bold text-[#1976d2] text-center mb-8">✏️ Editar Cliente</h2>
                    {isLoading ? (
                        <div className="text-center py-10 text-gray-500 animate-pulse">Cargando...</div>
                    ) : (
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6" noValidate>
                            <div>
                                <label className="block font-medium mb-1">Nombre</label>
                                <input name="nombre" value={formData.nombre} onChange={handleInputChange} className={`w-full border p-2.5 rounded-lg ${errors.nombre ? 'border-red-600' : 'border-gray-300'}`} />
                                {errors.nombre && <p className="text-red-600 text-sm mt-1">{errors.nombre}</p>}
                            </div>
                            <div>
                                <label className="block font-medium mb-1">Cédula</label>
                                <input name="cedula" value={formData.cedula} onChange={handleInputChange} className={`w-full border p-2.5 rounded-lg ${errors.cedula ? 'border-red-600' : 'border-gray-300'}`} />
                                {errors.cedula && <p className="text-red-600 text-sm mt-1">{errors.cedula}</p>}
                            </div>
                            <div>
                                <label className="block font-medium mb-1">Teléfono</label>
                                <input name="telefono" value={formData.telefono} onChange={handleInputChange} className={`w-full border p-2.5 rounded-lg ${errors.telefono ? 'border-red-600' : 'border-gray-300'}`} />
                                {errors.telefono && <p className="text-red-600 text-sm mt-1">{errors.telefono}</p>}
                            </div>
                            <div>
                                <label className="block font-medium mb-1">Correo</label>
                                <input name="correo" type="email" value={formData.correo} onChange={handleInputChange} className={`w-full border p-2.5 rounded-lg ${errors.correo ? 'border-red-600' : 'border-gray-300'}`} />
                                {errors.correo && <p className="text-red-600 text-sm mt-1">{errors.correo}</p>}
                            </div>
                            <div className="md:col-span-2">
                                <label className="block font-medium mb-1">Dirección</label>
                                <input name="direccion" value={formData.direccion} onChange={handleInputChange} className={`w-full border p-2.5 rounded-lg ${errors.direccion ? 'border-red-600' : 'border-gray-300'}`} />
                                {errors.direccion && <p className="text-red-600 text-sm mt-1">{errors.direccion}</p>}
                            </div>
                            <div className="md:col-span-2">
                                <label className="block font-medium mb-1">Vivienda Asignada</label>
                                <Select
                                    options={selectOptions}
                                    onChange={(option) => setFormData(prev => ({ ...prev, viviendaId: option ? option.value : null }))}
                                    value={selectOptions.find(op => op.value === formData.viviendaId) || null}
                                    placeholder="Seleccionar vivienda..."
                                    isClearable
                                />
                            </div>
                            <div className="md:col-span-2 flex justify-end mt-8 space-x-4">
                                <button type="button" onClick={onClose} className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-5 py-2.5 rounded-full transition">Cancelar</button>
                                <button type="submit" disabled={isSubmitting || !hayCambios} className={`text-white px-5 py-2.5 rounded-full transition ${isSubmitting || !hayCambios ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#28a745] hover:bg-green-700'}`}>
                                    {isSubmitting ? "Validando..." : "Guardar Cambios"}
                                </button>
                            </div>
                        </form>
                    )}
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
                                        <span className="text-red-600 bg-red-100 px-2 py-1 rounded">{c.anterior || 'No asignada'}</span>
                                        <span className="font-bold text-gray-400 mx-1">→</span>
                                        <span className="text-green-700 bg-green-100 px-2 py-1 rounded">{c.actual || 'No asignada'}</span>
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

export default EditarCliente;