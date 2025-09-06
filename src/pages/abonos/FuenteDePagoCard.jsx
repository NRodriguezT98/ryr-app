import React, { useState, useEffect } from 'react';
import { NumericFormat } from 'react-number-format';
import { useAbonoForm } from '../../hooks/abonos/useAbonoForm.jsx';
import { Banknote, Landmark, Gift, HandCoins, FilePlus2, FileText, XCircle, Loader, PlusCircle, Lock } from 'lucide-react';
import FileUpload from '../../components/FileUpload';
import { formatCurrency, getTodayString } from '../../utils/textFormatters.js';
import { FUENTE_PROCESO_MAP, PROCESO_CONFIG } from '../../utils/procesoConfig.js'
import HelpTooltip from '../../components/HelpTooltip.jsx';

const ICONS = {
    cuotaInicial: <HandCoins className="w-8 h-8 text-yellow-600" />,
    credito: <Landmark className="w-8 h-8 text-blue-600" />,
    subsidioVivienda: <Gift className="w-8 h-8 text-green-600" />,
    subsidioCaja: <Banknote className="w-8 h-8 text-purple-600" />,
    gastosNotariales: <FilePlus2 className="w-8 h-8 text-slate-600" />,
    condonacion: <HandCoins className="w-8 h-8 text-indigo-600" />
};

const FuenteDePagoCard = ({ titulo, fuente, montoPactado, abonos, resumenPago, vivienda, cliente, proyecto, onAbonoRegistrado, onCondonarSaldo, onRegistrarDesembolso }) => {
    const [mostrandoFormulario, setMostrandoFormulario] = useState(false);

    const totalAbonado = abonos.reduce((sum, abono) => sum + abono.monto, 0);
    const saldoPendiente = montoPactado - totalAbonado;
    const porcentajePagado = montoPactado > 0 ? (totalAbonado / montoPactado) * 100 : 100;
    const isViviendaPagada = vivienda.saldoPendiente <= 0;

    const { formData, errors, handleInputChange, handleValueChange, handleSubmit, isSubmitting, setFormData } = useAbonoForm({
        fuente, titulo, saldoPendiente, montoPactado, vivienda, cliente, proyecto,
        onAbonoRegistrado: (cerrarFormulario) => {
            onAbonoRegistrado();
            if (cerrarFormulario) setMostrandoFormulario(false);
        }
    });

    useEffect(() => {
        if (mostrandoFormulario) {
            setFormData({
                monto: '', fechaPago: getTodayString(), observacion: '', urlComprobante: null, metodoPago: titulo
            });
        }
    }, [mostrandoFormulario, setFormData, titulo]);

    const fechaDeInicioDelProceso = cliente?.fechaInicioProceso || cliente?.datosCliente?.fechaIngreso;
    const minDate = fechaDeInicioDelProceso ? fechaDeInicioDelProceso.split('T')[0] : null;

    const isCredito = fuente === 'credito';
    const creditoYaDesembolsado = isCredito && saldoPendiente <= 0;
    const isSubsidio = fuente.includes('subsidio');
    const subsidioYaDesembolsado = isSubsidio && totalAbonado > 0;

    // --- NUEVO: Lógica para validar el prerrequisito del proceso ---
    const pasoConfig = FUENTE_PROCESO_MAP[fuente];
    let isPrerrequisitoCompleto = true;
    let tooltipMessage = ''; // Usaremos este nombre de variable consistentemente

    if (pasoConfig && cliente?.proceso) {
        const pasoSolicitud = cliente.proceso[pasoConfig.solicitudKey];
        if (!pasoSolicitud?.completado) {
            isPrerrequisitoCompleto = false;
            const configPaso = PROCESO_CONFIG.find(p => p.key === pasoConfig.solicitudKey);
            const nombrePaso = configPaso?.label || `Solicitud de ${titulo}`;
            tooltipMessage = `Primero debe completar el paso "${nombrePaso}" en la pestaña de Proceso.`;
        }
    }

    const botonDesembolsoDeshabilitado = creditoYaDesembolsado || subsidioYaDesembolsado || !isPrerrequisitoCompleto;

    return (
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
                {ICONS[fuente] || <HandCoins className="w-8 h-8 text-gray-500" />}
                <div>
                    <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">{titulo}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Pactado: {formatCurrency(montoPactado)}</p>
                </div>
            </div>
            <div className="mt-4 space-y-2">
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${porcentajePagado}%` }}></div>
                </div>
                <div className="flex justify-between text-xs font-medium text-gray-600 dark:text-gray-400">
                    <span>Abonado: {formatCurrency(totalAbonado)}</span>
                    <span>Pendiente: <span className='font-bold text-red-600 dark:text-red-400'>{formatCurrency(saldoPendiente)}</span></span>
                </div>
            </div>

            {mostrandoFormulario && (
                <form onSubmit={handleSubmit} noValidate className="mt-4 pt-4 border-t dark:border-gray-600 space-y-4 animate-fade-in">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-medium dark:text-gray-300">Monto a abonar</label>
                            <NumericFormat
                                value={formData.monto}
                                onValueChange={(v) => handleValueChange('monto', v.value)}
                                className={`w-full border p-2 rounded-lg ${errors.monto ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white`}
                                thousandSeparator="." decimalSeparator="," prefix="$ "
                            />
                            {errors.monto && <p className="text-red-600 text-sm mt-1">{errors.monto}</p>}
                        </div>
                        <div>
                            <label className="text-xs font-medium dark:text-gray-300">Fecha del Pago</label>
                            <input
                                type="date"
                                name="fechaPago"
                                value={formData.fechaPago}
                                onChange={handleInputChange}
                                min={minDate}
                                max={getTodayString()}
                                className={`w-full border p-2 rounded-lg ${errors.fechaPago ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white`}
                            />
                            {errors.fechaPago && <p className="text-red-600 text-sm mt-1">{errors.fechaPago}</p>}
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-medium dark:text-gray-300">Observación (Opcional)</label>
                        <textarea name="observacion" value={formData.observacion} onChange={handleInputChange} rows="2" className="w-full border p-2 rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600" placeholder="Ej: Pago parcial..." />
                    </div>
                    <div>
                        <label className="block font-medium mb-2 text-xs dark:text-gray-300">
                            Comprobante de Pago <span className="text-red-500">*</span>
                        </label>
                        {formData.urlComprobante ? (
                            <div className="bg-green-50 dark:bg-green-900/50 border-2 border-green-200 dark:border-green-700 rounded-lg p-3 flex items-center justify-between">
                                <div className='flex items-center gap-2 text-green-800 dark:text-green-300 font-semibold text-sm'>
                                    <FileText size={16} />
                                    <a href={formData.urlComprobante} target="_blank" rel="noopener noreferrer" className="hover:underline">Ver Comprobante</a>
                                </div>
                                <button type="button" onClick={() => handleValueChange('urlComprobante', null)} className="p-1 text-red-500 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50" title="Eliminar comprobante"><XCircle size={18} /></button>
                            </div>
                        ) : (
                            <FileUpload
                                label="Subir Comprobante"
                                filePath={(fileName) => `comprobantes_abonos/${vivienda.id}/${fuente}-${Date.now()}-${fileName}`}
                                onUploadSuccess={(url) => handleValueChange('urlComprobante', url)}
                            />
                        )}
                        {errors.urlComprobante && <p className="text-red-600 text-sm mt-1">{errors.urlComprobante}</p>}
                    </div>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setMostrandoFormulario(false)} className="bg-gray-200 dark:bg-gray-600 px-4 py-1.5 rounded-md text-sm">Cancelar</button>
                        <button type="submit" disabled={isSubmitting} className="bg-blue-500 text-white px-4 py-1.5 rounded-md text-sm disabled:bg-gray-400 flex items-center justify-center gap-2">
                            {isSubmitting && <Loader size={16} className="animate-spin" />}
                            {isSubmitting ? 'Guardando...' : 'Guardar Abono'}
                        </button>
                    </div>
                </form>
            )}

            <div className="mt-4 pt-4 border-t dark:border-gray-700 text-center">
                {saldoPendiente <= 0 ? (
                    <p className="text-green-600 dark:text-green-400 font-bold text-sm">✅ Esta fuente de pago ha sido completada.</p>
                ) : !mostrandoFormulario && !isViviendaPagada ? (
                    <div className="flex justify-center items-center gap-4">
                        {isCredito || isSubsidio ? (
                            onRegistrarDesembolso && (
                                <div className="flex items-center gap-1"> {/* Un div para agrupar botón y tooltip */}
                                    <button
                                        onClick={onRegistrarDesembolso}
                                        disabled={botonDesembolsoDeshabilitado}
                                        className="text-blue-600 dark:text-blue-400 font-semibold text-sm hover:underline disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed disabled:opacity-50 flex items-center gap-2"
                                    >
                                        <Banknote size={16} />
                                        {creditoYaDesembolsado || subsidioYaDesembolsado ? 'Desembolso Registrado' : 'Registrar Desembolso'}
                                    </button>

                                    {/* El icono de ayuda solo aparece si el botón está deshabilitado por el prerrequisito */}
                                    {!isPrerrequisitoCompleto && (
                                        <HelpTooltip content={tooltipMessage} id={`tooltip-${fuente}`} />
                                    )}
                                </div>
                            )
                        ) : (
                            onAbonoRegistrado && (
                                <button onClick={() => setMostrandoFormulario(true)} className="text-blue-600 dark:text-blue-400 font-semibold text-sm hover:underline flex items-center gap-2">
                                    <PlusCircle size={16} />
                                    Registrar Abono
                                </button>
                            )
                        )}
                        {fuente === 'cuotaInicial' && !isCredito && (
                            onCondonarSaldo && (
                                <>
                                    <span className="text-gray-300 dark:text-gray-600">|</span>
                                    <button onClick={onCondonarSaldo} className="text-green-600 dark:text-green-400 font-semibold text-sm hover:underline">Condonar Saldo</button>
                                </>
                            )
                        )}
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default FuenteDePagoCard;