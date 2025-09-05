import React, { useEffect, useMemo, useState } from 'react';
import { NumericFormat } from 'react-number-format';
import { useForm } from '../../hooks/useForm.jsx';
import { validateAbono } from '../../utils/validation.js';
import { updateAbono } from "../../services/abonoService";
import toast from 'react-hot-toast';
import Modal from '../../components/Modal.jsx';
import { Pencil, User, Home, Building2, ArrowRight, FileText, XCircle, Loader } from 'lucide-react';
import FileUpload from '../../components/FileUpload.jsx';
import { useData } from '../../context/DataContext.jsx';
import { formatCurrency } from '../../utils/textFormatters.js';

const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const EditarAbonoModal = ({ isOpen, onClose, onSave, abonoAEditar }) => {
    // 1. MANTENEMOS TODA TU LÓGICA DE DATOS Y FORMULARIO
    const { viviendas, clientes, proyectos } = useData(); // Obtenemos proyectos

    const abonoEnriquecido = useMemo(() => {
        if (!abonoAEditar) return null;
        const vivienda = viviendas.find(v => v.id === abonoAEditar.viviendaId);
        const cliente = clientes.find(c => c.id === abonoAEditar.clienteId);
        const proyecto = vivienda ? proyectos.find(p => p.id === vivienda.proyectoId) : null; // Buscamos el proyecto
        return {
            ...abonoAEditar,
            vivienda,
            cliente,
            proyecto // Añadimos el proyecto
        };
    }, [abonoAEditar, viviendas, clientes, proyectos]);

    const initialState = useMemo(() => ({
        monto: abonoAEditar?.monto?.toString() || '',
        metodoPago: abonoAEditar?.metodoPago || '',
        fechaPago: abonoAEditar?.fechaPago || getTodayString(),
        observacion: abonoAEditar?.observacion || '',
        urlComprobante: abonoAEditar?.urlComprobante || null
    }), [abonoAEditar]);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const { formData, setFormData, handleSubmit, handleInputChange, handleValueChange, errors } = useForm({
        initialState,
        validate: (data) => validateAbono(data, null, abonoEnriquecido?.cliente?.datosCliente?.fechaIngreso, abonoEnriquecido),
        onSubmit: async (data) => {
            setIsSubmitting(true);
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
                toast.error(error.message || 'Error al actualizar el abono.');
                console.error("Error al actualizar abono:", error);
            } finally {
                setIsSubmitting(false);
            }
        },
        options: { resetOnSuccess: false }
    });

    useEffect(() => {
        if (isOpen) {
            setFormData(initialState);
        }
    }, [isOpen, initialState, setFormData]);

    const hayCambios = useMemo(() => {
        if (!formData) return false;
        return JSON.stringify(formData) !== JSON.stringify(initialState);
    }, [formData, initialState]);

    const isBotonGuardarDeshabilitado = !hayCambios || Object.keys(errors).length > 0 || isSubmitting;

    if (!isOpen || !abonoEnriquecido) return null;

    // --- 2. RENDERIZAMOS LA NUEVA ESTRUCTURA VISUAL ---
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Editar Abono" icon={<Pencil className="text-blue-500" />}>
            <form onSubmit={handleSubmit} noValidate>

                {/* --- SECCIÓN 1: CONTEXTO --- */}
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border dark:border-gray-600 space-y-3 mb-4">
                    <InfoRow icon={<User className="text-purple-500" />} label="Cliente" value={`${abonoEnriquecido.cliente?.datosCliente.nombres} ${abonoEnriquecido.cliente?.datosCliente.apellidos}`} />
                    <InfoRow icon={<Home className="text-teal-500" />} label="Vivienda" value={`Mz ${abonoEnriquecido.vivienda?.manzana} - Casa ${abonoEnriquecido.vivienda?.numeroCasa}`} />
                    <InfoRow icon={<Building2 className="text-orange-500" />} label="Proyecto" value={abonoEnriquecido.proyecto?.nombre || 'No asignado'} />
                </div>

                {/* --- SECCIÓN 2: FORMULARIO DE EDICIÓN --- */}
                <div className="space-y-4">
                    {/* Campo Monto con visualización Antes/Después */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Monto del Abono</label>
                        <div className="flex items-center space-x-2 mt-1">
                            <div className="text-center p-2 bg-gray-100 dark:bg-gray-700 rounded-md w-1/2">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Valor Original</p>
                                <p className="font-semibold text-gray-600 dark:text-gray-300 line-through">
                                    {formatCurrency(abonoAEditar?.monto)}
                                </p>
                            </div>
                            <ArrowRight className="text-gray-400 flex-shrink-0" />
                            <NumericFormat
                                id="monto-edit"
                                name="monto"
                                value={formData.monto || ''}
                                onValueChange={(values) => handleValueChange('monto', values.value)}
                                className={`block w-1/2 shadow-sm sm:text-lg font-bold border rounded-md dark:bg-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 text-center ${errors.monto ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                                thousandSeparator="." decimalSeparator="," prefix="$ " allowNegative={false} decimalScale={0}
                            />
                        </div>
                        {errors.monto && <p className="text-red-500 text-xs mt-1">{errors.monto}</p>}
                    </div>

                    {/* Otros campos del formulario */}
                    <div>
                        <label htmlFor="fechaPago-edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha del Pago</label>
                        <input
                            type="date"
                            id="fechaPago-edit"
                            name="fechaPago"
                            value={formData.fechaPago || ''}
                            onChange={handleInputChange}
                            max={getTodayString()}
                            min={abonoEnriquecido?.cliente?.datosCliente?.fechaIngreso?.split('T')[0]}
                            className={`mt-1 block w-full shadow-sm sm:text-sm border rounded-md dark:bg-gray-700 dark:text-white ${errors.fechaPago ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                        />
                        {errors.fechaPago && <p className="text-red-600 text-sm mt-1">{errors.fechaPago}</p>}
                    </div>

                    <div>
                        <label htmlFor="observacion-edit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Observación (Opcional)</label>
                        <textarea
                            id="observacion-edit"
                            name="observacion"
                            value={formData.observacion || ''}
                            onChange={handleInputChange}
                            rows="3"
                            className="mt-1 block w-full shadow-sm sm:text-sm border rounded-md dark:bg-gray-700 dark:text-white px-3 py-2 border-gray-300 dark:border-gray-600"
                            placeholder="Añade una nota o referencia..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Comprobante de Pago</label>
                        {formData.urlComprobante ? (
                            <div className="bg-green-50 dark:bg-green-900/50 border-2 border-green-200 dark:border-green-700 rounded-lg p-4 flex items-center justify-between">
                                <div className='flex items-center gap-2 text-green-800 dark:text-green-300 font-semibold'>
                                    <FileText />
                                    <a href={formData.urlComprobante} target="_blank" rel="noopener noreferrer" className="hover:underline">Ver Comprobante Actual</a>
                                </div>
                                <button type="button" onClick={() => handleValueChange('urlComprobante', null)} className="p-1 text-red-500 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50" title="Eliminar comprobante">
                                    <XCircle size={20} />
                                </button>
                            </div>
                        ) : (
                            <FileUpload
                                label="Subir Nuevo Comprobante"
                                filePath={(fileName) => `comprobantes_abonos/${abonoAEditar.viviendaId}/${abonoAEditar.fuente}-${Date.now()}-${fileName}`}
                                onUploadSuccess={(url) => handleValueChange('urlComprobante', url)}
                            />
                        )}
                    </div>
                </div>

                {/* --- SECCIÓN 3: BOTONES --- */}
                <div className="mt-6 pt-4 border-t dark:border-gray-600 sm:flex sm:flex-row-reverse items-center">
                    <div className="relative">
                        <button
                            type="submit"
                            disabled={isBotonGuardarDeshabilitado}
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? <Loader size={20} className="animate-spin mr-2" /> : <Pencil size={20} className="mr-2" />}
                            {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                        {isBotonGuardarDeshabilitado && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max bg-gray-700 text-white text-xs rounded py-1 px-2 pointer-events-none opacity-90">
                                {!hayCambios ? "No has realizado cambios" : "Hay errores en el formulario"}
                            </div>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </Modal>
    );
};

const InfoRow = ({ icon, label, value }) => (
    <div className="flex items-start">
        <div className="flex-shrink-0 w-6 mt-1">{icon}</div>
        <div className="ml-2">
            <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
            <p className="font-semibold text-gray-800 dark:text-gray-200">{value}</p>
        </div>
    </div>
);

export default EditarAbonoModal;