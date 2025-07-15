import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from '../../hooks/useForm.jsx';
import toast from 'react-hot-toast';
import { NumericFormat } from 'react-number-format';
import { addAbono, createNotification } from '../../utils/storage';
import { Banknote, Landmark, Gift, HandCoins, FilePlus2, FileText, XCircle, Loader } from 'lucide-react';
import FileUpload from '../../components/FileUpload';
import { validateAbono } from './abonoValidation.js';
import { formatCurrency } from '../../utils/textFormatters.js';

const getTodayString = () => new Date().toISOString().split('T')[0];

const ICONS = {
    cuotaInicial: <HandCoins className="w-8 h-8 text-yellow-600" />,
    credito: <Landmark className="w-8 h-8 text-blue-600" />,
    subsidioVivienda: <Gift className="w-8 h-8 text-green-600" />,
    subsidioCaja: <Banknote className="w-8 h-8 text-purple-600" />,
    gastosNotariales: <FilePlus2 className="w-8 h-8 text-slate-600" />
};

const FuenteDePagoCard = ({ titulo, fuente, montoPactado, abonos, vivienda, cliente, onAbonoRegistrado }) => {
    const [mostrandoFormulario, setMostrandoFormulario] = useState(false);

    const totalAbonado = abonos.reduce((sum, abono) => sum + abono.monto, 0);
    const saldoPendiente = montoPactado - totalAbonado;
    const porcentajePagado = montoPactado > 0 ? (totalAbonado / montoPactado) * 100 : 100;

    const initialAbonoFormState = useMemo(() => ({
        monto: '',
        fechaPago: getTodayString(),
        observacion: '',
        urlComprobante: null,
        metodoPago: titulo
    }), [titulo]);

    const { formData, errors, setFormData, handleInputChange, handleValueChange, handleSubmit, isSubmitting, resetForm } = useForm({
        initialState: initialAbonoFormState,
        validate: (data) => validateAbono(data, { saldoPendiente }, cliente?.datosCliente?.fechaIngreso),
        onSubmit: async (data) => {
            const nuevoAbono = {
                fechaPago: data.fechaPago,
                monto: parseInt(String(data.monto).replace(/\D/g, ''), 10) || 0,
                metodoPago: data.metodoPago,
                fuente: fuente,
                observacion: data.observacion.trim(),
                urlComprobante: data.urlComprobante,
                viviendaId: vivienda.id,
                clienteId: vivienda.clienteId,
            };

            try {
                await addAbono(nuevoAbono);
                toast.success("Abono registrado con éxito.");

                const message = `Nuevo abono de ${formatCurrency(nuevoAbono.monto)} para la vivienda Mz ${vivienda.manzana} - Casa ${vivienda.numeroCasa}`;
                await createNotification('abono', message, `/viviendas/detalle/${nuevoAbono.viviendaId}`);

                resetForm();
                setMostrandoFormulario(false);
                onAbonoRegistrado();
            } catch (error) {
                toast.error("No se pudo registrar el abono.");
            }
        }
    });

    useEffect(() => {
        if (mostrandoFormulario) {
            setFormData(initialAbonoFormState);
        }
    }, [mostrandoFormulario, initialAbonoFormState, setFormData]);

    const handleCancelarFormulario = () => {
        resetForm();
        setMostrandoFormulario(false);
    }

    const minDate = cliente?.datosCliente?.fechaIngreso ? cliente.datosCliente.fechaIngreso.split('T')[0] : null;

    return (
        <div className="bg-white p-5 rounded-xl border border-gray-200">
            <div className="flex items-center gap-4">
                {ICONS[fuente] || <HandCoins className="w-8 h-8 text-gray-500" />}
                <div>
                    <h3 className="font-bold text-lg text-gray-800">{titulo}</h3>
                    <p className="text-sm text-gray-500">Pactado: {formatCurrency(montoPactado)}</p>
                </div>
            </div>

            <div className="mt-4 space-y-2">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${porcentajePagado}%` }}></div>
                </div>
                <div className="flex justify-between text-xs font-medium text-gray-600">
                    <span>Abonado: {formatCurrency(totalAbonado)}</span>
                    <span>Pendiente: <span className='font-bold text-red-600'>{formatCurrency(saldoPendiente)}</span></span>
                </div>
            </div>

            {mostrandoFormulario && (
                <form onSubmit={handleSubmit} noValidate className="mt-4 pt-4 border-t space-y-4 animate-fade-in">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-medium">Monto a abonar</label>
                            <NumericFormat
                                value={formData.monto}
                                onValueChange={(v) => handleValueChange('monto', v.value)}
                                className={`w-full border p-2 rounded-lg ${errors.monto ? 'border-red-500' : 'border-gray-300'}`}
                                thousandSeparator="." decimalSeparator="," prefix="$ "
                            />
                            {errors.monto && <p className="text-red-600 text-sm mt-1">{errors.monto}</p>}
                        </div>
                        <div>
                            <label className="text-xs font-medium">Fecha del Pago</label>
                            <input
                                type="date"
                                name="fechaPago"
                                value={formData.fechaPago}
                                onChange={handleInputChange}
                                min={minDate}
                                max={getTodayString()}
                                className={`w-full border p-2 rounded-lg ${errors.fechaPago ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {errors.fechaPago && <p className="text-red-600 text-sm mt-1">{errors.fechaPago}</p>}
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-medium">Observación (Opcional)</label>
                        <textarea name="observacion" value={formData.observacion} onChange={handleInputChange} rows="2" className="w-full border p-2 rounded-lg text-sm" placeholder="Ej: Pago parcial..." />
                    </div>
                    <div>
                        <label className="block font-medium mb-2 text-xs">Comprobante de Pago (Opcional)</label>
                        {formData.urlComprobante ? (
                            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3 flex items-center justify-between">
                                <div className='flex items-center gap-2 text-green-800 font-semibold text-sm'>
                                    <FileText size={16} />
                                    <a href={formData.urlComprobante} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                        Ver Comprobante
                                    </a>
                                </div>
                                <button type="button" onClick={() => handleValueChange('urlComprobante', null)} className="p-1 text-red-500 rounded-full hover:bg-red-100" title="Eliminar comprobante">
                                    <XCircle size={18} />
                                </button>
                            </div>
                        ) : (
                            <FileUpload
                                label="Subir Comprobante"
                                filePath={(fileName) => `comprobantes_abonos/${vivienda.id}/${fuente}-${Date.now()}-${fileName}`}
                                onUploadSuccess={(url) => handleValueChange('urlComprobante', url)}
                            />
                        )}
                    </div>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={handleCancelarFormulario} className="bg-gray-200 px-4 py-1.5 rounded-md text-sm">Cancelar</button>
                        <button type="submit" disabled={isSubmitting} className="bg-blue-500 text-white px-4 py-1.5 rounded-md text-sm disabled:bg-gray-400 flex items-center justify-center gap-2">
                            {isSubmitting && <Loader size={16} className="animate-spin" />}
                            {isSubmitting ? 'Guardando...' : 'Guardar Abono'}
                        </button>
                    </div>
                </form>
            )}

            {saldoPendiente > 0 && !mostrandoFormulario && (
                <div className="mt-4 pt-4 border-t text-center">
                    <button onClick={() => setMostrandoFormulario(true)} className="text-blue-600 font-semibold text-sm hover:underline">
                        + Registrar Abono a esta Fuente
                    </button>
                </div>
            )}
            {saldoPendiente <= 0 && (
                <div className="mt-4 pt-4 border-t text-center">
                    <p className="text-green-600 font-bold text-sm">✅ Esta fuente de pago ha sido completada.</p>
                </div>
            )}
        </div>
    );
};

export default FuenteDePagoCard;